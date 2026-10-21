import { useEffect, useRef, type RefObject } from "react";
import towerSrc from "@/assets/images/ai-ops-tower.webp";

/**
 * Interactive dot-matrix hero background for /ai-ops: the tower on a waterline, a low skyline
 * running in from the left, and water across the full width. Moving over it sends small ripples;
 * a click or tap sends a shockwave.
 *
 * Speed safeguards:
 * - Drops to fewer, larger dots (and then 30fps) if frames take too long on this device.
 * - Stops when the hero is off screen or the tab is hidden.
 * - Runs at a reduced frame rate while nothing is being disturbed (the water keeps moving).
 * - With prefers-reduced-motion, draws one still frame.
 */

type Particles = {
  n: number;
  hx: Float32Array;
  hy: Float32Array;
  b: Float32Array;
  water: Uint8Array;
  x: Float32Array;
  y: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  bucket: Uint8Array;
  sway: Float32Array;
  yw: number;
};

type Ripple = { x: number; y: number; t0: number; amp: number; speed: number; maxR: number };

const BASE_V = 0.885; // where the tower meets the water in the source image
const CELLS = [5, 6, 7, 8]; // dot spacing per quality level
const STYLES = Array.from({ length: 16 }, (_, k) => `rgba(255,255,255,${((k + 1) / 16).toFixed(3)})`);
const SPRING = 0.028;
const DAMP = 0.9;
const IDLE_INTERVAL = 1000 / 24;

function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

