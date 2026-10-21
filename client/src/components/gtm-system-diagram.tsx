import { useEffect, useRef } from "react";

/**
 * Live dot-style diagram for the GTM services selector.
 *   mode 0 – Market intelligence: companies grouped in segments; a searchlight scans the market and
 *            buying signals pulse on the best-fit accounts
 *   mode 1 – Account research: the rest fades; best-fit accounts move into a shortlist, each with
 *            its decision-makers
 *   mode 2 – Targeted outbound: threads run from you to each shortlisted account; replies come back
 * Dots glide between modes. The cursor brightens nearby dots. Stops off screen / in a hidden tab;
 * one still frame under reduced motion.
 */

const STYLES = Array.from({ length: 16 }, (_, k) => `rgba(255,255,255,${((k + 1) / 16).toFixed(3)})`);
const shade = (a: number) => STYLES[Math.max(0, Math.min(15, (a * 16) | 0))];

// Layout in a 100 × 64 box
const SEGMENTS = [
  { x: 18, y: 18, label: "Segment A" },
  { x: 62, y: 14, label: "Segment B" },
  { x: 34, y: 48, label: "Segment C" },
  { x: 78, y: 46, label: "Segment D" },
];
const BEST = 2; // the segment the research points to
const PER_SEGMENT = 60;
const SHORTLIST = 8;
const YOU = { x: 8, y: 32 };

function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

type Dot = {
  seg: number;
  hx: number; // home in the market (box units)
  hy: number;
  slot: number; // shortlist slot, or -1
  x: number; // current position (box units)
  y: number;
  a: number; // current brightness
  ph: number;
};

