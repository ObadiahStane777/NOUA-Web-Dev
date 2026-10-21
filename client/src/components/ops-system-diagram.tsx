import { useEffect, useRef } from "react";

/**
 * Live dot-style diagram of a client's workflow, used by the AI Ops services selector.
 *   mode 0 – Consulting: work queues up at a bottleneck while an audit line scans the map
 *   mode 1 – AI implementation: AI agents take on quoting and specs; work flows freely
 *   mode 2 – Team enablement: knowledge pulses out from the system to the team
 * Switching modes cross-fades nodes and connections. The cursor brightens nearby dots.
 * Stops off screen / in a hidden tab; one still frame under reduced motion.
 */

type NodeDef = { id: string; label: string; x: number; y: number; ai?: boolean; team?: boolean; show: [number, number, number] };
type EdgeDef = { a: string; b: string; show: [number, number, number]; speed: [number, number, number] };

// Layout in a 100 × 64 box
const NODES: NodeDef[] = [
  { id: "enq", label: "Enquiry", x: 8, y: 30, show: [1, 1, 1] },
  { id: "quote", label: "Quote", x: 29, y: 16, show: [1, 1, 1] },
  { id: "spec", label: "Spec", x: 29, y: 44, show: [1, 1, 1] },
  { id: "appr", label: "Approval", x: 51, y: 30, show: [1, 1, 1] },
  { id: "prod", label: "Production", x: 72, y: 30, show: [1, 1, 1] },
  { id: "deliv", label: "Delivery", x: 92, y: 30, show: [1, 1, 1] },
  { id: "ai1", label: "AI agent", x: 40, y: 4, ai: true, show: [0, 1, 1] },
  { id: "ai2", label: "AI agent", x: 40, y: 56, ai: true, show: [0, 1, 1] },
  { id: "t1", label: "Team", x: 22, y: 62, team: true, show: [0, 0, 1] },
  { id: "t2", label: "Team", x: 62, y: 62, team: true, show: [0, 0, 1] },
  { id: "t3", label: "Team", x: 80, y: 62, team: true, show: [0, 0, 1] },
  { id: "t4", label: "Team", x: 62, y: 2, team: true, show: [0, 0, 1] },
];
const EDGES: EdgeDef[] = [
  { a: "enq", b: "quote", show: [1, 1, 1], speed: [0.5, 1.4, 1.4] },
  { a: "enq", b: "spec", show: [1, 1, 1], speed: [0.5, 1.4, 1.4] },
  { a: "quote", b: "appr", show: [1, 1, 1], speed: [0.5, 1.4, 1.4] },
  { a: "spec", b: "appr", show: [1, 1, 1], speed: [0.5, 1.4, 1.4] },
  { a: "appr", b: "prod", show: [1, 1, 1], speed: [0.18, 1.4, 1.4] },
  { a: "prod", b: "deliv", show: [1, 1, 1], speed: [0.18, 1.4, 1.4] },
  { a: "quote", b: "ai1", show: [0, 1, 1], speed: [0, 1.8, 1.8] },
  { a: "ai1", b: "appr", show: [0, 1, 1], speed: [0, 1.8, 1.8] },
  { a: "spec", b: "ai2", show: [0, 1, 1], speed: [0, 1.8, 1.8] },
  { a: "ai2", b: "appr", show: [0, 1, 1], speed: [0, 1.8, 1.8] },
  { a: "ai2", b: "t1", show: [0, 0, 1], speed: [0, 0, 1] },
  { a: "prod", b: "t2", show: [0, 0, 1], speed: [0, 0, 1] },
  { a: "deliv", b: "t3", show: [0, 0, 1], speed: [0, 0, 1] },
  { a: "ai1", b: "t4", show: [0, 0, 1], speed: [0, 0, 1] },
];
const BOTTLENECK = "appr";

const STYLES = Array.from({ length: 16 }, (_, k) => `rgba(255,255,255,${((k + 1) / 16).toFixed(3)})`);
const shade = (a: number) => STYLES[Math.max(0, Math.min(15, (a * 16) | 0))];

