import { ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteShell, Section } from "@/components/site-shell";
import { Seo } from "@/components/seo";
import { Link } from "wouter";

const CALENDLY_URL = "/booking";

export default function Contact() {
  return (
    <SiteShell>
      <Seo
        title="Contact"
        description="Start with a structured operational assessment. Email us and we'll respond within 24 hours."
      />
      <Section
        title="A structured way to begin."
        titleAs="h1"
        description="If you're considering AI, start with the operational foundation and a clear assessment."
        testId="section-contact"
      >
        <div className="grid gap-6 md:grid-cols-12">
          <div className="md:col-span-7">
            <div className="rounded-3xl border border-border/80 bg-card/40 p-8">
              <h3 className="text-lg font-semibold tracking-tight" data-testid="text-contact-title">
                Questions?
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground" data-testid="text-contact-body">
                Email us and we'll respond within 24 hours.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button asChild className="rounded-full px-6" data-testid="button-contact-calendly">
                  <Link href={CALENDLY_URL}>
                    Find My Bottlenecks <ArrowRight className="ml-1" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full px-6" data-testid="button-contact-email">
                  <a href="mailto:info@noua.uk">
                    <Mail className="mr-1" /> info@noua.uk
                  </a>
                </Button>
              </div>
            </div>
          </div>

      
        </div>
      </Section>
    </SiteShell>
  );
}
