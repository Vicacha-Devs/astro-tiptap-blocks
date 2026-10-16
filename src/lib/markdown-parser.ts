import type {
  TiptapBlockNode,
  TiptapDocNode,
  TiptapHeadingLevel,
  TiptapInformationPaneVariant,
  TiptapInlineNode,
  TiptapTableCellNode,
  TiptapTableRowNode,
} from "../types";
import { parseTiptapHtml } from "./html-parser";
import { sanitizeTiptapIframeUrl, sanitizeTiptapUrl } from "./sanitize";

const TIPTAP_META_COMMENT_RE = /\n?<!--\s*tiptap-node:([\s\S]*?)\s*-->$/;

export const parseMarkdownInline = (text: string): TiptapInlineNode[] => {
  if (!text) return [];
  const nodes: TiptapInlineNode[] = [];
  const tokenRe =
    /(\$(?!\$)([^$\n]+)\$|!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)|\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)|`([^`]+)`|\*\*([^*]+)\*\*|==([^=]+)==|~~([^~]+)~~|\*([^*]+)\*|<([a-zA-Z0-9-]+)(?:\s[^>]*)?>[\s\S]*?<\/\14>)/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRe.exec(text)) !== null) {
    if (match.index > lastIdx) nodes.push({ type: "text", text: text.slice(lastIdx, match.index) });
    if (match[2] !== undefined) {
      nodes.push({ type: "mathematics", attrs: { latex: match[2].trim(), displayMode: "inline" } });
    } else if (match[6] !== undefined && match[7] !== undefined) {
      const label = match[6];
      const rawHref = match[7];
      if (rawHref.startsWith("strapi://")) {
        const parts = rawHref.replace("strapi://", "").split("/");
        nodes.push({ type: "linker", attrs: { collectionName: parts[0] || null, documentId: parts[1] || null, label, href: rawHref } });
      } else {
        nodes.push({ type: "text", text: label, marks: [{ type: "link", attrs: { href: sanitizeTiptapUrl(rawHref), title: match[8] || null } }] });
      }
    } else if (match[9] !== undefined) nodes.push({ type: "text", text: match[9], marks: [{ type: "code" }] });
    else if (match[10] !== undefined) nodes.push({ type: "text", text: match[10], marks: [{ type: "bold" }] });
    else if (match[11] !== undefined) nodes.push({ type: "text", text: match[11], marks: [{ type: "highlight" }] });
    else if (match[12] !== undefined) nodes.push({ type: "text", text: match[12], marks: [{ type: "strike" }] });
    else if (match[13] !== undefined) nodes.push({ type: "text", text: match[13], marks: [{ type: "italic" }] });
    else if (match[14] !== undefined) {
      const first = parseTiptapHtml(`<p>${match[0]}</p>`).content[0];
      if (first && "content" in first && Array.isArray(first.content)) nodes.push(...(first.content as TiptapInlineNode[]));
    }
    lastIdx = tokenRe.lastIndex;
  }
  if (lastIdx < text.length) nodes.push({ type: "text", text: text.slice(lastIdx) });
  return nodes;
};

const parseMarkdownChunk = (rawChunk: string): TiptapBlockNode[] => {
  const metaMatch = TIPTAP_META_COMMENT_RE.exec(rawChunk);
  if (metaMatch) {
    try {
      const parsed = JSON.parse(metaMatch[1].replace(/--\\u003e/g, "-->")) as TiptapBlockNode;
      if (parsed && typeof parsed === "object" && "type" in parsed) return [parsed];
    } catch {
      // Fallback to markdown parsing
    }
  }

  const chunk = rawChunk.replace(TIPTAP_META_COMMENT_RE, "").trim();
  if (!chunk) return [];
  if (/^<!--\s*pagebreak\s*-->$/i.test(chunk)) return [{ type: "pageBreak" }];
  if (/^<!--\s*toc\s*-->$/i.test(chunk)) return [{ type: "tableOfContents" }];
  if (/^(?:---|\*\*\*|___)$/.test(chunk)) return [{ type: "horizontalRule" }];
  if (chunk.startsWith("$$") && chunk.endsWith("$$") && chunk.length > 4) {
    return [{ type: "mathematics", attrs: { latex: chunk.slice(2, -2).trim(), displayMode: "block" } }];
  }
  if (chunk.startsWith("```")) {
    const lines = chunk.split("\n");
    const lang = lines[0].slice(3).trim() || null;
    const code = lines.slice(1, lines[lines.length - 1].startsWith("```") ? -1 : undefined).join("\n");
    return [{ type: "codeBlock", attrs: { language: lang }, content: code ? [{ type: "text", text: code }] : [] }];
  }

  const headingMatch = /^(#{1,6})\s+(.+)$/.exec(chunk);
  if (headingMatch) {
    return [{ type: "heading", attrs: { level: headingMatch[1].length as TiptapHeadingLevel }, content: parseMarkdownInline(headingMatch[2].trim()) }];
  }

  const mediaMatch = /^\[(?:(Video|Audio|Attachment|Embed):\s*([^\]]*))\]\(([^)\s]+)\)$/.exec(chunk);
  if (mediaMatch) {
    const kind = mediaMatch[1].toLowerCase();
    const label = mediaMatch[2].trim();
    const rawUrl = mediaMatch[3];
    if (kind === "video") {
      const src = sanitizeTiptapUrl(rawUrl);
      const isEmbed = /youtube\.com|youtu\.be|vimeo\.com/i.test(src);
      return src === "#" ? [] : [{ type: "video", attrs: { src, title: label, caption: label, embedType: isEmbed ? "embed" : "file" } }];
    }
    if (kind === "audio") {
      const src = sanitizeTiptapUrl(rawUrl);
      return src === "#" ? [] : [{ type: "audio", attrs: { src, title: label, caption: label } }];
    }
    if (kind === "attachment") {
      const href = sanitizeTiptapUrl(rawUrl);
      return href === "#" ? [] : [{ type: "attachment", attrs: { href, filename: label, title: label } }];
    }
    if (kind === "embed") {
      const src = sanitizeTiptapIframeUrl(rawUrl);
      return src === "#" ? [] : [{ type: "iframe", attrs: { src, title: label } }];
    }
  }

  const imgMatch = /^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/.exec(chunk);
  if (imgMatch) {
    const src = sanitizeTiptapUrl(imgMatch[2]);
    return src === "#" ? [] : [{ type: "image", attrs: { src, alt: imgMatch[1] || "", title: imgMatch[3] || null } }];
  }

  if (chunk.startsWith(">")) {
    const stripped = chunk.split("\n").map((l) => l.replace(/^>\s?/, "")).join("\n").trim();
    if (stripped.startsWith("**Lead:**")) {
      return [{ type: "leadParagraph", content: parseMarkdownInline(stripped.replace(/^\*\*Lead:\*\*\s*/, "")) }];
    }
    const calloutMatch = /^\[!(INFO|SUCCESS|WARNING|DANGER|NEUTRAL|TIP)\](?:\s+([^\n]*))?\n?([\s\S]*)$/i.exec(stripped);
    if (calloutMatch) {
      const variant = calloutMatch[1].toLowerCase() as TiptapInformationPaneVariant;
      return [{ type: "informationPane", attrs: { variant, title: calloutMatch[2]?.trim() || null }, content: parseTiptapMarkdown(calloutMatch[3] || "").content }];
    }
    const convMatch = /^\*\*Conversation History\*\*(?:\s+\*\(([^)]+)\)\*)?\n?([\s\S]*)$/i.exec(stripped);
    if (convMatch) {
      return [{ type: "conversationHistory", attrs: { author: convMatch[1] || null }, content: parseTiptapMarkdown(convMatch[2] || "").content }];
    }
    return [{ type: "blockquote", content: parseTiptapMarkdown(stripped).content }];
  }

  const lines = chunk.split("\n");
  if (lines.every((l) => /^[-*]\s+\[([ xX])\]\s+/.test(l.trim()))) {
    return [{
      type: "taskList",
      content: lines.map((l) => {
        const m = /^[-*]\s+\[([ xX])\]\s+(.*)$/.exec(l.trim())!;
        return { type: "taskItem", attrs: { checked: m[1].toLowerCase() === "x" }, content: [{ type: "paragraph", content: parseMarkdownInline(m[2]) }] };
      }),
    }];
  }
  if (lines.every((l) => /^[-*]\s+/.test(l.trim()))) {
    return [{
      type: "bulletList",
      content: lines.map((l) => ({ type: "listItem", content: [{ type: "paragraph", content: parseMarkdownInline(l.trim().replace(/^[-*]\s+/, "")) }] })),
    }];
  }
  if (lines.every((l) => /^\d+\.\s+/.test(l.trim()))) {
    return [{
      type: "orderedList",
      content: lines.map((l) => ({ type: "listItem", content: [{ type: "paragraph", content: parseMarkdownInline(l.trim().replace(/^\d+\.\s+/, "")) }] })),
    }];
  }
  if (lines.length >= 2 && lines[0].includes("|") && /^\s*\|?[\s:-]+\|/.test(lines[1])) {
    const parseCells = (rowStr: string, isHeader: boolean): TiptapTableCellNode[] =>
      rowStr.trim().replace(/^\||\|$/g, "").split("|").map((c) => ({
        type: isHeader ? "tableHeader" : "tableCell",
        content: [{ type: "paragraph", content: parseMarkdownInline(c.trim()) }],
      }));
    const rows: TiptapTableRowNode[] = [
      { type: "tableRow", content: parseCells(lines[0], true) },
      ...lines.slice(2).filter((l) => l.includes("|")).map((l) => ({ type: "tableRow" as const, content: parseCells(l, false) })),
    ];
    return [{ type: "table", content: rows }];
  }
  if (chunk.startsWith("<") && chunk.endsWith(">")) return parseTiptapHtml(chunk).content;

  return [{ type: "paragraph", content: parseMarkdownInline(chunk) }];
};

export const isLikelyMarkdown = (text: string): boolean =>
  /(?:^|\n)(?:#{1,6}\s|>\s|[-*]\s+\[[ xX]\]\s|[-*]\s+\S|\d+\.\s+\S|```|\$\$|<!--\s*(?:tiptap-node:|pagebreak|toc)|\[(?:Video|Audio|Attachment|Embed):|!\[[^\]]*\]\([^)]+\)|\|.+\|\n\|[\s:-]+\|)/.test(
    text
  ) || /(\*\*[^*]+\*\*|==[^=]+==|~~[^~]+~~|\[[^\]]+\]\([^)]+\)|\$(?!\$)[^$\n]+\$)/.test(text);

export const parseTiptapMarkdown = (markdown: string): TiptapDocNode => {
  const chunks = markdown.trim().split(/\n{2,}(?!(?:[^`]*```[^`]*```)*[^`]*```)/);
  const content: TiptapBlockNode[] = [];
  for (const chunk of chunks) content.push(...parseMarkdownChunk(chunk));
  return { type: "doc", content };
};
