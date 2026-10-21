import express, { type Express } from "express";
import fs from "fs";
import path from "path";

// Keep in sync with the <Route> paths registered in client/src/App.tsx.
const KNOWN_ROUTES = new Set([
  "/",
  "/ai-ops",
  "/gtm",
  "/how-we-work",
  "/who-its-for",
  "/audit",
  "/contact",
  "/booking",
  "/score",
  "/calculator",
]);

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // Fall through to index.html for client-side routing, but only report 200 for
  // routes the SPA actually handles — everything else gets a real 404 status so
  // crawlers don't treat unknown URLs as valid pages.
  // Must be app.get (not app.use) — app.use rewrites req.path relative to the
  // mount point, so every request would look like "/" here.
  app.get("/{*path}", (req, res) => {
    res
      .status(KNOWN_ROUTES.has(req.path) ? 200 : 404)
      .sendFile(path.resolve(distPath, "index.html"));
  });
}
