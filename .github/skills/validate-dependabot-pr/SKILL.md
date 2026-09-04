---
name: validate-dependabot-pr
description: Validates open Dependabot npm PRs in chef/vscode-chef against Harness Artifact Registry (HAR) compliance, reviews the actual dependency change, confirms the ci GitHub workflow (validate + build) is green, and verifies the extension still packages and installs correctly. Produces a per-PR merge-readiness report. Never approves, comments on, or merges PRs — a human always merges manually. Use this when asked to validate, review, or check open Dependabot PRs in vscode-chef before merging.
---

You are running the Dependabot PR validation skill for chef/vscode-chef.

IMPORTANT: You only report. Never run `gh pr merge`, `gh pr review --approve`, or
post PR comments unless the user explicitly asks you to after seeing the report.

This repo uses **npm only** (no pnpm-workspace.yaml or yarn.lock). Its HAR baseline
lives in the root `.npmrc`:
```
registry=https://pkg.harness.io/pkg/ct8onj8YTdaXtKaFsYCRLg/org-chef-npm/npm/
@jsr:registry=https://pkg.harness.io/pkg/ct8onj8YTdaXtKaFsYCRLg/org-chef-npm/npm/
ignore-scripts=true
min-release-age=14   # stricter than the HAR doc's 7-day default — treat 14 as
                      # this repo's authoritative floor; never suggest lowering it.
package-lock=true
```

When invoked, do the following:

## 1. Discover open Dependabot PRs

```bash
gh pr list --repo chef/vscode-chef --author "app/dependabot" --state open \
  --json number,title,headRefName,headRefOid,url
```

If none are open, report that and stop.

## 2. For each PR, run all of the following checks

### a. HAR compliance check

`gh pr diff <n>` does NOT support path filters (`-- <path>` is rejected with
"accepts at most 1 arg(s)") — always pull the full diff and grep/filter it
via pipes (no temp files needed). Derive the HAR host from this repo's own
`.npmrc` rather than hardcoding it, so the check stays correct if the org
path or host ever changes:

```bash
HAR_HOST="$(grep '^registry=' .npmrc | sed -E 's#^registry=https?://([^/]+)/.*#\1#')"
if [ -z "$HAR_HOST" ]; then echo "ERROR: could not derive HAR_HOST from .npmrc" >&2; exit 1; fi
gh pr diff <n> --repo chef/vscode-chef | grep -A 20 '^diff --git a/\.npmrc '
gh pr diff <n> --repo chef/vscode-chef | grep -A 40 '^diff --git a/package\.json '
gh pr diff <n> --repo chef/vscode-chef | grep '"resolved"' | grep '^+' | grep -v "$HAR_HOST"
```

- **Never skip this check if `HAR_HOST` is empty** — an empty pattern passed to
  `grep -v` would suppress all output and make the bypass check falsely appear
  clean. The `exit 1` guard above prevents this; if it fires, stop and report
  that HAR compliance could not be verified rather than assuming a pass.
- FAIL if the `.npmrc` hunk removes or weakens any of: the `$HAR_HOST`
  registry URL, `@jsr:registry`, `ignore-scripts=true`, `min-release-age=14`
  (raising it above 14 is fine; lowering below 14 is not), or
  `package-lock=true`.
- FAIL if the third command above prints any added (`+`) `"resolved"` line
  not pointing at `$HAR_HOST` — that means the lockfile was regenerated
  bypassing HAR (resolved against `registry.npmjs.org`).
- PASS if only version/integrity/resolved-HAR-URL fields changed and the
  hardening lines above are untouched (this is the normal, expected case
  for routine Dependabot bumps).

### b. Dependency change check

- From the same diff, extract: package name(s) changed, old → new version,
  whether it's in `dependencies` or `devDependencies`, and whether it's a
  direct top-level bump (matches a `package.json` line) or purely transitive
  (only appears in `package-lock.json`).
- Flag major-version bumps distinctly from minor/patch — they need closer
  human review of changelogs/breaking changes.

### c. CI workflow check (`.github/workflows/ci.yml`: jobs `validate`, `build (22.19.0)`)

```bash
gh pr checks <n> --repo chef/vscode-chef
```

