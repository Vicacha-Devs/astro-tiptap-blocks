/// <reference types="vitest/config" />
declare module "*.css";
declare module "*.astro" {
  const Component: any;
  export default Component;
}
