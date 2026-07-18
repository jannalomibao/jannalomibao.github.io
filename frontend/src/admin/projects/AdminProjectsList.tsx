import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Star } from "lucide-react";
import ConfirmDeleteButton from "@/components/admin/ConfirmDeleteButton";
import { deleteProject, listProjects } from "./api";
import type { AdminProject } from "./types";

export default function AdminProjectsList() {
  const [projects, setProjects] = useState<AdminProject[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  function load() {
    setError(null);
    listProjects()
      .then(setProjects)
      .catch((err: Error) => setError(err.message));
  }

  async function handleDelete(id: string) {
    try {
      await deleteProject(id);
      setProjects((current) => current?.filter((p) => p.id !== id) ?? null);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ink-soft mb-3">Projects</p>
          <h1 className="font-display text-3xl text-ink">Manage projects</h1>
        </div>
        <Link
          to="/admin/projects/new"
          className="inline-flex items-center gap-2 bg-ink text-paper px-5 py-2.5 rounded-full text-sm hover:bg-accent transition-colors"
        >
          <Plus size={16} /> New project
        </Link>
      </div>

      {error && <p className="text-accent text-sm mb-4">{error}</p>}

      {projects === null && !error && (
        <p className="text-ink-soft text-sm">Loading…</p>
      )}

      {projects?.length === 0 && (
        <p className="text-ink-soft text-sm">No projects yet.</p>
      )}

      {projects && projects.length > 0 && (
        <div className="border-t border-line divide-y divide-line">
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex items-center justify-between gap-4 py-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  aria-label={project.published ? "Published" : "Draft"}
                  title={project.published ? "Published" : "Draft"}
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    project.published ? "bg-accent" : "bg-line"
                  }`}
                />
                <span className="font-display text-lg text-ink truncate">
                  {project.title}
                </span>
                {project.featured && (
                  <Star size={14} className="text-accent shrink-0" />
                )}
                <span className="text-xs text-ink-soft shrink-0">
                  {project.published ? "Published" : "Draft"}
                </span>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <Link
                  to={`/admin/projects/${project.id}`}
                  className="text-xs text-ink-soft hover:text-ink"
                >
                  Edit
                </Link>
                <ConfirmDeleteButton onConfirm={() => handleDelete(project.id)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
