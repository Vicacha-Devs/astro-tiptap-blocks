import js from "@eslint/js";
import json from "@eslint/json";
import vitest from "@vitest/eslint-plugin";
import * as parserAstro from "astro-eslint-parser";
import { configs as astroConfigs } from "eslint-plugin-astro";
import { importX } from "eslint-plugin-import-x";
import jestDOM from "eslint-plugin-jest-dom";
import { configs as sonarjs } from "eslint-plugin-sonarjs";
import { configs as storybookConfigs } from "eslint-plugin-storybook";
import testingLibrary from "eslint-plugin-testing-library";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

const sbConfigs = storybookConfigs["flat/recommended"];
type SBConfig = Exclude<(typeof sbConfigs)[0], { plugins: { storybook: Record<string, unknown> } }>;

export default defineConfig([
  globalIgnores([
    "coverage",
    "dist",
    "storybook-static",
    "node_modules",
    ".astro",
    ".github",
    ".vscode",
    "**/*.mdx",
    "**/*.md",
    "**/*.css",
    "!.storybook",
  ]),
  {
    ...sonarjs.recommended,
    ignores: ["**/*.{json,md,mdx,css,astro}"],
    rules: {
      "sonarjs/cognitive-complexity": "off",
      "sonarjs/no-nested-conditional": "off",
      "sonarjs/no-nested-functions": "off",
      "sonarjs/slow-regex": "off",
      "sonarjs/todo-tag": "warn",
    },
  },
  importX.configs.typescript,
  {
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}"],
    plugins: { js, "import-x": importX },
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        projectService: {
          allowDefaultProject: ["src/index.d.ts", "src/components/index.d.ts"],
        },
      },
    },
    rules: {
      "no-control-regex": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "import-x/no-unresolved": "off",
    },
  },
  astroConfigs.recommended,
  astroConfigs["jsx-a11y-recommended"],
  {
    files: ["**/*.astro"],
    languageOptions: {
      parser: parserAstro,
      parserOptions: {
        parser: tseslint.parser,
      },
    },
    rules: {
      "astro/jsx-a11y/media-has-caption": "off",
      "astro/jsx-a11y/no-redundant-roles": "off",
      "astro/jsx-a11y/prefer-tag-over-role": "off",
    },
  },
  {
    files: ["**/*.json"],
    ignores: ["package-lock.json", "tsconfig*.json"],
    plugins: { json },
    language: "json/json",
    extends: ["json/recommended"],
  },
  {
    files: ["src/**/*.test.[tj]s?(x)"],
    ...jestDOM.configs["flat/recommended"],
    ...testingLibrary.configs["flat/dom"],
    ...vitest.configs.recommended,
    languageOptions: {
      globals: {
        ...vitest.environments.env.globals,
      },
    },
  },
  ...(sbConfigs as unknown as Array<SBConfig>),
]);
