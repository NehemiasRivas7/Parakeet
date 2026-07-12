'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const MapaOrganizacion = dynamic(() => import('./MapaOrganizacion'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-brand-tint text-sm text-muted">
      Cargando mapa…
    </div>
  ),
});

export default function MapaOrgClient() {
  const router = useRouter();
  const [seleccion, setSeleccion] = useState<{ lat: number; lng: number } | null>(
    null,
  );

  return (
    <div className="relative min-h-0 flex-1">
      <MapaOrganizacion seleccion={seleccion} onSeleccionar={(lat, lng) => setSeleccion({ lat, lng })} />

      <div className="pointer-events-none absolute inset-x-0 top-3 z-[1000] flex justify-center px-4">
        <p className="pointer-events-auto rounded-full border border-brand-soft/70 bg-white/90 px-3.5 py-1.5 text-xs font-medium text-brand-dark shadow-md backdrop-blur">
          Tocá un punto del mapa para crear una iniciativa ahí.
        </p>
      </div>

      {seleccion && (
        <div className="absolute inset-x-0 bottom-4 z-[1000] flex justify-center px-4">
          <button
            type="button"
            onClick={() =>
              router.push(
                `/organizacion/nueva?lat=${seleccion.lat}&lng=${seleccion.lng}`,
              )
            }
            className="pk-btn pk-btn-primary min-h-12 rounded-full px-6 text-base shadow-lg"
          >
            Crear iniciativa aquí →
          </button>
        </div>
      )}
    </div>
  );
}
