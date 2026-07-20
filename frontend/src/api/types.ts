// Mirrors docs/07-api-contract.md §3 exactly (camelCase JSON shapes) — not the
// same as frontend/src/data/content.ts's mock types, which use different
// field names (e.g. `image` vs `imageUrl`) and don't model nullability.

export interface Project {
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
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  readMinutes: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeExperience {
  role: string;
  org: string;
  period: string;
  points: string[];
}

export interface ResumeEducation {
  school: string;
  credential: string;
  period: string;
}

export interface Resume {
  id: string;
  summary: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: string[];
  pdfUrl: string | null;
  updatedAt: string;
}
