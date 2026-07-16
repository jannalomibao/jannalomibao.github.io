# Design System — Personal Portfolio Website

Related: [PRD](02-prd.md) · [User Flow & Sitemap](03-user-flow-sitemap.md)

This document describes the design system as actually implemented in `frontend/src/index.css`
and the component patterns used throughout `frontend/src/components` and `frontend/src/pages`.
It is the source of truth for extending the site consistently — if a new page or component
diverges from this doc, either the doc or the component is wrong.

## 1. Design Principles

- **Minimal, not empty.** Generous whitespace, but every element earns its place — no
  decorative filler.
- **One accent, used sparingly.** A single warm orange carries all emphasis (links, CTAs,
  active states, selection). It reads as confident specifically because it's rare.
- **Typography does the talking.** A large serif display face for headlines gives the site
  its personality; the sans body face stays quiet and gets out of the way.
- **Motion confirms, it doesn't perform.** Scroll reveals, hover states, and page transitions
  are subtle and consistent — they should make the site feel considered, not gimmicky.
- **Content-first imagery.** Photography (currently Unsplash placeholders) is treated as
  full-bleed blocks with soft rounded corners, never decorative chrome.

## 2. Color Palette

Defined as CSS custom properties in an `@theme` block (Tailwind v4), which auto-generates
utility classes (`bg-ink`, `text-accent`, `border-line`, etc.).

| Token | Hex | Usage |
|---|---|---|
| `--color-paper` | `#f6f4ef` | Page background. Warm off-white, not pure white. |
| `--color-ink` | `#0d0d0c` | Primary text, headings, filled buttons, icons. |
| `--color-ink-soft` | `#4a4843` | Secondary/body text, muted labels, placeholders. |
| `--color-line` | `#dedad0` | Borders, dividers, input underlines, card outlines. |
| `--color-accent` | `#ff5a1f` | Links, hover states, active nav, CTAs on hover, focus emphasis, text selection. |
| `--color-accent-soft` | `#ffe4d6` | Reserved for accent backgrounds/tints (badges, highlights) — available but not yet used on any page. |

Dark-mode tokens (`--color-paper-dark: #0d0d0c`, `--color-ink-dark: #f6f4ef`) are declared but
**not yet wired up** — there is no dark mode toggle or `prefers-color-scheme` handling yet.
Treat this as a planned v2, not a current feature.

**Rule:** never hardcode a hex value in a component. Use the Tailwind utility generated from
the token (`bg-paper`, `text-ink-soft`, `border-line`, `bg-accent`, `text-accent`) so a future
palette change is a one-file edit in `index.css`.

## 3. Typography

| Role | Font | CSS variable | Where |
|---|---|---|---|
| Display / headings | **Fraunces** (serif) | `--font-display`, `.font-display` | All `h1`/`h2`-equivalent headings, hero text, section titles |
| Body / UI | **Inter** (sans) | `--font-sans` (applied to `body` by default) | Paragraphs, nav, labels, buttons, form inputs |

Both are loaded via Google Fonts `<link>` tags in `index.html` (Fraunces: weights 300/400/500 +
italic 400; Inter: weights 400/500/600).

### Scale (as used, not a rigid token list)

| Context | Classes | Notes |
|---|---|---|
| Hero headline | `text-[13vw] md:text-[6.5rem] leading-[0.95]` | Fluid on mobile, capped on desktop |
| Page title (H1) | `text-5xl md:text-7xl leading-[1.02]` | Used on About, Projects, Blog, Resume, Contact |
| Section heading (H2) | `text-4xl md:text-5xl` | Via `SectionHeading` component |
| Card / list title (H3) | `text-2xl` to `text-3xl` | Project cards, blog list items |
| Body / lead paragraph | `text-lg leading-relaxed` | `text-ink-soft` |
| Small / label / eyebrow | `text-xs uppercase tracking-[0.2em]` | Section eyebrows, dates, tags |

**Eyebrow pattern:** every section/page intro uses a small uppercase tracked label with a short
horizontal rule (`w-8 h-px bg-accent`) — this is the site's signature heading motif. Reuse it
verbatim (see `SectionHeading.tsx` and the repeated markup at the top of each page).

## 4. Layout & Spacing

- **Container:** `max-w-6xl mx-auto px-6 md:px-10` for standard pages; `max-w-3xl` /
  `max-w-4xl` for narrower reading contexts (Contact, Resume, blog article body).
- **Vertical rhythm:** sections use `py-16 md:py-24` (page-level) or `py-24 md:py-32`
  (homepage sections). Don't introduce a third value without reason.
- **Breakpoint:** the site is effectively two-tier — mobile default, `md:` (768px) for
  desktop. There is no separate tablet-specific tier.
- **Border radius scale:** `rounded-full` for pills/buttons/badges/avatars, `rounded-2xl` for
  image blocks and large surfaces, `rounded-xl` for smaller image thumbnails (blog list). No
  other radius values are used — don't introduce `rounded-lg` or `rounded-md`.

## 5. Iconography

