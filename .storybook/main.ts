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
  ],
  framework: {
    name: "@storybook-astro/framework",
  },
});
