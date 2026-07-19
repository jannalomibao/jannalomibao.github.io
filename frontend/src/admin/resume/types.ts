// Matches docs/07-api-contract.md §3/§6. Resume has no admin-only fields
// (unlike Project/Post's `published`) — the public GET /api/resume already
// returns everything the admin form needs, no separate admin GET exists.
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

export interface AdminResume {
  id: string;
  summary: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: string[];
  pdfUrl: string | null;
  updatedAt: string;
}

export interface ResumeFormValues {
  summary: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: string[];
}

export const emptyExperience: ResumeExperience = {
  role: "",
  org: "",
  period: "",
  points: [],
};

export const emptyEducation: ResumeEducation = {
  school: "",
  credential: "",
  period: "",
};
