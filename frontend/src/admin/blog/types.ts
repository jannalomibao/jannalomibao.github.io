// Matches docs/07-api-contract.md §3/§5 — the admin shape, which includes
// `published` (the public /api/posts response omits it entirely).
export interface AdminPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  readMinutes: number;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PostFormValues {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  readMinutes: number;
  published: boolean;
}

export const emptyPostForm: PostFormValues = {
  slug: "",
  title: "",
  excerpt: "",
  content: "",
  imageUrl: "",
  readMinutes: 5,
  published: false,
};
