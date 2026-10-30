import { getByRole, getByText } from "@testing-library/dom";
import { renderAstroComponentToDom } from "@utils/test.helpers";

import TiptapBlockMedia from "./TiptapBlockMedia.astro";

describe("TiptapBlockMedia", () => {
  it("renders downloadable attachment card with mediaBaseUrl, formatted byte size, and extension badge", async () => {
    const { root, close } = await renderAstroComponentToDom(TiptapBlockMedia, {
      props: {
        type: "attachment",
        mediaBaseUrl: "https://cdn.mezquitabogota.org",
        attrs: {
          href: "/files/manual.pdf",
          title: "User Manual",
          size: 1048576,
          ext: "pdf",
        },
      },
    });

    try {
      expect(getByText(root, "PDF")).toBeInTheDocument();
      expect(getByText(root, "User Manual")).toBeInTheDocument();
      expect(getByText(root, "1.0 MB")).toBeInTheDocument();
      const link = getByRole(root, "link", { name: "Download" });
      expect(link.getAttribute("href")).toBe("https://cdn.mezquitabogota.org/files/manual.pdf");
    } finally {
      await close();
    }
  });

  it("enforces HTTPS, domain allowlist, and strict sandbox isolation on iframe embeds", async () => {
    const { root: allowedRoot, close: closeAllowed } = await renderAstroComponentToDom(
      TiptapBlockMedia,
      {
        props: {
          type: "iframe",
          attrs: { src: "https://www.youtube.com/embed/abc", title: "Allowed Video" },
          allowedIframeDomains: ["youtube.com"],
        },
      }
    );

    try {
      const iframe = allowedRoot.querySelector("iframe");
      expect(iframe).not.toBeNull();
      expect(iframe?.getAttribute("sandbox")).toContain("allow-scripts");
      expect(iframe?.getAttribute("sandbox")).toContain("allow-same-origin");
    } finally {
      await closeAllowed();
    }

    const { root: genericRoot, close: closeGeneric } = await renderAstroComponentToDom(
      TiptapBlockMedia,
      {
        props: {
          type: "iframe",
          attrs: { src: "https://widget.example.com/embed", title: "Untrusted Widget" },
        },
      }
    );

    try {
      const iframe = genericRoot.querySelector("iframe");
      expect(iframe).not.toBeNull();
      expect(iframe?.getAttribute("sandbox")).toContain("allow-scripts");
      expect(iframe?.getAttribute("sandbox")).not.toContain("allow-same-origin");
    } finally {
      await closeGeneric();
    }

    const { root: blockedRoot, close: closeBlocked } = await renderAstroComponentToDom(
      TiptapBlockMedia,
      {
        props: {
          type: "iframe",
          attrs: { src: "https://evil.example.com/embed", title: "Blocked" },
          allowedIframeDomains: ["youtube.com"],
        },
      }
    );

    try {
      expect(blockedRoot.querySelector("iframe")).toBeNull();
    } finally {
      await closeBlocked();
    }
  });

  it("renders embedded and file-based video blocks and audio blocks with captions", async () => {
    const { root: videoEmbedRoot, close: closeVideoEmbed } = await renderAstroComponentToDom(
      TiptapBlockMedia,
      {
        props: {
          type: "video",
          attrs: {
            src: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            embedType: "embed",
            title: "Demo Video",
            caption: "Video caption",
          },
        },
      }
    );

    try {
      expect(videoEmbedRoot.querySelector("iframe")?.getAttribute("src")).toBe(
        "https://www.youtube.com/embed/dQw4w9WgXcQ"
      );
      expect(getByText(videoEmbedRoot, "Video caption")).toBeInTheDocument();
    } finally {
      await closeVideoEmbed();
    }

    const { root: videoFileRoot, close: closeVideoFile } = await renderAstroComponentToDom(
      TiptapBlockMedia,
      {
        props: {
          type: "video",
          mediaBaseUrl: "https://cdn.example.com",
          attrs: { src: "/uploads/clip.mp4", embedType: "file", width: 640, height: 360 },
        },
      }
    );

    try {
      expect(videoFileRoot.querySelector("video")?.getAttribute("src")).toBe(
        "https://cdn.example.com/uploads/clip.mp4"
      );
    } finally {
      await closeVideoFile();
    }

    const { root: audioRoot, close: closeAudio } = await renderAstroComponentToDom(
      TiptapBlockMedia,
      {
        props: {
          type: "audio",
          mediaBaseUrl: "https://cdn.example.com",
          attrs: { src: "/uploads/recitation.mp3", caption: "Audio recitation" },
        },
      }
    );

    try {
      expect(audioRoot.querySelector("audio")?.getAttribute("src")).toBe(
        "https://cdn.example.com/uploads/recitation.mp3"
      );
      expect(getByText(audioRoot, "Audio recitation")).toBeInTheDocument();
    } finally {
      await closeAudio();
    }
  });
});
