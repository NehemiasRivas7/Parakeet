'use client';

import dynamic from 'next/dynamic';
import type { IniciativaMapa } from './MapaIniciativas';

const MapaIniciativas = dynamic(() => import('./MapaIniciativas'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-brand-tint text-sm text-muted">
      Cargando mapa…
    </div>
  ),
});

export default function MapaIniciativasClient({
  iniciativas,
  hrefBase,
  cta,
  conZonas,
}: {
  iniciativas: IniciativaMapa[];
  hrefBase?: string;
  cta?: string;
  conZonas?: boolean;
}) {
  return (
    <div className="relative h-full w-full">
      <MapaIniciativas
        iniciativas={iniciativas}
        hrefBase={hrefBase}
        cta={cta}
        conZonas={conZonas}
      />
    </div>
  );
}
