# User Stories & Technical Approach — Personal Portfolio Website

Related: [PRD](02-prd.md) · [User Flow & Sitemap](03-user-flow-sitemap.md) · [Design System](04-design-system.md)

Each story maps back to one or more PRD functional/non-functional requirements (`FR-#`/`NFR-#`).
**Status** reflects what's actually built as of this doc, not intent — `frontend/` currently
implements the public site against mock data in `frontend/src/data/content.ts`; there is no
backend, database, or admin auth yet (that's Epics 6–10, pending the
[Architecture & Infrastructure doc](06-architecture-infrastructure.md)).

Status legend: ✅ Done · 🟡 Partial (built but not to the full story, see note) · ⬜ Not started

---

## Epic 1 — Public Site Shell & Navigation

*(FR-1, FR-6, NFR-1, NFR-2, NFR-5)*

### 1.1 Browse the site on any device
**Story:** As a recruiter, I want the site to work well on my phone or laptop, so that I can
review it wherever I happen to open the link.

**UAC**
- Given any public page, when viewed at mobile (< 768px), tablet, or desktop widths, then layout,
  nav, and content remain usable with no horizontal scroll or overlapping elements.
- Given a mobile viewport, when I tap the menu icon, then a full-width nav panel opens with all
  primary links, and tapping a link navigates and closes the panel.
- Given any interactive element (link, button, form field), when viewed on a touch device, then
  its tap target is large enough to hit reliably.

**Technical approach:** Tailwind CSS v4 mobile-first utilities; single breakpoint tier (`md:`
768px) per the design system; `Header.tsx` swaps a `hidden md:flex` desktop nav for a dropdown
panel below `md:`.

**Status:** ✅ Done — `Header.tsx`, verified in a real browser at mobile/desktop viewports.

### 1.2 Consistent navigation and branding across pages
**Story:** As a visitor, I want the same header, footer, and visual language on every page, so
that the site feels coherent and I always know how to get back or move forward.

**UAC**
- Given any page, when it loads, then the same header (logo/name + nav) and footer (CTA + social
  links) render identically in structure and style.
- Given I navigate between pages, when the new page loads, then a consistent, non-jarring
  transition plays (not an abrupt cut, not a multi-second delay).

**Technical approach:** Shared `Layout.tsx` wrapping all routes via React Router's `<Outlet />`;
`AnimatePresence`/`motion.main` page-transition pattern documented in the design system.

**Status:** ✅ Done.

### 1.3 Fast first load
**Story:** As a recruiter with limited patience, I want the homepage to load quickly, so that I
don't bounce before seeing anything.

**UAC**
- Given a standard broadband connection, when I open the homepage, then meaningful content is
  visible within ~2 seconds.
- Given the production build, when assets are inspected, then JS/CSS bundles are reasonably sized
  (no unused heavy dependencies shipped).

**Technical approach:** Vite production build with code-splitting by default; keep dependency
footprint deliberate (no component-library import for a handful of primitives); Unsplash images
served at explicit sized/compressed query params (`?q=80&w=...`).

**Status:** 🟡 Partial — build is small and fast in practice (~125KB gzipped JS per the last
build output), but no formal Lighthouse/perf budget has been measured yet.

### 1.4 Findable via search engines
**Story:** As the site owner, I want recruiters searching my name to actually find this site, so
that it functions as a real professional presence, not just a link I hand out.

**UAC**
- Given any public page's HTML, when inspected, then it has a descriptive `<title>` and meta
  description.
- Given the site root, when crawled, then a `sitemap.xml` and `robots.txt` are present.
- Given a link to any page shared on social/chat apps, when unfurled, then Open Graph tags
  produce a sensible preview (title, description, image).

**Technical approach:** Per-route `<title>`/meta via a small head-management approach (e.g.
`react-helmet-async` or manually set `document.title` per page — decide in the architecture doc);
static `robots.txt`/`sitemap.xml` in `public/`, sitemap generated at build time from the route
list plus published content slugs.

