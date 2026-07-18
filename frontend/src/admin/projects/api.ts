import { adminFetch } from "@/admin/api/client";
import type { AdminProject, ProjectFormValues } from "./types";

export function listProjects(): Promise<AdminProject[]> {
  return adminFetch<AdminProject[]>("/admin/projects");
}

// repoUrl/demoUrl are optional on the backend (@IsUrl() when present) — an
// empty string from the form must become "not sent" rather than failing URL
// validation on a blank value.
function normalizeOptionalUrls<T extends { repoUrl: string; demoUrl: string }>(
  values: T,
) {
  return {
    ...values,
    repoUrl: values.repoUrl.trim() || undefined,
    demoUrl: values.demoUrl.trim() || undefined,
  };
}

export function createProject(values: ProjectFormValues): Promise<AdminProject> {
  return adminFetch<AdminProject>("/admin/projects", {
    method: "POST",
    body: JSON.stringify(normalizeOptionalUrls(values)),
  });
}

export function updateProject(
  id: string,
  values: Omit<ProjectFormValues, "slug">,
): Promise<AdminProject> {
  return adminFetch<AdminProject>(`/admin/projects/${id}`, {
    method: "PATCH",
    body: JSON.stringify(normalizeOptionalUrls(values)),
  });
}

export function deleteProject(id: string): Promise<void> {
  return adminFetch<void>(`/admin/projects/${id}`, { method: "DELETE" });
}
