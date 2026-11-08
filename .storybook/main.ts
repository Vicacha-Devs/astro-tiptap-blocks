import { defineMain } from "@storybook-astro/framework/node";
import remarkGfm from "remark-gfm";

const SITE_URL = "https://vicacha-devs.github.io/astro-tiptap-blocks/";
const SITE_TITLE = "Astro Tiptap Blocks";
const SITE_DESCRIPTION =
  "Themeable, zero-JS Astro block components for rendering Tiptap / ProseMirror rich text (JSON, HTML & Markdown) without set:html.";

const metaTags = `
  <meta name="description" content="${SITE_DESCRIPTION}" />
  <meta name="theme-color" content="#2563eb" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="${SITE_TITLE}" />
  <meta property="og:title" content="${SITE_TITLE}" />
  <meta property="og:description" content="${SITE_DESCRIPTION}" />
  <meta property="og:url" content="${SITE_URL}" />
  <link rel="canonical" href="${SITE_URL}" />
  <link rel="icon" type="image/svg+xml" href="./favicon.svg" />`;

export default defineMain({
  // `title` is read by the manager HTML template but is missing from StorybookConfig typings.
  ...({ title: SITE_TITLE } as object),
  staticDirs: ["./public"],
  managerHead: (head) => `${head}${metaTags}`,
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
