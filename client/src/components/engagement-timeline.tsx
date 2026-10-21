import { useEffect, useRef } from "react";
import { Cpu, GraduationCap, Scan, Wrench } from "lucide-react";

/**
 * The four steps of an AI Ops engagement. A line fills as the visitor scrolls through the section
 * and each step lights up as the line reaches it (GSAP ScrollTrigger, loaded on demand).
 * Fully visible without script or under reduced motion.
 */

const steps = [
  {
    icon: Scan,
    name: "Map",
    body: "We walk every workflow, handoff and decision point. No assumptions. Every bottleneck documented.",
    tags: ["Workflow audit", "Bottleneck identification", "Cost of chaos"],
  },
  {
    icon: Wrench,
    name: "Fix",
    body: "We remove the places where staff make it up as they go. Processes documented, decisions standardised.",
    tags: ["SOPs", "Decision logic", "Role clarity"],
  },
  {
    icon: Cpu,
    name: "Build",
    body: "AI team members and automations layered on a controlled foundation. Systems that scale without adding headcount.",
    tags: ["AI team members", "Automations", "ROI tracking"],
  },
  {
    icon: GraduationCap,
    name: "Enable",
    body: "We train your team on AI and on the systems we've built, so the gains last after we hand over.",
    tags: ["Team training", "AI skills", "Handover"],
  },
] as const;

export function EngagementTimeline() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let revert: (() => void) | null = null;
    let cancelled = false;
    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const mm = gsap.matchMedia();
      mm.add(
        "(prefers-reduced-motion: no-preference)",
        () => {
          const fill = root.querySelector<HTMLElement>("[data-line-fill]");
          const items = gsap.utils.toArray<HTMLElement>("[data-step]", root);
          const desktop = window.matchMedia("(min-width: 768px)").matches;
          if (!fill) return;
          const light = (progress: number) =>
            items.forEach((el, i) => {
              el.style.opacity = progress >= (i / (items.length - 1)) * 0.97 ? "1" : "0.35";
            });
          light(0);
          gsap.fromTo(
            fill,
            desktop ? { scaleX: 0 } : { scaleY: 0 },
            {
              ...(desktop ? { scaleX: 1 } : { scaleY: 1 }),
              ease: "none",
              scrollTrigger: {
                trigger: root,
                start: "top 75%",
                end: "bottom 60%",
                scrub: 0.6,
                onUpdate: (self) => light(self.progress),
              },
            },
          );
          return () => items.forEach((el) => (el.style.opacity = ""));
        },
        root,
      );
      revert = () => mm.revert();
    });
    return () => {
      cancelled = true;
      revert?.();
    };
  }, []);

  return (
    <div ref={rootRef} className="relative">
      {/* Track: horizontal on desktop, vertical on phones */}
      <div className="absolute left-[15px] top-2 bottom-2 w-px bg-white/10 md:left-0 md:right-0 md:top-[15px] md:bottom-auto md:h-px md:w-auto" aria-hidden>
        <div data-line-fill className="h-full w-full origin-top bg-white/70 md:origin-left" />
      </div>
      <ol className="relative grid gap-10 md:grid-cols-4 md:gap-6">
        {steps.map((s, i) => (
          <li key={s.name} data-step className="relative pl-12 transition-opacity duration-500 md:pl-0 md:pt-14">
            <div className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-background">
              <s.icon className="h-4 w-4 text-white" />
            </div>
            <p className="font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">Step {i + 1}</p>
            <h3 className="mt-2 text-xl font-semibold text-white">{s.name}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {s.tags.map((t) => (
                <span key={t} className="rounded-full border-[0.5px] border-white/20 px-3 py-1.5 text-xs text-muted-foreground">
                  {t}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
