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

  // Add a uniquely-marked row first. org/period must be filled too, not
  // just role — the backend DTOs now reject any blank field on save (the
  // fix for UAC 4), so a row can no longer be saved half-filled the way
  // this test used to get away with.
  await page.goto("/admin/resume");
  await page.getByRole("button", { name: "Add row" }).first().click();
  let rows = page.locator('[aria-label^="Experience"][aria-label$="role"]');
  let lastIndex = (await rows.count()) - 1;
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

// UAC 4 was previously blocked: the backend's ResumeExperienceDto/
// ResumeEducationDto only validated *type* (@IsString()), not *presence* —
// an omitted field 400'd with a row-specific message, but the admin form's
// controlled inputs always send a string (new rows default to ""), so a
// user filling in only some fields and saving got a silent 200, not the
// row-specific error the story describes. Fixed by adding @IsNotEmpty()
// alongside @IsString() on every identifying field in
// backend/src/resume/dto/update-resume.dto.ts — now both shapes 400.
test("Backend rejects both omitted and empty-string fields with a row-specific message (UAC 4a, API level)", async ({
  page,
}) => {
  await login(page);
  const token = await getToken(page);

  const omittedFieldsRes = await page.request.patch(`${API_URL}/admin/resume`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { experience: [{ role: "Dev" }] }, // org/period/points omitted entirely
  });
  expect(omittedFieldsRes.status()).toBe(400);
  const omittedBody = await omittedFieldsRes.json();
  expect(omittedBody.message.some((m: string) => m.startsWith("experience.0."))).toBe(true);

  const emptyStringsRes = await page.request.patch(`${API_URL}/admin/resume`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { experience: [{ role: "", org: "", period: "", points: [] }] },
  });
  expect(emptyStringsRes.status()).toBe(400); // previously 200 — this was the gap, now fixed
  const emptyBody = await emptyStringsRes.json();
  expect(emptyBody.message.some((m: string) => m.startsWith("experience.0."))).toBe(true);

  // Neither request persisted anything (both rejected with 400) — nothing
  // to clean up, unlike before the fix.
});

test("Submitting a blank experience row through the real admin form shows a row-specific error and doesn't save (UAC 4b, form level)", async ({
  page,
}) => {
  await login(page);
  // See UAC 2's comment — capture the real pre-test state so we can confirm
  // it's genuinely unchanged after the rejected save below.
  const original = await getApiResume(page);

  await page.goto("/admin/resume");
  await page.getByRole("button", { name: "Add row" }).first().click();
  // Deliberately leave the new row's role/org/period blank — this is
  // exactly the shape the form always sends for an incomplete row (see the
  // fixed DTOs' comment), now reachable and testable through the UI itself
  // rather than only via direct API calls. The new row lands after the
  // real seeded rows, so its index in the error path isn't 0 — matched by
  // pattern rather than a hardcoded index.
  await page.getByRole("button", { name: "Save" }).click();

  await expect(page.getByRole("alert")).toContainText(/experience\.\d+\.(role|org|period)/);

  const resume = await getApiResume(page);
  expect(resume.experience).toEqual(original.experience);
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
