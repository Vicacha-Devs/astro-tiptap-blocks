import preview from "@storybook/preview";
import type { TiptapBulletListNode, TiptapOrderedListNode, TiptapTaskListNode } from "../../../types";

import TiptapBlockList from "./TiptapBlockList.astro";

const meta = preview.meta({
  title: "Components/Blocks/TiptapBlockList",
  component: TiptapBlockList,
  tags: ["autodocs", "version:1.1.0"],
  args: {
    type: "bulletList",
    content: [],
  },
  argTypes: {
    type: {
      control: "select",
      options: ["bulletList", "orderedList", "taskList"],
    },
    attrs: {
      control: "object",
    },
    content: {
      control: "object",
    },
  },
});

export const BulletList = meta.story({
  args: {
    type: "bulletList",
    content: [
      {
        type: "listItem",
        content: [{ type: "paragraph", content: [{ type: "text", text: "ProseMirror JSON document input" }] }],
      },
      {
        type: "listItem",
        content: [{ type: "paragraph", content: [{ type: "text", text: "Strapi HTML output mode" }] }],
      },
      {
        type: "listItem",
        content: [{ type: "paragraph", content: [{ type: "text", text: "Markdown with lossless metadata comments" }] }],
      },
    ],
  } satisfies TiptapBulletListNode,
});

export const OrderedListWithCustomStart = meta.story({
  args: {
    type: "orderedList",
    attrs: { start: 3 },
    content: [
      {
        type: "listItem",
        content: [{ type: "paragraph", content: [{ type: "text", text: "Step three: Configure theme extend/overwrite" }] }],
      },
      {
        type: "listItem",
        content: [{ type: "paragraph", content: [{ type: "text", text: "Step four: Provide resolveInternalLink" }] }],
      },
    ],
  } satisfies TiptapOrderedListNode,
});

export const TaskChecklist = meta.story({
  args: {
    type: "taskList",
    content: [
      {
        type: "taskItem",
        attrs: { checked: true },
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Sanitize all href and src attributes against XSS protocols" }],
          },
        ],
      },
      {
        type: "taskItem",
        attrs: { checked: true },
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Add JSDoc prop documentation to all Astro components" }],
          },
        ],
      },
      {
        type: "taskItem",
        attrs: { checked: false },
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Publish @vicacha-devs/astro-tiptap-blocks release" }],
          },
        ],
      },
    ],
  } satisfies TiptapTaskListNode,
});
