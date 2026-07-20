import { test, expect, type Page } from "@playwright/test";

// Maps to docs/tasks/007-public-pages-real-data.md's UACs.
//
// This suite leans on the real seeded data from supabase/seed.sql wherever
// practical (docs/08-seed-data.md) rather than mocking — e.g. the real
// unpublished nail-salon-website project is a genuine 404 case, not a
// contrived one. Two things are deliberately NOT tested against real data:
//   - "API unreachable" (UAC 7): can't stop the shared dev backend without
//     breaking every other test running against it, so this uses
//     page.route() to simulate a network failure for just one test's
//     requests instead — the standard, non-destructive way to do this.
//   - Projects' empty state (part of UAC 8): the real seeded project list
//     is deliberately non-empty (it's real portfolio content) and
//     shouldn't be temporarily emptied just to prove a UI state — also
//     covered via page.route(), returning a real 200 with an empty array.
//     Blog's empty state (also UAC 8) IS demonstrated against real data
//     below, since there are genuinely zero seeded posts.

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

async function getToken(page: Page): Promise<string> {
  return page.evaluate(() => {
    const key = Object.keys(localStorage).find(
      (k) => k.startsWith("sb-") && k.endsWith("-auth-token"),
    );
    if (!key) throw new Error("No Supabase session in localStorage");
    return JSON.parse(localStorage.getItem(key)!).access_token;
  });
}

function uniqueSlug(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

// --- UAC 1 & 2: Projects list + detail, against real seeded data ---------

test("Projects lists only real, published projects from the API (UAC 1)", async ({ page }) => {
  await page.goto("/projects");

  for (const title of ["Cura Mobile App", "Website Portfolio", "Mobile App for To-Do List", "Travel Agency Website"]) {
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
  }

  // Real project in the seed data, but published: false — must not appear.
  await expect(page.getByText("Nail Salon Website")).toHaveCount(0);
});

test("Project detail renders real data from the API by slug (UAC 2a)", async ({ page }) => {
  await page.goto("/projects/cura-mobile-app");

  await expect(page.getByRole("heading", { name: "Cura Mobile App" })).toBeVisible();
  await expect(page.getByText("React Native")).toBeVisible();
  await expect(page.getByText(/Ongoing/)).toBeVisible();
});

test("Project detail shows a not-found state for an unpublished slug (UAC 2b)", async ({
  page,
}) => {
  // Real project, real slug, but published: false — the public API 404s it
  // (docs/07-api-contract.md §2's "404, not 403" rule), same as a slug that
  // never existed at all.
  await page.goto("/projects/nail-salon-website");
  await expect(page.getByRole("alert")).toContainText("doesn't exist");
});

test("Project detail shows a not-found state for a nonexistent slug (UAC 2c)", async ({
  page,
}) => {
  await page.goto("/projects/this-slug-does-not-exist-at-all");
  await expect(page.getByRole("alert")).toContainText("doesn't exist");
});

// --- UAC 3 & 4: Blog list + detail — genuinely zero posts seeded, so the ---
// empty state is tested first against real data, then a real post is
// created+published via the admin API (not through the admin UI form,
// already covered by 004's suite) to test the non-empty list/detail case,
// then deleted. Scoped to serial mode (only within this describe block, not
// the whole file) since the empty-state assertion must not run concurrently
// with the post-creating test.
test.describe("Blog against real data", () => {
  test.describe.configure({ mode: "serial" });

  // `serial` only orders tests within one project's own run — chromium's
  // and mobile-chromium's copies of this describe still execute in true
  // parallel against each other (same shared backend), which raced the
  // empty-state check against the other project's concurrent post-creation
  // test. Same fix as story 005's identical single-shared-resource problem:
  // restrict to one project only.
  test.beforeEach(async ({}, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "shared posts table across projects — see comment above");
  });

  test("Blog shows a real empty state when there are zero published posts (UAC 8, blog half)", async ({
    page,
  }) => {
    await page.goto("/blog");
    await expect(page.getByText("No posts yet. Check back soon.")).toBeVisible();
  });

  test("Blog lists a real published post from the API, and its detail page renders it (UAC 3, UAC 4a)", async ({
    page,
  }) => {
    await login(page);
    const slug = uniqueSlug("story007");
    const title = `Story 007 Real Post ${slug}`;
    const token = await getToken(page);

    const createRes = await page.request.post(`${API_URL}/admin/posts`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        slug,
        title,
        excerpt: "A real post created for e2e verification.",
        content: "First real paragraph.\n\nSecond real paragraph.",
        imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f",
        readMinutes: 4,
      },
    });
    expect(createRes.status()).toBe(201);
    const created = await createRes.json();

    const publishRes = await page.request.patch(`${API_URL}/admin/posts/${created.id}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { published: true },
    });
    expect(publishRes.status()).toBe(200);

    await page.goto("/blog");
    await expect(page.getByRole("heading", { name: title })).toBeVisible();

    await page.getByRole("heading", { name: title }).click();
    await page.waitForURL(new RegExp(`/blog/${slug}$`));
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
    await expect(page.getByText("First real paragraph.")).toBeVisible();
    await expect(page.getByText("Second real paragraph.")).toBeVisible();

    const deleteRes = await page.request.delete(`${API_URL}/admin/posts/${created.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(deleteRes.status()).toBe(204);
  });

  test("Blog post detail shows a not-found state for a nonexistent slug (UAC 4b)", async ({
    page,
  }) => {
    await page.goto("/blog/this-slug-does-not-exist-at-all");
    await expect(page.getByRole("alert")).toContainText("doesn't exist");
  });
});

