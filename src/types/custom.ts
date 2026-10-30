import type { AstroComponentFactory } from "astro/runtime/server/index.js";

import type { DeepPartial } from "./common";
import type { TiptapBlockThemeCustomComponents } from "./theme";
import type { TiptapInternalLinkResolver, TiptapMediaUrlResolver } from "./tiptap-inline";

export type TiptapBlockUserComponents = DeepPartial<TiptapBlockThemeCustomComponents> & {
  [customBlockType: string]: AstroComponentFactory | undefined;
};

export type TiptapRenderContextProps = {
  /** Optional custom Astro block component overrides. @default {} */
  customBlocks?: TiptapBlockUserComponents;
  /** Renders an accessible `#` permalink anchor inside headings. @default false */
  headingAnchors?: boolean;
  /** Adds `data-line-number` attributes to code blocks. @default false */
  showCodeLineNumbers?: boolean;
  /** Renders a header bar with copy button on code blocks. @default false */
  copyableCodeBlocks?: boolean;
  /** Optional media base URL prefixed to relative `/uploads/...` media URLs. */
  mediaBaseUrl?: string;
  /** Optional custom resolver for media URLs before sanitization. */
  resolveMediaUrl?: TiptapMediaUrlResolver;
  /** Optional domain allowlist for HTTPS `<iframe>` and video embeds. */
  allowedIframeDomains?: ReadonlyArray<string>;
  /** Optional callback to resolve internal links (`tiptap://collectionName/documentId` and `linker` nodes). */
  resolveInternalLink?: TiptapInternalLinkResolver;
};
