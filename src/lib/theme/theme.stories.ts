import preview from "@storybook/preview";
import TiptapLibPreview from "../../components/blocks/TiptapLibPreview/TiptapLibPreview.astro";
import type { TiptapBlockUserTheme, TiptapDocNode } from "../../types";

import {
  buildThemeObject,
  renderPropertyClasses,
  TiptapBlockThemeDefault,
} from "./theme";

const extendUserTheme: TiptapBlockUserTheme = {
  extend: {
    heading: {
      default: "text-indigo-950",
      h2: "border-b-2 border-indigo-200 pb-2",
    },
    informationPane: {
      info: "border-indigo-500 bg-indigo-50 text-indigo-950",
    },
  },
};

const overwriteUserTheme: TiptapBlockUserTheme = {
  overwrite: {
    heading: {
      default: "font-serif uppercase tracking-widest text-amber-900",
      h2: "text-2xl my-4",
    },
    informationPane: {
      info: "border-amber-600 bg-amber-50 text-amber-950",
    },
  },
};

const extendedTheme = buildThemeObject(extendUserTheme, TiptapBlockThemeDefault);
const overwrittenTheme = buildThemeObject(overwriteUserTheme, TiptapBlockThemeDefault);

const previewDoc: TiptapDocNode = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "Themed H2 Heading" }],
    },
    {
      type: "informationPane",
      attrs: { variant: "info", title: "Themed Callout" },
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Comparing 'extend' vs 'overwrite' theme merge strategies." }],
        },
      ],
    },
  ],
};

const meta = preview.meta({
  title: "Lib/theme",
  component: TiptapLibPreview,
  tags: ["autodocs", "version:1.1.0"],
  args: {
    title: "buildThemeObject({ extend: ... }, TiptapBlockThemeDefault)",
    subtitle: "Appends custom Tailwind classes onto TiptapBlockThemeDefault slots.",
    inputPreview: JSON.stringify(extendUserTheme, null, 2),
    outputPreview: JSON.stringify(
      {
        headingH2Classes: renderPropertyClasses(extendedTheme.heading, "h2"),
        infoPaneClasses: renderPropertyClasses(extendedTheme.informationPane, "info"),
      },
      null,
      2,
    ),
    renderedContent: previewDoc,
    theme: extendUserTheme,
  },
});

export const ExtendModeThemeMerging = meta.story({
  args: {
    title: "buildThemeObject({ extend: ... }, TiptapBlockThemeDefault)",
    subtitle: "Appends custom Tailwind classes onto TiptapBlockThemeDefault slots.",
    inputPreview: JSON.stringify(extendUserTheme, null, 2),
    outputPreview: JSON.stringify(
      {
        headingH2Classes: renderPropertyClasses(extendedTheme.heading, "h2"),
        infoPaneClasses: renderPropertyClasses(extendedTheme.informationPane, "info"),
      },
      null,
      2,
    ),
    renderedContent: previewDoc,
    theme: extendUserTheme,
  },
});

export const OverwriteModeThemeReplacement = meta.story({
  args: {
    title: "buildThemeObject({ overwrite: ... }, TiptapBlockThemeDefault)",
    subtitle: "Replaces only the specified slots while leaving unspecified defaults intact.",
    inputPreview: JSON.stringify(overwriteUserTheme, null, 2),
    outputPreview: JSON.stringify(
      {
        headingH2Classes: renderPropertyClasses(overwrittenTheme.heading, "h2"),
        infoPaneClasses: renderPropertyClasses(overwrittenTheme.informationPane, "info"),
      },
      null,
      2,
    ),
    renderedContent: previewDoc,
    theme: overwriteUserTheme,
  },
});
