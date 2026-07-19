import { test, expect, type Page, type Locator } from "@playwright/test";
import { execSync } from "node:child_process";

// Maps to docs/tasks/006-admin-manage-messages.md's UACs.
//
// Contact submissions can only be created via the public POST /api/contact
// (rate-limited to 5/IP/hour — docs/07-api-contract.md §7.1) or directly in
// the database — there's no admin "create" endpoint, by design (this story
// is read/status-update only, contract §7). Seeding via SQL directly to the
// local dev DB keeps this suite independent of that rate limit and doesn't
// exercise the public form, which is explicitly out of scope for this story
// (its submission is still a TODO — see the story file's "Public side note").
//
// Every seeded row uses a run-unique marker in its name/email/message so
// assertions never depend on the dev DB being empty of other data.
const OWNER_EMAIL = "owner@local.dev";
const OWNER_PASSWORD = "local-dev-password-123";
const API_URL = "http://localhost:3000/api";
const DB_URL = "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

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

// Marker strings are generated above (alphanumeric/hyphen only) and message
// text is always a plain template built from them, so naive single-quote
// wrapping is safe here — this is local-dev-only test seeding, not
// user-facing input handling.
function seedSubmission(opts: {
  name: string;
  email: string;
  message: string;
  status?: "unread" | "read" | "archived";
  createdAt?: string;
}): void {
  const status = opts.status ?? "unread";
  const createdAtSql = opts.createdAt ? `'${opts.createdAt}'` : "now()";
  execSync(
    `psql "${DB_URL}" -v ON_ERROR_STOP=1 -q -c "INSERT INTO contact_submissions (name, email, message, status, created_at) VALUES ('${opts.name}', '${opts.email}', '${opts.message}', '${status}', ${createdAtSql})"`,
  );
}

