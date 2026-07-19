import { adminFetch } from "@/admin/api/client";
import type { AdminPost, PostFormValues } from "./types";

export function listPosts(): Promise<AdminPost[]> {
  return adminFetch<AdminPost[]>("/admin/posts");
}

// CreatePostDto on the backend has no `published` field at all — sending one
// would be rejected by the global ValidationPipe's forbidNonWhitelisted (the
// story is explicit: posts always start as drafts, no toggle on create).
export function createPost(
  values: Omit<PostFormValues, "published">,
): Promise<AdminPost> {
  return adminFetch<AdminPost>("/admin/posts", {
    method: "POST",
    body: JSON.stringify(values),
  });
}

export function updatePost(
  id: string,
  values: Omit<PostFormValues, "slug">,
): Promise<AdminPost> {
  return adminFetch<AdminPost>(`/admin/posts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(values),
  });
}

export function deletePost(id: string): Promise<void> {
  return adminFetch<void>(`/admin/posts/${id}`, { method: "DELETE" });
}
