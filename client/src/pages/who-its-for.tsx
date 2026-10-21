import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteShell, Section } from "@/components/site-shell";
import { Seo } from "@/components/seo";
import { Link } from "wouter";

const SCORE_URL = "/score";

const fit = [
  {
    title: "You've tried automation, but it broke",
    desc: "We map the real workflow, stabilize the structure, and rebuild with reliability and reporting."
  },
  {
    title: "You want measurable gains, not demos",
    desc: "Time saved, bottlenecks removed, and capacity created, tracked against outcomes."
  },
  {
    title: "You want AI embedded into operations",
    desc: "Not surface-level tools. We design the operational intelligence layer underneath."
  },
  {
    title: "You're worried about complexity",
    desc: "Governance, clarity, and architecture come first so AI reduces load rather than adding it."
  },
] as const;

const notFor = [
  "Early-stage businesses still defining their workflows",
  "Teams wanting quick fixes or \"AI hacks\", one-off automation projects with no system beneath them",
  "Businesses unwilling to adopt structured operations, environments where firefighting is normal and systems aren't valued",
  "Teams who want tools installed but aren't ready for foundational change",
] as const;

export default function WhoItsFor() {
  return (
    <SiteShell>
      <Seo
        title="Who It's For"
        description="See if NOUA is the right fit: for teams ready to scale operations with AI, not those looking for quick fixes or one-off automations."
      />
      <Section
        title="Who it's for"
        titleAs="h1"
        description="Business who want AI to become a stable part of operations, not another tool to manage."
        testId="section-fit"
      >
        <div className="grid gap-6 md:grid-cols-2">
          {fit.map((f, idx) => (
            <div
              key={f.title}
              className="rounded-3xl border border-border/80 bg-card/40 p-8"
              data-testid={`card-fit-${idx}`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground" data-testid={`text-fit-label-${idx}`}>
                {String(idx + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-4 text-lg font-semibold tracking-tight" data-testid={`text-fit-title-${idx}`}>
                {f.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground" data-testid={`text-fit-desc-${idx}`}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 md:mt-12">
          <Section
            title="Who we're not for"
            testId="section-notfor"
          >
             <div className="grid gap-6 md:grid-cols-12">
              <div className="md:col-span-12">
                <div className="rounded-3xl border border-border/80 bg-card/40 p-8">
                  <ul className="space-y-3 text-foreground text-[15px]" data-testid="list-notfor">
                    {notFor.map((i, idx) => (
                      <li key={i} className="flex items-start gap-3" data-testid={`row-notfor-${idx}`}>
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/70" />
                        <span data-testid={`text-notfor-${idx}`}>{i}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 pt-6 border-t border-border/40">
                    <p className="text-sm leading-relaxed text-muted-foreground" data-testid="text-notfor-why-body">
                      Note: The only way AI creates real impact is when it's built on structure, mapped workflows, and clean operational foundations.
                      If that's not your focus right now, NOUA won't be the right partner yet.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Section>
        </div>

        <div className="mt-12 rounded-3xl border border-border/80 bg-card/40 p-8">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground" data-testid="text-fit-cta-eyebrow">
                Next step
              </p>
              <h3 className="mt-4 text-xl font-semibold tracking-tight" data-testid="text-fit-cta-title">
                Start with an AI Operations Audit
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground" data-testid="text-fit-cta-body">
                Get clarity on your workflow flow, bottlenecks, and the foundations required for AI to work reliably.
              </p>
            </div>
            <Button asChild className="rounded-full px-6" data-testid="button-fit-cta">
              <a href={SCORE_URL}>
               Start Assessment <ArrowRight className="ml-1" />
              </a>
            </Button>
          </div>
        </div>
      </Section>
    </SiteShell>
  );
}
