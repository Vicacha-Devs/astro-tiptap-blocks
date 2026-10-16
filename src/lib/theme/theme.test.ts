import {
  buildThemeObject,
  getPropertyClass,
  renderPropertyClasses,
  TiptapBlockThemeDefault,
} from "./theme";

describe("theme utilities (lib/theme)", () => {
  it("normalizes string and array values in getPropertyClass", () => {
    expect(getPropertyClass("text-lg font-bold")).toBe("text-lg font-bold");
    expect(getPropertyClass(["text-lg", "font-bold"])).toBe("text-lg font-bold");
    expect(getPropertyClass(null)).toBe("");
    expect(getPropertyClass(undefined)).toBe("");
  });

  it("renders default and variant property classes", () => {
    const classes = renderPropertyClasses(TiptapBlockThemeDefault.heading, "h2");
    expect(classes).toContain("font-bold");
    expect(classes).toContain("text-3xl");
  });

  it("extends default theme classes when using theme.extend", () => {
    const customTheme = buildThemeObject({
      extend: {
        default: "prose-mosque",
        heading: {
          h2: "text-emerald-800",
        },
        paragraph: {
          bold: ["text-amber-900"],
        },
      },
    });

    expect(customTheme.default).toBe("prose-mosque");
    expect(customTheme.heading.h2).toContain("text-3xl");
    expect(customTheme.heading.h2).toContain("text-emerald-800");
    expect(customTheme.paragraph.bold).toBe("font-bold text-amber-900");
  });

  it("overwrites default theme classes when using theme.overwrite", () => {
    const customTheme = buildThemeObject({
      overwrite: {
        heading: {
          default: "font-serif",
          h1: "text-5xl",
        },
      },
    });

    expect(customTheme.heading.default).toBe("font-serif");
    expect(customTheme.heading.h1).toBe("text-5xl");
    expect(customTheme.heading.h2).toBe(TiptapBlockThemeDefault.heading.h2);
  });
});
