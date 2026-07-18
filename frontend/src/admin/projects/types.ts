// Matches docs/07-api-contract.md §3/§4 — the admin shape, which includes
// `published` (the public /api/projects response omits it entirely).
export interface AdminProject {
  id: string;
  slug: string;
  title: string;
  summary: string;
  problem: string;
  role: string;
  outcome: string;
  stack: string[];
  imageUrl: string;
  repoUrl: string | null;
  demoUrl: string | null;
  featured: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectFormValues {
  slug: string;
  title: string;
  summary: string;
  problem: string;
  role: string;
  outcome: string;
  stack: string[];
  imageUrl: string;
  repoUrl: string;
  demoUrl: string;
  featured: boolean;
  published: boolean;
}

export const emptyProjectForm: ProjectFormValues = {
  slug: "",
  title: "",
  summary: "",
  problem: "",
  role: "",
  outcome: "",
  stack: [],
  imageUrl: "",
  repoUrl: "",
  demoUrl: "",
  featured: false,
  published: false,
};
