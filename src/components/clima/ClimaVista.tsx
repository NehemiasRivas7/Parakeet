'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Clima } from './MapaClima';

const MapaClima = dynamic(() => import('./MapaClima'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-brand-tint text-sm text-muted">
      Cargando mapa…
    </div>
  ),
});

type Zona = { id: string; nombre: string; lat: number; lng: number };

export default function ClimaVista({
  zonas,
  fechasJornadas,
  fechaHoy,
}: {
  zonas: Zona[];
  fechasJornadas: string[];
  fechaHoy: string;
}) {
  const [fecha, setFecha] = useState(fechaHoy);
  const [clima, setClima] = useState<Record<string, Clima | null>>({});
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    (async () => {
      const entradas = await Promise.all(
        zonas.map(async (z) => {
          try {
            const r = await fetch(
              `/api/clima?lat=${z.lat}&lon=${z.lng}&fecha=${fecha}`,
            );
            return [z.id, (await r.json()) as Clima] as const;
          } catch {
            return [z.id, null] as const;
          }
        }),
      );
      if (!cancelado) {
        setClima(Object.fromEntries(entradas));
        setCargando(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [fecha, zonas]);

  const zonasConClima = zonas.map((z) => ({ ...z, clima: clima[z.id] }));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-brand-soft/70 bg-white/60 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex w-full max-w-md flex-wrap items-center gap-2">
          <label className="text-sm font-semibold text-brand-dark">Fecha</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="min-h-9 rounded-full border border-brand-soft bg-white px-3 text-sm text-ink outline-none focus:border-brand"
          />
          {cargando && <span className="text-xs text-muted">Cargando clima…</span>}
        </div>
        {fechasJornadas.length > 0 && (
          <div className="mx-auto mt-2 flex w-full max-w-md flex-wrap gap-1.5">
            <span className="text-xs text-muted">Mis jornadas:</span>
            {fechasJornadas.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFecha(f)}
                className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition ${
                  fecha === f
                    ? 'border-brand bg-brand text-white'
                    : 'border-brand-soft text-brand-dark hover:bg-brand-tint'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative min-h-0 flex-1 p-3">
        <div className="h-full w-full overflow-hidden rounded-2xl border border-brand-soft/70">
          <MapaClima zonas={zonasConClima} />
        </div>
      </div>
    </div>
  );
}
