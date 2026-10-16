import { definePreview } from "@storybook-astro/framework";
import addonDocs from "@storybook/addon-docs";

import "./preview.css";

export default definePreview({
  addons: [addonDocs()],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      codePanel: true,
      toc: true,
    },
  },
  tags: ["autodocs"],
});
