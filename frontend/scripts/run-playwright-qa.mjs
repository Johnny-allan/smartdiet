import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const baseUrl = "http://127.0.0.1:3001";

function run(command, args, options = {}) {
  return spawn(command, args, {
    shell: true,
    stdio: options.stdio ?? "inherit",
    windowsHide: true,
    ...options,
  });
}

async function waitForServer(timeoutMs = 60_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(`${baseUrl}/patients`);
      if (response.ok) return;
    } catch {
      // Keep polling until Next finishes compiling the first route.
    }
    await delay(1_000);
  }
  throw new Error(`QA server did not become ready at ${baseUrl}`);
}

async function stopProcessTree(child) {
  if (!child.pid || child.exitCode !== null) return;
  await new Promise((resolve) => {
    const killer = run("taskkill.exe", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore" });
    killer.on("exit", resolve);
    killer.on("error", resolve);
  });
}

const server = run("npm.cmd", ["run", "qa:server"], { stdio: "pipe" });
server.stdout.on("data", (chunk) => process.stdout.write(`[qa-server] ${chunk}`));
server.stderr.on("data", (chunk) => process.stderr.write(`[qa-server] ${chunk}`));

let exitCode = 1;
try {
  await waitForServer();
  const playwright = run("npx.cmd", ["playwright", "test", ...process.argv.slice(2)]);
  exitCode = await new Promise((resolve) => {
    playwright.on("exit", (code) => resolve(code ?? 1));
    playwright.on("error", () => resolve(1));
  });
} finally {
  await stopProcessTree(server);
}

process.exit(exitCode);
