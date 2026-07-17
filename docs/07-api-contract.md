# API Contract — Portfolio Backend

Related: [Architecture & Infrastructure](06-architecture-infrastructure.md#4-api-surface) ·
[User Stories](05-user-stories.md)

This is the binding request/response spec for `backend/` (not yet built — see the architecture
doc's [sequencing plan](06-architecture-infrastructure.md#11-sequencing)). The architecture doc
lists *what* endpoints exist; this doc defines exactly what each one accepts and returns, so the
frontend integration (User Story 7.2) and the backend implementation can be built against the
same contract independently.

## 1. Conventions

- **Base URL:** `/api` (e.g. `https://api.jannalomibao.dev/api/projects` — actual host TBD when
  the backend is deployed per architecture doc §8).
- **Content type:** `application/json` for all requests and responses. No form-encoded bodies.
- **Auth header:** Admin routes require `Authorization: Bearer <supabase-jwt>`. Public routes
  ignore this header entirely if present.
- **Timestamps:** ISO 8601 UTC strings (`"2026-07-18T09:00:00.000Z"`), matching Postgres
  `timestamptz` serialized by the ORM — never a Unix epoch number.
- **IDs:** UUIDv4 strings. Slugs are separate, human-readable, URL-safe identifiers used for
  public-facing routes (`/api/projects/:slug`), never the UUID.
- **No pagination in v1:** every list endpoint returns the full set. At this project's actual
  scale (a personal portfolio's project/post count), paginating is premature — add it if/when a
  list realistically grows past what one response should carry.
- **CORS:** responses only allow the deployed frontend origin (architecture doc §8) — not
  relevant to the contract itself, but every example below assumes a browser request from that
  origin.

## 2. Error Format

Every non-2xx response uses this shape (NestJS's default `HttpException` format — deliberately
not a custom envelope):

```json
{
  "statusCode": 404,
  "message": "Project not found",
  "error": "Not Found"
}
```

For validation failures (400), `message` is an array of per-field problems instead of a single
string:

```json
{
  "statusCode": 400,
  "message": [
    "email must be a valid email address",
    "message should not be empty"
  ],
  "error": "Bad Request"
}
```

| Status | Meaning | When |
|---|---|---|
| `400` | Bad Request | Validation failure on the request body/params. |
| `401` | Unauthorized | Missing or invalid/expired bearer token on an admin route. |
| `403` | Forbidden | Valid token, but the token's `sub` doesn't match the one known owner user ID. |
| `404` | Not Found | Slug/ID doesn't exist, or (public routes) exists but isn't published. |
| `429` | Too Many Requests | Rate limit exceeded on `POST /api/contact` (see §6.1). |
| `500` | Internal Server Error | Unhandled failure — never leaks internals in `message`. |

**Note on 404 vs 403 for unpublished content:** a public request for an unpublished/draft
project or post returns `404`, not `403` or a "this exists but isn't published" message —
otherwise the response itself would leak the existence and slug of unpublished draft content to
an unauthenticated caller.

## 3. Resource Schemas

TypeScript shapes as returned by the API (camelCase in JSON; the architecture doc's table names
are `snake_case` Postgres columns — the ORM layer maps between them, not the contract's concern).

```typescript
interface Project {
  id: string;              // UUID
  slug: string;             // unique, kebab-case, immutable after creation
  title: string;
  summary: string;
  problem: string;
  role: string;
  outcome: string;
  stack: string[];
  imageUrl: string;
  repoUrl: string | null;
  demoUrl: string | null;
  featured: boolean;
  published: boolean;       // admin responses only — see §4
  createdAt: string;        // ISO 8601
  updatedAt: string;
}

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;          // plain text/markdown source — see architecture doc §3 note on content model
  imageUrl: string;
  readMinutes: number;
  published: boolean;       // admin responses only
  publishedAt: string | null; // set on first publish, null while draft
  createdAt: string;
  updatedAt: string;
}

interface Resume {
  id: string;
  summary: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: string[];
  pdfUrl: string | null;    // null until first PDF upload
  updatedAt: string;
}

interface ResumeExperience {
  role: string;
  org: string;
  period: string;           // free-text, e.g. "2023 — Present" (matches existing frontend mock shape)
  points: string[];
}

interface ResumeEducation {
  school: string;
  credential: string;
  period: string;
}

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  status: "unread" | "read" | "archived";
  createdAt: string;
}
```

`Project.published` and `Post.published` are **omitted entirely** (not just `false`) from public
route responses — public callers have no legitimate use for that field, and omitting it removes
any chance of a frontend bug that conditionally renders based on a field it should never see.

## 4. Projects

### `GET /api/projects` — Public

Returns all published projects, most-recently-updated first.

**Response `200`:**
```json
[
  {
    "id": "b1e2...",
    "slug": "ledgerline",
    "title": "Ledgerline",
    "summary": "A self-hosted expense tracker with shared household budgets.",
    "problem": "...",
    "role": "...",
    "outcome": "...",
    "stack": ["React", "NestJS", "PostgreSQL", "Docker"],
    "imageUrl": "https://...",
    "repoUrl": "https://github.com/...",
    "demoUrl": "https://...",
    "featured": true,
    "createdAt": "2026-01-10T00:00:00.000Z",
    "updatedAt": "2026-06-01T00:00:00.000Z"
  }
]
```

### `GET /api/projects/:slug` — Public

**Response `200`:** single `Project` object (shape above).
**Response `404`:** slug doesn't exist, or exists but `published: false`.

### `GET /api/admin/projects` — Admin

Same as the public list, but includes unpublished/draft projects and the `published` field.

**Response `200`:** `Project[]`, all rows regardless of `published`, includes `published` field.

### `POST /api/admin/projects` — Admin

**Request body:**
```json
{
  "slug": "new-project",
  "title": "New Project",
  "summary": "One-line summary.",
  "problem": "...",
  "role": "...",
  "outcome": "...",
  "stack": ["React"],
  "imageUrl": "https://...",
  "repoUrl": null,
  "demoUrl": null,
  "featured": false,
  "published": false
}
```

**Validation:**
- `slug`: required, unique, lowercase kebab-case (`^[a-z0-9]+(-[a-z0-9]+)*$`) — `400` on
  duplicate or malformed.
- `title`, `summary`, `problem`, `role`, `outcome`, `imageUrl`: required, non-empty.
- `stack`: required array, at least one entry.
- `repoUrl`, `demoUrl`: optional, must be valid URLs if present.
- `featured`, `published`: optional booleans, default `false`.

**Response `201`:** the created `Project`, including generated `id`/`createdAt`/`updatedAt`.
**Response `400`:** validation failure (see §2 format).

### `PATCH /api/admin/projects/:id` — Admin

Partial update — any subset of the `POST` body's fields except `slug`, which is immutable after
creation (changing it would break any external links already pointing at the old slug — if a
slug genuinely needs to change, that's a delete-and-recreate, a deliberate choice not an
oversight).

**Response `200`:** the updated `Project`.
**Response `404`:** `id` doesn't exist.
**Response `400`:** validation failure, or a `slug` field present in the body (rejected, not
silently ignored — an admin trying to change a slug should get an explicit error, not silent
no-op behavior that looks like it worked).

### `DELETE /api/admin/projects/:id` — Admin

**Response `204`:** no body.
**Response `404`:** `id` doesn't exist.

## 5. Posts

Same shape of endpoints as Projects, with post-specific fields and one extra rule:

### `GET /api/posts` — Public
**Response `200`:** published `Post[]`, newest `publishedAt` first.

### `GET /api/posts/:slug` — Public
**Response `200`:** single `Post`. **`404`:** missing or unpublished.

### `GET /api/admin/posts` — Admin
**Response `200`:** all `Post[]` including drafts, includes `published`/`publishedAt`.

### `POST /api/admin/posts` — Admin
**Request body:** same field set as `Post` minus `id`/timestamps/`publishedAt` (server-set).
**Validation:** `slug`/`title`/`excerpt`/`content`/`imageUrl` required; `slug` unique
kebab-case; `readMinutes` required positive integer.
**Response `201`:** created `Post`, `publishedAt: null` (drafts are never published on create —
publishing is an explicit separate action, see next).

### `PATCH /api/admin/posts/:id` — Admin
Partial update, `slug` immutable (same rule as Projects). **Publishing rule:** if the request
body flips `published` from `false` → `true` and `publishedAt` is currently `null`, the server
sets `publishedAt` to the current time — the client never sends `publishedAt` directly. Flipping
`published` back to `false` (unpublish) does **not** clear `publishedAt`, so re-publishing later
doesn't fabricate a new "original" publish date.

**Response `200`:** updated `Post`. **`404`:** missing. **`400`:** validation failure or `slug`/
`publishedAt` present in body.

### `DELETE /api/admin/posts/:id` — Admin
**Response `204`. `404`:** missing.

## 6. Resume

Single-row resource — no `:id` in any route, there is exactly one resume record.

### `GET /api/resume` — Public
**Response `200`:** the `Resume` object. **`404`:** only possible if the row genuinely doesn't
exist yet (e.g. fresh database before the owner has entered anything) — the frontend should
treat this as "resume not yet published" and degrade gracefully, not crash.

### `GET /api/resume/pdf` — Public
**Response `302`:** redirect to a time-limited signed Supabase Storage URL for the current PDF.
**Response `404`:** `pdfUrl` is `null` (no PDF uploaded yet).

### `PATCH /api/admin/resume` — Admin
**Request body:** any subset of `{ summary, experience, education, skills }` (`pdfUrl` excluded
— set only via the dedicated upload route below).
**Validation:** `experience[]`/`education[]` entries must match the `ResumeExperience`/
`ResumeEducation` shapes if provided; `skills` must be a string array.
**Response `200`:** updated `Resume`.

### `POST /api/admin/resume/pdf` — Admin
**Request:** `multipart/form-data`, single field `file`, PDF only.
**Validation:** `Content-Type` of the uploaded file must be `application/pdf`; max size 10MB —
`400` otherwise.
**Response `200`:** `{ "pdfUrl": "https://..." }` — the newly stored file's public/signed URL,
also persisted onto the `Resume` row.

## 7. Contact

### `POST /api/contact` — Public, rate-limited

**Request body:**
```json
{ "name": "Jane Recruiter", "email": "jane@company.com", "message": "Loved your portfolio..." }
```

**Validation:**
- `name`: required, 1–200 chars.
- `email`: required, valid email format.
- `message`: required, 1–5000 chars.

**Response `201`:** `{ "id": "...", "createdAt": "..." }` — deliberately minimal; the caller
gets confirmation a submission was recorded, not the full row (no reason to echo their own
input back, and it keeps the response shape stable regardless of internal fields added later).

**Response `400`:** validation failure.

**Response `429`:** rate limit exceeded — see §7.1.

**Side effect (not part of the response contract, but load-bearing):** on success, the backend
triggers an email notification to the owner (architecture doc §8). If the email provider call
fails, the submission is still saved and `201` is still returned — email delivery is
best-effort and must never make a real, successfully-saved submission look like it failed to
the visitor who sent it.

### 7.1 Rate limiting

`POST /api/contact` is the one public write endpoint with no auth in front of it, so it's the
one that needs its own guard: **5 requests per IP per hour**. Exceeding it returns `429` with
the standard error format and a `Retry-After` header (seconds until the window resets). This
number is a starting point, not tuned from real traffic — revisit once the form is live if it
turns out too strict (legitimate retries after a typo) or too loose.

### `GET /api/admin/contact` — Admin

**Query params:** `?status=unread|read|archived` (optional — omit for all statuses).
**Response `200`:** `ContactSubmission[]`, newest first.

### `PATCH /api/admin/contact/:id` — Admin

**Request body:** `{ "status": "read" | "archived" }` — `unread` is not a valid value to set
via this route (it's the initial state on creation only; there's no supported "mark unread
again" flow in v1).
**Response `200`:** updated `ContactSubmission`.
**Response `404`:** `id` doesn't exist.
**Response `400`:** `status` missing or not one of `read`/`archived`.

## 8. What's deliberately out of scope for v1

- **No bulk operations** (bulk delete, bulk publish) — the admin dashboard manages one resource
  at a time per the user stories; add if that becomes a real workflow pain.
- **No partial/field-selection queries** (e.g. `?fields=title,slug`) — response payloads are
  small enough at this project's scale that it isn't worth the API surface.
- **No webhooks/real-time** — the admin dashboard polls or simply re-fetches after a mutation;
  there's exactly one user, so there's no multi-client sync problem to solve.
