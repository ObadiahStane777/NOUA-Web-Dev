import { ArrowRight, CheckCircle2, Scan, Wrench, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteShell, Section } from "@/components/site-shell";
import { Seo } from "@/components/seo";
import { Link } from "wouter";
import { TowerField } from "@/components/tower-field";
import { useState, useEffect, useRef } from "react";

const SCORE_URL = "/score";

const clients = [
  {
    title: "Quotes and specs slow you down",
    items: [
      "Every quote takes longer than it should",
      "Specs get lost between sales and production",
      "You're chasing suppliers for updates",
      "No one has the full picture from enquiry to delivery",
    ],
  },
  {
    title: "You've outgrown your systems",
    items: [
      "More projects just means more chaos",
      "Every job starts from scratch, nothing's templated",
      "Details get dropped between handoffs",
      "You're too busy running projects to fix how you run them",
    ],
  },
] as const;

const heroGains = [
  "Operational clarity in 10 days",
  "Systems built to scale",
  "ROI calculated before build starts",
  "24/7 system monitoring",
] as const;

const outcomeGains = [
  "Your team operates independently",
  "Projects move forward seemlessly",
  "Revenue grows faster than headcount",
  "Issues caught and resolved before they become fires",
] as const;

const foundationPoints = [
  "Stabilize workflows and handoffs",
  "Design operational systems and structure",
  "Implement AI automation with governance",
  "Measure impact on time, cost, and capacity",
] as const;

