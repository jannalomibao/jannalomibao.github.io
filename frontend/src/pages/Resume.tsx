import { Download } from "lucide-react";
import { profile } from "@/data/content";
import { useApi } from "@/hooks/useApi";
import { getResume } from "@/api/resume";
import Reveal from "@/components/ui/Reveal";
import Skeleton from "@/components/ui/Skeleton";
import { ErrorMessage } from "@/components/ui/AsyncState";

export default function Resume() {
  const { data: resume, loading, error } = useApi(getResume, []);

  return (
    <div className="max-w-4xl mx-auto px-6 md:px-10 py-16 md:py-24">
      <Reveal>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-ink-soft mb-6 flex items-center gap-3">
              <span className="w-8 h-px bg-accent inline-block" />
              Resume
            </p>
            <h1 className="font-display text-5xl md:text-6xl text-ink leading-[1.02]">
              {profile.name}
            </h1>
            <p className="text-ink-soft mt-2">
              {profile.role} · {profile.location}
            </p>
          </div>
          {resume?.pdfUrl ? (
            <a
              href={resume.pdfUrl}
              data-cursor-hover
              className="inline-flex items-center gap-2 bg-ink text-paper px-6 py-3.5 rounded-full text-sm whitespace-nowrap hover:bg-accent transition-colors"
            >
              <Download size={16} /> Download PDF
            </a>
          ) : (
            !loading && (
              <span
                title="No resume PDF has been uploaded yet"
                className="inline-flex items-center gap-2 border border-line text-ink-soft px-6 py-3.5 rounded-full text-sm whitespace-nowrap opacity-60"
              >
                <Download size={16} /> PDF not available yet
              </span>
            )
          )}
        </div>

        {loading && <Skeleton className="h-20 w-full max-w-2xl mt-10" />}
        {error && <ErrorMessage className="mt-10" message="Couldn't load the resume right now." />}
        {resume && (
          <p className="text-lg text-ink-soft leading-relaxed mt-10 max-w-2xl">
            {resume.summary}
          </p>
        )}
      </Reveal>

      {resume && (
        <>
          <div className="mt-20">
            <Reveal>
              <h2 className="text-xs uppercase tracking-[0.2em] text-accent mb-8">Experience</h2>
            </Reveal>
            <div className="space-y-12 border-l border-line pl-8">
              {resume.experience.map((job, i) => (
                <Reveal key={job.role + job.org} delay={i * 0.06} className="relative">
                  <span className="absolute -left-[calc(2rem+5px)] top-1.5 w-2.5 h-2.5 rounded-full bg-accent" />
                  <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-1">
                    <h3 className="font-display text-2xl text-ink">
                      {job.role} <span className="text-ink-soft">— {job.org}</span>
                    </h3>
                    <span className="text-sm text-ink-soft shrink-0">{job.period}</span>
                  </div>
                  <ul className="mt-3 space-y-2 text-ink-soft leading-relaxed list-disc list-inside">
                    {job.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="mt-20">
            <Reveal>
              <h2 className="text-xs uppercase tracking-[0.2em] text-accent mb-8">Education</h2>
            </Reveal>
            <div className="space-y-6 border-l border-line pl-8">
              {resume.education.map((edu, i) => (
                <Reveal key={edu.school} delay={i * 0.06} className="relative">
                  <span className="absolute -left-[calc(2rem+5px)] top-1.5 w-2.5 h-2.5 rounded-full bg-accent" />
                  <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-1">
                    <h3 className="font-display text-2xl text-ink">{edu.credential}</h3>
                    <span className="text-sm text-ink-soft shrink-0">{edu.period}</span>
                  </div>
                  <p className="text-ink-soft mt-1">{edu.school}</p>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="mt-20">
            <Reveal>
              <h2 className="text-xs uppercase tracking-[0.2em] text-accent mb-8">Skills</h2>
              <div className="flex flex-wrap gap-3">
                {resume.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-4 py-2 rounded-full border border-line text-ink text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </>
      )}
    </div>
  );
}
