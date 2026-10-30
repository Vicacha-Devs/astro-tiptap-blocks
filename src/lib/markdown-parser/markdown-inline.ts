import type { TiptapBlockNode, TiptapInformationPaneVariant, TiptapInlineNode } from "../../types";
import { parseTiptapHtml } from "../html-parser";
import { sanitizeTiptapIframeUrl, sanitizeTiptapUrl } from "../sanitize";

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
    } else if (match[4] !== undefined) {
      const safeHref = sanitizeTiptapUrl(match[4]);
      if (safeHref !== "#") {
        nodes.push({
          type: "text",
          text: match[3] || "Image",
          marks: [{ type: "link", attrs: { href: safeHref, title: match[5] || null } }],
        });
      }
    } else if (match[6] !== undefined && match[7] !== undefined) {
      const label = match[6];
      const rawHref = match[7];
      if (/^(?:tiptap|internal|cms|doc):\/\//.test(rawHref)) {
        const parts = rawHref.replace(/^[a-z]+:\/\//i, "").split("/");
        nodes.push({
          type: "linker",
          attrs: {
            collectionName: parts[0] || null,
            documentId: parts[1] || null,
            label,
            href: rawHref,
          },
        });
      } else {
        nodes.push({
          type: "text",
          text: label,
          marks: [
            { type: "link", attrs: { href: sanitizeTiptapUrl(rawHref), title: match[8] || null } },
          ],
        });
      }
    } else if (match[9] !== undefined)
      nodes.push({ type: "text", text: match[9], marks: [{ type: "code" }] });
    else if (match[10] !== undefined)
      nodes.push({ type: "text", text: match[10], marks: [{ type: "bold" }] });
    else if (match[11] !== undefined)
      nodes.push({ type: "text", text: match[11], marks: [{ type: "highlight" }] });
    else if (match[12] !== undefined)
      nodes.push({ type: "text", text: match[12], marks: [{ type: "strike" }] });
    else if (match[13] !== undefined)
      nodes.push({ type: "text", text: match[13], marks: [{ type: "italic" }] });
    else if (match[14] !== undefined) {
      const first = parseTiptapHtml(`<p>${match[0]}</p>`).content[0];
      if (first && "content" in first && Array.isArray(first.content))
        nodes.push(...(first.content as TiptapInlineNode[]));
    }
    lastIdx = tokenRe.lastIndex;
  }
  if (lastIdx < text.length) nodes.push({ type: "text", text: text.slice(lastIdx) });
  return nodes;
};

export const parseMediaBlock = (kind: string, label: string, rawUrl: string): TiptapBlockNode[] => {
  if (kind === "video") {
    const src = sanitizeTiptapUrl(rawUrl);
    const isEmbed = /youtube\.com|youtu\.be|vimeo\.com/i.test(src);
    return src === "#"
      ? []
      : [
          {
            type: "video",
            attrs: { src, title: label, caption: label, embedType: isEmbed ? "embed" : "file" },
          },
        ];
  }
  if (kind === "audio") {
    const src = sanitizeTiptapUrl(rawUrl);
    return src === "#" ? [] : [{ type: "audio", attrs: { src, title: label, caption: label } }];
  }
  if (kind === "attachment") {
    const href = sanitizeTiptapUrl(rawUrl);
    return href === "#"
      ? []
      : [{ type: "attachment", attrs: { href, filename: label, title: label } }];
  }
  const src = sanitizeTiptapIframeUrl(rawUrl);
  return src === "#" ? [] : [{ type: "iframe", attrs: { src, title: label } }];
};

export const parseQuoteChunk = (
  chunk: string,
  parseBody: (md: string) => TiptapBlockNode[]
): TiptapBlockNode[] => {
  const stripped = chunk
    .split("\n")
    .map((l) => l.replace(/^>\s?/, ""))
    .join("\n")
    .trim();
  if (stripped.startsWith("**Lead:**")) {
    return [
      {
        type: "leadParagraph",
        content: parseMarkdownInline(stripped.replace(/^\*\*Lead:\*\*\s*/, "")),
      },
    ];
  }
  const calloutMatch =
    /^\[!(INFO|SUCCESS|WARNING|DANGER|NEUTRAL|TIP)\](?:\s+([^\n]*))?\n?([\s\S]*)$/i.exec(stripped);
  if (calloutMatch) {
    const variant = calloutMatch[1].toLowerCase() as TiptapInformationPaneVariant;
    return [
      {
        type: "informationPane",
        attrs: { variant, title: calloutMatch[2]?.trim() || null },
        content: parseBody(calloutMatch[3] || ""),
      },
    ];
  }
  const convMatch = /^\*\*Conversation History\*\*(?:\s+\*\(([^)]+)\)\*)?\n?([\s\S]*)$/i.exec(
    stripped
  );
  if (convMatch) {
    return [
      {
        type: "conversationHistory",
        attrs: { author: convMatch[1] || null },
        content: parseBody(convMatch[2] || ""),
      },
    ];
  }
  return [{ type: "blockquote", content: parseBody(stripped) }];
};

export const isLikelyMarkdown = (text: string): boolean =>
  /(?:^|\n)(?:#{1,6}\s|>\s|[-*]\s+\[[ xX]\]\s|[-*]\s+\S|\d+\.\s+\S|```|\$\$|<!--\s*(?:tiptap-node:|pagebreak|toc)|\[(?:Video|Audio|Attachment|Embed):|!\[[^\]]*\]\([^)]+\)|\|.+\|\n\|[\s:-]+\|)/.test(
    text
  ) || /(\*\*[^*]+\*\*|==[^=]+==|~~[^~]+~~|\[[^\]]+\]\([^)]+\)|\$(?!\$)[^$\n]+\$)/.test(text);
