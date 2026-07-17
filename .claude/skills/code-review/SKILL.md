---
name: code-review
description: Deep code review for this project — root cause analysis (5 Whys), security check, and performance check, with findings classified Critical/High/Medium/Low and written to docs/code-reviews/. Use for reviewing the current diff, a PR, specific files, or a full-repo audit. Intended to override the general-purpose /code-review for this project (see the session-caching caveat below — the override may not take effect until the next new session after this file is created or edited).
---

# Code Review (RCA + Security + Performance)

This is a heavier, documentation-producing review than a quick lint pass. Every finding gets
traced to a root cause, not just described at the symptom level, and every review leaves behind
a persistent markdown record under `docs/code-reviews/`.

**Caveat — if you're reading this because `/code-review` just ran the generic built-in process
instead of this one:** project-scoped skills can require a new session (or an explicit request
naming this skill) before they're picked up — creating or editing this file mid-session doesn't
guarantee the very next `/code-review` in that same session resolves to it. If that just
happened, don't silently accept the generic output as a substitute: say so, and either ask the
user to re-run `/code-review` in a fresh session, or explicitly follow these instructions now
regardless of which command loaded.

## 1. Determine scope

Look at `args` (the text passed to this skill):

- **Empty** → review the current diff. Check `git status --porcelain` first: if it lists
  untracked files (`??`), run `git add -N <those files>` (intent-to-add) so they show up in a
  diff instead of being invisible to it — plain `git diff` silently omits untracked files
  entirely, which would make a brand-new file with no `git add` yet invisible to this review.
  Then run `git diff HEAD` — **not** a `git diff` / `git diff --staged` fallback chain: with a
  mix of already-staged changes and a newly intent-to-added file, `git diff` alone shows only
  the intent-to-add file and `git diff --staged` alone shows only the staged one, so checking
  them as a first-non-empty-wins chain silently drops whichever one isn't checked first. `git
  diff HEAD` compares the working tree directly against the last commit and unions both in one
  pass. If `git diff HEAD` is empty (nothing pending at all, tracked or new), fall back to `git
  diff HEAD~1` (the last commit). Tell the user which one you picked, and whether it included
  newly-added untracked files.
- **A PR reference** (`#123`, `123`, or a PR URL) → `gh pr diff <number>`, plus `gh pr view
  <number>` for context.
- **A path or paths** (files/directories) → full review of those files as they currently stand
  (not a diff — read the whole file for context, but scope findings to that path).
- **`full` / `repo` / `everything`** → whole-repo audit. State up front which directories you're
  covering (e.g. `frontend/src`, `devops/`, `.github/`) and skip generated/vendored code
  (`node_modules`, `dist`, `.terraform`).
- **Contains `--apply` / `apply fixes` / `and fix it`** → after producing the report, don't just
  offer to fix — go ahead and implement the Critical/High recommendations (see step 6).

If the scope is ambiguous or the diff is empty with nothing else to go on, ask rather than
guessing.

## 2. Read before judging

Read every changed/reviewed file in full (not just the diff hunks) — a line that looks wrong in
isolation is often correct given the surrounding function. For anything touching a shared
utility, component, or config, grep for its other call sites so you understand blast radius
before flagging it.

## 3. Three lenses

Run all three over the same scope. A single finding can span more than one lens (e.g. a
performance bug caused by a security-motivated but overly broad re-render guard) — note that
rather than forcing it into one bucket.

### Root Cause Analysis (correctness)

Look for actual defects: logic errors, wrong assumptions, unhandled edge cases, race conditions,
off-by-ones, incorrect error handling, state that can desync, type-unsafe escapes (`any`, `!`,
`@ts-ignore`) hiding a real gap. For each one, don't stop at "what's wrong" — apply the 5 Whys
(see step 4) to find *why it was possible for this to be wrong in the first place*.

### Security Check

Work through this project's actual attack surface, not a generic checklist recited blindly:

- **Input handling:** injection (SQL/command/template), XSS, unvalidated/unsanitized user input
  reaching a render, a query, a shell command, or a file path.
- **Auth/access control:** missing or client-only auth checks, broken object-level access
  control (one user reading/editing another's data), privilege escalation paths.
- **Secrets:** credentials, tokens, or keys in source, committed `.env` files, secrets logged or
  sent to the client, overly broad token scopes.
- **Dependencies & config:** known-vulnerable packages, insecure defaults, permissive CORS,
  missing CSRF protection on state-changing requests, cookies without `Secure`/`HttpOnly`.
- **Infra/deploy:** anything in `devops/`, `.github/workflows/`, or Terraform that widens
  blast radius — overly broad IAM/token scopes, secrets in CI logs, unpinned action versions
  pulling arbitrary code, `pull_request_target` misuse.
- **Client-side specifics** (this is a React/Vite app): `dangerouslySetInnerHTML` without
  sanitization, `eval`/`new Function`, unsanitized URLs passed to `href`/`src`, prototype
  pollution via unchecked object merges.

Severity here should reflect actual exploitability given how the app is deployed (a static
GitHub Pages frontend with no server-side secrets has a different risk profile than a future
NestJS API with a database behind it — say so explicitly when it changes the rating).

### Performance Check

- **Algorithmic:** avoidable O(n²)+ where O(n) or O(n log n) is straightforward, repeated
  work inside loops/renders that could be hoisted or memoized.
- **React-specific:** unnecessary re-renders (missing `memo`/`useMemo`/`useCallback` where it
  actually matters — not everywhere reflexively), expensive work in render bodies, large
  unmemoized lists without virtualization, effects that re-run more than intended, layout
  thrash from animation/scroll handlers.
- **Network/asset:** unoptimized images, render-blocking resources, missing lazy-loading for
  below-the-fold content, bundle bloat from an unnecessarily large dependency.
- **Backend/data** (once relevant): N+1 queries, missing indexes, synchronous I/O in a hot
  path, unbounded result sets, missing pagination.
- **Resource leaks:** uncleared `setInterval`/`setTimeout`/event listeners/observers,
  growing caches with no eviction.

Only flag what would show up in a profile or a real user's experience — don't invent
micro-optimizations with no measurable effect; that belongs in a simplification pass, not here.

## 4. 5 Whys — drill down on anything Medium or above

For every finding rated Medium, High, or Critical (step 5), run the 5 Whys before writing the
recommendation:

1. **Why did this happen?** (the immediate technical cause)
2. **Why did *that* happen?** (what let the immediate cause occur)
3. **Why did *that* happen?** (keep going — process, missing test, missing type safety, unclear
   ownership, absent validation layer, no code review on this path, etc.)
4. **Why did *that* happen?**
5. **Why did *that* happen?** — you don't always need exactly five; stop when you hit something
   *actionable and systemic* (e.g. "there's no input validation layer on this route" is a real
   root cause; "the developer made a mistake" is not — keep going past that). If you hit bedrock
   in 3 whys, stop at 3; if 5 isn't enough, keep going.

Write the chain out in the report (see template) — the recommendation should address the root
cause identified at the end of the chain, not just patch the symptom at Why #1. If the root
cause is systemic (e.g. "no schema validation anywhere on this API"), say so even if fixing it
fully is bigger than this one finding — note it as a separate Critical/High item of its own.

## 5. Classify every finding

| Severity | Meaning | Examples |
|---|---|---|
| **Critical** | Actively exploitable now, or breaks core functionality/data integrity in normal usage. Ship-blocking. | Auth bypass, secret committed to a public repo, XSS reachable from an unauthenticated route, data-loss bug in the main user flow. |
| **High** | Real risk or defect, but needs a specific (if plausible) condition to trigger, or is a significant hardening gap rather than an open door. | Missing server-side validation backed by client-side validation only, a race condition under concurrent use, an N+1 query that will bite at real traffic. |
| **Medium** | Genuine issue with limited blast radius, an edge case, or a defense-in-depth gap — not urgent but shouldn't be ignored. | Missing rate limiting, an unhandled rare edge case with a safe-ish failure mode, a moderate unnecessary re-render. |
| **Low** | Correct but suboptimal — style, minor inefficiency, theoretical/very-low-likelihood issue, nice-to-have hardening. | Missing memoization with no measurable impact, verbose but harmless code, a defense-in-depth suggestion with no realistic threat model. |

Don't inflate severity to make the report look more thorough, and don't downplay a real
Critical to avoid a hard conversation — the rating drives what the user acts on first.

## 6. Write the report

Create the output directory if it doesn't exist, then write the report to:

```
docs/code-reviews/{YYMMDD}-{HHMM}-{slug}.md
```

- `{YYMMDD}` / `{HHMM}` — current local date/time (`date +%y%m%d` / `date +%H%M`), e.g. `250716-1430`.
- `{slug}` — short kebab-case description of what was reviewed (e.g. `frontend-diff`,
  `contact-form`, `full-repo-audit`, `pr-42`).

Get the timestamp with `date` rather than guessing it.

### Report template

```markdown
# Code Review — {scope description}

