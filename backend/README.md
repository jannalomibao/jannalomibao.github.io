# Backend

NestJS API for the portfolio. See the [root README](../README.md) for the whole project, and
[`docs/06-architecture-infrastructure.md`](../docs/06-architecture-infrastructure.md) /
[`docs/07-api-contract.md`](../docs/07-api-contract.md) for the design this implements.

**Status:** public read routes only (`GET /api/projects`, `/api/projects/:slug`, `/api/posts`,
`/api/posts/:slug`, `/api/resume`, `/api/resume/pdf`) — architecture doc §11 steps 1–2. Admin
auth/CRUD and the contact endpoint (steps 4–6) aren't built yet.

## Local setup

Requires Docker (for the local Supabase stack) and Node 20+.

```bash
# 1. One-time / once per machine reboot: start local Supabase (Postgres, Auth,
#    Storage, Studio) — this is its own Docker Compose stack, run via the CLI.
supabase start

# 2. Point this app at it.
cp .env.example .env   # already defaults to the local Supabase URL supabase start prints

# 3. Install deps, generate the Prisma client, run it.
npm install
npx prisma generate
npm run start:dev      # http://localhost:3000/api
```

Stop the Supabase stack with `supabase stop` when you're done (it keeps running across
terminal sessions until you do).

### Or via Docker Compose

From the repo root, with `supabase start` already running:

```bash
docker compose up --build
```

Runs both `frontend` (`:5173`) and `backend` (`:3000`) in containers, pointed at the local
Supabase stack via `host.docker.internal`. See the root [`docker-compose.yml`](../docker-compose.yml).

## Schema changes

The SQL migrations in [`../supabase/migrations/`](../supabase/migrations/) are the source of
truth for the schema — not `prisma migrate`. To change the schema:

1. `supabase migration new <description>` — creates a new empty SQL file.
2. Write the SQL by hand.
3. `supabase db reset` (local only — replays all migrations from scratch) or `supabase start`
   again if already stopped, to apply it.
4. `npx prisma db pull` — introspects the new schema back into `prisma/schema.prisma`.
5. Re-apply the `@map`/camelCase cleanup by hand (introspection writes snake_case; see the
   comment at the top of `prisma/schema.prisma` for the convention) and `npx prisma generate`.

This order (SQL first, Prisma introspects second) is deliberate — see architecture doc §6 for
why NestJS/SQL owns the schema instead of Prisma's own migration flow.

## Gotchas

- **Compiled entry point is `dist/src/main.js`, not `dist/main.js`.** `nest build` preserves
  the `src/` nesting inside `dist/`. The `Dockerfile`'s `CMD` already accounts for this —
  don't "simplify" it back to `dist/main.js` without checking, it'll break silently in a way
  that only shows up as a container that immediately exits.
- **Prisma Client has no custom `output` path.** It's generated to the default
  `node_modules/@prisma/client` deliberately — a custom output directory broke at runtime
  because `tsc`'s `dist/` nesting doesn't preserve the same relative distance back to it that
  exists in `src/`. Package-style resolution (`@prisma/client`) sidesteps that entirely.
- **Generator is `prisma-client-js`, not the newer `prisma-client`.** The newer generator emits
  ESM (`import.meta.url`, top-level `import`), which doesn't interoperate cleanly with this
  project's CommonJS NestJS setup.
- **Public routes strip `published`/draft fields entirely** (not just `false`) — see
  `toPublic()` in `projects.service.ts`/`posts.service.ts`, and the reasoning in
  `docs/07-api-contract.md` §3 (never let an unauthenticated caller learn a draft exists).
