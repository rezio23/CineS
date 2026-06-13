import { useEffect, useRef } from 'react';

function animateValue(el, target, isFloat) {
  const duration = 900;
  const start    = performance.now();
  const fn = (now) => {
    const t = Math.min((now - start) / duration, 1);
    const v = target * (1 - Math.pow(1 - t, 3));
    el.textContent = isFloat
      ? `$${v.toFixed(2)}`
      : Math.round(v).toLocaleString();
    if (t < 1) requestAnimationFrame(fn);
  };
  requestAnimationFrame(fn);
}

export default function KpiCard({ icon, label, value, accent = false }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const isFloat = typeof value === 'string' && value.startsWith('$');
    const target  = isFloat
      ? parseFloat(value.replace('$', ''))
      : Number(value);
    animateValue(ref.current, target, isFloat);
  }, [value]);

  return (
    <div className={`kpi-card ${accent ? 'kpi-accent' : ''}`}>
      <div className="kpi-icon">{icon}</div>
      <div className="kpi-info">
        <p className="kpi-label">{label}</p>
        <p className="kpi-value" ref={ref}>{value}</p>
      </div>
    </div>
  );
}
