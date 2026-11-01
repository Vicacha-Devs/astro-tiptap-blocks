## [1.2.1](https://github.com/Vicacha-Devs/astro-tiptap-blocks/compare/v1.2.0...v1.2.1) (2026-11-01)

### Bug Fixes

* **release:** keep preset 10 and override conventional-changelog-writer to 9 ([f43a2d4](https://github.com/Vicacha-Devs/astro-tiptap-blocks/commit/f43a2d4cc12633006f105a476dcf43a4fd3a1a25))
* **release:** pin conventionalcommits preset to 9.3.1 for release-notes-generator ([e2bb867](https://github.com/Vicacha-Devs/astro-tiptap-blocks/commit/e2bb867b3d0fb31afdc742f6b3c050464e81d373))
* **release:** publish with npm trusted publishing ([cdf8b48](https://github.com/Vicacha-Devs/astro-tiptap-blocks/commit/cdf8b4803d86bf2158f3762cf2fae526558b459d))
* **release:** push release commit with a fine-grained token ([dc988a5](https://github.com/Vicacha-Devs/astro-tiptap-blocks/commit/dc988a5747abaff22c86dfbce0d86bc980f0915b))

### Documentation

* add TODO to remove conventional-changelog-writer override ([c6631ed](https://github.com/Vicacha-Devs/astro-tiptap-blocks/commit/c6631edacc6fec84fb8a81850725615f1c13c901))

### Continuous Integration

* **release:** publish to npm with trusted publishing instead of NPM_TOKEN ([67dbb14](https://github.com/Vicacha-Devs/astro-tiptap-blocks/commit/67dbb14069f0806407b32410a36d82215fcb0eb0))

# @vicacha-devs/astro-tiptap-blocks

## 1.2.0

### Minor Changes

- Zero-JS Astro block components and themeable renderer for Tiptap & ProseMirror rich text (JSON, HTML & Markdown).
- Added native Shiki token-based code block highlighting (`TiptapBlockCode`), semantic nested inline mark rendering (`TiptapTextItem`), custom block component overrides (`blocks`), and strict URL/CSS sanitization.
