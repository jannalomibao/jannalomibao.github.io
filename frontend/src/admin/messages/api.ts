import { adminFetch } from "@/admin/api/client";
import type { AdminContactSubmission, StatusFilter } from "./types";

export function listSubmissions(filter: StatusFilter): Promise<AdminContactSubmission[]> {
  const query = filter === "all" ? "" : `?status=${filter}`;
  return adminFetch<AdminContactSubmission[]>(`/admin/contact${query}`);
}

// `unread` is deliberately not an accepted value here — the API only
// supports moving forward (read/archived), never back to unread
// (docs/07-api-contract.md §7).
export function updateSubmissionStatus(
  id: string,
  status: "read" | "archived",
): Promise<AdminContactSubmission> {
  return adminFetch<AdminContactSubmission>(`/admin/contact/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
