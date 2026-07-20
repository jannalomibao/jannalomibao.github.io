// Public, unauthenticated reads only (GET /api/projects, /api/posts, /api/resume, and their
// :slug variants) — no Authorization header, unlike frontend/src/admin/api/client.ts.
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const API_URL = import.meta.env.VITE_API_URL;

export async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message =
      body && typeof body.message === "string" ? body.message : `Request failed (${res.status})`;
    throw new ApiError(res.status, message);
  }

  return res.json() as Promise<T>;
}
