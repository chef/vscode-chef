# Chef Extension for Visual Studio Code


This extension offers rich language support for Chef DSL when using VS Code, including:

* Syntax highlighting for Chef Recipe DSL
* Syntax highlighting for Chef Provisioning DSL
* Syntax highlighting for Chef Custom Resources
* Syntax highlighting for Chef built-in Resources
* Snippet support for all Chef built-in Resources:
```
apt_package|bash|batch|bff_package|breakpoint|chef_gem|chef_handler|cookbook_file|cron|csh
deploy|directory|dpkg_package|dsc_resource|dsc_script|easy_install_package|env|erl_call|execute
file|freebs_package|gem_package|git|group|homebrew_package|http_request|ifconfig|ips_package|freebsd_package|gem_package|git|group|homebrew_package|http_request|ifconfig|ips_package
link|log|macports_package|mdadm|mount|ohai|openbsd_package|package|pacman_package
paludis_package|perl|portage_package|powershell_script|python|reboot|registry_key
remote_directory|remote_file|route|rpm_package|ruby|ruby_block|script|service|smartos_package
solaris_package|subversion|template|user|windows_package|windows_service|yum_package
```
Press <kbd>Ctrl+Space</kbd> (Windows, Linux) or <kbd>Cmd+Space</kbd> (OSX) to activate snippets.

##Installation

First, you will need to install Visual Studio Code `0.10.0` or higher.  Then launch Code with access to the extension gallery with `code --enableExtensionGallery`.

From the command palette <kbd>Ctrl-Shift-P</kbd> (Windows, Linux) or <kbd>Cmd-Shift-P</kbd> (OSX) select `Install Extension`, choose `Chef` and reload Visual Studio Code.  

## License
[Apache 2](LICENSE.md) (c) 2015 Pendrica 

## Contributions
Contributions are welcomed, please file issues and pull requests via the [project homepage](https://github.com/pendrica/vscode-chef).
