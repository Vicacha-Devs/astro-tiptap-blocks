## [1.2.2](https://github.com/Vicacha-Devs/astro-tiptap-blocks/compare/v1.2.1...v1.2.2) (2026-11-05)

### Performance Improvements

* shrink install size (optional shiki peer) + release App token ([#18](https://github.com/Vicacha-Devs/astro-tiptap-blocks/issues/18)) ([2da5694](https://github.com/Vicacha-Devs/astro-tiptap-blocks/commit/2da56945e93a98b610279fbf6f647b5e7e18199d))

### Miscellaneous Chores

* **deps-dev:** bump @stylistic/eslint-plugin ([7d79504](https://github.com/Vicacha-Devs/astro-tiptap-blocks/commit/7d7950468535c5f42b9bf9576bb703e2e8326e54))
* **deps-dev:** bump eslint from 10.13.0 to 10.14.0 ([0c7cd72](https://github.com/Vicacha-Devs/astro-tiptap-blocks/commit/0c7cd72bd1919602933a91c5245d73f6337a7ed4))

### Continuous Integration

* **release:** authenticate with a GitHub App token and document the release setup ([ad946ba](https://github.com/Vicacha-Devs/astro-tiptap-blocks/commit/ad946baebfb6dc2935de75c5f96b09be77271a61))
* **release:** keep release notes out of the repo ([35c838e](https://github.com/Vicacha-Devs/astro-tiptap-blocks/commit/35c838e44b7edaddefd72447b5677346ff999620))
* **release:** read the App id from the org variable RELEASE_APP_ID ([1844d98](https://github.com/Vicacha-Devs/astro-tiptap-blocks/commit/1844d982743b8b5943b96c1853868efa910c0e8f))

## [1.2.1](https://github.com/Vicacha-Devs/astro-tiptap-blocks/compare/v1.2.0...v1.2.1) (2026-11-02)

### Bug Fixes

* **release:** keep preset 10 and override conventional-changelog-writer to 9 ([f43a2d4](https://github.com/Vicacha-Devs/astro-tiptap-blocks/commit/f43a2d4cc12633006f105a476dcf43a4fd3a1a25))
* **release:** pin conventionalcommits preset to 9.3.1 for release-notes-generator ([e2bb867](https://github.com/Vicacha-Devs/astro-tiptap-blocks/commit/e2bb867b3d0fb31afdc742f6b3c050464e81d373))
* **release:** publish with npm trusted publishing ([cdf8b48](https://github.com/Vicacha-Devs/astro-tiptap-blocks/commit/cdf8b4803d86bf2158f3762cf2fae526558b459d))
* **release:** push release commit with a fine-grained token ([dc988a5](https://github.com/Vicacha-Devs/astro-tiptap-blocks/commit/dc988a5747abaff22c86dfbce0d86bc980f0915b))

### Documentation

* add TODO to remove conventional-changelog-writer override ([c6631ed](https://github.com/Vicacha-Devs/astro-tiptap-blocks/commit/c6631edacc6fec84fb8a81850725615f1c13c901))

### Miscellaneous Chores

* **release:** 1.2.1 [skip ci] ([2d49034](https://github.com/Vicacha-Devs/astro-tiptap-blocks/commit/2d49034439a79a0f6d4a854375fb5e61e3867880))

### Continuous Integration

* **release:** publish to npm with trusted publishing instead of NPM_TOKEN ([67dbb14](https://github.com/Vicacha-Devs/astro-tiptap-blocks/commit/67dbb14069f0806407b32410a36d82215fcb0eb0))

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
