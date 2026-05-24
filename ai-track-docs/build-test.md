# Build & Test — vscode-chef

## Prerequisites

| Tool | Minimum version | Notes |
|---|---|---|
| Node.js LTS | 18.x | Required for `npm` and `tsc` |
| npm | bundled with Node | — |
| Ruby + Bundler | 3.x | Only needed for snippet autogeneration |
| Chef Workstation | latest | Provides `cookstyle`/`rubocop` at runtime |
| `@vscode/vsce` | ^2.21.1 | Installed as a dev dependency |

---

## Install JS Dependencies

```sh
npm install
```

This installs all `devDependencies` from `package.json` (TypeScript, vsce, type definitions).

---

## Compile TypeScript

One-shot compile:

```sh
npm run vscode:prepublish   # runs: tsc -p ./
```

Watch mode (rebuilds on save — useful during development):

```sh
npm run compile             # runs: tsc -watch -p ./
```

Compiled output lands in `out/`.

---

## Snippet Autogeneration (Ruby)

The `autogeneration/` directory contains a Rakefile that pulls DSL and InSpec resource data from the upstream `chef` gem and regenerates:

- `snippets/automated_dsl_snippets.json`
- `snippets/chef_inspec_resources.json`

```sh
cd autogeneration
bundle install
rake generate_snippets
```

> **Do not** edit these two files by hand — they will be overwritten on the next regeneration run.

---

## Packaging (local .vsix)

```sh
npm run package
# produces: vscode-chef.vsix
```

Install locally for smoke-testing:

```sh
code --install-extension vscode-chef.vsix
```

---

## Publishing to the VS Code Marketplace

Requires a Personal Access Token (PAT) for the `chef-software` publisher:

```sh
npx vsce publish
```

---

## Linting the Extension Source

There is no automated test runner configured for this extension today. Manual verification steps:

1. Open a Chef cookbook in VS Code with the extension loaded.
2. Save a `.rb` file and confirm Cookstyle diagnostics appear in the Problems panel.
3. Trigger `Chef: Validate Workspace` from the Command Palette and verify the workspace-wide lint runs.
4. Confirm snippet completions appear for `chef_recipe_yaml`, `chef_inspec`, and Ruby recipe files.

---

## CI / Release Pipeline

Expeditor (`.expeditor/`) drives version bumps and changelog updates. The release cadence is:

1. Merge PR → Expeditor bumps `VERSION` and `CHANGELOG.md`.
2. Tag is pushed → `vsce publish` runs (manual or via pipeline).
