import preview from "@storybook/preview";

import TiptapBlockCallout from "../TiptapBlockCallout/TiptapBlockCallout.astro";
import TiptapBlockCustom from "./TiptapBlockCustom.astro";

const meta = preview.meta({
  title: "Components/Blocks/TiptapBlockCustom",
  component: TiptapBlockCustom,
  tags: ["autodocs", "version:1.1.0"],
  argTypes: {
    component: {
      control: false,
    },
  },
});

export const DelegatedCustomCalloutComponent = meta.story({
  args: {
    component: TiptapBlockCallout,
    type: "informationPane",
    attrs: {
      variant: "tip",
      title: "Rendered via TiptapBlockCustom",
    },
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "TiptapBlockCustom forwards all block props (...rest) and slots to the custom Astro component factory.",
          },
        ],
      },
    ],
  },
});
