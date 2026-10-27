import { defineMain } from "@storybook-astro/framework/node";
import remarkGfm from "remark-gfm";

export default defineMain({
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    {
      name: "@storybook/addon-docs",
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: { remarkPlugins: [remarkGfm] },
        },
      },
    },
    "@storybook/addon-a11y",
    "@storybook/addon-themes",
    "@storybook/addon-designs",
    "@storybook/addon-vitest",
    "storybook-addon-rtl",
    "storybook-addon-tag-badges",
  ],
  framework: {
    name: "@storybook-astro/framework",
  },
  core: {
    disableTelemetry: true,
  },
});
