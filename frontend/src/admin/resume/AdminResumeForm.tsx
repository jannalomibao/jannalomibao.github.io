import { useEffect, useState, type FormEvent } from "react";
import { Plus, X } from "lucide-react";
import TagInput from "@/components/admin/TagInput";
import { AdminApiError } from "@/admin/api/client";
import { getResume, updateResume } from "./api";
import {
  emptyEducation,
  emptyExperience,
  type ResumeEducation,
  type ResumeExperience,
  type ResumeFormValues,
} from "./types";

export default function AdminResumeForm() {
  const [values, setValues] = useState<ResumeFormValues | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getResume()
      .then((resume) =>
        setValues({
          summary: resume.summary,
          experience: resume.experience,
          education: resume.education,
          skills: resume.skills,
        }),
      )
      .catch((err: Error) => setErrors([err.message]));
  }, []);

  function updateExperience(index: number, patch: Partial<ResumeExperience>) {
    setValues((v) =>
      v
        ? {
            ...v,
            experience: v.experience.map((row, i) =>
              i === index ? { ...row, ...patch } : row,
            ),
          }
        : v,
    );
  }

  function updateEducation(index: number, patch: Partial<ResumeEducation>) {
    setValues((v) =>
      v
        ? {
            ...v,
            education: v.education.map((row, i) =>
              i === index ? { ...row, ...patch } : row,
            ),
          }
        : v,
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!values) return;
    setErrors([]);
    setSaved(false);
    setSubmitting(true);
    try {
      await updateResume(values);
      setSaved(true);
    } catch (err) {
      setErrors(err instanceof AdminApiError ? err.messages : ["Something went wrong."]);
    } finally {
      setSubmitting(false);
    }
  }

  if (!values) {
    return <p className="text-ink-soft text-sm">Loading…</p>;
  }

  return (
    <div className="max-w-2xl">
      <p className="text-xs uppercase tracking-[0.2em] text-ink-soft mb-3">Resume</p>
      <h1 className="font-display text-3xl text-ink mb-8">Edit resume</h1>

      <form onSubmit={handleSubmit} noValidate className="space-y-10">
        <div>
          <label htmlFor="summary" className="block text-sm text-ink-soft mb-2">
            Summary
          </label>
          <textarea
            id="summary"
            rows={3}
            value={values.summary}
            onChange={(e) => setValues({ ...values, summary: e.target.value })}
            className="w-full bg-transparent border-b border-line focus:border-ink outline-none py-3 text-ink transition-colors resize-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs uppercase tracking-[0.2em] text-accent">Experience</h2>
            <button
              type="button"
              onClick={() =>
                setValues({ ...values, experience: [...values.experience, emptyExperience] })
              }
              className="inline-flex items-center gap-1.5 text-xs text-ink-soft hover:text-ink"
            >
              <Plus size={14} /> Add row
            </button>
          </div>

          <div className="space-y-4">
            {values.experience.map((row, i) => (
              <div key={i} className="border border-line rounded-2xl p-4 relative">
                <button
                  type="button"
                  onClick={() =>
                    setValues({
                      ...values,
                      experience: values.experience.filter((_, idx) => idx !== i),
                    })
                  }
                  aria-label={`Remove experience row ${i + 1}`}
                  className="absolute top-3 right-3 text-ink-soft hover:text-accent"
                >
                  <X size={14} />
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pr-6">
                  <input
                    aria-label={`Experience ${i + 1} role`}
                    placeholder="Role"
                    value={row.role}
                    onChange={(e) => updateExperience(i, { role: e.target.value })}
                    className="bg-transparent border-b border-line focus:border-ink outline-none py-2 text-sm text-ink"
                  />
                  <input
                    aria-label={`Experience ${i + 1} org`}
                    placeholder="Org"
                    value={row.org}
                    onChange={(e) => updateExperience(i, { org: e.target.value })}
                    className="bg-transparent border-b border-line focus:border-ink outline-none py-2 text-sm text-ink"
                  />
                  <input
                    aria-label={`Experience ${i + 1} period`}
                    placeholder="Period"
                    value={row.period}
                    onChange={(e) => updateExperience(i, { period: e.target.value })}
                    className="bg-transparent border-b border-line focus:border-ink outline-none py-2 text-sm text-ink"
                  />
                </div>
                <textarea
                  aria-label={`Experience ${i + 1} points`}
                  placeholder="One point per line"
                  rows={3}
                  value={row.points.join("\n")}
                  onChange={(e) =>
                    updateExperience(i, {
                      points: e.target.value.split("\n"),
                    })
                  }
                  className="mt-3 w-full bg-transparent border-b border-line focus:border-ink outline-none py-2 text-sm text-ink resize-none"
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs uppercase tracking-[0.2em] text-accent">Education</h2>
            <button
              type="button"
              onClick={() =>
                setValues({ ...values, education: [...values.education, emptyEducation] })
              }
              className="inline-flex items-center gap-1.5 text-xs text-ink-soft hover:text-ink"
            >
              <Plus size={14} /> Add row
            </button>
          </div>

          <div className="space-y-4">
            {values.education.map((row, i) => (
              <div key={i} className="border border-line rounded-2xl p-4 relative">
                <button
                  type="button"
                  onClick={() =>
                    setValues({
                      ...values,
                      education: values.education.filter((_, idx) => idx !== i),
                    })
                  }
                  aria-label={`Remove education row ${i + 1}`}
                  className="absolute top-3 right-3 text-ink-soft hover:text-accent"
                >
                  <X size={14} />
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pr-6">
                  <input
                    aria-label={`Education ${i + 1} school`}
                    placeholder="School"
                    value={row.school}
                    onChange={(e) => updateEducation(i, { school: e.target.value })}
                    className="bg-transparent border-b border-line focus:border-ink outline-none py-2 text-sm text-ink"
                  />
                  <input
                    aria-label={`Education ${i + 1} credential`}
                    placeholder="Credential"
                    value={row.credential}
                    onChange={(e) => updateEducation(i, { credential: e.target.value })}
                    className="bg-transparent border-b border-line focus:border-ink outline-none py-2 text-sm text-ink"
                  />
                  <input
                    aria-label={`Education ${i + 1} period`}
                    placeholder="Period"
                    value={row.period}
                    onChange={(e) => updateEducation(i, { period: e.target.value })}
                    className="bg-transparent border-b border-line focus:border-ink outline-none py-2 text-sm text-ink"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <TagInput
          label="Skills"
          values={values.skills}
          onChange={(next) => setValues({ ...values, skills: next })}
        />

        <div>
          <p className="block text-sm text-ink-soft mb-2">Resume PDF</p>
          <button
            type="button"
            disabled
            title="PDF upload isn't built yet — needs Supabase Storage integration"
            className="inline-flex items-center gap-2 border border-line text-ink-soft px-5 py-2.5 rounded-full text-sm opacity-60 cursor-not-allowed"
          >
            Upload PDF (coming soon)
          </button>
        </div>

        {errors.length > 0 && (
          <ul role="alert" className="text-accent text-sm space-y-1">
            {errors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        )}

        {saved && (
          <p role="status" className="text-ink-soft text-sm">
            Saved.
          </p>
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