export function GtmSystemDiagram({ mode, className }: { mode: number; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const redrawRef = useRef<() => void>(() => {});

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0;
    let H = 0;
    let dpr = 1;
    let raf = 0;
    let onScreen = true;
    let disposed = false;
    const mouse = { x: -1e4, y: -1e4 };

    // Companies in the market, with a few best-fit accounts that will make the shortlist
    const r = rng(11);
    const dots: Dot[] = [];
    SEGMENTS.forEach((s, si) => {
      for (let i = 0; i < PER_SEGMENT; i++) {
        const ang = r() * Math.PI * 2;
        const rad = Math.sqrt(r()) * (si === BEST ? 10 : 9);
        const hx = s.x + Math.cos(ang) * rad * 1.3;
        const hy = s.y + Math.sin(ang) * rad * 0.75;
        dots.push({ seg: si, hx, hy, slot: -1, x: hx, y: hy, a: 0.5, ph: r() * 6.28 });
      }
    });
    // 5 from the best segment, 2 from A, 1 from D
    const pick = (seg: number, n: number) => dots.filter((d) => d.seg === seg && d.slot < 0).slice(0, n);
    [...pick(BEST, 5), ...pick(0, 2), ...pick(3, 1)].forEach((d, i) => (d.slot = i));
    const shortlist = dots.filter((d) => d.slot >= 0).sort((a, b) => a.slot - b.slot);

    const slotPos = (slot: number, m: number): [number, number] => [m === 2 ? 84 : 76, 7 + (slot / (SHORTLIST - 1)) * 50];
    const target = (d: Dot, m: number): [number, number, number] => {
      if (m === 0) return [d.hx, d.hy, d.slot >= 0 ? 0.85 : 0.6];
      if (d.slot >= 0) return [...slotPos(d.slot, m), 0.95];
      // everyone else drifts back and fades
      return [d.hx * 0.62, d.hy, m === 1 ? 0.14 : 0.07];
    };

    // Box units -> pixels. Narrow screens run top to bottom.
    const px = (x: number, y: number): [number, number] => {
      if (W < 560) {
        const padX = 36;
        const padY = 30;
        return [padX + (y / 64) * (W - padX * 2), padY + (x / 100) * (H - padY * 2 - 10)];
      }
      const padX = 40;
      const padY = 26;
      return [padX + (x / 100) * (W - padX * 2), padY + (y / 64) * (H - padY * 2)];
    };

    let modeT = [1, 0, 0]; // eased presence of each mode
    let started = performance.now();

    function frame(now: number) {
      const t = reduce ? 0 : (now - started) / 1000;
      const m = modeRef.current;
      const k = reduce ? 1 : 0.055;
      modeT = modeT.map((v, i) => v + ((i === m ? 1 : 0) - v) * (reduce ? 1 : 0.06));

      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, W, H);
      ctx!.font = '10px "Geist Mono", ui-monospace, Menlo, monospace';
      ctx!.textAlign = "center";
      const near = (x: number, y: number) => {
        const d = Math.hypot(x - mouse.x, y - mouse.y);
        return d < 100 ? (1 - d / 100) * 0.35 : 0;
      };

      // Market intelligence: a searchlight wandering across the segments
      const lx = 50 + 36 * Math.sin(t * 0.45);
      const ly = 32 + 18 * Math.sin(t * 0.7 + 1);
      const [lpx, lpy] = px(lx, ly);
      const lightR = Math.min(W, H) * 0.22;

      for (const d of dots) {
        const [tx, ty, ta] = target(d, m);
        d.x += (tx - d.x) * k;
        d.y += (ty - d.y) * k;
        d.a += (ta - d.a) * k;
        const [x, y] = px(d.x, d.y);
        let a = d.a * (0.85 + 0.15 * Math.sin(t * 1.6 + d.ph));
        const lit = Math.hypot(x - lpx, y - lpy);
        if (lit < lightR) a += (1 - lit / lightR) * 0.45 * modeT[0];
        a += near(x, y);
        const size = d.slot >= 0 && m > 0 ? 3.4 : 2.3;
        ctx!.fillStyle = shade(a);
        ctx!.fillRect(x - size / 2, y - size / 2, size, size);
      }

      // Buying signals: rings pulsing on the best-fit accounts
      if (modeT[0] > 0.02) {
        shortlist.forEach((d, i) => {
          const p = (t * 0.6 + i * 0.37) % 1.8;
          if (p > 1) return;
          const [x, y] = px(d.x, d.y);
          const rr = 3 + p * 12;
          for (let s = 0; s < 18; s++) {
            const ang = (s / 18) * Math.PI * 2;
            ctx!.fillStyle = shade((1 - p) * 0.6 * modeT[0]);
            ctx!.fillRect(x + Math.cos(ang) * rr - 0.6, y + Math.sin(ang) * rr - 0.6, 1.2, 1.2);
          }
        });
        SEGMENTS.forEach((s, i) => {
          const [x, y] = px(s.x, s.y + 13);
          const best = i === BEST;
          ctx!.fillStyle = `rgba(255,255,255,${((best ? 0.75 : 0.45) * modeT[0]).toFixed(3)})`;
          ctx!.fillText(best ? `${s.label} · best fit` : s.label, x, y);
        });
      }

      // Account research: decision-makers orbit each shortlisted account
      const people = Math.max(modeT[1], modeT[2]);
      if (people > 0.02) {
        shortlist.forEach((d, i) => {
          const [x, y] = px(d.x, d.y);
          for (let j = 0; j < 3; j++) {
            const ang = t * 0.8 + i + (j * Math.PI * 2) / 3;
            ctx!.fillStyle = shade(0.55 * people);
            ctx!.fillRect(x + Math.cos(ang) * 7 - 0.8, y + Math.sin(ang) * 7 - 0.8, 1.6, 1.6);
          }
        });
        // label above the column (wide) or under the row (narrow)
        const [hx, hy] = W < 560 ? [W / 2, px(m === 2 ? 84 : 76, 32)[1] + 24] : px(m === 2 ? 84 : 76, 0.5);
        ctx!.fillStyle = `rgba(255,255,255,${(0.6 * people).toFixed(3)})`;
        ctx!.fillText(modeT[2] > 0.5 ? "Conversations" : "Shortlist", hx, Math.max(12, hy));
      }

      // Targeted outbound: threads from you to each account; some reply
      if (modeT[2] > 0.02) {
        const v = modeT[2];
        const [yx, yy] = px(YOU.x, YOU.y);
        for (let s = 0; s < 30; s++) {
          const ang = (s / 30) * Math.PI * 2;
          const rr = 6 * Math.sqrt(((s * 7) % 30) / 30);
          ctx!.fillStyle = shade(0.9 * v);
          ctx!.fillRect(yx + Math.cos(ang) * rr - 0.9, yy + Math.sin(ang) * rr - 0.9, 1.8, 1.8);
        }
        ctx!.fillStyle = `rgba(255,255,255,${(0.6 * v).toFixed(3)})`;
        ctx!.fillText("You", yx, yy + 20);
        shortlist.forEach((d, i) => {
          const [ax, ay] = px(d.x, d.y);
          const cx = (yx + ax) / 2;
          const cy = (yy + ay) / 2 - (W < 560 ? 0 : 18);
          const cxx = W < 560 ? cx + 30 : cx;
          const bez = (u: number): [number, number] => [
            (1 - u) * (1 - u) * yx + 2 * (1 - u) * u * cxx + u * u * ax,
            (1 - u) * (1 - u) * yy + 2 * (1 - u) * u * cy + u * u * ay,
          ];
          for (let s = 1; s < 34; s++) {
            const [x, y] = bez(s / 34);
            ctx!.fillStyle = shade(0.16 * v + near(x, y) * 0.5);
            ctx!.fillRect(x - 0.6, y - 0.6, 1.2, 1.2);
          }
          // outreach packet
          const u = (t * 0.35 + i * 0.13) % 1;
          const [ox, oy] = bez(u);
          ctx!.fillStyle = shade(0.9 * v);
          ctx!.fillRect(ox - 1.4, oy - 1.4, 2.8, 2.8);
          // every other account replies: a packet comes back and the account lights up
          if (i % 2 === 0) {
            const back = (t * 0.35 + i * 0.13 + 0.5) % 1;
            const [rx, ry] = bez(1 - back);
            ctx!.fillStyle = shade(0.7 * v);
            ctx!.fillRect(rx - 1.1, ry - 1.1, 2.2, 2.2);
            const glow = 0.5 + 0.5 * Math.sin(t * 2 + i);
            for (let s = 0; s < 14; s++) {
              const ang = (s / 14) * Math.PI * 2;
              ctx!.fillStyle = shade(0.35 * glow * v);
              ctx!.fillRect(ax + Math.cos(ang) * 11 - 0.6, ay + Math.sin(ang) * 11 - 0.6, 1.2, 1.2);
            }
          }
        });
      }
    }

    function loop(now: number) {
      raf = 0;
      if (disposed || !onScreen || document.hidden) return;
      raf = requestAnimationFrame(loop);
      frame(now);
    }
    function start() {
      if (disposed) return;
      if (reduce) {
        frame(0);
        return;
      }
      if (!raf && onScreen && !document.hidden) raf = requestAnimationFrame(loop);
    }
    function resize() {
      const rect = canvas!.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = rect.width;
      H = rect.height;
      canvas!.width = Math.round(W * dpr);
      canvas!.height = Math.round(H * dpr);
      frame(performance.now());
    }
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouse.x = mouse.y = -1e4;
    };
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", start);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver((entries) => {
      onScreen = entries[0].isIntersecting;
      start();
    });
    io.observe(canvas);
    redrawRef.current = () => frame(0);
    started = performance.now();
    resize();
    start();
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", start);
    };
  }, []);

  // Reduced motion: nothing animates, so redraw once when the mode changes
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) redrawRef.current();
  }, [mode]);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
