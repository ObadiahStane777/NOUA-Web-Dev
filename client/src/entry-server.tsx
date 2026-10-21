import { renderToString } from "react-dom/server";
import { Router } from "wouter";
import App from "./App";
import { lastSeo } from "./components/seo";

/** Renders the app for a given path, no browser APIs involved. Returns the SEO data the
 * page's own <Seo> set during render, so the caller can patch the static HTML's <head>.
 * Used only at build time by script/prerender.ts — never shipped to the client. */
export function render(url: string) {
  const html = renderToString(
    <Router ssrPath={url}>
      <App />
    </Router>,
  );
  return { html, seo: lastSeo };
}
