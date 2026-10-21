import * as React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteShell, Section } from "@/components/site-shell";
import { Seo } from "@/components/seo";
import { Link } from "wouter";

const CALENDLY_URL = "/booking";

const steps = [
  {
    title: "Workflow Mapping Snapshot",
    desc: "A clear view of how your core processes actually run today, showing friction points, handoff gaps, duplicated steps, and structural weaknesses.",
  },
  {
    title: "Operational Intelligence Assessment",
    desc: "An evaluation of workflow clarity, data flow, decision points, tool dependencies, failure points, and scalability. This reveals why previous workflows broke or where new AI might fail.",
  },
  {
    title: "Prioritized AI & Automation Opportunities",
    desc: "A practical view of where AI will create measurable gains in time, cost, team capacity, throughput, and stability. The recommendations are specific, not vague.",
  },
  {
    title: "Systems Architecture Blueprint",
    desc: "A simple system blueprint showing the operational structure required for AI to work reliably inside your business.",
  },
  {
    title: "AI implementation",
    desc: "We set up the systems, structures, and connections so AI keeps working reliably as your team and operations grow.",
  },
  {
    title: "Continuous Improvement",
    desc: "We don't launch and leave. We monitor, refine, and scale everything to keep operations efficient and AI productive.",
  },
] as const;

type Step = (typeof steps)[number];

function TimelineNode({
  step,
  idx,
  side,
}: {
  step: Step;
  idx: number;
  side: "up" | "down";
}) {
  const labelId = React.useId();

  return (
    <div
      className="group relative flex flex-col items-center"
      style={{
        animationDelay: `${220 + idx * 110}ms`,
      }}
      data-testid={`node-step-${idx}`}
    >
      <div
        className={
          "timeline-stem " +
          (side === "up" ? "timeline-stem-up" : "timeline-stem-down")
        }
        style={{ animationDelay: `${320 + idx * 110}ms` }}
        aria-hidden="true"
        data-testid={`line-stem-${idx}`}
      />

      <button
        type="button"
        className={
          "timeline-node " +
          (side === "up" ? "timeline-node-up" : "timeline-node-down")
        }
        aria-describedby={labelId}
        data-testid={`button-node-${idx}`}
      >
        <span className="timeline-node-inner" aria-hidden="true" />
        <span className="sr-only">{step.title}</span>
      </button>

      <div
        className={
          "timeline-title " + (side === "up" ? "timeline-title-up" : "timeline-title-down")
        }
        data-testid={`text-node-title-${idx}`}
      >
        {step.title}
      </div>

      <div
        className={
          "timeline-card " + (side === "up" ? "timeline-card-up" : "timeline-card-down")
        }
        role="tooltip"
        id={labelId}
        data-testid={`card-node-${idx}`}
      >
        <p className="timeline-card-desc" data-testid={`text-card-desc-${idx}`}>
          {step.desc}
        </p>
      </div>
    </div>
  );
}

export default function HowWeWork() {
  return (
    <SiteShell>
      <Seo
        title="How We Work"
        description="A 6-step, systems-first engagement: map your workflows, fix the gaps, then layer AI so it's reliable, measurable, and built to scale."
      />
      <Section
        title="Our approach is structured around long-term stability."
        titleAs="h1"
        description="A systems-first engagement that makes AI reliable, measurable, and sustainable inside your operations."
        testId="section-howwework-hero"
      >
        <div className="relative overflow-hidden rounded-3xl bg-transparent px-6 py-10 md:px-10 md:pt-[190px] md:pb-[190px]">
          <div
            className="pointer-events-none absolute inset-0 opacity-90 hidden md:block"
            aria-hidden="true"
          >
            <div className="absolute inset-0 timeline-oval-glow" />
          </div>

          {/* Mobile Roadmap View */}
          <div className="relative md:hidden mt-4 space-y-10">
            <div className="absolute left-[19px] top-4 bottom-4 w-px bg-gradient-to-b from-border/0 via-border to-border/0" />
            
            {steps.map((step, idx) => (
              <div key={idx} className="relative pl-14">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 backdrop-blur-sm text-sm font-semibold shadow-sm z-10">
                  {idx + 1}
                </div>
                
                <div className="group relative rounded-2xl border border-border/60 bg-card/30 p-6 backdrop-blur-sm transition-colors hover:bg-card/50 hover:border-border/80">
                  <h3 className="text-lg font-semibold text-foreground mb-3 leading-tight">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Curved Timeline View */}
          <div className="relative ml-[80px] mr-[80px] pl-[0px] pr-[0px] hidden md:block">
            <div className="absolute left-0 right-0 top-[-105px]" data-testid="wrap-curve">
              <div className="timeline-curve-wrap mt-[70px] mb-[70px]" data-testid="wrap-curve-inner" />
            </div>

            <div
              className="mt-10 grid grid-cols-6 items-center"
              data-testid="grid-timeline"
            >
              {steps.map((s, idx) => (
                <TimelineNode
                  key={s.title}
                  step={s}
                  idx={idx}
                  side={idx % 2 === 0 ? "down" : "up"}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-center w-full">
          <Button asChild className="rounded-full px-6" data-testid="button-howwework-start-audit">
            <Link href={CALENDLY_URL}>
              Audit My Systems <ArrowRight className="ml-1" />
            </Link>
          </Button>
        </div>
      </Section>
    </SiteShell>
  );
}
