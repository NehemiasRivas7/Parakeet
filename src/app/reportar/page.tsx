'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { TIPOS_CONTAMINACION } from '@/lib/reportes/tipos';
import type { TipoContaminacion } from '@/lib/database.types';

const SelectorUbicacion = dynamic(
  () => import('@/components/mapa/SelectorUbicacion'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-brand-tint text-sm text-muted">
        Cargando mapa…
      </div>
    ),
  },
);

const CENTRO_DEFAULT = { lat: 13.4936, lng: -89.3823 };

function ReportarForm() {
  const router = useRouter();
  const params = useSearchParams();
  // Si venís desde tu sesión (voluntario), volvés ahí en vez de a la vista pública.
  const volver = params.get('volver');
  const [coords, setCoords] = useState(CENTRO_DEFAULT);
  const [recenterKey, setRecenterKey] = useState(0);
  const [geoEstado, setGeoEstado] = useState<
    'buscando' | 'ok' | 'denegada' | 'noSoportada'
  >('buscando');
  const [tipo, setTipo] = useState<TipoContaminacion | null>(null);
  const [descripcion, setDescripcion] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function pedirUbicacion() {
    if (!('geolocation' in navigator)) {
      setGeoEstado('noSoportada');
      return;
    }
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

  useEffect(() => {
    pedirUbicacion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      if (volver) {
        router.push(volver);
      } else {
        router.push(`/mapa?zona=${data.zona_id}&ok=1`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error inesperado.');
      setEnviando(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 py-5">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-brand-dark">
          Reportar punto contaminado
        </h1>
        <Link
          href={volver || '/'}
          className="text-sm font-medium text-muted hover:text-accent"
        >
          Cancelar
        </Link>
      </header>

      <p className="-mt-2 text-sm text-muted">
        Sin registro. Ubicá el punto, elegí el tipo y enviá.
      </p>

      {/* 1. Ubicación */}
      <section className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-brand-dark">
          1. Ubicación
        </label>
        <div className="h-56 w-full overflow-hidden rounded-2xl border border-brand-soft/70 shadow-[0_8px_24px_-14px_rgba(0,99,65,0.25)]">
          <SelectorUbicacion
            lat={coords.lat}
            lng={coords.lng}
            recenterKey={recenterKey}
            onChange={(lat, lng) => setCoords({ lat, lng })}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted">
          <span>
            {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
          </span>
          <button
            type="button"
            onClick={pedirUbicacion}
            className="font-medium text-brand-mid hover:text-brand-dark"
          >
            Usar mi ubicación
          </button>
        </div>
        {geoEstado === 'denegada' && (
          <p className="text-xs text-accent">
            No pudimos acceder a tu ubicación. Movés el pin o tocás el mapa para
            ajustarla.
          </p>
        )}
        {geoEstado === 'noSoportada' && (
          <p className="text-xs text-accent">
            Tu navegador no soporta geolocalización. Tocá el mapa para marcar el
            punto.
          </p>
        )}
      </section>

      {/* 2. Tipo */}
      <section className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-brand-dark">
          2. Tipo de contaminación
        </label>
        <div className="flex flex-wrap gap-2">
          {TIPOS_CONTAMINACION.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTipo(t.value)}
              aria-pressed={tipo === t.value}
              className={`pk-chip ${tipo === t.value ? 'pk-chip-active' : ''}`}
            >
              <span>{t.emoji}</span>
              {t.label}
            </button>
          ))}
        </div>
      </section>

      {/* 3. Descripción */}
      <section className="flex flex-col gap-2">
        <label htmlFor="desc" className="text-sm font-semibold text-brand-dark">
          3. Descripción{' '}
          <span className="font-normal text-muted">(opcional)</span>
        </label>
        <textarea
          id="desc"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="¿Qué viste?"
          className="pk-input py-2.5"
        />
      </section>

      {error && (
        <p className="rounded-xl bg-accent-soft/60 px-3 py-2 text-sm font-medium text-accent">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={enviar}
        disabled={enviando}
        className="pk-btn pk-btn-accent min-h-12 text-base"
      >
        {enviando ? 'Enviando…' : 'Enviar reporte'}
      </button>
    </main>
  );
}

export default function ReportarPage() {
  return (
    <Suspense
      fallback={<div className="p-6 text-sm text-muted">Cargando…</div>}
    >
      <ReportarForm />
    </Suspense>
  );
}
