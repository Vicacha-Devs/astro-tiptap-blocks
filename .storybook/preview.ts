import { definePreview } from "@storybook-astro/framework";
import addonA11y from "@storybook/addon-a11y";
import addonDocs from "@storybook/addon-docs";

import "./preview.css";

export default definePreview({
  addons: [addonDocs(), addonA11y()],
  parameters: {
    layout: "padded",
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      codePanel: true,
      toc: true,
    },
    a11y: {
      test: "todo",
    },
  },
  tags: ["autodocs"],
});