export function OpsSystemDiagram({ mode, className }: { mode: number; className?: string }) {
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

    // Per-node and per-edge visibility, eased towards the current mode
    const nodeVis = NODES.map((n) => n.show[modeRef.current]);
    const edgeVis = EDGES.map((e) => e.show[modeRef.current]);
    let queue = modeRef.current === 0 ? 1 : 0; // bottleneck pile-up, 0..1
    // Each node is a small cluster of dots at fixed offsets
    const clusters = NODES.map((n) =>
      Array.from({ length: n.ai ? 60 : n.team ? 32 : 46 }, () => {
        const a = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random());
        return { a, r, ph: Math.random() * 6.28 };
      }),
    );
    const byId = Object.fromEntries(NODES.map((n, i) => [n.id, i]));

    // Wide screens: workflow runs left to right. Narrow screens: top to bottom.
    const pos = (n: NodeDef) => {
      if (W < 560) {
        const padX = 40;
        const padY = 28;
        return [padX + (n.y / 64) * (W - padX * 2), padY + (n.x / 100) * (H - padY * 2 - 14)] as const;
      }
      const padX = 44;
      const padY = 26;
      return [padX + (n.x / 100) * (W - padX * 2), padY + (n.y / 64) * (H - padY * 2)] as const;
    };

    function frame(now: number) {
      const t = reduce ? 0 : now / 1000;
      const m = modeRef.current;
      const k = reduce ? 1 : 0.06;
      NODES.forEach((n, i) => (nodeVis[i] += (n.show[m] - nodeVis[i]) * k));
      EDGES.forEach((e, i) => (edgeVis[i] += (e.show[m] - edgeVis[i]) * k));
      queue += ((m === 0 ? 1 : 0) - queue) * (reduce ? 1 : 0.03);

      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, W, H);
      const near = (x: number, y: number) => {
        const d = Math.hypot(x - mouse.x, y - mouse.y);
        return d < 110 ? (1 - d / 110) * 0.35 : 0;
      };

      // Connections: dotted lines with packets moving along them
      EDGES.forEach((e, i) => {
        const v = edgeVis[i];
        if (v < 0.02) return;
        const [x1, y1] = pos(NODES[byId[e.a]]);
        const [x2, y2] = pos(NODES[byId[e.b]]);
        const len = Math.hypot(x2 - x1, y2 - y1);
        const steps = Math.max(4, Math.floor(len / 7));
        for (let s = 1; s < steps; s++) {
          const u = s / steps;
          const x = x1 + (x2 - x1) * u;
          const y = y1 + (y2 - y1) * u;
          ctx!.fillStyle = shade((0.16 + near(x, y)) * v);
          ctx!.fillRect(x - 0.6, y - 0.6, 1.2, 1.2);
        }
        const speed = e.speed[m] || e.speed[1];
        const isTeam = e.b.startsWith("t");
        const packets = isTeam ? 1 : 3;
        for (let p = 0; p < packets; p++) {
          let u = (t * speed * (60 / Math.max(60, len)) + p / packets) % 1;
          if (isTeam) u = Math.min(1, ((t * 0.5 + i * 0.37) % 1.6) / 1.0); // pulse out to the team
          if (isTeam && u >= 1) continue;
          const x = x1 + (x2 - x1) * u;
          const y = y1 + (y2 - y1) * u;
          ctx!.fillStyle = shade(0.9 * v);
          ctx!.fillRect(x - 1.6, y - 1.6, 3.2, 3.2);
        }
      });

      // Bottleneck: work piles up in front of Approval
      if (queue > 0.02) {
        const [bx, by] = pos(NODES[byId[BOTTLENECK]]);
        const n = Math.round(22 * queue);
        for (let i = 0; i < n; i++) {
          const row = Math.floor(i / 6);
          const col = i % 6;
          const narrow = W < 560;
          const x = narrow ? bx - 12 + row * 5 : bx - 22 - col * 5 - row * 2;
          const y = narrow ? by - 24 - col * 5 + Math.sin(t * 2 + i) * 0.6 : by - 12 + row * 5 + Math.sin(t * 2 + i) * 0.6;
          ctx!.fillStyle = shade(0.75 * queue);
          ctx!.fillRect(x, y, 2.4, 2.4);
        }
        // pulsing warning ring
        const r = 20 + (t * 14) % 14;
        for (let a = 0; a < 40; a++) {
          const ang = (a / 40) * Math.PI * 2;
          ctx!.fillStyle = shade(0.5 * queue * (1 - ((t * 14) % 14) / 14));
          ctx!.fillRect(bx + Math.cos(ang) * r - 0.7, by + Math.sin(ang) * r - 0.7, 1.4, 1.4);
        }
        // audit line sweeping across the map
        if (W < 560) {
          const sy = 20 + ((t * 0.18) % 1) * (H - 40);
          for (let x = 10; x < W - 10; x += 6) {
            ctx!.fillStyle = shade(0.28 * queue);
            ctx!.fillRect(x, sy, 3, 1);
          }
        } else {
          const sx = 20 + ((t * 0.18) % 1) * (W - 40);
          for (let y = 10; y < H - 10; y += 6) {
            ctx!.fillStyle = shade(0.28 * queue);
            ctx!.fillRect(sx, y, 1, 3);
          }
        }
      }

      // Nodes: clusters of dots, AI agents denser and brighter, team members light up in turn
      ctx!.font = '10px "Geist Mono", ui-monospace, Menlo, monospace';
      ctx!.textAlign = "center";
      NODES.forEach((n, i) => {
        const v = nodeVis[i];
        if (v < 0.02) return;
        const [cx, cy] = pos(n);
        const radius = n.ai ? 16 : n.team ? 10 : 14;
        let glow = 0;
        if (n.team) glow = 0.5 + 0.5 * Math.sin(t * 2.2 - i);
        const hot = n.id === BOTTLENECK ? queue * 0.3 : 0;
        for (const d of clusters[i]) {
          const rr = d.r * radius * (0.85 + 0.15 * Math.sin(t * 1.5 + d.ph));
          const x = cx + Math.cos(d.a) * rr;
          const y = cy + Math.sin(d.a) * rr;
          const a = ((n.ai ? 0.85 : n.team ? 0.35 + glow * 0.5 : 0.6) + hot + near(x, y)) * v;
          ctx!.fillStyle = shade(a);
          ctx!.fillRect(x - 0.9, y - 0.9, 1.8, 1.8);
        }
        ctx!.fillStyle = `rgba(255,255,255,${(0.5 * v).toFixed(3)})`;
        ctx!.fillText(n.label, cx, cy + radius + 13);
      });
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
      const r = canvas!.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width;
      H = r.height;
      canvas!.width = Math.round(W * dpr);
      canvas!.height = Math.round(H * dpr);
      frame(performance.now());
    }
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
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
