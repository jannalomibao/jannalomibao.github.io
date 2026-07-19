# Story Progress

Maintained by the project's `/build` skill. `## Changelog` is append-only (newest first); `##
Remaining` is fully regenerated on every `/build` run from whatever's actually in `docs/tasks/`
at that moment — don't hand-edit either section, they'll be overwritten by the next run.

## Changelog

### 2026-07-19 — 004: Admin manage blog (partial — stays open)

Full admin CRUD UI at `/admin/blog` (list, `/admin/blog/new`, `/admin/blog/:id`), reusing
`003`'s shared `admin/api/client.ts` and `ConfirmDeleteButton`. Enforces the create-mode-has-no-
publish-toggle rule from the story (`CreatePostDto` has no `published` field on the backend at
all — the form doesn't render a toggle in create mode rather than rendering one that would just
get rejected).

- **Tests:** 58/58 passing across the whole suite (12/12 for this story). All passed on the
  first real run — applied the lessons from `003` upfront this time (correct row-locator DOM
  depth, `getByRole("checkbox", ...)` instead of `getByLabel` to avoid colliding with the status
  dot's `aria-label`, no literal status words in test titles) instead of discovering them again.
- **Confirmed the identical Epic 7.2 blocker as `003`, checked directly rather than assumed:**
  the public `/blog` page also imports straight from mock data, no API call. Same treatment as
  `003` — UACs literally about "the public page" tested at the API level instead, left un-struck.
- **UACs:** 3/6 confirmed and struck through (list indicator, publish-once date rule, duplicate-
  slug validation). 3/6 blocked on Epic 7.2, same as `003`.
- **Status:** stays in `docs/tasks/004-admin-manage-blog.md` (not moved to `done/`).

### 2026-07-18 — 003: Admin manage projects (partial — stays open)

Full admin CRUD UI at `/admin/projects` (list, `/admin/projects/new`, `/admin/projects/:id`)
consuming the already-built `GET/POST/PATCH/DELETE /api/admin/projects` endpoints — new shared
`frontend/src/admin/api/client.ts` (auth-aware fetch wrapper, attaches the Supabase session JWT,
normalizes the API's error shape) reused by every remaining admin story, plus two new shared
components (`TagInput`, `ConfirmDeleteButton`) also meant for reuse in `004`–`006`.

- **Tests:** 46/46 passing across the whole suite (12/12 for this story specifically,
  `chromium` + `mobile-chromium`). No unit tests — no isolable logic beyond what Playwright
  already proves against the real API.
- **Two rounds of real test bugs, not app bugs, caught and fixed:** (1) test titles literally
  containing the word "Draft" collided with the status-indicator text in a substring match, and
  inconsistent DOM-parent depth (`..` vs `../..`) when locating a row; (2) `getByLabel
  ("Published")` was ambiguous against the list page's status dot (which also carries
  `aria-label="Published"`) — fixed by scoping to `getByRole("checkbox", { name: "Published" })`,
  which correctly excludes non-form elements.
- **Significant finding, not specific to this story:** the public `/projects` page still renders
  from mock data (Epic 7.2, not done) — confirmed directly (created + published a project via
  the admin UI, hit `GET /api/projects` and saw it, loaded the public `/projects` page and did
  not). Half of this story's UACs literally reference "the public page," which can't be
  meaningfully demonstrated yet — tested the real underlying guarantee (the public API) instead
  where that was the case. **This will recur identically for `004` (Blog)** and its "appears on
  `/blog`" UACs — worth prioritizing Epic 7.2 before or alongside further admin stories, so
  `004`–`006` don't all land in the same partially-open state.
- **UACs:** 3/6 confirmed and struck through (list indicator, duplicate-slug validation, locked
  slug on edit). 3/6 blocked on Epic 7.2 as described above — left un-struck with a note in the
  story file explaining exactly what was and wasn't verified for each.
- **Status:** stays in `docs/tasks/003-admin-manage-projects.md` (not moved to `done/` — not all
  UACs are confirmed).

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

- [`003-admin-manage-projects.md`](003-admin-manage-projects.md) — **3/6 UACs open.** Admin CRUD
  UI is built and working; the 3 open UACs are all blocked on Epic 7.2 (public `/projects` page
  not wired to real data), not on anything left to build here.
- [`004-admin-manage-blog.md`](004-admin-manage-blog.md) — **3/6 UACs open**, same shape and same
  root cause as `003` (public `/blog` page not wired to real data). Admin CRUD UI is built and
  working.
- [`005-admin-manage-resume.md`](005-admin-manage-resume.md) — admin edit form for resume
  summary/experience/education/skills. PDF upload explicitly out of scope (backend not built).
  Likely hits the same Epic 7.2 blocker for its "reflects on `/resume`" UAC.
- [`006-admin-manage-messages.md`](006-admin-manage-messages.md) — admin list/filter/status-update
  UI for contact form submissions. No public-page dependency (messages are admin-only), so this
  one shouldn't hit the Epic 7.2 blocker.

**Two stories in a row have now landed partially-open on the identical Epic 7.2 blocker** (public
site not wired to real data). `005` will very likely make it three. Strongly worth prioritizing
Epic 7.2 itself next — a story doesn't exist for it yet in `docs/tasks/`, would need `/new-story`
first — rather than continuing to `005`/`006` and accumulating a fourth/fifth partially-open
story on the same root cause.
