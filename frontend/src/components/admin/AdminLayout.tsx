import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FolderKanban,
  Newspaper,
  FileUser,
  Mail,
  LogOut,
} from "lucide-react";
import { useAdminAuth } from "@/lib/useAdminAuth";

const navItems = [
  { to: "/admin/projects", label: "Projects", icon: FolderKanban },
  { to: "/admin/blog", label: "Blog", icon: Newspaper },
  { to: "/admin/resume", label: "Resume", icon: FileUser },
  { to: "/admin/messages", label: "Messages", icon: Mail },
];

// Deliberately not the public Layout.tsx — no header/footer/custom
// cursor/marquee (architecture doc §5: admin has a separate authenticated
// layout, not linked from public navigation). Sidebar-nav shell instead of
// the public site's centered-content pattern, but same palette/type.
//
// `sticky top-0 h-screen` is load-bearing, not decorative: without a height
// pinned to the viewport, the sidebar's height is derived from `main`'s
// content height (flex stretch), so on a page with much content `nav`'s
// `flex-1` balloons far past the viewport and pushes Logout below the fold
// — reproduced directly via a real click failure on a narrow viewport, not
// a hypothetical.
export default function AdminLayout() {
  const { signOut } = useAdminAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="min-h-screen flex bg-paper">
      <aside className="sticky top-0 h-screen w-16 md:w-60 shrink-0 border-r border-line flex flex-col overflow-y-auto">
        <div className="px-3 md:px-6 py-6 border-b border-line flex justify-center md:justify-start">
          <NavLink to="/admin" className="font-display text-xl text-ink" title="Admin">
            <span className="hidden md:inline">Admin</span>
            <span className="md:hidden">A</span>
          </NavLink>
        </div>

        <nav className="flex-1 px-2 md:px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              title={label}
              className={({ isActive }) =>
                `flex items-center justify-center md:justify-start gap-3 px-3 py-2.5 rounded-full text-sm transition-colors ${
                  isActive
                    ? "bg-ink text-paper"
                    : "text-ink-soft hover:bg-ink/5 hover:text-ink"
                }`
              }
            >
              <Icon size={16} className="shrink-0" />
              <span className="hidden md:inline">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-2 md:px-3 py-4 border-t border-line">
          <button
            type="button"
            onClick={handleLogout}
            title="Log out"
            className="w-full flex items-center justify-center md:justify-start gap-3 px-3 py-2.5 rounded-full text-sm text-ink-soft hover:bg-ink/5 hover:text-ink transition-colors"
          >
            <LogOut size={16} className="shrink-0" />
            <span className="hidden md:inline">Log out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 px-6 py-8 md:px-10 md:py-10">
        <Outlet />
      </main>
    </div>
  );
}
