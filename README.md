# jannalomibao.github.io

Personal portfolio for Janna Lomibao — software developer career site (recruiter-facing
projects, writing, resume, contact). Live at **<https://jannalomibao.github.io/>**.

## Repo layout

```text
docs/       Planning docs — PRD, user flow/sitemap, design system, user stories, architecture
frontend/   The actual site: React + Vite + TypeScript + Tailwind CSS v4
backend/    NestJS API — public read routes only so far (see docs/07-api-contract.md)
supabase/   Supabase CLI config + SQL migrations (schema source of truth)
devops/     Deployment infra: Terraform (GitHub Pages config) + the deploy script
.github/    GitHub Actions workflow that builds and deploys the frontend on push
docker-compose.yml   Local dev orchestration for frontend + backend
```

Start with [`docs/01-project.init.md`](docs/01-project.init.md) for the running checklist of
what's built vs. still planned. Individual docs:

- [PRD](docs/02-prd.md) — goals, scope, functional/non-functional requirements
- [User Flow & Sitemap](docs/03-user-flow-sitemap.md) — routes, visitor flow, admin flow (mermaid)
- [Design System](docs/04-design-system.md) — colors, type, spacing, components, motion — written
  from the actual implemented code, not aspirational
- [User Stories & UAC](docs/05-user-stories.md) — every requirement broken into stories with
  acceptance criteria, technical approach, and honest build status per story
- [Architecture & Infrastructure](docs/06-architecture-infrastructure.md) — NestJS + Supabase +
  Docker plan; `backend/` implements steps 1–2 of its sequencing plan so far
- [API Contract](docs/07-api-contract.md) — request/response schemas, validation, error format,
  and rate limits for every backend endpoint (public read routes implemented; admin/contact not yet)
- [Code reviews](docs/code-reviews/) — dated reports from the project's `/code-review` skill

## Local setup

Requires Node 20+.

### Frontend only (still all mock data — this is enough for most UI work)

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

To type-check and build for production:

```bash
npm run build       # outputs to frontend/dist
npm run preview     # serve that build locally
```

See [`frontend/README.md`](frontend/README.md) for the file structure and where content lives.

### Frontend + backend (requires Docker)

```bash
supabase start                 # local Postgres/Auth/Storage stack
docker compose up --build      # frontend :5173, backend :3000
```

See [`backend/README.md`](backend/README.md) for backend-only setup (no Docker), schema-change
workflow, and a few real gotchas hit while building it (worth reading before touching
`Dockerfile` or `prisma/schema.prisma`).

## Deploying

Full one-time setup and troubleshooting live in [`devops/README.md`](devops/README.md). Short
version, once set up:

```bash
./devops/deploy.sh
```

This builds locally (so a broken build fails before it ever reaches GitHub), commits, and
pushes to `main`. That push triggers `.github/workflows/deploy.yml`, which builds the site
fresh in CI and publishes it via GitHub Actions → GitHub Pages. No manual upload step, no
`gh-pages` branch to manage by hand.

Terraform (`devops/terraform/`) is separate from that — it's one-time infrastructure
configuration (turns on GitHub Pages with "GitHub Actions" as the build source) and only needs
re-running if you change *how* Pages is configured, not on every deploy.

## Things to remember

- **Repo name is load-bearing.** This must stay named exactly `jannalomibao.github.io` — GitHub
  only serves a repo at the bare domain root (instead of `/repo-name/`) when the name matches
  the account exactly. If you ever rename it, `frontend/vite.config.ts` needs a `base` path and
  `frontend/public/404.html`'s `pathSegmentsToKeep` needs updating (see next point).

- **Client-side routing needs the 404.html trick.** The site uses React Router
  (`BrowserRouter`), but GitHub Pages only serves static files — a direct link to e.g.
  `/projects/ledgerline` 404s at the CDN before React loads. `frontend/public/404.html` plus a
  decode snippet in `frontend/index.html` work around this (the
  [rafgraph/spa-github-pages](https://github.com/rafgraph/spa-github-pages) technique). Don't
  delete either half without replacing client-side routing with hash routing instead.

- **`gh` needs two things beyond plain login to push here:**
  - `gh auth setup-git` — registers `gh` as git's credential helper. Without it, HTTPS pushes
    fail with "Password authentication is not supported."
  - The `workflow` scope — without it, pushes touching `.github/workflows/**` are rejected by
    GitHub even if you're otherwise authenticated. Fix with:
    `gh auth refresh -h github.com -s workflow` (requires a one-time browser authorization).

- **Terraform state is local and gitignored.** There's no remote backend — `*.tfstate` lives
  only on whatever machine ran `terraform apply`. Fine for a single-maintainer project, but
  don't delete it carelessly, and don't run `terraform apply` from a second machine without
  copying state over first (or it'll try to recreate resources that already exist).

- **Backend is partial — public reads only.** `backend/` implements `GET /api/projects`,
  `/api/projects/:slug`, `/api/posts`, `/api/posts/:slug`, `/api/resume`, `/api/resume/pdf`
  against a real Postgres schema (`supabase/migrations/`). The frontend doesn't call any of it
  yet — it's still entirely on mock data (`frontend/src/data/content.ts`; contact form just
  simulates success) — that wiring is User Story 7.2, not done. Admin auth/CRUD and the contact
  endpoint (architecture doc §11 steps 4–6) aren't built either.

- **Design system is descriptive, not aspirational.** `docs/04-design-system.md` documents
  what's actually in the code (colors, type scale, component patterns). If you change a token
  in `frontend/src/index.css`, update the doc in the same change, not later.

## Tech stack

React 19 · Vite 8 · TypeScript · Tailwind CSS v4 · React Router · Framer Motion · lucide-react
· NestJS · Prisma · Supabase (Postgres) · Docker · Terraform (`integrations/github` provider) ·
GitHub Actions · GitHub Pages
