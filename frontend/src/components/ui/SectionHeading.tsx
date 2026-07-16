export default function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="mb-12">
      <p className="text-xs uppercase tracking-[0.2em] text-ink-soft mb-3 flex items-center gap-3">
        <span className="w-8 h-px bg-accent inline-block" />
        {eyebrow}
      </p>
      <h2 className="font-display text-4xl md:text-5xl text-ink">{title}</h2>
    </div>
  );
}