- **Library:** [lucide-react](https://lucide.dev), used at `size={16}`–`size={22}` depending on
  context (inline-with-text vs. standalone button icon).
- **Brand icons exception:** Lucide dropped brand/logo marks. GitHub and LinkedIn icons are
  hand-rolled SVGs in `components/ui/BrandIcons.tsx` (`GithubIcon`, `LinkedinIcon`), matching
  Lucide's `size`/`className`/`currentColor` stroke API so they drop in interchangeably with
  real Lucide icons.
- **Style:** all icons are outline/stroke style (Lucide default), never filled, `currentColor`
  so they inherit text color and respond to hover states automatically.

## 6. Imagery

- **Source:** Unsplash CDN (`images.unsplash.com/photo-<id>?q=80&w=<size>&auto=format&fit=crop`)
  — placeholder imagery only, to be replaced with real project screenshots / personal photos.
- **Treatment:** always `object-cover` inside a fixed-aspect container (`aspect-[4/3]`,
  `aspect-[4/5]`, `aspect-video`), always rounded (`rounded-xl`/`rounded-2xl`), never raw
  `<img>` without a wrapping aspect box — this keeps layouts stable while loading.
- **Hover treatment (project/blog cards only):** subtle scale on hover
  (`group-hover:scale-105`, 700ms ease) plus a soft ink overlay tint — never on static/hero
  imagery.

## 7. Components

### Buttons
- **Primary (filled):** `bg-ink text-paper rounded-full px-6 py-3.5`, hover → `bg-accent`.
- **Secondary (outline):** `border border-line rounded-full px-6 py-3.5`, hover → `border-ink`.
- Both always pill-shaped (`rounded-full`); the site has no square/rectangular buttons.

### Tags / pills (skills, stack badges)
`text-xs px-2.5–4 py-1–2 rounded-full border border-line text-ink-soft`, hover → border/text
`accent` where interactive (About/Resume skill chips).

### Cards (`ProjectCard`)
Image block (numbered badge top-left) → title + arrow icon (animates on hover) → stack tags.
Whole card is a single `<Link>` — no separate "view" button inside a card.

### Links with underline-on-hover
Text CTA pattern: `border-b border-ink pb-1`, hover → `text-accent border-accent`. Used for
in-page "See all projects" / "More about me" style links instead of buttons when the action is
secondary.

### Navigation
Fixed header, `bg-paper/80 backdrop-blur-sm`, `border-b border-line`, 80px (`h-20`) tall.
Active route uses solid `text-ink`; inactive uses `text-ink-soft`. Mobile breakpoint swaps to a
full-width dropdown panel with larger (`text-lg font-display`) links.

### Forms
Borderless/underline inputs (`border-b border-line`, focus → `border-ink`), no boxes or
background fills — consistent with the site's flat, line-driven aesthetic. Inline validation
errors render in `text-accent` directly below the field.

### Footer
Large `font-display` CTA line, email link, social icon buttons (`w-11 h-11 rounded-full border
border-line`, hover → filled `bg-ink text-paper`). Present on every page via the shared
`Layout`.

## 8. Motion & Interaction

| Pattern | Implementation | Notes |
|---|---|---|
| Scroll reveal | `Reveal` component (Framer Motion `whileInView`, `y: 24 → 0`, `opacity: 0 → 1`, `once: true`) | Standard entrance for nearly every section; stagger via `delay` prop in increments of ~0.05–0.1s |
| Hero headline reveal | Word-by-word stagger (`staggerChildren: 0.05`) on mount | Home page only — reserved for the single biggest headline on the site |
| Page transitions | `AnimatePresence` + `motion.main` fade/slide (`y: 12 → 0`, 0.35s) keyed on route | Lives in `Layout.tsx`, applies globally |
| Custom cursor | `Cursor.tsx` — 14px dot, `mix-blend-mode: difference`, grows to 40px + accent fill over any `a`, `button`, or `[data-cursor-hover]` | Desktop only (`hidden` below `md:`); mark any new clickable custom element with `data-cursor-hover` |
| Easing | `[0.22, 1, 0.36, 1]` (a soft ease-out) | The one easing curve used everywhere — don't introduce a different curve without reason |
| Skills marquee | CSS `@keyframes marquee`, infinite linear scroll, 28s | Home page only |

## 9. Texture

A fixed, full-viewport SVG fractal-noise overlay (`.grain::before`, opacity `0.045`) sits above
all content (`z-index: 60`, `pointer-events: none`). It's applied once at the `Layout` root
(`grain` class) — don't reapply per-page.

## 10. Accessibility Notes

- Body copy sits at `ink-soft` (`#4a4843`) on `paper` (`#f6f4ef`) — passes WCAG AA for normal
  text; verify contrast again if either token changes.
- The accent orange (`#ff5a1f`) is used for interactive states and small text (eyebrows, tags)
  but never as the *only* signal for critical information — errors also use explicit copy, not
  color alone.
- Custom cursor and marquee are decorative and disabled/hidden on mobile; neither blocks
  keyboard or screen-reader use of the underlying interactive elements.
- All interactive elements remain real `<a>`/`<button>`/form elements — motion and custom
  cursor styling are layered on top, not a replacement for semantic markup.

## 11. Source of Truth

All tokens live in `frontend/src/index.css` (`@theme` block). Shared primitives live in
`frontend/src/components/ui/` (`Reveal`, `SectionHeading`, `ProjectCard`, `Cursor`,
`BrandIcons`). When in doubt, match an existing page (`Home.tsx`, `Projects.tsx`, etc.) rather
than inventing a new pattern.
