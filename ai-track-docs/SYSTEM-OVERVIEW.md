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
├── extension.ts          # Entry point — registers linter, commands, diagnostics
├── out/                  # Compiled JS (gitignored, produced by tsc)
├── syntaxes/             # TextMate grammar files (.plist, .cson.json)
├── snippets/             # JSON snippet files
├── autogeneration/       # Ruby/Rake tooling that regenerates auto-snippets
├── ai-track-docs/        # AI-readable documentation (this folder)
└── .copilot-track/       # Copilot crawl artefacts and prompt cache
```

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
