# Progress Chef Infra Extension for Visual Studio Code

The Progress Chef Infra Extension for Visual Studio Code offers rich language support for Chef Infra and Chef InSpec when using [Visual Studio Code](http://code.visualstudio.com).

![install and demo](https://github.com/chef/vscode-chef/raw/master/images/vscode-chef-install.gif)

## Features

### Syntax/keyword highlighting

* Chef Infra Language (traditional and YAML-based) including built-in resources
* Chef Infra Custom Resources
* Chef InSpec

### Cookstyle linting and source analysis

* Enabled by default (disable by adding ```{ "rubocop.enable": false }``` in user/workspace settings) and activated when the first Ruby file is loaded.
* The entire repo will be linted when files are saved, unless there are more than 400 `*.rb` files in the workspace, in which case only open files will be linted. Adjust this threshold using the ```{ "rubocop.fileCountThreshold": 400 }``` setting in user/workspace settings.
* You may lint the entire workspace, even if it is larger than the above threshold, using the `Chef: Validate Entire Workspace` command from the Command Palette.
* **Requirements**: This extension requires [Chef Workstation](https://docs.chef.io/workstation/install/) installed with [Cookstyle](https://github.com/chef/cookstyle) **8.6.10 or later**. For example, Chef Workstation 26.1.0 includes Cookstyle 8.7.6. Linting should "just work" on Windows, macOS, and Linux.
* **Chef Workstation 26 Support**: The extension automatically detects both Chef Workstation 25 and 26 installations. On Windows, it checks for CW26 (`C:\hab\bin\cookstyle.bat`) first, then falls back to CW25 (`C:\opscode\chef-workstation\bin\cookstyle.bat`). On Unix/macOS/Linux, it uses `/usr/local/bin/cookstyle` which works for both versions.
* If Chef Workstation is not installed in the default location, you can set the executable path by setting ```{ "rubocop.path": "c:\\path\\to\\cookstyle.bat"}``` in user/workspace settings.
* To override the config file used by Cookstyle, use the ```{ "rubocop.configFile": "path/to/config.yml" }``` in user/workspace settings. See [Cookstyle configuration](https://docs.chef.io/workstation/cookstyle/) for more details.

**Note**: While the configuration uses the `rubocop.*` namespace for historical reasons, this extension uses Cookstyle (Chef's customized RuboCop) for linting, not standard RuboCop.

#### Installing/Upgrading Cookstyle

**Option 1: Install Chef Workstation (Recommended)**
- Download from Progress Customer Portal or see [installation instructions](https://docs.chef.io/workstation/install/)
- For example, version 26.1.0 includes Cookstyle 8.7.6 and all Chef tools
- Works on Windows, macOS, and Linux

**Option 2: Install Cookstyle gem directly**
```bash
gem install cookstyle  # Installs latest version
```

**Note:** If using the gem-installed Cookstyle, you'll need to configure the path in VS Code settings:
```json
{
  "rubocop.path": "/path/to/cookstyle"
}
```
Or ensure `cookstyle` is available in your PATH.

**Option 3: Use with existing Ruby LSP**
This extension works with the [Shopify Ruby LSP extension](https://marketplace.visualstudio.com/items?itemName=Shopify.ruby-lsp). Configure Ruby LSP to use Cookstyle:
```json
{
  "rubyLsp.linters": ["cookstyle"],
  "rubyLsp.formatter": "cookstyle"
}
```

### Customizing Cookstyle Behavior

Cookstyle (RuboCop) behavior can be customized by creating a `.rubocop.yml` file in your workspace root. This allows you to override default formatting and linting rules.

**Example:** Customize array formatting
```yaml
# .rubocop.yml in your workspace root
Style/WordArray:
  EnforcedStyle: brackets  # Keep ["a", "b"] instead of %w[a b]

Style/SymbolArray:
  EnforcedStyle: brackets  # Keep [:a, :b] instead of %i[a b]
```

You can also specify a custom config file path in VS Code settings:
```json
{
  "rubocop.configFile": "path/to/your/config.yml"
}
```

See the [Cookstyle documentation](https://docs.chef.io/workstation/cookstyle/) for a complete list of available rules and configuration options.

#### Troubleshooting

**Issue**: Cookstyle version warning on startup  
**Solution**: Update Chef Workstation to version 26.1.0+ which includes Cookstyle 8.7.6, or install the latest Cookstyle gem directly (`gem install cookstyle`)

### Snippet support (with tabbing) for all Chef Infra built-in Resources

* Please review the [Resource snippets](snippets/chef_resources.json) for a complete list.

### Snippet support (with tabbing) for all Chef Infra Metadata fields

* Please review the [Metadata snippets](snippets/chef_metadata.json) for a complete list.

### Snippet support (with tabbing) for all Chef Infra Language helpers included in chef-utils

* Please review the [DSL snippets](snippets/automated_dsl_snippets.json) for a complete list.

### Snippet support (with tabbing) for all Chef Infra YAML Recipe format

* Please review the [Chef YAML Recipe snippets](snippets/chef_yaml_resources.json) for a complete list.

### Snippet support for all Chef InSpec

* Please review the [Chef InSpec snippets](snippets/chef_inspec_resources.json) for a complete list of included resources.
* Please review the [Chef InSpec Common snippets](snippets/chef_inspec_common.json) for a listing of common snippets included for Chef InSpec.

## Installation

* You will need to install Visual Studio Code `1.0` or higher.
* From the command palette ```Ctrl-Shift-P``` (Windows, Linux) or ```Cmd-Shift-P``` (OSX) select `Install Extension`, choose `Chef` and reload Visual Studio Code.

## Contributions

Contributions are welcomed, please file issues and pull requests via the [project homepage](https://github.com/chef/vscode-chef).

## Building and releasing the extension

This project contains development launch settings. A recent Node.js LTS build is required.

### Install dependencies

Dependencies for development work of this extension are maintained in the `package.json` file under the `devDependencies` key and can be installed via NPM:

```shell
npm ci           # Recommended: installs from frozen lockfile
npm install      # Only when updating dependencies
```

**Note:** For team development, always use `npm ci` to ensure reproducible builds. See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### Updating Snippets

The following Snippet configurations are included with this extension:

| Snippet File | Description | Update Method |
| --- | --- | --- |
| automated_dsl_snippets.json | Chef Infra Language/DSL Snippets | [**Autogenerated using Rakefile**](#autogenerated-snippet-updates) |
| chef_inspec_resources.json | Chef InSpec Resource Snippets | [**Autogenerated using Rakefile**](#autogenerated-snippet-updates) |
| chef_dsl_and_helpers.json | Chef Infra Language/DSL Snippets | Manually generated and maintained |
| chef_inspec_common.json | Chef InSpec Common Control Snippets| Manually generated and maintained |
| chef_metadata.json | Chef Infra Metadata Snippets | Manually generated and maintained |
| chef_resources.json | Chef Infra Recipe Resources (Ruby Format) | Manually generated and maintained |
| chef_yaml_resources.json | Chef Infra Recipe Resources (YAML Format) | Manually generated and maintained |
| chefspec.json | Chef Infra ChefSpec | Manually generated and maintained |
| shell_out.json | Chef Infra Language Helpers for shell_out type Examples | Manually generated and maintained |

#### Autogenerated Snippet Updates

The directory `autogeneration` located within this project contains tooling which is used to perform updates on autogenerated Snippet data.

* From a terminal, `cd` to the `autogeneration` directory:

    ```sh
    cd ./autogeneration
    ```

* Verify that local Ruby gems which are required for Snippet updates have been installed (defined within `./autogeneration/Gemfile`):

    ```sh
    bundle install
    ```

    ```plain
    $ bundle install
    Using rake 13.0.3
    Using bundler 2.1.4
    Using concurrent-ruby 1.1.8
    Using chef-utils 17.2.11 from https://github.com/chef/chef (at master@0af4909)
    Using coderay 1.1.3
    Using method_source 1.0.0
    Using pry 0.14.1
    Using yard 0.9.26
    Bundle complete! 4 Gemfile dependencies, 8 gems now installed.
    Bundled gems are installed into `./vendor`
    ```

* Run Rake task `generate_snippets` to perform any required Snippet updates, which are handled via autogeneration process:

    ```sh
    rake generate_snippets
    ```

### Packaging/releasing

To produce a local .vsix for testing use `npx vsce package`:

```plain
npx vsce package

Executing prepublish script 'npm run vscode:prepublish'...

> chef@1.4.0 vscode:prepublish /Users/tsmith/dev/work/vscode-chef
> tsc -p ./

 DONE  Packaged: /Users/tsmith/dev/work/vscode-chef/chef-1.4.0.vsix (15 files, 39.32KB)
```

To test the extension locally:

```shell
code --install-extension C:\projects\chef\vscode-chef\chef-1.4.0.vsix
```

To release requires a PAT token for the relevant publisher on the Visual Studio Marketplace.

```plain
vsce publish

Executing prepublish script 'npm run vscode:prepublish'...

> chef@1.4.0 vscode:prepublish /Users/tsmith/dev/work/vscode-chef
> tsc -p ./

Publishing chef-software.chef@1.4.0...
 DONE  Published chef-software.chef@1.4.0
Your extension will live at https://marketplace.visualstudio.com/items?itemName=chef-software.chef (might take a few minutes for it to show up).
```

## Author

This extension was written by Stuart Preston ([stuart@chef.io](stuart@chef.io))

## License

This extension is licensed under an [Apache 2](LICENSE) license.

```plain
   (c) 2015-2020 Chef Software, Inc
   (c) 2021-2024 Progress Software Corporation

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
```
