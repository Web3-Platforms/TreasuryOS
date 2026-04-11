import { spawnSync } from "node:child_process";

const mode = process.argv[2];
const railwayServiceName = process.env.RAILWAY_SERVICE_NAME;

const serviceWorkspaceMap = new Map([
  [
    "api-gateway",
    {
      startWorkspace: "@treasuryos/api-gateway",
      buildWorkspaces: [
        "@treasuryos/types",
        "@treasuryos/compliance-rules",
        "@treasuryos/sdk",
        "@treasuryos/api-gateway",
      ],
    },
  ],
  [
    "@treasuryos/api-gateway",
    {
      startWorkspace: "@treasuryos/api-gateway",
      buildWorkspaces: [
        "@treasuryos/types",
        "@treasuryos/compliance-rules",
        "@treasuryos/sdk",
        "@treasuryos/api-gateway",
      ],
    },
  ],
  [
    "kyc-service",
    {
      startWorkspace: "@treasuryos/kyc-service",
      buildWorkspaces: [
        "@treasuryos/types",
        "@treasuryos/sdk",
        "@treasuryos/kyc-service",
      ],
    },
  ],
  [
    "@treasuryos/kyc-service",
    {
      startWorkspace: "@treasuryos/kyc-service",
      buildWorkspaces: [
        "@treasuryos/types",
        "@treasuryos/sdk",
        "@treasuryos/kyc-service",
      ],
    },
  ],
  [
    "bank-adapter",
    {
      startWorkspace: "@treasuryos/bank-adapter",
      buildWorkspaces: ["@treasuryos/bank-adapter"],
    },
  ],
  [
    "@treasuryos/bank-adapter",
    {
      startWorkspace: "@treasuryos/bank-adapter",
      buildWorkspaces: ["@treasuryos/bank-adapter"],
    },
  ],
  [
    "reporter",
    {
      startWorkspace: "@treasuryos/reporter",
      buildWorkspaces: ["@treasuryos/types", "@treasuryos/reporter"],
    },
  ],
  [
    "@treasuryos/reporter",
    {
      startWorkspace: "@treasuryos/reporter",
      buildWorkspaces: ["@treasuryos/types", "@treasuryos/reporter"],
    },
  ],
]);

if (mode !== "build" && mode !== "start") {
  console.error(
    `Unsupported mode "${mode}". Use "build" or "start".`,
  );
  process.exit(1);
}

if (!railwayServiceName) {
  console.error(
    "Missing RAILWAY_SERVICE_NAME. Railway must expose the target service name for deployment dispatch.",
  );
  process.exit(1);
}

const serviceConfig = serviceWorkspaceMap.get(railwayServiceName);

if (!serviceConfig) {
  console.error(
    `Unsupported RAILWAY_SERVICE_NAME "${railwayServiceName}". Supported services: ${Array.from(serviceWorkspaceMap.keys()).join(", ")}`,
  );
  process.exit(1);
}

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const commands =
  mode === "build"
    ? serviceConfig.buildWorkspaces.map((workspace) => [
        "run",
        "build",
        `--workspace=${workspace}`,
      ])
    : [["run", "start:prod", `--workspace=${serviceConfig.startWorkspace}`]];

for (const args of commands) {
  const result = spawnSync(npmCommand, args, {
    stdio: "inherit",
    env: process.env,
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  if ((result.status ?? 1) !== 0) {
    process.exit(result.status ?? 1);
  }
}
