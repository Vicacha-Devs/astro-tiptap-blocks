import preview from "@storybook/preview";

import type { TiptapImageNode } from "../../../types";
import TiptapBlockImage from "./TiptapBlockImage.astro";

const sampleImageUrl =
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=960&q=80";

const meta = preview.meta({
  title: "Components/Blocks/TiptapBlockImage",
  component: TiptapBlockImage,
  tags: ["autodocs", "version:1.1.0"],
  args: {
    type: "image",
    attrs: {
      src: sampleImageUrl,
      alt: "Circuit board macro photography",
    },
  },
  argTypes: {
    type: {
      control: "text",
    },
    attrs: {
      control: "object",
    },
  },
});

export const CenteredFigureWithCaption = meta.story({
  args: {
    type: "image",
    attrs: {
      "src": sampleImageUrl,
      "alt": "Circuit board macro photography",
      "caption": "Figure 1: Media asset with caption and documentId metadata.",
      "data-align": "center",
      "width": 720,
      "height": 405,
      "data-asset-id": 42,
      "data-document-id": "media-circuit-board-42",
    },
  } satisfies TiptapImageNode,
});

export const RightAlignedImage = meta.story({
  args: {
    type: "image",
    attrs: {
      "src": sampleImageUrl,
      "alt": "Right-aligned hardware graphic",
      "title": "Right-aligned image using data-align='right'",
      "data-align": "right",
      "width": 480,
      "height": 270,
    },
  } satisfies TiptapImageNode,
});
