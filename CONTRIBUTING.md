# Contributing to vscode-chef

General contribution guidelines: https://github.com/chef/chef/blob/master/CONTRIBUTING.md

## Project-Specific Development Guidelines

### Dependency Management (CRITICAL)

**✅ ALWAYS use `npm ci` for builds:**
```bash
npm ci  # Installs from frozen package-lock.json
```

**❌ NEVER use `npm install` unless updating dependencies:**
```bash
npm install  # Only when intentionally changing package.json
```

### Build Verification

Verify your build matches the team's frozen lockfile:
```bash
rm -rf node_modules
npm ci
npm run vscode:prepublish
npm run package
```

### Security Requirements

- All packages must install from Harness Artifact Registry (HAR)
- `package-lock.json` must be committed
- No `^` or `~` version ranges in `package.json` (exact versions only)
- DCO sign-off required on all commits (`git commit -s`)

### Quick Reference

| Task | Command |
|------|---------|
| Install dependencies | `npm ci` |
| Build extension | `npm run vscode:prepublish` |
| Package .vsix | `npm run package` |
| Update dependency | Edit package.json, then `npm install` |

For detailed guidelines, see README.md "Building and releasing the extension" section.
