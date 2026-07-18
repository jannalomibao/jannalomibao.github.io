# Story Progress

Maintained by the project's `/build` skill. `## Changelog` is append-only (newest first); `##
Remaining` is fully regenerated on every `/build` run from whatever's actually in `docs/tasks/`
at that moment — don't hand-edit either section, they'll be overwritten by the next run.

## Changelog

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

None — `docs/tasks/` has no open stories as of this update. Run `/new-story` to add one.
