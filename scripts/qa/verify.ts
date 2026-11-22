import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { writeQaDashboard } from "./dashboard.ts";
import { runAstroTiptapDoctor } from "./doctor.ts";
import { runAstroTiptapJudges } from "./judges.ts";
import type { QaCheckResult, QaRepoReport } from "./types.ts";
import { discoverSiblingReports, summarizeChecks, writeQaReport } from "./types.ts";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const strict = process.argv.includes("--strict");

function runGate(id: string, name: string, bin: string, args: string[]): QaCheckResult {
  const start = Date.now();
  try {
    execFileSync(bin, args, { cwd: repoRoot, stdio: "pipe", encoding: "utf8" });
    return {
      id,
      name,
      category: "verify",
      status: "pass",
      durationMs: Date.now() - start,
      summary: `Passed in ${Date.now() - start}ms`,
    };
  } catch (err) {
    const out = String(
      (err as { stderr?: string; stdout?: string; message?: string }).stderr ||
        (err as { stdout?: string }).stdout ||
        (err as Error).message
    );
    return {
      id,
      name,
      category: "verify",
      status: "fail",
      durationMs: Date.now() - start,
      summary: `Failed (${Date.now() - start}ms)`,
      details: out.trim().split("\n").slice(-10),
    };
  }
}

const doctor = runAstroTiptapDoctor(repoRoot);
const judges = runAstroTiptapJudges(repoRoot);
const verifyChecks: QaCheckResult[] = [];

const binDir = join(repoRoot, "node_modules", ".bin");
if (existsSync(join(binDir, "tsc"))) {
  verifyChecks.push(
    runGate("tsc-check", "TypeScript Check (tsc --noEmit)", join(binDir, "tsc"), ["--noEmit"])
  );
}
if (existsSync(join(binDir, "vitest"))) {
  verifyChecks.push(
    runGate("vitest-unit", "Vitest Unit & Block Tests", join(binDir, "vitest"), ["run"])
  );
} else {
  verifyChecks.push({
    id: "vitest-unit",
    name: "Vitest Unit & Block Tests",
    category: "verify",
    status: "skip",
    durationMs: 0,
    summary: "Skipped offline (run pnpm install to enable Vitest)",
  });
}

const allChecks = [...doctor.checks, ...judges.checks, ...verifyChecks];
const report: QaRepoReport = {
  schemaVersion: "qa-report/v1",
  repoId: "astro-tiptap-blocks",
  repoName: "@vicacha-devs/astro-tiptap-blocks",
  ecosystem: "astro",
  repoPath: repoRoot,
  generatedAt: new Date().toISOString(),
  nodeVersion: process.versions.node,
  linkMode: "workspace",
  summary: summarizeChecks(allChecks, judges.plugins.length),
  checks: allChecks,
  plugins: judges.plugins,
  drifts: doctor.drifts,
};

const reportPath = writeQaReport(repoRoot, report);
const siblingReports = discoverSiblingReports(repoRoot);
const dashPath = writeQaDashboard(
  repoRoot,
  siblingReports.length > 1
    ? "Vicacha Ecosystem QA Control Center"
    : `${report.repoName} QA Report`,
  siblingReports.length > 0 ? siblingReports : [report]
);

for (const c of allChecks) {
  process.stdout.write(
    `[${c.status.toUpperCase()}] ${c.name} (${c.durationMs}ms) — ${c.summary}\n`
  );
}
process.stdout.write(`\nReport: ${reportPath}\nDashboard: ${dashPath}\n`);

if (report.summary.fail > 0 || (strict && report.summary.warn > 0)) {
  process.exit(1);
}
