import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

// OpenNext delegates to Wrangler after preparing the bundle and cache metadata.
// Do not replace that prepared output with a second, differently identified build.
export function shouldBuildWorker({ openNextDeploy, workerExists }) {
  return !(openNextDeploy === "true" && workerExists);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (shouldBuildWorker({
    openNextDeploy: process.env.OPEN_NEXT_DEPLOY,
    workerExists: existsSync(".open-next/worker.js"),
  })) {
    const result = spawnSync("npm", ["run", "build:cloudflare"], {
      stdio: "inherit",
      shell: process.platform === "win32",
    });
    if (result.error) throw result.error;
    process.exitCode = result.status ?? 1;
  } else {
    console.log("Using the Worker bundle already prepared by OpenNext.");
  }
}
