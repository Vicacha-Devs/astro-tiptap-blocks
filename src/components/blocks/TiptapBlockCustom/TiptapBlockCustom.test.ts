import { getByRole, getByText } from "@testing-library/dom";
import { renderAstroComponentToDom } from "@utils/test.helpers";

import TiptapBlockCallout from "../TiptapBlockCallout/TiptapBlockCallout.astro";
import TiptapBlockCustom from "./TiptapBlockCustom.astro";

describe("TiptapBlockCustom", () => {
  it("delegates block rendering and forwards props to the custom Astro component factory", async () => {
    const { root, close } = await renderAstroComponentToDom(TiptapBlockCustom, {
      props: {
        component: TiptapBlockCallout,
        type: "informationPane",
        attrs: { variant: "tip", title: "Custom Override" },
        content: [{ type: "paragraph", content: [{ type: "text", text: "Delegated body" }] }],
      },
    });

    try {
      expect(getByRole(root, "note")).toBeInTheDocument();
      expect(getByText(root, "Custom Override")).toBeInTheDocument();
      expect(getByText(root, "Delegated body")).toBeInTheDocument();
    } finally {
      await close();
    }
  });
});
