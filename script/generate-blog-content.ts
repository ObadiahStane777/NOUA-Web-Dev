import { readdir, readFile, mkdir, writeFile } from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

/**
 * Reads content/blog/*.md, converts each to HTML, and writes a typed data
 * module the React pages import at build time. No markdown parsing happens
 * in the browser bundle or at request time — this keeps the site's static-
 * prerender model intact (see script/prerender.ts).
 *
 * House block conventions (shared with blog-drafts/_tooling/render_noua_post.py
 * in the claudeC-cli repo, which renders these same source files as
 * standalone preview artifacts before they're copied in here):
 * - A blockquote whose first line is "**Key Takeaways**" -> takeaways card.
 * - Any other labeled blockquote (bold first line) -> formula card.
 * - One or more consecutive "[INTERNAL-LINK: anchor -> target]" lines
 *   (arrow can be "->" or "→") -> one grouped related-reading card. If
 *   target starts with "/", it's a real link; otherwise it's rendered as
 *   plain text (a not-yet-written spoke).
 * - "**[CTA: copy -> target]**" -> the CTA box.
 *
 * ponytail: regex-based block extraction over this repo's specific
 * conventions, not a general MDX/component system. Add a block type here
 * only when a real draft introduces one.
 */

const rootDir = path.resolve(import.meta.dirname, "..");
const contentDir = path.join(rootDir, "content/blog");
const outFile = path.join(rootDir, "client/src/generated/blog-content.ts");

const KEY_TAKEAWAYS_RE = /^> \*\*Key Takeaways\*\*\n((?:> ?.*\n?)+)/m;
const LABELED_QUOTE_RE = /^> \*\*([^\n*]+)\*\*\n((?:> ?.*\n?)+)/m;
const LINK_LINE_RE = /^\[INTERNAL-LINK:\s*(.+?)\s*(?:->|→)\s*(.+?)\]\s*$/gm;
const LINK_GROUP_RE = new RegExp(`(?:${LINK_LINE_RE.source}\\n?)+`, "gm");
const CTA_RE = /^\*\*\[CTA:\s*(.+?)\s*(?:->|→)\s*(.+?)\]\*\*\s*$/m;

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  tags: string[];
  html: string;
}

function renderTakeaways(block: string): string {
  const items = [...block.matchAll(/^> ?-\s*(.+)$/gm)].map((m) => m[1]);
  const lis = items.map((i) => `<li>${marked.parseInline(i)}</li>`).join("\n");
  return `<div class="blog-card blog-ledger"><span class="blog-label">Key Takeaways</span><ul>${lis}</ul></div>`;
}

function renderFormula(label: string, block: string): string {
  const lines = block
    .split("\n")
    .map((l) => (l.startsWith("> ") ? l.slice(2) : l).trim())
    .filter(Boolean);
  return `<div class="blog-formula"><span class="blog-label">${label}</span>${lines.join("<br>\n")}</div>`;
}

function renderLinkGroup(groupText: string): string {
  const matches = [...groupText.matchAll(LINK_LINE_RE)];
  const titles = matches
    .map(([, anchor, target]) =>
      target.startsWith("/")
        ? `<a class="blog-link-title" href="${target}">${anchor}</a>`
        : `<span class="blog-link-title">${anchor}</span>`,
    )
    .join("");
  return `<div class="blog-link-slot"><span class="blog-link-icon">&#8599;</span><span class="blog-link-body"><span class="blog-label">Related reading</span>${titles}</span></div>`;
}

function renderCta(copy: string, target: string): string {
  return `<div class="blog-cta"><p>${copy}</p><a class="blog-cta-btn" href="${target}">Book the audit <span class="blog-cta-arrow">&rarr;</span></a></div>`;
}

function extractBlocks(body: string): { body: string; tokens: Map<string, string> } {
  const tokens = new Map<string, string>();
  let n = 0;
  const stash = (html: string) => {
    const token = `@@BLOCK${++n}@@`;
    tokens.set(token, html);
    return token;
  };

  body = body.replace(KEY_TAKEAWAYS_RE, (_m, block) => stash(renderTakeaways(block)));
  body = body.replace(LABELED_QUOTE_RE, (_m, label, block) => stash(renderFormula(label, block)));
  body = body.replace(LINK_GROUP_RE, (m) => stash(renderLinkGroup(m)));
  body = body.replace(CTA_RE, (_m, copy, target) => stash(renderCta(copy, target)));

  // Force every token onto its own isolated block, otherwise marked can fuse
  // a token with an adjacent heading into one paragraph.
  body = body.replace(/\n*(@@BLOCK\d+@@)\n*/g, "\n\n$1\n\n");

  return { body, tokens };
}

async function buildPost(file: string): Promise<BlogPost> {
  const raw = await readFile(path.join(contentDir, file), "utf-8");
  const { data, content } = matter(raw);

  const h1Match = content.match(/^# (.+)$/m);
  let body = h1Match ? content.replace(h1Match[0], "") : content;

  const { body: withTokens, tokens } = extractBlocks(body);
  let html = marked.parse(withTokens, { gfm: true }) as string;

  for (const [token, blockHtml] of tokens) {
    html = html.replaceAll(`<p>${token}</p>`, blockHtml).replaceAll(token, blockHtml);
  }
  html = html.replace(/<table>/g, '<div class="blog-table-wrap"><table>').replace(/<\/table>/g, "</table></div>");
  html = html.replace("<p>", '<p class="blog-lede">');

  return {
    slug: file.replace(/\.md$/, ""),
    title: (data.title as string)?.split(" | ")[0] ?? file,
    description: data.description ?? "",
    date: data.date ?? "",
    readTime: data.readTime ?? "",
    tags: data.tags ?? [],
    html,
  };
}

async function main() {
  const files = (await readdir(contentDir)).filter((f) => f.endsWith(".md"));
  const posts = await Promise.all(files.map(buildPost));
  posts.sort((a, b) => (a.date < b.date ? 1 : -1));

  await mkdir(path.dirname(outFile), { recursive: true });
  await writeFile(
    outFile,
    `// GENERATED by script/generate-blog-content.ts — do not edit by hand.\n` +
      `// Source of truth: content/blog/*.md. Regenerate with \`npm run blog:content\`.\n` +
      `export interface BlogPost {\n  slug: string;\n  title: string;\n  description: string;\n  date: string;\n  readTime: string;\n  tags: string[];\n  html: string;\n}\n\n` +
      `export const blogPosts: BlogPost[] = ${JSON.stringify(posts, null, 2)};\n`,
  );
  console.log(`wrote ${posts.length} post(s) to ${path.relative(rootDir, outFile)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
