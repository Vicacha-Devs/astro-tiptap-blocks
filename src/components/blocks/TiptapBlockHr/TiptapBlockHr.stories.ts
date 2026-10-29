import preview from "@storybook/preview";

import type { TiptapHorizontalRuleNode } from "../../../types";
import TiptapBlockHr from "./TiptapBlockHr.astro";

const meta = preview.meta({
  title: "Components/Blocks/TiptapBlockHr",
  component: TiptapBlockHr,
  tags: ["autodocs", "version:1.1.0"],
  args: {
    type: "horizontalRule",
  },
  argTypes: {
    type: {
      control: "text",
    },
  },
});

export const DefaultHorizontalRule = meta.story({
  args: {
    type: "horizontalRule",
  } satisfies TiptapHorizontalRuleNode,
});
