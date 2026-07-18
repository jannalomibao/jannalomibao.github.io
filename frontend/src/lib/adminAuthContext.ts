import { createContext } from "react";
import type { Session } from "@supabase/supabase-js";

export interface AdminAuthValue {
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

export const AdminAuthContext = createContext<AdminAuthValue | null>(null);
