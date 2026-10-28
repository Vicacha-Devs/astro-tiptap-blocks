import preview from "@storybook/preview";
import type { TiptapConversationHistoryNode, TiptapInformationPaneNode } from "../../../types";

import TiptapBlockCallout from "./TiptapBlockCallout.astro";

const meta = preview.meta({
  title: "Components/Blocks/TiptapBlockCallout",
  component: TiptapBlockCallout,
  tags: ["autodocs", "version:1.1.0", "new"],
  args: {
    type: "informationPane",
    attrs: { variant: "info", title: "Architecture Note" },
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text: "Callout message body." }],
      },
    ],
  },
  argTypes: {
    type: {
      control: "select",
      options: ["informationPane", "conversationHistory"],
    },
    attrs: {
      control: "object",
    },
    content: {
      control: "object",
    },
  },
});

export const InfoPane = meta.story({
  args: {
    type: "informationPane",
    attrs: { variant: "info", title: "Architecture Note" },
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "The InformationPane extension supports nested paragraphs, lists, code blocks, and inline marks.",
          },
        ],
      },
    ],
  } satisfies TiptapInformationPaneNode,
});

export const SuccessPane = meta.story({
  args: {
    type: "informationPane",
    attrs: { variant: "success", title: "Deployment Verified" },
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text: "All unit and security tests passed with zero warnings." }],
      },
    ],
  } satisfies TiptapInformationPaneNode,
});

export const WarningPane = meta.story({
  args: {
    type: "informationPane",
    attrs: { variant: "warning", title: "Migration Notice" },
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Legacy string[] content arrays are automatically normalized into paragraph nodes.",
          },
        ],
      },
    ],
  } satisfies TiptapInformationPaneNode,
});

export const DangerPane = meta.story({
  args: {
    type: "informationPane",
    attrs: { variant: "danger", title: "Security Policy" },
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Every external URL rendered in href or src is validated by sanitizeTiptapUrl.",
          },
        ],
      },
    ],
  } satisfies TiptapInformationPaneNode,
});

export const TipPane = meta.story({
  args: {
    type: "informationPane",
    attrs: { variant: "tip", title: "Pro Tip" },
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Pass custom Astro components to the blocks prop to override any default renderer without set:html.",
          },
        ],
      },
    ],
  } satisfies TiptapInformationPaneNode,
});

export const NeutralPane = meta.story({
  args: {
    type: "informationPane",
    attrs: { variant: "neutral", title: "Implementation Reference" },
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Neutral callout panes are ideal for side notes, specifications, and glossary definitions.",
          },
        ],
      },
    ],
  } satisfies TiptapInformationPaneNode,
});

export const ConversationHistoryEntry = meta.story({
  args: {
    type: "conversationHistory",
    attrs: { author: "Alice (Lead Editor)", timestamp: "2026-04-19 09:30" },
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text: "Added the new SEO heading tag overrides and math formulas." }],
      },
    ],
  } satisfies TiptapConversationHistoryNode,
});
