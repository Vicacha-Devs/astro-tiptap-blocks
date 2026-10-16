import {
  experimental_AstroContainer as AstroContainer,
  type ContainerRenderOptions,
} from "astro/container";
import { Window } from "happy-dom";

type GlobalDomShim = {
  window: Window;
  document: Document;
  HTMLElement: typeof HTMLElement;
  Event: typeof Event;
  CustomEvent: typeof CustomEvent;
  MouseEvent: typeof MouseEvent;
  KeyboardEvent: typeof KeyboardEvent;
};

/**
 * Installs a minimal DOM shim on `globalThis` for tests running in Node.
 *
 * @param window - The `happy-dom` window instance for the test.
 * @param document - The `happy-dom` document instance for the test.
 */
export function installDomGlobals(window: Window, document: Document): void {
  const globalDom = globalThis as unknown as GlobalDomShim;
  globalDom.window = window;
  globalDom.document = document;
  globalDom.HTMLElement = window.HTMLElement as unknown as typeof HTMLElement;
  globalDom.Event = window.Event as unknown as typeof Event;
  globalDom.CustomEvent = window.CustomEvent as unknown as typeof CustomEvent;
  globalDom.MouseEvent = window.MouseEvent as unknown as typeof MouseEvent;
  globalDom.KeyboardEvent =
    window.KeyboardEvent as unknown as typeof KeyboardEvent;
}

// Astro's `.astro` module typings and `astro/container` can resolve to different
// copies of the package, so component factories are loosely typed here.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TAstroComponentFactory = any;

type ComponentContainerRenderOptions = Omit<ContainerRenderOptions, "props"> & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props?: Record<string, any>;
};

/**
 * Renders an Astro component to HTML and mounts it into a `happy-dom` document body.
 *
 * This is used for unit testing Astro components with DOM assertions via
 * `@testing-library/dom`, while supporting component rendering through
 * Astro's container renderer.
 *
 * @param Component - The Astro component factory to render.
 * @param options - Render options passed through to Astro's container renderer.
 * @returns `{ window, root, html, close }` where `root` is the mounted body element.
 */
export async function renderAstroComponentToDom(
  Component: TAstroComponentFactory,
  options: ComponentContainerRenderOptions = {}
): Promise<{
  window: Window;
  root: HTMLElement;
  html: string;
  close: () => Promise<void>;
}> {
  const astroContainer = await AstroContainer.create();
  const html = await astroContainer.renderToString(Component, options);

  const window = new Window({
    innerHeight: 768,
    innerWidth: 1024,
    url: "http://localhost:4321",
  });

  window.document.write(
    `<!DOCTYPE html><html><head><title>Test page</title></head><body>${html}</body></html>`
  );

  await window.happyDOM.waitUntilComplete();

  return {
    window,
    root: window.document.body as unknown as HTMLElement,
    html,
    close: () => window.happyDOM.close(),
  };
}
