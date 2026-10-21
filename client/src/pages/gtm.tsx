import { useRef } from "react";
import { Link } from "wouter";
import { ArrowRight, Radar, ScanSearch, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteShell, Section } from "@/components/site-shell";
import { Seo } from "@/components/seo";
import { GtmSearchlight } from "@/components/gtm-searchlight";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

// DRAFT COPY: written from the brief (market intelligence, account research, targeted outbound;
// "find better commercial opportunities", not marketing). No stats, clients or results are claimed.

const problems = [
  {
    title: "Your pipeline depends on referrals",
    body: "Good months and quiet months, with little control over which is which.",
  },
  {
    title: "Outbound gets ignored",
    body: "Generic lists and templated emails that prospects have learned to delete.",
  },
  {
    title: "You're not sure where to go next",
    body: "New markets and segments look promising, but nobody has done the research to prove it.",
  },
] as const;

const services = [
  {
    n: "01",
    icon: Radar,
    name: "Market intelligence",
    body: "Where should you be selling? We map your market: the segments, competitors and buying signals that show where demand is and where you're missing out.",
    tags: ["Market mapping", "Competitor landscape", "Buying signals"],
  },
  {
    n: "02",
    icon: ScanSearch,
    name: "Account research",
    body: "Who exactly should you approach? A researched shortlist of target accounts and the people inside them, with the context to open a relevant conversation.",
    tags: ["Ideal customer profile", "Target account lists", "Decision-makers"],
  },
  {
    n: "03",
    icon: Send,
    name: "Targeted outbound",
    body: "How do you reach them? Personal outreach to a short list, not mass email. Messaging and follow-up built around each account.",
    tags: ["Messaging", "Outreach sequences", "Follow-up"],
  },
] as const;

export default function Gtm() {
  const pageRef = useRef<HTMLDivElement>(null);
  const heroCopyRef = useRef<HTMLDivElement>(null);
  useScrollReveal(pageRef);

  return (
    <SiteShell>
      <Seo
        title="GTM & Growth — NOUA"
        description="Find better commercial opportunities: market intelligence, account research and targeted outbound from NOUA."
        noindex
      />
      <div ref={pageRef}>
        <section className="relative h-[clamp(600px,88vh,900px)] touch-pan-y overflow-hidden" data-testid="section-gtm-hero">
          <GtmSearchlight avoidRef={heroCopyRef} />
          <div className="pointer-events-none relative z-10 mx-auto max-w-6xl px-6 pt-10 md:pt-24">
            <div ref={heroCopyRef} className="grid justify-items-start gap-5">
              <span className="font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">GTM &amp; Growth</span>
              <h1
                className="max-w-[20ch] text-4xl font-semibold leading-[1.05] tracking-tight md:text-5xl xl:max-w-none xl:text-6xl"
                data-testid="text-gtm-title"
              >
                Find better commercial opportunities.
              </h1>
              <p className="max-w-xl text-lg text-muted-foreground" data-testid="text-gtm-subtitle">
                Market intelligence, account research and targeted outbound.
              </p>
              <Button asChild variant="outline" className="pointer-events-auto rounded-full bg-background/40 px-6" data-testid="button-gtm-hero-book">
                <Link href="/booking">Book a call</Link>
              </Button>
            </div>
          </div>
          <p
            className="pointer-events-none absolute bottom-6 right-6 z-10 hidden font-mono text-[11px] uppercase tracking-[0.08em] text-white/45 md:block"
            aria-hidden="true"
          >
            Move across the landscape
          </p>
        </section>

        <Section
          title="Not more marketing. Better targets."
          description="Most growth spend goes on reaching more people. We help you find the right ones: the markets, accounts and decision-makers most likely to buy, and the best way to reach them."
          testId="section-gtm-problems"
        >
          <div className="grid gap-6 md:grid-cols-3" data-reveal-stagger>
            {problems.map((p) => (
              <div key={p.title} className="rounded-3xl border border-border/80 bg-card/40 p-8">
                <h3 className="text-lg font-semibold tracking-tight">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </div>
            ))}
          </div>
        </Section>

        <div className="mx-auto max-w-6xl px-6" aria-hidden>
          <div className="hairline h-px w-full" />
        </div>

        <Section
          title="From market to conversation."
          description="Three services that work on their own or in sequence: find where to sell, who to approach, and how to reach them."
          testId="section-gtm-services"
        >
          <div
            className="hide-scrollbar -mx-6 flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-6 md:mx-0 md:grid md:grid-cols-3 md:px-0 md:pb-0"
            data-reveal-stagger
          >
            {services.map((s) => (
              <div
                key={s.name}
                className="group relative flex h-full min-w-[300px] snap-center flex-col overflow-hidden rounded-2xl border-[0.5px] border-white/10 bg-[rgba(255,255,255,0.03)] p-8 transition-colors hover:border-white/20 hover:bg-[rgba(255,255,255,0.05)] md:min-w-0"
              >
                <div className="absolute left-0 top-0 h-[2px] w-full bg-white/30 transition-colors group-hover:bg-white/60" />
                <div className="mb-8 flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{s.n}</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-[0.5px] border-white/10 bg-white/5">
                    <s.icon className="h-4 w-4 text-white" />
                  </div>
                </div>
                <h3 className="mb-4 text-xl font-semibold text-white">{s.name}</h3>
                <p className="mb-10 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                <div className="mt-auto flex flex-wrap gap-2">
                  {s.tags.map((t) => (
                    <span key={t} className="rounded-full border-[0.5px] border-white/20 px-3 py-1.5 text-xs text-muted-foreground">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <div className="mx-auto max-w-6xl px-6" aria-hidden>
          <div className="hairline h-px w-full" />
        </div>

        <Section
          title="Opportunities need somewhere to go."
          description="Finding better opportunities only pays off if your team can handle them. Pair GTM with AI Operations so new enquiries land in systems built to cope: faster quotes, clean handoffs, nothing dropped."
          testId="section-gtm-ai-ops"
        >
          <div className="grid gap-6 md:grid-cols-12" data-reveal-stagger>
            <div className="flex flex-col justify-between gap-6 rounded-3xl border border-border/80 bg-card/40 p-8 md:col-span-7">
              <div>
                <h3 className="text-xl font-semibold tracking-tight">AI Operations</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Consulting, AI implementation and team enablement, to improve how your business works.
                </p>
              </div>
              <Link href="/ai-ops" className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:underline" data-testid="link-gtm-ai-ops">
                Explore AI Operations <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="flex flex-col justify-between gap-6 rounded-3xl border border-border/80 bg-card/40 p-8 md:col-span-5">
              <div>
                <h3 className="text-xl font-semibold tracking-tight">Start with a conversation</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Tell us who you sell to. We'll show you where we'd look first.
                </p>
              </div>
              <Button asChild className="w-full rounded-full" data-testid="button-gtm-book">
                <Link href="/booking">Book a call</Link>
              </Button>
            </div>
          </div>
        </Section>
      </div>
    </SiteShell>
  );
}
