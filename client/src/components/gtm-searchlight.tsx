import { useEffect, useRef, type RefObject } from "react";
import sceneSrc from "@/assets/images/gtm-scene.webp";
import reachSrc from "@/assets/images/gtm-figure-reach.png";
import standSrc from "@/assets/images/gtm-figure-stand.png";

/**
 * Interactive hero background for /gtm: a stippled night landscape with a searchlight that follows
 * the cursor (and wanders on its own when nobody is pointing). Hidden figures rise out of the dust
 * where the light falls. Reaching figures send a faint thread of dots to the main figure's hand.
 *
 * Figure images are greyscale maps on black (brighter = more dots), cut from the generated
 * figures. Every figure is turned to face the main figure, mirroring the image where needed.
 * To swap in new figures: replace gtm-figure-reach.png / gtm-figure-stand.png, set MASK_FACING
 * to the way the new images face, and update ANCHORS if the feet or hand sit elsewhere.
 *
 * Speed safeguards: the still landscape is drawn once and reused; each frame only redraws the
 * searchlight area, a few twinkling dots and the figures. Stops off screen or in a hidden tab.
 * Uses fewer dots if frames run slow. With prefers-reduced-motion it draws one still frame.
 */

// Source scene coordinates (the original image was 1200×670)
const SW = 1200;
const SH = 670;
// The centre pair (always visible), drawn from the reaching figure: the main figure stands at
// MAIN_FEET facing left; its partner faces right and is placed so their hands meet.
const MAIN_FEET: [number, number] = [695, 442];
const MAIN_H = 233; // main figure height in scene px; hidden figures are scaled relative to it
// Which way the figure images face
const MASK_FACING: "left" | "right" = "right";

type Kind = "reach" | "stand";
// Anchors as fractions of each figure image: centre of the feet (x) and height of the hand (y)
const ANCHORS: Record<Kind, { footU: number; handV: number }> = {
  reach: { footU: 0.35, handV: 0.3 },
  stand: { footU: 0.55, handV: 0.5 },
};
// Feet position in scene coords and scale relative to the main figure. Figures left of the main
// figure face right (towards it); figures to its right face left.
const FIGS: { x: number; y: number; s: number; face: "left" | "right"; kind: Kind }[] = [
  { x: 175, y: 470, s: 0.6, face: "right", kind: "stand" },
  { x: 340, y: 590, s: 1.0, face: "right", kind: "reach" },
  { x: 452, y: 332, s: 0.36, face: "right", kind: "reach" },
  { x: 870, y: 470, s: 0.7, face: "left", kind: "reach" },
  { x: 1135, y: 385, s: 0.45, face: "left", kind: "stand" },
  { x: 1040, y: 632, s: 1.0, face: "left", kind: "reach" },
];

const STYLES = Array.from({ length: 16 }, (_, k) => `rgba(255,255,255,${((k + 1) / 16).toFixed(3)})`);

type Px = { data: Uint8ClampedArray; w: number; h: number };
type FigPoint = { tx: number; ty: number; sx: number; sy: number; delay: number; b: number };
type Fig = { cx: number; cy: number; hand: [number, number]; pts: FigPoint[]; r: number; d: number; kind: Kind };

function lum(p: Px, u: number, v: number) {
  if (u < 0 || v < 0 || u >= 1 || v >= 1) return 0;
  return p.data[(((v * p.h) | 0) * p.w + ((u * p.w) | 0)) * 4] / 255;
}
const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
const ease = (p: number) => p * p * (3 - 2 * p);

