# Code Review — `.claude/skills/code-review/SKILL.md` (self-review)

**Date:** 2026-07-16T19:10 (local, UTC+8)
**Scope:** New file `.claude/skills/code-review/SKILL.md` and `docs/code-reviews/.gitkeep`
(reviewed via `git diff HEAD` after `git add -N` to include the untracked files — see Finding
[H2] below, found by hitting the exact bug it describes while trying to diff this review's own
scope).
**Reviewed by:** Claude, following the process this skill itself defines (executed manually —
see "Why this report exists" below)

## Why this report exists

This review was supposed to run via `/code-review` inside this project, which should resolve to
this custom skill instead of Claude Code's built-in generic one. It didn't: `/code-review` ran
the built-in generic 8-angle finder process instead, reported findings through the generic
`ReportFindings` tool, and — because that built-in process has no concept of
`docs/code-reviews/` — never produced the markdown record the user expected. That gap is itself
Finding [H1] below. This document was written by manually following this skill's own
instructions after the fact, once the built-in process's findings made the underlying bug clear.

## Summary

Two real bugs found in the skill's own instructions, both confirmed via independent verification
(one empirically, by reproducing the exact git behavior in a scratch repo). Both are now fixed
in `.claude/skills/code-review/SKILL.md`. A third candidate (a forward step-reference between
"5 Whys" and "Classify severity") was investigated and refuted — it's a normal, unambiguous
instructional-document pattern, not a real defect.

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 2 |
| Medium | 0 |
| Low | 0 |

## Findings

### High

#### [H1] Override claim not honored within the session it's created in
- **Lens:** RCA
- **Location:** `.claude/skills/code-review/SKILL.md:3` (frontmatter `description`)
- **What's wrong:** The description asserted, as unconditional fact, that this skill "Overrides
  the general-purpose /code-review for this project." In the same session the file was created,
  invoking `/code-review` loaded the built-in generic skill instead — not this one. A follow-up
  direct `Skill` tool call by name (`code-review`) mid-session *also* resolved to the
  already-loaded built-in skill ("Skill /code-review is already loaded above; instructions
  unchanged") — confirming this isn't a one-time fluke but a hard session-scoping behavior: once
  a skill name is loaded in a session, it's pinned for that session regardless of files created
  afterward.
- **5 Whys:**
  1. Why did `/code-review` load the built-in skill instead of the new project one? Because
     skill name resolution had already loaded/pinned "code-review" to the built-in skill earlier
     in the session, before this project skill file existed.
  2. Why didn't creating the file change that? Because skill resolution appears to happen once
     per name per session, not freshly on every invocation.
  3. Why did a direct, explicit `Skill` tool call by name not force a re-resolution either? Because
     the pinning is keyed on the skill name itself ("code-review already loaded above"), not on
     the invocation method — so there's no in-session escape hatch, only a fresh session.
  4. Why did the skill's documentation not anticipate this? Because it was written and shipped
     without first testing "does this override actually take effect in the same session it's
     authored in" — an easy check that would have caught this before the user hit it.
  5. Root cause: the skill was authored making a claim about runtime routing behavior without
     verifying that behavior end-to-end first, and the underlying constraint (skill names are
     resolved once per session) isn't something a SKILL.md file can control or work around —
     only document.
- **Root cause:** Unverified claim about session-scoped skill routing, combined with a genuine
  harness constraint (no in-session re-resolution) that can only be documented, not fixed from
  within the file.
- **Recommendation:** Done — softened the frontmatter claim and added an explicit caveat section
  near the top of the file explaining the session-scoping limitation and what to do if it's hit
  (tell the user plainly, don't silently treat the generic output as equivalent, offer a fresh
  session or fall back to manually following the instructions — which is exactly what produced
  this report).
- **Status:** Fixed (documentation-level fix; the underlying session-scoping behavior itself is
  a harness constraint, not something this file can override).

#### [H2] "Current diff" scope detection is blind to untracked files
- **Lens:** RCA
- **Location:** `.claude/skills/code-review/SKILL.md:16` (the "Empty →" scope-detection branch)
- **What's wrong:** The empty-args fallback chain was `git diff` → `git diff --staged` → `git
  diff HEAD~1`. None of those show untracked files — confirmed empirically in a scratch repo
  (`git init && echo x > new.txt && git diff` prints nothing). So a brand-new file with no `git
  add` yet — the single most common trigger for "review what I just wrote" — was invisible to
  the whole fallback chain, which would silently fall through to reviewing the *previous commit*
  instead and never look at the new file at all. This bug was caught by hitting it directly:
  gathering the diff for *this very review* required manually running `git add -N` before
  `git diff HEAD` showed anything.
- **5 Whys:**
  1. Why did the scope logic miss untracked files? Because `git diff` (no flags) only shows
     changes to already-tracked files by git's design; untracked files require `git add -N`,
     `git diff --no-index`, or an explicit read to surface.
  2. Why wasn't that accounted for when the branch was written? Because "current diff" was
     implicitly modeled as "modifications to tracked files," not the broader and more common
     case of "everything pending, including brand-new files."
  3. Why did that gap go unnoticed before shipping the skill? Because the skill's scope-detection
     logic wasn't dry-run against a realistic "new untracked file" scenario before being written
     up as instructions.
  4. Why no dry run? Because the file was authored as a prompt/instruction document and reviewed
     by inspection, not executed end-to-end against test scenarios during creation.
  5. Root cause: no validation step for the skill's own scope-detection logic against the most
     common real-world trigger (a new, not-yet-staged file) before finalizing the instructions.
- **Root cause:** Scope-detection logic modeled "current diff" too narrowly (tracked-file
  changes only) and was never dry-run against the untracked-file case before shipping.
- **Recommendation:** Done — the "Empty →" branch now checks `git status --porcelain` for `??`
  (untracked) entries first and runs `git add -N` on them before diffing, so new files are
  included in scope instead of silently falling through to a stale commit.
- **Status:** Fixed.

## Recommended order of work

1. Both fixes are already applied to `.claude/skills/code-review/SKILL.md`.
2. Start a new session before relying on `/code-review` to resolve to this custom skill —
   within the current session it will keep resolving to the built-in generic one regardless of
   further edits to this file (see [H1]).
3. Once in a fresh session, re-run `/code-review` on an actual code change to confirm both this
   report-writing behavior and the untracked-file scope detection work end-to-end.
