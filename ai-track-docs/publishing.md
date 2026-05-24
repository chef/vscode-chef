# Publishing the Chef 360 plugin to Visual Studio Marketplace

## Publishing
Download vsce

On Mac ARM
```
sudo chown -R 502:20 "/Users/loomis/.npm"
sudo npm install -g @vscode/vsce
```

```
sudo npm run vscode:prepublish

vsce package
vsce publish
```

VSCE instructions at https://code.visualstudio.com/api/working-with-extensions/publishing-extension

## Downloading and running the latest version

- need chef-workstation (no ARM version yet)