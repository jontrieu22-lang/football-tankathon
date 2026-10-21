const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const root = path.resolve(__dirname, "..");
function check(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) check(file);
    else if (file.endsWith(".js"))
      execFileSync(process.execPath, ["--check", file], { stdio: "inherit" });
  }
}
check(path.join(root, "dist/js"));
execFileSync(
  process.execPath,
  [path.join(root, "tests/game/engine.test.cjs")],
  { stdio: "inherit" },
);
