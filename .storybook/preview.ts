import { definePreview } from "@storybook-astro/framework";
import { decorators as astroDocsDecorators } from "@storybook-astro/renderer/entry-preview-docs";
import addonA11y from "@storybook/addon-a11y";
import addonDocs from "@storybook/addon-docs";
import addonThemes, { withThemeByDataAttribute } from "@storybook/addon-themes";
import {
  DOCS_RENDERED,
  GLOBALS_UPDATED,
  SET_GLOBALS,
  STORY_RENDERED,
  UPDATE_GLOBALS,
} from "storybook/internal/core-events";
import { addons } from "storybook/preview-api";

import "./preview.css";

const REGISTER_THEMES_EVENT = "storybook/themes/REGISTER_THEMES";
let currentTheme = "light";

const applyDocumentTheme = (themeName?: string) => {
  if (typeof document === "undefined") return;
  const resolved = themeName === "dark" ? "dark" : "light";
  currentTheme = resolved;
  document.documentElement.setAttribute("data-theme", resolved);
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.body?.setAttribute("data-theme", resolved);
};

if (typeof document !== "undefined") {
  applyDocumentTheme(currentTheme);
  try {
    const channel = addons.getChannel();
    const syncChannelTheme = (payload?: { globals?: { theme?: string } }) => {
      if (payload?.globals && typeof payload.globals.theme === "string" && payload.globals.theme) {
        applyDocumentTheme(payload.globals.theme);
      } else {
        applyDocumentTheme(currentTheme);
      }
      channel.emit(REGISTER_THEMES_EVENT, {
        defaultTheme: "light",
        themes: ["light", "dark"],
      });
    };
    syncChannelTheme();
    channel.on(SET_GLOBALS, syncChannelTheme);
    channel.on(GLOBALS_UPDATED, syncChannelTheme);
    channel.on(UPDATE_GLOBALS, syncChannelTheme);
    channel.on(DOCS_RENDERED, () => syncChannelTheme());
    channel.on(STORY_RENDERED, () => syncChannelTheme());
  } catch {
    // Ignore when running outside Storybook browser preview (e.g., unit tests).
  }
}

export default definePreview({
  addons: [addonDocs(), addonA11y(), addonThemes()],
  initialGlobals: {
    theme: "light",
  },
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
      source: {
        type: "dynamic",
      },
    },
    a11y: {
      test: "todo",
    },
  },
  decorators: [
    ...astroDocsDecorators,
    withThemeByDataAttribute({
      themes: { light: "light", dark: "dark" },
      defaultTheme: "light",
      attributeName: "data-theme",
    }),
  ],
  tags: ["autodocs"],
});
