'use client';

import dynamic from 'next/dynamic';
import type { IniciativaMapa } from './MapaIniciativas';

const MapaIniciativas = dynamic(() => import('./MapaIniciativas'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-sm text-neutral-500 dark:bg-neutral-900">
      Cargando mapa…
    </div>
  ),
});

export default function MapaIniciativasClient({
  iniciativas,
  hrefBase,
  cta,
}: {
  iniciativas: IniciativaMapa[];
  hrefBase?: string;
  cta?: string;
}) {
  return (
    <div className="relative min-h-0 flex-1">
      <MapaIniciativas iniciativas={iniciativas} hrefBase={hrefBase} cta={cta} />
    </div>
  );
}
