import {
  DOCS_RENDERED,
  GLOBALS_UPDATED,
  SET_CURRENT_STORY,
  SET_GLOBALS,
  STORY_RENDERED,
} from "storybook/internal/core-events";
import { addons } from "storybook/manager-api";
import { create } from "storybook/theming";
import { defaultConfig } from "storybook-addon-tag-badges/manager-helpers";

const REGISTER_THEMES_EVENT = "storybook/themes/REGISTER_THEMES";

const brand = {
  brandTitle: "astro-tiptap-blocks",
  brandUrl: "https://github.com/Vicacha-Devs/astro-tiptap-blocks",
  brandTarget: "_blank",
  fontBase: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  colorPrimary: "#3b82f6",
  colorSecondary: "#2563eb",
} as const;

const lightTheme = create({
  base: "light",
  ...brand,
  appBg: "#f8fafc",
  appContentBg: "#ffffff",
  barBg: "#ffffff",
  textColor: "#0f172a",
});

const darkTheme = create({
  base: "dark",
  ...brand,
  appBg: "#0b1120",
  appContentBg: "#0f172a",
  barBg: "#0f172a",
  textColor: "#f8fafc",
});

const tagBadges = [
  {
    tags: ["rtl"],
    badge: {
      text: "RTL",
      tooltip: "Verified in right-to-left layouts",
      style: { backgroundColor: "#ede9fe", color: "#5b21b6", borderColor: "#c4b5fd" },
    },
    display: { sidebar: ["component", "story"], toolbar: true },
  },
  {
    tags: ["security"],
    badge: {
      text: "Sanitized",
      tooltip: "Renders user-supplied URLs or styles through the sanitizers",
      style: { backgroundColor: "#dcfce7", color: "#166534", borderColor: "#86efac" },
    },
    display: { sidebar: ["component"], toolbar: true },
  },
  ...defaultConfig,
];

addons.setConfig({
  theme: lightTheme,
  tagBadges,
});

addons.register("astro-tiptap-blocks/theme-sync", (api) => {
  const channel = api.getChannel();
  if (!channel) return;

  const announceThemes = () => {
    channel.emit(REGISTER_THEMES_EVENT, {
      defaultTheme: "light",
      themes: ["light", "dark"],
    });
  };

  const applyManagerTheme = (themeName?: string) => {
    addons.setConfig({
      theme: themeName === "dark" ? darkTheme : lightTheme,
      tagBadges,
    });
  };

  announceThemes();
  channel.on(SET_CURRENT_STORY, announceThemes);
  channel.on(STORY_RENDERED, announceThemes);
  channel.on(DOCS_RENDERED, announceThemes);
  channel.on(SET_GLOBALS, ({ globals }: { globals?: { theme?: string } }) => {
    announceThemes();
    applyManagerTheme(globals?.theme);
  });
  channel.on(GLOBALS_UPDATED, ({ globals }: { globals?: { theme?: string } }) => {
    applyManagerTheme(globals?.theme);
  });
});
