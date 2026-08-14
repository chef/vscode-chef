# Contributing to vscode-chef

Thank you for your interest in contributing to the Progress Chef VS Code extension!

## General Contribution Guidelines

For general Chef contribution guidelines, including DCO requirements, PR process, and code review standards, see:
https://github.com/chef/chef/blob/master/CONTRIBUTING.md

## Development Setup

Complete build and development instructions are available in the README:  
**[Building and releasing the extension](README.md#building-and-releasing-the-extension)**

### Quick Reference

```bash
# Install dependencies (always use npm ci, not npm install)
npm ci

# Build the extension
npm run vscode:prepublish

# Package for local testing
npm run package

# Test locally
code --install-extension ./chef-<version>.vsix
```

### Key Requirements

- **Always use `npm ci`** for builds (never `npm install` unless updating dependencies)
- **Commit `package-lock.json`** with any dependency changes
- **Sign-off all commits**: Use `git commit -s` (DCO requirement)
- **Exact versions only**: No `^` or `~` in `package.json`
- All packages install from Harness Artifact Registry (HAR)

### Team Policy

- ✅ Always use `npm ci` for builds
- ✅ Commit `package-lock.json` with any dependency changes
- ✅ CI/CD uses `npm ci` (frozen lockfile enforced)
- ❌ Never commit `node_modules/`
- ❌ Never use `npm install` unless updating dependencies

### Build Verification

To verify your build matches the frozen lockfile:

```bash
rm -rf node_modules
npm ci
npm run vscode:prepublish
npm run package
```

### Pull Request Checklist

Before submitting your PR, ensure:

- [ ] Code builds successfully (`npm run vscode:prepublish`)
- [ ] Extension packages successfully (`npm run package`)
- [ ] Tested locally by installing the `.vsix` file
- [ ] All commits are signed-off (DCO)
- [ ] `package-lock.json` updated if dependencies changed
- [ ] No unrelated changes included

### Need Help?

- **Issues**: [GitHub Issues](https://github.com/chef/vscode-chef/issues)
- **Detailed build instructions**: [README.md](README.md#building-and-releasing-the-extension)
- **Chef Community**: [Community Slack](https://community-slack.chef.io/)

For detailed explanations of dependency management, team policies, and security requirements, see the README.
