# Copilot Crawl — README

This directory (`.copilot-track/crawl/`) stores artefacts produced during AI-assisted development of **vscode-chef**. It covers three conventions the team has adopted: **chain-PRs**, **evidence in PRs**, and **prompt usage**.

---

## Chain-PRs

A *chain-PR* is a sequence of pull requests where each PR builds on the merged state of the previous one.

**When to use chain-PRs:**
- A large feature must be reviewed in digestible, independently-shippable slices.
- Later PRs depend on types, interfaces, or behaviours introduced in earlier PRs.
- You want reviewers to approve foundational changes before seeing the full implementation.

**How to open a chain:**
1. Branch off `main` → `feat/topic-part-1`.
2. Open PR #A targeting `main`.
3. Branch off `feat/topic-part-1` → `feat/topic-part-2`.
4. Open PR #B targeting `feat/topic-part-1` (not `main`).
5. After PR #A merges, GitHub automatically re-targets PR #B to `main` — rebase if needed.

**Tips:**
- Label chain PRs with `chain-pr` and note the chain order in the description (e.g. *"2 of 3 — depends on #A"*).
- Keep each PR independently understandable; avoid forcing reviewers to read earlier PRs to understand the current one.

---

## Evidence in PRs

Every AI-assisted PR should include evidence that the change works as intended. This builds reviewer confidence and creates a paper trail for future debugging.

**Minimum evidence bar:**
| Change type | Required evidence |
|---|---|
| Linter / diagnostics | Screenshot or terminal output showing correct diagnostics |
| Snippet addition | Screen recording or GIF of completion in action |
| Grammar / highlighting | Screenshot of highlighted file before vs. after |
| Build / tooling | CI log link or pasted `tsc` / `npm run package` output |
| Snippet autogeneration | Diff of generated JSON showing new/changed entries |

**Where to put it:**
- Paste directly into the PR description under a `## Evidence` section.
- For larger files (recordings, logs) attach them as PR comments or link to a Gist.

---

## Prompt Usage

Prompts used to drive Copilot during development are cached in this directory so they can be audited, improved, and reused.

**File naming convention:**

```
.copilot-track/crawl/<YYYY-MM-DD>-<slug>.md
```

Example: `2026-05-24-add-inspec-snippets.md`

**Prompt file structure:**

```markdown
# Prompt: <short title>

## Date
YYYY-MM-DD

## Goal
One sentence describing what you asked Copilot to do.

## Prompt text
> Paste the exact prompt(s) sent to Copilot here.

## Outcome
Brief description of what was produced and whether it was accepted, modified, or rejected.

## Lessons learned
Optional. What worked, what didn't, what to try next time.
```

**Guidelines:**
- Commit prompt files alongside the PR they produced — reviewers can then reproduce or audit the AI output.
- If a prompt required several iterations, record all versions in order.
- Do not include secrets, API keys, or personal data in prompt files.
- Prompts are documentation, not code — they do not need to pass CI.
