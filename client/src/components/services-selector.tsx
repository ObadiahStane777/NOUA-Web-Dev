import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";

export type ServiceItem = { name: string; line: string; body: string; tags: readonly string[] };

/**
 * Service tabs on the left; on the right a live diagram for the selected service with its
 * description and tags. Keyboard: arrow keys move between tabs. Used on /ai-ops and /gtm.
 */
export function ServicesSelector({
  services,
  diagram,
  idPrefix,
}: {
  services: readonly ServiceItem[];
  diagram: (active: number) => ReactNode;
  idPrefix: string;
}) {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent, i: number) => {
    const step = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const n = (i + step + services.length) % services.length;
    setActive(n);
    tabRefs.current[n]?.focus();
  };
  const s = services[active];
  const panelId = `${idPrefix}-panel`;
  return (
    <div className="grid gap-6 md:grid-cols-12" data-reveal-stagger>
      <div className="flex flex-col gap-3 md:col-span-5" role="tablist" aria-label="Services" aria-orientation="vertical">
        {services.map((svc, i) => (
          <button
            key={svc.name}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${idPrefix}-tab-${i}`}
            aria-selected={i === active}
            aria-controls={panelId}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={(e) => onKey(e, i)}
            className={
              "group rounded-2xl border p-6 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
              (i === active ? "border-white/40 bg-white/[0.06]" : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]")
            }
            data-testid={`tab-${idPrefix}-${i}`}
          >
            <span className="flex items-center justify-between gap-4">
              <span className="text-lg font-semibold text-white">{svc.name}</span>
              <ArrowRight
                className={
                  "h-4 w-4 transition-all " +
                  (i === active ? "translate-x-0 text-white opacity-100" : "-translate-x-1 text-white/40 opacity-0 group-hover:opacity-100")
                }
              />
            </span>
            <span className="mt-1 block text-sm text-muted-foreground">{svc.line}</span>
          </button>
        ))}
      </div>

      <div
        className="overflow-hidden rounded-3xl border border-border/80 bg-card/40 md:col-span-7"
        role="tabpanel"
        id={panelId}
        aria-labelledby={`${idPrefix}-tab-${active}`}
      >
        {diagram(active)}
        <div className="border-t border-border/80 p-6 md:p-8">
          <h3 className="text-xl font-semibold tracking-tight text-white">{s.line}</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {s.tags.map((t) => (
              <span key={t} className="rounded-full border-[0.5px] border-white/20 px-3 py-1.5 text-xs text-muted-foreground">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
