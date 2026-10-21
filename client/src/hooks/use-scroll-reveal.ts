import { useEffect, type RefObject } from "react";

/**
 * Gentle scroll entrances for everything inside `scopeRef` marked with:
 *   data-reveal          – rises in on its own
 *   data-reveal-stagger  – its children rise in one after another
 *
 * Elements already on screen when the page loads are left alone, so nothing that was visible
 * blinks out and back in. Does nothing for visitors who prefer reduced motion. Content is fully
 * visible in the server-rendered HTML; GSAP only hides it just before animating it in.
 *
 * GSAP is loaded on demand in the browser, so it isn't part of the main bundle or the
 * server-side prerender.
 */
export function useScrollReveal(scopeRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope) return;
    let revert: (() => void) | null = null;
    let cancelled = false;

    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);

        const mm = gsap.matchMedia();
        mm.add(
          "(prefers-reduced-motion: no-preference)",
          () => {
            const belowFold = (el: Element) =>
              el.getBoundingClientRect().top > window.innerHeight * 0.92;

            gsap.utils
              .toArray<HTMLElement>("[data-reveal]", scope)
              .forEach((el) => {
                if (!belowFold(el)) return;
                gsap.from(el, {
                  y: 24,
                  opacity: 0,
                  duration: 0.8,
                  ease: "power2.out",
                  scrollTrigger: { trigger: el, start: "top 88%", once: true },
                });
              });

            gsap.utils
              .toArray<HTMLElement>("[data-reveal-stagger]", scope)
              .forEach((el) => {
                if (!belowFold(el)) return;
                gsap.from(el.children, {
                  y: 32,
                  opacity: 0,
                  duration: 0.8,
                  ease: "power2.out",
                  stagger: 0.09,
                  scrollTrigger: { trigger: el, start: "top 85%", once: true },
                });
              });
          },
          scope,
        );
        revert = () => mm.revert();
      },
    );

    return () => {
      cancelled = true;
      revert?.();
    };
  }, [scopeRef]);
}
