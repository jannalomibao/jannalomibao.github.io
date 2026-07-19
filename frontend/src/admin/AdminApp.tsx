import { Routes, Route } from "react-router-dom";
import { AdminAuthProvider } from "@/lib/AdminAuthProvider";
import RequireAuth from "@/components/admin/RequireAuth";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminComingSoon from "@/components/admin/AdminComingSoon";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProjectsList from "@/admin/projects/AdminProjectsList";
import AdminProjectForm from "@/admin/projects/AdminProjectForm";
import AdminBlogList from "@/admin/blog/AdminBlogList";
import AdminBlogForm from "@/admin/blog/AdminBlogForm";
import AdminResumeForm from "@/admin/resume/AdminResumeForm";

// Everything admin-specific lives behind one lazy import in App.tsx
// (`const AdminApp = lazy(() => import("@/admin/AdminApp"))`) so
// @supabase/supabase-js and the whole admin surface only load for someone
// who actually navigates to /admin/* — public visitors never pay for it.
// Mounted at "admin/*" in App.tsx, so paths here are relative to that.
export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="login" element={<AdminLogin />} />
        <Route element={<RequireAuth />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="projects" element={<AdminProjectsList />} />
            <Route path="projects/new" element={<AdminProjectForm />} />
            <Route path="projects/:id" element={<AdminProjectForm />} />
            <Route path="blog" element={<AdminBlogList />} />
            <Route path="blog/new" element={<AdminBlogForm />} />
            <Route path="blog/:id" element={<AdminBlogForm />} />
            <Route path="resume" element={<AdminResumeForm />} />
            <Route
              path="messages"
              element={<AdminComingSoon section="Messages" story="006" />}
            />
          </Route>
        </Route>
      </Routes>
    </AdminAuthProvider>
  );
}
