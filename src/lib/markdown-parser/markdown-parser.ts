import type {
  TiptapBlockNode,
  TiptapDocNode,
  TiptapHeadingLevel,
  TiptapTableCellNode,
  TiptapTableRowNode,
} from "../../types";
import { parseTiptapHtml } from "../html-parser";
import { sanitizeTiptapUrl } from "../sanitize";
import {
  isLikelyMarkdown,
  parseMarkdownInline,
  parseMediaBlock,
  parseQuoteChunk,
} from "./markdown-inline";

export { isLikelyMarkdown, parseMarkdownInline };

const TIPTAP_META_COMMENT_RE = /\n?<!--\s*tiptap-node:([\s\S]*?)\s*-->$/;

const parseTableCells = (rowStr: string, isHeader: boolean): TiptapTableCellNode[] =>
  rowStr
    .trim()
    .replace(/^\||\|$/g, "")
    .split(/(?<!\\)\|/)
    .map((c) => ({
      type: isHeader ? "tableHeader" : "tableCell",
      content: [
        { type: "paragraph", content: parseMarkdownInline(c.replace(/\\\|/g, "|").trim()) },
      ],
    }));

const parseMarkdownChunk = (rawChunk: string): TiptapBlockNode[] => {
  const metaMatch = TIPTAP_META_COMMENT_RE.exec(rawChunk);
  if (metaMatch) {
    try {
      const parsed = JSON.parse(metaMatch[1].replace(/--\\u003e/g, "-->")) as TiptapBlockNode;
      if (parsed && typeof parsed === "object" && "type" in parsed) return [parsed];
    } catch {
      /* fallback to markdown parsing */
    }
  }

  const chunk = rawChunk.replace(TIPTAP_META_COMMENT_RE, "").trim();
  if (!chunk) return [];
  if (/^<!--\s*pagebreak\s*-->$/i.test(chunk)) return [{ type: "pageBreak" }];
  if (/^<!--\s*toc\s*-->$/i.test(chunk)) return [{ type: "tableOfContents" }];
  if (/^(?:---|\*\*\*|___)$/.test(chunk)) return [{ type: "horizontalRule" }];
  if (chunk.startsWith("$$") && chunk.endsWith("$$") && chunk.length > 4) {
    return [
      { type: "mathematics", attrs: { latex: chunk.slice(2, -2).trim(), displayMode: "block" } },
    ];
  }
  if (chunk.startsWith("```")) {
    const lines = chunk.split("\n");
    const lang = lines[0].slice(3).trim() || null;
    const code = lines
      .slice(1, lines[lines.length - 1].startsWith("```") ? -1 : undefined)
      .join("\n");
    return [
      {
        type: "codeBlock",
        attrs: { language: lang },
        content: code ? [{ type: "text", text: code }] : [],
      },
    ];
  }

  const headingMatch = /^(#{1,6})\s+(.+)$/.exec(chunk);
  if (headingMatch) {
    return [
      {
        type: "heading",
        attrs: { level: headingMatch[1].length as TiptapHeadingLevel },
        content: parseMarkdownInline(headingMatch[2].trim()),
      },
    ];
  }

  const mediaMatch = /^\[(?:(Video|Audio|Attachment|Embed):\s*([^\]]*))\]\(([^)\s]+)\)$/.exec(
    chunk
  );
  if (mediaMatch) {
    return parseMediaBlock(mediaMatch[1].toLowerCase(), mediaMatch[2].trim(), mediaMatch[3]);
  }

  const imgMatch = /^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/.exec(chunk);
  if (imgMatch) {
    const src = sanitizeTiptapUrl(imgMatch[2]);
    return src === "#"
      ? []
      : [{ type: "image", attrs: { src, alt: imgMatch[1] || "", title: imgMatch[3] || null } }];
  }

  if (chunk.startsWith(">")) {
    return parseQuoteChunk(chunk, (md) => parseTiptapMarkdown(md).content);
  }

  const lines = chunk.split("\n");
  if (lines.every((l) => /^[-*]\s+\[([ xX])\]\s+/.test(l.trim()))) {
    return [
      {
        type: "taskList",
        content: lines.map((l) => {
          const m = /^[-*]\s+\[([ xX])\]\s+(.*)$/.exec(l.trim())!;
          return {
            type: "taskItem",
            attrs: { checked: m[1].toLowerCase() === "x" },
            content: [{ type: "paragraph", content: parseMarkdownInline(m[2]) }],
          };
        }),
      },
    ];
  }
  if (lines.every((l) => /^[-*]\s+/.test(l.trim()))) {
    return [
      {
        type: "bulletList",
        content: lines.map((l) => ({
          type: "listItem",
          content: [
            { type: "paragraph", content: parseMarkdownInline(l.trim().replace(/^[-*]\s+/, "")) },
          ],
        })),
      },
    ];
  }
  if (lines.every((l) => /^\d+\.\s+/.test(l.trim()))) {
    const firstStart = Number(/^(\d+)\.\s+/.exec(lines[0].trim())?.[1] ?? 1);
    return [
      {
        type: "orderedList",
        ...(firstStart > 1 ? { attrs: { start: firstStart } } : {}),
        content: lines.map((l) => ({
          type: "listItem",
          content: [
            { type: "paragraph", content: parseMarkdownInline(l.trim().replace(/^\d+\.\s+/, "")) },
          ],
        })),
      },
    ];
  }
  if (lines.length >= 2 && lines[0].includes("|") && /^\s*\|?[\s:-]+\|/.test(lines[1])) {
    const rows: TiptapTableRowNode[] = [
      { type: "tableRow", content: parseTableCells(lines[0], true) },
      ...lines
        .slice(2)
        .filter((l) => l.includes("|"))
        .map((l) => ({ type: "tableRow" as const, content: parseTableCells(l, false) })),
    ];
    return [{ type: "table", content: rows }];
  }
  if (chunk.startsWith("<") && chunk.endsWith(">")) return parseTiptapHtml(chunk).content;

  return [{ type: "paragraph", content: parseMarkdownInline(chunk) }];
};

export const parseTiptapMarkdown = (markdown: string): TiptapDocNode => {
  const chunks = markdown.trim().split(/\n{2,}(?!(?:[^`]*```[^`]*```)*[^`]*```)/);
  const content: TiptapBlockNode[] = [];
  for (const chunk of chunks) content.push(...parseMarkdownChunk(chunk));
  return { type: "doc", content };
};
