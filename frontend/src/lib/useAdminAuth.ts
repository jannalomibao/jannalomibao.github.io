import { useContext } from "react";
import { AdminAuthContext, type AdminAuthValue } from "@/lib/adminAuthContext";

export function useAdminAuth(): AdminAuthValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return ctx;
}
