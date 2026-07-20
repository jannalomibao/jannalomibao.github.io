import { test, expect, type Page, type Locator } from "@playwright/test";

// Maps to docs/tasks/004-admin-manage-blog.md's UACs.
//
// UPDATE: Epic 7.2 shipped in docs/tasks/done/007-public-pages-real-data.md
// — the public /blog page now fetches from the real API instead of
// frontend/src/data/content.ts mock data. UACs 2, 3, and 6 originally could
// only be verified at the API level; now re-verified against the real
// rendered public page directly too, alongside the existing API checks.
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

// Two DOM levels up from the title <span> reaches the outer row (title
// group + actions group are siblings under it) — same structure as
// AdminProjectsList, confirmed by reading AdminBlogList.tsx directly.
function getRow(page: Page, title: string): Locator {
  return page.locator(`text=${title}`).locator("../..");
}

async function fillPostForm(
  page: Page,
  { slug, title }: { slug?: string; title: string },
) {
  if (slug) await page.fill("#slug", slug);
  await page.fill("#title", title);
  await page.fill("#excerpt", "e");
  await page.fill("#content", "c");
  await page.fill("#imageUrl", "https://example.com/i.jpg");
  await page.fill("#readMinutes", "5");
}

async function createPost(page: Page, opts: { slug: string; title: string }) {
  await page.goto("/admin/blog/new");
  await fillPostForm(page, opts);
  await page.getByRole("button", { name: "Save" }).click();
  await page.waitForURL(/\/admin\/blog$/);
}

// See 003-admin-manage-projects.spec.ts's identical helper for why the
// skeleton-gone wait matters — page.goto() doesn't wait for the async
// GET /api/posts fetch, so a snapshot check right after navigating can
// catch the page mid-skeleton-state.
async function expectOnPublicPage(page: Page, title: string, expected: boolean) {
  await page.goto("/blog");
  await expect(page.locator(".animate-pulse").first()).toHaveCount(0);
  if (expected) {
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
  } else {
    await expect(page.getByRole("heading", { name: title })).toHaveCount(0);
  }
}

async function deletePostRow(page: Page, title: string) {
  if (!page.url().endsWith("/admin/blog")) {
    await page.goto("/admin/blog");
  }
  const row = getRow(page, title);
  await row.getByRole("button", { name: "Delete" }).click();
  await row.getByRole("button", { name: "Confirm" }).click();
  await expect(page.locator(`text=${title}`)).toHaveCount(0);
}

test("Admin list shows drafts and published posts with a publish-date indicator (UAC 1)", async ({
  page,
}) => {
  await login(page);
  const slug = uniqueSlug("uac1");
  const title = `UAC1 Indicator ${slug}`;

  await createPost(page, { slug, title });

  // New post is a draft — date column shows "—", not a publish date.
  await expect(getRow(page, title).getByText("—", { exact: true })).toBeVisible();

  await deletePostRow(page, title);
});

test("Create mode has no publish toggle and always saves as a draft (UAC 2)", async ({
  page,
}) => {
  await login(page);
  const slug = uniqueSlug("uac2");
  const title = `UAC2 New ${slug}`;

  await page.goto("/admin/blog/new");
  await expect(page.getByRole("checkbox", { name: "Published" })).toHaveCount(0);

  await fillPostForm(page, { slug, title });
  await page.getByRole("button", { name: "Save" }).click();
  await page.waitForURL(/\/admin\/blog$/);

  const apiRes = await page.request.get(`${API_URL}/posts`);
  const apiPosts: { slug: string }[] = await apiRes.json();
  expect(apiPosts.some((p) => p.slug === slug)).toBe(false);
  await expectOnPublicPage(page, title, false);

  await deletePostRow(page, title);
});

test("Publishing via edit makes the post visible on the public page immediately (UAC 3)", async ({
  page,
}) => {
  await login(page);
  const slug = uniqueSlug("uac3");
  const title = `UAC3 Publish ${slug}`;

  await createPost(page, { slug, title });

  const isPublicNow = async () => {
    const res = await page.request.get(`${API_URL}/posts`);
    const list: { slug: string }[] = await res.json();
    return list.some((p) => p.slug === slug);
  };
  expect(await isPublicNow()).toBe(false);
  await expectOnPublicPage(page, title, false);

  await page.goto("/admin/blog");
  await getRow(page, title).getByRole("link", { name: "Edit" }).click();
  await page.waitForURL(/\/admin\/blog\/.+/);
  await expect(page.getByRole("checkbox", { name: "Published" })).toBeVisible();
  await page.getByRole("checkbox", { name: "Published" }).check();
  await page.getByRole("button", { name: "Save" }).click();
  await page.waitForURL(/\/admin\/blog$/);

  expect(await isPublicNow()).toBe(true);
  await expectOnPublicPage(page, title, true);

  await deletePostRow(page, title);
});

