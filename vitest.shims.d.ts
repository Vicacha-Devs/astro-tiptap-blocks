/// <reference types="vitest/config" />

declare module "*.astro" {
  import type { AstroComponentFactory } from "astro/runtime/server/index.js";
  const component: AstroComponentFactory;
  export default component;
}

declare module "*.css" {
  const css: string;
  export default css;
}
