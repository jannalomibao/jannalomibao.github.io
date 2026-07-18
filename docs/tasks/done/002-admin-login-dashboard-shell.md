# Goal

As the site owner, I want to log into a private admin area and land on a dashboard shell that
links to each content section, so that I have one authenticated entry point for managing the
site instead of touching code for every update.

## Description

- **What it is:** the foundational admin screen pair — a login form and an authenticated
  dashboard shell (nav + logout) — that every other admin story (`003`–`006`) depends on. No
  content management lives here; this story is purely "get in, and have somewhere to go."
- **Auth mechanism (already decided, architecture doc §5):** Supabase Auth, single hardcoded
  owner account, email/password. The login form calls the Supabase JS client directly
  (`@supabase/supabase-js` — not yet a frontend dependency, added by this story); on success,
  Supabase issues a JWT, the frontend holds the session, and every subsequent request to
  `/api/admin/*` attaches it as `Authorization: Bearer <token>`. The backend side of this
  (`AdminGuard`, JWKS verification) is already built and verified —
  [`docs/07-api-contract.md`](../07-api-contract.md) is the contract this story's requests must
  match; no backend work is in scope here.
- **Route guard:** any `/admin/*` route redirects to `/admin/login` when there's no valid
  session; visiting `/admin/login` while already authenticated redirects straight to `/admin`.
- **Dashboard shell:** a separate authenticated layout — **not** the public site's `Layout.tsx**
  (no header/footer/custom cursor/marquee, per architecture doc §5's "admin pages have a
  separate authenticated layout, not linked from public navigation"). Sidebar nav: Projects,
  Blog, Resume, Messages, Logout. The `/admin` landing route itself can be a light overview
  (e.g. counts pulled from the already-built `GET /api/admin/*` list endpoints) — a nice-to-have,
  not the core deliverable.
- **Visual style:** reuse the public design system (design system §7's button/pill patterns,
  Fraunces/Inter type, paper/ink/accent palette) so the admin area feels like the same site, not
  a bolted-on tool — just with a sidebar-nav shell instead of the public site's centered-content
  pattern.

```mermaid
flowchart TD
    Start([Owner navigates to /admin]) --> AuthCheck{Session valid?}
    AuthCheck -->|No| Login[/admin/login form]
    Login --> Submit[Submit email + password]
    Submit --> SupaAuth{Supabase Auth\naccepts credentials?}
    SupaAuth -->|No| LoginError[Inline error, stay on form]
    LoginError --> Login
    SupaAuth -->|Yes| StoreSession[Store session, attach JWT\nto future /api/admin/* requests]
    StoreSession --> Shell[Redirect to /admin — dashboard shell]
    AuthCheck -->|Yes| Shell
    Shell --> Nav{Pick a section}
    Nav -->|Projects| P["/admin/projects (story 003)"]
    Nav -->|Blog| B["/admin/blog (story 004)"]
    Nav -->|Resume| R["/admin/resume (story 005)"]
    Nav -->|Messages| M["/admin/messages (story 006)"]
    Nav -->|Logout| Logout[Clear session]
    Logout --> Login
```

```text
  /admin/login                         /admin (shell)
  ┌───────────────────────┐            ┌──────────┬──────────────────────────┐
  │                       │            │ Sidebar  │  Content area            │
  │      Admin login       │            │──────────│                          │
  │                       │            │ Projects │  Overview / counts       │
  │  Email    [_________] │            │ Blog     │  (or whichever section   │
  │  Password [_________] │            │ Resume   │   nav selects)           │
  │                       │            │ Messages │                          │
  │     [ Log in ]        │            │──────────│                          │
  │                       │            │ Logout   │                          │
  └───────────────────────┘            └──────────┴──────────────────────────┘
```

## UACs

All six verified by `e2e/tests/002-admin-login-dashboard-shell.spec.ts`, run against both a
desktop and a mobile viewport — 14/14 passing (plus one bonus test for the already-authenticated
`/admin/login` redirect mentioned in the Description but not separately listed below).

- ~~Demo that visiting `/admin` while logged out redirects to `/admin/login`.~~
- ~~Demo that submitting valid owner credentials on `/admin/login` redirects to `/admin` and shows
  the dashboard shell.~~
- ~~Demo that submitting invalid credentials shows an inline error and stays on `/admin/login` —
  no partial access.~~
- ~~Demo that the dashboard shell shows nav entries for Projects, Blog, Resume, and Messages (the
  destinations don't need to be built yet — that's stories `003`–`006`) plus a working Logout
  action.~~
- ~~Demo that after logging out, visiting `/admin` again redirects back to `/admin/login` — no
  stale session access.~~
- ~~Demo that the admin shell never renders the public site's header, footer, custom cursor, or
  marquee — it's a visibly separate layout, not the public `Layout.tsx` reused.~~
