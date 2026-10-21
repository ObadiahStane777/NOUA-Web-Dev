import { useEffect, useRef, type RefObject } from "react";

/**
 * A faint stream of droplets in the right-hand margin that runs from the bottom of the hero
 * and fades out at the bottom of `endRef`. Droplets fall as the visitor scrolls and drip slowly
 * when they stop.
 *
 * Kept deliberately quiet: two thin trickles, low brightness, margin only.
 * Hidden below 768px wide (no margin to put it in). Runs only while its stretch of the page is
 * on screen and the tab is visible; drips at 30fps when the visitor isn't scrolling.
 * With prefers-reduced-motion it's drawn still.
 */

type Drop = { y: number; sp: number; b: number; wob: number };
type Stream = { x: number; phase: number; drops: Drop[] };

const STYLES = Array.from({ length: 16 }, (_, k) => `rgba(255,255,255,${((k + 1) / 16).toFixed(3)})`);
const CONTENT_MAX = 1152; // max-w-6xl
const CONTENT_PAD = 24; // px-6
const FADE_LENGTH = 320; // px over which the stream fades before it ends

export function WaterTrail({
  startRef,
  endRef,
}: {
  startRef: RefObject<HTMLElement | null>;
  endRef: RefObject<HTMLElement | null>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0;
    let H = 0;
    let dpr = 1;
    let enabled = false;
    let streams: Stream[] = [];
    let startY = 0;
    let endY = 0;
    let lastScroll = window.scrollY;
    let scrollV = 0;
    let raf = 0;
    let lastFrame = 0;
    let disposed = false;

    const docTop = (el: HTMLElement) => el.getBoundingClientRect().top + window.scrollY;

    function layout() {
      const start = startRef.current;
      const end = endRef.current;
      W = window.innerWidth;
      H = window.innerHeight;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas!.width = Math.round(W * dpr);
      canvas!.height = Math.round(H * dpr);
      enabled = W >= 768 && !!start && !!end;
      streams = [];
      if (!enabled) {
        ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
        return;
      }
      startY = docTop(start!) + start!.offsetHeight - 36;
      endY = docTop(end!) + end!.offsetHeight;
      if (endY - startY < 200) {
        enabled = false;
        return;
      }
      const gutter = Math.max(0, (W - Math.min(CONTENT_MAX, W)) / 2 + CONTENT_PAD - 8);
      const narrow = gutter < 44;
      const cx = narrow ? W - 14 : W - gutter / 2;
      const spread = narrow ? 2 : Math.max(4, Math.min(8, gutter * 0.06));
      for (let k = 0; k < 2; k++) {
        const s: Stream = { x: cx + (k - 0.5) * spread, phase: k * 2.1, drops: [] };
        const count = Math.max(10, (endY - startY) / 11);
        for (let i = 0; i < count; i++) {
          s.drops.push({
            y: startY + Math.random() * (endY - startY),
            sp: 0.7 + Math.random() * 0.8,
            b: 0.12 + Math.random() * 0.2,
            wob: Math.random() * 6.28,
          });
        }
        streams.push(s);
      }
    }

    function step() {
      const dy = window.scrollY - lastScroll;
      lastScroll = window.scrollY;
      scrollV = scrollV * 0.85 + Math.abs(dy) * 0.15;
      if (reduce) return;
      const push = Math.abs(dy) * 1.3 + 0.25;
      const span = endY - startY;
      for (const s of streams) {
        for (const d of s.drops) {
          d.y += push * d.sp;
          if (d.y > endY) d.y = startY + ((d.y - startY) % span); // wrap so the flow stays even
        }
      }
    }

    function draw() {
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, W, H);
      if (!enabled) return;
      const sy0 = window.scrollY;
      const fadeStart = endY - FADE_LENGTH;
      for (const s of streams) {
        for (const d of s.drops) {
          const sy = d.y - sy0;
          if (sy < -24 || sy > H + 24) continue;
          let a = d.b * Math.min(1, (d.y - startY) / 90);
          if (d.y > fadeStart) a *= Math.max(0, 1 - (d.y - fadeStart) / FADE_LENGTH);
          if (a <= 0.02) continue;
          const x = s.x + Math.sin(d.y * 0.012 + s.phase + d.wob * 0.2) * 2;
          const len = 2 + Math.min(6, scrollV * 0.6 * d.sp);
          ctx!.fillStyle = STYLES[Math.min(15, (a * 16) | 0)];
          ctx!.fillRect(x - 0.6, sy - len, 1.2, len);
        }
      }
    }

    // Only animate while the stream's stretch of the page is on screen
    const inView = () => enabled && window.scrollY + H > startY && window.scrollY < endY;

    function loop(now: number) {
      raf = 0;
      if (disposed || document.hidden || !inView()) {
        draw(); // clear once when leaving
        return;
      }
      raf = requestAnimationFrame(loop);
      const scrolling = window.scrollY !== lastScroll || scrollV > 0.3;
      if (!scrolling && now - lastFrame < 1000 / 30 - 2) return;
      lastFrame = now;
      step();
      draw();
    }

    function wake() {
      if (disposed) return;
      if (reduce) {
        draw();
        return;
      }
      if (!raf && inView() && !document.hidden) raf = requestAnimationFrame(loop);
    }

    let layoutTimer = 0;
    const relayout = () => {
      clearTimeout(layoutTimer);
      layoutTimer = window.setTimeout(() => {
        layout();
        wake();
        if (!raf) draw();
      }, 150);
    };

    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("resize", relayout);
    document.addEventListener("visibilitychange", wake);
    // Page height changes as fonts and images load; keep the start and end points accurate
    const ro = new ResizeObserver(relayout);
    ro.observe(document.body);

    layout();
    wake();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      clearTimeout(layoutTimer);
      ro.disconnect();
      window.removeEventListener("scroll", wake);
      window.removeEventListener("resize", relayout);
      document.removeEventListener("visibilitychange", wake);
    };
  }, [startRef, endRef]);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[1] hidden h-full w-full md:block" />;
}
