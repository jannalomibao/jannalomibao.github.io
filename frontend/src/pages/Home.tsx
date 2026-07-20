import { Link } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import { ArrowUpRight, ArrowDown } from "lucide-react";
import { profile } from "@/data/content";
import { useApi } from "@/hooks/useApi";
import { listProjects } from "@/api/projects";
import ProjectCard from "@/components/ui/ProjectCard";
import ProjectCardSkeleton from "@/components/ui/ProjectCardSkeleton";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import ParallaxImage from "@/components/ui/ParallaxImage";
import { ErrorMessage, EmptyMessage } from "@/components/ui/AsyncState";

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.05 },
  },
};

const word: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

function AnimatedHeadline({ text }: { text: string }) {
  return (
    <motion.h1
      variants={container}
      initial="hidden"
      animate="show"
      className="font-display text-[13vw] md:text-[6.5rem] leading-[0.95] tracking-tight text-ink"
    >
      {text.split(" ").map((w, i) => (
        <span key={i} className="inline-block overflow-hidden mr-4 md:mr-5">
          <motion.span variants={word} className="inline-block">
            {w}
          </motion.span>
        </span>
      ))}
    </motion.h1>
  );
}

export default function Home() {
  const { data: projects, loading, error } = useApi(listProjects, []);
  const featured = (projects ?? []).filter((p) => p.featured);

  return (
    <>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 pt-16 md:pt-24 pb-24 md:pb-36">
        <p className="text-xs uppercase tracking-[0.2em] text-ink-soft mb-6 flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-accent inline-block" />
          {profile.role} — {profile.location}
        </p>

        <AnimatedHeadline text="I build software that earns its keep." />

        <div className="mt-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <p className="max-w-md text-ink-soft text-lg leading-relaxed">
            {profile.tagline} Currently focused on React, NestJS, and Postgres-backed
            products — from schema to shipped interface.
          </p>

          <div className="flex items-center gap-4">
            <Link
              to="/projects"
              data-cursor-hover
              className="inline-flex items-center gap-2 bg-ink text-paper px-6 py-3.5 rounded-full text-sm tracking-wide hover:bg-accent transition-colors"
            >
              View projects <ArrowUpRight size={16} />
            </Link>
            <Link
              to="/contact"
              data-cursor-hover
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm tracking-wide border border-line text-ink hover:border-ink transition-colors"
            >
              Get in touch
            </Link>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-24 flex items-center gap-3 text-xs uppercase tracking-widest text-ink-soft"
        >
          <ArrowDown size={14} className="animate-bounce" />
          Scroll
        </motion.div>
      </section>

      {/* Featured work */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 py-24 md:py-32">
        <Reveal>
          <SectionHeading eyebrow="Selected work" title="A few things I've shipped." />
        </Reveal>

        {loading && (
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-16">
            {Array.from({ length: 2 }).map((_, i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        )}

        {error && <ErrorMessage message="Couldn't load featured work right now." />}

        {!loading && !error && featured.length === 0 && (
          <EmptyMessage message="No featured projects yet. Check back soon." />
        )}

        {!loading && !error && featured.length > 0 && (
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-16">
            {featured.map((project, i) => (
              <Reveal key={project.slug} delay={i * 0.08}>
                <ProjectCard project={project} index={i} />
              </Reveal>
            ))}
          </div>
        )}

        <Reveal className="mt-16">
          <Link
            to="/projects"
            data-cursor-hover
            className="inline-flex items-center gap-2 text-ink font-display text-2xl border-b border-ink pb-1 hover:text-accent hover:border-accent transition-colors"
          >
            See all projects <ArrowUpRight size={20} />
          </Link>
        </Reveal>
      </section>

      {/* Skills strip */}
      <section className="border-y border-line py-10 overflow-hidden">
        <div className="flex gap-10 whitespace-nowrap animate-[marquee_28s_linear_infinite]">
          {[...profile.skills, ...profile.skills].map((skill, i) => (
            <span
              key={i}
              className="font-display text-3xl md:text-4xl text-ink-soft/40 shrink-0"
            >
              {skill}
            </span>
          ))}
        </div>
      </section>

      {/* About teaser */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 py-24 md:py-32 grid md:grid-cols-2 gap-12 items-center">
        <Reveal>
          <SectionHeading eyebrow="About" title="Curious, deliberate, and a little obsessive about clean systems." />
          <p className="text-ink-soft text-lg leading-relaxed max-w-md">
            {profile.bio[0]}
          </p>
          <Link
            to="/about"
            data-cursor-hover
            className="inline-flex items-center gap-2 mt-8 text-sm text-ink border-b border-ink pb-1 hover:text-accent hover:border-accent transition-colors"
          >
            More about me <ArrowUpRight size={16} />
          </Link>
        </Reveal>
        <Reveal delay={0.1}>
          <ParallaxImage
            src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop"
            alt="Workspace"
            className="rounded-2xl aspect-[4/5]"
          />
        </Reveal>
      </section>
    </>
  );
}
