import { addons } from "storybook/manager-api";
import { create } from "storybook/theming";
import { defaultConfig } from "storybook-addon-tag-badges/manager-helpers";

const brand = {
  brandTitle: "astro-tiptap-blocks",
  brandUrl: "https://github.com/Vicacha-Devs/astro-tiptap-blocks",
  brandTarget: "_blank",
  fontBase: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  colorPrimary: "#3b82f6",
  colorSecondary: "#2563eb",
} as const;

addons.setConfig({
  theme: create({
    base: "light",
    ...brand,
    appBg: "#f8fafc",
    appContentBg: "#ffffff",
    barBg: "#ffffff",
    textColor: "#0f172a",
  }),
  tagBadges: [
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
  ],
});
