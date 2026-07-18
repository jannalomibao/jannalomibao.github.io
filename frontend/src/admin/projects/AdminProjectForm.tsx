import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TagInput from "@/components/admin/TagInput";
import { AdminApiError } from "@/admin/api/client";
import { createProject, listProjects, updateProject } from "./api";
import { emptyProjectForm, type ProjectFormValues } from "./types";

export default function AdminProjectForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [values, setValues] = useState<ProjectFormValues>(emptyProjectForm);
  const [loading, setLoading] = useState(isEdit);
  const [notFound, setNotFound] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    listProjects()
      .then((projects) => {
        const project = projects.find((p) => p.id === id);
        if (!project) {
          setNotFound(true);
          return;
        }
        setValues({
          slug: project.slug,
          title: project.title,
          summary: project.summary,
          problem: project.problem,
          role: project.role,
          outcome: project.outcome,
          stack: project.stack,
          imageUrl: project.imageUrl,
          repoUrl: project.repoUrl ?? "",
          demoUrl: project.demoUrl ?? "",
          featured: project.featured,
          published: project.published,
        });
      })
      .catch((err: Error) => setErrors([err.message]))
      .finally(() => setLoading(false));
  }, [id]);

  function update<K extends keyof ProjectFormValues>(
    key: K,
    value: ProjectFormValues[K],
  ) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);
    try {
      if (isEdit && id) {
        const { slug: _slug, ...rest } = values;
        await updateProject(id, rest);
      } else {
        await createProject(values);
      }
      navigate("/admin/projects");
    } catch (err) {
      if (err instanceof AdminApiError) {
        setErrors(err.messages);
      } else {
        setErrors(["Something went wrong."]);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="text-ink-soft text-sm">Loading…</p>;
  }

  if (notFound) {
    return <p className="text-ink-soft text-sm">Project not found.</p>;
  }

  return (
    <div className="max-w-xl">
      <p className="text-xs uppercase tracking-[0.2em] text-ink-soft mb-3">
        {isEdit ? "Edit project" : "New project"}
      </p>
      <h1 className="font-display text-3xl text-ink mb-8">
        {isEdit ? values.title || "Edit project" : "New project"}
      </h1>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <label htmlFor="slug" className="block text-sm text-ink-soft mb-2">
            Slug
          </label>
          <input
            id="slug"
            type="text"
            required
            disabled={isEdit}
            value={values.slug}
            onChange={(e) => update("slug", e.target.value)}
            placeholder="my-project-slug"
            className="w-full bg-transparent border-b border-line focus:border-ink outline-none py-3 text-ink transition-colors disabled:text-ink-soft disabled:cursor-not-allowed"
          />
          {isEdit && (
            <p className="text-xs text-ink-soft mt-1">Slug can't be changed after creation.</p>
          )}
        </div>

        {(
          [
            ["title", "Title"],
            ["summary", "Summary"],
            ["problem", "Problem"],
            ["role", "Role"],
            ["outcome", "Outcome"],
            ["imageUrl", "Image URL"],
          ] as const
        ).map(([key, label]) => (
          <div key={key}>
            <label htmlFor={key} className="block text-sm text-ink-soft mb-2">
              {label}
            </label>
            <input
              id={key}
              type="text"
              required
              value={values[key]}
              onChange={(e) => update(key, e.target.value)}
              className="w-full bg-transparent border-b border-line focus:border-ink outline-none py-3 text-ink transition-colors"
            />
          </div>
        ))}

        <TagInput
          label="Stack"
          values={values.stack}
          onChange={(next) => update("stack", next)}
        />

        <div>
          <label htmlFor="repoUrl" className="block text-sm text-ink-soft mb-2">
            Repo URL (optional)
          </label>
          <input
            id="repoUrl"
            type="text"
            value={values.repoUrl}
            onChange={(e) => update("repoUrl", e.target.value)}
            className="w-full bg-transparent border-b border-line focus:border-ink outline-none py-3 text-ink transition-colors"
          />
        </div>

        <div>
          <label htmlFor="demoUrl" className="block text-sm text-ink-soft mb-2">
            Demo URL (optional)
          </label>
          <input
            id="demoUrl"
            type="text"
            value={values.demoUrl}
            onChange={(e) => update("demoUrl", e.target.value)}
            className="w-full bg-transparent border-b border-line focus:border-ink outline-none py-3 text-ink transition-colors"
          />
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={values.featured}
              onChange={(e) => update("featured", e.target.checked)}
            />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={values.published}
              onChange={(e) => update("published", e.target.checked)}
            />
            Published
          </label>
        </div>

        {errors.length > 0 && (
          <ul role="alert" className="text-accent text-sm space-y-1">
            {errors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 bg-ink text-paper px-6 py-3.5 rounded-full text-sm hover:bg-accent transition-colors disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Save"}
        </button>
      </form>
    </div>
  );
}
