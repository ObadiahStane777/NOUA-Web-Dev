import { useEffect } from "react";

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function removeMeta(attr: "name" | "property", key: string) {
  document.head.querySelector(`meta[${attr}="${key}"]`)?.remove();
}

/** The most recently rendered page's SEO data, captured synchronously (not in an effect)
 * so script/prerender.ts can read it right after renderToString() and patch the static
 * HTML's <head> per route — the effect below only reaches JS-executing crawlers. */
export let lastSeo: { title: string; description: string; noindex?: boolean } | null = null;

/** Sets per-page title/description/OG tags. No head-management library installed, so this is
 * plain DOM manipulation rather than a dependency — Google/Bing read the post-render DOM, so
 * this reaches those crawlers. Raw (non-JS) HTML is handled separately by prerendering. */
export function Seo({
  title,
  description,
  noindex,
}: {
  title: string;
  description: string;
  noindex?: boolean;
}) {
  const fullTitle = title.includes("NOUA") ? title : `${title} | NOUA`;
  lastSeo = { title: fullTitle, description, noindex };

  useEffect(() => {
    document.title = fullTitle;
    upsertMeta("name", "description", description);
    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", description);
    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta("name", "twitter:description", description);

    if (noindex) {
      upsertMeta("name", "robots", "noindex, follow");
    } else {
      removeMeta("name", "robots");
    }
  }, [title, description, noindex]);

  return null;
}
