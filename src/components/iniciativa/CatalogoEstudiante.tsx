'use client';

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { IniciativaMapa } from '@/components/mapa/MapaIniciativas';

const MapaIniciativas = dynamic(() => import('@/components/mapa/MapaIniciativas'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-brand-tint text-sm text-muted">
      Cargando mapa…
    </div>
  ),
});

export type IniciativaCatalogo = IniciativaMapa & {
  categoria: string;
  zona_nombre: string | null;
  fecha_jornada: string;
  org_nombre: string;
  org_verificada: boolean;
  empresa_nombre: string | null;
};

const TODOS = 'Todas';

export default function CatalogoEstudiante({
  iniciativas,
}: {
  iniciativas: IniciativaCatalogo[];
}) {
  const [vista, setVista] = useState<'lista' | 'mapa'>('lista');
  const [fCategoria, setFCategoria] = useState(TODOS);
  const [fZona, setFZona] = useState(TODOS);
  const [soloConCupo, setSoloConCupo] = useState(false);

  // Opciones de filtro derivadas de los datos.
  const categorias = [
    TODOS,
    ...Array.from(new Set(iniciativas.map((i) => i.categoria))).sort(),
  ];
  const zonas = [
    TODOS,
    ...Array.from(
      new Set(iniciativas.map((i) => i.zona_nombre).filter((z): z is string => !!z)),
    ).sort(),
  ];

  const filtradas = iniciativas.filter(
    (i) =>
      (fCategoria === TODOS || i.categoria === fCategoria) &&
      (fZona === TODOS || i.zona_nombre === fZona) &&
      (!soloConCupo || i.cupos_restantes > 0),
  );

  const selCls =
    'min-h-9 rounded-full border border-brand-soft bg-white px-3 text-sm text-ink outline-none transition focus:border-brand';

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Toggle lista / mapa — control segmentado */}
      <div className="mx-auto w-full max-w-md px-4 pb-2">
        <div className="flex gap-1 rounded-full border border-brand-soft bg-white p-1">
          {(['lista', 'mapa'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVista(v)}
              className={`min-h-9 flex-1 rounded-full text-sm font-semibold transition ${
                vista === v ? 'bg-brand text-white shadow-sm' : 'text-muted'
              }`}
            >
              {v === 'lista' ? 'Lista' : 'Mapa'}
            </button>
          ))}
        </div>
      </div>

      {/* Filtros */}
      <div className="mx-auto flex w-full max-w-md flex-wrap items-center gap-2 px-4 pb-3">
        <select
          value={fCategoria}
          onChange={(e) => setFCategoria(e.target.value)}
          className={selCls}
          aria-label="Filtrar por categoría"
        >
          {categorias.map((c) => (
            <option key={c} value={c}>
              {c === TODOS ? 'Categoría: todas' : c}
            </option>
          ))}
        </select>
        <select
          value={fZona}
          onChange={(e) => setFZona(e.target.value)}
          className={selCls}
          aria-label="Filtrar por zona"
        >
          {zonas.map((z) => (
            <option key={z} value={z}>
              {z === TODOS ? 'Zona: todas' : z}
            </option>
          ))}
        </select>
        <label className="flex cursor-pointer items-center gap-1.5 text-sm text-muted">
          <input
            type="checkbox"
            checked={soloConCupo}
            onChange={(e) => setSoloConCupo(e.target.checked)}
            className="accent-brand"
          />
          Con cupo
        </label>
      </div>

      {filtradas.length === 0 && (
        <p className="mx-auto mt-6 w-full max-w-md px-4 text-center text-sm text-muted">
          {iniciativas.length === 0
            ? 'No hay iniciativas con inscripción abierta por ahora. Volvé pronto.'
            : 'Ninguna iniciativa coincide con los filtros.'}
        </p>
      )}

      {vista === 'lista' ? (
        <ul className="mx-auto flex w-full max-w-md flex-col gap-3 overflow-y-auto px-4 pb-5">
          {filtradas.map((ini) => (
            <li key={ini.id}>
              <Link
                href={`/estudiante/iniciativa/${ini.id}`}
                className="block pk-card p-4 transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-14px_rgba(0,99,65,0.3)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold leading-tight text-brand-dark">
                    {ini.nombre}
                  </h3>
                  {ini.org_verificada && (
                    <span
                      title="Organización verificada por Parakeet"
                      className="shrink-0 rounded-full bg-brand-tint px-2 py-0.5 text-xs font-semibold text-brand-dark"
                    >
                      ✓ Verificada
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted">
                  {ini.org_nombre}
                  {ini.empresa_nombre ? ` · patrocina ${ini.empresa_nombre}` : ''}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-brand-tint px-2.5 py-1 text-xs font-medium text-brand-dark">
                    {ini.categoria}
                  </span>
                  <span className="rounded-full bg-brand-tint px-2.5 py-1 text-xs font-medium text-brand-dark">
                    📅 {ini.fecha_jornada}
                  </span>
                  <span className="rounded-full bg-brand-tint px-2.5 py-1 text-xs font-medium text-brand-dark">
                    ⏱️ {ini.horas_otorgadas} h
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      ini.cupos_restantes > 0
                        ? 'bg-brand text-white'
                        : 'bg-accent-soft text-accent'
                    }`}
                  >
                    {ini.cupos_restantes > 0
                      ? `${ini.cupos_restantes} cupos`
                      : 'Lleno'}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="relative min-h-0 flex-1 px-3 pb-3">
          <div className="h-full w-full overflow-hidden rounded-2xl border border-brand-soft/70">
            <MapaIniciativas iniciativas={filtradas} />
          </div>
        </div>
      )}
    </div>
  );
}
