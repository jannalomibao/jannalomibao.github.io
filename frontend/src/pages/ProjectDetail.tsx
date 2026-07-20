import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { GithubIcon } from "@/components/ui/BrandIcons";
import { useApi } from "@/hooks/useApi";
import { getProject } from "@/api/projects";
import { ApiError } from "@/api/client";
import Reveal from "@/components/ui/Reveal";
import ParallaxImage from "@/components/ui/ParallaxImage";
import Skeleton from "@/components/ui/Skeleton";
import { ErrorMessage } from "@/components/ui/AsyncState";

export default function ProjectDetail() {
  const { slug } = useParams();
  const { data: project, loading, error } = useApi(() => getProject(slug!), [slug]);

  const notFound = error instanceof ApiError && error.status === 404;

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-24">
      <Reveal>
        <Link
          to="/projects"
          data-cursor-hover
          className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink transition-colors mb-10"
        >
          <ArrowLeft size={16} /> Back to projects
        </Link>
      </Reveal>

      {loading && (
        <div className="mt-4 space-y-6">
          <Skeleton className="h-14 w-2/3" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="aspect-video rounded-2xl mt-10" />
        </div>
      )}

      {notFound && (
        <ErrorMessage message="This project doesn't exist, or isn't published anymore." />
      )}

      {error && !notFound && (
        <ErrorMessage message="Couldn't load this project right now." />
      )}

      {!loading && !error && project && (
        <>
          <Reveal>
            <h1 className="font-display text-5xl md:text-7xl text-ink leading-[1.02] max-w-3xl">
              {project.title}
            </h1>
            <p className="text-lg text-ink-soft mt-4 max-w-xl">{project.summary}</p>

            <div className="flex flex-wrap items-center gap-3 mt-6">
              {project.stack.map((tech) => (
                <span
                  key={tech}
                  className="text-xs px-3 py-1.5 rounded-full border border-line text-ink-soft"
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-4 mt-8">
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor-hover
                  className="inline-flex items-center gap-2 bg-ink text-paper px-5 py-3 rounded-full text-sm hover:bg-accent transition-colors"
                >
                  <GithubIcon size={16} /> View code
                </a>
              )}
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor-hover
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm border border-line hover:border-ink transition-colors"
                >
                  Live demo <ArrowUpRight size={16} />
                </a>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.1} className="mt-16">
            <ParallaxImage
              src={project.imageUrl}
              alt={project.title}
              className="rounded-2xl aspect-video"
            />
          </Reveal>

          <div className="grid md:grid-cols-3 gap-10 mt-20">
            {[
              { label: "The problem", value: project.problem },
              { label: "My role", value: project.role },
              { label: "The outcome", value: project.outcome },
            ].map((block, i) => (
              <Reveal key={block.label} delay={i * 0.08}>
                <h3 className="text-xs uppercase tracking-[0.2em] text-accent mb-3">
                  {block.label}
                </h3>
                <p className="text-ink-soft leading-relaxed">{block.value}</p>
              </Reveal>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
