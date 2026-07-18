# Story Progress

Maintained by the project's `/build` skill. `## Changelog` is append-only (newest first); `##
Remaining` is fully regenerated on every `/build` run from whatever's actually in `docs/tasks/`
at that moment — don't hand-edit either section, they'll be overwritten by the next run.

## Changelog

### 2026-07-18 — 002: Admin login + dashboard shell

Foundational admin screens: `/admin/login` (Supabase Auth email/password via `@supabase/supabase-js`,
new frontend dependency), a route guard (`RequireAuth`), and a separate authenticated
`AdminLayout` shell (sidebar nav: Projects/Blog/Resume/Messages/Logout — none of those
destinations are built yet, each shows a `AdminComingSoon` placeholder pointing at its story).
Frontend-only — the backend `AdminGuard`/JWT verification this depends on was already built and
verified in an earlier story. The whole `/admin/*` subtree is lazy-loaded (`React.lazy` +
`Suspense`) so `@supabase/supabase-js` never reaches the public bundle — caught a real ~55KB
gzip regression against PRD NFR-1 (public initial load) before it shipped, not after.

- **Tests:** 14/14 passing (`e2e/tests/002-admin-login-dashboard-shell.spec.ts`, `chromium` +
  `mobile-chromium`), plus confirmed no regressions across the full suite (34/34 including story
  001). No unit tests — no isolable business logic beyond what the real Playwright suite already
  exercises against real Supabase Auth.
- **Bug caught and fixed by testing on a real mobile viewport, not assumed to work:** the
  sidebar had no height pinned to the viewport, so it stretched to match `main`'s full content
  height via flex-stretch — on a narrow/tall page this made the nav's `flex-1` balloon far past
  the visible viewport and made the Logout button physically unclickable (covered by its own
  sibling `nav` element) on `mobile-chromium`. Fixed with `sticky top-0 h-screen` on the sidebar,
  and while in there, turned it into a narrow icon-only rail below `md:` instead of a fixed
  240px sidebar eating more than half a 412px-wide viewport.
- **UACs:** 6/6 confirmed and struck through.
- **Status:** moved to `docs/tasks/done/002-admin-login-dashboard-shell.md`.

### 2026-07-18 — 001: Scroll parallax images

Site-wide subtle scroll-driven depth parallax on every image (Home about-teaser, About photo,
`ProjectCard` on Home/Projects, `ProjectDetail` hero, Blog list + `BlogDetail`), via a new
`ParallaxImage` component (`frontend/src/components/ui/ParallaxImage.tsx`) built on Framer
Motion's `useScroll`/`useTransform`, disabled under `prefers-reduced-motion`. Frontend-only — no
backend surface. Also stood up the project's first Playwright suite (`e2e/`, reused by future
`/build` runs).

- **Tests:** 20/20 passing (`e2e/tests/001-scroll-parallax-images.spec.ts`, `chromium` +
  `mobile-chromium` projects). No backend/unit tests — nothing here had branching logic worth
  isolating beyond what Playwright already proves against the real browser.
- **UACs:** 6/6 confirmed and struck through.
- **Status:** moved to `docs/tasks/done/001-scroll-parallax-images.md`.

## Remaining

- [`003-admin-manage-projects.md`](003-admin-manage-projects.md) — admin CRUD UI for projects
  (create/edit/publish/delete), consuming the already-verified `/api/admin/projects` endpoints.
- [`004-admin-manage-blog.md`](004-admin-manage-blog.md) — admin CRUD UI for blog posts,
  including the publish-once `publishedAt` rule.
- [`005-admin-manage-resume.md`](005-admin-manage-resume.md) — admin edit form for resume
  summary/experience/education/skills. PDF upload explicitly out of scope (backend not built).
- [`006-admin-manage-messages.md`](006-admin-manage-messages.md) — admin list/filter/status-update
  UI for contact form submissions.

All four depend on `002` (done) for the dashboard shell they mount inside, and are ordered by
priority per the PRD's success metric (Projects/Blog named explicitly; Resume/Messages are
supporting).