const RotatingSubheading = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const lines = [
    <>Founders <span className="text-foreground">recover 7+ hours a week</span>.</>,
    <>Quote-to-close time <span className="text-foreground">drops by up to 60%</span>.</>,
    <>Manual tasks that consumed your team's day <span className="text-foreground">eliminated, not delegated</span>.</>,
    <>Handle <span className="text-foreground">2× the volume without increasing headcount</span>.</>
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % lines.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mt-6 flex flex-col gap-4">
      <div className="relative h-[4rem] overflow-hidden text-base md:text-lg">
        {lines.map((line, index) => (
          <div
            key={index}
            className="absolute left-0 top-0 w-full transition-all duration-500 ease-in-out"
            style={{
              transform: `translateY(${(index - currentIndex) * 100}%)`,
              opacity: index === currentIndex ? 1 : 0,
            }}
          >
            <p className="max-w-2xl leading-relaxed text-muted-foreground">
              {line}
            </p>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-2" aria-hidden="true">
        {lines.map((_, index) => (
          <div
            key={index}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              index === currentIndex ? "w-6 bg-foreground" : "w-1.5 bg-foreground/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default function AiOps() {
  const heroCopyRef = useRef<HTMLDivElement>(null);
  return (
    <SiteShell>
      <Seo
        title="NOUA — AI Operations Consulting"
        description="We find costly problems in complex, project-based businesses — slow quotes, dropped handoffs, manual work — and fix them with AI."
      />
      <section className="relative flex min-h-[90vh] touch-pan-y items-end overflow-hidden md:items-center" data-testid="section-hero">
        <TowerField avoidRef={heroCopyRef} />
        {/* Phones: fade the tower behind the text */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background from-20% via-background/70 via-40% to-transparent to-65% md:hidden" />
        <div className="pointer-events-none relative z-10 mx-auto w-full max-w-6xl px-6 py-14 md:py-20">
          <div ref={heroCopyRef} className="max-w-xl">
            <h1
              className="text-4xl font-semibold leading-[1.05] tracking-tight md:text-5xl"
              data-testid="text-hero-title"
            >More volume. Same team.</h1>

            <div className="mt-6">
              <RotatingSubheading />
            </div>

            <div className="pointer-events-auto mt-10 flex flex-wrap items-center gap-3">
              <Button asChild variant="outline" className="rounded-full bg-background/40 px-6" data-testid="button-hero-qualify">
                <Link href={SCORE_URL}>
                  See if you qualify
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <p className="pointer-events-none absolute bottom-6 right-6 z-10 hidden font-mono text-[11px] uppercase tracking-[0.08em] text-white/45 md:block" aria-hidden="true">
          Move across the tower · click to send a shockwave
        </p>
      </section>

      <div className="mx-auto max-w-6xl px-6 pt-12">
        <div className="grid gap-3 rounded-3xl border border-border/80 bg-card/40 p-6 md:grid-cols-2 lg:grid-cols-4" data-testid="row-hero-gains">
          {heroGains.map((g) => (
            <div key={g} className="flex items-start gap-3" data-testid={`row-hero-gain-${g.replaceAll(" ", "-").toLowerCase()}`}>
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-foreground shrink-0" strokeWidth={2.2} />
              <p className="text-sm text-[#ffffff]" data-testid={`text-hero-gain-${g.replaceAll(" ", "-").toLowerCase()}`}>
                {g}
              </p>
            </div>
          ))}
        </div>
      </div>
      <Section
        eyebrow="HOW IT WORKS"
        title="Rebuild the foundation."
        description="Most AI implementations fail because the operations underneath are broken. We fix the foundation before we build anything."
        testId="section-how-it-works"
      >
        <div className="relative">
          {/* Connector line for desktop */}
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[1px] bg-white/10 z-0">
            <div className="absolute -right-1 top-1/2 -translate-y-1/2">
              <ArrowRight className="h-3 w-3 text-white/40" />
            </div>
          </div>

          <div className="flex md:grid overflow-x-auto snap-x snap-mandatory pb-6 -mx-6 px-6 md:mx-0 md:px-0 md:pb-0 gap-6 md:grid-cols-3 relative z-10 hide-scrollbar">
            {/* Step 01 */}
            <div className="group relative overflow-hidden rounded-2xl border-[0.5px] border-white/10 bg-[rgba(255,255,255,0.03)] p-8 backdrop-blur-sm transition-colors hover:border-white/20 hover:bg-[rgba(255,255,255,0.05)] flex flex-col h-full min-w-[300px] md:min-w-0 snap-center">
              <div className="absolute left-0 top-0 h-[2px] w-full bg-white/30 transition-colors group-hover:bg-white/60" />
              <div className="mb-8 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">01</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-[0.5px] border-white/10 bg-white/5">
                  <Scan className="h-4 w-4 text-white" />
                </div>
              </div>
              <h3 className="mb-4 text-xl font-semibold text-white">Map</h3>
              <p className="mb-10 text-sm leading-relaxed text-muted-foreground">
                We walk every workflow, handoff, and decision point. No assumptions. Every bottleneck documented.
              </p>
              <div className="mt-auto flex flex-wrap gap-2">
                <span className="rounded-full border-[0.5px] border-white/20 px-3 py-1.5 text-xs text-muted-foreground">Workflow audit</span>
                <span className="rounded-full border-[0.5px] border-white/20 px-3 py-1.5 text-xs text-muted-foreground">Bottleneck Identification</span>
                <span className="rounded-full border-[0.5px] border-white/20 px-3 py-1.5 text-xs text-muted-foreground">Cost of chaos</span>
              </div>
            </div>

            {/* Step 02 */}
            <div className="group relative overflow-hidden rounded-2xl border-[0.5px] border-white/10 bg-[rgba(255,255,255,0.03)] p-8 backdrop-blur-sm transition-colors hover:border-white/20 hover:bg-[rgba(255,255,255,0.05)] flex flex-col h-full min-w-[300px] md:min-w-0 snap-center">
              <div className="absolute left-0 top-0 h-[2px] w-full bg-white/30 transition-colors group-hover:bg-white/60" />
              <div className="mb-8 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">02</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-[0.5px] border-white/10 bg-white/5">
                  <Wrench className="h-4 w-4 text-white" />
                </div>
              </div>
              <h3 className="mb-4 text-xl font-semibold text-white">Fix</h3>
              <p className="mb-10 text-sm leading-relaxed text-muted-foreground">
                We remove the places where staff make it up as they go. Processes documented, decisions standardised.
              </p>
              <div className="mt-auto flex flex-wrap gap-2">
                <span className="rounded-full border-[0.5px] border-white/20 px-3 py-1.5 text-xs text-muted-foreground">SOPs</span>
                <span className="rounded-full border-[0.5px] border-white/20 px-3 py-1.5 text-xs text-muted-foreground">Decision logic</span>
                <span className="rounded-full border-[0.5px] border-white/20 px-3 py-1.5 text-xs text-muted-foreground">Role clarity</span>
              </div>
            </div>

            {/* Step 03 */}
            <div className="group relative overflow-hidden rounded-2xl border-[0.5px] border-white/10 bg-[rgba(255,255,255,0.03)] p-8 backdrop-blur-sm transition-colors hover:border-white/20 hover:bg-[rgba(255,255,255,0.05)] flex flex-col h-full min-w-[300px] md:min-w-0 snap-center">
              <div className="absolute left-0 top-0 h-[2px] w-full bg-white/30 transition-colors group-hover:bg-white/60" />
              <div className="mb-8 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">03</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-[0.5px] border-white/10 bg-white/5">
                  <Cpu className="h-4 w-4 text-white" />
                </div>
              </div>
              <h3 className="mb-4 text-xl font-semibold text-white">Build</h3>
              <p className="mb-10 text-sm leading-relaxed text-muted-foreground">
                AI team members and automations layered on a controlled foundation. Systems that scale without adding headcount.
              </p>
              <div className="mt-auto flex flex-wrap gap-2">
                <span className="rounded-full border-[0.5px] border-white/20 px-3 py-1.5 text-xs text-muted-foreground">AI Team Members</span>
                <span className="rounded-full border-[0.5px] border-white/20 px-3 py-1.5 text-xs text-muted-foreground">Automations</span>
                <span className="rounded-full border-[0.5px] border-white/20 px-3 py-1.5 text-xs text-muted-foreground">ROI tracking</span>
              </div>
            </div>
          </div>
          
          <div className="mt-10 text-center">
            <p className="text-sm text-muted-foreground">
              Engagements run 6–12 weeks. <span className="text-white">Operational clarity delivered in the first 10 days.</span>
            </p>
          </div>
        </div>
      </Section>
      <div className="mx-auto max-w-6xl px-6" aria-hidden>
        <div className="hairline h-px w-full" />
      </div>
      <Section
        eyebrow="Clients"
        title="Clients we serve"
        description="Teams who want AI to create measurable gains without adding complexity."
        testId="section-clients"
      >
        <div className="grid gap-6 md:grid-cols-2">
          {clients.map((c) => (
            <div key={c.title} className="rounded-3xl border border-border/80 bg-card/40 p-8" data-testid={`card-client-${c.title.replaceAll(" ", "-").toLowerCase()}`}>
              <h3 className="text-lg font-semibold tracking-tight" data-testid={`text-client-title-${c.title.replaceAll(" ", "-").toLowerCase()}`}>
                {c.title}
              </h3>
              <ul className="mt-6 space-y-3 text-sm text-muted-foreground" data-testid={`list-client-${c.title.replaceAll(" ", "-").toLowerCase()}`}>
                {c.items.map((i) => (
                  <li key={i} className="flex items-start gap-3" data-testid={`row-client-${i.replaceAll(" ", "-").toLowerCase()}`}>
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/70" />
                    <span data-testid={`text-client-item-${i.replaceAll(" ", "-").toLowerCase()}`}>{i}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>
      <div className="mx-auto max-w-6xl px-6" aria-hidden>
        <div className="hairline h-px w-full" />
      </div>
      <Section
        eyebrow="Outcomes"
        title="What you gain"
        description="Your business becomes easier to run. You stop being the bottleneck. Your team operates independently. AI amplifies what’s already working."
        testId="section-gains"
      >
        <div className="grid gap-6 md:grid-cols-12">
          <div className="md:col-span-7">
            <div className="rounded-3xl border border-border/80 bg-card/40 p-8 h-full">
              <p className="text-base leading-relaxed text-muted-foreground" data-testid="text-gains-body">
               
              </p>
              <div className="mt-8 grid gap-3 md:grid-cols-2">
                {outcomeGains.map((g) => (
                  <div key={g} className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background/20 p-4" data-testid={`card-gain-${g.replaceAll(" ", "-").toLowerCase()}`}>
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-foreground" strokeWidth={2.2} />
                    <p className="text-sm text-[#ffffff]" data-testid={`text-gain-${g.replaceAll(" ", "-").toLowerCase()}`}>
                      {g}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-5 flex flex-col">
            <div className="rounded-3xl border border-border/80 bg-card/40 p-6 h-full flex flex-col justify-between">
              <div>
                <h3 className="mt-2 text-xl font-semibold tracking-tight" data-testid="text-gains-cta-title">
                  Start with a Free Operations & AI Readiness Audit
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground" data-testid="text-gains-cta-body">You receive an overview of your operational flow, identified bottlenecks and recommended AI opportunities with measurable ROI.</p>
              </div>
              <div className="mt-6 space-y-3">
                <Button asChild className="w-full rounded-full" data-testid="button-gains-audit">
                  <Link href={SCORE_URL}>Start Your Readiness Assessment</Link>
                </Button>
                <p className="text-xs text-muted-foreground" data-testid="text-gains-cta-footnote">
                  Get clarity and confidence before committing to any implementation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </SiteShell>
  );
}
