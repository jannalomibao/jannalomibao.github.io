import { apiFetch } from "./client";
import type { Post } from "./types";

export function listPosts(): Promise<Post[]> {
  return apiFetch<Post[]>("/posts");
}

export function getPost(slug: string): Promise<Post> {
  return apiFetch<Post>(`/posts/${slug}`);
}
