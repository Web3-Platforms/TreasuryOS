{ pkgs }: {
  deps = [
    pkgs.nodejs_22
    pkgs.nodePackages.npm
    pkgs.postgresql_15
    pkgs.redis
  ];
}
