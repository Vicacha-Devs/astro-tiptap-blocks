import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import type {
  TiptapBlockUserComponents,
  TiptapBlockUserTheme,
  TiptapContentInput,
  TiptapInternalLinkResolver,
  TiptapMediaUrlResolver,
} from "./types";

export * from "./lib";
export * from "./types";

export interface TiptapBlocksProps {
  data: TiptapContentInput;
  theme?: TiptapBlockUserTheme;
  blocks?: TiptapBlockUserComponents;
  class?: string;
  allowedIframeDomains?: ReadonlyArray<string>;
  resolveInternalLink?: TiptapInternalLinkResolver;
  mediaBaseUrl?: string;
  resolveMediaUrl?: TiptapMediaUrlResolver;
  headingAnchors?: boolean;
  showCodeLineNumbers?: boolean;
  copyableCodeBlocks?: boolean;
}

export declare const TiptapBlocks: AstroComponentFactory;
export default TiptapBlocks;
