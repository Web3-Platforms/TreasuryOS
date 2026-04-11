import { spawnSync } from "node:child_process";

const mode = process.argv[2];
const railwayServiceName = process.env.RAILWAY_SERVICE_NAME;

const serviceWorkspaceMap = new Map([
  ["api-gateway", "@treasuryos/api-gateway"],
  ["@treasuryos/api-gateway", "@treasuryos/api-gateway"],
  ["kyc-service", "@treasuryos/kyc-service"],
  ["@treasuryos/kyc-service", "@treasuryos/kyc-service"],
  ["bank-adapter", "@treasuryos/bank-adapter"],
  ["@treasuryos/bank-adapter", "@treasuryos/bank-adapter"],
  ["reporter", "@treasuryos/reporter"],
  ["@treasuryos/reporter", "@treasuryos/reporter"],
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

const workspace = serviceWorkspaceMap.get(railwayServiceName);

if (!workspace) {
  console.error(
    `Unsupported RAILWAY_SERVICE_NAME "${railwayServiceName}". Supported services: ${Array.from(serviceWorkspaceMap.keys()).join(", ")}`,
  );
  process.exit(1);
}

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const args =
  mode === "build"
    ? ["run", "build", `--workspace=${workspace}`]
    : ["run", "start:prod", `--workspace=${workspace}`];

const result = spawnSync(npmCommand, args, {
  stdio: "inherit",
  env: process.env,
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
