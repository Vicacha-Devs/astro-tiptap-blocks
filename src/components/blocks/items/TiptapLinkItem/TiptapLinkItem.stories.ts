import preview from "@storybook/preview";
import type { TiptapLinkMark, TiptapMark } from "../../../../types";

import TiptapLinkItem from "./TiptapLinkItem.astro";

const meta = preview.meta({
  title: "Components/Blocks/Items/TiptapLinkItem",
  component: TiptapLinkItem,
  tags: ["autodocs", "version:1.1.0"],
  args: {
    type: "text",
    text: "Astro Documentation",
    linkMark: {
      type: "link",
      attrs: {
        href: "https://docs.astro.build",
        target: "_blank",
      },
    },
  },
  argTypes: {
    text: {
      control: "text",
    },
    marks: {
      control: "object",
    },
    linkMark: {
      control: "object",
    },
  },
});

export const ExternalLinkWithBlankTarget = meta.story({
  args: {
    type: "text",
    text: "Astro Documentation (External _blank)",
    marks: [{ type: "bold" }] satisfies TiptapMark[],
    linkMark: {
      type: "link",
      attrs: {
        href: "https://docs.astro.build",
        target: "_blank",
        title: "Open Astro Docs in a new tab",
      },
    } satisfies TiptapLinkMark,
  },
});

export const InternalStrapiRelationUriLink = meta.story({
  args: {
    type: "text",
    text: "Internal Strapi Article (strapi://api::article.article/doc-99)",
    linkMark: {
      type: "link",
      attrs: {
        href: "strapi://api::article.article/doc-99",
      },
    } satisfies TiptapLinkMark,
  },
});
