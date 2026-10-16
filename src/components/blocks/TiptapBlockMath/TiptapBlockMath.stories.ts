import preview from "@storybook/preview";
import type { TiptapMathematicsNode } from "../../../types";

import TiptapBlockMath from "./TiptapBlockMath.astro";

const meta = preview.meta({
  title: "Components/Blocks/TiptapBlockMath",
  component: TiptapBlockMath,
  tags: ["autodocs", "version:1.1.0", "new"],
  args: {
    type: "mathematics",
    attrs: {
      latex: "\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}",
      displayMode: "block",
    },
  },
  argTypes: {
    type: {
      control: "text",
    },
    attrs: {
      control: "object",
    },
  },
});

export const GaussianIntegral = meta.story({
  args: {
    type: "mathematics",
    attrs: {
      latex: "\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}",
      displayMode: "block",
    },
  } satisfies TiptapMathematicsNode,
});

export const BaselProblemSeries = meta.story({
  args: {
    type: "mathematics",
    attrs: {
      latex: "\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6} \\approx 1.644934",
      displayMode: "block",
    },
  } satisfies TiptapMathematicsNode,
});
