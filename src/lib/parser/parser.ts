import type {
  TiptapBlockNode,
  TiptapContentInput,
  TiptapDocNode,
  TiptapParserOptions,
  TiptapTocHeadingItem,
} from "../../types";
import { parseTiptapHtml } from "../html-parser";
import { isLikelyMarkdown, parseTiptapMarkdown } from "../markdown-parser";
import { slugifyHeadingText } from "../sanitize";
import { extractInlineText } from "./parser-inline";
import { sanitizeBlockNodes } from "./parser-sanitize";

const collectTocHeadings = (blocks?: TiptapBlockNode[]): TiptapTocHeadingItem[] => {
  const headings: TiptapTocHeadingItem[] = [];
  for (const b of blocks ?? []) {
    if (b.type === "heading") {
      const text = extractInlineText(b.content).trim();
      if (text) {
        headings.push({
          id: b.attrs?.id || slugifyHeadingText(text),
          text,
          level: b.attrs?.level ?? 2,
        });
      }
    } else if (
      b.type === "blockquote" ||
      b.type === "informationPane" ||
      b.type === "conversationHistory"
    ) {
      headings.push(...collectTocHeadings(b.content));
    } else if (b.type === "layoutContainer") {
      for (const col of b.content ?? []) headings.push(...collectTocHeadings(col.content));
    } else if (b.type === "details") {
      for (const child of b.content ?? []) {
        if (child.type === "detailsContent") headings.push(...collectTocHeadings(child.content));
        else if (child.type !== "detailsSummary") headings.push(...collectTocHeadings([child]));
      }
    }
  }
  return headings;
};

const populateTocBlocks = (blocks: TiptapBlockNode[]): TiptapBlockNode[] => {
  const headings = collectTocHeadings(blocks);
  return blocks.map((b) =>
    b.type === "tableOfContents" && (!b.attrs?.headings || b.attrs.headings.length === 0)
      ? { ...b, attrs: { ...b.attrs, headings } }
      : b
  );
};

export const parseTiptapContent = (
  input: TiptapContentInput,
  options?: TiptapParserOptions
): TiptapDocNode => {
  if (!input) return { type: "doc", content: [] };
  if (Array.isArray(input)) {
    if (input.length === 0) return { type: "doc", content: [] };
    if (typeof input[0] === "string") {
      return {
        type: "doc",
        content: (input as unknown as string[])
          .filter((p) => typeof p === "string" && p.trim().length > 0)
          .map((p) => ({ type: "paragraph", content: [{ type: "text", text: p }] })),
      };
    }
    return {
      type: "doc",
      content: populateTocBlocks(sanitizeBlockNodes(input as TiptapBlockNode[], options)),
    };
  }
  if (typeof input === "object" && "type" in input && input.type === "doc") {
    const docInput = input as TiptapDocNode;
    const content = populateTocBlocks(sanitizeBlockNodes(docInput.content, options));
    return {
      type: "doc",
      content,
      ...(typeof docInput.words === "number" ? { words: docInput.words } : {}),
      ...(typeof docInput.characters === "number" ? { characters: docInput.characters } : {}),
      ...(typeof docInput.readingTimeMinutes === "number"
        ? { readingTimeMinutes: docInput.readingTimeMinutes }
        : {}),
      ...(typeof docInput.readingTime === "string" ? { readingTime: docInput.readingTime } : {}),
      ...(docInput.stats && typeof docInput.stats === "object" ? { stats: docInput.stats } : {}),
    };
  }
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) return { type: "doc", content: [] };
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        return parseTiptapContent(JSON.parse(trimmed), options);
      } catch {
        /* fall through */
      }
    }
    if (
      trimmed.startsWith("<") &&
      !/^<!--\s*(?:pagebreak|toc|tiptap-node:)/i.test(trimmed) &&
      !trimmed.includes("<!-- tiptap-node:")
    )
      return parseTiptapContent(parseTiptapHtml(trimmed), options);
    if (isLikelyMarkdown(trimmed)) return parseTiptapContent(parseTiptapMarkdown(trimmed), options);
    if (trimmed.includes("<") && trimmed.includes(">"))
      return parseTiptapContent(parseTiptapHtml(trimmed), options);
    return {
      type: "doc",
      content: trimmed
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((text) => ({ type: "paragraph", content: [{ type: "text", text }] })),
    };
  }
  return { type: "doc", content: [] };
};
