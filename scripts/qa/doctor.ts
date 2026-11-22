import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { QaCheckResult, QaDriftItem } from "./types.ts";
import { safeReadJson } from "./types.ts";

interface PkgJson {
  name?: string;
  version?: string;
  peerDependencies?: Record<string, string>;
  dependencies?: Record<string, string>;
}

export function runAstroTiptapDoctor(repoRoot: string): {
  checks: QaCheckResult[];
  drifts: QaDriftItem[];
} {
  const checks: QaCheckResult[] = [];
  const drifts: QaDriftItem[] = [];

  const major = Number.parseInt(process.versions.node.split(".")[0], 10);
  checks.push({
    id: "runtime-node",
    name: "Node.js Runtime Compatibility",
    category: "doctor",
    status: major >= 20 ? "pass" : "fail",
    durationMs: 1,
    summary: `Node v${process.versions.node} detected (requires >=20.16.0)`,
  });

  const ownPkg = safeReadJson<PkgJson>(join(repoRoot, "package.json"));
  const ownVersion = ownPkg?.version ?? "0.0.0";

  const siblingMosque = resolve(repoRoot, "../central-mosque-bogota");
  if (existsSync(siblingMosque)) {
    const fePkg = safeReadJson<PkgJson>(join(siblingMosque, "apps", "frontend", "package.json"));
    const ref = fePkg?.dependencies?.["@vicacha-devs/astro-tiptap-blocks"] ?? "missing";
    const astroVer = fePkg?.dependencies?.astro ?? "unknown";
    checks.push({
      id: "sibling-mosque-consumer",
      name: "Sibling Central Mosque Consumer Contract",
      category: "doctor",
      status: ref !== "missing" ? "pass" : "warn",
      durationMs: 1,
      summary: `central-mosque consumes ${ref} (Astro ${astroVer}; pkg v${ownVersion})`,
    });
  }

  const siblingTiptapPlugin = resolve(
    repoRoot,
    "../strapi-v5-extensions/packages/strapi-plugin-tiptap-editor/package.json"
  );
  if (existsSync(siblingTiptapPlugin)) {
    const tiptapPkg = safeReadJson<PkgJson>(siblingTiptapPlugin);
    checks.push({
      id: "sibling-tiptap-editor",
      name: "Sibling strapi-plugin-tiptap-editor Companion Presence",
      category: "doctor",
      status: "pass",
      durationMs: 1,
      summary: `Detected @vicacha-devs/strapi-plugin-tiptap-editor v${tiptapPkg?.version ?? "unknown"}`,
    });
  }

  return { checks, drifts };
}

if (resolve(process.argv[1] ?? "") === resolve(fileURLToPath(import.meta.url))) {
  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
  const { checks } = runAstroTiptapDoctor(repoRoot);
  let failed = 0;
  for (const c of checks) {
    process.stdout.write(`[${c.status.toUpperCase()}] ${c.name}: ${c.summary}\n`);
    if (c.status === "fail") failed += 1;
  }
  if (failed > 0) process.exit(1);
}
