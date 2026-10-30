import type { TiptapContentInput } from "../../types";
import { parseTiptapContent } from "../parser";
import {
  formatInternalLinkUri,
  parseInternalLinkUri,
  resolveInternalLinkHref,
} from "./relations-uri";

export { formatInternalLinkUri, parseInternalLinkUri, resolveInternalLinkHref };

export type TiptapMediaNodeType = "image" | "video" | "audio" | "attachment";

export interface ExtractedMediaReference {
  nodeType: TiptapMediaNodeType;
  assetId: number | null;
  documentId: string | null;
  src: string | null;
}

export interface ExtractedInternalLink {
  collectionName: string;
  documentId: string;
  href: string;
  label?: string;
}

export interface ExtractedRelationsResult {
  mediaIds: number[];
  mediaDocumentIds: string[];
  mediaAssets: ExtractedMediaReference[];
  internalLinks: ExtractedInternalLink[];
  linksByCollection: Record<string, Array<{ documentId: string }>>;
}

const MEDIA_NODE_TYPES = new Set<string>(["image", "video", "audio", "attachment"]);

/**
 * Extracts all referenced media assets (`image`, `video`, `audio`, `attachment`)
 * and internal links (`linker` nodes and internal `tiptap://` link marks) from any Tiptap document input.
 */
export const extractRelationsFromTiptap = (
  doc: TiptapContentInput | unknown
): ExtractedRelationsResult => {
  const normalizedRoot = typeof doc === "string" ? parseTiptapContent(doc) : doc;
  const mediaIdsSet = new Set<number>();
  const mediaDocIdsSet = new Set<string>();
  const mediaAssets: ExtractedMediaReference[] = [];
  const internalLinksMap = new Map<string, ExtractedInternalLink>();

  const addInternalLink = (collectionName: string, documentId: string, label?: string) => {
    const cleanCollection = collectionName.trim();
    const cleanDocId = documentId.trim();
    if (!cleanCollection || !cleanDocId) return;
    const key = `${cleanCollection}::${cleanDocId}`;
    if (!internalLinksMap.has(key)) {
      internalLinksMap.set(key, {
        collectionName: cleanCollection,
        documentId: cleanDocId,
        href: formatInternalLinkUri(cleanCollection, cleanDocId),
        ...(label ? { label } : {}),
      });
    }
  };

  const walk = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    const n = node as {
      type?: string;
      text?: string;
      attrs?: Record<string, unknown>;
      marks?: Array<{ type?: string; attrs?: Record<string, unknown> }>;
      content?: unknown[];
    };

    if (typeof n.type === "string" && MEDIA_NODE_TYPES.has(n.type)) {
      const attrs = n.attrs || {};
      const rawId = attrs["data-asset-id"] ?? attrs.assetId ?? attrs.id;
      const parsedId =
        typeof rawId === "number"
          ? rawId
          : typeof rawId === "string" && /^\d+$/.test(rawId)
            ? parseInt(rawId, 10)
            : null;
      const validAssetId =
        typeof parsedId === "number" && !Number.isNaN(parsedId) ? parsedId : null;
      const rawDocId = attrs["data-document-id"] ?? attrs.documentId;
      const validDocId = typeof rawDocId === "string" && rawDocId.trim() ? rawDocId.trim() : null;
      const rawSrc = attrs.src ?? attrs.href;
      const validSrc = typeof rawSrc === "string" && rawSrc.trim() ? rawSrc.trim() : null;

      if (validAssetId !== null) mediaIdsSet.add(validAssetId);
      if (validDocId !== null) mediaDocIdsSet.add(validDocId);
      if (validAssetId !== null || validDocId !== null || validSrc !== null) {
        mediaAssets.push({
          nodeType: n.type as TiptapMediaNodeType,
          assetId: validAssetId,
          documentId: validDocId,
          src: validSrc,
        });
      }
    }

    if (n.type === "linker") {
      const attrs = n.attrs || {};
      const col = typeof attrs.collectionName === "string" ? attrs.collectionName : "";
      const docId = typeof attrs.documentId === "string" ? attrs.documentId : "";
      const label = typeof attrs.label === "string" ? attrs.label : undefined;
      if (col && docId) {
        addInternalLink(col, docId, label);
      } else if (typeof attrs.href === "string") {
        const parsed = parseInternalLinkUri(attrs.href);
        if (parsed) addInternalLink(parsed.collectionName, parsed.documentId, label);
      }
    }

    if (Array.isArray(n.marks)) {
      for (const mark of n.marks) {
        if (mark?.type === "link" && mark.attrs) {
          const parsed = parseInternalLinkUri(mark.attrs.href as string | undefined);
          if (parsed) {
            addInternalLink(
              parsed.collectionName,
              parsed.documentId,
              typeof n.text === "string" ? n.text : undefined
            );
          }
        }
      }
    }

    if (Array.isArray(n.content)) n.content.forEach(walk);
  };

  walk(normalizedRoot);

  const internalLinks = Array.from(internalLinksMap.values());
  const linksByCollection: Record<string, Array<{ documentId: string }>> = {};
  for (const link of internalLinks) {
    (linksByCollection[link.collectionName] ??= []).push({ documentId: link.documentId });
  }

  return {
    mediaIds: Array.from(mediaIdsSet),
    mediaDocumentIds: Array.from(mediaDocIdsSet),
    mediaAssets,
    internalLinks,
    linksByCollection,
  };
};
