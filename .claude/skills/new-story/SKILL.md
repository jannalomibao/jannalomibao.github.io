---
name: new-story
description: Draft a new feature story from docs/templates/01-story-template.md, deep-diving the idea with the user via AskUserQuestion first, then saving it to docs/tasks/ following the template's naming convention. Use when the user wants to write up/plan/spec a new feature or capability for this project.
---

# New Story

Turns a feature idea into a filled-out story doc under `docs/tasks/`, using
`docs/templates/01-story-template.md` as the structure. Don't skip the deep-dive step (2) to
save time — a story drafted from a one-line idea with no clarification is exactly the kind of
thin, guessed-at spec this step exists to prevent.

## 1. Get the feature idea

Read `args` (the text passed to this skill). If it's empty or too vague to act on ("something
for the blog"), ask directly what feature/capability they want to build — don't invent one.

## 2. Deep-dive with AskUserQuestion

Before drafting anything, read the template fresh:
`docs/templates/01-story-template.md` — never rely on a remembered copy, the user may have
edited it. Also skim [`docs/02-prd.md`](../../../docs/02-prd.md) and
[`docs/05-user-stories.md`](../../../docs/05-user-stories.md) for the relevant persona/epic this
feature fits under, so the questions below are grounded in the actual project, not generic.

Then use **AskUserQuestion** to flesh out whatever the initial idea leaves ambiguous. Don't ask
a fixed checklist — pick the 1-4 questions that actually matter for *this* feature. Things worth
probing, as relevant:

- **Who is this for** — which persona (recruiter/visitor, technical interviewer, the site owner)
  drives the "As a ___" in the Goal section, if not obvious from the idea.
- **The core flow** — what triggers it, what the user does step by step, what happens on
  success/failure. This is what the mermaid diagram (step 3) will represent, so get enough detail
  to actually draw it, not just a one-line summary.
- **Layout/UI shape** — rough structure of the screen(s)/component(s) involved, enough to sketch
  the ASCII wireframe. Skip this if the feature has no UI surface (e.g. a backend-only job).
- **Scope edges** — what's explicitly out of scope for this story, error/empty states worth
  calling out, anything that would otherwise get silently assumed.

Keep it tight — this is a deep-dive on the one feature at hand, not a full requirements
interview. If the user's initial description already answers something clearly, don't re-ask it.

## 3. Determine the file name

Per the template's own "File instruction" section (`{###}-{slug}.md`):

- **`{###}`** — list `docs/tasks/*.md`, take the highest existing 3-digit prefix, add 1,
  zero-pad to 3 digits. Empty/missing directory → start at `001`.
- **`{slug}`** — short kebab-case description of the feature (2-5 words), derived from the idea
  now that step 2 has sharpened it.

## 4. Fill the template

Use the template's structure (Goal / Description / UACs) as the output — the "File instruction"
section is meta-guidance for naming the file (step 3), not content to repeat in the generated
story.

- **Goal** — `As a {persona}, I want {capability}, so that {benefit}.` Use the persona and
  capability nailed down in step 2, not a generic placeholder.
- **Description** — bullets describing what the feature actually is (grounded in step 2's
  answers), plus:
  - A **mermaid.js diagram** visualizing the flow — a flowchart for a UI/navigation-driven
    feature, a sequence diagram for a client/server/API-driven one. Use whichever actually
    represents what step 2 described; don't force a flowchart onto something that's really a
    request/response exchange.
  - An **ASCII representation** of the layout — a rough monospace box-drawing wireframe of the
    screen/component involved. Omit this if the feature has no UI surface, rather than padding
    with a meaningless box.
- **UACs** — concrete, demoable bullets in the template's `Demo that ...` phrasing. Each one
  should be something you could actually click through and verify, not a restated requirement.

## 5. Save and report

Write to `docs/tasks/{###}-{slug}.md`. Tell the user the path, and give a one-sentence summary
of what the story covers — don't just say "done, see the file."
