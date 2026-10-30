import type { TiptapInternalLinkResolver } from "../../types";
import { sanitizeTiptapUrl } from "../sanitize";

const INTERNAL_URI_RE =
  /^(?:tiptap|internal|cms|doc):\/\/([a-zA-Z0-9_.:-]+)\/([a-zA-Z0-9_.:-]+)(?:\?.*)?$/;

export const parseInternalLinkUri = (
  href: string | null | undefined
): { collectionName: string; documentId: string } | null => {
  if (!href || typeof href !== "string") return null;
  const match = INTERNAL_URI_RE.exec(href.trim());
  if (!match) return null;
  return { collectionName: match[1], documentId: match[2] };
};

export const formatInternalLinkUri = (collectionName: string, documentId: string): string =>
  `tiptap://${collectionName.trim()}/${documentId.trim()}`;

/**
 * Resolves an internal link URI (`tiptap://collectionName/documentId` or `linker` attributes) into a safe frontend href.
 * Uses `resolveInternalLink` when provided, or defaults to `/<shortCollection>/<documentId>`.
 */
export const resolveInternalLinkHref = (
  input: {
    href?: string | null;
    collectionName?: string | null;
    documentId?: string | null;
    label?: string | null;
  },
  resolver?: TiptapInternalLinkResolver
): string => {
  const parsedFromHref = parseInternalLinkUri(input.href);
  const collectionName = (input.collectionName || parsedFromHref?.collectionName || "").trim();
  const documentId = (input.documentId || parsedFromHref?.documentId || "").trim();

  if (collectionName && documentId) {
    const rawUri = formatInternalLinkUri(collectionName, documentId);
    if (resolver) {
      return sanitizeTiptapUrl(
        resolver({
          collectionName,
          documentId,
          href: rawUri,
          label: input.label,
        })
      );
    }
    if (input.href && !/^(?:tiptap|internal|cms|doc):\/\//.test(input.href.trim())) {
      return sanitizeTiptapUrl(input.href);
    }
    const shortCollection = collectionName.includes(".")
      ? collectionName.split(".").pop() || collectionName
      : collectionName.replace(/^api::/, "");
    return sanitizeTiptapUrl(`/${shortCollection}/${documentId}`);
  }

  return sanitizeTiptapUrl(input.href);
};
