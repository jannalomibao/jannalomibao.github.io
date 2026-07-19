export type ContactStatus = "unread" | "read" | "archived";

export interface AdminContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  status: ContactStatus;
  createdAt: string;
}

export type StatusFilter = "all" | ContactStatus;
