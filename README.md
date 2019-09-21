# Chef Infra Extension for Visual Studio Code

The Chef Infra Extension for Visual Studio Code offers rich language support for Chef Infra DSL and snippets when using [Visual Studio Code](http://code.visualstudio.com).

![install and demo](https://github.com/chef/vscode-chef/raw/master/images/vscode-chef-install.gif)

## Features

#### Syntax/keyword highlighting:

 * Chef Infra Recipe DSL
 * Chef Infra built-in Resources
 * Chef Infra Custom Resources

#### Rubocop linting:

 * Enabled by default (disable by adding ```{ "rubocop.enable": false }``` in user/workspace settings)
 * The entire repo will be linted when files are saved.
 * If you have [Chef Workstation](https://downloads.chef.io/chef-workstation) installed, linting should "just work" on Windows, Mac OS X and Linux (Ubuntu.) [Cookstyle](https://github.com/chef/cookstyle) will be used by default.
 * If you do not have Chef Workstation but do have Rubocop installed, you can set the executable path by setting ```{ "rubocop.path": "c:\\path\\to\\rubocop.bat"}``` in user/workspace settings).
 * To override the config file used by Rubocop/Cookstyle, use the ```{ "rubocop.configFile": "path/to/config.yml" }``` in user/workspace settings.

#### Snippet support (with tabbing) for all Chef Infra built-in Resources:

 * Please review the [snippets](snippets/chef.json) for a complete list.

## Installation

 * You will need to install Visual Studio Code `1.0` or higher.
 * From the command palette ```Ctrl-Shift-P``` (Windows, Linux) or ```Cmd-Shift-P``` (OSX) select `Install Extension`, choose `Chef` and reload Visual Studio Code.

## Contributions

Contributions are welcomed, please file issues and pull requests via the [project homepage](https://github.com/chef/vscode-chef).

## Author

This extension was written by Stuart Preston [stuart@chef.io](stuart@chef.io).

## License

This extension is licensed under an [Apache 2](LICENSE) license.

(c) 2017-2019 Chef Software, Inc
(c) 2015-2017 Pendrica Ltd
