# Code Review — `.claude/skills/code-review/SKILL.md` (round 2, self-review)

**Date:** 2026-07-18T06:13 (local, UTC+8)
**Scope:** Working-tree diff of `.claude/skills/code-review/SKILL.md`, `docs/code-reviews/.gitkeep`,
and the untracked `docs/code-reviews/260716-1910-code-review-skill-fixes.md` from the prior
round (none of this has been committed yet — see "Why this report exists").
**Reviewed by:** Claude, following this skill's own process (executed manually — the loaded
`/code-review` invocation again resolved to Claude Code's built-in generic skill, not this file)

## Why this report exists

Same root cause as the previous round's [H1] finding, now reconfirmed: this is still the same
session the skill file was created and first fixed in. `/code-review` loaded the built-in
generic process again rather than this custom one — proven directly by the fact that
`.claude/skills/code-review/SKILL.md` itself still shows as staged-but-uncommitted in `git
status`, meaning no new session has started since the last round. Per this skill's own
documented caveat, the generic output was not treated as a substitute: the generic process's
finder step was used to gather one real candidate, which was then verified, fixed, and written
up here in this skill's own format.

## Summary

One further real bug found in the fix applied during the previous round — the untracked-file
handling from round 1 ([H2] in the prior report) was directionally correct but incomplete: it
introduced a new gap where a mix of staged changes and a newly-added untracked file would cause
the staged changes to be silently dropped. Confirmed empirically (not just by inspection) in a
scratch repo. Fixed by replacing the `git diff` / `git diff --staged` fallback chain with a
single `git diff HEAD`, which unions both cases correctly.

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 1 |
| Medium | 0 |
| Low | 0 |

## Findings

### High

#### [H3] Fallback-chain scope detection drops staged changes when an untracked file is also present
- **Lens:** RCA
- **Location:** `.claude/skills/code-review/SKILL.md:24` (the "Empty →" branch, as fixed in the
  previous round)
- **What's wrong:** Round 1 fixed the "untracked files are invisible to `git diff`" bug ([H2])
  by adding `git add -N` for untracked files, then kept the original `git diff` → `git diff
  --staged` → `git diff HEAD~1` fallback chain, using "first non-empty wins." That's the bug:
  `git add -N` makes the new file's content appear in plain `git diff` (working tree vs index),
  which is a *different* comparison than `git diff --staged` (index vs HEAD, where real staged
  changes to other files live). If both exist at once — a deliberately staged real change, plus
  a separate new untracked file — plain `git diff` is non-empty (because of the intent-to-add
  file) and the chain stops there, never checking `--staged`, so the staged change is silently
  skipped entirely.
- **5 Whys:**
  1. Why did the round-1 fix still miss staged changes in this scenario? Because it kept a
     first-non-empty-wins fallback chain across two comparisons (`git diff` and `git diff
     --staged`) that cover disjoint content, instead of a single comparison that covers both.
  2. Why did the round-1 fix keep that chain instead of unifying the comparison? Because the fix
     was scoped narrowly to "make untracked files visible" and verified only against the
     untracked-only case, not the mixed staged-plus-untracked case.
  3. Why wasn't the mixed case tested before the round-1 fix was considered done? Because, same
     as the root cause identified for the original [H2] bug, the fix was written and reviewed by
     inspection rather than dry-run against realistic combined scenarios.
  4. Why does this keep happening across two rounds of fixing the same section? Because
     verifying git-plumbing-dependent instructions by reading them is not equivalent to running
     them — the class of bug (fallback chains over git commands with overlapping-but-not-identical
     scope) isn't visible from the text alone.
  5. Root cause: the scope-detection logic is git-behavior-sensitive prose that was being
     validated by inspection instead of empirical execution, twice in a row for the same
     underlying reason.
- **Root cause:** Same systemic gap as [H2] in the previous round — instructions describing git
  plumbing behavior weren't empirically dry-run before being considered fixed, this time missing
  a second, subtler interaction the first fix's testing didn't cover.
- **Recommendation:** Done — replaced the fallback chain with a single `git diff HEAD` after the
  untracked-file `git add -N` step, which unions staged, unstaged, and intent-to-added content
  in one comparison against the last commit. Falls back to `git diff HEAD~1` only when `git diff
  HEAD` itself is empty (i.e. truly nothing pending). Verified empirically: a scratch repo with
  one staged modification to an existing file plus one new untracked file shows both in `git
  diff HEAD`, where the old chain showed only one or the other depending on which check ran
  first.
- **Status:** Fixed.

## Recommended order of work

1. Fix is already applied to `.claude/skills/code-review/SKILL.md`.
2. Given this is the second bug found in the same fallback-chain logic across two rounds, the
   next actual test of this skill (once a fresh session lets `/code-review` resolve to it) should
   specifically include a mixed staged + untracked scenario, not just a clean single-change diff,
   to close out this class of bug rather than finding a third variant later.
3. As before: a new session is required before `/code-review` will resolve to this file instead
   of the built-in generic skill.
