import { profile } from "@/data/content";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import ParallaxImage from "@/components/ui/ParallaxImage";

export default function About() {
  return (
    <div className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-24">
      <Reveal>
        <p className="text-xs uppercase tracking-[0.2em] text-ink-soft mb-6 flex items-center gap-3">
          <span className="w-8 h-px bg-accent inline-block" />
          About
        </p>
        <h1 className="font-display text-5xl md:text-7xl text-ink leading-[1.02] max-w-3xl">
          Hi, I'm {profile.name.split(" ")[0]} — a software developer who likes finishing things.
        </h1>
      </Reveal>

      <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-16 mt-20 items-start">
        <Reveal delay={0.05}>
          <div className="space-y-6 text-lg text-ink-soft leading-relaxed max-w-xl">
            {profile.bio.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <ParallaxImage
            src="https://images.unsplash.com/photo-1483058712412-4245e9b90334?q=80&w=1200&auto=format&fit=crop"
            alt="Desk setup"
            className="rounded-2xl aspect-[4/5]"
          />
        </Reveal>
      </div>

      <div className="mt-28">
        <Reveal>
          <SectionHeading eyebrow="Toolkit" title="What I work with." />
        </Reveal>
        <Reveal delay={0.05}>
          <div className="flex flex-wrap gap-3">
            {profile.skills.map((skill) => (
              <span
                key={skill}
                className="px-4 py-2 rounded-full border border-line text-ink text-sm hover:border-accent hover:text-accent transition-colors"
              >
                {skill}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </div>
  );
}
