declare module "*.css";
declare module "*.astro" {
  const Component: any;
  export default Component;
}
declare module "@storybook-astro/renderer/entry-preview-docs" {
  import type { DecoratorFunction } from "storybook/internal/types";
  export const decorators: DecoratorFunction[];
}
