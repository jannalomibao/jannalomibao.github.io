# Backend

NestJS API for the portfolio. See the [root README](../README.md) for the whole project, and
[`docs/06-architecture-infrastructure.md`](../docs/06-architecture-infrastructure.md) /
[`docs/07-api-contract.md`](../docs/07-api-contract.md) for the design this implements.

**Status:** public read routes, admin auth, admin CRUD for projects/posts/resume, and contact
(public submit + admin management) are all built — architecture doc §11 steps 1–6, all except
resume PDF upload (`POST /api/admin/resume/pdf` — needs Supabase Storage integration, not done)
and real email delivery on new contact submissions (currently logs a stub instead of calling a
provider). Nothing here is wired to the frontend yet (still on mock data — Epic 7.2).

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

## Admin auth

There's exactly one admin account, created directly in Supabase Auth (no sign-up flow anywhere
in the app). Locally:

```bash
# 1. Create the owner account (once). Uses the local service_role key from `supabase status`.
curl -X POST "http://127.0.0.1:54321/auth/v1/admin/users" \
  -H "apikey: <SERVICE_ROLE_KEY>" -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@local.dev","password":"<pick one>","email_confirm":true}'
# Response includes "id" — that's ADMIN_USER_ID. Put it in .env.

# 2. Get a bearer token to test admin routes with:
curl -X POST "http://127.0.0.1:54321/auth/v1/token?grant_type=password" \
  -H "apikey: <ANON_KEY>" -H "Content-Type: application/json" \
  -d '{"email":"owner@local.dev","password":"<what you picked>"}'
# Use the "access_token" field: -H "Authorization: Bearer <token>"
```

`AdminGuard` (`src/auth/admin.guard.ts`) verifies the token against Supabase's JWKS endpoint
and checks the `sub` claim matches `ADMIN_USER_ID` exactly — not a role system, since there's
only ever one admin (PRD non-goal: no multi-author support).

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
- **Admin tokens are verified via JWKS (asymmetric ES256), not a shared JWT secret.** This was
  wrong in an earlier version of this guard — it assumed the legacy shared-secret scheme, which
  failed against a real locally-issued token the first time it was actually tested. Confirmed by
  decoding a real token's header (`alg: ES256`, has a `kid`) rather than assumed from docs.
- **`docker compose up` needs `ADMIN_USER_ID` set** (root `.env`, since Docker Compose auto-loads
  one) and uses `SUPABASE_URL=http://host.docker.internal:54321`, not `127.0.0.1` — same
  container-networking reasoning as `DATABASE_URL`. Missing `ADMIN_USER_ID` fails fast at
  `docker compose up` with a clear message instead of a 500 the first time an admin route is hit.
