export type TiptapTextAlign = "left" | "center" | "right" | "justify";
export type TiptapTextDirection = "ltr" | "rtl" | "auto";
export type TiptapElementAlign = "left" | "center" | "right";
export type TiptapHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type TiptapHeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export type TiptapMarkType =
  | "bold"
  | "italic"
  | "underline"
  | "strike"
  | "code"
  | "subscript"
  | "superscript"
  | "highlight"
  | "link"
  | "textStyle"
  | "abbr"
  | "language";

export type TiptapLinkMarkAttrs = {
  href: string;
  target?: string | null;
  rel?: string | null;
  title?: string | null;
  class?: string | null;
};

export type TiptapHighlightMarkAttrs = {
  color?: string | null;
};

export type TiptapTextStyleMarkAttrs = {
  color?: string | null;
  fontFamily?: string | null;
  fontSize?: string | null;
  lineHeight?: string | null;
};

export type TiptapAbbrMarkAttrs = {
  title?: string | null;
};

export type TiptapLanguageMarkAttrs = {
  lang?: string | null;
  dir?: TiptapTextDirection | null;
};

export type TiptapLinkMark = { type: "link"; attrs: TiptapLinkMarkAttrs };

export type TiptapMark =
  | { type: "bold" }
  | { type: "italic" }
  | { type: "underline" }
  | { type: "strike" }
  | { type: "code" }
  | { type: "subscript" }
  | { type: "superscript" }
  | { type: "highlight"; attrs?: TiptapHighlightMarkAttrs }
  | TiptapLinkMark
  | { type: "textStyle"; attrs?: TiptapTextStyleMarkAttrs }
  | { type: "abbr"; attrs?: TiptapAbbrMarkAttrs }
  | { type: "language"; attrs?: TiptapLanguageMarkAttrs };

export type TiptapTextNode = {
  type: "text";
  text: string;
  marks?: Array<TiptapMark>;
};

export type TiptapHardBreakNode = {
  type: "hardBreak";
};

export type TiptapLinkerNode = {
  type: "linker";
  attrs: {
    collectionName?: string | null;
    documentId?: string | null;
    label?: string | null;
    href?: string | null;
    status?: string | null;
  };
};

export type TiptapMathDisplayMode = "inline" | "block" | boolean;

export type TiptapMathematicsNode = {
  type: "mathematics";
  attrs: {
    latex: string;
    displayMode?: TiptapMathDisplayMode | null;
  };
};

export type TiptapInlineNode =
  | TiptapTextNode
  | TiptapHardBreakNode
  | TiptapLinkerNode
  | TiptapMathematicsNode;

export type TiptapInternalLinkContext = {
  collectionName: string;
  documentId: string;
  href: string;
  label?: string | null;
};

export type TiptapInternalLinkResolver = (link: TiptapInternalLinkContext) => string;
export type TiptapMediaUrlResolver = (url: string) => string | null | undefined;
