'use client';

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { crearIniciativa } from '@/lib/iniciativas/acciones';

const SelectorUbicacion = dynamic(
  () => import('@/components/mapa/SelectorUbicacion'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-sm text-neutral-500">
        Cargando mapa…
      </div>
    ),
  },
);

export default function FormNuevaIniciativa({
  initialLat,
  initialLng,
  zonaId,
  zonaNombre,
  huboError,
}: {
  initialLat: number;
  initialLng: number;
  zonaId: string | null;
  zonaNombre: string | null;
  huboError: boolean;
}) {
  const [coords, setCoords] = useState({ lat: initialLat, lng: initialLng });

  const inputCls =
    'min-h-11 w-full rounded-xl border border-neutral-300 bg-transparent px-3 dark:border-neutral-600';

  return (
    <form
      action={crearIniciativa}
      className="mx-auto flex w-full max-w-md flex-1 flex-col gap-3 px-4 py-4"
    >
      {huboError && (
        <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700 dark:bg-red-950/50">
          Revisá los campos: todos son obligatorios y los números deben ser
          válidos.
        </p>
      )}

      {zonaNombre && (
        <p className="rounded-lg bg-sky-50 p-2 text-sm text-sky-800 dark:bg-sky-950/50 dark:text-sky-200">
          Zona: <strong>{zonaNombre}</strong> — ubicación heredada.
        </p>
      )}

      {/* Ubicación con mapa chico */}
      <label className="text-sm font-semibold">Ubicación</label>
      <div className="h-52 w-full overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700">
        <SelectorUbicacion
          lat={coords.lat}
          lng={coords.lng}
          recenterKey={0}
          onChange={(lat, lng) => setCoords({ lat, lng })}
        />
      </div>
      <p className="text-xs text-neutral-500">
        {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)} — movés el pin o tocás el
        mapa para ajustar.
      </p>

      <input type="hidden" name="lat" value={coords.lat} />
      <input type="hidden" name="lng" value={coords.lng} />
      <input type="hidden" name="zona_id" value={zonaId ?? ''} />

      <label className="text-sm font-semibold">Nombre</label>
      <input
        name="nombre"
        required
        placeholder="Ej. Limpieza de playa El Tunco"
        defaultValue={zonaNombre ? `Limpieza de ${zonaNombre}` : ''}
        className={inputCls}
      />

      <label className="text-sm font-semibold">Descripción</label>
      <textarea
        name="descripcion"
        required
        rows={3}
        placeholder="¿Qué se hará en la jornada?"
        className="w-full rounded-xl border border-neutral-300 bg-transparent p-3 dark:border-neutral-600"
      />

      <label className="text-sm font-semibold">Tipo de causa</label>
      <input
        name="tipo_causa"
        required
        placeholder="Ej. Limpieza costera"
        className={inputCls}
      />

      <label className="text-sm font-semibold">Fecha de la jornada</label>
      <input name="fecha_jornada" type="date" required className={inputCls} />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-semibold">Cupo</label>
          <input
            name="cupo_max"
            type="number"
            min={1}
            required
            placeholder="20"
            className={inputCls}
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Horas sociales</label>
          <input
            name="horas_otorgadas"
            type="number"
            min={1}
            required
            placeholder="8"
            className={inputCls}
          />
        </div>
      </div>

      <label className="text-sm font-semibold">Monto requerido (USD)</label>
      <input
        name="monto_requerido"
        type="number"
        min={0}
        step="0.01"
        required
        placeholder="500.00"
        className={inputCls}
      />

      <div className="mt-2 flex gap-2">
        <Link
          href="/organizacion"
          className="flex min-h-12 flex-1 items-center justify-center rounded-xl border border-neutral-300 text-sm font-semibold dark:border-neutral-600"
        >
          Cancelar
        </Link>
        <button className="min-h-12 flex-1 rounded-xl bg-emerald-600 px-4 font-semibold text-white">
          Guardar borrador
        </button>
      </div>
    </form>
  );
}
