import preview from "@storybook/preview";

import type {
  TiptapAttachmentNode,
  TiptapAudioNode,
  TiptapIframeNode,
  TiptapVideoNode,
} from "../../../types";
import TiptapBlockMedia from "./TiptapBlockMedia.astro";

const meta = preview.meta({
  title: "Components/Blocks/TiptapBlockMedia",
  component: TiptapBlockMedia,
  tags: ["autodocs", "version:1.1.0", "new"],
  args: {
    type: "attachment",
    attrs: {
      href: "https://example.com/files/architecture-whitepaper-v2.pdf",
      title: "Astro Tiptap Blocks Security Whitepaper (v2.0)",
      filename: "architecture-whitepaper-v2.pdf",
      size: 2485760,
      ext: "pdf",
    },
  },
  argTypes: {
    type: {
      control: "select",
      options: ["video", "audio", "attachment", "iframe"],
    },
    attrs: {
      control: "object",
    },
    allowedIframeDomains: {
      control: "object",
    },
  },
});

export const YouTubeEmbed = meta.story({
  args: {
    type: "video",
    attrs: {
      src: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      embedType: "embed",
      title: "YouTube Sandboxed Embed",
      caption: "Embedded HTTPS video rendered inside a sandboxed <iframe>.",
    },
  } satisfies TiptapVideoNode,
});

export const NativeVideoFile = meta.story({
  args: {
    type: "video",
    attrs: {
      src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      embedType: "file",
      caption: "Native HTML5 <video controls> element for direct media files.",
    },
  } satisfies TiptapVideoNode,
});

export const AudioPlayer = meta.story({
  args: {
    type: "audio",
    attrs: {
      src: "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3",
      caption: "Audio episode preview rendered with native <audio controls>.",
    },
  } satisfies TiptapAudioNode,
});

export const DownloadableAttachmentCard = meta.story({
  args: {
    type: "attachment",
    attrs: {
      href: "https://example.com/files/architecture-whitepaper-v2.pdf",
      title: "Astro Tiptap Blocks Security Whitepaper (v2.0)",
      filename: "architecture-whitepaper-v2.pdf",
      size: 2485760,
      ext: "pdf",
      mime: "application/pdf",
    },
  } satisfies TiptapAttachmentNode,
});

export const SandboxedHttpsIframe = meta.story({
  args: {
    type: "iframe",
    attrs: {
      src: "https://example.com",
      title: "Sandboxed External HTTPS Embed",
      height: 360,
    },
  } satisfies TiptapIframeNode,
});
