'use client';

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { IniciativaMapa } from '@/components/mapa/MapaIniciativas';

const MapaIniciativas = dynamic(() => import('@/components/mapa/MapaIniciativas'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-sm text-neutral-500 dark:bg-neutral-900">
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
    'min-h-9 rounded-full border border-neutral-300 bg-transparent px-3 text-sm dark:border-neutral-600';

  return (
    <div className="flex flex-1 flex-col">
      {/* Toggle lista / mapa */}
      <div className="mx-auto flex w-full max-w-md gap-2 px-4 pb-2">
        {(['lista', 'mapa'] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setVista(v)}
            className={`min-h-10 flex-1 rounded-full text-sm font-semibold transition ${
              vista === v
                ? 'bg-emerald-600 text-white'
                : 'border border-neutral-300 dark:border-neutral-600'
            }`}
          >
            {v === 'lista' ? 'Lista' : 'Mapa'}
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div className="mx-auto flex w-full max-w-md flex-wrap items-center gap-2 px-4 pb-2">
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
        <label className="flex items-center gap-1.5 text-sm text-neutral-500">
          <input
            type="checkbox"
            checked={soloConCupo}
            onChange={(e) => setSoloConCupo(e.target.checked)}
          />
          Con cupo
        </label>
      </div>

      {filtradas.length === 0 && (
        <p className="mx-auto mt-6 w-full max-w-md px-4 text-center text-sm text-neutral-500">
          {iniciativas.length === 0
            ? 'No hay iniciativas con inscripción abierta por ahora. Volvé pronto.'
            : 'Ninguna iniciativa coincide con los filtros.'}
        </p>
      )}

      {vista === 'lista' ? (
        <ul className="mx-auto flex w-full max-w-md flex-col gap-3 px-4 pb-4">
          {filtradas.map((ini) => (
            <li key={ini.id}>
              <Link
                href={`/estudiante/iniciativa/${ini.id}`}
                className="block rounded-xl border border-neutral-200 p-4 dark:border-neutral-800"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold leading-tight">{ini.nombre}</h3>
                  {ini.org_verificada && (
                    <span
                      title="Organización verificada por Parakeet"
                      className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
                    >
                      ✓ Verificada
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-500">
                  {ini.org_nombre}
                  {ini.empresa_nombre ? ` · patrocina ${ini.empresa_nombre}` : ''}
                </p>
                <dl className="mt-2 grid grid-cols-3 gap-2 text-xs text-neutral-500">
                  <div>📅 {ini.fecha_jornada}</div>
                  <div>⏱️ {ini.horas_otorgadas} h</div>
                  <div>
                    👥 {ini.cupos_restantes > 0 ? `${ini.cupos_restantes} cupos` : 'Lleno'}
                  </div>
                </dl>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="relative min-h-0 flex-1">
          <MapaIniciativas iniciativas={filtradas} />
        </div>
      )}
    </div>
  );
}
