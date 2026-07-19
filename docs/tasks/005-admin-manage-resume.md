# Goal

As the site owner, I want to edit my resume's summary, experience, education, and skills from
the admin dashboard, so that my public Resume page stays current without a code change.

## Description

- **What it is:** a single edit form at `/admin/resume` (inside the dashboard shell from story
  `002`) — there's no list view, since `resume` is a single-row resource (one owner, one
  resume).
- **Backend is already built and verified for the text fields** — `PATCH /api/admin/resume`
  (contract §6) accepts `summary`, `experience[]`, `education[]`, `skills[]`, with nested
  validation on each experience/education entry's shape. That part of this story is
  frontend-only.
- **Explicitly out of scope: PDF upload.** `POST /api/admin/resume/pdf` is **not built yet** — it
  needs Supabase Storage integration that hasn't happened
  ([`docs/05-user-stories.md`](../05-user-stories.md) 4.2 status). This story's form edits the
  on-page resume data only. Don't build an upload control against an endpoint that doesn't
  exist — if the form wants to acknowledge the PDF at all, a disabled "Upload PDF (coming soon)"
  affordance is the honest way to do it, not a functional-looking button that 404s.
- **Form shape:**
  - `summary` — a textarea.
  - `experience[]` — repeatable rows (role, org, period, points[] as a multi-line or tag-style
    list), with add/remove controls.
  - `education[]` — repeatable rows (school, credential, period), add/remove.
  - `skills[]` — tag-style input, same pattern as `stack` on the Projects form (story `003`) —
    reuse that component rather than building a second tag input.
- **Errors:** the API validates each experience/education entry's shape — surface which specific
  row/field failed, not just "invalid request."

```mermaid
flowchart TD
    Load["/admin/resume loads current data\nGET /api/admin/resume"] --> Edit[Owner edits summary/\nexperience/education/skills]
    Edit --> AddRemove{Add or remove\nan experience/education row?}
    AddRemove -->|Add| NewRow[New empty row appended]
    AddRemove -->|Remove| DropRow[Row removed from form state]
    NewRow --> Edit
    DropRow --> Edit
    Edit --> Save["PATCH /api/admin/resume"]
    Save --> Result{200?}
    Result -->|Yes| Confirm[Saved — public /resume\nreflects it immediately]
    Result -->|No — 400| RowError[Inline error on the\nspecific failing row/field]
    RowError --> Edit
```

```text
  /admin/resume
  ┌────────────────────────────────────────────────────┐
  │ Summary                                             │
  │ [________________________________________________] │
  │                                                      │
  │ Experience                              [+ Add row] │
  │ ┌──────────────────────────────────────────┐ [x]    │
  │ │ Role [______] Org [______] Period [_____] │        │
  │ │ Points: [•] [•] [•] [+]                   │        │
  │ └──────────────────────────────────────────┘        │
  │                                                      │
  │ Education                               [+ Add row] │
  │ ┌──────────────────────────────────────────┐ [x]    │
  │ │ School [____] Credential [____] Period [_]│        │
  │ └──────────────────────────────────────────┘        │
  │                                                      │
  │ Skills  [tag][tag][tag][+]                          │
  │                                                      │
  │ PDF: (coming soon — upload not built yet)           │
  │                                          [ Save ]    │
  └────────────────────────────────────────────────────┘
```

## UACs

**Status: 2/5 fully confirmed. 3/5 blocked, for two different reasons:**

1. **Epic 7.2 (same recurring gap as `003`/`004`):** the public `/resume` page also still
   renders from mock data — confirmed directly (`frontend/src/pages/Resume.tsx` imports from
   `@/data/content`, no API call). UACs 2 and 3 below hit this.
2. **A genuinely different, new finding for UAC 4:** the backend's `ResumeExperienceDto`/
   `ResumeEducationDto` (`backend/src/resume/dto/update-resume.dto.ts`) only validate *type*
   (`@IsString()`), not *presence*. Confirmed directly against both shapes: `{"role":"Dev"}`
   (org/period/points **omitted**) → `400` with a row-specific message; `{"role":"","org":"",
   "period":"","points":[]}` (fields present but **empty**) → `200`, silently accepted. The
   admin form's controlled inputs always send a string (new rows default to `""`), never omit a
   key — so this validation path, while real and working, is unreachable through the form as
   built. Not fixed here — loosening/tightening those DTOs is backend work this frontend-only
   story doesn't own. See `e2e/tests/005-admin-manage-resume.spec.ts`'s UAC 4 test for both
   curl-equivalent checks.

Not moved to `done/` while any UAC is open.

- ~~Demo that `/admin/resume` loads pre-filled with the current summary, experience, education,
  and skills from the API.~~
- Demo that adding an experience row, filling it in, and saving persists it — the public
  `/resume` page reflects the new entry immediately. **Confirmed at the API level** (`GET
  /api/resume` reflects the new row) — the public *page* claim is blocked (Epic 7.2, see above).
- Demo that removing an experience or education row and saving actually removes it from the
  public page too, not just the form. **Confirmed at the API level** — the public *page* claim
  is blocked (Epic 7.2, see above).
- Demo that submitting an incomplete experience/education row (e.g. missing `role`) shows the
  validation error against that specific row, not a generic failure. **Blocked** — see finding
  #2 above. The validation *exists and works* for omitted fields; the form just never produces
  that shape, so a user can never actually trigger it today.
- ~~Demo that there is no functional PDF upload control — either it's absent entirely or clearly
  marked as not yet available, and nothing on this screen implies the PDF can be changed today.~~
