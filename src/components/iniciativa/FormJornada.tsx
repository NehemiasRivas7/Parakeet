'use client';

import { useState } from 'react';
import { cerrarJornada } from '@/lib/iniciativas/acciones';

type Inscrito = {
  inscripcionId: string;
  nombre: string;
  institucion: string;
};

const PRESETS = [
  { metrica: 'Basura recolectada', unidad: 'kg' },
  { metrica: 'Área limpiada', unidad: 'm²' },
  { metrica: 'Bolsas llenadas', unidad: 'bolsas' },
  { metrica: 'Árboles plantados', unidad: 'árboles' },
];

export default function FormJornada({
  iniciativaId,
  inscritos,
}: {
  iniciativaId: string;
  inscritos: Inscrito[];
}) {
  const [asistencia, setAsistencia] = useState<Record<string, boolean>>(
    Object.fromEntries(inscritos.map((i) => [i.inscripcionId, true])),
  );
  const [metricas, setMetricas] = useState<
    { metrica: string; valor: string; unidad: string }[]
  >([{ metrica: 'Basura recolectada', valor: '', unidad: 'kg' }]);

  const inputCls = 'pk-input';

  function actualizarMetrica(i: number, campo: string, valor: string) {
    setMetricas((prev) =>
      prev.map((m, idx) => (idx === i ? { ...m, [campo]: valor } : m)),
    );
  }

  const asistieronCount = Object.values(asistencia).filter(Boolean).length;

  return (
    <form
      action={cerrarJornada}
      className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 py-4"
    >
      <input type="hidden" name="id" value={iniciativaId} />

      {/* Asistencia */}
      <section>
        <h3 className="mb-1 font-semibold text-brand-dark">
          Asistencia ({asistieronCount}/{inscritos.length})
        </h3>
        <p className="mb-3 text-xs text-muted">
          Marcá quién asistió. Solo ellos reciben horas y stamp.
        </p>
        {inscritos.length === 0 ? (
          <p className="rounded-xl border border-dashed border-brand-soft p-4 text-center text-sm text-muted">
            Nadie se inscribió a esta jornada.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {inscritos.map((ins) => {
              const marcado = asistencia[ins.inscripcionId];
              return (
                <li key={ins.inscripcionId}>
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                      marcado
                        ? 'border-brand bg-brand-tint'
                        : 'border-brand-soft/70 bg-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      name="asistio"
                      value={ins.inscripcionId}
                      checked={!!marcado}
                      onChange={(e) =>
                        setAsistencia((prev) => ({
                          ...prev,
                          [ins.inscripcionId]: e.target.checked,
                        }))
                      }
                      className="h-5 w-5 accent-brand"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-ink">
                        {ins.nombre}
                      </span>
                      <span className="block truncate text-xs text-muted">
                        {ins.institucion}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Cuantificación */}
      <section>
        <h3 className="mb-1 font-semibold text-brand-dark">
          Impacto cuantificado
        </h3>
        <p className="mb-3 text-xs text-muted">
          ¿Qué lograron? Estos números alimentan el impacto de cada rol.
        </p>

        <div className="mb-3 flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.metrica}
              type="button"
              onClick={() =>
                setMetricas((prev) => [
                  ...prev,
                  { metrica: p.metrica, valor: '', unidad: p.unidad },
                ])
              }
              className="rounded-full border border-brand-soft px-3 py-1 text-xs font-medium text-brand-dark transition hover:bg-brand-tint"
            >
              + {p.metrica}
            </button>
          ))}
        </div>

        <ul className="flex flex-col gap-2">
          {metricas.map((m, i) => (
            <li key={i} className="flex items-center gap-2">
              <input
                name="metrica_nombre"
                value={m.metrica}
                onChange={(e) => actualizarMetrica(i, 'metrica', e.target.value)}
                placeholder="Métrica"
                className={`${inputCls} flex-1`}
              />
              <input
                name="metrica_valor"
                value={m.valor}
                onChange={(e) => actualizarMetrica(i, 'valor', e.target.value)}
                type="number"
                inputMode="decimal"
                placeholder="0"
                className={`${inputCls} w-20`}
              />
              <input
                name="metrica_unidad"
                value={m.unidad}
                onChange={(e) => actualizarMetrica(i, 'unidad', e.target.value)}
                placeholder="ud."
                className={`${inputCls} w-20`}
              />
              <button
                type="button"
                onClick={() =>
                  setMetricas((prev) => prev.filter((_, idx) => idx !== i))
                }
                aria-label="Quitar"
                className="shrink-0 text-lg text-muted hover:text-accent"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() =>
            setMetricas((prev) => [...prev, { metrica: '', valor: '', unidad: '' }])
          }
          className="mt-2 text-sm font-medium text-brand-mid"
        >
          + Agregar métrica
        </button>
      </section>

      <button className="pk-btn pk-btn-primary min-h-12 text-base">
        Cerrar jornada y publicar impacto
      </button>
      <p className="-mt-2 text-center text-xs text-muted">
        Al cerrar: se acreditan horas y stamps, y la zona baja de nivel en el
        mapa.
      </p>
    </form>
  );
}
