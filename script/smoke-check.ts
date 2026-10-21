import { readdir, readFile } from "fs/promises";
import path from "path";
import matter from "gray-matter";

/**
 * Post-deploy smoke check: fetches the LIVE site (not localhost) and
 * verifies the blog index and every post actually rendered, has the right
 * title, and every internal href it links to is a real, resolving page —
 * not a 404. Run this after every push, not just after the build.
 *
 * Usage: npx tsx script/smoke-check.ts [base-url]
 * Default base-url: https://noua.uk
 *
 * This exists specifically because the local build succeeding proves the
 * code compiles, not that the deploy target actually serves it correctly —
 * and because a wrong internal href (the /audit vs /booking bug) is silent
 * until something checks it against the real, live routing.
 */

const rootDir = path.resolve(import.meta.dirname, "..");
const contentDir = path.join(rootDir, "content/blog");
const baseUrl = (process.argv[2] ?? "https://noua.uk").replace(/\/$/, "");

const HREF_RE = /href="(\/[^"]*)"/g;

type Check = { name: string; ok: boolean; detail?: string };

async function fetchStatus(url: string): Promise<{ status: number; body: string }> {
  const res = await fetch(url, { redirect: "follow" });
  const body = await res.text();
  return { status: res.status, body };
}

async function checkPage(url: string, expectedTitle?: string): Promise<Check[]> {
  const checks: Check[] = [];
  let body = "";
  try {
    const res = await fetchStatus(url);
    checks.push({ name: `GET ${url}`, ok: res.status === 200, detail: `status ${res.status}` });
    body = res.body;
  } catch (err) {
    checks.push({ name: `GET ${url}`, ok: false, detail: String(err) });
    return checks;
  }

  if (expectedTitle) {
    const titleMatch = body.match(/<title>([^<]*)<\/title>/);
    const actual = titleMatch?.[1] ?? "(no <title> found)";
    checks.push({
      name: `title on ${url}`,
      ok: actual.startsWith(expectedTitle),
      detail: `expected to start with "${expectedTitle}", got "${actual}"`,
    });
  }

  return checks;
}

async function checkInternalLinks(url: string, body: string, seen: Map<string, boolean>): Promise<Check[]> {
  const checks: Check[] = [];
  const hrefs = new Set([...body.matchAll(HREF_RE)].map((m) => m[1]));
  for (const href of hrefs) {
    // /cdn-cgi/ is Cloudflare's edge-side rewrite of mailto: links (email
    // obfuscation) — not a real app route, and not directly fetchable.
    if (href.startsWith("//") || href.includes("mailto:") || href.startsWith("/cdn-cgi/")) continue;
    if (!seen.has(href)) {
      try {
        const res = await fetchStatus(baseUrl + href);
        seen.set(href, res.status === 200);
      } catch {
        seen.set(href, false);
      }
    }
    checks.push({ name: `internal link ${href} (found on ${url})`, ok: seen.get(href)! });
  }
  return checks;
}

async function main() {
  console.log(`Smoke checking ${baseUrl}\n`);
  const allChecks: Check[] = [];
  const linkStatusCache = new Map<string, boolean>();

  allChecks.push(...(await checkPage(`${baseUrl}/blog`, "Blog")));

  const files = (await readdir(contentDir)).filter((f) => f.endsWith(".md"));
  for (const file of files) {
    const raw = await readFile(path.join(contentDir, file), "utf-8");
    const { data } = matter(raw);
    const slug = file.replace(/\.md$/, "");
    const expectedTitle = (data.title as string)?.split(" | ")[0];
    const url = `${baseUrl}/blog/${slug}`;

    const pageChecks = await checkPage(url, expectedTitle);
    allChecks.push(...pageChecks);

    if (pageChecks[0]?.ok) {
      const { body } = await fetchStatus(url);
      const hasBookingCta = body.includes('href="/booking"');
      allChecks.push({ name: `${slug} has a /booking CTA`, ok: hasBookingCta });
      allChecks.push(...(await checkInternalLinks(url, body, linkStatusCache)));
    }
  }

  const failed = allChecks.filter((c) => !c.ok);
  for (const c of allChecks) {
    console.log(`${c.ok ? "PASS" : "FAIL"}  ${c.name}${c.detail ? `  (${c.detail})` : ""}`);
  }
  console.log(`\n${allChecks.length - failed.length}/${allChecks.length} checks passed.`);

  if (failed.length > 0) {
    console.log(`\n${failed.length} FAILURE(S) — do not treat this deploy as verified.`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
