import { Mail, ArrowUpRight } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/BrandIcons";
import { profile } from "@/data/content";

export default function Footer() {
  return (
    <footer className="border-t border-line mt-32">
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-16 flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div>
          <p className="font-display text-3xl md:text-4xl text-ink max-w-md">
            Let's build something worth shipping.
          </p>
          <a
            href={`mailto:${profile.email}`}
            className="inline-flex items-center gap-2 mt-6 text-sm text-ink-soft hover:text-accent transition-colors"
          >
            {profile.email} <ArrowUpRight size={16} />
          </a>
        </div>

        <div className="flex items-center gap-4">
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="w-11 h-11 rounded-full border border-line flex items-center justify-center text-ink hover:bg-ink hover:text-paper transition-colors"
          >
            <GithubIcon size={18} />
          </a>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="w-11 h-11 rounded-full border border-line flex items-center justify-center text-ink hover:bg-ink hover:text-paper transition-colors"
          >
            <LinkedinIcon size={18} />
          </a>
          <a
            href={`mailto:${profile.email}`}
            aria-label="Email"
            className="w-11 h-11 rounded-full border border-line flex items-center justify-center text-ink hover:bg-ink hover:text-paper transition-colors"
          >
            <Mail size={18} />
          </a>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 md:px-10 pb-10 text-xs text-ink-soft flex justify-between">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <span>Built with React &amp; Tailwind</span>
      </div>
    </footer>
  );
}
