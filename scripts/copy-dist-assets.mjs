import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

const ROOT_DIR = process.cwd();
const SRC_DIR = path.join(ROOT_DIR, "src");
const DIST_DIR = path.join(ROOT_DIR, "dist");

const EXCLUDED_COMPONENT_DIRS = new Set(["TiptapLibPreview"]);

function copyAstroComponents(srcDir, destDir) {
  for (const entry of readdirSync(srcDir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (EXCLUDED_COMPONENT_DIRS.has(entry.name)) {
        continue;
      }
      copyAstroComponents(path.join(srcDir, entry.name), path.join(destDir, entry.name));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".astro")) {
      mkdirSync(destDir, { recursive: true });
      copyFileSync(path.join(srcDir, entry.name), path.join(destDir, entry.name));
    }
  }
}

function resolveRelativeJsSpecifier(fromFileDir, specifier) {
  if (!specifier.startsWith("./") && !specifier.startsWith("../")) {
    return specifier;
  }

  if (/\.(?:astro|cjs|css|d\.ts|js|json|mjs)$/.test(specifier)) {
    return specifier;
  }

  const candidateBase = path.resolve(fromFileDir, specifier);
  if (existsSync(`${candidateBase}.js`)) {
    return `${specifier}.js`;
  }
  if (existsSync(path.join(candidateBase, "index.js"))) {
    return `${specifier.replace(/\/$/, "")}/index.js`;
  }

  return specifier;
}

function rewriteDistModuleSpecifiers(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      rewriteDistModuleSpecifiers(fullPath);
      continue;
    }

    if (!entry.isFile() || (!entry.name.endsWith(".js") && !entry.name.endsWith(".d.ts"))) {
      continue;
    }

    const fileDir = path.dirname(fullPath);
    const original = readFileSync(fullPath, "utf8");
    const rewritten = original.replace(
      /((?:from|import)\s+["'])(\.\.?\/[^"']+)(["'])/g,
      (_match, prefix, specifier, suffix) =>
        `${prefix}${resolveRelativeJsSpecifier(fileDir, specifier)}${suffix}`
    );

    if (rewritten !== original) {
      writeFileSync(fullPath, rewritten, "utf8");
    }
  }
}

mkdirSync(path.join(DIST_DIR, "components"), { recursive: true });

copyFileSync(path.join(SRC_DIR, "index.ts"), path.join(DIST_DIR, "index.js"));
copyFileSync(path.join(SRC_DIR, "index.d.ts"), path.join(DIST_DIR, "index.d.ts"));
copyFileSync(
  path.join(SRC_DIR, "components", "index.ts"),
  path.join(DIST_DIR, "components", "index.js")
);
copyFileSync(
  path.join(SRC_DIR, "components", "index.d.ts"),
  path.join(DIST_DIR, "components", "index.d.ts")
);

copyAstroComponents(path.join(SRC_DIR, "components"), path.join(DIST_DIR, "components"));
rewriteDistModuleSpecifiers(DIST_DIR);
