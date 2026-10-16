import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import type { TiptapBlockUserComponents, TiptapBlockUserTheme, TiptapContentInput } from "./types";

export * from "./lib";
export * from "./types";

export interface TiptapBlocksProps {
  data: TiptapContentInput;
  theme?: TiptapBlockUserTheme;
  blocks?: TiptapBlockUserComponents;
  class?: string;
}

export declare const TiptapBlocks: AstroComponentFactory;
export default TiptapBlocks;
