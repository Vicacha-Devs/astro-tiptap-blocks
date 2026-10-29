import type {
  TiptapBlockNode,
  TiptapContentInput,
  TiptapHeadingLevel,
  TiptapParserOptions,
  TiptapTocHeadingItem,
} from "../../types";
import { parseTiptapContent } from "../parser";
import { extractRelationsFromTiptap, type ExtractedRelationsResult } from "../relations";
import { slugifyHeadingText } from "../sanitize";
import { blockNodesToText, inlineNodesToText } from "./text";

export interface TiptapReadingTime {
  words: number;
  minutes: number;
  text: string;
}

export interface TiptapPlainTextOptions extends TiptapParserOptions {
  maxLength?: number;
  ellipsis?: string;
}

export interface TiptapDocumentMetadata {
  plainText: string;
  excerpt: string;
  readingTime: TiptapReadingTime;
  headings: TiptapTocHeadingItem[];
  relations: ExtractedRelationsResult;
}

/**
 * Extracts normalized plain text from any Tiptap input (JSON, HTML, Markdown, or `string[]`),
 * optionally truncating at a word boundary for SEO `<meta name="description">` or card excerpts.
 */
export const extractPlainTextFromTiptap = (
  input: TiptapContentInput,
  options?: TiptapPlainTextOptions
): string => {
  const doc = parseTiptapContent(input, options);
  const fullText = blockNodesToText(doc.content);
  const maxLength = options?.maxLength;
  if (!maxLength || maxLength <= 0 || fullText.length <= maxLength) return fullText;
  const ellipsis = options?.ellipsis ?? "…";
  const sliced = fullText.slice(0, maxLength).trimEnd();
  const lastSpace = sliced.lastIndexOf(" ");
  const cleanCut = lastSpace > maxLength * 0.6 ? sliced.slice(0, lastSpace) : sliced;
  return `${cleanCut.replace(/[.,;:!?-]+$/, "")}${ellipsis}`;
};

/**
 * Calculates word count and estimated reading time for any Tiptap input.
 */
export const calculateReadingTime = (
  input: TiptapContentInput,
  wordsPerMinute = 200
): TiptapReadingTime => {
  const plainText = extractPlainTextFromTiptap(input);
  if (!plainText) return { words: 0, minutes: 0, text: "0 min read" };
  const words = plainText.split(/\s+/).filter(Boolean).length;
  const wpm = wordsPerMinute > 0 ? wordsPerMinute : 200;
  const minutes = Math.max(1, Math.ceil(words / wpm));
  return { words, minutes, text: `${minutes} min read` };
};

/**
 * Recursively extracts all headings (`id`, `text`, `level`) from a Tiptap document,
 * including headings nested inside multi-column layouts or accordions.
 */
export const extractHeadingsFromTiptap = (
  input: TiptapContentInput,
  options?: { minLevel?: TiptapHeadingLevel; maxLevel?: TiptapHeadingLevel }
): TiptapTocHeadingItem[] => {
  const doc = parseTiptapContent(input);
  const minLevel = options?.minLevel ?? 1;
  const maxLevel = options?.maxLevel ?? 6;
  const headings: TiptapTocHeadingItem[] = [];

  const walk = (blocks?: TiptapBlockNode[]) => {
    for (const b of blocks ?? []) {
      if (b.type === "heading") {
        const level = (b.attrs?.level ?? 2) as TiptapHeadingLevel;
        const text = inlineNodesToText(b.content).trim();
        if (text && level >= minLevel && level <= maxLevel) {
          headings.push({ id: b.attrs?.id || slugifyHeadingText(text), text, level });
        }
      } else if (
        b.type === "blockquote" ||
        b.type === "informationPane" ||
        b.type === "conversationHistory"
      ) {
        walk(b.content);
      } else if (b.type === "layoutContainer") {
        for (const col of b.content ?? []) walk(col.content);
      } else if (b.type === "details") {
        for (const child of b.content ?? []) {
          if (child.type === "detailsContent") walk(child.content);
          else if (child.type !== "detailsSummary") walk([child]);
        }
      }
    }
  };

  walk(doc.content);
  return headings;
};

/**
 * Extracts plain text, SEO excerpt, reading time, TOC headings, and document relations in one call.
 */
export const extractDocumentMetadata = (
  input: TiptapContentInput,
  options?: { excerptLength?: number; wordsPerMinute?: number }
): TiptapDocumentMetadata => {
  const doc = parseTiptapContent(input);
  return {
    plainText: extractPlainTextFromTiptap(doc),
    excerpt: extractPlainTextFromTiptap(doc, { maxLength: options?.excerptLength ?? 160 }),
    readingTime: calculateReadingTime(doc, options?.wordsPerMinute ?? 200),
    headings: extractHeadingsFromTiptap(doc),
    relations: extractRelationsFromTiptap(doc),
  };
};
