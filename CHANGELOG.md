## 1.3.0 (2020-02-03)

- Add many of the new helpers introduced in the upcoming Chef Infra Client 15.8 release.
- Don't ship the backwards compatibility methods for chef-sugar. Only suggest the latest methods present in Chef Infra Client 15.5.
- Improve many of the method descriptions.
- Add information to the new helpers describing what version of Chef Infra Client they require.

## 1.2.0 (2020-01-23)

- Updated many helper descriptions to be more friendly for new users
- Added the `windows_workstation?`, `windows_server?`, and `windows_server_core?` helpers from Chef Infra Client 15.7.30

## 1.1.0 (2019-12-30)

- Added `recipe_name` and `cookbook_name` helpers
- Added more of the helpers from the chef-utils gem

## 1.0.1 (2019-12-24)

- Don't ship the 3.5 meg autogeneration folder
- Use the correct scope in all snippets

## 1.0.0 (2019-12-24)

- Added all the new platform and architecture helpers included in Chef Infra 15.5+
- Add Rakefile to auto generate chef-utils helpers from the Chef Infra codebase
- Helpers and general Chef DSL broken out into their own snippet file
- ChefSpec snippets broken out into their own snippet file
- Various bug fixes to the resource snippets to fix typos

## 0.8.1 (2019-09-21)

- Shorten diagnostic messages, remove duplicate cop name (@stuartpreston)
- Use Chef Workstation instead of ChefDK on non-Win32 platforms (@stuartpreston)

## 0.8.0 (2019-09-21)

- Change publisher from Pendrica to Chef Software (@stuartpreston)
- Tidyup: Remove everything relating to Foodcritic (@stuartpreston)
- Default to using the chef-workstation folder instead of chefdk (@stuartpreston)
- Change the extension category name [#43](https://github.com/chef/vscode-chef/issues/43) (@tas50)
- Add more resource snippets and fix a few others [#45](https://github.com/chef/vscode-chef/issues/45) (@tas50)
- Add a new "Chef Metadata" language and snippets [#44](https://github.com/chef/vscode-chef/issues/44) (@tas50)
- Change the extension category name [#43](https://github.com/chef/vscode-chef/issues/43) (@tas50)
- Add a few more useful snippets for cookbook development [#42](https://github.com/chef/vscode-chef/issues/42) (@tas50)
- Remove foodcritic support now that it's EOL [#41](https://github.com/chef/vscode-chef/issues/41) (@tas50)
- Rename to Chef Infra Extension [#40](https://github.com/chef/vscode-chef/issues/40) (@tas50)
- Add a few new resources from Chef Infra 14 / 15 [#39](https://github.com/chef/vscode-chef/issues/39) (@tas50)
- Remove matching on provisioning resources [#38](https://github.com/chef/vscode-chef/issues/38) (@tas50)
- Updated template snippet, fixes default group value [#35](https://github.com/chef/vscode-chef/issues/35) (@goldeelox)

## 0.7.1 (2018-11-05)

- Updated apt_upgrade snippet (@brooksa321, @rreilly-edr)

## 0.7.0 (2018-05-13)

- Additional snippets from Chef 14 (@kitforbes, @tas50)
- Set vscode NPM package to 1.1.14 (@SeanSith)
- Fixes to Foodcritic output on save (@SeanSith)

## 0.6.4 (2017-12-04)

- Additional snippets from Chef 13 (@tas50)
- Fix to Foodcritic output formatting (@stuartpreston) [#16](https://github.com/chef/vscode-chef/issues/16)
- Logo switched to png to comply with publishing rules (@stuartpreston)

## 0.6.3 (2017-06-06)

- Allow `rubocop.configFile` workspace parameter (@stuartpreston)

## 0.6.2 (2016-11-04)

- Use Cookstyle in place of Rubocop by default (@smith)

## 0.6.1 (2016-06-09)

- Adding ChefSpec 'describe' snippet (@jerry-locke)

## 0.6.0 (2016-05-16)

- Bug: Foodcritic was only displaying the first warning from each file inspected
- Bug: Cookbook folders opened directly were not being detected as a cookbook (#7)
- Bug: Cookbook folder detection occurred for Foodcritic on each document save even when foodcritic.enable was set to false
- Improve end-to-end Foodcritic performance by only checking cookbooks with a metadata.rb
- Change default location of Rubocop and Foodcritic to /opt/chefdk/embedded/bin (and respective location on Windows) for compatibility with ChefDK 0.13+
- Foodcritic would not return the complete set of results across multiple cookbooks in a "mega-repo"

## 0.5.2 (2016-04-26)

Bugfixes:

- Move cookbook folder selection inside feature flag for Foodcritic (@stuartpreston)

## 0.5.1 (2016-04-25)

Bugfixes:

- Embed README.md in packaged .vsix file (@stuartpreston)

## 0.5.0 (2016-04-25)

Features:

- Experimental support for Foodcritic (enable by setting the ```foodcritic.enable``` to ```true``` in your settings.json) (@stuartpreston)
- Rubocop messages that originated at Convention/Refactor level are now shown at at Informational level in VS Code (previously the default level was "warning") (@stuartpreston)

## 0.4.4 (2015-12-19)

Bugfixes:

- Reduce download time by removing huge gif from package (@stuartpreston)

## 0.4.3 (2015-12-19)

Bugfixes:

- fix indentation of template resource. (@chris-rock)
- Various snippet bugfixes for Rubocop compliance. (@stuartpreston)

## 0.4.2 (2015-11-18)

Features:

- Initial release to coincide with Microsoft Connect conference.
- Syntax/keyword highlighting
- Rubocop linting
- Snippet support
