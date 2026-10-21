import * as React from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import nouaLogo from "@assets/NOUA_LOGO_1769961415202.png";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

const CALENDLY_URL = "/booking";

const nav = [
  { label: "AI Operations", href: "/ai-ops" },
  { label: "GTM & Growth", href: "/gtm" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
] as const;

// The footer keeps links to every page, including AI Ops pages not yet in the main nav.
const footerNav = [
  { label: "Home", href: "/" },
  ...nav,
  { label: "How We Work", href: "/how-we-work" },
  { label: "Who It's For", href: "/who-its-for" },
  { label: "Audit", href: "/audit" },
] as const;

function NavLink({ href, children, testId }: { href: string; children: React.ReactNode; testId: string }) {
  const [loc] = useLocation();
  const active = loc === href;

  return (
    <Link
      href={href}
      className={
        "text-sm leading-none transition-colors hover:text-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full px-3 py-2 " +
        (active ? "text-foreground" : "text-muted-foreground")
      }
      data-testid={testId}
    >
      {children}
    </Link>
  );
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute inset-0 opacity-80 [background:radial-gradient(900px_circle_at_15%_0%,rgba(255,255,255,.10),transparent_55%),radial-gradient(760px_circle_at_85%_10%,rgba(255,255,255,.08),transparent_60%)]" />
        <div className="absolute inset-0 grid-faint" />
        <div className="absolute inset-0 noise-overlay" />
      </div>
      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex h-16 items-center justify-between gap-6">
            <Link href="/" className="flex items-center gap-3" data-testid="link-logo-home">
              <img
                src={nouaLogo}
                alt="NOUA"
                className="h-8 w-8 rounded-xl border border-border bg-black object-contain"
                data-testid="img-logo"
              />
              <span className="text-sm font-semibold tracking-tight" data-testid="text-logo-wordmark">
                NOUA
              </span>
            </Link>

            <nav className="hidden items-center gap-1 md:flex" aria-label="Primary" data-testid="nav-primary">
              {nav.map((n) => (
                <NavLink key={n.href} href={n.href} testId={`link-nav-${n.href.replace("/", "").replaceAll("/", "-") || "home"}`}>
                  {n.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Button
                asChild
                className="hidden rounded-full px-5 md:flex"
                data-testid="button-nav-audit"
              >
                <Link href={CALENDLY_URL}>Book a call</Link>
              </Button>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden" data-testid="button-mobile-menu">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  <div className="flex flex-col gap-6 mt-8">
                    {nav.map((n) => (
                      <Link
                        key={n.href}
                        href={n.href}
                        className="text-lg font-medium transition-colors hover:text-primary"
                        data-testid={`link-mobile-nav-${n.href.replace("/", "").replaceAll("/", "-") || "home"}`}
                      >
                        {n.label}
                      </Link>
                    ))}
                    <Separator />
                    <Link
                      href={CALENDLY_URL}
                      className="text-lg font-medium transition-colors hover:text-primary"
                      data-testid="link-mobile-nav-audit"
                    >
                      Book a call
                    </Link>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="mt-20 border-t border-border/80">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3" data-testid="footer-brand">
                <img
                  src={nouaLogo}
                  alt="NOUA"
                  className="h-8 w-8 rounded-xl border border-border bg-black object-contain"
                  data-testid="img-footer-logo"
                />
                <div>
                  <p className="text-sm font-semibold" data-testid="text-footer-name">NOUA</p>
                  <p className="text-xs text-muted-foreground" data-testid="text-footer-tagline">
                    Better systems. Better opportunities.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-2" data-testid="footer-links">
              {footerNav.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="rounded-full px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  data-testid={`link-footer-${n.href.replace("/", "").replaceAll("/", "-") || "home"}`}
                >
                  {n.label}
                </Link>
              ))}
              <Separator className="mx-1 hidden h-5 md:block" orientation="vertical" />
              <Link
                href={CALENDLY_URL}
                className="rounded-full px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                data-testid="link-footer-calendly"
              >
                Book a call
              </Link>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-2 border-t border-border/80 pt-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
            <p data-testid="text-footer-legal"> © NOUA All rights reserved.</p>
            <a href="mailto:info@noua.uk" className="transition-colors hover:text-foreground text-[#a1a1a1]" data-testid="link-footer-contact">
              info@noua.uk
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function Section({
  eyebrow,
  title,
  titleAs = "h2",
  description,
  children,
  id,
  testId,
}: {
  eyebrow?: string;
  title: string;
  titleAs?: "h1" | "h2";
  description?: string;
  children?: React.ReactNode;
  id?: string;
  testId?: string;
}) {
  const TitleTag = titleAs;
  return (
    <section className="py-12 md:py-20" id={id} data-testid={testId ?? "section"}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex items-end justify-between gap-10">
          <div className="max-w-3xl">
            <TitleTag className="mt-4 text-2xl font-semibold tracking-tight md:text-4xl" data-testid="text-section-title" data-reveal>
              {title}
            </TitleTag>
            {description ? (
              <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg" data-testid="text-section-description" data-reveal>
                {description}
              </p>
            ) : null}
          </div>
        </div>
        <div className="mt-8 md:mt-10">{children}</div>
      </div>
    </section>
  );
}
