'use client';

import dynamic from 'next/dynamic';
import { COLOR_NIVEL, LABEL_NIVEL } from '@/lib/zonas/gravedad';
import type { NivelGravedad } from '@/lib/database.types';

// Leaflet revienta en SSR -> import dinamico sin server render.
const HeatmapZonas = dynamic(() => import('./HeatmapZonas'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-sm text-neutral-500 dark:bg-neutral-900">
      Cargando mapa…
    </div>
  ),
});

const NIVELES: NivelGravedad[] = ['critico', 'alto', 'medio', 'bajo', 'recuperada'];

export default function MapaPublico({ focusZonaId }: { focusZonaId?: string }) {
  return (
    <div className="relative h-full w-full">
      <HeatmapZonas focusZonaId={focusZonaId} />
      <div className="pointer-events-none absolute bottom-3 left-3 z-[1000] rounded-lg bg-white/90 p-2 text-xs shadow-md dark:bg-neutral-800/90">
        <div className="mb-1 font-semibold">Gravedad</div>
        <ul className="space-y-0.5">
          {NIVELES.map((n) => (
            <li key={n} className="flex items-center gap-1.5">
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
