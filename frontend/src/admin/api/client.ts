import { supabase } from "@/lib/supabase";

// Normalizes the API's error shape (docs/07-api-contract.md §2 — `message`
// is a single string for most errors, an array of per-field messages for
// validation failures) so callers always get a flat string[] to render,
// regardless of which shape the server sent.
export class AdminApiError extends Error {
  status: number;
  messages: string[];

  constructor(status: number, body: unknown) {
    const messages = extractMessages(body);
    super(messages[0] ?? `Request failed (${status})`);
    this.status = status;
    this.messages = messages;
  }
}

function extractMessages(body: unknown): string[] {
  if (
    body &&
    typeof body === "object" &&
    "message" in body &&
    body.message
  ) {
    const message = (body as { message: unknown }).message;
    return Array.isArray(message) ? message.map(String) : [String(message)];
  }
  return ["Something went wrong."];
}

const API_URL = import.meta.env.VITE_API_URL;

export async function adminFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new AdminApiError(res.status, body);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}
