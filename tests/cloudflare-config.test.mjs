import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { shouldBuildWorker } from "../scripts/build-cloudflare-worker.mjs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const config = JSON.parse(read("wrangler.jsonc"));
const { scripts, dependencies, devDependencies } = JSON.parse(read("package.json"));

test("Cloudflare deploys the server Worker and its matching asset bundle", () => {
  assert.equal(config.main, ".open-next/worker.js");
  assert.deepEqual(config.assets, {
    directory: ".open-next/assets",
    binding: "ASSETS",
  });
  assert.ok(config.compatibility_flags.includes("nodejs_compat"));
  assert.ok(config.compatibility_date >= "2024-09-23");
  const self = config.services.find(({ binding }) => binding === "WORKER_SELF_REFERENCE");
  assert.equal(self?.service, config.name);
});

test("Cloudflare packaging leaves the standard Next.js build intact", () => {
  assert.equal(scripts.build, "next build");
  assert.equal(scripts["build:cloudflare"], "opennextjs-cloudflare build");
  assert.equal(scripts["deploy:cloudflare"], "opennextjs-cloudflare deploy");
  assert.equal(config.build.command, "node scripts/build-cloudflare-worker.mjs");
  assert.deepEqual(config.build.watch_dir, ["app", "components", "lib", "public", "scripts"]);
  assert.equal(
    scripts["verify:cloudflare"],
    "wrangler deploy --dry-run --outdir .open-next/dry-run",
  );
  assert.match(scripts["verify:cloudflare"], /wrangler deploy --dry-run/);
  assert.ok(dependencies.next);
  assert.ok(devDependencies["@opennextjs/cloudflare"]);
  assert.ok(devDependencies.wrangler);
  assert.doesNotMatch(read("next.config.mjs"), /output\s*:\s*["']export["']/);
});

test("the dashboard deploy command builds missing output without redoing OpenNext deployment", () => {
  assert.equal(shouldBuildWorker({ workerExists: false }), true);
  assert.equal(shouldBuildWorker({ workerExists: true }), true);
  assert.equal(
    shouldBuildWorker({ openNextDeploy: "true", workerExists: true }),
    false,
  );
  assert.equal(
    shouldBuildWorker({ openNextDeploy: "true", workerExists: false }),
    true,
  );
  assert.equal(
    shouldBuildWorker({ openNextDeploy: "false", workerExists: true }),
    true,
  );
});

test("Cloudflare build artifacts and local credentials stay out of Git and checks", () => {
  const ignored = read(".gitignore").split(/\r?\n/);
  for (const entry of [".open-next/", ".wrangler/", ".dev.vars", ".dev.vars.*"]) {
    assert.ok(ignored.includes(entry), `${entry} must be ignored`);
  }
  for (const path of ["eslint.config.mjs", "tsconfig.json"]) {
    assert.ok(read(path).includes(".open-next"), `${path} excludes generated output`);
    assert.ok(read(path).includes(".wrangler"), `${path} excludes local runtime state`);
  }
  for (const field of ["account_id", "vars", "routes", "r2_buckets", "kv_namespaces"]) {
    assert.equal(config[field], undefined, `${field} requires a separate reviewed decision`);
  }
});
