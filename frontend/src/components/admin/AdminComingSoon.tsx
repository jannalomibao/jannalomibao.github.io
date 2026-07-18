// Placeholder for the /admin/projects, /admin/blog, /admin/resume, and
// /admin/messages destinations — stories 003-006 build these out. The nav in
// AdminLayout links here rather than 404ing (story 002's UAC explicitly
// allows the destinations to not exist yet, but a clear "not built yet"
// beats a raw NotFound page).
export default function AdminComingSoon({
  section,
  story,
}: {
  section: string;
  story: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-ink-soft mb-3">{section}</p>
      <h1 className="font-display text-3xl text-ink mb-4">Coming soon.</h1>
      <p className="text-ink-soft max-w-md">
        {section} management is built in story {story} — not part of this admin shell yet.
      </p>
    </div>
  );
}
