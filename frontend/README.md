# Frontend

React + Vite + TypeScript + Tailwind CSS v4 portfolio site. See the
[root README](../README.md) for setup, deploy, and project-wide notes — this file only covers
things specific to working inside `frontend/`.

## Commands

| Command | Does |
|---|---|
| `npm run dev` | Start the dev server (default: http://localhost:5173) |
| `npm run build` | Type-check (`tsc -b`) then production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run Oxlint |

## Structure

```
src/
  components/
    layout/   Header, Footer, Layout (nav, page-transition shell, custom cursor)
    ui/       Shared primitives: Reveal, SectionHeading, ProjectCard, Cursor, BrandIcons
  data/
    content.ts   All page content (profile, projects, posts, resume) — currently mock data
  pages/         One file per route (Home, About, Projects, ProjectDetail, Blog, BlogDetail,
                 Resume, Contact, NotFound)
```

Design tokens (colors, fonts) live in `src/index.css` under the Tailwind v4 `@theme` block.
See [`docs/04-design-system.md`](../docs/04-design-system.md) for the full design reference.

## Editing content

Everything a recruiter would see — bio, skills, projects, blog posts, resume — is mock data in
`src/data/content.ts`. Edit that file directly; there's no CMS/backend wired up yet (see the
"Known limitations" section of the root README).

## Path alias

`@/` resolves to `src/` (configured in both `vite.config.ts` and `tsconfig.app.json` — if you
add a new alias, update both).
