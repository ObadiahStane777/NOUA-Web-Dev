import { SiteShell } from "@/components/site-shell";
import { Seo } from "@/components/seo";

export default function Booking() {
  return (
    <SiteShell>
      <Seo
        title="Book a Free Operations & AI Audit"
        description="Schedule your free 30-minute Operations & AI Readiness Audit call with NOUA."
      />
      <div className="mx-auto max-w-6xl px-6 py-12 md:py-20">
        <h1 className="text-2xl font-semibold tracking-tight md:text-4xl" data-testid="text-booking-title">
          Book a free Operations &amp; AI Audit
        </h1>
        <div className="mt-8 rounded-3xl border border-border/80 bg-card/40 p-4 md:p-8">
          <div
            style={{
              width: "100%",
              height: "700px",
              position: "relative"
            }}
          >
            <iframe
              src="https://cal.eu/noua-ai-ops/30min"
              loading="lazy"
              style={{
                width: "100%",
                height: "100%",
                border: "0"
              }}
              title="Book a meeting"
            />
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
