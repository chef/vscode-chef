# Chef Extension for Visual Studio Code

The Chef Extension for Visual Studio Code offers rich language support for Chef DSL and snippets when using [Visual Studio Code](http://code.visualstudio.com).

![install and demo](https://github.com/pendrica/vscode-chef/raw/master/images/vscode-chef-install.gif)

## Features
#### Syntax/keyword highlighting:
 * Chef Recipe DSL
 * Chef Provisioning DSL
 * Chef built-in Resources
 * Chef Custom Resources
 
#### Rubocop linting:
 * Enabled by default (disable by adding ```{ "rubocop.enable": false }``` in user/workspace settings)
 * Entire repo will be linted when files are saved.
 * If you have the [ChefDK](http://downloads.chef.io/chef-dk) installed, linting should "just work" on Windows, Mac OS X and Linux (Ubuntu)
 * If you do not have the ChefDK but do have Rubocop installed, you can set the executable path by setting ```{ "rubocop.path": "c:\\path\\to\\rubocop.bat"}``` in user/workspace settings).

#### Foodcritic analysis (experimental):
 * Disabled by default (enable by adding ```{ "foodcritic.enable": true }``` in user/workspace settings)
 * Entire repo will be linted when files are saved.
 * If you have the [ChefDK](http://downloads.chef.io/chef-dk) installed, Foodcritic should "just work" on Windows, Mac OS X and Linux (Ubuntu)
 * If you do not have the ChefDK but do have Foodcritic installed, you can set the executable path by setting ```{ "foodcritic.path": "c:\\path\\to\\foodcritic.bat"}``` in user/workspace settings).

#### Snippet support (with tabbing) for all Chef built-in Resources:
 * apt_package
 * bash
 * batch
 * bff_package
 * breakpoint
 * chef_gem
 * chef_handler
 * cookbook_file
 * cron
 * csh
 * deploy
 * directory
 * dpkg_package
 * dsc_resource
 * dsc_script
 * easy_install_package
 * env
 * erl_call
 * execute
 * file
 * freebsd_package
 * gem_package
 * git
 * group
 * homebrew_package
 * http_request
 * ifconfig
 * ips_package
 * link
 * log
 * macports_package
 * mdadm
 * mount
 * ohai
 * openbsd_package
 * package
 * pacman_package
 * paludis_package
 * perl
 * portage_package
 * powershell_script
 * python
 * reboot
 * registry_key
 * remote_directory
 * remote_file
 * route
 * rpm_package
 * ruby
 * ruby_block
 * script
 * service
 * smartos_package
 * solaris_package
 * subversion
 * template
 * user
 * windows_package
 * windows_service
 * yum_package

 Press ```Ctrl+Space``` (Windows, Linux) or ```Control+Space``` (OSX) to activate snippets from within the editor.

 With more features yet to come, stay tuned.

##Installation

 * You will need to install Visual Studio Code `1.0` or higher.
 * From the command palette ```Ctrl-Shift-P``` (Windows, Linux) or ```Cmd-Shift-P``` (OSX) select `Install Extension`, choose `Chef` and reload Visual Studio Code.  

## Backlog

 * Investigate auto-suggestions and extend syntax highlighting/colouring.
 * Investigate auto-correct options on Rubocop findings.
 * Investigate integration with ChefSpec.

## Contributions

Contributions are welcomed, please file issues and pull requests via the [project homepage](https://github.com/pendrica/vscode-chef).

## Author

This extension was written by Stuart Preston [stuart@pendrica.com](stuart@pendrica.com)

## License
This extension is licensed under an [Apache 2](LICENSE.md) license.

(c) 2015-2016 Pendrica
