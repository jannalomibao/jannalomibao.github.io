# Seed Data — Step by Step

How to populate this project's Supabase database with data, instead of clicking through the
admin UI one row at a time. Written against what's actually in this repo today — not generic
Supabase docs.

## 0. Where this fits

- **Only the local dev Supabase stack exists right now.** Per
  [`docs/06-architecture-infrastructure.md`](06-architecture-infrastructure.md) §8, production
  is planned to run on Supabase Cloud + a container host for the backend, but neither has been
  provisioned yet (`devops/` only has the frontend's GitHub Pages deploy). So everything below
  is about seeding **local dev** — §7 covers what changes once production exists.
- **Seed data ≠ what visitors see yet.** The public pages (`Projects.tsx`, `Blog.tsx`,
  `Resume.tsx`) still render from `frontend/src/data/content.ts` mock data, not the API — that's
  the tracked "Epic 7.2" gap (see `docs/tasks/000-progress.md`). Seeding populates the database
  and the API layer underneath it; it's what the **admin UI** and any future Epic 7.2 work will
  read from, not an immediate visible change on the live site.
- **Four tables to seed**, per `backend/prisma/schema.prisma`: `projects`, `posts`, `resume`
  (a single row, not a list), `contact_submissions` (usually left empty — these come from real
  visitors, not seed data).

## 1. Decide your source content

`frontend/src/data/content.ts` already has realistically-shaped placeholder projects, posts, and
a resume — written in the same shape the backend expects. Two options:

- **Reuse it as-is** for local dev seed data, so what you see in the admin UI matches what's
  already on the (still-mock-data) public site. Fastest to get going.
- **Replace it with your real content** now, and use *that* as the seed source instead — if
  you're going to write real projects/resume content at some point, doing it once here (as SQL)
  and treating it as the source of truth going forward is less duplicated effort than writing it
  twice (once in `content.ts`, again later as seed data).

Either way, the seed file's `INSERT` values are just hand-written SQL — there's no
transformation step, so decide the content before writing step 2.

**Filling in real content:** [`supabase/seed-content.yaml`](../supabase/seed-content.yaml) is a
fill-in-the-blanks template for exactly this — profile, resume, projects, and posts as plain
YAML instead of SQL, with inline notes on every field. Fill it in, hand it back, and it gets
converted into `supabase/seed.sql` (step 3) — easier than writing multi-line `INSERT` strings by
hand, especially for prose fields like `problem`/`outcome`/`content`.

## 2. Confirm the local Supabase stack is running

```bash
supabase status
```

If it's not running: `supabase start` (from the repo root — this is the Docker Compose stack
described in `backend/README.md`).

## 3. Create `supabase/seed.sql`

`supabase/config.toml` already points at this exact path:

```toml
[db.seed]
sql_paths = ["./seed.sql"]
```

So the file just needs to exist at `supabase/seed.sql` — no config changes needed. Write plain
SQL `INSERT`s matching the real column names (snake_case — `prisma/schema.prisma`'s `@map`
comments show the camelCase → snake_case mapping if you want to cross-check).

