import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import type { DeepPartial } from "./common";
import type { TiptapBlockThemeCustomComponents } from "./theme";

export type TiptapBlockUserComponents = DeepPartial<TiptapBlockThemeCustomComponents> & {
  [customBlockType: string]: AstroComponentFactory | undefined;
};
