const { spawnSync } = require("node:child_process");
const path = require("node:path");

function runScript(name) {
  const command = process.platform === "win32" ? process.env.ComSpec : "npm";
  const args = process.platform === "win32"
    ? ["/d", "/s", "/c", `npm run ${name}`]
    : ["run", name];
  const result = spawnSync(command, args, {
    cwd: path.resolve(__dirname, ".."),
    stdio: "inherit",
    shell: false
  });
  if (result.error) {
    console.error(`Unable to run npm script \"${name}\": ${result.error.message}`);
  }
  return result;
}

let testStatus = 1;

try {
  console.log("\n[1/3] Preparing better-sqlite3 for the current Node.js runtime...");
  const prepareNode = runScript("ensure:sqlite");
  if (prepareNode.status !== 0) {
    testStatus = prepareNode.status || 1;
  } else {
    console.log("\n[2/3] Running the Node.js test suite...");
    const tests = runScript("test:node");
    testStatus = tests.status || 0;
  }
} finally {
  console.log("\n[3/3] Restoring better-sqlite3 for Electron packaging and desktop development...");
  const restoreElectron = runScript("rebuild:electron");
  if (restoreElectron.status !== 0) {
    console.error("Failed to restore the Electron SQLite binary.");
    testStatus = restoreElectron.status || 1;
  } else {
    console.log("Electron SQLite binary restored successfully.");
  }
}

process.exit(testStatus);
