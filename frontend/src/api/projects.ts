import { apiFetch } from "./client";
import type { Project } from "./types";

export function listProjects(): Promise<Project[]> {
  return apiFetch<Project[]>("/projects");
}

export function getProject(slug: string): Promise<Project> {
  return apiFetch<Project>(`/projects/${slug}`);
}
