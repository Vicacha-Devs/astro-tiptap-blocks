import { getViteConfig } from "astro/config";
import { coverageConfigDefaults } from "vitest/config";

export default getViteConfig({
  test: {
    globals: true,
    css: true,
    clearMocks: true,
    restoreMocks: true,
    passWithNoTests: true,
    include: ["src/**/*.{test,spec}.{astro,js,jsx,ts,tsx}"],
    environment: "node",
    setupFiles: ["./src/vitest.setup.ts"],
    coverage: {
      exclude: [
        ...coverageConfigDefaults.exclude,
        "**/*.stories.ts",
        "**/*.docs.mdx",
        "src/utils/test.helpers.ts",
        "src/vitest.setup.ts",
      ],
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      thresholds: {
        lines: 80,
        functions: 80,
        statements: 80,
      },
    },
  },
});
