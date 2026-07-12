'use client';

import dynamic from 'next/dynamic';
import { COLOR_NIVEL, LABEL_NIVEL } from '@/lib/zonas/gravedad';
import type { NivelGravedad } from '@/lib/database.types';

// Leaflet revienta en SSR -> import dinamico sin server render.
const HeatmapZonas = dynamic(() => import('./HeatmapZonas'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-brand-tint text-sm text-muted">
      Cargando mapa…
    </div>
  ),
});

const NIVELES: NivelGravedad[] = ['critico', 'alto', 'medio', 'bajo', 'recuperada'];

export default function MapaPublico({ focusZonaId }: { focusZonaId?: string }) {
  return (
    <div className="relative h-full w-full">
      <HeatmapZonas focusZonaId={focusZonaId} />
      <div className="pointer-events-none absolute bottom-3 left-3 z-[1000] rounded-xl border border-brand-soft/70 bg-white/90 p-2.5 text-xs shadow-lg backdrop-blur">
        <div className="mb-1 font-semibold text-brand-dark">Gravedad</div>
        <ul className="space-y-1">
          {NIVELES.map((n) => (
            <li key={n} className="flex items-center gap-1.5 text-ink">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: COLOR_NIVEL[n] }}
              />
              {LABEL_NIVEL[n]}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
