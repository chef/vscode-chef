# Chef Infra Extension for Visual Studio Code

The Chef Infra Extension for Visual Studio Code offers rich language support for Chef Infra DSL and snippets when using [Visual Studio Code](http://code.visualstudio.com).

![install and demo](https://github.com/chef/vscode-chef/raw/master/images/vscode-chef-install.gif)

## Features

#### Syntax/keyword highlighting:

 * Chef Infra Language (traditional and YAML-based) including built-in resources
 * Chef Infra Custom Resources

#### Cookstyle linting and source analysis:

 * Enabled by default (disable by adding ```{ "rubocop.enable": false }``` in user/workspace settings) and activated when the first Ruby file is loaded.
 * The entire repo will be linted when files are saved, unless there are more than 400 `*.rb` files in the workspace, in which case only open files will be linted. Adjust this threshold using the ```{ "rubocop.fileCountThreshold": 400 }``` setting in user/workspace settings.
 * You may lint the entire workspace, even if it is larger than the above threshold, using the `Chef: Validate Entire Workspace` command from the Command Pallette.
 * If you have [Chef Workstation](https://downloads.chef.io/chef-workstation) installed, linting should "just work" on Windows, macOS and Linux. [Cookstyle](https://github.com/chef/cookstyle) will be used by default.
 * If you do not have Chef Workstation but do have Rubocop installed, you can set the executable path by setting ```{ "rubocop.path": "c:\\path\\to\\rubocop.bat"}``` in user/workspace settings).
 * To override the config file used by Rubocop/Cookstyle, use the ```{ "rubocop.configFile": "path/to/config.yml" }``` in user/workspace settings.

#### Snippet support (with tabbing) for all Chef Infra built-in Resources:

 * Please review the [Resource snippets](snippets/chef_resources.json) for a complete list.

#### Snippet support (with tabbing) for all Chef Infra Metadata fields:

 * Please review the [Metadata snippets](snippets/chef_metadata.json) for a complete list.

#### Snippet support (with tabbing) for all Chef Infra DSL methods included in chef-utils:

 * Please review the [DSL snippets](snippets/automated_dsl_snippets.json) for a complete list.

#### Snippet support (with tabbing) for all Chef Infra YAML Recipe format:

 * Please review the [Chef YAML Recipe snippets](snippets/chef_yaml_resources.json) for a complete list.

## Installation

 * You will need to install Visual Studio Code `1.0` or higher.
 * From the command palette ```Ctrl-Shift-P``` (Windows, Linux) or ```Cmd-Shift-P``` (OSX) select `Install Extension`, choose `Chef` and reload Visual Studio Code.

## Contributions

Contributions are welcomed, please file issues and pull requests via the [project homepage](https://github.com/chef/vscode-chef).

## Building and releasing the extension

This project contains development launch settings. A recent Node.js LTS build is required.

### Install dependencies

```
npm install
npm install -g typescript
npm install -g vsce
```

### Packaging/releasing

To produce a local .vsix for testing:
```
vsce package

Executing prepublish script 'npm run vscode:prepublish'...

> chef@1.4.0 vscode:prepublish /Users/tsmith/dev/work/vscode-chef
> tsc -p ./

 DONE  Packaged: /Users/tsmith/dev/work/vscode-chef/chef-1.4.0.vsix (15 files, 39.32KB)
```

To test the extension locally.

```
code --install-extension C:\projects\chef\vscode-chef\chef-1.4.0.vsix
```

To release requires a PAT token for the relevant publisher on the Visual Studio Marketplace.

```
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

```
   (c) 2015-2019 Chef Software, Inc

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
