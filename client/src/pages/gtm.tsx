import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { SiteShell } from "@/components/site-shell";
import { Seo } from "@/components/seo";

// Holding page until the full GTM & Growth page is designed.
const services = ["Market intelligence", "Account research", "Targeted outbound"] as const;

export default function Gtm() {
  return (
    <SiteShell>
      <Seo
        title="GTM & Growth — NOUA"
        description="Find better commercial opportunities: market intelligence, account research and targeted outbound from NOUA."
        noindex
      />
      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-10 pt-16 md:pt-24" data-testid="section-gtm-hero">
        <span className="font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">GTM &amp; Growth</span>
        <h1 className="max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl" data-testid="text-gtm-title">
          Find better commercial opportunities.
        </h1>
        <ul className="flex flex-wrap gap-2">
          {services.map((s) => (
            <li key={s} className="rounded-full border border-white/20 px-3 py-1.5 text-sm text-muted-foreground">
              {s}
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <Button asChild className="rounded-full px-6" data-testid="button-gtm-book">
            <Link href="/booking">Book a call</Link>
          </Button>
        </div>
      </section>
    </SiteShell>
  );
}
