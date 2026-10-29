import type {
  DeepPartial,
  TiptapBlockTheme,
  TiptapBlockThemeProperty,
  TiptapBlockThemePropertyValue,
  TiptapBlockUserTheme,
} from "../../types";

export const TiptapBlockThemeDefault: TiptapBlockTheme = {
  default: "",
  heading: {
    default: "font-bold tracking-tight leading-tight",
    h1: "text-4xl mt-8 mb-4",
    h2: "text-3xl mt-7 mb-3",
    h3: "text-2xl mt-6 mb-3",
    h4: "text-xl mt-5 mb-2",
    h5: "text-lg mt-4 mb-2",
    h6: "text-base mt-3 mb-2",
  },
  paragraph: {
    default: "text-base leading-relaxed my-4",
    link: "underline underline-offset-4 hover:opacity-80 transition-opacity",
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
    code: "font-mono text-sm px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10",
    highlight: "bg-yellow-200/70 dark:bg-yellow-500/30 px-1 rounded",
    subscript: "text-xs align-sub",
    superscript: "text-xs align-super",
    abbr: "underline decoration-dotted cursor-help",
    language: "",
    linker:
      "inline-flex items-center gap-1 underline underline-offset-4 font-medium hover:opacity-80",
    mathInline:
      "font-mono text-sm px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  },
  leadParagraph: { default: "text-xl leading-relaxed my-5 opacity-90 font-normal" },
  quote: { default: "border-s-4 ps-4 italic my-6 opacity-90" },
  informationPane: {
    default: "my-6 p-4 rounded-lg border-s-4",
    info: "bg-blue-500/10 border-blue-500 text-blue-950 dark:text-blue-100",
    success: "bg-emerald-500/10 border-emerald-500 text-emerald-950 dark:text-emerald-100",
    warning: "bg-amber-500/10 border-amber-500 text-amber-950 dark:text-amber-100",
    danger: "bg-rose-500/10 border-rose-500 text-rose-950 dark:text-rose-100",
    neutral: "bg-neutral-500/10 border-neutral-500 text-neutral-900 dark:text-neutral-100",
    tip: "bg-purple-500/10 border-purple-500 text-purple-950 dark:text-purple-100",
    title: "font-semibold mb-1 block",
    body: "space-y-2 text-sm leading-relaxed",
  },
  conversationHistory: {
    default: "my-6 p-4 rounded-lg border bg-black/[0.02] dark:bg-white/[0.03]",
    header: "flex items-center justify-between gap-2 mb-2 text-xs opacity-75",
    author: "font-semibold",
    timestamp: "font-mono",
    body: "space-y-2 text-sm",
  },
  details: {
    default: "my-6 rounded-lg border p-4",
    summary: "font-semibold cursor-pointer select-none",
    content: "mt-3 space-y-2",
  },
  columns: {
    default: "my-6 grid gap-6 md:grid-cols-2",
    column: "min-w-0 space-y-4",
  },
  list: {
    default: "my-4 ps-6 space-y-2",
    ordered: "list-decimal",
    unordered: "list-disc",
    item: "leading-relaxed",
  },
  taskList: {
    default: "my-4 space-y-2 list-none ps-0",
    item: "flex items-start gap-2.5 leading-relaxed",
    checkbox: "mt-1.5 h-4 w-4 rounded border accent-current",
    content: "flex-1",
    checked: "line-through opacity-70",
  },
  code: {
    default:
      "font-mono text-sm p-4 my-6 rounded-lg overflow-x-auto bg-neutral-900 text-neutral-100",
    line: "block",
  },
  image: {
    default: "my-6",
    image: "max-w-full h-auto rounded-lg",
    caption: "text-sm opacity-75 mt-2 text-center",
  },
  video: {
    default: "my-6",
    video: "w-full rounded-lg",
    iframe: "w-full aspect-video rounded-lg border-0",
    caption: "text-sm opacity-75 mt-2 text-center",
  },
  audio: {
    default: "my-6",
    audio: "w-full",
    caption: "text-sm opacity-75 mt-2 text-center",
  },
  attachment: {
    default: "my-4 flex items-center justify-between gap-4 p-3.5 rounded-lg border",
    badge: "px-2 py-1 text-xs font-mono font-bold uppercase rounded bg-black/10 dark:bg-white/10",
    title: "font-medium text-sm truncate",
    meta: "text-xs opacity-70",
    button: "text-xs font-semibold underline underline-offset-4 shrink-0",
  },
  iframe: { default: "my-6", iframe: "w-full rounded-lg border" },
  mathematics: {
    default: "my-6 p-4 rounded-lg bg-black/[0.03] dark:bg-white/[0.04] overflow-x-auto text-center",
    formula: "font-mono text-base",
  },
  tableOfContents: {
    default: "my-6 p-4 rounded-lg border bg-black/[0.02] dark:bg-white/[0.02]",
    title: "font-semibold text-sm uppercase tracking-wider opacity-75 mb-2",
    list: "space-y-1.5 text-sm list-none ps-0",
    item: "leading-snug",
    link: "underline underline-offset-4 hover:opacity-80",
  },
  pageBreak: { default: "my-8 border-t-2 border-dashed opacity-30 print:break-after-page" },
  table: {
    default: "w-full border-collapse my-6 text-sm",
    head: "border-b-2",
    body: "divide-y",
    row: "transition-colors",
    headerCell: "px-4 py-3 text-start font-semibold",
    cell: "px-4 py-3 align-top",
  },
  hr: { default: "my-8 border-t opacity-20" },
};

export const getPropertyClass = (value: TiptapBlockThemePropertyValue): string => {
  if (!value) return "";
  return (Array.isArray(value) ? value : [value]).filter(Boolean).join(" ").trim();
};

export const renderPropertyClasses = <T extends TiptapBlockThemeProperty>(
  theme: T,
  key?: keyof Omit<T, "default"> | Array<keyof Omit<T, "default">>
): string => {
  const keys = key ? (Array.isArray(key) ? key : [key]) : [];
  return [
    getPropertyClass(theme.default),
    ...keys.map((propertyKey) =>
      getPropertyClass(theme[propertyKey as keyof T] as TiptapBlockThemePropertyValue)
    ),
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
};

const mergeThemeGroup = <T extends Record<string, any>>(
  base: T,
  override: DeepPartial<T> | undefined,
  mode: "overwrite" | "extend"
): T => {
  if (!override) return { ...base };
  const result: Record<string, any> = { ...base };
  for (const key of Object.keys(override)) {
    const incoming = override[key];
    if (incoming === undefined) continue;
    result[key] =
      mode === "overwrite"
        ? incoming
        : [getPropertyClass(base[key]), getPropertyClass(incoming as TiptapBlockThemePropertyValue)]
            .filter(Boolean)
            .join(" ")
            .trim();
  }
  return result as T;
};

export const buildThemeObject = (
  userTheme?: TiptapBlockUserTheme,
  defaultTheme: TiptapBlockTheme = TiptapBlockThemeDefault
): TiptapBlockTheme => {
  const resolved: Record<string, any> = { default: defaultTheme.default };
  const groupKeys = Object.keys(defaultTheme).filter((k) => k !== "default") as Array<
    keyof Omit<TiptapBlockTheme, "default">
  >;
  for (const key of groupKeys) resolved[key] = { ...defaultTheme[key] };

  const applyLayer = (
    layer: DeepPartial<TiptapBlockTheme> | undefined,
    mode: "overwrite" | "extend"
  ) => {
    if (!layer) return;
    if (layer.default !== undefined) {
      resolved.default =
        mode === "overwrite"
          ? (layer.default as TiptapBlockThemePropertyValue)
          : [
              getPropertyClass(resolved.default),
              getPropertyClass(layer.default as TiptapBlockThemePropertyValue),
            ]
              .filter(Boolean)
              .join(" ")
              .trim();
    }
    for (const key of groupKeys) {
      if (layer[key]) resolved[key] = mergeThemeGroup(resolved[key], layer[key] as any, mode);
    }
  };

  applyLayer(userTheme?.overwrite, "overwrite");
  applyLayer(userTheme?.extend, "extend");
  return resolved as TiptapBlockTheme;
};
