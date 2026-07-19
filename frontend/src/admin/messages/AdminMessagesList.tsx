import { useEffect, useState } from "react";
import { listSubmissions, updateSubmissionStatus } from "./api";
import type { AdminContactSubmission, StatusFilter } from "./types";

const FILTERS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Unread", value: "unread" },
  { label: "Read", value: "read" },
  { label: "Archived", value: "archived" },
];

export default function AdminMessagesList() {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [submissions, setSubmissions] = useState<AdminContactSubmission[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  function load(nextFilter: StatusFilter) {
    setError(null);
    listSubmissions(nextFilter)
      .then(setSubmissions)
      .catch((err: Error) => setError(err.message));
  }

  async function handleStatusChange(id: string, status: "read" | "archived") {
    try {
      await updateSubmissionStatus(id, status);
      load(filter);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-ink-soft mb-3">Messages</p>
        <h1 className="font-display text-3xl text-ink">Contact submissions</h1>
      </div>

      <div role="tablist" className="flex items-center gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            role="tab"
            aria-selected={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
              filter === f.value
                ? "bg-ink text-paper border-ink"
                : "border-line text-ink-soft hover:text-ink"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <p className="text-accent text-sm mb-4">{error}</p>}

      {submissions === null && !error && <p className="text-ink-soft text-sm">Loading…</p>}

      {submissions?.length === 0 && (
        <p className="text-ink-soft text-sm">No submissions in this view.</p>
      )}

      {submissions && submissions.length > 0 && (
        <div className="border-t border-line divide-y divide-line">
          {submissions.map((s) => (
            <div key={s.id} className="flex items-start justify-between gap-4 py-4">
              <div className="flex items-start gap-3 min-w-0">
                <span
                  aria-label={s.status === "unread" ? "Unread" : "Read"}
                  title={s.status}
                  className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${
                    s.status === "unread" ? "bg-accent" : "bg-line"
                  }`}
                />
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-display text-lg text-ink">{s.name}</span>
                    <span className="text-xs text-ink-soft">{s.email}</span>
                  </div>
                  <p className="text-sm text-ink-soft mt-1 line-clamp-2">{s.message}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <span className="text-xs text-ink-soft">
                  {new Date(s.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                {s.status === "unread" && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(s.id, "read")}
                    className="text-xs text-ink-soft hover:text-ink"
                  >
                    Mark read
                  </button>
                )}
                {s.status !== "archived" && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(s.id, "archived")}
                    className="text-xs text-ink-soft hover:text-ink"
                  >
                    Archive
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
