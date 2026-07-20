import { apiFetch } from "./client";
import type { Resume } from "./types";

export function getResume(): Promise<Resume> {
  return apiFetch<Resume>("/resume");
}
