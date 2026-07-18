import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/data/content";
import ParallaxImage from "@/components/ui/ParallaxImage";

export default function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <Link
      to={`/projects/${project.slug}`}
      className="group block"
      data-cursor-hover
    >
      <ParallaxImage
        src={project.image}
        alt={project.title}
        className="rounded-2xl aspect-[4/3] bg-ink/5"
        imgClassName="transition-transform duration-700 ease-out group-hover:scale-105"
      >
        <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/10 transition-colors duration-500" />
        <span className="absolute top-4 left-4 text-xs tracking-widest uppercase bg-paper/90 px-3 py-1 rounded-full text-ink">
          {String(index + 1).padStart(2, "0")}
        </span>
      </ParallaxImage>

      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-2xl text-ink">{project.title}</h3>
          <p className="text-sm text-ink-soft mt-1 max-w-sm">{project.summary}</p>
        </div>
        <ArrowUpRight
          size={22}
          className="shrink-0 mt-1 text-ink-soft transition-all duration-300 group-hover:text-accent group-hover:translate-x-1 group-hover:-translate-y-1"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {project.stack.map((tech) => (
          <span
            key={tech}
            className="text-xs px-2.5 py-1 rounded-full border border-line text-ink-soft"
          >
            {tech}
          </span>
        ))}
      </div>
    </Link>
  );
}
