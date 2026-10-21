import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteShell, Section } from "@/components/site-shell";
import { Seo } from "@/components/seo";
import { Link } from "wouter";
import nouaLogo from "@assets/NOUA_LOGO_1769961415202.png";

const CALENDLY_URL = "/booking";

export default function Audit() {
  return (
    <SiteShell>
      <Seo
        title="Free AI & Operations Readiness Audit"
        description="Get a mapped view of your operational flow, bottlenecks, and AI opportunities — before you spend a dollar on implementation."
      />
      <Section
        title="See exactly where AI fits. Before spending a dollar."
        titleAs="h1"
        description="Whether you’ve explored AI before or you’re considering it for the first time, the safest way to start is a full Operations & AI Readiness Audit."
        testId="section-audit-hero"
      >
        <div className="grid gap-6 md:grid-cols-12">
          <div className="md:col-span-7">
            <div className="rounded-3xl border border-border/80 bg-card/40 p-8">
              <h3 className="text-lg font-semibold tracking-tight" data-testid="text-audit-includes-title">
                What you receive
              </h3>
              <ul className="mt-6 space-y-4 text-sm text-muted-foreground" data-testid="list-audit-includes">
                {[
                  "A mapped view of your operational flow",
                  "Identified bottlenecks",
                  "Specific AI opportunities",
                  "Systems architecure blueprint",
                  "Prioritized roadmap with measurable impact"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3" data-testid={`item-audit-${idx}`}>
                    <img 
                      src={nouaLogo} 
                      alt="NOUA Bullet" 
                      className="mt-0.5 h-4 w-4 rounded-md border border-border bg-black object-contain opacity-80"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
               
              </div>
            </div>
          </div>

          <div className="md:col-span-5">
            <div className="rounded-3xl border border-border/80 bg-card/40 p-8">
              <h3 className="text-lg font-semibold tracking-tight" data-testid="text-audit-next-title">
                What happens next
              </h3>
              <ol className="mt-6 space-y-4 text-sm text-muted-foreground" data-testid="list-audit-next">
                <li className="flex gap-3" data-testid="row-audit-next-1">
                  <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full border border-border/80 bg-background/20 text-xs text-foreground" data-testid="badge-audit-next-1">
                    1
                  </span>
                  <span data-testid="text-audit-next-1">Fill out a 2-minute form.</span>
                </li>
                <li className="flex gap-3" data-testid="row-audit-next-2">
                  <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full border border-border/80 bg-background/20 text-xs text-foreground" data-testid="badge-audit-next-2">
                    2
                  </span>
                  <span data-testid="text-audit-next-2"> Schedule a call.</span>
                </li>
                <li className="flex gap-3" data-testid="row-audit-next-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full border border-border/80 bg-background/20 text-xs text-foreground" data-testid="badge-audit-next-3">
                    3
                  </span>
                  <span data-testid="text-audit-next-3">You receive your complete audit within 72 hours.</span>
                </li>
              </ol>
              <div className="mt-8">
                <Button asChild className="w-full rounded-full" data-testid="button-audit-book-2">
                  <Link href={CALENDLY_URL}>I'm Ready</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </SiteShell>
  );
}
