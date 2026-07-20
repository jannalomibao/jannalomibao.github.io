import { test, expect, type Page } from "@playwright/test";

// Maps to docs/tasks/005-admin-manage-resume.md's UACs.
//
// UNIQUE CONCURRENCY CONCERN FOR THIS FILE: unlike projects/posts (one row
// per test, isolated by a unique slug), `resume` is a single shared row.
// Saving replaces the whole experience/education arrays, so two tests
// racing a save concurrently is a genuine read-modify-write hazard (one
// test's save can silently clobber another's just-added row), not a
// hypothetical. Mitigated two ways: (1) restricted to the `chromium`
// project only — skipped on `mobile-chromium` below, since running both
// would let two full copies of this file's saves interleave; (2) `serial`
// mode within that one project/worker so tests in this file never overlap
// each other either. Every other spec file is unaffected (different
// resources, no shared-row hazard) and keeps running both projects.
test.describe.configure({ mode: "serial" });

const OWNER_EMAIL = "owner@local.dev";
const OWNER_PASSWORD = "local-dev-password-123";
const API_URL = "http://localhost:3000/api";

test.beforeEach(async ({}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "single shared row — see file header comment");
});

async function login(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(OWNER_EMAIL);
  await page.getByLabel("Password").fill(OWNER_PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL(/\/admin\/?$/);
}

function uniqueMarker(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

async function getApiResume(page: Page) {
  const res = await page.request.get(`${API_URL}/resume`);
  return res.json();
}

// UPDATE: Epic 7.2 shipped (docs/tasks/done/007-public-pages-real-data.md)
// — the public /resume page now fetches from the real API. See
// 003-admin-manage-projects.spec.ts's identical helper for why the
// skeleton-gone wait matters (page.goto() doesn't wait for the async fetch).
async function expectRoleOnPublicResumePage(page: Page, role: string, expected: boolean) {
  await page.goto("/resume");
  await expect(page.locator(".animate-pulse").first()).toHaveCount(0);
  if (expected) {
    await expect(page.getByText(role)).toBeVisible();
  } else {
    await expect(page.getByText(role)).toHaveCount(0);
  }
}

test("Form loads pre-filled from the API (UAC 1)", async ({ page }) => {
  await login(page);

  const current = await getApiResume(page);
  await page.goto("/admin/resume");

  await expect(page.locator("#summary")).toHaveValue(current.summary);
});

test("Adding an experience row and saving persists it on the public page (UAC 2)", async ({
  page,
}) => {
  await login(page);
  const marker = uniqueMarker("uac2-role");
  // Capture the real pre-test experience so cleanup can restore exactly
  // this, not wipe it — resume is real seeded content now (docs/08-seed-
  // data.md), not disposable mock data, so this test must leave it exactly
  // as it found it, not just remove its own marker.
  const original = await getApiResume(page);

  await page.goto("/admin/resume");
  await page.getByRole("button", { name: "Add row" }).first().click();

  const rows = page.locator('[aria-label^="Experience"][aria-label$="role"]');
  const lastIndex = (await rows.count()) - 1;
  await rows.nth(lastIndex).fill(marker);
  await page
    .locator('[aria-label^="Experience"][aria-label$="org"]')
    .nth(lastIndex)
    .fill("Test Org");
  await page
    .locator('[aria-label^="Experience"][aria-label$="period"]')
    .nth(lastIndex)
    .fill("2020-2021");

  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("status")).toBeVisible();

  const resume = await getApiResume(page);
  expect(
    resume.experience.some((row: { role: string }) => row.role === marker),
  ).toBe(true);

  await expectRoleOnPublicResumePage(page, marker, true);

  await page.request.patch(`${API_URL}/admin/resume`, {
    headers: { Authorization: `Bearer ${await getToken(page)}` },
    data: { experience: original.experience },
  });
});

test("Removing a row and saving actually removes it from the public page (UAC 3)", async ({
  page,
}) => {
  await login(page);
  const marker = uniqueMarker("uac3-role");

  // Add a uniquely-marked row first.
  await page.goto("/admin/resume");
  await page.getByRole("button", { name: "Add row" }).first().click();
  let rows = page.locator('[aria-label^="Experience"][aria-label$="role"]');
  let lastIndex = (await rows.count()) - 1;
  await rows.nth(lastIndex).fill(marker);
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("status")).toBeVisible();

  let resume = await getApiResume(page);
  expect(resume.experience.some((row: { role: string }) => row.role === marker)).toBe(true);
  await expectRoleOnPublicResumePage(page, marker, true);

  // Now remove it.
  await page.goto("/admin/resume");
  rows = page.locator('[aria-label^="Experience"][aria-label$="role"]');
  // goto() doesn't wait for the form's async GET /api/resume fetch to
  // populate — without this, evaluateAll can snapshot the DOM while it's
  // still showing "Loading…" (zero row inputs), well before the test
  // timeout would ever catch it as a hang.
  await expect(rows.first()).toBeVisible();
  const rowIndex = await rows.evaluateAll(
    (els, m) => els.findIndex((el) => (el as HTMLInputElement).value === m),
    marker,
  );
  await page.getByRole("button", { name: `Remove experience row ${rowIndex + 1}` }).click();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("status")).toBeVisible();

  resume = await getApiResume(page);
  expect(resume.experience.some((row: { role: string }) => row.role === marker)).toBe(false);
  await expectRoleOnPublicResumePage(page, marker, false);
});

