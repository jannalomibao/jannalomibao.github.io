import { projects } from "@/data/content";
import ProjectCard from "@/components/ui/ProjectCard";
import Reveal from "@/components/ui/Reveal";

export default function Projects() {
  return (
    <div className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-24">
      <Reveal>
        <p className="text-xs uppercase tracking-[0.2em] text-ink-soft mb-6 flex items-center gap-3">
          <span className="w-8 h-px bg-accent inline-block" />
          Projects
        </p>
        <h1 className="font-display text-5xl md:text-7xl text-ink leading-[1.02] max-w-3xl">
          Things I've designed, built, and shipped.
        </h1>
      </Reveal>

      <div className="grid md:grid-cols-2 gap-x-8 gap-y-16 mt-20">
        {projects.map((project, i) => (
          <Reveal key={project.slug} delay={i * 0.06}>
            <ProjectCard project={project} index={i} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
