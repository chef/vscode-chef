# Habitat Plan Authoring and Package Workflow Enhancement

## Goal

Add first-class support in the extension to:

1. Draft Chef Habitat plan files quickly.
2. Build Habitat packages locally on the same platform as VS Code.
3. Build Habitat packages in a container runtime.
4. Test Habitat package installation in a user-selected container.

Reference: https://docs.chef.io/habitat/2.0/plans/plan_writing/

## Scope Implemented

### New commands

- `Chef: Create Habitat Plan Draft`
- `Chef: Build Habitat Package (Local)`
- `Chef: Build Habitat Package (Container)`
- `Chef: Test Habitat Package Install (Container)`

### New authoring helper

- Ruby snippet file: `snippets/chef_habitat_plan.json`
- Snippet prefix: `hab-plan`

### New settings

- `habitat.defaultOrigin`
- `habitat.containerRuntime` (`docker` or `podman`)
- `habitat.containerImage`
- `habitat.defaultBuildContext`

## Command behavior

### Create Habitat Plan Draft

- Prompts for destination path (default: `habitat/plan.sh` on Linux/macOS, `habitat/plan.ps1` on Windows).
- Creates file with a starter template containing common `pkg_*` values.
- Opens the file for editing.

### Build Habitat Package (Local)

- Prompts for build context.
- Runs `hab pkg build <context>` in an integrated terminal from workspace root.

### Build Habitat Package (Container)

- Prompts for build context and container image.
- Runs containerized `hab pkg build` using configured runtime.

### Test Habitat Package Install (Container)

- Prompts for container image and package identifier or `.hart` path.
- Runs `hab pkg install ...` in a container and performs a lightweight post-install check.

## Follow-up Enhancements

1. Add richer validation for plan templates (required fields, SPDX license checks).
2. Add commands to detect latest built `.hart` automatically.
3. Add platform-target plan scaffolding (target-specific folders).
4. Add test coverage for new command handlers.
5. Add CI test stubs for command registration and input-path normalization.
