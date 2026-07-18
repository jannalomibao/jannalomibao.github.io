---
name: build
description: Build the feature described in docs/tasks/{task_id}-*.md end to end — backend, then frontend, then Playwright + unit tests — then strike through confirmed UACs, move the story to docs/tasks/done/, and update docs/tasks/000-progress.md. Invoked as /build {task_id}.
---

# Build

Takes one story from `docs/tasks/` and actually builds it — not just plans it. Every phase below
ends with something run and observed (a build, a lint, a test), not just written and assumed
correct — that discipline is why the rest of this repo's docs stay trustworthy, and it applies
here too.

## 1. Locate the story

`args` is the task id (e.g. `001`, `1`, or `001-scroll-parallax-images`). If empty, list the
files in `docs/tasks/` (excluding `done/` and `000-progress.md`) and ask which one.

- Zero-pad numeric ids to 3 digits and glob `docs/tasks/{###}-*.md`.
- If not found there, check `docs/tasks/done/{###}-*.md` — if it's already done, say so and ask
  whether the user wants to extend/rebuild it rather than silently redoing it.
- Read the story in full (Goal, Description — including its mermaid/ASCII — and every UAC). The
  UACs are the acceptance bar for step 5 and step 6; read them closely enough to test each one
  individually, not just skim for vibes.

For a story of any real size, use `TaskCreate` to track the phases below (backend / frontend /
tests / completion) so progress survives a long build and you don't lose track of what's left.

## 2. Scope the build

Decide what this specific story actually needs — don't force a phase that doesn't apply:

- **Backend?** New/changed API routes, schema changes, or business logic. Check
  [`docs/07-api-contract.md`](../../../docs/07-api-contract.md) — if existing endpoints already
  cover it, there's nothing to build here.
- **Frontend?** New component/page work, or wiring to a backend route.

Some stories are frontend-only (no backend surface at all — e.g. a pure visual/motion feature)
or backend-only. State plainly which phases apply before starting, rather than defaulting to
"do all three."

## 3. Backend first

If backend work is in scope, follow the conventions already established in `backend/` — don't
invent new ones:

- Schema changes go through `supabase/migrations/` SQL first, then `npx prisma db pull` +
  the `@map`/camelCase cleanup, per [`backend/README.md`](../../../backend/README.md#schema-changes)
  — not `prisma migrate`. Requires the local Supabase stack running (`supabase status` to check;
  `supabase start` if not).
- New modules follow the existing shape: NestJS module + controller + service + `dto/` with
  `class-validator` DTOs, `AdminGuard` on every admin route at the controller level, and the
  same `toPublic()`-style field-stripping pattern for anything public-facing that has
  admin-only fields (see `projects.service.ts` / `posts.service.ts`).
- **Update [`docs/07-api-contract.md`](../../../docs/07-api-contract.md)** for any new/changed
  endpoint — it must stay accurate to what's actually implemented, matching how every other doc
  in this repo is kept honest rather than aspirational.
- After writing the code: `npx nest build`, `npx eslint "src/**/*.ts"`, `npx tsc --noEmit -p
  tsconfig.build.json`. All three clean before moving on.

## 4. Frontend next

- Match [`docs/04-design-system.md`](../../../docs/04-design-system.md) — reuse existing
  primitives (`Reveal`, `SectionHeading`, etc.) and the established motion/color/type patterns
  rather than introducing new ones. Match the nearest existing page/component when unsure.
- Only wire to a real backend endpoint if this story specifically calls for it — the rest of the
  frontend is still on mock data (`frontend/src/data/content.ts`) as of this skill being
  written, and this story isn't the place to unilaterally migrate unrelated pages.
- After writing the code: `npm run build` (type-checks via `tsc -b` then builds) in `frontend/`,
  clean before moving on.

## 5. Playwright + unit tests

Two different kinds of test, both real:

- **Unit tests** — backend service-layer logic, using the Jest setup already configured in
  `backend/package.json` (`*.spec.ts` next to the file it tests, e.g.
  `projects.service.spec.ts`). Mock `PrismaService` — unit tests don't hit a real database, that's
  what Playwright is for. Only write these for logic with real branching worth isolating (e.g.
  the post `publishedAt`-set-once rule); don't write a unit test for a one-line pass-through.
  Run with `npm run test` in `backend/`.
- **Playwright** — drives the actual running app end to end, proving the story's UACs against
  reality. If `e2e/` doesn't exist yet at the repo root, set it up once:
  `npm init -y && npm install -D @playwright/test && npx playwright install chromium`, with a
  `playwright.config.ts` whose `webServer` array starts `frontend` (`npm run dev` in
  `frontend/`) and, if this story touched the backend, `backend` (`npm run start:dev` in
  `backend/` — requires `supabase start` already running, which `webServer` can't manage itself,
  so check/start Supabase before invoking Playwright, not as part of its config). Reuse this
  setup on every later `/build` run — don't recreate it.
  Write a spec per UAC (or a small group of closely-related ones) under `e2e/tests/`, driving
  real interactions (`page.goto`, `page.click`, `page.fill`) and asserting on real outcomes —
  not on internal state. Run with `npx playwright test --reporter=html,line`.

Report results honestly: how many passed, how many failed, and for any failure, whether it's a
real bug (go fix it, re-run) or a bad test (fix the test). Don't move on to step 6 with failing
tests still failing.

## 6. Completion — only after tests actually pass

- **Strike through confirmed UACs.** In the *original* story file (before moving it), wrap each
  UAC bullet that a passing test actually verified in `~~...~~` (markdown strikethrough). Leave
  any UAC that wasn't verified or doesn't pass un-struck, and add a short note under `## UACs`
  listing what's still outstanding and why — the moved file should honestly reflect reality, the
  same way `docs/05-user-stories.md` distinguishes Done/Partial/Not-started rather than
  rounding up.
- **Move only if fully done.** If every UAC is struck through, move the file to
  `docs/tasks/done/{###}-{slug}.md` (create `done/` if it doesn't exist). If any UAC remains
  open, leave the file in `docs/tasks/` as-is (with whatever got struck through) — moving a
  partially-done story into `done/` would misrepresent it.
- **Update `docs/tasks/000-progress.md`.** Create it if it doesn't exist yet, with a `##
  Changelog` section and a `## Remaining` section. Every run:
  - Prepend a new changelog entry (don't overwrite history) — date, task id + title, one-line
    summary of what was built, test result counts, and whether it moved to `done/` or stayed
    open (with why, if partial).
  - Fully regenerate the `## Remaining` section by listing every `docs/tasks/*.md` file that
    still exists outside `done/` (excluding `000-progress.md` itself) with its title — this
    section reflects current reality each time, not an accumulated manual list.

## 7. Report and ship

Tell the user, concretely:

- What was built (backend/frontend summary, one line each).
- Test results: unit test pass/fail counts, Playwright pass/fail counts.
- The Playwright report: run `npx playwright show-report` and give the local URL it serves on
  (typically `http://localhost:9323`) — say plainly that it's a local-only link, not a public one.
- Which UACs got struck through vs. remain open, and whether the story moved to `done/`.
- The `000-progress.md` update.

If everything built clean and all tests pass, run `./devops/deploy.sh` to commit and push —
matching how every other unit of work in this repo ships. Don't push if tests are failing.
