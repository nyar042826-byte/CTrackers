create extension if not exists pgcrypto;

create table if not exists public.ctracker_users (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  username_normalized text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.ctracker_libraries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.ctracker_users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.ctracker_sessions (
  token uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.ctracker_users(id) on delete cascade,
  expires_at timestamptz not null default now() + interval '7 days',
  created_at timestamptz not null default now()
);

create table if not exists public.ctracker_library_titles (
  library_id uuid not null references public.ctracker_libraries(id) on delete cascade,
  id text not null,
  payload jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (library_id, id)
);

create index if not exists ctracker_sessions_user_id_idx
  on public.ctracker_sessions (user_id);

create index if not exists ctracker_library_titles_updated_at_idx
  on public.ctracker_library_titles (library_id, updated_at desc);

alter table public.ctracker_users enable row level security;
alter table public.ctracker_libraries enable row level security;
alter table public.ctracker_sessions enable row level security;
alter table public.ctracker_library_titles enable row level security;

create or replace function public.ctracker_session_user_id(p_session_token uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  select user_id
    into v_user_id
    from public.ctracker_sessions
   where token = p_session_token
     and expires_at > now();

  if v_user_id is null then
    raise exception 'invalid_session';
  end if;

  return v_user_id;
end;
$$;

create or replace function public.ctracker_register(p_username text, p_password text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_username text := trim(coalesce(p_username, ''));
  v_username_normalized text := lower(trim(coalesce(p_username, '')));
  v_user_id uuid;
  v_library_id uuid;
  v_token uuid;
begin
  if v_username = '' or coalesce(p_password, '') = '' then
    raise exception 'missing_fields';
  end if;

  if length(p_password) < 6 then
    raise exception 'password_too_short';
  end if;

  if exists (select 1 from public.ctracker_users where username_normalized = v_username_normalized) then
    raise exception 'username_taken';
  end if;

  insert into public.ctracker_users (username, username_normalized, password_hash)
  values (v_username, v_username_normalized, crypt(p_password, gen_salt('bf')))
  returning id into v_user_id;

  insert into public.ctracker_libraries (user_id)
  values (v_user_id)
  returning id into v_library_id;

  insert into public.ctracker_sessions (user_id)
  values (v_user_id)
  returning token into v_token;

  return jsonb_build_object(
    'token', v_token,
    'libraryId', v_library_id,
    'user', jsonb_build_object('id', v_user_id, 'username', v_username)
  );
end;
$$;

create or replace function public.ctracker_login(p_username text, p_password text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_username_normalized text := lower(trim(coalesce(p_username, '')));
  v_user record;
  v_library_id uuid;
  v_token uuid;
begin
  if v_username_normalized = '' or coalesce(p_password, '') = '' then
    raise exception 'missing_fields';
  end if;

  select *
    into v_user
    from public.ctracker_users
   where username_normalized = v_username_normalized;

  if v_user.id is null or v_user.password_hash <> crypt(p_password, v_user.password_hash) then
    raise exception 'invalid_credentials';
  end if;

  select id
    into v_library_id
    from public.ctracker_libraries
   where user_id = v_user.id;

  if v_library_id is null then
    insert into public.ctracker_libraries (user_id)
    values (v_user.id)
    returning id into v_library_id;
  end if;

  insert into public.ctracker_sessions (user_id)
  values (v_user.id)
  returning token into v_token;

  return jsonb_build_object(
    'token', v_token,
    'libraryId', v_library_id,
    'user', jsonb_build_object('id', v_user.id, 'username', v_user.username)
  );
end;
$$;

create or replace function public.ctracker_logout(p_session_token uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.ctracker_sessions
   where token = p_session_token;
end;
$$;

create or replace function public.ctracker_get_titles(p_session_token uuid)
returns setof jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_library_id uuid;
begin
  v_user_id := public.ctracker_session_user_id(p_session_token);

  select id
    into v_library_id
    from public.ctracker_libraries
   where user_id = v_user_id;

  return query
  select payload
    from public.ctracker_library_titles
   where library_id = v_library_id
   order by updated_at desc;
end;
$$;

create or replace function public.ctracker_upsert_title(p_session_token uuid, p_payload jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_library_id uuid;
  v_title_id text := p_payload->>'id';
begin
  if v_title_id is null or v_title_id = '' then
    raise exception 'missing_title_id';
  end if;

  v_user_id := public.ctracker_session_user_id(p_session_token);

  select id
    into v_library_id
    from public.ctracker_libraries
   where user_id = v_user_id;

  insert into public.ctracker_library_titles (library_id, id, payload, updated_at)
  values (v_library_id, v_title_id, p_payload, coalesce((p_payload->>'updatedAt')::timestamptz, now()))
  on conflict (library_id, id)
  do update set
    payload = excluded.payload,
    updated_at = excluded.updated_at;
end;
$$;

create or replace function public.ctracker_delete_titles(p_session_token uuid, p_ids text[])
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_library_id uuid;
begin
  v_user_id := public.ctracker_session_user_id(p_session_token);

  select id
    into v_library_id
    from public.ctracker_libraries
   where user_id = v_user_id;

  delete from public.ctracker_library_titles
   where library_id = v_library_id
     and id = any(p_ids);
end;
$$;

create or replace function public.ctracker_sync_titles(p_session_token uuid, p_payloads jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_library_id uuid;
begin
  v_user_id := public.ctracker_session_user_id(p_session_token);

  select id
    into v_library_id
    from public.ctracker_libraries
   where user_id = v_user_id;

  delete from public.ctracker_library_titles
   where library_id = v_library_id
     and id not in (
       select item->>'id'
         from jsonb_array_elements(coalesce(p_payloads, '[]'::jsonb)) as item
     );

  insert into public.ctracker_library_titles (library_id, id, payload, updated_at)
  select
    v_library_id,
    item->>'id',
    item,
    coalesce((item->>'updatedAt')::timestamptz, now())
    from jsonb_array_elements(coalesce(p_payloads, '[]'::jsonb)) as item
   where item->>'id' is not null
  on conflict (library_id, id)
  do update set
    payload = excluded.payload,
    updated_at = excluded.updated_at;
end;
$$;

grant execute on function public.ctracker_register(text, text) to anon;
grant execute on function public.ctracker_login(text, text) to anon;
grant execute on function public.ctracker_logout(uuid) to anon;
grant execute on function public.ctracker_get_titles(uuid) to anon;
grant execute on function public.ctracker_upsert_title(uuid, jsonb) to anon;
grant execute on function public.ctracker_delete_titles(uuid, text[]) to anon;
grant execute on function public.ctracker_sync_titles(uuid, jsonb) to anon;
