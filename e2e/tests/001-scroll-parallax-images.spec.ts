import { test, expect, type Page, type Locator, type APIRequestContext } from "@playwright/test";

// Maps to docs/tasks/001-scroll-parallax-images.md's UACs.
//
// The Project detail and Blog cases originally pointed at hardcoded mock-
// data slugs (ledgerline, designing-apis-for-change) — real since story 007
// wired these pages to the real API (docs/tasks/007-public-pages-real-data.md),
// those slugs 404. Project detail now points at a real seeded project.
// Blog has zero real posts seeded (docs/08-seed-data.md's seed-content.yaml
// intentionally left posts empty), so this file creates one temporary real
// published post in beforeAll purely to have something with a hero image to
// scroll-test, and deletes it in afterAll — not testing blog content, just
// reusing the same real-data pattern as 007's suite for a real image to
// drift-test against.
const OWNER_EMAIL = "owner@local.dev";
const OWNER_PASSWORD = "local-dev-password-123";
const API_URL = "http://localhost:3000/api";
const SUPABASE_URL = "http://127.0.0.1:54321";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

async function getAdminToken(request: APIRequestContext): Promise<string> {
  const res = await request.post(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" },
    data: { email: OWNER_EMAIL, password: OWNER_PASSWORD },
  });
  const body = await res.json();
  return body.access_token;
}

let tempPostSlug: string;
let tempPostId: string;

test.beforeAll(async ({ request }) => {
  const token = await getAdminToken(request);
  tempPostSlug = `parallax-temp-${Date.now()}`;

  const createRes = await request.post(`${API_URL}/admin/posts`, {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      slug: tempPostSlug,
      title: "Temporary post for parallax testing",
      excerpt: "Not real content — created and deleted by 001-scroll-parallax-images.spec.ts.",
      content: "Not real content.",
      imageUrl: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?q=80&w=1600&auto=format&fit=crop",
      readMinutes: 1,
    },
  });
  const created = await createRes.json();
  tempPostId = created.id;

  await request.patch(`${API_URL}/admin/posts/${tempPostId}`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { published: true },
  });
});

test.afterAll(async ({ request }) => {
  const token = await getAdminToken(request);
  await request.delete(`${API_URL}/admin/posts/${tempPostId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
});

/** Parses the ty (vertical translate) component out of a computed `matrix(...)` transform. */
async function translateY(locator: Locator): Promise<number> {
  const transform = await locator.evaluate(
    (el) => getComputedStyle(el).transform,
  );
  if (transform === "none") return 0;
  const match = /matrix\(([^)]+)\)/.exec(transform);
  if (!match) return 0;
  const parts = match[1].split(",").map((n) => parseFloat(n.trim()));
  return parts[5] ?? 0;
}

/**
 * Samples translateY at several scroll positions rather than a single
 * before/after nudge — a fixed-pixel nudge can land within the same
 * (clamped) scroll-progress region on a short mobile viewport, making two
 * arbitrary snapshots coincidentally near-identical even though the effect
 * is working. The range across samples is what actually proves drift.
 */
async function sampleDriftRange(page: Page, track: Locator): Promise<number> {
  const samples: number[] = [await translateY(track)];
  for (let i = 0; i < 6; i++) {
    await page.mouse.wheel(0, 200);
    samples.push(await translateY(track));
  }
  return Math.max(...samples) - Math.min(...samples);
}

test.describe("Scroll parallax — site-wide (UAC 1 & 2)", () => {
  // `path` is a function for the two cases that depend on data not known
  // until `beforeAll` has run (real seeded project slug is static and known
  // upfront, but the temp post's slug is generated at runtime) — resolved
  // inside each test body, which executes after beforeAll regardless.
  const cases: { path: () => string; label: string }[] = [
    { path: () => "/", label: "Home (about-teaser + featured project cards)" },
    { path: () => "/about", label: "About (desk photo)" },
    { path: () => "/projects", label: "Projects (project cards)" },
    { path: () => "/projects/cura-mobile-app", label: "Project detail (hero image)" },
    { path: () => "/blog", label: "Blog (list thumbnails)" },
    { path: () => `/blog/${tempPostSlug}`, label: "Blog detail (hero image)" },
  ];

  for (const { path, label } of cases) {
    test(`${label} — image drifts on scroll`, async ({ page }) => {
      await page.goto(path());
      const box = page.getByTestId("parallax-box").first();
      await expect(box).toBeVisible();
      const track = box.getByTestId("parallax-track");

      const range = await sampleDriftRange(page, track);

      expect(range).toBeGreaterThan(2);
    });
  }
});

test("Drift stays subtle — roughly within ±20px (UAC 3)", async ({
  page,
}) => {
  await page.goto("/projects");
  const box = page.getByTestId("parallax-box").first();
  const track = box.getByTestId("parallax-track");

  const samples: number[] = [];
  for (let i = 0; i < 6; i++) {
    await page.mouse.wheel(0, 300);
    samples.push(Math.abs(await translateY(track)));
  }

  for (const offset of samples) {
    // Default offset prop is 15px; allow a little headroom above that
    // before treating it as "not subtle" per the story's 10-30px guidance.
    expect(offset).toBeLessThanOrEqual(20);
  }
});

test("Images stay clipped inside their box at every scroll position — no layout shift (UAC 4)", async ({
  page,
}) => {
  await page.goto("/projects");
  const box = page.getByTestId("parallax-box").first();

  const overflow = await box.evaluate((el) => getComputedStyle(el).overflow);
  expect(overflow).toBe("hidden");

  const rectBefore = await box.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { width: r.width, height: r.height };
  });

  for (let i = 0; i < 5; i++) {
    await page.mouse.wheel(0, 250);
  }

  const rectAfter = await box.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { width: r.width, height: r.height };
  });

  // The clipping box itself must never resize/shift from the parallax
  // effect — only the inner track moves, per ParallaxImage's overscan design.
  expect(rectAfter.width).toBeCloseTo(rectBefore.width, 0);
  expect(rectAfter.height).toBeCloseTo(rectBefore.height, 0);
});

test("prefers-reduced-motion disables the drift entirely (UAC 5)", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/projects");
  const box = page.getByTestId("parallax-box").first();
  const track = box.getByTestId("parallax-track");
  await expect(box).toBeVisible();

  const before = await translateY(track);
  await box.scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 400);
  const after = await translateY(track);

  expect(before).toBe(0);
  expect(after).toBe(0);

  // And the image itself is still fully visible/functional, not hidden.
  await expect(box.locator("img")).toBeVisible();
});

test("Scrolling the image-heavy Projects and Blog lists produces no console errors (UAC 6 proxy)", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });

  for (const path of ["/projects", "/blog"]) {
    await page.goto(path);
    for (let i = 0; i < 8; i++) {
      await page.mouse.wheel(0, 300);
    }
    // Page should still be interactive after a scroll burst. The logo link
    // is visible in the header on every route at every viewport (unlike the
    // desktop-only nav links, which collapse into the mobile menu button),
    // so it's a viewport-agnostic "still responsive" check.
    await expect(
      page.getByRole("link", { name: "Janna Lomibao" }),
    ).toBeVisible();
  }

  expect(
    errors,
    `console/page errors during scroll on ${testInfo.project.name}: ${errors.join("; ")}`,
  ).toHaveLength(0);
});
