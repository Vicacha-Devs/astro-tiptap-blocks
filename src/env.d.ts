declare module "*.css";
declare module "*.astro" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Component: any;
  export default Component;
}
declare module "@storybook-astro/renderer/entry-preview-docs" {
  import type { DecoratorFunction } from "storybook/internal/types";
  export const decorators: DecoratorFunction[];
}