**Status:** ⬜ Not started — only the root `index.html` has a static title/description; no
per-page meta, OG tags, sitemap, or robots.txt yet.

---

## Epic 2 — Projects Showcase

*(FR-2)*

### 2.1 Browse projects at a glance
**Story:** As a technical interviewer, I want to scan a list of projects with their tech stack
visible up front, so that I can quickly judge relevance before reading details.

**UAC**
- Given the Projects page, when it loads, then every project shows a title, one-line summary,
  representative image, and stack tags without needing to open it.
- Given a project card, when I hover/focus it, then it gives clear visual feedback that it's
  interactive.

**Technical approach:** `ProjectCard.tsx` reused on Home (featured subset) and `Projects.tsx`
(full list), rendering from typed `Project[]` mock data.

**Status:** ✅ Done (against mock data).

### 2.2 Read a project as a case study
**Story:** As a technical interviewer, I want to see the problem, my role, and the outcome for a
project — not just a screenshot and a link — so that I can judge engineering judgment, not just
output.

**UAC**
- Given a project detail page, when it loads, then Problem / My Role / Outcome are each present
  as distinct, readable sections.
- Given a project has a repo and/or live demo, when available, then both are linked clearly and
  open in a new tab.
- Given a project has no demo (or no repo), when viewing its detail page, then the missing link
  is simply omitted, not shown broken.

**Technical approach:** `ProjectDetail.tsx` reads `Project` by `slug` param from mock data;
`repoUrl`/`demoUrl` are optional fields, conditionally rendered.

**Status:** ✅ Done (against mock data). Real project content (replacing placeholders) is
outstanding — content work, not a code task.

### 2.3 Manage projects without a code deploy *(admin)*
**Story:** As the site owner, I want to add, edit, unpublish, or remove a project from an admin
screen, so that I can keep my portfolio current without touching code.

**UAC**
- Given I'm authenticated as the owner, when I create a project with all required fields, then it
  appears on the public Projects page immediately (no rebuild/redeploy).
- Given a project is marked unpublished, when a visitor browses Projects, then it does not appear
  (draft/preview state for the owner only).
- Given I delete a project, when confirmed, then it's removed from the public site and no longer
  retrievable via its old URL (visitor sees a 404, not an error).

**Technical approach:** NestJS `projects` module (CRUD + publish toggle) backed by a Supabase
`projects` table; admin UI reuses the public `ProjectCard`/`ProjectDetail` layout in a
preview-safe way. Full schema/API contract lives in the architecture doc.

**Status:** ⬜ Not started.

---

## Epic 3 — Blog / Writing

*(FR-3)*

### 3.1 Browse and read posts
**Story:** As a visitor, I want to read a chronological list of posts and open one to read in
full, so that I can evaluate technical communication skill, not just code.

**UAC**
- Given the Blog page, when it loads, then posts are listed newest-first with title, date, read
  time, and excerpt.
- Given a post detail page, when it loads, then the full content renders with the same
  typographic treatment as the rest of the site (no unstyled/raw-markdown leakage).

**Technical approach:** `Blog.tsx` / `BlogDetail.tsx` against mock `Post[]` data; content stored
as an array of paragraph strings for now — real rich content (headings, code blocks, images
inline) is a decision for the architecture doc (Markdown/MDX vs. a structured block format).

**Status:** ✅ Done (against mock data, plain-paragraph content model only).

### 3.2 Manage posts without a code deploy *(admin)*
**Story:** As the site owner, I want to write and publish a post from an admin screen, so that
publishing doesn't require a PR and a deploy.

**UAC**
- Given I'm authenticated, when I save a post as a draft, then it's visible to me in the admin
  list but not on the public Blog page.
- Given I publish a post, when a visitor loads `/blog`, then it appears in the list within normal
  page-load latency (no manual cache-bust needed).
- Given I edit a published post, when saved, then the public detail page reflects the edit
  immediately.

