# System Overview — vscode-chef

## What This Is

**vscode-chef** (`chef-software.chef`) is a Visual Studio Code extension that provides first-class language support for the Chef ecosystem. It targets developers writing Chef Infra cookbooks, Chef InSpec profiles, Policyfiles, and Berksfiles.

## Core Capabilities

| Capability | Detail |
|---|---|
| Syntax highlighting | Chef Infra (Ruby + YAML recipes), InSpec, Metadata, Policyfile, Berksfile |
| Cookstyle/Rubocop linting | Runs on save; whole-workspace or open-files mode |
| Snippets | ~10 snippet files covering resources, DSL helpers, InSpec controls, ChefSpec, and YAML recipes |
| Commands | `Chef: Validate Workspace` forces full workspace lint regardless of file-count threshold |

## Extension Activation

The extension activates on:
- `onLanguage` events for `chef_berkshelf`, `chef_inspec`, `chef_metadata`, `chef_policyfile`, `chef_recipe_yaml`
- Presence of any `**/metadata.rb` file in the workspace

## Key Dependencies

| Dependency | Role |
|---|---|
| `Shopify.ruby-lsp` | Ruby language server (LSP) |
| `redhat.vscode-yaml` | YAML language support for `.yml` recipes |
| Chef Workstation (runtime) | Provides the `cookstyle`/`rubocop` binary on the host |

## Repository Layout

```
vscode-chef/
├── extension.ts                    # Runtime entrypoint in VS Code extension host
├── package.json                    # Manifest (contributions, activation events, scripts)
├── schema/job-schema.json          # JSON schema used for *job.json validation
├── snippets/chef_job.json          # Courier job snippets (chef-job*)
├── syntaxes/                       # TextMate grammars (*.plist, *.cson.json)
├── snippets/                       # Snippet payloads consumed by VS Code IntelliSense
├── src/utils.ts                    # Shared helper logic used by extension runtime/tests
├── test/chef_metadata.test.ts      # Headless snippet structure tests
├── .github/workflows/ci.yml        # PR CI (JSON validation + package + diagram render check)
├── autogeneration/Rakefile         # Regenerates auto-generated snippet files
└── ai-track-docs/architecture.mmd  # Mermaid architecture diagram source
```

## Data Flows

### 1) Ruby lint diagnostics flow

1. VS Code activates [extension.ts](../extension.ts) on language/workspace triggers from [package.json](../package.json).
2. `validate()`/`validatePaths()` in [extension.ts](../extension.ts) spawns `cookstyle`/`rubocop`.
3. Rubocop JSON output is converted into VS Code diagnostics and pushed to the Problems panel.

### 2) Courier job schema validation flow (`*job.json`)

1. [package.json](../package.json) contributes JSON validation mapping: `**/*job.json` -> [schema/job-schema.json](../schema/job-schema.json).
2. When a matching file is opened/edited, VS Code JSON validation applies schema constraints (required fields, enums, shapes).
3. Authoring is accelerated by scaffold snippets from [snippets/chef_job.json](../snippets/chef_job.json), which should stay schema-aligned.

### 3) Snippet generation and quality gate flow

1. [autogeneration/Rakefile](../autogeneration/Rakefile) regenerates selected snippet files under [snippets](../snippets).
2. PR CI in [.github/workflows/ci.yml](../.github/workflows/ci.yml) validates all snippet JSON files parse correctly.
3. Packaging (`npx vsce package`) runs in CI to ensure extension artifact can be produced from current sources.

## Settings Reference

| Setting | Type | Default | Description |
|---|---|---|---|
| `rubocop.enable` | boolean | `true` | Toggle linting on/off |
| `rubocop.path` | string | `""` | Override path to rubocop/cookstyle binary |
| `rubocop.configFile` | string | `""` | Override `.rubocop.yml` path |
| `rubocop.fileCountThreshold` | number | `400` | Files below threshold → lint whole workspace |

## Version & Publisher

- **Publisher:** `chef-software`
- **Current version:** see `VERSION` file / `package.json`
- **VS Code engine minimum:** `^1.83.0`
- **License:** Apache-2.0
