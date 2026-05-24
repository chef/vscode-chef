# Build & Test — vscode-chef

## Prerequisites

| Tool | Minimum version | Notes |
|---|---|---|
| Node.js LTS | 18.x | Required for `npm` and `tsc` |
| npm | bundled with Node | — |
| Ruby + Bundler | 3.x | Only needed for snippet autogeneration |
| Chef Workstation | latest | Provides `cookstyle`/`rubocop` at runtime |
| `@vscode/vsce` | ^3.9.1 | Installed as a dev dependency |

---

## Install JS Dependencies

```sh
npm install
```

This installs all `devDependencies` from `package.json` (TypeScript, ESLint, Mocha, vsce, type definitions).

> **Permission note:** If `node_modules/` or `out/` are owned by root from a previous `sudo npm install`, fix that first:
> ```sh
> sudo chown -R $(whoami) node_modules out
> ```

---

## Compile TypeScript

One-shot compile (also used as the pre-publish step):

```sh
npm run vscode:prepublish   # runs: tsc -p ./
```

Watch mode (rebuilds on save — useful during development):

```sh
npm run compile             # runs: tsc -watch -p ./
```

Compiled output lands in `out/`. The `test/` directory is included in compilation and outputs to `out/test/`.

---

## Run Tests

```sh
npm test
```

This compiles TypeScript then runs all `*.test.js` files in `out/test/` via Mocha. No VS Code instance is required — tests run headlessly in Node.

To run tests without recompiling (faster iteration):

```sh
mocha 'out/test/**/*.test.js'
```

### Current test coverage

| File | Suite | What is tested |
|---|---|---|
| `test/chef_metadata.test.ts` | `snippets/chef_metadata.json` | Valid JSON, non-empty prefix/body/description on every snippet, `depends` prefix matches key, `chef_version` body has tab-stops |

---

## Lint the Extension Source

```sh
npm run lint    # runs: eslint extension.ts
```

ESLint 9 with `@typescript-eslint` is used (replaces the deprecated `tslint`). Config is in `eslint.config.mjs`.

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

## Full clean build + test (recommended before opening a PR)

```sh
npm install
npm run vscode:prepublish
npm run lint
npm test
npm run package
```

---

## CI / Release Pipeline

Expeditor (`.expeditor/`) drives version bumps and changelog updates. The release cadence is:

1. Merge PR → Expeditor bumps `VERSION` and `CHANGELOG.md`.
2. Tag is pushed → `vsce publish` runs (manual or via pipeline).

