# Installing and using the extension

## Installing the Chef Infra Extension for VS Code

### From the Marketplace (recommended)

1. Open **Visual Studio Code**.
2. Open the Extensions sidebar: `Ctrl+Shift+X` (Windows/Linux) or `Cmd+Shift+X` (macOS).
3. Search for **`Chef Infra Extension`** (publisher: `chef-software`).
4. Click **Install**.
5. Reload VS Code if prompted.

### From a .vsix file (local/offline install)

1. Download or build the `.vsix` file.
2. Open the Extensions sidebar.
3. Click the **`···`** menu (top-right of the panel) → **Install from VSIX…**
4. Select the `.vsix` file and confirm.

---

## Extension Commands

Access any command via the **Command Palette**: `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS), then type the command name.

---

### `Chef: Validate Workspace`

**What it does:** Runs Cookstyle/Rubocop linting across every Ruby file in the workspace, regardless of the file-count threshold set in your settings. Results appear in the **Problems** panel (`Ctrl+Shift+M` / `Cmd+Shift+M`).

**When to use it:** When your workspace has more than 400 `.rb` files (auto-lint switches to open-files-only above that threshold) and you want to force a full scan.

**How to run:**
1. Open the Command Palette.
2. Type `Chef: Validate Workspace` and press `Enter`.

---

## Automatic Linting (no command needed)

The extension also lints automatically on every file save — no command required. Diagnostics appear inline in the editor and in the Problems panel. To disable:

- Open Settings (`Ctrl+,` / `Cmd+,`) and set **`rubocop.enable`** to `false`.

---

## Chef Courier Job IntelliSense (`*job.json` files)

The extension provides full IntelliSense for any file ending in `job.json` in your workspace — including auto-complete, inline validation, hover documentation, and scaffolding snippets.

### Auto-complete and validation

Open any `*job.json` file and start typing. VS Code will:
- Suggest valid property names at every level
- Show dropdown choices for enum fields (e.g. `executionType`, `distributionMethod`, `status`)
- Display hover documentation for each field
- Underline unknown or invalid values with red squiggles

No setup required — this activates automatically for any file matching `*job.json`.

### Snippets (tab-complete scaffolds)

Three snippets are available inside any JSON file. Type the prefix and press `Tab`:

---

#### `chef-job` — Full job scaffold

Inserts a complete, ready-to-edit job definition with all required sections. Tab through 23 placeholders to fill in your values. Dropdown choices are offered for all enum fields.

**Use when:** Creating a new job file from scratch.

**How to use:**
1. Open or create a file ending in `job.json`.
2. Type `chef-job` and press `Tab`.
3. Tab through each placeholder, selecting or typing your values.

---

#### `chef-job-step` — Single step scaffold

Inserts a single step object. Paste this inside an existing `steps` array to add another step to a job.

**Use when:** Adding a step to an existing job.

**How to use:**
1. Place your cursor inside the `steps: []` array.
2. Type `chef-job-step` and press `Tab`.
3. Tab through the placeholders to configure the step.

---

#### `chef-job-group` — Single target group scaffold

Inserts a single node group object. Paste this inside an existing `groups` array to add another target group.

**Use when:** Adding a target group to an existing job.

**How to use:**
1. Place your cursor inside the `groups: []` array.
2. Type `chef-job-group` and press `Tab`.
3. Tab through the placeholders to configure the group.

---

### Settings reference

| Setting | Type | Default | Description |
|---|---|---|---|
| `rubocop.enable` | boolean | `true` | Toggle Cookstyle/Rubocop linting on/off |
| `rubocop.path` | string | `""` | Override path to the rubocop/cookstyle binary |
| `rubocop.configFile` | string | `""` | Override the `.rubocop.yml` config file path |
| `rubocop.fileCountThreshold` | number | `400` | Files below this count → lint whole workspace; above → open files only |
