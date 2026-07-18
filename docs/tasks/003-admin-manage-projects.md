# Goal

As the site owner, I want to create, edit, publish/unpublish, and delete projects from the admin
dashboard, so that I can keep my portfolio current without a code deploy.

## Description

- **What it is:** a list view at `/admin/projects` (inside the dashboard shell from story `002`
  — depends on it) plus a create/edit form, giving full CRUD over the `Project` resource.
- **Backend is already built and verified** — this story is frontend-only. Endpoints per
  [`docs/07-api-contract.md`](../07-api-contract.md#4-projects): `GET /api/admin/projects` (all
  projects including drafts), `POST /api/admin/projects`, `PATCH /api/admin/projects/:id`,
  `DELETE /api/admin/projects/:id`. All four were exercised end to end against a real database
  when the backend was built — this story is the UI in front of them, not new business logic.
- **List view:** every project (draft and published), with a clear draft/published indicator and
  a featured indicator, edit and delete actions per row.
- **Form fields:** `slug` (locked/read-only when editing — the API rejects changing it, contract
  §4), `title`, `summary`, `problem`, `role`, `outcome`, `stack` (tag-style input for the string
  array), `imageUrl`, `repoUrl`, `demoUrl` (both optional), `featured` and `published` toggles.
- **Errors:** validation failures from the API (400, e.g. duplicate/malformed slug) surface
  inline against the relevant field, not as a generic toast.
- **Delete:** confirmation required before the `DELETE` call — this is destructive and
  irreversible.

```mermaid
flowchart TD
    List["/admin/projects — list (drafts + published)"] --> Action{Action}
    Action -->|Create| Form[Project form — empty]
    Action -->|Edit| FormEdit[Project form — prefilled, slug locked]
    Action -->|Delete| Confirm{Confirm delete?}
    Form --> Save["POST /api/admin/projects"]
    FormEdit --> SaveEdit["PATCH /api/admin/projects/:id"]
    Confirm -->|Yes| Del["DELETE /api/admin/projects/:id"]
    Confirm -->|No| List
    Save --> Result{201?}
    SaveEdit --> ResultEdit{200?}
    Result -->|Yes| List
    Result -->|No — 400| FieldError[Inline field error, e.g. duplicate slug]
    FieldError --> Form
    ResultEdit -->|Yes| List
    ResultEdit -->|No — 400| FieldErrorEdit[Inline field error]
    FieldErrorEdit --> FormEdit
    Del --> List
```

```text
  /admin/projects (list)                    Project form
  ┌────────────────────────────────┐        ┌──────────────────────────┐
  │ [+ New project]                │        │ Slug     [locked-on-edit]│
  │──────────────────────────────  │        │ Title    [____________] │
  │ ● Ledgerline      Published ★  │ [Edit] │ Summary  [____________] │
  │   [Delete]                     │ [Del]  │ Problem  [____________] │
  │──────────────────────────────  │        │ Role     [____________] │
  │ ○ New Draft        Draft       │ [Edit] │ Outcome  [____________] │
  │   [Delete]                     │ [Del]  │ Stack    [tag][tag][+]  │
  │──────────────────────────────  │        │ Image URL[____________] │
  │ ...                            │        │ Repo/Demo URL (optional)│
  │                                 │        │ [x] Featured [x] Publish│
  │                                 │        │        [ Save ]         │
  └────────────────────────────────┘        └──────────────────────────┘
```

## UACs

**Status: 3/6 fully confirmed. 3/6 blocked** by a pre-existing gap discovered while testing this
story, not something introduced by it: the public `/projects` page still renders from
`frontend/src/data/content.ts` mock data — it has never been wired to the real API (Epic 7.2,
[`docs/05-user-stories.md`](../05-user-stories.md) 7.2, still Not started). Every UAC below that
literally references "the public `/projects` page" or "the public site" can't be demonstrated
against the actual rendered page right now — asserting a draft "doesn't appear" there would be
vacuously true, since *nothing* admin-created appears there yet, published or not. Where that's
the case, `e2e/tests/003-admin-manage-projects.spec.ts` verifies the real, non-vacuous guarantee
instead — the public API (`GET /api/projects`) — which is exactly what the public page will
start reflecting automatically once Epic 7.2 lands, with zero further admin-side changes needed.
See `docs/tasks/000-progress.md` for the full note. This story is **not** moved to `done/` while
any UAC remains open.

- ~~Demo that `/admin/projects` lists every project including unpublished drafts, with a visible
  published/draft indicator per row.~~
- Demo that creating a new project with valid fields adds it to the list as a draft
  (`published: false`) by default, and it does **not** appear on the public `/projects` page.
  **Partially confirmed:** draft-by-default in the admin list, and exclusion from `GET
  /api/projects`, both verified. The public *page* claim is blocked (see note above).
- Demo that toggling `published` on an existing project makes it appear on the public
  `/projects` page immediately (no rebuild), and toggling it back off removes it from public
  view immediately. **Confirmed at the API level** (`GET /api/projects` reflects the toggle
  immediately, both directions) — the public *page* claim is blocked (see note above).
- ~~Demo that submitting a duplicate or malformed slug on create shows the exact validation error
  the API returns, not a generic failure message.~~
- ~~Demo that the slug field is locked/uneditable when editing an existing project, matching the
  API's immutable-slug rule.~~
- Demo that deleting a project requires a confirmation step, then removes it from both the admin
  list and the public site. **Partially confirmed:** confirmation step and removal from the
  admin list, and from `GET /api/projects`, both verified. The public *site* claim is blocked
  (see note above).
