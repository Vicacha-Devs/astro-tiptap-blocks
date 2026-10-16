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
}

export interface TiptapBlockThemeQuote extends TiptapBlockThemeProperty {}

export interface TiptapBlockThemeList extends TiptapBlockThemeProperty {
  ordered: TiptapBlockThemePropertyValue;
  unordered: TiptapBlockThemePropertyValue;
  item: TiptapBlockThemePropertyValue;
}

export interface TiptapBlockThemeCode extends TiptapBlockThemeProperty {
  line: TiptapBlockThemePropertyValue;
}

export interface TiptapBlockThemeImage extends TiptapBlockThemeProperty {
  image: TiptapBlockThemePropertyValue;
  caption: TiptapBlockThemePropertyValue;
}

export interface TiptapBlockThemeTable extends TiptapBlockThemeProperty {
  head: TiptapBlockThemePropertyValue;
  body: TiptapBlockThemePropertyValue;
  row: TiptapBlockThemePropertyValue;
  headerCell: TiptapBlockThemePropertyValue;
  cell: TiptapBlockThemePropertyValue;
}

export interface TiptapBlockThemeHr extends TiptapBlockThemeProperty {}

export interface TiptapBlockTheme {
  default: TiptapBlockThemePropertyValue;
  heading: TiptapBlockThemeHeading;
  paragraph: TiptapBlockThemeParagraph;
  quote: TiptapBlockThemeQuote;
  list: TiptapBlockThemeList;
  code: TiptapBlockThemeCode;
  image: TiptapBlockThemeImage;
  table: TiptapBlockThemeTable;
  hr: TiptapBlockThemeHr;
}

export type TiptapBlockUserTheme = {
  extend?: DeepPartial<TiptapBlockTheme>;
  overwrite?: DeepPartial<TiptapBlockTheme>;
};

export type TiptapBlockThemeCustomComponents = Record<keyof Omit<TiptapBlockTheme, "default">, AstroComponentFactory>;
