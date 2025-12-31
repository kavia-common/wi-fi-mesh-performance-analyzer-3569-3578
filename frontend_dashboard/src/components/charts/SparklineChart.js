import React, { useMemo } from "react";

function normalizeSeries(values) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return values.map((v) => (v - min) / span);
}

function buildPath(norm, width, height, pad) {
  const w = width - pad * 2;
  const h = height - pad * 2;
  if (!norm.length) return "";
  const step = w / Math.max(1, norm.length - 1);

  const points = norm.map((n, i) => {
    const x = pad + i * step;
    const y = pad + (1 - n) * h;
    return { x, y };
  });

  // Simple polyline path
  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x.toFixed(2)} ${points[i].y.toFixed(2)}`;
  }
  return d;
}

// PUBLIC_INTERFACE
export function SparklineChart({ title, series = [], unit, color = "#2563EB" }) {
  /** Renders a small SVG sparkline chart for a numeric series. */
  const width = 520;
  const height = 120;
  const pad = 10;

  const values = useMemo(() => series.map((p) => p.v), [series]);
  const last = values.length ? values[values.length - 1] : null;

  const path = useMemo(() => {
    if (!values.length) return "";
    const norm = normalizeSeries(values);
    return buildPath(norm, width, height, pad);
  }, [values]);

  const fillPath = useMemo(() => {
    if (!values.length) return "";
    const norm = normalizeSeries(values);
    const w = width - pad * 2;
    const h = height - pad * 2;
    const step = w / Math.max(1, norm.length - 1);
    const pts = norm.map((n, i) => ({ x: pad + i * step, y: pad + (1 - n) * h }));
    const first = pts[0];
    const lastPt = pts[pts.length - 1];
    let d = `M ${first.x.toFixed(2)} ${(pad + h).toFixed(2)} L ${first.x.toFixed(2)} ${first.y.toFixed(2)}`;
    for (let i = 1; i < pts.length; i++) d += ` L ${pts[i].x.toFixed(2)} ${pts[i].y.toFixed(2)}`;
    d += ` L ${lastPt.x.toFixed(2)} ${(pad + h).toFixed(2)} Z`;
    return d;
  }, [values]);

  return (
    <div className="chartWrap" role="img" aria-label={title}>
      <div className="chartLabelRow">
        <div className="chartName">{title}</div>
        <div className="chartMeta">
          {last === null ? "No data" : `${last}${unit ? ` ${unit}` : ""}`}
        </div>
      </div>

      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.20" />
            <stop offset="100%" stopColor={color} stopOpacity="0.00" />
          </linearGradient>
        </defs>

        {fillPath ? <path d={fillPath} fill="url(#sparkFill)" /> : null}
        {path ? <path d={path} stroke={color} strokeWidth="2.5" fill="none" /> : null}

        {/* baseline */}
        <line x1="0" y1={height - 1} x2={width} y2={height - 1} stroke="rgba(107,114,128,0.25)" strokeWidth="1" />
      </svg>
    </div>
  );
}
