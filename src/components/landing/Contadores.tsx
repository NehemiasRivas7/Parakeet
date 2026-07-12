'use client';

import { useEffect, useRef, useState } from 'react';

export type Metrica = { valor: number; etiqueta: string; sufijo?: string };

function useContador(objetivo: number, activo: boolean, ms = 1300) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!activo) return;
    let raf = 0;
    const inicio = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - inicio) / ms);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(objetivo * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [objetivo, activo, ms]);
  return n;
}

// Separador de miles determinista (sin locale) para evitar mismatch de hidratación.
function formatNum(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function Tarjeta({ m, activo }: { m: Metrica; activo: boolean }) {
  const n = useContador(m.valor, activo);
  return (
    <div className="pk-card p-4 text-center">
      <div
        className="text-3xl font-extrabold text-brand sm:text-4xl"
        suppressHydrationWarning
      >
        {formatNum(n)}
        {m.sufijo}
      </div>
      <div className="mt-1 text-xs font-medium text-muted">{m.etiqueta}</div>
    </div>
  );
}

export default function Contadores({ metricas }: { metricas: Metrica[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {metricas.map((m) => (
        <Tarjeta key={m.etiqueta} m={m} activo={visible} />
      ))}
    </div>
  );
}
