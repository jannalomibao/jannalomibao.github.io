import { test, expect, type Page, type Locator } from "@playwright/test";

// Maps to docs/tasks/003-admin-manage-projects.md's UACs.
//
// IMPORTANT FINDING (see docs/tasks/000-progress.md for the full note): the
// public /projects page still renders from frontend/src/data/content.ts mock
// data — it has never been wired to the real API (Epic 7.2, not done). So
// any UAC literally about "the public /projects page" reflecting an admin
// change can't be demonstrated against the actual rendered page right now;
// asserting "a draft doesn't appear on the public page" would be vacuously
// true (nothing admin-created ever appears there, published or not). Where
// that's the case, this file tests the real, non-vacuous guarantee instead
// — the public API (GET /api/projects) — which is what the public page will
// automatically start reflecting once Epic 7.2 wires it up, with zero
// further backend or admin-UI changes needed.
const OWNER_EMAIL = "owner@local.dev";
const OWNER_PASSWORD = "local-dev-password-123";
const API_URL = "http://localhost:3000/api";

async function login(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(OWNER_EMAIL);
  await page.getByLabel("Password").fill(OWNER_PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL(/\/admin\/?$/);
}

function uniqueSlug(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

// The outer row is two DOM levels up from the title <span> — one level up
// is just the title/status text group; Edit/Delete live in a sibling group
// under the same outer row. Centralized here so every test gets this right.
function getRow(page: Page, title: string): Locator {
  return page.locator(`text=${title}`).locator("../..");
}

async function fillProjectForm(
  page: Page,
  { slug, title }: { slug?: string; title: string },
) {
  if (slug) await page.fill("#slug", slug);
  await page.fill("#title", title);
  await page.fill("#summary", "s");
  await page.fill("#problem", "p");
  await page.fill("#role", "r");
  await page.fill("#outcome", "o");
  await page.fill("#imageUrl", "https://example.com/i.jpg");
  const stackInput = page.getByLabel("Stack");
  await stackInput.fill("React");
  await stackInput.press("Enter");
}

async function createProject(
  page: Page,
  opts: { slug: string; title: string; published?: boolean },
) {
  await page.goto("/admin/projects/new");
  await fillProjectForm(page, opts);
  if (opts.published) {
    await page.getByRole("checkbox", { name: "Published" }).check();
  }
  await page.getByRole("button", { name: "Save" }).click();
  await page.waitForURL(/\/admin\/projects$/);
}

async function deleteProjectRow(page: Page, title: string) {
  if (!page.url().endsWith("/admin/projects")) {
    await page.goto("/admin/projects");
  }
  const row = getRow(page, title);
  await row.getByRole("button", { name: "Delete" }).click();
  await row.getByRole("button", { name: "Confirm" }).click();
  await expect(page.locator(`text=${title}`)).toHaveCount(0);
}

test("Admin list shows drafts and published with a clear indicator (UAC 1)", async ({
  page,
}) => {
  await login(page);
  const slug = uniqueSlug("uac1");
  const title = `UAC1 Indicator ${slug}`;

  await createProject(page, { slug, title });

  await expect(getRow(page, title).getByText("Draft", { exact: true })).toBeVisible();

  await deleteProjectRow(page, title);
});

test("Creating a project defaults to draft (published: false), excluded from the public API (UAC 2)", async ({
  page,
}) => {
  await login(page);
  const slug = uniqueSlug("uac2");
  const title = `UAC2 New ${slug}`;

  await createProject(page, { slug, title });
  await expect(page.locator(`text=${title}`)).toBeVisible();

  const apiRes = await page.request.get(`${API_URL}/projects`);
  const apiProjects: { slug: string }[] = await apiRes.json();
  expect(apiProjects.some((p) => p.slug === slug)).toBe(false);

  await deleteProjectRow(page, title);
});

test("Publishing toggles the project's visibility in the public API immediately (UAC 3)", async ({
  page,
}) => {
  await login(page);
  const slug = uniqueSlug("uac3");
  const title = `UAC3 Toggle ${slug}`;

  await createProject(page, { slug, title });

  const isPublicNow = async () => {
    const res = await page.request.get(`${API_URL}/projects`);
    const list: { slug: string }[] = await res.json();
    return list.some((p) => p.slug === slug);
  };

  expect(await isPublicNow()).toBe(false);

  await getRow(page, title).getByRole("link", { name: "Edit" }).click();
  await page.waitForURL(/\/admin\/projects\/.+/);
  await page.getByRole("checkbox", { name: "Published" }).check();
  await page.getByRole("button", { name: "Save" }).click();
  await page.waitForURL(/\/admin\/projects$/);

  expect(await isPublicNow()).toBe(true);

  // Unpublish again — immediately removed, no rebuild.
  await getRow(page, title).getByRole("link", { name: "Edit" }).click();
  await page.waitForURL(/\/admin\/projects\/.+/);
  await page.getByRole("checkbox", { name: "Published" }).uncheck();
  await page.getByRole("button", { name: "Save" }).click();
  await page.waitForURL(/\/admin\/projects$/);

  expect(await isPublicNow()).toBe(false);

  await deleteProjectRow(page, title);
});

test("Duplicate slug on create shows the API's exact validation error (UAC 4)", async ({
  page,
}) => {
  await login(page);
  const slug = uniqueSlug("uac4");
  const title = `UAC4 Original ${slug}`;

  await createProject(page, { slug, title });

  // Try creating a second project with the same slug.
  await page.goto("/admin/projects/new");
  await fillProjectForm(page, { slug, title: `${title} again` });
  await page.getByRole("button", { name: "Save" }).click();

  await expect(page.getByRole("alert")).toContainText(slug);
  await expect(page).toHaveURL(/\/admin\/projects\/new$/);

  await deleteProjectRow(page, title);
});

test("Slug is locked/uneditable when editing (UAC 5)", async ({ page }) => {
  await login(page);
  const slug = uniqueSlug("uac5");
  const title = `UAC5 Locked ${slug}`;

  await createProject(page, { slug, title });

  await getRow(page, title).getByRole("link", { name: "Edit" }).click();
  await page.waitForURL(/\/admin\/projects\/.+/);

  await expect(page.locator("#slug")).toBeDisabled();
  await expect(page.locator("#slug")).toHaveValue(slug);

  await deleteProjectRow(page, title);
});

test("Delete requires confirmation, then removes it from the admin list and the public API (UAC 6)", async ({
  page,
}) => {
  await login(page);
  const slug = uniqueSlug("uac6");
  const title = `UAC6 Removable ${slug}`;

  await createProject(page, { slug, title, published: true });

  const apiHasIt = async () => {
    const res = await page.request.get(`${API_URL}/projects`);
    const list: { slug: string }[] = await res.json();
    return list.some((p) => p.slug === slug);
  };
  expect(await apiHasIt()).toBe(true);

  // Clicking Delete once shows a confirm step, not an immediate delete.
  const row = getRow(page, title);
  await row.getByRole("button", { name: "Delete" }).click();
  await expect(row.getByText("Delete?")).toBeVisible();
  await expect(page.locator(`text=${title}`)).toBeVisible(); // still there pre-confirm

  await row.getByRole("button", { name: "Confirm" }).click();
  await expect(page.locator(`text=${title}`)).toHaveCount(0);
  expect(await apiHasIt()).toBe(false);
});
