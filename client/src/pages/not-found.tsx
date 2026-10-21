import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Seo } from "@/components/seo";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo title="Page Not Found" description="This page doesn't exist." noindex />
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="rounded-3xl border border-border bg-card p-10 shadow-sm">
          <p className="text-sm text-muted-foreground" data-testid="text-notfound-eyebrow">
            404
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl" data-testid="text-notfound-title">
            Page not found.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground" data-testid="text-notfound-subtitle">
            The page youre looking for doesnt exist.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild className="rounded-full px-6" data-testid="button-notfound-home">
              <Link href="/">Back to Home</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-full px-6"
              data-testid="button-notfound-audit"
            >
              <Link href="/audit">Book Audit</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
