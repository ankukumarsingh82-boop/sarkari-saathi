import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const files = readdirSync(join(root, "tests"))
  .filter((name) => name.endsWith(".test.ts"))
  .sort()
  .map((name) => join("tests", name));

if (files.length === 0) {
  console.error("No test files in tests/");
  process.exit(1);
}

const tsx = join(root, "node_modules", "tsx", "dist", "cli.mjs");
const result = spawnSync(process.execPath, [tsx, "--test", "--test-concurrency=1", ...files], {
  stdio: "inherit",
  cwd: root,
});
process.exit(result.status ?? 1);
