import { readdir, readFile } from "fs/promises";
import path from "path";
import matter from "gray-matter";

/**
 * Run after a new post goes live to see every still-open INTERNAL-LINK
 * placeholder across the whole corpus, so you can eyeball which ones the
 * new post now resolves.
 *
 * Usage: npx tsx script/find-linkable-placeholders.ts
 *
 * Deliberately does NOT try to auto-match a placeholder's description
 * against a candidate post — a keyword-overlap scorer was tried and
 * produced confident-looking wrong answers, because this site's whole
 * vocabulary ("operations", "demand leak", "capacity constraint",
 * "readiness") repeats across nearly every post's title by design, so
 * string overlap can't discriminate between them. Whether a placeholder
 * actually describes a given post is a judgment call, not a string-match
 * problem — same failure mode as auto-linking a wrong CTA target: wrong
 * and silent is worse than not-yet-linked.
 */

const rootDir = path.resolve(import.meta.dirname, "..");
const contentDir = path.join(rootDir, "content/blog");
const PLACEHOLDER_RE = /\[INTERNAL-LINK:\s*(.+?)\s*(?:->|→)\s*(.+?)\]/g;

async function main() {
  const files = (await readdir(contentDir)).filter((f) => f.endsWith(".md"));
  let total = 0;

  for (const file of files.sort()) {
    const raw = await readFile(path.join(contentDir, file), "utf-8");
    const { data, content } = matter(raw);
    const lines = content.split("\n");
    const openHere: string[] = [];

    lines.forEach((line, i) => {
      for (const m of line.matchAll(PLACEHOLDER_RE)) {
        const [, anchor, dest] = m;
        if (dest.startsWith("/")) continue; // already resolved
        openHere.push(`  line ${i + 1}: "${anchor}" -> (unresolved: "${dest}")`);
      }
    });

    if (openHere.length) {
      console.log(`${file}  ("${data.title}")`);
      console.log(openHere.join("\n") + "\n");
      total += openHere.length;
    }
  }

  console.log(
    total === 0
      ? "No open placeholders — internal linking is fully resolved."
      : `${total} open placeholder(s) across the corpus. For each, check if a live post now matches; if so, edit the target from a description to the real /blog/<slug> path and re-run \`npm run blog:content\`.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
