import { adminFetch } from "@/admin/api/client";
import type { AdminResume, ResumeFormValues } from "./types";

// Resume has no admin-only fields, so the public GET is also the admin
// form's data source — there's no separate GET /api/admin/resume.
export function getResume(): Promise<AdminResume> {
  return adminFetch<AdminResume>("/resume");
}

export function updateResume(values: ResumeFormValues): Promise<AdminResume> {
  return adminFetch<AdminResume>("/admin/resume", {
    method: "PATCH",
    body: JSON.stringify(values),
  });
}
