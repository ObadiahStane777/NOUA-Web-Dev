import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { blogPosts } from "../client/src/generated/blog-content";

// Keep in sync with the <Route> paths registered in client/src/App.tsx.
// Blog routes are appended below from content/blog/*.md instead of being
// hand-listed here, since that list grows every time a post is added.
const ROUTES: { path: string; file: string }[] = [
  { path: "/", file: "index.html" },
  { path: "/how-we-work", file: "how-we-work.html" },
  { path: "/who-its-for", file: "who-its-for.html" },
  { path: "/audit", file: "audit.html" },
  { path: "/contact", file: "contact.html" },
  { path: "/booking", file: "booking.html" },
  { path: "/score", file: "score.html" },
  { path: "/calculator", file: "calculator.html" },
  { path: "/blog", file: "blog.html" },
  ...blogPosts.map((p) => ({ path: `/blog/${p.slug}`, file: `blog/${p.slug}.html` })),
];

type Seo = { title: string; description: string; noindex?: boolean } | null;

function escapeAttr(s: string) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Patches the built index.html template's <head> with this route's real title/description,
 * so a crawler that never runs JS still sees per-page metadata (the <Seo> component's
 * useEffect-based version only reaches JS-executing crawlers). */
function patchHead(template: string, seo: Seo): string {
  if (!seo) return template;
  const title = escapeAttr(seo.title);
  const description = escapeAttr(seo.description);

  let html = template.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);

  html = /<meta\s+name="description"/.test(html)
    ? html.replace(/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${description}" />`)
    : html.replace("</title>", `</title>\n    <meta name="description" content="${description}" />`);

  html = html.replace(/<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${title}" />`);
  html = html.replace(/<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${description}" />`);
  html = html.replace(/<meta name="twitter:title" content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${title}" />`);
  html = html.replace(/<meta name="twitter:description" content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${description}" />`);

  if (seo.noindex) {
    html = /<meta\s+name="robots"/.test(html)
      ? html.replace(/<meta name="robots" content="[^"]*"\s*\/?>/, `<meta name="robots" content="noindex, follow" />`)
      : html.replace("</title>", `</title>\n    <meta name="robots" content="noindex, follow" />`);
  }

  return html;
}

export async function prerender(rootDir: string) {
  const distPublic = path.resolve(rootDir, "dist/public");
  const template = await readFile(path.join(distPublic, "index.html"), "utf-8");

  const { render } = await import(
    path.resolve(rootDir, "dist/ssr/entry-server.js")
  );

  for (const route of ROUTES) {
    const { html: appHtml, seo } = render(route.path) as { html: string; seo: Seo };
    let html = patchHead(template, seo);
    html = html.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);
    const outPath = path.join(distPublic, route.file);
    await mkdir(path.dirname(outPath), { recursive: true });
    await writeFile(outPath, html);
    console.log(`prerendered ${route.path} -> ${route.file}${seo ? ` ("${seo.title}")` : " (no <Seo> found!)"}`);
  }
}
