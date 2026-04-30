export function ProgressBar({ value }) {
  return (
    <div
      className="progress-bar"
      aria-label={`${value}% complete`}
      role="progressbar"
      aria-valuemin="0"
      aria-valuemax="100"
      aria-valuenow={value}
    >
      <span style={{ width: `${value}%` }} />
    </div>
  );
}