This prints one line per check with a `pass`/`fail`/`pending`/`skipping`
status column (e.g. `build (22.19.0)  pass  1m6s  <url>`). For a JSON view
instead, use `gh pr view <n> --repo chef/vscode-chef --json statusCheckRollup`
(conclusions there are `SUCCESS`/`FAILURE`/etc.).

- PASS only if both the `validate` and `build (22.19.0)` rows show `pass`
  (or `SUCCESS` in the JSON form) for the latest commit. Anything else
  (`fail`, `pending`, `queued`) is a FAIL — call out which job failed and
  include its URL from the output.

### d. Packaging verification

Check out the PR into an isolated git worktree so the user's current
branch/working tree is never disturbed. Capture the original repo
directory first so cleanup can reliably return to it (don't hardcode
a developer-specific path):

```bash
REPO_ROOT="$(pwd)"
git fetch https://github.com/chef/vscode-chef.git "+pull/<n>/head:pr-<n>-validate"
git worktree add /tmp/vscode-chef-pr-<n> pr-<n>-validate
cd /tmp/vscode-chef-pr-<n>
```

Fetch from the canonical `chef/vscode-chef` URL explicitly rather than
`origin` — a developer's local `origin` may point at a personal fork,
in which case `pull/<n>/head` wouldn't resolve there. Use the forced
refspec (`+pull/<n>/head:...`) so the fetch reliably updates the local
branch even if Dependabot has force-pushed (rebased/refreshed) the PR
since a previous validation run.

Run the same steps as the `build` CI job:

```bash
npm ci
npx vsce package --out /tmp/vscode-chef-pr-<n>.vsix
```

PASS only if both commands exit 0 and the `.vsix` file exists and is not
suspiciously small (e.g. non-empty and comfortably above a minimal
threshold such as 100KB, via `stat -f%z` on macOS or `stat -c%s` on Linux
against `/tmp/vscode-chef-pr-<n>.vsix`).

### e. Installation verification

Unzip the produced `.vsix` (it's a zip archive):

```bash
unzip -p /tmp/vscode-chef-pr-<n>.vsix extension/package.json > /tmp/pr-<n>-manifest.json
```

Confirm `/tmp/pr-<n>-manifest.json` is valid JSON, its `version` matches
`package.json` on the PR branch, and required fields (`engines.vscode`,
`main`, `contributes`) are present and structurally unchanged from `main`.

If a `code` CLI is available in this environment, optionally try:

```bash
code --install-extension /tmp/vscode-chef-pr-<n>.vsix
```

as a stronger signal. If `code` is not available, skip this step without
failing the PR for that reason alone — note it as "not checked (no code CLI)".

**Always clean up** after each PR, even on failure, so no scratch state
leaks between PRs or back into the user's main checkout. Use the
`REPO_ROOT` captured before entering the worktree — never hardcode a
path. Each step is tolerant of partial failure (e.g. an earlier step in
this same check aborted before the worktree/branch/file existed), so
suffix with `|| true` and keep going rather than stopping cleanup short:

```bash
cd "$REPO_ROOT"
git worktree remove /tmp/vscode-chef-pr-<n> --force || true
git branch -D pr-<n>-validate || true
rm -f /tmp/vscode-chef-pr-<n>.vsix /tmp/pr-<n>-manifest.json
```

## 3. Report

Print one summary table across all open Dependabot PRs, one row per PR:

| PR # | Title | HAR | Deps Changed | CI (validate/build) | Package | Install | Verdict |
|------|-------|-----|---------------|----------------------|---------|---------|---------|
| 285  | Bump @types/vscode 1.83.3→1.134.0 | ✅ | @types/vscode (dev, minor) | ✅ / ❌ build failed | ⚠️ not run (CI red) | ⚠️ not run | ⚠️ Needs attention: build job failing |

- Verdict is **"✅ Ready to merge manually"** only when every check passes.
- Otherwise **"⚠️ Needs attention"** with the specific failing check(s) named.
- If CI is already failing for a PR, it's fine to skip the local packaging and
  installation steps for that PR (note as "not run — CI red") rather than spend
  time re-deriving a failure GitHub already reported. Still run the packaging
  and installation steps locally whenever CI is green, or whenever the user
  explicitly asks you to double-check a CI failure yourself.
- Do not approve, comment on, or merge any PR. End the report by reminding the
  user that merging is manual, per team policy.
