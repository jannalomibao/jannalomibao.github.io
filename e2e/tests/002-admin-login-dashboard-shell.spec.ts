import { test, expect } from "@playwright/test";

// Maps to docs/tasks/002-admin-login-dashboard-shell.md's UACs.
//
// Credentials are the local-dev owner fixture account documented in
// backend/README.md "Admin auth" (created once via the Supabase Auth admin
// API against the local stack). Requires `supabase start` running.
const OWNER_EMAIL = "owner@local.dev";
const OWNER_PASSWORD = "local-dev-password-123";

test("Visiting /admin while logged out redirects to /admin/login (UAC 1)", async ({
  page,
}) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByRole("heading", { name: "Log in" })).toBeVisible();
});

test("Valid credentials log in and land on the dashboard shell (UAC 2)", async ({
  page,
}) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(OWNER_EMAIL);
  await page.getByLabel("Password").fill(OWNER_PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();

  await expect(page).toHaveURL(/\/admin\/?$/);
  await expect(
    page.getByRole("heading", { name: "Welcome back." }),
  ).toBeVisible();
});

test("Invalid credentials show an inline error and stay on the login screen (UAC 3)", async ({
  page,
}) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(OWNER_EMAIL);
  await page.getByLabel("Password").fill("definitely-wrong-password");
  await page.getByRole("button", { name: "Log in" }).click();

  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/login$/);
  // No partial access — dashboard content never rendered.
  await expect(
    page.getByRole("heading", { name: "Welcome back." }),
  ).toHaveCount(0);
});

test("Dashboard shell has nav entries for every section plus a working logout (UAC 4)", async ({
  page,
}) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(OWNER_EMAIL);
  await page.getByLabel("Password").fill(OWNER_PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/admin\/?$/);

  const nav = page.locator("aside nav");
  for (const label of ["Projects", "Blog", "Resume", "Messages"]) {
    await expect(nav.getByRole("link", { name: label })).toBeVisible();
  }

  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test("After logout, /admin redirects back to /admin/login — no stale session (UAC 5)", async ({
  page,
}) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(OWNER_EMAIL);
  await page.getByLabel("Password").fill(OWNER_PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/admin\/?$/);

  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);

  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test("Admin shell never renders the public header/footer/marquee (UAC 6)", async ({
  page,
}) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(OWNER_EMAIL);
  await page.getByLabel("Password").fill(OWNER_PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/admin\/?$/);

  // Public Layout renders a footer CTA ("Let's build something worth
  // shipping.") and a header nav with these exact public-route labels —
  // none of that belongs in the admin shell.
  await expect(page.getByText("Let's build something")).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Janna Lomibao" }),
  ).toHaveCount(0);
  await expect(page.locator(".custom-cursor")).toHaveCount(0);
});

test("Already-authenticated visit to /admin/login redirects to /admin (bonus, from Description)", async ({
  page,
}) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(OWNER_EMAIL);
  await page.getByLabel("Password").fill(OWNER_PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/admin\/?$/);

  await page.goto("/admin/login");
  await expect(page).toHaveURL(/\/admin\/?$/);
});