test("Unpublish then republish keeps the original publishedAt date (UAC 4)", async ({
  page,
}) => {
  await login(page);
  const slug = uniqueSlug("uac4");
  const title = `UAC4 Republish ${slug}`;

  await createPost(page, { slug, title });

  async function getPublishedAt(): Promise<string | null> {
    const res = await page.request.get(`${API_URL}/admin/posts`, {
      headers: { Authorization: `Bearer ${await getToken(page)}` },
    });
    const list: { slug: string; publishedAt: string | null }[] = await res.json();
    return list.find((p) => p.slug === slug)?.publishedAt ?? null;
  }

  // Publish for the first time.
  await getRow(page, title).getByRole("link", { name: "Edit" }).click();
  await page.waitForURL(/\/admin\/blog\/.+/);
  await page.getByRole("checkbox", { name: "Published" }).check();
  await page.getByRole("button", { name: "Save" }).click();
  await page.waitForURL(/\/admin\/blog$/);

  const firstPublishedAt = await getPublishedAt();
  expect(firstPublishedAt).not.toBeNull();

  // Unpublish.
  await getRow(page, title).getByRole("link", { name: "Edit" }).click();
  await page.waitForURL(/\/admin\/blog\/.+/);
  await page.getByRole("checkbox", { name: "Published" }).uncheck();
  await page.getByRole("button", { name: "Save" }).click();
  await page.waitForURL(/\/admin\/blog$/);

  // Republish.
  await getRow(page, title).getByRole("link", { name: "Edit" }).click();
  await page.waitForURL(/\/admin\/blog\/.+/);
  await page.getByRole("checkbox", { name: "Published" }).check();
  await page.getByRole("button", { name: "Save" }).click();
  await page.waitForURL(/\/admin\/blog$/);

  const secondPublishedAt = await getPublishedAt();
  expect(secondPublishedAt).toBe(firstPublishedAt);

  await deletePostRow(page, title);
});

test("Duplicate slug on create shows the API's exact validation error (UAC 5)", async ({
  page,
}) => {
  await login(page);
  const slug = uniqueSlug("uac5");
  const title = `UAC5 Original ${slug}`;

  await createPost(page, { slug, title });

  await page.goto("/admin/blog/new");
  await fillPostForm(page, { slug, title: `${title} again` });
  await page.getByRole("button", { name: "Save" }).click();

  await expect(page.getByRole("alert")).toContainText(slug);
  await expect(page).toHaveURL(/\/admin\/blog\/new$/);

  await deletePostRow(page, title);
});

test("Delete requires confirmation, then removes it from the admin list and the public page (UAC 6)", async ({
  page,
}) => {
  await login(page);
  const slug = uniqueSlug("uac6");
  const title = `UAC6 Removable ${slug}`;

  await createPost(page, { slug, title });
  await getRow(page, title).getByRole("link", { name: "Edit" }).click();
  await page.waitForURL(/\/admin\/blog\/.+/);
  await page.getByRole("checkbox", { name: "Published" }).check();
  await page.getByRole("button", { name: "Save" }).click();
  await page.waitForURL(/\/admin\/blog$/);

  const apiHasIt = async () => {
    const res = await page.request.get(`${API_URL}/posts`);
    const list: { slug: string }[] = await res.json();
    return list.some((p) => p.slug === slug);
  };
  expect(await apiHasIt()).toBe(true);
  await expectOnPublicPage(page, title, true);

  await page.goto("/admin/blog");
  const row = getRow(page, title);
  await row.getByRole("button", { name: "Delete" }).click();
  await expect(row.getByText("Delete?")).toBeVisible();
  await expect(page.locator(`text=${title}`)).toBeVisible();

  await row.getByRole("button", { name: "Confirm" }).click();
  await expect(page.locator(`text=${title}`)).toHaveCount(0);
  expect(await apiHasIt()).toBe(false);
  await expectOnPublicPage(page, title, false);
});

// Reads the Supabase session token straight out of localStorage, since the
// admin/posts endpoint (unlike the public one) requires auth — Playwright's
// `page.request` doesn't share the page's fetch-layer auth wiring.
async function getToken(page: Page): Promise<string> {
  return page.evaluate(() => {
    const key = Object.keys(localStorage).find((k) => k.startsWith("sb-") && k.endsWith("-auth-token"));
    if (!key) throw new Error("No Supabase session in localStorage");
    return JSON.parse(localStorage.getItem(key)!).access_token;
  });
}
