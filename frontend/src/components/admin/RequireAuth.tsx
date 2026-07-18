import { Navigate, Outlet } from "react-router-dom";
import { useAdminAuth } from "@/lib/useAdminAuth";

export default function RequireAuth() {
  const { session, loading } = useAdminAuth();

  if (loading) {
    // Avoids a flash-redirect to /admin/login before the initial session
    // check resolves.
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper text-ink-soft text-sm">
        Loading…
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
