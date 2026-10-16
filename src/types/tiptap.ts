export type TiptapTextAlign = "left" | "center" | "right" | "justify";
export type TiptapTextDirection = "ltr" | "rtl" | "auto";

export type TiptapMarkType =
  | "bold"
  | "italic"
  | "underline"
  | "strike"
  | "code"
  | "subscript"
  | "superscript"
  | "highlight"
  | "link";

export type TiptapLinkMarkAttrs = {
  href: string;
  target?: string;
  rel?: string;
  title?: string;
};

export type TiptapHighlightMarkAttrs = {
  color?: string;
};

export type TiptapMark =
  | { type: "bold" }
  | { type: "italic" }
  | { type: "underline" }
  | { type: "strike" }
  | { type: "code" }
  | { type: "subscript" }
  | { type: "superscript" }
  | { type: "highlight"; attrs?: TiptapHighlightMarkAttrs }
  | { type: "link"; attrs: TiptapLinkMarkAttrs };

export type TiptapTextNode = {
  type: "text";
  text: string;
  marks?: Array<TiptapMark>;
};

export type TiptapHardBreakNode = {
  type: "hardBreak";
};

export type TiptapInlineNode = TiptapTextNode | TiptapHardBreakNode;

export type TiptapBlockBaseAttrs = {
  textAlign?: TiptapTextAlign;
  dir?: TiptapTextDirection;
};

export type TiptapHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type TiptapHeadingNode = {
  type: "heading";
  attrs?: TiptapBlockBaseAttrs & {
    level: TiptapHeadingLevel;
  };
  content?: Array<TiptapInlineNode>;
};

export type TiptapParagraphNode = {
  type: "paragraph";
  attrs?: TiptapBlockBaseAttrs;
  content?: Array<TiptapInlineNode>;
};

export type TiptapBlockquoteNode = {
  type: "blockquote";
  attrs?: TiptapBlockBaseAttrs;
  content?: Array<TiptapBlockNode>;
};

export type TiptapListType = "ordered" | "unordered";

export type TiptapListItemNode = {
  type: "listItem";
  content?: Array<TiptapBlockNode>;
};

export type TiptapBulletListNode = {
  type: "bulletList";
  attrs?: TiptapBlockBaseAttrs & {
    indentLevel?: number;
  };
  content?: Array<TiptapListItemNode>;
};

export type TiptapOrderedListNode = {
  type: "orderedList";
  attrs?: TiptapBlockBaseAttrs & {
    start?: number;
    indentLevel?: number;
  };
  content?: Array<TiptapListItemNode>;
};

export type TiptapListNode = TiptapBulletListNode | TiptapOrderedListNode;

export type TiptapCodeBlockNode = {
  type: "codeBlock";
  attrs?: {
    language?: string | null;
  };
  content?: Array<TiptapTextNode>;
};

export type TiptapImageNode = {
  type: "image";
  attrs: {
    src: string;
    alt?: string | null;
    title?: string | null;
    width?: number | string | null;
    height?: number | string | null;
  };
};

export type TiptapHorizontalRuleNode = {
  type: "horizontalRule";
};

export type TiptapTableCellNode = {
  type: "tableHeader" | "tableCell";
  attrs?: {
    colspan?: number;
    rowspan?: number;
  };
  content?: Array<TiptapBlockNode>;
};

export type TiptapTableRowNode = {
  type: "tableRow";
  content?: Array<TiptapTableCellNode>;
};

export type TiptapTableNode = {
  type: "table";
  content?: Array<TiptapTableRowNode>;
};

export type TiptapBlockNode =
  | TiptapHeadingNode
  | TiptapParagraphNode
  | TiptapBlockquoteNode
  | TiptapBulletListNode
  | TiptapOrderedListNode
  | TiptapCodeBlockNode
  | TiptapImageNode
  | TiptapHorizontalRuleNode
  | TiptapTableNode;

export type TiptapDocNode = {
  type: "doc";
  content: Array<TiptapBlockNode>;
};

export type TiptapBlockType =
  | "heading"
  | "paragraph"
  | "quote"
  | "list"
  | "code"
  | "image"
  | "table"
  | "hr";

export type TiptapContentInput =
  | TiptapDocNode
  | Array<TiptapBlockNode>
  | string
  | ReadonlyArray<string>
  | null
  | undefined;
