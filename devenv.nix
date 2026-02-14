{ pkgs, lib, config, inputs, ... }:

{
  packages = [
    pkgs.nodejs_24
    pkgs.nodePackages.pnpm
    pkgs.lefthook
    pkgs.curl
    pkgs.sqlite
  ];

  enterShell = ''
    echo "networth-tracker dev environment"
    lefthook install
    echo "Node $(node --version) | PNPM $(pnpm --version)"
  '';

  languages.javascript = {
    enable = true;
    package = pkgs.nodejs_24;
  };
}
