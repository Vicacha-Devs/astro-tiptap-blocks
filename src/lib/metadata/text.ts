import type { TiptapBlockNode, TiptapInlineNode } from "../../types";

export const inlineNodesToText = (nodes?: TiptapInlineNode[]): string =>
  (nodes ?? [])
    .map((n) => {
      if (n.type === "text") return n.text;
      if (n.type === "hardBreak") return "\n";
      if (n.type === "linker") return n.attrs.label || "";
      if (n.type === "mathematics") return n.attrs.latex || "";
      return "";
    })
    .join("");

export const blockNodesToText = (blocks?: TiptapBlockNode[]): string => {
  if (!Array.isArray(blocks) || blocks.length === 0) return "";
  const chunks: string[] = [];

  for (const block of blocks) {
    switch (block.type) {
      case "heading":
      case "paragraph":
      case "leadParagraph": {
        const text = inlineNodesToText(block.content).trim();
        if (text) chunks.push(text);
        break;
      }
      case "blockquote":
      case "informationPane":
      case "conversationHistory": {
        const prefix =
          block.type === "informationPane" && block.attrs?.title ? `${block.attrs.title}: ` : "";
        const inner = blockNodesToText(block.content).trim();
        if (prefix || inner) chunks.push(`${prefix}${inner}`.trim());
        break;
      }
      case "details": {
        const parts = (block.content ?? [])
          .map((child) =>
            child.type === "detailsSummary"
              ? inlineNodesToText(child.content).trim()
              : child.type === "detailsContent"
                ? blockNodesToText(child.content).trim()
                : blockNodesToText([child]).trim()
          )
          .filter(Boolean);
        if (parts.length > 0) chunks.push(parts.join(" "));
        break;
      }
      case "layoutContainer":
      case "bulletList":
      case "orderedList":
      case "taskList": {
        const items = (block.content ?? [])
          .map((item) => blockNodesToText(item.content).trim())
          .filter(Boolean);
        if (items.length > 0) chunks.push(items.join(" "));
        break;
      }
      case "codeBlock": {
        const code = (block.content ?? [])
          .map((n) => n.text)
          .join("")
          .trim();
        if (code) chunks.push(code);
        break;
      }
      case "table": {
        const rows = (block.content ?? [])
          .flatMap((row) =>
            (row.content ?? []).map((cell) => blockNodesToText(cell.content).trim())
          )
          .filter(Boolean);
        if (rows.length > 0) chunks.push(rows.join(" "));
        break;
      }
      case "mathematics":
        if (block.attrs?.latex) chunks.push(block.attrs.latex.trim());
        break;
      default:
        break;
    }
  }

  return chunks.join(" ").replace(/\s+/g, " ").trim();
};
