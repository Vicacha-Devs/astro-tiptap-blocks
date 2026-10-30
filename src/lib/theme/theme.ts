import type {
  DeepPartial,
  TiptapBlockTheme,
  TiptapBlockThemeProperty,
  TiptapBlockThemePropertyValue,
  TiptapBlockUserTheme,
} from "../../types";
import { TiptapBlockThemeDefault } from "./theme-default";

export { TiptapBlockThemeDefault };

const NODE_TYPE_TO_THEME_KEY: Record<string, string> = {
  blockquote: "quote",
  layoutContainer: "columns",
  codeBlock: "code",
  bulletList: "list",
  orderedList: "list",
  horizontalRule: "hr",
};

export const mapNodeTypeToThemeKey = (nodeType: string): string =>
  NODE_TYPE_TO_THEME_KEY[nodeType] ?? nodeType;

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
