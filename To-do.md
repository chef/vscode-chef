# To Do (Brian)
## Faeture list
- add tests everywhere (mocha/TS)
- add developer documentation on how to add snippets, commands
- add features for Courier Jobs
- see other lists of items for this (spec in laptop folder)
- bring to ARB from workstation team
- create a new version, test succesfully
- publish under Progress, not chef (and deprecate chef if possible - not sure we have the login key anymore)

---
CRAWL

Repo Summary
Languages
Language	Purpose
TypeScript	Single source file (extension.ts) — all extension logic
JSON	11 snippet files, grammar files (.cson.json), package.json manifest
TextMate/plist	syntaxes/chef.plist — Ruby/Chef syntax grammar
Ruby	autogeneration/ — Rake tasks that regenerate auto-snippets
Entry Points
extension.ts → activate() — sole entry point; wires up the linter, file watchers, and command registration
out/extension.js — compiled output; what VS Code actually loads (never edit directly)
autogeneration/Rakefile — entry point for snippet regeneration (separate Ruby process)
Test Approach
Minimal. The CI workflow (ci.yml) only:

Validates all snippets/*.json files parse as valid JSON (jq empty)
Runs npm install && npx vsce package to confirm the extension builds
There are no unit tests, no integration tests, no mocking of the VS Code API. @vscode/test-electron is listed as a devDependency but never used.

3 Low-Risk Modules to Modify
#	Module	Risk level	Why
1	snippets/chef_metadata.json	⬤ Very low	Pure JSON, validated by CI, no runtime logic
2	snippets/chef_policyfile.json	⬤ Very low	Same — hand-maintained JSON, easy to test by inspection
3	convertSeverity() in extension.ts	⬆ Low-medium	Self-contained pure function, no side effects, easy to reason about
✅ Recommended: snippets/chef_metadata.json
Why it's the safest change you can make:

It's pure static data — no code path, no compilation, no runtime behaviour.
CI already validates it automatically (jq empty on every PR).
You can test it immediately by opening a metadata.rb file in VS Code and triggering IntelliSense — feedback is instant and visual.
A mistake can't crash the extension, break linting, or affect other languages — worst case a completion just doesn't appear.
It's entirely self-contained with zero dependencies on other files.

Good first additions: missing chef_version constraint snippets, issues_url, source_url, or privacy metadata fields.