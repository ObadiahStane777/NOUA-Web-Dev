import { Link } from "wouter";
import { SiteShell } from "@/components/site-shell";
import { Seo } from "@/components/seo";

const offers = [
  {
    key: "ai-ops",
    name: "AI Operations",
    title: "Improve how your business works.",
    services: ["Consulting", "AI implementation", "Team enablement"],
    cta: "Explore AI Ops",
    href: "/ai-ops",
  },
  {
    key: "gtm",
    name: "GTM & Growth",
    title: "Find better commercial opportunities.",
    services: ["Market intelligence", "Account research", "Targeted outbound"],
    cta: "Explore GTM",
    href: "/gtm",
  },
] as const;

export default function Home() {
  return (
    <SiteShell>
      <Seo
        title="NOUA — AI Operations & Go-To-Market"
        description="NOUA builds AI systems that improve how your business works and find better commercial opportunities."
      />

      <section className="mx-auto grid max-w-6xl justify-items-center gap-5 px-6 pb-14 pt-16 text-center md:pt-24" data-testid="section-home-hero">
        <h1
          className="max-w-4xl text-[2.4rem] font-semibold leading-[1.04] tracking-[-0.035em] [text-wrap:balance] md:text-6xl"
          data-testid="text-hero-title"
        >
          Build better systems.
          <br />
          Find better opportunities.
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-muted-foreground" data-testid="text-hero-subtitle">
          Choose a starting point: how the work gets done, or where the next deal comes from.
        </p>
      </section>

      <div className="home-split" data-testid="section-home-offers">
        {offers.map((o) => (
          <Link key={o.key} href={o.href} className="home-split__side" data-testid={`card-offer-${o.key}`}>
            <span className="home-split__name">{o.name}</span>
            <h2 className="home-split__title">{o.title}</h2>
            <ul className="home-split__services">
              {o.services.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <span className="home-split__go">
              {o.cta}
              <span className="home-split__arrow" aria-hidden="true">
                →
              </span>
            </span>
          </Link>
        ))}
      </div>

      <p className="mx-auto max-w-6xl px-6 pt-10 text-center text-sm text-muted-foreground" data-testid="text-home-unsure">
        Not sure which fits?{" "}
        <Link href="/booking" className="border-b border-white/40 text-foreground hover:border-white">
          Book a call
        </Link>{" "}
        and we'll tell you.
      </p>
    </SiteShell>
  );
}
