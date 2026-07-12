'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { TIPOS_CONTAMINACION } from '@/lib/reportes/tipos';
import type { TipoContaminacion } from '@/lib/database.types';

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

const CENTRO_DEFAULT = { lat: 13.4936, lng: -89.3823 }; // Playa El Tunco

export default function ReportarPage() {
  const router = useRouter();
  const [coords, setCoords] = useState(CENTRO_DEFAULT);
  const [recenterKey, setRecenterKey] = useState(0);
  const [geoEstado, setGeoEstado] = useState<
    'buscando' | 'ok' | 'denegada' | 'noSoportada'
  >('buscando');
  const [tipo, setTipo] = useState<TipoContaminacion | null>(null);
  const [descripcion, setDescripcion] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setGeoEstado('noSoportada');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setRecenterKey((k) => k + 1);
        setGeoEstado('ok');
      },
      () => setGeoEstado('denegada'),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  function usarMiUbicacion() {
    setGeoEstado('buscando');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setRecenterKey((k) => k + 1);
        setGeoEstado('ok');
      },
      () => setGeoEstado('denegada'),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  async function enviar() {
    if (!tipo) {
      setError('Seleccioná el tipo de contaminación.');
      return;
    }
    setEnviando(true);
    setError(null);
    try {
      const resp = await fetch('/api/reportes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: coords.lat,
          lng: coords.lng,
          tipo_contaminacion: tipo,
          descripcion: descripcion.trim() || null,
        }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.ok) {
        throw new Error(data.reason ?? 'No se pudo enviar el reporte.');
      }
      router.push(`/?zona=${data.zona_id}&ok=1`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error inesperado.');
      setEnviando(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 py-5">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Reportar punto contaminado</h1>
        <Link href="/" className="text-sm text-neutral-500 underline">
          Cancelar
        </Link>
      </header>

      <p className="text-sm text-neutral-500">
        Sin registro. Ubicá el punto, elegí el tipo y enviá.
      </p>

      {/* 1. Ubicación */}
      <section className="flex flex-col gap-2">
        <label className="text-sm font-semibold">1. Ubicación</label>
        <div className="h-56 w-full overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700">
          <SelectorUbicacion
            lat={coords.lat}
            lng={coords.lng}
            recenterKey={recenterKey}
            onChange={(lat, lng) => setCoords({ lat, lng })}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span>
            {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
          </span>
          <button
            type="button"
            onClick={usarMiUbicacion}
            className="underline"
          >
            Usar mi ubicación
          </button>
        </div>
        {geoEstado === 'buscando' && (
          <p className="text-xs text-neutral-400">Buscando tu ubicación…</p>
        )}
        {geoEstado === 'denegada' && (
          <p className="text-xs text-amber-600">
            No pudimos acceder a tu ubicación. Movés el pin o tocás el mapa para
            ajustarla.
          </p>
        )}
        {geoEstado === 'noSoportada' && (
          <p className="text-xs text-amber-600">
            Tu navegador no soporta geolocalización. Tocá el mapa para marcar el
            punto.
          </p>
        )}
      </section>

      {/* 2. Tipo */}
      <section className="flex flex-col gap-2">
        <label className="text-sm font-semibold">2. Tipo de contaminación</label>
        <div className="flex flex-wrap gap-2">
          {TIPOS_CONTAMINACION.map((t) => {
            const activo = tipo === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setTipo(t.value)}
                aria-pressed={activo}
                className={`flex min-h-11 items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition ${
                  activo
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-neutral-300 bg-transparent dark:border-neutral-600'
                }`}
              >
                <span>{t.emoji}</span>
                {t.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Descripción */}
      <section className="flex flex-col gap-2">
        <label htmlFor="desc" className="text-sm font-semibold">
          3. Descripción{' '}
          <span className="font-normal text-neutral-400">(opcional)</span>
        </label>
        <textarea
          id="desc"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="¿Qué viste? (opcional)"
          className="w-full rounded-xl border border-neutral-300 bg-transparent p-3 text-sm dark:border-neutral-600"
        />
      </section>

      {error && (
        <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700 dark:bg-red-950/50">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={enviar}
        disabled={enviando}
        className="mt-1 min-h-12 rounded-xl bg-emerald-600 px-4 py-3 text-base font-semibold text-white transition disabled:opacity-60"
      >
        {enviando ? 'Enviando…' : 'Enviar reporte'}
      </button>
    </main>
  );
}
