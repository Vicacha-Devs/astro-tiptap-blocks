import type { AstroComponentFactory } from "astro/runtime/server/index.js";

import type { DeepPartial } from "./common";

export type TiptapBlockThemePropertyValue = string | string[] | null | undefined;

export interface TiptapBlockThemeProperty {
  default: TiptapBlockThemePropertyValue;
}

export interface TiptapBlockThemeHeading extends TiptapBlockThemeProperty {
  h1: TiptapBlockThemePropertyValue;
  h2: TiptapBlockThemePropertyValue;
  h3: TiptapBlockThemePropertyValue;
  h4: TiptapBlockThemePropertyValue;
  h5: TiptapBlockThemePropertyValue;
  h6: TiptapBlockThemePropertyValue;
}

export interface TiptapBlockThemeParagraph extends TiptapBlockThemeProperty {
  link: TiptapBlockThemePropertyValue;
  bold: TiptapBlockThemePropertyValue;
  italic: TiptapBlockThemePropertyValue;
  underline: TiptapBlockThemePropertyValue;
  strikethrough: TiptapBlockThemePropertyValue;
  code: TiptapBlockThemePropertyValue;
  highlight: TiptapBlockThemePropertyValue;
  subscript: TiptapBlockThemePropertyValue;
  superscript: TiptapBlockThemePropertyValue;
  abbr: TiptapBlockThemePropertyValue;
  language: TiptapBlockThemePropertyValue;
  linker: TiptapBlockThemePropertyValue;
  mathInline: TiptapBlockThemePropertyValue;
}

export type TiptapBlockThemeLeadParagraph = TiptapBlockThemeProperty;

export type TiptapBlockThemeQuote = TiptapBlockThemeProperty;

export interface TiptapBlockThemeInformationPane extends TiptapBlockThemeProperty {
  info: TiptapBlockThemePropertyValue;
  success: TiptapBlockThemePropertyValue;
  warning: TiptapBlockThemePropertyValue;
  danger: TiptapBlockThemePropertyValue;
  neutral: TiptapBlockThemePropertyValue;
  tip: TiptapBlockThemePropertyValue;
  title: TiptapBlockThemePropertyValue;
  body: TiptapBlockThemePropertyValue;
}

export interface TiptapBlockThemeConversationHistory extends TiptapBlockThemeProperty {
  header: TiptapBlockThemePropertyValue;
  author: TiptapBlockThemePropertyValue;
  timestamp: TiptapBlockThemePropertyValue;
  body: TiptapBlockThemePropertyValue;
}

export interface TiptapBlockThemeDetails extends TiptapBlockThemeProperty {
  summary: TiptapBlockThemePropertyValue;
  content: TiptapBlockThemePropertyValue;
}

export interface TiptapBlockThemeColumns extends TiptapBlockThemeProperty {
  column: TiptapBlockThemePropertyValue;
}

export interface TiptapBlockThemeList extends TiptapBlockThemeProperty {
  ordered: TiptapBlockThemePropertyValue;
  unordered: TiptapBlockThemePropertyValue;
  item: TiptapBlockThemePropertyValue;
}

export interface TiptapBlockThemeTaskList extends TiptapBlockThemeProperty {
  item: TiptapBlockThemePropertyValue;
  checkbox: TiptapBlockThemePropertyValue;
  content: TiptapBlockThemePropertyValue;
  checked: TiptapBlockThemePropertyValue;
}

export interface TiptapBlockThemeCode extends TiptapBlockThemeProperty {
  line: TiptapBlockThemePropertyValue;
}

export interface TiptapBlockThemeImage extends TiptapBlockThemeProperty {
  image: TiptapBlockThemePropertyValue;
  caption: TiptapBlockThemePropertyValue;
}

export interface TiptapBlockThemeVideo extends TiptapBlockThemeProperty {
  video: TiptapBlockThemePropertyValue;
  iframe: TiptapBlockThemePropertyValue;
  caption: TiptapBlockThemePropertyValue;
}

export interface TiptapBlockThemeAudio extends TiptapBlockThemeProperty {
  audio: TiptapBlockThemePropertyValue;
  caption: TiptapBlockThemePropertyValue;
}

export interface TiptapBlockThemeAttachment extends TiptapBlockThemeProperty {
  badge: TiptapBlockThemePropertyValue;
  title: TiptapBlockThemePropertyValue;
  meta: TiptapBlockThemePropertyValue;
  button: TiptapBlockThemePropertyValue;
}

export interface TiptapBlockThemeIframe extends TiptapBlockThemeProperty {
  iframe: TiptapBlockThemePropertyValue;
}

export interface TiptapBlockThemeMathematics extends TiptapBlockThemeProperty {
  formula: TiptapBlockThemePropertyValue;
}

export interface TiptapBlockThemeTableOfContents extends TiptapBlockThemeProperty {
  title: TiptapBlockThemePropertyValue;
  list: TiptapBlockThemePropertyValue;
  item: TiptapBlockThemePropertyValue;
  link: TiptapBlockThemePropertyValue;
}

export type TiptapBlockThemePageBreak = TiptapBlockThemeProperty;

export interface TiptapBlockThemeTable extends TiptapBlockThemeProperty {
  head: TiptapBlockThemePropertyValue;
  body: TiptapBlockThemePropertyValue;
  row: TiptapBlockThemePropertyValue;
  headerCell: TiptapBlockThemePropertyValue;
  cell: TiptapBlockThemePropertyValue;
}

export type TiptapBlockThemeHr = TiptapBlockThemeProperty;

export interface TiptapBlockTheme {
  default: TiptapBlockThemePropertyValue;
  heading: TiptapBlockThemeHeading;
  paragraph: TiptapBlockThemeParagraph;
  leadParagraph: TiptapBlockThemeLeadParagraph;
  quote: TiptapBlockThemeQuote;
  informationPane: TiptapBlockThemeInformationPane;
  conversationHistory: TiptapBlockThemeConversationHistory;
  details: TiptapBlockThemeDetails;
  columns: TiptapBlockThemeColumns;
  list: TiptapBlockThemeList;
  taskList: TiptapBlockThemeTaskList;
  code: TiptapBlockThemeCode;
  image: TiptapBlockThemeImage;
  video: TiptapBlockThemeVideo;
  audio: TiptapBlockThemeAudio;
  attachment: TiptapBlockThemeAttachment;
  iframe: TiptapBlockThemeIframe;
  mathematics: TiptapBlockThemeMathematics;
  tableOfContents: TiptapBlockThemeTableOfContents;
  pageBreak: TiptapBlockThemePageBreak;
  table: TiptapBlockThemeTable;
  hr: TiptapBlockThemeHr;
}

export type TiptapBlockUserTheme = {
  extend?: DeepPartial<TiptapBlockTheme>;
  overwrite?: DeepPartial<TiptapBlockTheme>;
};

export type TiptapBlockThemeCustomComponents = Record<
  keyof Omit<TiptapBlockTheme, "default">,
  AstroComponentFactory
>;
