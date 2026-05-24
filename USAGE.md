# Installing and using the extetnsion

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