**Date:** {ISO date/time}
**Scope:** {what was reviewed — diff / PR #N / paths / full repo}
**Reviewed by:** Claude (code-review skill)

## Summary

{2-4 sentences: overall state, standout risks, whether this is shippable as-is.}

| Severity | Count |
|---|---|
| Critical | N |
| High | N |
| Medium | N |
| Low | N |

## Findings

### Critical

#### [C1] {short title}
- **Lens:** RCA / Security / Performance
- **Location:** `path/to/file.ts:line`
- **What's wrong:** {concrete description}
- **5 Whys:**
  1. Why? {...}
  2. Why? {...}
  3. Why? {...}
  (continue as needed)
- **Root cause:** {the systemic thing identified at the end of the chain}
- **Recommendation:** {specific, actionable fix addressing the root cause}

(repeat per finding)

### High
(same structure)

### Medium
(same structure — 5 Whys still required)

### Low
(same structure — 5 Whys optional; a one-line rationale is enough)

## Recommended order of work

1. {Critical/High items in the order they should be tackled, with a one-line reason if the
   order isn't obvious — e.g. a High blocks the fix for a Critical}
```

After writing the file, tell the user the path and give a short verbal summary (don't just say
"see the file" — state the count by severity and the single most important thing to fix).

## 7. Offer to apply fixes

After the report is written:

- If the scope text requested `--apply`/"apply fixes"/"and fix it", implement the Critical and
  High recommendations now, then re-run the affected part of step 3 to confirm each is actually
  resolved, and update those findings' entries in the report file with a `**Status:** Fixed`
  line.
- Otherwise, ask the user whether to implement the Critical/High recommendations now. Don't
  touch Medium/Low without being asked — those are judgment calls for the user, not
  auto-applied.

Never apply a fix for a finding you're not confident about (rated PLAUSIBLE-not-CONFIRMED in
your own head) — say so and ask instead of guessing at a change to security- or data-sensitive
code.
