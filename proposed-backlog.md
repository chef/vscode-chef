# Proposed Backlog

Generated from [To-do.md](To-do.md) and current repository findings.

## BL-001: Expand test coverage across extension runtime and snippet assets
Priority: High

Problem
- Current tests cover utility mapping and one snippet file, but core extension activation and linting flow are still weakly covered.

Acceptance criteria
- Add unit tests for linting flow decisions: workspace-wide vs open-files mode.
- Add tests for command registration of `chef.validateEntireWorkspace`.
- Add JSON integrity tests for all snippet files under [snippets](snippets).
- `npm test` passes in CI and locally.

Code links
- [package.json](package.json)
- [extension.ts](extension.ts)
- [src/utils.ts](src/utils.ts)
- [src/utils.test.ts](src/utils.test.ts)
- [test/chef_metadata.test.ts](test/chef_metadata.test.ts)
- [.github/workflows/ci.yml](.github/workflows/ci.yml)

## BL-002: Add contributor documentation for adding snippets and commands
Priority: High

Problem
- Contributor docs explain snippet update tooling, but there is no single implementation guide for adding new snippets, command wiring, tests, and docs updates.

Acceptance criteria
- Add a developer guide section (or new doc) describing:
  - How to add a snippet in [snippets](snippets)
  - How to register a command in [package.json](package.json) and implement it in [extension.ts](extension.ts)
  - How to add tests and run them
- Cross-link the guide from [README.md](README.md) and/or [CONTRIBUTING.md](CONTRIBUTING.md).

Code links
- [README.md](README.md)
- [USAGE.md](USAGE.md)
- [CONTRIBUTING.md](CONTRIBUTING.md)
- [package.json](package.json)
- [extension.ts](extension.ts)
- [snippets](snippets)

## BL-003: Implement Courier Jobs feature parity and quality checks
Priority: High

Problem
- Courier Job support exists (schema + snippets + docs), but parity work and regression coverage should be tracked as first-class backlog.

Acceptance criteria
- Validate snippet scaffold fields stay aligned with schema enums and required fields.
- Add tests that load [schema/job-schema.json](schema/job-schema.json) and assert snippet bodies in [snippets/chef_job.json](snippets/chef_job.json) satisfy required schema structure.
- Ensure docs for Courier Jobs stay synchronized with shipped behavior.

Code links
- [schema/job-schema.json](schema/job-schema.json)
- [snippets/chef_job.json](snippets/chef_job.json)
- [package.json](package.json)
- [USAGE.md](USAGE.md)

## BL-004: Import external spec items into repo-tracked backlog
Priority: Medium

Problem
- To-do references additional specs located outside the repository ("laptop folder"), which are not reviewable or auditable in PR workflows.

Acceptance criteria
- Import external spec items into a repo file under [dev-docs](dev-docs) or [ai-track-docs](ai-track-docs).
- Convert each imported item into actionable backlog tasks with owner and acceptance criteria.
- Link each new backlog item to at least one code/doc target in this repo.

Code links
- [To-do.md](To-do.md)
- [dev-docs](dev-docs)
- [ai-track-docs](ai-track-docs)

## BL-005: Prepare ARB/workstation-team architecture review package
Priority: Medium

Problem
- The to-do list requests ARB presentation, but there is no explicit checklist for architecture rationale, risk, and rollout evidence.

Acceptance criteria
- Add ARB review packet documenting:
  - Extension architecture and activation/linting behavior
  - Testing/CI guarantees and gaps
  - Release/publisher migration plan and rollback
- Review packet is committed and linked from main docs.

Code links
- [ai-track-docs/SYSTEM-OVERVIEW.md](ai-track-docs/SYSTEM-OVERVIEW.md)
- [ai-track-docs/architecture.mmd](ai-track-docs/architecture.mmd)
- [extension.ts](extension.ts)
- [.github/workflows/ci.yml](.github/workflows/ci.yml)

## BL-006: Cut and validate next release candidate
Priority: High

Problem
- Release intent exists, but repeatable release gates (versioning, packaging, smoke validation) are not explicitly tracked in backlog format.

Acceptance criteria
- Increment version and changelog entry for release candidate.
- update all deps
- Build extension package (`npx vsce package`) successfully.
- Perform smoke test install of generated VSIX and validate key scenarios:
  - Ruby lint diagnostics
  - Snippet completion
  - Courier job schema validation
- Record results in release notes.

Code links
- [VERSION](VERSION)
- [CHANGELOG.md](CHANGELOG.md)
- [package.json](package.json)
- [README.md](README.md)
- [USAGE.md](USAGE.md)

## BL-007: Publisher migration to Progress namespace and deprecation plan
Priority: High

Problem
- To-do requests publishing under Progress instead of current publisher, with uncertainty about existing credentials and deprecation path.

Acceptance criteria
- Confirm target Marketplace publisher and secure PAT ownership in team-managed credential store.
- Update release docs to include migration procedure and fallback.
- Publish test build under target publisher.
- Document deprecation/redirect communication plan for current publisher listing.

Code links
- [package.json](package.json)
- [README.md](README.md)
- [ai-track-docs/build-test.md](ai-track-docs/build-test.md)
- [SECURITY.md](SECURITY.md)

## BL-008: CI modernization for supported Node and test execution
Priority: Medium

Problem
- CI currently uses Node 15.x and packages the extension, but lacks explicit `npm test` stage and modern Node matrix validation.

Acceptance criteria
- Update CI matrix to supported LTS Node versions.
- Add explicit `npm test` job before packaging.
- Keep snippet JSON validation and packaging checks.
- CI docs updated to reflect required gates.

Code links
- [.github/workflows/ci.yml](.github/workflows/ci.yml)
- [package.json](package.json)
- [README.md](README.md)

## BL-009: Plan and execute ESLint 10 major upgrade
Priority: Medium

Problem
- `eslint` latest is 10.x while the project currently runs 9.x. This is a major-version jump and may require rule/config/plugin adjustments.

Acceptance criteria
- Create a dedicated upgrade PR moving `eslint` to latest 10.x.
- Verify `@typescript-eslint` plugin/parser compatibility with ESLint 10 in the same PR.
- Update lint config/rules as needed and document behavior changes.
- CI passes for lint, test, and package after the upgrade.

Code links
- [package.json](package.json)
- [eslint.config.mjs](eslint.config.mjs)
- [.github/workflows/ci.yml](.github/workflows/ci.yml)
- [ai-track-docs/build-test.md](ai-track-docs/build-test.md)

## BL-010: Add auto-publishing GitHub Action for VS Code Marketplace
Priority: High

Problem
- Publishing is currently manual. The repo packages in CI, but does not automatically publish a successfully tested and packaged VSIX to the VS Code Marketplace.

Acceptance criteria
- Add a dedicated GitHub Actions workflow for publish (for example, tag-triggered or manually dispatched).
- Publish job is gated on successful lint, test, and package steps in the same workflow run.
- Workflow uses a repository secret for Marketplace auth (for example `VSCE_PAT`) and does not echo credentials in logs.
- Workflow publishes the validated VSIX artifact to the target publisher in Marketplace.
- Add rollback guidance (unpublish/deprecate/version bump strategy) in release docs.

Code links
- [.github/workflows](.github/workflows)
- [.github/workflows/ci.yml](.github/workflows/ci.yml)
- [package.json](package.json)
- [ai-track-docs/build-test.md](ai-track-docs/build-test.md)
- [README.md](README.md)

## Notes
- This markdown backlog was created because no issue tracker integration is available in this session.