{ pkgs, lib, config, inputs, ... }:

let
  pkgs-playwright = import inputs.nixpkgs-playwright { system = pkgs.stdenv.system; };
  browsers =
    (builtins.fromJSON (builtins.readFile "${pkgs-playwright.playwright-driver}/browsers.json"))
    .browsers;
  chromium-rev = (builtins.head (builtins.filter (x: x.name == "chromium") browsers)).revision;
in
{
  env = {
    PLAYWRIGHT_BROWSERS_PATH = "${pkgs-playwright.playwright.browsers}";
    PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS = true;
    PLAYWRIGHT_NODEJS_PATH = "${pkgs.nodejs_24}/bin/node";
    PLAYWRIGHT_LAUNCH_OPTIONS_EXECUTABLE_PATH = "${pkgs-playwright.playwright.browsers}/chromium-${chromium-rev}/chrome-linux/chrome";
  };

  dotenv.enable = true;

  packages = [
    pkgs.nodejs_24
    pkgs.lefthook
    pkgs.sqlite
  ];

  languages.javascript = {
    enable = true;
    package = pkgs.nodejs_24;
    corepack.enable = true;
  };

  scripts.sync-node-version.exec = ''
    actual_node="$(node --version | sed 's/^v//')"
    if [ ! -f .node-version ] || [ "$(cat .node-version)" != "$actual_node" ]; then
      echo "$actual_node" > .node-version
      echo "📝 Updated .node-version to $actual_node"
    else
      echo "✅ .node-version is up to date ($actual_node)"
    fi
  '';

  scripts.check-playwright.exec = ''
    playwrightNpmVersion="$(node -e "console.log(JSON.parse(require('fs').readFileSync('package.json','utf8')).devDependencies['@playwright/test'])")"
    echo "❄️ Playwright nix version: ${pkgs-playwright.playwright.version}"
    echo "📦 Playwright npm version (package.json): $playwrightNpmVersion"
    if [ "${pkgs-playwright.playwright.version}" != "$playwrightNpmVersion" ]; then
        echo "❌ Playwright versions in nix (in devenv.yaml) and npm (in package.json) are not the same! Please adapt the configuration."
    else
        echo "✅ Playwright versions in nix and npm are the same"
    fi
    echo
    env | grep ^PLAYWRIGHT
  '';

  enterShell = ''
    echo "================================="
    echo "🚀 Starting Devenv Environment"
    echo "================================="

    # Sync .node-version with the actual Node version provided by nix
    sync-node-version

    echo "ℹ️ Node Version: $(node --version) | PNPM Version: $(pnpm --version)"

    # Verifies playwright version
    check-playwright

    if [ ! -f .env ]; then
      cp .env.example .env
    fi
    echo "🪝 Installing Git Hooks"
    lefthook install

    echo "📦 Installing project dependencies"
    pnpm install
  '';
}