export function TowerField({ avoidRef }: { avoidRef?: RefObject<HTMLElement | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !host || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let pix: Uint8ClampedArray | null = null;
    let iw = 0;
    let ih = 0;
    let W = 0;
    let H = 0;
    let dpr = 1;
    let P: Particles | null = null;
    let ripples: Ripple[] = [];
    let raf = 0;
    let onScreen = true;
    let disposed = false;
    let level = 0;
    let minInterval = 0; // 0 = every frame; raised if the device is slow
    let lastFrame = 0;
    let lastActive = 0;
    let measuring: number[] = [];
    let measureFrom = 0;
    let built = { cx: 0, top: 0 };
    const mouse = { x: -1e4, y: -1e4, inside: false, lastRipple: 0, rx: -1e4, ry: -1e4 };

    const sample = (u: number, v: number) => {
      if (!pix || u < 0 || v < 0 || u >= 1 || v >= 1) return 0;
      return pix[(((v * ih) | 0) * iw + ((u * iw) | 0)) * 4] / 255;
    };

    const avoidBox = () => {
      const el = avoidRef?.current;
      if (!el) return null;
      const h = host.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      return { l: r.left - h.left - 40, t: r.top - h.top - 40, r: r.right - h.left + 60, b: r.bottom - h.top + 36 };
    };

    const addRipple = (x: number, y: number, amp: number, speed: number, maxR: number) => {
      ripples.push({ x, y, t0: performance.now(), amp, speed, maxR });
      if (ripples.length > 8) ripples.shift();
    };

    function build() {
      const cs = CELLS[level];
      const desktop = W >= 768;
      const tb = desktop ? avoidBox() : null;
      // Dims dots that sit behind the text (desktop only; phones use a CSS fade instead)
      const dim = (x: number, y: number) => {
        if (!tb) return 1;
        const dx = Math.max(tb.l - x, 0, x - tb.r);
        const dy = Math.max(tb.t - y, 0, y - tb.b);
        return 0.1 + 0.9 * Math.min(1, Math.sqrt(dx * dx + dy * dy) / 70);
      };

      const yw = Math.round((H * (desktop ? 0.8 : 0.84)) / cs) * cs;
      let dh = Math.min(H * 1.05, (yw - H * 0.01) / BASE_V);
      let dw = dh * (iw / ih);
      if (!desktop && dw > W * 1.15) {
        dw = W * 1.15;
        dh = dw * (ih / iw);
      }
      const cx = desktop ? W * 0.7 : W * 0.5;
      const x0 = cx - dw / 2;
      const y0 = yw - BASE_V * dh;
      const gain = desktop ? 1 : 0.85;

      const hx: number[] = [];
      const hy: number[] = [];
      const br: number[] = [];
      const wt: number[] = [];
      const add = (x: number, y: number, b: number, w: number) => {
        hx.push(x);
        hy.push(y);
        br.push(b);
        wt.push(w);
      };
      const sky = new Map<string, number>(); // "col,depth" -> brightness, for reflections
      const col = (x: number) => Math.round(x / cs);

      // Tower (image above the waterline only)
      for (let y = Math.max(0, y0) + cs / 2; y < yw; y += cs) {
        for (let x = Math.max(0, x0) + cs / 2; x < Math.min(W, x0 + dw); x += cs) {
          let b = sample((x - x0) / dw, (y - y0) / dh);
          if (b < 0.1) continue;
          b = Math.min(1, Math.pow(b, 0.85) * 1.45) * gain;
          add(x, y, b * dim(x, y), 0);
          sky.set(col(x) + "," + Math.round((yw - y) / cs), b);
        }
      }

      // Low skyline either side of the tower, taller towards it
      const r = rng(7);
      const towerL = x0 + dw * 0.06;
      const towerR = x0 + dw * 0.94;
      for (const [a, z, dir] of [
        [0, towerL, 1],
        [towerR, W, -1],
      ] as const) {
        let x = a;
        while (x < z - 12) {
          const bw = Math.round((18 + r() * 46) / cs) * cs;
          const t = dir > 0 ? (x - a) / Math.max(1, z - a) : 1 - (x - a) / Math.max(1, z - a);
          const hmax = (desktop ? 34 : 24) + (desktop ? 150 : 90) * Math.pow(Math.max(0, t), 1.6);
          const bh = Math.round((hmax * (0.45 + r() * 0.55)) / cs) * cs;
          const litP = 0.25 + r() * 0.35;
          for (let yy = yw - cs / 2, k = 0; yy > yw - bh; yy -= cs, k++) {
            for (let xx = x + cs / 2, j = 0; xx < Math.min(z, x + bw); xx += cs, j++) {
              const edge = j === 0 || xx + cs >= x + bw || yy - cs <= yw - bh;
              const win = j % 2 === 1 && k % 2 === 1 && r() < litP;
              let b = edge ? 0.42 : win ? 0.55 + r() * 0.4 : r() < 0.5 ? 0.14 : 0;
              if (!b) continue;
              b *= gain * (0.75 + 0.25 * t);
              add(xx, yy, b * dim(xx, yy), 0);
              sky.set(col(xx) + "," + k, b);
            }
          }
          x += bw + Math.round(r() * 3) * cs;
        }
      }

      // Water: reflection of whatever stands above, plus a sparse shimmer across the full width
      const depthMax = H - yw;
      for (let y = yw + cs / 2, k = 0; y < H; y += cs, k++) {
        const fall = 1 - (y - yw) / depthMax;
        for (let x = cs / 2; x < W; x += cs) {
          const refl = sky.get(col(x) + "," + (k + 1)) || 0;
          const amb = r() < 0.36 ? 0.04 + r() * 0.08 : 0;
          const b = Math.max(refl * 0.5 * (0.35 + 0.65 * fall), amb * (0.5 + 0.5 * fall));
          if (b < 0.04) continue;
          add(x, y, b * dim(x, y), 1);
        }
      }

      const n = hx.length;
      P = {
        n,
        hx: Float32Array.from(hx),
        hy: Float32Array.from(hy),
        b: Float32Array.from(br),
        water: Uint8Array.from(wt),
        x: Float32Array.from(hx),
        y: Float32Array.from(hy),
        vx: new Float32Array(n),
        vy: new Float32Array(n),
        bucket: new Uint8Array(n),
        sway: new Float32Array(n),
        yw,
      };
      built = { cx, top: yw - dh * 0.35 };
    }

    // Returns true while any dot is still noticeably moving
    function step(now: number) {
      if (!P) return false;
      const { n, x, y, vx, vy, hx, hy } = P;
      ripples = ripples.filter((r) => (now - r.t0) * r.speed < r.maxR);
      for (const r of ripples) {
        const rad = (now - r.t0) * r.speed;
        const band = 22;
        const fade = 1 - rad / r.maxR;
        const lo = (rad - band) * (rad - band);
        const hi = (rad + band) * (rad + band);
        for (let i = 0; i < n; i++) {
          const dx = hx[i] - r.x;
          const dy = hy[i] - r.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < hi && (rad < band || d2 > lo)) {
            const d = Math.sqrt(d2) || 1;
            const f = (1 - Math.abs(d - rad) / band) * r.amp * fade * 0.18;
            vx[i] += (dx / d) * f;
            vy[i] += (dy / d) * f;
          }
        }
      }
      let moving = false;
      for (let i = 0; i < n; i++) {
        vx[i] = (vx[i] + (hx[i] - x[i]) * SPRING) * DAMP;
        vy[i] = (vy[i] + (hy[i] - y[i]) * SPRING) * DAMP;
        x[i] += vx[i];
        y[i] += vy[i];
        if (!moving && vx[i] * vx[i] + vy[i] * vy[i] > 0.0025) moving = true;
      }
      return moving;
    }

    function draw(now: number) {
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.fillStyle = "#000";
      ctx!.fillRect(0, 0, W, H);
      if (!P) return;
      const { n, x, y, hx, hy, b, bucket, water, sway, yw } = P;
      const t = reduce ? 0 : now;
      for (let i = 0; i < n; i++) {
        const dx = x[i] - hx[i];
        const dy = y[i] - hy[i];
        let v = b[i] + Math.min(0.7, Math.sqrt(dx * dx + dy * dy) * 0.06);
        if (water[i]) {
          const depth = (hy[i] - yw) / 40;
          sway[i] = Math.sin(hy[i] * 0.13 + t * 0.0018) * (1 + depth * 1.5);
          v *= 0.55 + 0.45 * Math.sin(hx[i] * 0.04 + t * 0.0015 + hy[i] * 0.23);
          if (Math.sin(hx[i] * 0.011 - t * 0.0009 + hy[i] * 0.6) > 0.94) v += 0.25;
        }
        bucket[i] = Math.max(0, Math.min(15, (v * 16) | 0));
      }
      for (let k = 0; k < 16; k++) {
        ctx!.fillStyle = STYLES[k];
        for (let i = 0; i < n; i++) {
          if (bucket[i] !== k) continue;
          if (water[i]) ctx!.fillRect(x[i] + sway[i] - 1.6, y[i] - 0.8, 3.2, 1.6);
          else ctx!.fillRect(x[i] - 1.2, y[i] - 1.2, 2.4, 2.4);
        }
      }
    }

    function loop(now: number) {
      raf = 0;
      if (disposed || !onScreen || document.hidden) return;
      raf = requestAnimationFrame(loop);
      const idle = !mouse.inside && ripples.length === 0 && now - lastActive > 600;
      const interval = Math.max(minInterval, idle ? IDLE_INTERVAL : 0);
      if (interval && now - lastFrame < interval - 2) return;
      lastFrame = now;

      const s = performance.now();
      if (mouse.inside && now - mouse.lastRipple > 90) {
        const mdx = mouse.x - mouse.rx;
        const mdy = mouse.y - mouse.ry;
        if (mdx * mdx + mdy * mdy > 22 * 22) {
          addRipple(mouse.x, mouse.y, 2.2, 0.55, 240);
          mouse.lastRipple = now;
          mouse.rx = mouse.x;
          mouse.ry = mouse.y;
        }
      }
      if (step(now)) lastActive = now;
      draw(now);
      adapt(now, performance.now() - s);
    }

    // Watch how long frames take; if this device struggles, use fewer dots, then 30fps.
    function adapt(now: number, ms: number) {
      if (now < measureFrom) return;
      measuring.push(ms);
      if (measuring.length < 30) return;
      const sorted = measuring.slice().sort((a, b) => a - b);
      const median = sorted[sorted.length >> 1];
      measuring = [];
      if (median > 7 && level < CELLS.length - 1) {
        level++;
        build();
        measureFrom = now + 500;
      } else if (median > 9 && minInterval === 0) {
        minInterval = 1000 / 30;
        measureFrom = now + 500;
      } else {
        measureFrom = Infinity; // settled
      }
      canvas!.dataset.quality = `${level}${minInterval ? "-30fps" : ""}`;
    }

    function start() {
      if (disposed) return;
      if (reduce) {
        draw(0);
        return;
      }
      if (!raf && onScreen && !document.hidden) raf = requestAnimationFrame(loop);
    }

    function resize() {
      const r = host!.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width;
      H = r.height;
      canvas!.width = Math.round(W * dpr);
      canvas!.height = Math.round(H * dpr);
      if (!pix) return;
      build();
      if (reduce) draw(0);
    }

    const setPointer = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      mouse.inside = true;
      lastActive = performance.now();
    };
    const onDown = (e: PointerEvent) => {
      setPointer(e);
      if (!reduce) addRipple(mouse.x, mouse.y, 9, 0.9, 1400);
    };
    const onLeave = () => {
      mouse.inside = false;
    };
    const onVisibility = () => {
      if (!document.hidden) start();
    };
    let resizeTimer = 0;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 150);
    };

    host.addEventListener("pointermove", setPointer);
    host.addEventListener("pointerdown", onDown);
    host.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", onResize);
    const io = new IntersectionObserver((entries) => {
      onScreen = entries[0].isIntersecting;
      if (onScreen) start();
    });
    io.observe(host);

    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      if (disposed) return;
      iw = img.naturalWidth;
      ih = img.naturalHeight;
      const oc = document.createElement("canvas");
      oc.width = iw;
      oc.height = ih;
      const octx = oc.getContext("2d");
      if (!octx) return;
      octx.drawImage(img, 0, 0);
      pix = octx.getImageData(0, 0, iw, ih).data;
      resize();
      if (!reduce && P) {
        addRipple(built.cx, built.top, 7, 1.0, 1700);
        lastActive = performance.now();
        measureFrom = performance.now() + 2200; // measure once the opening shockwave has passed
      }
      start();
    };
    img.src = towerSrc;

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      io.disconnect();
      host.removeEventListener("pointermove", setPointer);
      host.removeEventListener("pointerdown", onDown);
      host.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
    };
  }, [avoidRef]);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 block h-full w-full" />;
}
