create table if not exists public.ctracker_titles (
  id text primary key,
  owner_key text not null,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create index if not exists ctracker_titles_owner_key_idx
  on public.ctracker_titles (owner_key);

alter table public.ctracker_titles enable row level security;

create policy "Allow anon read ctracker titles"
  on public.ctracker_titles
  for select
  to anon
  using (true);

create policy "Allow anon insert ctracker titles"
  on public.ctracker_titles
  for insert
  to anon
  with check (true);

create policy "Allow anon update ctracker titles"
  on public.ctracker_titles
  for update
  to anon
  using (true)
  with check (true);

create policy "Allow anon delete ctracker titles"
  on public.ctracker_titles
  for delete
  to anon
  using (true);
