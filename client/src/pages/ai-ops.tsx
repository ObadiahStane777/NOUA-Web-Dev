import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteShell, Section } from "@/components/site-shell";
import { Seo } from "@/components/seo";
import { Link } from "wouter";
import { TowerField } from "@/components/tower-field";
import { WaterTrail } from "@/components/water-trail";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { OpsSystemDiagram } from "@/components/ops-system-diagram";
import { ServicesSelector } from "@/components/services-selector";
import { EngagementTimeline } from "@/components/engagement-timeline";
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
  "Projects move forward seamlessly",
  "Revenue grows faster than headcount",
  "Issues caught and resolved before they become fires",
] as const;

// DRAFT COPY for the three services: built from the existing page and the brief.
const services = [
  {
    name: "Consulting",
    line: "Find what's slowing you down.",
    body: "We map every workflow, handoff and decision point, show you where time and money leak, and fix the process before anything gets automated.",
    tags: ["Workflow audit", "Bottleneck identification", "Process design"],
  },
  {
    name: "AI implementation",
    line: "Build systems that do the work.",
    body: "AI team members and automations layered on a controlled foundation, so quotes, specs and follow-ups move without someone chasing them. ROI tracked from the start.",
    tags: ["AI team members", "Automations", "ROI tracking"],
  },
  {
    name: "Team enablement",
    line: "Make sure your team uses it.",
    body: "We train your team on AI and on the systems we've built, so they can run them, improve them and keep the gains after we hand over.",
    tags: ["Team training", "AI skills", "Handover"],
  },
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
  const heroRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  useScrollReveal(pageRef);
  return (
    <SiteShell>
      <div ref={pageRef}>
      <Seo
        title="NOUA — AI Operations Consulting"
        description="We find costly problems in complex, project-based businesses — slow quotes, dropped handoffs, manual work — and fix them with AI."
      />
      <WaterTrail startRef={heroRef} endRef={ctaRef} />
      <section ref={heroRef} className="relative flex min-h-[90vh] touch-pan-y items-end overflow-hidden md:items-center" data-testid="section-hero">
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
        <div className="grid gap-3 rounded-3xl border border-border/80 bg-card/40 p-6 md:grid-cols-2 lg:grid-cols-4" data-testid="row-hero-gains" data-reveal>
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
        title="Sound familiar?"
        description="Teams who want AI to create measurable gains without adding complexity."
        testId="section-clients"
      >
        <div className="grid gap-6 md:grid-cols-2" data-reveal-stagger>
          {clients.map((c) => (
            <div key={c.title} className="rounded-3xl border border-border/80 bg-card/40 p-8" data-testid={`card-client-${c.title.replaceAll(" ", "-").toLowerCase()}`}>
              <h3 className="text-lg font-semibold tracking-tight">{c.title}</h3>
              <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                {c.items.map((i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/70" />
                    <span>{i}</span>
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
        title="Three ways we work."
        description="Consulting to find what's slowing you down, AI implementation to fix it, and team enablement so your people keep the gains."
        testId="section-services"
      >
        <ServicesSelector
          services={services}
          idPrefix="service"
          diagram={(active) => <OpsSystemDiagram mode={active} className="block h-[440px] w-full sm:h-[300px] md:h-[340px]" />}
        />
      </Section>

      <div className="mx-auto max-w-6xl px-6" aria-hidden>
        <div className="hairline h-px w-full" />
      </div>

      <Section
        title="How an engagement runs."
        description="Most AI implementations fail because the operations underneath are broken. We fix the foundation first, then build, then make sure your team can run it."
        testId="section-how-it-works"
      >
        <EngagementTimeline />
        <p className="mt-12 text-center text-sm text-muted-foreground" data-reveal>
          Engagements run 6–12 weeks. <span className="text-white">Operational clarity delivered in the first 10 days.</span>
        </p>
      </Section>

      <div className="mx-auto max-w-6xl px-6" aria-hidden>
        <div className="hairline h-px w-full" />
      </div>

      <Section
        title="What you gain"
        description="Your business becomes easier to run. You stop being the bottleneck. Your team operates independently. AI amplifies what's already working."
        testId="section-gains"
      >
        <div className="grid gap-6 md:grid-cols-12" data-reveal-stagger>
          <div className="md:col-span-7">
            <div className="grid h-full gap-3 rounded-3xl border border-border/80 bg-card/40 p-8 sm:grid-cols-2">
              {outcomeGains.map((g) => (
                <div key={g} className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background/20 p-4" data-testid={`card-gain-${g.replaceAll(" ", "-").toLowerCase()}`}>
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-foreground" strokeWidth={2.2} />
                  <p className="text-sm text-white">{g}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:col-span-5">
            <div ref={ctaRef} className="flex h-full flex-col justify-between rounded-3xl border border-border/80 bg-card/40 p-6">
              <div>
                <h3 className="mt-2 text-xl font-semibold tracking-tight" data-testid="text-gains-cta-title">
                  Start with a Free Operations & AI Readiness Audit
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground" data-testid="text-gains-cta-body">
                  You receive an overview of your operational flow, identified bottlenecks and recommended AI opportunities with measurable ROI.
                </p>
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

        <Link
          href="/gtm"
          className="group mt-6 flex flex-col gap-2 rounded-3xl border border-border/80 bg-card/40 p-6 transition-colors hover:border-white/25 md:flex-row md:items-center md:justify-between md:p-8"
          data-reveal
          data-testid="link-ai-ops-gtm"
        >
          <span>
            <span className="block text-lg font-semibold tracking-tight text-white">Need more of the right work?</span>
            <span className="mt-1 block text-sm text-muted-foreground">
              GTM &amp; Growth finds better commercial opportunities: market intelligence, account research and targeted outbound.
            </span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-white">
            Explore GTM &amp; Growth <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      </Section>
      </div>
    </SiteShell>
  );
}