// --- UAC 5: Resume, against real seeded data ------------------------------

test("Resume renders real summary, experience, education, and skills from the API (UAC 5)", async ({
  page,
}) => {
  await page.goto("/resume");

  await expect(page.getByText(/Computer Science student at Concordia University/)).toBeVisible();
  await expect(page.getByRole("heading", { name: /Software Developer Intern/ })).toBeVisible();
  await expect(page.getByText("Consultation SOS")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Bachelor of Computer Science" })).toBeVisible();
  await expect(page.getByText("HTML", { exact: true })).toBeVisible();

  // No PDF uploaded yet in the real seed data — must not render a live
  // download link pointing at nothing.
  await expect(page.getByText("PDF not available yet")).toBeVisible();
});

// --- UAC 6: Home's featured-projects section, against real seeded data ---

test("Home's featured section shows only real featured + published projects (UAC 6)", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Cura Mobile App" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Website Portfolio" })).toBeVisible();

  // Real, published, but not featured — must not appear in this section.
  await expect(page.getByText("Mobile App for To-Do List")).toHaveCount(0);
  await expect(page.getByText("Travel Agency Website")).toHaveCount(0);
});

// --- UAC 7: API unreachable — simulated via route interception, not by ---
// stopping the shared dev backend (see file header comment).

const errorCases: { path: string; apiPattern: string; message: string }[] = [
  { path: "/projects", apiPattern: "**/api/projects", message: "Couldn't load projects right now." },
  { path: "/blog", apiPattern: "**/api/posts", message: "Couldn't load posts right now." },
  { path: "/resume", apiPattern: "**/api/resume", message: "Couldn't load the resume right now." },
  { path: "/", apiPattern: "**/api/projects", message: "Couldn't load featured work right now." },
  {
    path: "/projects/cura-mobile-app",
    apiPattern: "**/api/projects/cura-mobile-app",
    message: "Couldn't load this project right now.",
  },
  {
    path: "/blog/some-post",
    apiPattern: "**/api/posts/some-post",
    message: "Couldn't load this post right now.",
  },
];

for (const { path, apiPattern, message } of errorCases) {
  test(`${path} shows an inline error message when the API is unreachable (UAC 7)`, async ({
    page,
  }) => {
    await page.route(apiPattern, (route) => route.abort("failed"));
    await page.goto(path);
    await expect(page.getByRole("alert")).toContainText(message);
  });
}

// --- UAC 8 (projects half): empty state via route interception, not by ---
// temporarily unpublishing real portfolio content (see file header comment).

test("Projects shows a plain empty state for a real, successful, empty response (UAC 8, projects half)", async ({
  page,
}) => {
  await page.route("**/api/projects", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "[]" }),
  );
  await page.goto("/projects");
  await expect(page.getByText("No projects yet. Check back soon.")).toBeVisible();
});
