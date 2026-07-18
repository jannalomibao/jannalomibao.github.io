import { Link } from "react-router-dom";
import { FolderKanban, Newspaper, FileUser, Mail, ArrowUpRight } from "lucide-react";

const sections = [
  {
    to: "/admin/projects",
    label: "Projects",
    icon: FolderKanban,
    description: "Create, edit, publish, and remove portfolio projects.",
  },
  {
    to: "/admin/blog",
    label: "Blog",
    icon: Newspaper,
    description: "Write and publish posts.",
  },
  {
    to: "/admin/resume",
    label: "Resume",
    icon: FileUser,
    description: "Update experience, education, and skills.",
  },
  {
    to: "/admin/messages",
    label: "Messages",
    icon: Mail,
    description: "Review and triage contact form submissions.",
  },
];

// Deliberately no live counts here (story 002's "nice-to-have, not the core
// deliverable") — just an entry point into each section.
export default function AdminDashboard() {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-ink-soft mb-3">Dashboard</p>
      <h1 className="font-display text-3xl text-ink mb-10">Welcome back.</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sections.map(({ to, label, icon: Icon, description }) => (
          <Link
            key={to}
            to={to}
            className="group flex items-start gap-4 p-5 rounded-2xl border border-line hover:border-ink transition-colors"
          >
            <Icon size={20} className="text-accent shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg text-ink">{label}</h2>
                <ArrowUpRight
                  size={16}
                  className="text-ink-soft transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </div>
              <p className="text-sm text-ink-soft mt-1">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
