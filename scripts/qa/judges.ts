import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { QaCheckResult, QaPluginEntry } from "./types.ts";
import { safeReadJson } from "./types.ts";

function walkFiles(dir: string, exts: Set<string>, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === "dist") continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(full, exts, out);
    } else if (entry.isFile()) {
      for (const ext of exts) {
        if (entry.name.endsWith(ext)) {
          out.push(full);
          break;
        }
      }
    }
  }
  return out;
}

export function runAstroTiptapJudges(repoRoot: string): {
  checks: QaCheckResult[];
  plugins: QaPluginEntry[];
} {
  const pkg = safeReadJson<{
    name?: string;
    version?: string;
    exports?: Record<string, unknown>;
    files?: string[];
    scripts?: Record<string, string>;
  }>(join(repoRoot, "package.json"));

  const srcDir = join(repoRoot, "src");
  const astroFiles = walkFiles(srcDir, new Set([".astro"]));
  const testFiles = walkFiles(srcDir, new Set([".test.ts", ".spec.ts"]));
  const storyFiles = walkFiles(srcDir, new Set([".stories.ts", ".stories.tsx"]));

  // Judge 1: Package exports & publishConfig contract
  const requiredExports = [".", "./astro", "./components", "./lib", "./types"];
  const missingExports = requiredExports.filter((k) => !pkg?.exports?.[k]);
  const manifestCheck: QaCheckResult = {
    id: "judge-package-exports",
    name: "Judge 1: Package Exports & Distribution Contract",
    category: "judge",
    status: missingExports.length === 0 ? "pass" : "fail",
    durationMs: 1,
    summary:
      missingExports.length === 0
        ? `All ${requiredExports.length} public entrypoints exported`
        : `Missing exports: ${missingExports.join(", ")}`,
  };

  // Judge 2: XSS Guard — review any raw set:html in Astro blocks
  const rawHtmlFiles: string[] = [];
  for (const f of astroFiles) {
    const content = readFileSync(f, "utf8");
    if (/\bset:html\s*=/.test(content)) {
      rawHtmlFiles.push(relative(repoRoot, f));
    }
  }
  const xssCheck: QaCheckResult = {
    id: "judge-xss-set-html",
    name: "Judge 2: Astro Block XSS Guard (set:html audit)",
    category: "judge",
    status: rawHtmlFiles.length === 0 ? "pass" : "warn",
    durationMs: 2,
    summary:
      rawHtmlFiles.length === 0
        ? `Scanned ${astroFiles.length} .astro block files with zero raw set:html`
        : `${rawHtmlFiles.length} file(s) use set:html (verify sanitization)`,
    details: rawHtmlFiles,
  };

  // Judge 3: Test & Storybook coverage presence
  const coveragePresence: QaCheckResult = {
    id: "judge-tests-and-stories",
    name: "Judge 3: Unit Test & Storybook Story Coverage Presence",
    category: "judge",
    status: testFiles.length > 0 && storyFiles.length > 0 ? "pass" : "fail",
    durationMs: 1,
    summary: `${testFiles.length} test file(s) & ${storyFiles.length} Storybook stories across ${astroFiles.length} Astro components`,
  };

  const entry: QaPluginEntry = {
    name: pkg?.name ?? "@vicacha-devs/astro-tiptap-blocks",
    pluginId: "astro-tiptap-blocks",
    ecosystem: "astro",
    version: pkg?.version ?? "0.0.0",
    hasTests: testFiles.length > 0,
    hasBuildScript: Boolean(pkg?.scripts?.build),
    hasTypecheck: Boolean(pkg?.scripts?.check),
    wiredInHost: existsSync(
      resolve(repoRoot, "../central-mosque-bogota/apps/frontend/package.json")
    ),
    localeCount: 0,
    status: missingExports.length === 0 && testFiles.length > 0 ? "pass" : "fail",
    notes: [`${astroFiles.length} Astro blocks`, `${storyFiles.length} stories`],
  };

  return {
    checks: [manifestCheck, xssCheck, coveragePresence],
    plugins: [entry],
  };
}

if (resolve(process.argv[1] ?? "") === resolve(fileURLToPath(import.meta.url))) {
  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
  const { checks } = runAstroTiptapJudges(repoRoot);
  let failed = 0;
  for (const c of checks) {
    process.stdout.write(`[${c.status.toUpperCase()}] ${c.name}: ${c.summary}\n`);
    for (const d of c.details ?? []) process.stdout.write(`    - ${d}\n`);
    if (c.status === "fail") failed += 1;
  }
  if (failed > 0) process.exit(1);
}
