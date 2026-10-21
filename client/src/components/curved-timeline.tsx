import * as React from "react";

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

type CurvedTimelineProps = {
  count: number;
  width: number;
  height: number;
  amplitude: number;
  stroke?: string;
  strokeWidth?: number;
  className?: string;
  testId?: string;
};

export function CurvedTimeline({
  count,
  width,
  height,
  amplitude,
  stroke = "rgba(255,255,255,0.26)",
  strokeWidth = 1,
  className,
  testId,
}: CurvedTimelineProps) {
  const w = width;
  const h = height;
  const centerY = h / 2;

  const points = React.useMemo(() => {
    const n = Math.max(2, count);
    const step = w / (n - 1);
    const pts: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < n; i++) {
      const x = i * step;
      const y = centerY + (i % 2 === 0 ? -amplitude : amplitude);
      pts.push({ x, y });
    }
    return pts;
  }, [count, w, centerY, amplitude]);

  const path = React.useMemo(() => {
    const pts = points;
    if (pts.length < 2) return "";

    const tension = 0.28;
    let d = `M ${pts[0]!.x} ${pts[0]!.y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] ?? pts[i]!;
      const p1 = pts[i]!;
      const p2 = pts[i + 1]!;
      const p3 = pts[i + 2] ?? p2;

      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  }, [points]);

  // Progressive reveal: animate stroke-dashoffset using CSS keyframes
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className={className}
      aria-hidden="true"
      data-testid={testId ?? "svg-curved-timeline"}
    >
      <path
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        className="timeline-curve"
      />
      <path
        d={path}
        fill="none"
        stroke="rgba(255,255,255,0.45)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        className="timeline-curve timeline-curve-animate"
      />
    </svg>
  );
}

export function useElementSize<T extends HTMLElement>() {
  const ref = React.useRef<T | null>(null);
  const [size, setSize] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const cr = entry.contentRect;
      setSize({ width: cr.width, height: cr.height });
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { ref, size };
}
