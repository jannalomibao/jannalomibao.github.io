# jannalomibao.github.io

Personal portfolio for Janna Lomibao — software developer career site (recruiter-facing
projects, writing, resume, contact). Live at **<https://jannalomibao.github.io/>**.

## Repo layout

```text
docs/       Planning docs — PRD, user flow/sitemap, design system, (stories & architecture WIP)
frontend/   The actual site: React + Vite + TypeScript + Tailwind CSS v4
devops/     Deployment infra: Terraform (GitHub Pages config) + the deploy script
.github/    GitHub Actions workflow that builds and deploys on push
```

Start with [`docs/01-project.init.md`](docs/01-project.init.md) for the running checklist of
what's built vs. still planned. Individual docs:

- [PRD](docs/02-prd.md) — goals, scope, functional/non-functional requirements
- [User Flow & Sitemap](docs/03-user-flow-sitemap.md) — routes, visitor flow, admin flow (mermaid)
- [Design System](docs/04-design-system.md) — colors, type, spacing, components, motion — written
  from the actual implemented code, not aspirational
- User stories/UAC and the architecture/infrastructure doc are still pending.

## Local setup

Requires Node 20+.

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

- **No backend yet.** Projects, blog posts, resume, and the contact form are all mock
  data/client-side-only (`frontend/src/data/content.ts`; contact form just simulates success).
  The PRD calls for a NestJS + Supabase backend for real CMS/contact-form persistence — that's
  the pending architecture doc, not yet built.

- **Design system is descriptive, not aspirational.** `docs/04-design-system.md` documents
  what's actually in the code (colors, type scale, component patterns). If you change a token
  in `frontend/src/index.css`, update the doc in the same change, not later.

## Tech stack

React 19 · Vite 8 · TypeScript · Tailwind CSS v4 · React Router · Framer Motion · lucide-react
· Terraform (`integrations/github` provider) · GitHub Actions · GitHub Pages
