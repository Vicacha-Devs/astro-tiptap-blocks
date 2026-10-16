import type {
  DeepPartial,
  TiptapBlockTheme,
  TiptapBlockThemeProperty,
  TiptapBlockThemePropertyValue,
  TiptapBlockUserTheme,
} from "../types";

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
  },
  quote: {
    default: "border-s-4 ps-4 italic my-6 opacity-90",
  },
  list: {
    default: "my-4 ps-6 space-y-2",
    ordered: "list-decimal",
    unordered: "list-disc",
    item: "leading-relaxed",
  },
  code: {
    default: "font-mono text-sm p-4 my-6 rounded-lg overflow-x-auto bg-neutral-900 text-neutral-100",
    line: "block",
  },
  image: {
    default: "my-6",
    image: "max-w-full h-auto rounded-lg",
    caption: "text-sm opacity-75 mt-2 text-center",
  },
  table: {
    default: "w-full border-collapse my-6 text-sm",
    head: "border-b-2",
    body: "divide-y",
    row: "transition-colors",
    headerCell: "px-4 py-3 text-start font-semibold",
    cell: "px-4 py-3 align-top",
  },
  hr: {
    default: "my-8 border-t opacity-20",
  },
};

export const getPropertyClass = (value: TiptapBlockThemePropertyValue): string => {
  if (!value) {
    return "";
  }
  const normalized = Array.isArray(value) ? value : [value];
  return normalized.filter(Boolean).join(" ").trim();
};

export const renderPropertyClasses = <T extends TiptapBlockThemeProperty>(
  theme: T,
  key?: keyof Omit<T, "default"> | Array<keyof Omit<T, "default">>
): string => {
  const keys = key ? (Array.isArray(key) ? key : [key]) : [];
  return [
    getPropertyClass(theme.default),
    ...keys.map((propertyKey) => getPropertyClass(theme[propertyKey as keyof T] as TiptapBlockThemePropertyValue)),
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
  if (!override) {
    return { ...base };
  }
  const result: Record<string, any> = { ...base };
  for (const key of Object.keys(override)) {
    const incoming = override[key];
    if (incoming === undefined) {
      continue;
    }
    if (mode === "overwrite") {
      result[key] = incoming;
    } else {
      const existingClass = getPropertyClass(base[key]);
      const incomingClass = getPropertyClass(incoming as TiptapBlockThemePropertyValue);
      result[key] = [existingClass, incomingClass].filter(Boolean).join(" ").trim();
    }
  }
  return result as T;
};

export const buildThemeObject = (
  userTheme?: TiptapBlockUserTheme,
  defaultTheme: TiptapBlockTheme = TiptapBlockThemeDefault
): TiptapBlockTheme => {
  let resolved: TiptapBlockTheme = {
    default: defaultTheme.default,
    heading: { ...defaultTheme.heading },
    paragraph: { ...defaultTheme.paragraph },
    quote: { ...defaultTheme.quote },
    list: { ...defaultTheme.list },
    code: { ...defaultTheme.code },
    image: { ...defaultTheme.image },
    table: { ...defaultTheme.table },
    hr: { ...defaultTheme.hr },
  };

  const applyLayer = (layer: DeepPartial<TiptapBlockTheme> | undefined, mode: "overwrite" | "extend") => {
    if (!layer) return;
    if (layer.default !== undefined) {
      resolved.default =
        mode === "overwrite"
          ? (layer.default as TiptapBlockThemePropertyValue)
          : [getPropertyClass(resolved.default), getPropertyClass(layer.default as TiptapBlockThemePropertyValue)]
              .filter(Boolean)
              .join(" ")
              .trim();
    }
    resolved.heading = mergeThemeGroup(resolved.heading, layer.heading, mode);
    resolved.paragraph = mergeThemeGroup(resolved.paragraph, layer.paragraph, mode);
    resolved.quote = mergeThemeGroup(resolved.quote, layer.quote, mode);
    resolved.list = mergeThemeGroup(resolved.list, layer.list, mode);
    resolved.code = mergeThemeGroup(resolved.code, layer.code, mode);
    resolved.image = mergeThemeGroup(resolved.image, layer.image, mode);
    resolved.table = mergeThemeGroup(resolved.table, layer.table, mode);
    resolved.hr = mergeThemeGroup(resolved.hr, layer.hr, mode);
  };

  applyLayer(userTheme?.overwrite, "overwrite");
  applyLayer(userTheme?.extend, "extend");

  return resolved;
};
