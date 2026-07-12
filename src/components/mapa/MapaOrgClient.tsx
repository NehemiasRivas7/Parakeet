'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const MapaOrganizacion = dynamic(() => import('./MapaOrganizacion'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-sm text-neutral-500 dark:bg-neutral-900">
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
    <div className="relative flex-1">
      <MapaOrganizacion seleccion={seleccion} onSeleccionar={(lat, lng) => setSeleccion({ lat, lng })} />

      <div className="pointer-events-none absolute inset-x-0 top-2 z-[1000] flex justify-center px-4">
        <p className="pointer-events-auto rounded-full bg-white/90 px-3 py-1.5 text-xs shadow-md dark:bg-neutral-800/90">
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
            className="min-h-12 rounded-full bg-emerald-600 px-6 font-semibold text-white shadow-lg"
          >
            Crear iniciativa aquí →
          </button>
        </div>
      )}
    </div>
  );
}