export function GtmSearchlight({ avoidRef }: { avoidRef?: RefObject<HTMLElement | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !host || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let scene: Px | null = null;
    let masks: Record<Kind, Px> | null = null;
    let W = 0;
    let H = 0;
    let dpr = 1;
    let density = 26; // screen px² per landscape dot; raised if frames run slow
    let raf = 0;
    let onScreen = true;
    let disposed = false;
    let mainHand: [number, number] = [0, 0];
    let base: {
      x: Float32Array;
      y: Float32Array;
      b: Float32Array;
      ph: Float32Array;
      img: HTMLCanvasElement;
      bins: number[][];
      cols: number;
      rows: number;
      tw: number[];
    } | null = null;
    let figs: Fig[] = [];
    const CELL = 48;
    const light = { x: 0, y: 0, tx: 0, ty: 0, user: false, lastUser: -1e9, R: 170 };
    let samples: number[] = [];
    let measureFrom = 0;

    const avoidBox = () => {
      const el = avoidRef?.current;
      if (!el) return null;
      const h = host.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      return { l: r.left - h.left - 30, t: r.top - h.top - 30, r: r.right - h.left + 40, b: r.bottom - h.top + 30 };
    };

    function build() {
      if (!scene || !masks) return;
      const sc = Math.max(W / SW, H / SH);
      const focusX = W < 700 ? 0.55 : 0.5;
      const ox = Math.min(0, Math.max(W - SW * sc, W / 2 - SW * focusX * sc));
      const tb = avoidBox();
      let oy = H - SH * sc;
      // Phones: lower the landscape so the centre pair stands below the text, not behind it
      if (W < 768 && tb) oy = Math.max(oy, tb.b + 16 - (MAIN_FEET[1] - MAIN_H) * sc);
      const dim = (x: number, y: number) => {
        if (!tb) return 1;
        const dx = Math.max(tb.l - x, 0, x - tb.r);
        const dy = Math.max(tb.t - y, 0, y - tb.b);
        return 0.08 + 0.92 * Math.min(1, Math.hypot(dx, dy) / 60);
      };

      // Landscape stipple: dot density follows the scene's brightness
      const N = Math.min(48000, Math.round((W * H) / density));
      const bx = new Float32Array(N);
      const by = new Float32Array(N);
      const bb = new Float32Array(N);
      const ph = new Float32Array(N);
      let n = 0;
      let tries = 0;
      while (n < N && tries < N * 30) {
        tries++;
        const x = Math.random() * W;
        const y = Math.random() * H;
        const v = lum(scene, (x - ox) / (SW * sc), (y - oy) / (SH * sc));
        const pr = v < 0.14 ? v * 0.25 : Math.pow(v, 0.8) * 1.5;
        if (Math.random() > pr) continue;
        bx[n] = x;
        by[n] = y;
        bb[n] = Math.min(1, 0.15 + v * 1.7) * dim(x, y);
        ph[n] = Math.random() * 6.28;
        n++;
      }
      // The centre pair: two reaching figures whose hands meet, drawn as part of the landscape
      const pairX: number[] = [];
      const pairY: number[] = [];
      const pairB: number[] = [];
      {
        const mask = masks.reach;
        const { footU, handV } = ANCHORS.reach;
        const hgt = MAIN_H * sc;
        const wid = hgt * (mask.w / mask.h);
        const top = oy + MAIN_FEET[1] * sc - hgt;
        // main figure faces left
        const mainFlip = MASK_FACING !== "left";
        const mainLeft = ox + MAIN_FEET[0] * sc - (mainFlip ? 1 - footU : footU) * wid;
        mainHand = [mainLeft, top + handV * hgt];
        // partner faces right, hand just touching the main figure's hand
        const partFlip = MASK_FACING !== "right";
        const partLeft = mainLeft - wid + 3 * sc;
        const count = Math.round(5200 * Math.min(1.4, sc));
        for (const [left, flip] of [
          [mainLeft, mainFlip],
          [partLeft, partFlip],
        ] as const) {
          let k = 0;
          let tries = 0;
          while (k < count && tries < count * 40) {
            tries++;
            const u = Math.random();
            const v = Math.random();
            const L = lum(mask, flip ? 1 - u : u, v);
            if (L < 0.15 || Math.random() > L * 1.4) continue;
            const px = left + u * wid;
            const py = top + v * hgt;
            pairX.push(px);
            pairY.push(py);
            pairB.push(Math.min(1, 0.5 + L * 0.8));
            k++;
          }
        }
      }
      const total = n + pairX.length;
      const x = new Float32Array(total);
      const y = new Float32Array(total);
      const b = new Float32Array(total);
      const phAll = new Float32Array(total);
      x.set(bx.subarray(0, n));
      y.set(by.subarray(0, n));
      b.set(bb.subarray(0, n));
      phAll.set(ph.subarray(0, n));
      x.set(pairX, n);
      y.set(pairY, n);
      b.set(pairB, n);
      for (let i = n; i < total; i++) phAll[i] = Math.random() * 6.28;
      n = total;

      // Draw the still landscape once
      const img = document.createElement("canvas");
      img.width = Math.round(W * dpr);
      img.height = Math.round(H * dpr);
      const o = img.getContext("2d")!;
      o.setTransform(dpr, 0, 0, dpr, 0, 0);
      o.fillStyle = "#000";
      o.fillRect(0, 0, W, H);
      for (let i = 0; i < n; i++) {
        o.fillStyle = STYLES[Math.min(15, (b[i] * 0.9 * 16) | 0)];
        o.fillRect(x[i], y[i], 1.3, 1.3);
      }
      const cols = Math.ceil(W / CELL);
      const rows = Math.ceil(H / CELL);
      const bins: number[][] = Array.from({ length: cols * rows }, () => []);
      for (let i = 0; i < n; i++) bins[Math.min(rows - 1, (y[i] / CELL) | 0) * cols + Math.min(cols - 1, (x[i] / CELL) | 0)].push(i);
      const tw = Array.from({ length: Math.min(1800, n) }, () => (Math.random() * n) | 0);
      base = { x, y, b, ph: phAll, img, bins, cols, rows, tw };

      // Hidden figures: each dot rises from the dust at the figure's feet
      figs = FIGS.map((f) => {
        const mask = masks![f.kind];
        const hgt = MAIN_H * f.s * sc;
        const wid = hgt * (mask.w / mask.h);
        const footX = ox + f.x * sc;
        const footY = oy + f.y * sc;
        const flip = f.face !== MASK_FACING;
        const { footU, handV } = ANCHORS[f.kind];
        const left = footX - (flip ? 1 - footU : footU) * wid;
        const top = footY - hgt;
        const count = Math.round(2600 * f.s * f.s * Math.min(1.3, sc) + 300);
        const pts: FigPoint[] = [];
        let t = 0;
        while (pts.length < count && t < count * 40) {
          t++;
          const u = Math.random();
          const v = Math.random();
          const L = lum(mask, flip ? 1 - u : u, v);
          if (L < 0.15 || Math.random() > L * 1.4) continue;
          pts.push({
            tx: left + u * wid,
            ty: top + v * hgt,
            sx: footX + gauss() * wid * 0.9,
            sy: footY - Math.random() * hgt * 0.12 + gauss() * hgt * 0.05,
            delay: (1 - v) * 0.45,
            b: Math.min(1, 0.45 + L * 0.7),
          });
        }
        const hand: [number, number] = [f.face === "right" ? left + wid : left, top + handV * hgt];
        return { cx: left + wid / 2, cy: top + hgt / 2, hand, pts, r: 0, d: dim(left + wid / 2, top + hgt / 2), kind: f.kind };
      });
      light.R = Math.max(120, Math.min(200, W * 0.12));
      if (!light.user) {
        light.x = light.tx = W * 0.62;
        light.y = light.ty = H * 0.62;
      }
    }

    function frame(now: number) {
      if (!base) return;
      const t = reduce ? 0 : now;
      if (!light.user || now - light.lastUser > 3500) {
        light.tx = W * (0.56 + 0.34 * Math.sin(t * 0.00021));
        light.ty = H * (0.6 + 0.16 * Math.sin(t * 0.00037 + 1));
      }
      light.x += (light.tx - light.x) * 0.12;
      light.y += (light.ty - light.y) * 0.12;
      const R = light.R;
      const R2 = R * R;

      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.drawImage(base.img, 0, 0);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      // A few dots twinkle; the searchlight brightens the dots under it
      const { x, y, b, ph, bins, cols, rows } = base;
      for (const i of base.tw) {
        const v = b[i] * (0.6 + 0.6 * Math.sin(t * 0.0016 + ph[i]));
        ctx!.fillStyle = STYLES[Math.max(0, Math.min(15, (v * 16) | 0))];
        ctx!.fillRect(x[i], y[i], 1.3, 1.3);
      }
      const c0 = Math.max(0, ((light.x - R) / CELL) | 0);
      const c1 = Math.min(cols - 1, ((light.x + R) / CELL) | 0);
      const r0 = Math.max(0, ((light.y - R) / CELL) | 0);
      const r1 = Math.min(rows - 1, ((light.y + R) / CELL) | 0);
      for (let rr = r0; rr <= r1; rr++) {
        for (let cc = c0; cc <= c1; cc++) {
          for (const i of bins[rr * cols + cc]) {
            const dx = x[i] - light.x;
            const dy = y[i] - light.y;
            const d2 = dx * dx + dy * dy;
            if (d2 >= R2) continue;
            const f = 1 - Math.sqrt(d2) / R;
            ctx!.fillStyle = STYLES[Math.min(15, ((b[i] + f * f * 0.5) * 16) | 0)];
            ctx!.fillRect(x[i], y[i], 1.3, 1.3);
          }
        }
      }

      for (const f of figs) {
        const dist = Math.hypot(f.cx - light.x, f.cy - light.y);
        const target = reduce ? 0 : Math.max(0, Math.min(1, 1 - (dist - R * 0.55) / (R * 0.6)));
        f.r += (target - f.r) * (target > f.r ? 0.05 : 0.035);
        if (f.r < 0.005 && target === 0) continue;
        for (const p of f.pts) {
          const q = ease(Math.max(0, Math.min(1, (f.r - p.delay) / 0.55)));
          const jx = Math.sin(t * 0.002 + p.tx) * (1 - q) * 3;
          const a = (0.06 + 0.72 * q) * p.b * Math.max(0.35, f.d) * Math.min(1, f.r * 5);
          ctx!.fillStyle = STYLES[Math.min(15, (a * 16) | 0)];
          ctx!.fillRect(p.sx + (p.tx - p.sx) * q + jx, p.sy + (p.ty - p.sy) * q, 1.5, 1.5);
        }
        // Reaching figures send a faint thread of moving dots to the main figure's hand
        if (f.kind === "reach" && f.r > 0.8) {
          const a0 = (f.r - 0.8) / 0.2;
          const [x1, y1] = f.hand;
          const [x2, y2] = mainHand;
          const cx = (x1 + x2) / 2;
          const cy = Math.min(y1, y2) - Math.abs(x2 - x1) * 0.25 - 30;
          for (let j = 0; j < 70; j++) {
            const u = (j / 70 + t * 0.00012) % 1;
            const qx = (1 - u) * (1 - u) * x1 + 2 * (1 - u) * u * cx + u * u * x2;
            const qy = (1 - u) * (1 - u) * y1 + 2 * (1 - u) * u * cy + u * u * y2;
            ctx!.fillStyle = STYLES[Math.min(15, ((a0 * 0.55 * Math.sin(u * Math.PI)) * 16) | 0)];
            ctx!.fillRect(qx, qy, 1.4, 1.4);
          }
        }
      }
    }

    // If this device is slow, use fewer landscape dots (once)
    function adapt(now: number, ms: number) {
      if (now < measureFrom) return;
      samples.push(ms);
      if (samples.length < 30) return;
      const median = samples.slice().sort((a, b) => a - b)[samples.length >> 1];
      samples = [];
      measureFrom = Infinity;
      if (median > 8 && density < 40) {
        density = 44;
        build();
      }
    }

    function loop(now: number) {
      raf = 0;
      if (disposed || !onScreen || document.hidden) return;
      raf = requestAnimationFrame(loop);
      const s = performance.now();
      frame(now);
      adapt(now, performance.now() - s);
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
      const r = host!.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width;
      H = r.height;
      canvas!.width = Math.round(W * dpr);
      canvas!.height = Math.round(H * dpr);
      build();
      if (reduce) frame(0);
    }

    const point = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      light.tx = e.clientX - r.left;
      light.ty = e.clientY - r.top;
      light.user = true;
      light.lastUser = performance.now();
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "touch") point(e);
    };
    const onLeave = () => {
      light.lastUser = -1e9;
    };
    let resizeTimer = 0;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 150);
    };
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerdown", point);
    host.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", start);
    window.addEventListener("resize", onResize);
    const io = new IntersectionObserver((entries) => {
      onScreen = entries[0].isIntersecting;
      start();
    });
    io.observe(host);

    const load = (src: string) =>
      new Promise<Px>((resolve, reject) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => {
          const c = document.createElement("canvas");
          c.width = img.naturalWidth;
          c.height = img.naturalHeight;
          const x = c.getContext("2d")!;
          x.drawImage(img, 0, 0);
          resolve({ data: x.getImageData(0, 0, c.width, c.height).data, w: c.width, h: c.height });
        };
        img.onerror = reject;
        img.src = src;
      });
    Promise.all([load(sceneSrc), load(reachSrc), load(standSrc)])
      .then(([s, reach, stand]) => {
        if (disposed) return;
        scene = s;
        masks = { reach, stand };
        resize();
        measureFrom = performance.now() + 1500;
        start();
      })
      .catch(() => {
        /* images failed to load: leave the plain black hero */
      });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      io.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerdown", point);
      host.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", start);
      window.removeEventListener("resize", onResize);
    };
  }, [avoidRef]);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 block h-full w-full" />;
}