```sql
-- supabase/seed.sql
-- Local dev seed data. Re-run safe: ON CONFLICT clauses make this idempotent
-- so `supabase db reset` (which replays this every time) never duplicates
-- rows or errors on a second run.

insert into projects (slug, title, summary, problem, role, outcome, stack, image_url, repo_url, demo_url, featured, published)
values (
  'ledgerline',
  'Ledgerline',
  'A short one-line summary of the project.',
  'What problem this project solved.',
  'Your role on it.',
  'The measurable outcome.',
  array['TypeScript', 'React', 'NestJS'],
  'https://images.unsplash.com/photo-...',
  'https://github.com/you/ledgerline',
  'https://ledgerline.example.com',
  true,   -- featured
  true    -- published
)
on conflict (slug) do nothing;

-- Repeat the insert above for each project, one statement per row.

insert into posts (slug, title, excerpt, content, image_url, read_minutes, published, published_at)
values (
  'how-i-built-ledgerline',
  'How I Built Ledgerline',
  'A short excerpt.',
  'Full post body — markdown or plain text, whatever the frontend renders.',
  'https://images.unsplash.com/photo-...',
  5,
  true,
  now()
)
on conflict (slug) do nothing;

-- resume is a SINGLE row — insert once, update in place on re-seed rather
-- than inserting a second row (there's no unique slug to key off, so this
-- uses "insert only if the table's empty" instead of ON CONFLICT).
insert into resume (summary, experience, education, skills)
select
  'A short professional summary.',
  '[{"role":"Software Developer","org":"Company","period":"2023–Present","points":["Did a thing.","Did another thing."]}]'::jsonb,
  '[{"school":"University","credential":"B.S. Computer Science","period":"2019–2023"}]'::jsonb,
  array['TypeScript', 'React', 'NestJS', 'PostgreSQL']
where not exists (select 1 from resume);
```

Notes specific to this schema:

- `experience`/`education` are `Json` columns (`ResumeExperienceDto`/`ResumeEducationDto` in
  `backend/src/resume/dto/update-resume.dto.ts` define the expected shape per entry) — cast the
  literal with `::jsonb`, and keep every object key present (even if you'd leave it blank), since
  `docs/tasks/005-admin-manage-resume.md` found the DTOs validate *type* but not *presence*.
  Omitting a key entirely will only matter through the admin API, not raw SQL, but matching the
  real shape avoids surprises later.
- `stack`/`skills` are Postgres `text[]` — use `array['a', 'b']` literal syntax, not JSON arrays.
- Leave `contact_submissions` unseeded unless you specifically need test rows — see
  `e2e/tests/006-admin-manage-messages.spec.ts` for how that story seeds/cleans up test rows via
  direct SQL if you need a pattern to copy for one-off manual testing.

## 4. Apply it

Two ways, depending on whether you want a full reset or an incremental add:

**Full reset (replays every migration + this seed file from scratch — destroys existing local
data):**

```bash
supabase db reset
```

**Just run the seed file against the current DB, without touching migrations or existing rows:**

```bash
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -f supabase/seed.sql
```

(That connection string is `supabase status`'s `DB_URL` — same one `backend/.env`'s
`DATABASE_URL` points at.) This is the safer option once you've already got other manually-added
data locally you don't want to lose — the `ON CONFLICT`/`where not exists` guards make it
re-runnable either way.

## 5. Verify

```bash
# Backend must be running: npm run start:dev in backend/ (requires supabase start already up)
curl http://localhost:3000/api/projects
curl http://localhost:3000/api/posts
curl http://localhost:3000/api/resume
```

Or visually: Supabase Studio at `http://127.0.0.1:54323` (from `supabase status`'s
`STUDIO_URL`) → Table Editor, or the admin UI itself at `http://localhost:5173/admin` (log in,
per `backend/README.md`'s "Admin auth" section if you haven't created the owner account yet).

## 6. Keep it in sync going forward

`supabase/seed.sql` is a real file in the repo, so treat it like the migrations next to it — if
you add a project through the admin UI that you want to survive a `supabase db reset`, add the
matching `INSERT` here too (or don't, if it's genuinely disposable test data — that's a
legitimate reason to leave the UI-added row out of the seed file).

## 7. Production, later

Not applicable yet (see §0), but for when a production Supabase Cloud project and deployed
backend exist: the same `supabase/seed.sql` can run against it with
`psql "<production DB_URL>" -f supabase/seed.sql`, or `supabase db push --linked` includes seed
data if configured to. Realistically, production content is probably better entered once through
the admin UI at that point rather than replayed from a seed file meant for disposable local
data — worth deciding at the time rather than assuming this file's local-dev content ships as-is.
