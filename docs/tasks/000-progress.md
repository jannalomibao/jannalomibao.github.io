# Story Progress

Maintained by the project's `/build` skill. `## Changelog` is append-only (newest first); `##
Remaining` is fully regenerated on every `/build` run from whatever's actually in `docs/tasks/`
at that moment — don't hand-edit either section, they'll be overwritten by the next run.

## Changelog

### 2026-07-20 — 005's last open item: fixed resume DTO presence validation (done)

Closed the one UAC left open after the 003/004/005 re-check pass (below). The backend's
`ResumeExperienceDto`/`ResumeEducationDto` (`backend/src/resume/dto/update-resume.dto.ts`) only
validated *type* (`@IsString()`), not *presence* — an omitted field correctly 400'd, but an
empty string (all the admin form's controlled inputs ever send) silently passed. Added
`@IsNotEmpty()` alongside `@IsString()` on every identifying field (`role`/`org`/`period` for
experience, `school`/`credential`/`period` for education). `docs/07-api-contract.md` §6 updated
to state the non-empty requirement explicitly, matching the DTO now.

- **Backend checks:** `npx nest build`, `npx eslint`, `npx tsc --noEmit` all clean.
- **Tests:** rewrote `005`'s UAC 4 tests — one confirms both shapes now 400 at the API level
  (previously only the omitted-field shape did); a **new** test submits a blank row through the
  real admin form and confirms the row-specific error actually displays and nothing saves —
  previously undemonstrable through the UI at all, now genuinely reachable, which is what the
  UAC literally asked for from the start.
- **A real knock-on test bug caught by the fix working correctly:** `005`'s UAC 3 test added its
  marker experience row with only `role` filled in, relying on the very gap just fixed to get
  away with leaving `org`/`period` blank. Now correctly rejected — fixed the test to fill in all
  three required fields, matching what a real save actually requires.
- **UACs:** 5/5 confirmed. Moved to `docs/tasks/done/005-admin-manage-resume.md`.
- **Worth flagging, not fixed here (out of scope for this fix):** the exact same pattern —
  `@IsString()` without `@IsNotEmpty()` on fields `docs/07-api-contract.md` already documents as
  "required, non-empty" — exists in `CreateProjectDto` and `CreatePostDto` too (title, summary,
  problem, role, outcome, imageUrl / title, excerpt, content, imageUrl). Nothing currently
  depends on it being fixed (no open UAC references it), but it's the same latent gap, just not
  yet surfaced by a story that happens to test for it.

### 2026-07-20 — Re-verified 003/004/005 against the real public site now that 007 shipped

Not a new build — a re-check pass. `007` unblocked 6 UACs across `003`, `004`, and `005` that
had only ever been confirmed at the API level (asserting against the public page would have been
vacuously true before). Updated each spec file to assert against the real rendered public page
directly (`e2e/tests/003-admin-manage-projects.spec.ts`,
`e2e/tests/004-admin-manage-blog.spec.ts`, `e2e/tests/005-admin-manage-resume.spec.ts`), kept the
existing API-level checks alongside them, ran the full suite, and updated each story doc.

- **Tests:** 102/110 passing (same counts as `007`'s own run — this pass only changed what
  existing tests assert, not how many exist for 003-005). One `mobile-chromium` test
  (`003`'s UAC 4, untouched by this pass) failed once under heavy parallel load, then passed
  both in isolation and on a full clean re-run — a real flake from many workers hitting the
  shared local Postgres at once, not a regression.
- **A real test-timing bug caught and fixed, same shape as ones found in stories 005/006:**
  `page.goto()` doesn't wait for the target page's async data fetch, and a plain `.count()`
  snapshot (not an auto-retrying `expect`) taken right after navigating could catch the public
  page mid-skeleton-state and report an item "missing" that would have appeared a moment later.
  Fixed by waiting for the loading skeleton (`.animate-pulse`) to be gone — content-agnostic,
  doesn't depend on which specific titles exist — before asserting presence or absence.
- **003 and 004: 6/6 UACs now confirmed** — moved to `docs/tasks/done/`.
- **005: 4/5 confirmed** — the 2 Epic-7.2-blocked UACs are now verified against the real page;
  the 5th (UAC 4) is unrelated (a distinct resume-DTO validation-looseness finding) and stays
  open. `005` stays in `docs/tasks/`, not `done/`.
- Cleaned up several leftover test rows in the local `projects` table left behind by earlier
  debugging runs (pre-dating this pass's fixes) — confirmed the suite is self-cleaning on a
  repeat run before finishing.

### 2026-07-20 — 007: Public pages consume real API data — Epic 7.2 (done)

Replaced `frontend/src/data/content.ts` mock data with real API fetches on `Projects`,
`ProjectDetail`, `Blog`, `BlogDetail`, `Resume`, and Home's featured-projects section — a new
`frontend/src/api/` module (public, unauthenticated GET reads, mirroring the shape of the admin
one), a shared `useApi` fetch hook, and shared `Skeleton`/`ErrorMessage`/`EmptyMessage`
components for loading/error/empty states. Frontend-only; the backend read endpoints already
existed and were already verified. Profile/bio data (Home's intro copy, About, Footer, Contact's
social links) stays on `content.ts` deliberately — no `profile` table exists in the schema, and
adding one is new scope, not this story's.

- **Tests:** 102/110 passing across the whole suite (8 skipped by design — 5 from `005`'s
  pre-existing single-shared-row restriction, 3 new ones from this story's own "Blog against
  real data" tests, restricted to `chromium` for the identical reason: `serial` mode only orders
  tests within one project's run, not across chromium vs. `mobile-chromium`'s separate parallel
  executions against the same shared backend — same fix shape as `005`).
- **This closes the loop on three consecutive partially-open stories.** `003`, `004`, and `005`
  each had UACs blocked specifically because the public pages they depended on still rendered
  mock data — re-verify those open UACs against the real site now that this has shipped, since
  they were never confirmed false, just unconfirmable until now.
- **Verified against real seeded data, not fixtures** (`supabase/seed.sql`,
  `docs/08-seed-data.md`) — including two UACs (not-found, empty-state) that had real,
  non-contrived cases fall out of that real data for free: `nail-salon-website` (a real project,
  genuinely unpublished) for not-found, and blog's genuine zero-posts state for empty. API-down
  and Projects' empty state were simulated via `page.route()` network interception rather than
  stopping the shared dev backend or temporarily unpublishing real portfolio content — same real
  code paths, non-destructive triggers.
- **Two real bugs found and fixed along the way, neither in this story's stated scope, both
  blocking a clean regression run:**
  1. `e2e/tests/005-admin-manage-resume.spec.ts` had a **data-destructive test bug** — its UAC 4
     cleanup unconditionally `PATCH`ed `experience: []`, which was harmless against empty dev
     data but silently deleted the real seeded resume experience the first time the full suite
     ran against real content. Its UAC 2 test also never cleaned up its own added row. Both now
     capture and restore the real pre-test array instead.
  2. `AdminProjectsList.tsx` / `AdminBlogList.tsx` had a **real responsive layout bug**: on a
     narrow viewport, `ConfirmDeleteButton`'s expanded "Delete? Confirm Cancel" state squeezed
     the row title to zero width (invisible, not just truncated), since the actions group was
     `shrink-0` and the title was the only flexible item absorbing the overflow. Fixed with
     `flex-wrap` on the row. Caught by `004`'s own UAC 6 test failing on `mobile-chromium` during
     this story's regression pass — a real bug, not a flaky test, left unfixed it would have
     stayed silently broken indefinitely since `004`'s suite alone never happened to trigger it
     until real content (longer titles/dates) plus real data volume shifted the row layout.
- **UACs:** 8/8 confirmed and struck through.
- **Status:** moved to `docs/tasks/done/007-public-pages-real-data.md`.
- **Not pushed to production yet — deliberately.** The backend isn't deployed anywhere (no
  production Supabase project, no container host — see architecture doc §8, still not built).
  Shipping this to the live GitHub Pages site right now would replace today's working (if
  mock-data-based) public pages with error states for every visitor, since there's nothing at
  `VITE_API_URL` in production. Committed locally; deploy is a decision for the site owner once
  backend deployment exists, not something to push through automatically.

### 2026-07-19 — 006: Admin manage messages (done)

List view at `/admin/messages` (name, email, message, date, status per row, newest first), with
status-filter tabs (All/Unread/Read/Archived mapped to `GET /api/admin/contact?status=`) and
per-row "Mark read"/"Archive" actions (`PATCH /api/admin/contact/:id`). No "mark unread" control
anywhere, matching that the API doesn't support that transition. Frontend-only — backend already
built and verified. Also removed `AdminComingSoon`, now dead code once this was the last of the
5 originally-planned admin sections (002–006) to get a real screen.

- **Tests:** 73/78 passing across the whole suite (10/10 for this story, `chromium` +
  `mobile-chromium`; the 5 skips are story `005`'s pre-existing, documented shared-row
  restriction, unrelated to this story). No unit tests — no isolable branching logic beyond what
  Playwright already proves against the real API.
- **First story of the five to close out fully, as predicted** — no public-facing page exists
  for contact messages, so the Epic 7.2 blocker that partially stalled `003`/`004`/`005` simply
  doesn't apply here.
- **No admin "create" endpoint for submissions** (by design — they only originate from the public
  contact form), so tests seed rows by inserting directly into `contact_submissions` via `psql`
  rather than routing through the rate-limited (5/IP/hour) public `POST /api/contact`, which also
  keeps the suite decoupled from that endpoint's still-TODO public-form wiring (Epic 5.1, not
  this story).
- **A real test-timing bug caught and fixed:** archiving is async (PATCH + list reload) with no
  "Saved" indicator on this screen — clicking "Archive" and then immediately switching filter
  tabs could race the reload, catching the row before its status actually flipped. Fixed by
  waiting for the row's own "Archive" button to disappear (real completion signal) before
  switching tabs, same fix shape as story `005`'s load-timing bug.
- **Also fixed:** a wrong DOM-depth locator caught before it caused a flaky failure (email span
  to row-with-actions is 4 levels up, not 2 — confirmed by reading the component directly rather
  than guessing, same lesson as story `003`), and a missing `@types/node` in `e2e/` surfaced by
  the editor's live diagnostics (Playwright's esbuild transpilation runs untyped, so it silently
  tolerated `node:child_process` with no type declarations — installed the dev dependency so the
  suite actually type-checks, not just runs).
- **UACs:** 5/5 confirmed and struck through.
- **Status:** moved to `docs/tasks/done/006-admin-manage-messages.md`.

### 2026-07-19 — 005: Admin manage resume (partial — stays open)

Single edit form at `/admin/resume` (summary, repeatable experience/education rows with add/
remove, skills via the shared `TagInput`), consuming `PATCH /api/admin/resume`. PDF upload is a
disabled "coming soon" affordance, not a functional control, per the story's explicit scope cut
(the upload endpoint doesn't exist yet — needs Supabase Storage).

- **Tests:** 63/68 passing across the whole suite (5 skipped by design — see below). 5/5 for
  this story on `chromium`.
- **New concurrency concern specific to this story, handled deliberately:** unlike
  projects/posts (one row per test, isolated by a unique slug), `resume` is a single shared row
  — a save replaces the whole array, so two tests racing a save is a genuine read-modify-write
  hazard, not hypothetical. Restricted this spec to the `chromium` project only (skipped on
  `mobile-chromium`, accounting for the 5 skips) and forced serial execution within it. Every
  other spec file is unaffected and still runs both projects.
- **A real test-timing bug caught and fixed:** `page.goto()` doesn't wait for the form's async
  `GET /api/resume` fetch — a snapshot query taken immediately after navigation could catch the
  page mid-"Loading…" with zero row inputs in the DOM. Fixed by waiting for a row to actually be
  visible first.
- **A genuinely new finding, distinct from the Epic 7.2 pattern in `003`/`004`:** UAC 4
  ("incomplete row shows a validation error") doesn't hold, but not for the usual reason —
  confirmed directly that `ResumeExperienceDto`/`ResumeEducationDto` only validate *type*, not
  *presence*: an *omitted* field correctly 400s with a row-specific message, but an *empty
  string* (which is all the controlled-input form ever sends) silently 200s. The validation
  mechanism works; the form just can't reach it. Not fixed here (backend DTO work, out of this
  frontend-only story's scope) — documented precisely in the story file so it doesn't get
  confused with the recurring public-page blocker.
- **UACs:** 2/5 confirmed and struck through (pre-fill on load, no PDF upload control). 3/5
  blocked — 2 on the familiar Epic 7.2 gap (public `/resume` page also still on mock data,
  confirmed directly), 1 on the validation-looseness finding above.
- **Status:** stays in `docs/tasks/005-admin-manage-resume.md` (not moved to `done/`).

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

Nothing — every story in `docs/tasks/` is in `docs/tasks/done/` with all UACs confirmed. Full
list: `001` (scroll parallax), `002` (admin login/shell), `003` (admin projects), `004` (admin
blog), `005` (admin resume), `006` (admin messages), `007` (public pages read real data).

**One thing worth prioritizing regardless:** `007` (and the re-check/fix work that followed it)
was deliberately never pushed to production — the backend isn't deployed anywhere yet (no
production Supabase project, no container host, per architecture doc §8). Everything since is
committed locally only. Pushing now would replace the live site's currently-working (mock-data)
pages with error states for every visitor. Also noted but not acted on: `CreateProjectDto`/
`CreatePostDto` have the same latent type-not-presence validation gap `005`'s fix just closed for
resume — no open UAC references it, so it wasn't in scope, but it's the same class of bug.