function deleteSubmission(email: string): void {
  execSync(
    `psql "${DB_URL}" -v ON_ERROR_STOP=1 -q -c "DELETE FROM contact_submissions WHERE email = '${email}'"`,
  );
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

// From the email <span>, the row (which also contains the action buttons as
// a sibling group) is 4 DOM levels up — confirmed by reading
// AdminMessagesList.tsx directly rather than guessing (email span ->
// items-baseline div -> min-w-0 div -> left-group div -> outer row div).
function getRow(page: Page, email: string): Locator {
  return page.getByText(email, { exact: true }).locator("../../../..");
}

async function getAdminSubmission(
  page: Page,
  email: string,
): Promise<{ status: string } | undefined> {
  const res = await page.request.get(`${API_URL}/admin/contact`, {
    headers: { Authorization: `Bearer ${await getToken(page)}` },
  });
  const list: { email: string; status: string }[] = await res.json();
  return list.find((s) => s.email === email);
}

test("List shows name, email, message, date, and status per row, newest first (UAC 1)", async ({
  page,
}) => {
  const marker = uniqueMarker("uac1");
  const olderEmail = `older-${marker}@e2e.test`;
  const newerEmail = `newer-${marker}@e2e.test`;
  seedSubmission({
    name: `Older ${marker}`,
    email: olderEmail,
    message: `body older ${marker}`,
    createdAt: "2020-01-01T12:00:00Z",
  });
  seedSubmission({
    name: `Newer ${marker}`,
    email: newerEmail,
    message: `body newer ${marker}`,
    createdAt: "2035-01-01T12:00:00Z",
  });

  await login(page);
  await page.goto("/admin/messages");

  await expect(page.getByText(olderEmail)).toBeVisible();
  await expect(page.getByText(newerEmail)).toBeVisible();
  await expect(page.getByText(`body older ${marker}`)).toBeVisible();
  await expect(page.getByText(`body newer ${marker}`)).toBeVisible();
  await expect(page.getByText("Jan 1, 2035")).toBeVisible();

  const olderBox = await page.getByText(olderEmail).boundingBox();
  const newerBox = await page.getByText(newerEmail).boundingBox();
  expect(olderBox).not.toBeNull();
  expect(newerBox).not.toBeNull();
  expect(newerBox!.y).toBeLessThan(olderBox!.y);

  deleteSubmission(olderEmail);
  deleteSubmission(newerEmail);
});

test("Switching the filter tab re-fetches and shows only matching submissions (UAC 2)", async ({
  page,
}) => {
  const marker = uniqueMarker("uac2");
  const readEmail = `read-${marker}@e2e.test`;
  const archivedEmail = `archived-${marker}@e2e.test`;
  seedSubmission({ name: `Read ${marker}`, email: readEmail, message: "m", status: "read" });
  seedSubmission({
    name: `Archived ${marker}`,
    email: archivedEmail,
    message: "m",
    status: "archived",
  });

  await login(page);
  await page.goto("/admin/messages");

  await page.getByRole("tab", { name: "Unread" }).click();
  await expect(page.getByText(readEmail)).toHaveCount(0);
  await expect(page.getByText(archivedEmail)).toHaveCount(0);

  await page.getByRole("tab", { name: "Read", exact: true }).click();
  await expect(page.getByText(readEmail)).toBeVisible();
  await expect(page.getByText(archivedEmail)).toHaveCount(0);

  await page.getByRole("tab", { name: "Archived" }).click();
  await expect(page.getByText(archivedEmail)).toBeVisible();
  await expect(page.getByText(readEmail)).toHaveCount(0);

  deleteSubmission(readEmail);
  deleteSubmission(archivedEmail);
});

test("Marking an unread submission as read updates its status immediately (UAC 3)", async ({
  page,
}) => {
  const marker = uniqueMarker("uac3");
  const email = `${marker}@e2e.test`;
  seedSubmission({ name: `Name ${marker}`, email, message: "m", status: "unread" });

  await login(page);
  await page.goto("/admin/messages");

  const row = getRow(page, email);
  await row.getByRole("button", { name: "Mark read" }).click();

  await expect(row.getByRole("button", { name: "Mark read" })).toHaveCount(0);

  const submission = await getAdminSubmission(page, email);
  expect(submission?.status).toBe("read");

  deleteSubmission(email);
});

test("Archiving a submission removes it from Unread and Read views, leaving it only in Archived (UAC 4)", async ({
  page,
}) => {
  const marker = uniqueMarker("uac4");
  const email = `${marker}@e2e.test`;
  seedSubmission({ name: `Name ${marker}`, email, message: "m", status: "unread" });

  await login(page);
  await page.goto("/admin/messages");

  const row = getRow(page, email);
  await row.getByRole("button", { name: "Archive" }).click();
  // Archiving is async (PATCH + reload) with no "Saved" indicator on this
  // list — wait for the row's own Archive button to disappear (only shown
  // for non-archived rows) as the real completion signal before switching
  // filters, instead of racing the reload.
  await expect(row.getByRole("button", { name: "Archive" })).toHaveCount(0);

  await page.getByRole("tab", { name: "Unread" }).click();
  await expect(page.getByText(email)).toHaveCount(0);

  await page.getByRole("tab", { name: "Read", exact: true }).click();
  await expect(page.getByText(email)).toHaveCount(0);

  await page.getByRole("tab", { name: "Archived" }).click();
  await expect(page.getByText(email)).toBeVisible();

  const submission = await getAdminSubmission(page, email);
  expect(submission?.status).toBe("archived");

  deleteSubmission(email);
});

test("No 'mark unread' action exists anywhere in the UI (UAC 5)", async ({ page }) => {
  const marker = uniqueMarker("uac5");
  const readEmail = `read-${marker}@e2e.test`;
  const archivedEmail = `archived-${marker}@e2e.test`;
  seedSubmission({ name: `Read ${marker}`, email: readEmail, message: "m", status: "read" });
  seedSubmission({
    name: `Archived ${marker}`,
    email: archivedEmail,
    message: "m",
    status: "archived",
  });

  await login(page);
  await page.goto("/admin/messages");

  await expect(page.getByRole("button", { name: /mark unread/i })).toHaveCount(0);

  const readRow = getRow(page, readEmail);
  const archivedRow = getRow(page, archivedEmail);
  await expect(readRow.getByRole("button", { name: /unread/i })).toHaveCount(0);
  await expect(archivedRow.getByRole("button", { name: /unread/i })).toHaveCount(0);

  deleteSubmission(readEmail);
  deleteSubmission(archivedEmail);
});
