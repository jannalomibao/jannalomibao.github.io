// Shared "fetch failed" / "fetch succeeded but empty" presentational states
// for every public page reading from frontend/src/api/ — kept intentionally
// plain (no illustration/motion) per docs/tasks/007-public-pages-real-data.md.

export function ErrorMessage({
  message,
  className = "",
}: {
  message: string;
  className?: string;
}) {
  return (
    <p role="alert" className={`text-ink-soft text-sm ${className}`}>
      {message}
    </p>
  );
}

export function EmptyMessage({
  message,
  className = "",
}: {
  message: string;
  className?: string;
}) {
  return <p className={`text-ink-soft text-sm ${className}`}>{message}</p>;
}