// UAC 4, as literally written ("submitting an incomplete row... shows the
// validation error"), turned out not to be reachable through the actual
// admin form — a real finding, not a test bug, discovered by trying it:
// the backend's ResumeExperienceDto/ResumeEducationDto only validate type
// (@IsString()), not presence. An *omitted* field fails validation and
// returns a row-specific message; an *empty string* passes it. The form's
// controlled inputs always send a string (defaulting new rows to `""`),
// never omit a key — so a user filling in only some fields and saving gets
// a silent 200, not the row-specific error the story describes. Confirmed
// directly against both shapes below rather than assumed. Left as a
// documented gap for the story (see docs/tasks/005-admin-manage-resume.md)
// rather than fixed here — loosening/tightening the DTOs is backend work
// this frontend-only story doesn't own.
test("Backend validation IS row-specific for omitted fields, but the form can never send that shape (UAC 4 — documents why it's blocked)", async ({
  page,
}) => {
  await login(page);
  // See UAC 2's comment — capture the real pre-test state so cleanup below
  // restores it exactly, rather than wiping every experience row (this used
  // to PATCH `experience: []` unconditionally, which silently destroyed
  // real seeded resume content the moment this suite started running
  // against real data instead of an empty dev table).
  const original = await getApiResume(page);

  const omittedFieldsRes = await page.request.patch(`${API_URL}/admin/resume`, {
    headers: { Authorization: `Bearer ${await getToken(page)}` },
    data: { experience: [{ role: "Dev" }] }, // org/period/points omitted entirely
  });
  expect(omittedFieldsRes.status()).toBe(400);
  const body = await omittedFieldsRes.json();
  expect(body.message.some((m: string) => m.startsWith("experience.0."))).toBe(true);

  // Restore the resume to a clean state — that PATCH call did persist
  // (the request was rejected with 400, so nothing was actually saved;
  // nothing to clean up here, unlike the accidental-write this test
  // avoided by asserting 400 rather than sending the empty-string variant
  // that a previous manual check confirmed *does* silently save).

  const emptyStringsRes = await page.request.patch(`${API_URL}/admin/resume`, {
    headers: { Authorization: `Bearer ${await getToken(page)}` },
    data: { experience: [{ role: "", org: "", period: "", points: [] }] },
  });
  expect(emptyStringsRes.status()).toBe(200); // confirms the gap: this "incomplete" row is accepted

  // Restore the exact pre-test experience array — not `[]` — undoing the
  // empty-string row this test intentionally wrote to prove the point.
  await page.request.patch(`${API_URL}/admin/resume`, {
    headers: { Authorization: `Bearer ${await getToken(page)}` },
    data: { experience: original.experience },
  });
});

async function getToken(page: Page): Promise<string> {
  return page.evaluate(() => {
    const key = Object.keys(localStorage).find(
      (k) => k.startsWith("sb-") && k.endsWith("-auth-token"),
    );
    if (!key) throw new Error("No Supabase session in localStorage");
    return JSON.parse(localStorage.getItem(key)!).access_token;
  });
}

test("No functional PDF upload control (UAC 5)", async ({ page }) => {
  await login(page);
  await page.goto("/admin/resume");

  const uploadButton = page.getByRole("button", { name: /Upload PDF/i });
  await expect(uploadButton).toBeVisible();
  await expect(uploadButton).toBeDisabled();
});