**Technical approach:** NestJS `posts` module (CRUD + publish toggle) + Supabase `posts` table;
editor is a plain textarea/structured form for v1 (no rich WYSIWYG requirement stated in the
PRD) — revisit if real usage demands it.

**Status:** ⬜ Not started.

---

## Epic 4 — Resume / CV

*(FR-4, FR-11)*

### 4.1 View and download resume
**Story:** As a recruiter, I want to view a structured resume on the page and download a PDF
version, so that I can quickly assess fit and keep a copy for my ATS/records.

**UAC**
- Given the Resume page, when it loads, then summary, experience, education, and skills render
  as structured, scannable sections (not a wall of text).
- Given the "Download PDF" action, when clicked, then a PDF downloads (or opens) without a broken
  link or 404.

**Technical approach:** `Resume.tsx` renders structured mock data; `resumeUrl` is currently a
placeholder (`#`). Real behavior depends on the open PRD question ("generated from CMS data vs.
manually uploaded file") — resolve in the architecture doc.

**Status:** 🟡 Partial — on-page structured resume is done; PDF download is a non-functional
placeholder.

### 4.2 Update resume content without a code deploy *(admin)*
**Story:** As the site owner, I want to update my experience/skills from an admin screen, so my
resume page and PDF stay current without a code change.

**UAC**
- Given I'm authenticated, when I edit a resume field (e.g. add a role), then the public Resume
  page reflects it without a redeploy.
- Given resume data changes, when the PDF is (re)generated or re-uploaded, then the downloadable
  PDF matches what's on the page (no stale mismatch between the two).

**Technical approach:** NestJS `resume` module + Supabase `resume` table (single-row or
versioned); PDF generation approach (server-rendered vs. re-upload flow) is an open decision —
see PRD §10.

**Status:** ⬜ Not started.

---

## Epic 5 — Contact

*(FR-5, FR-14)*

### 5.1 Send a message
**Story:** As a recruiter, I want to send a message directly from the site, so that I don't need
to leave the page or already have an email client configured.

**UAC**
- Given the Contact form, when I submit without filling required fields, then I see inline
  validation errors per field and nothing is sent.
- Given valid name/email/message, when I submit, then I see a clear on-page confirmation and the
  form is replaced or reset (can't accidentally double-submit the same content).
- Given an invalid email format, when I submit, then the email field specifically is flagged.

**Technical approach:** `Contact.tsx` — client-side validation implemented now; submission is
currently simulated (`setTimeout`, no network call — see `TODO` in the component). Real
submission requires the backend API in Epic 5.2.

**Status:** 🟡 Partial — validation and success-state UI done; nothing is actually persisted or
sent anywhere yet.

### 5.2 Receive and manage submitted messages *(admin)*
**Story:** As the site owner, I want submitted messages stored and visible to me, and to know
when a new one arrives, so I don't miss recruiter outreach by relying on a shared inbox alone.

**UAC**
- Given a visitor submits the contact form, when submission succeeds, then a record is persisted
  server-side with name, email, message, and timestamp.
- Given a new submission arrives, when it's saved, then the owner is notified via the chosen
  channel (email/Slack/in-dashboard — PRD §10 open question).
- Given I'm authenticated, when I view the admin Messages list, then I can mark a message read or
  archived, and that state persists across sessions.

**Technical approach:** NestJS `contact` module: `POST /contact` (public, rate-limited) writes to
a Supabase `contact_submissions` table and triggers the notification side-effect; `GET
/contact` + read/archive mutations are auth-gated. Rate limiting matters here specifically —
it's the one public-facing write endpoint with no auth in front of it.

**Status:** ⬜ Not started.

---

## Epic 6 — Admin Authentication

*(FR-7, NFR-3)*

### 6.1 Log in as the owner
**Story:** As the site owner, I want to log in to a private admin area, so that only I can change
site content.

**UAC**
- Given `/admin` or any admin route, when accessed while unauthenticated, then I'm redirected to
  a login screen, not the admin content.
- Given valid credentials, when submitted, then I'm redirected into the admin dashboard and stay
  authenticated across a normal browsing session (no re-login on every click).
- Given invalid credentials, when submitted, then I see an error and remain on the login screen —
  no partial access.
- Given I log out, when I try to revisit an admin route directly, then I'm sent back to login.

**Technical approach:** Supabase Auth (email/password or magic link — resolve in architecture
doc, PRD §10) issuing a session the NestJS API verifies on every admin request; frontend route
guard wraps all `/admin/*` routes and checks session state before rendering.

**Status:** ⬜ Not started.

### 6.2 No content mutation without auth
**Story:** As the site owner, I want it to be structurally impossible to change content without
logging in, so a bug in the frontend UI can't accidentally expose a public write path.

**UAC**
- Given any content-mutating API endpoint (create/update/delete project, post, resume, or
  contact-status change), when called without a valid session, then it's rejected server-side
  (401/403) regardless of what the frontend does or doesn't show.
- Given a valid session, when it expires, then subsequent mutating calls are rejected until
  re-authentication.

**Technical approach:** Auth guard/middleware at the NestJS layer on every mutating route —
enforced server-side, not just hidden client-side, per NFR-3. This is the story that makes
NFR-3 testable independent of the UI.

**Status:** ⬜ Not started.

---

## Epic 7 — Data & API Foundation

*(FR-12, FR-13 — cross-cutting; not user-facing on their own, but every admin story depends on this existing)*

### 7.1 Persisted, typed data layer
**Story:** As the site owner (acting as the system's developer), I want all dynamic content in a
real database with a defined schema, so content survives restarts and has consistent shape.

**UAC**
- Given the Supabase schema, when inspected, then `projects`, `posts`, `resume`, and
  `contact_submissions` tables exist with appropriate types/constraints (required fields
  non-null, slugs unique, timestamps present).
- Given the NestJS API, when any endpoint returns dynamic content, then its shape matches a
  documented type shared with (or mirrored in) the frontend.

**Technical approach:** Defined fully in the [Architecture & Infrastructure doc](06-architecture-infrastructure.md)
— this story is the placeholder marking that dependency; not further specified here to avoid
duplicating that doc.

**Status:** ⬜ Not started.

### 7.2 Frontend consumes real data instead of mocks
**Story:** As a visitor, I want to see content the owner actually published, not hardcoded
placeholder data, so the site reflects reality.

**UAC**
- Given the backend is live, when any public page loads, then it fetches from the NestJS API
  instead of `frontend/src/data/content.ts`.
- Given the API is temporarily unreachable, when a page loads, then it fails gracefully (a clear
  error/empty state), not a blank crash.

**Technical approach:** Replace direct imports from `content.ts` with a data-fetching layer
(e.g. a small `api/` module + React Query or plain `fetch` in effects — decide in the
architecture doc); keep `content.ts`'s types as the shared contract shape during the transition
so the swap is mostly at the data-source boundary, not a rewrite of every page.

**Status:** ⬜ Not started — this is the single largest remaining frontend change once the
backend exists.

---

## Summary — Status by Epic

| Epic | Stories | Status |
|---|---|---|
| 1. Public Site Shell & Navigation | 4 | 3 Done, 1 Partial |
| 2. Projects Showcase | 3 | 2 Done (mock data), 1 Not started |
| 3. Blog / Writing | 2 | 1 Done (mock data), 1 Not started |
| 4. Resume / CV | 2 | 1 Partial, 1 Not started |
| 5. Contact | 2 | 1 Partial, 1 Not started |
| 6. Admin Authentication | 2 | Not started |
| 7. Data & API Foundation | 2 | Not started |

Everything marked Done or Partial exists in `frontend/` today. Everything Not started requires
the backend/infra work covered by the pending
[Architecture & Infrastructure doc](06-architecture-infrastructure.md).
