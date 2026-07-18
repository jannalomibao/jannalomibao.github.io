import { test, expect, type Page, type Locator } from "@playwright/test";

// Maps to docs/tasks/001-scroll-parallax-images.md's UACs.

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
  const cases: { path: string; label: string }[] = [
    { path: "/", label: "Home (about-teaser + featured project cards)" },
    { path: "/about", label: "About (desk photo)" },
    { path: "/projects", label: "Projects (project cards)" },
    { path: "/projects/ledgerline", label: "Project detail (hero image)" },
    { path: "/blog", label: "Blog (list thumbnails)" },
    {
      path: "/blog/designing-apis-for-change",
      label: "Blog detail (hero image)",
    },
  ];

  for (const { path, label } of cases) {
    test(`${label} — image drifts on scroll`, async ({ page }) => {
      await page.goto(path);
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
