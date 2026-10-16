import { getByText } from "@testing-library/dom";
import { renderAstroComponentToDom } from "@utils/test.helpers";

import TiptapBlockList from "./TiptapBlockList.astro";

describe("TiptapBlockList", () => {
  it("renders orderedList with start attribute", async () => {
    const { root, close } = await renderAstroComponentToDom(TiptapBlockList, {
      props: {
        type: "orderedList",
        attrs: { start: 3 },
        content: [
          {
            type: "listItem",
            content: [{ type: "paragraph", content: [{ type: "text", text: "Third step" }] }],
          },
        ],
      },
    });

    try {
      const ol = root.querySelector("ol");
      expect(ol).not.toBeNull();
      expect(ol?.getAttribute("start")).toBe("3");
      expect(getByText(root, "Third step")).toBeInTheDocument();
    } finally {
      await close();
    }
  });

  it("renders taskList with disabled checkboxes and checked state", async () => {
    const { root, close } = await renderAstroComponentToDom(TiptapBlockList, {
      props: {
        type: "taskList",
        content: [
          {
            type: "taskItem",
            attrs: { checked: true },
            content: [{ type: "paragraph", content: [{ type: "text", text: "Completed task" }] }],
          },
          {
            type: "taskItem",
            attrs: { checked: false },
            content: [{ type: "paragraph", content: [{ type: "text", text: "Pending task" }] }],
          },
        ],
      },
    });

    try {
      const ul = root.querySelector('ul[data-type="taskList"]');
      expect(ul).not.toBeNull();
      const items = root.querySelectorAll('li[data-type="taskItem"]');
      expect(items).toHaveLength(2);
      expect(items[0].getAttribute("data-checked")).toBe("true");
      expect(items[1].getAttribute("data-checked")).toBe("false");
    } finally {
      await close();
    }
  });
});
