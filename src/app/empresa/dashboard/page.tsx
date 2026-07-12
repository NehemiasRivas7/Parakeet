import { createAdminClient } from '@/lib/supabase/admin';
import { requireEmpresa } from '@/lib/auth';
import BadgeEstado from '@/components/iniciativa/BadgeEstado';
import { LABEL_NIVEL } from '@/lib/zonas/gravedad';
import type { EstadoIniciativa, NivelGravedad } from '@/lib/database.types';

export const dynamic = 'force-dynamic';

type IniRel = {
  id: string;
  nombre: string;
  estado: EstadoIniciativa;
  cupo_max: number;
  horas_otorgadas: number;
  fecha_jornada: string;
  zonas: { nombre: string; nivel_gravedad: NivelGravedad } | { nombre: string; nivel_gravedad: NivelGravedad }[] | null;
};

function unwrap<T>(rel: T | T[] | null): T | null {
  return Array.isArray(rel) ? (rel[0] ?? null) : rel;
}

export default async function EmpresaDashboardPage() {
  const { empresa } = await requireEmpresa();
  const admin = createAdminClient();

  const { data: fins } = await admin
    .from('financiamientos')
    .select(
      'monto, confirmado_en, iniciativas(id, nombre, estado, cupo_max, horas_otorgadas, fecha_jornada, zonas(nombre, nivel_gravedad))',
    )
    .eq('empresa_id', empresa.id)
    .order('confirmado_en', { ascending: false });

  const registros = (fins ?? []).map((f) => ({
    monto: Number(f.monto),
    ini: unwrap(f.iniciativas as IniRel | IniRel[] | null),
  }));

  // Conteo de inscripciones en vivo por iniciativa.
  const ids = registros.map((r) => r.ini?.id).filter((x): x is string => !!x);
  const conteo: Record<string, number> = {};
  if (ids.length > 0) {
    const { data: insc } = await admin
      .from('inscripciones')
      .select('iniciativa_id')
      .in('iniciativa_id', ids);
    for (const r of insc ?? []) {
      conteo[r.iniciativa_id] = (conteo[r.iniciativa_id] ?? 0) + 1;
    }
  }

  const totalInvertido = registros.reduce((s, r) => s + r.monto, 0);
  const totalInscritos = ids.reduce((s, id) => s + (conteo[id] ?? 0), 0);
  const horasImpacto = registros.reduce(
    (s, r) => s + (r.ini ? (conteo[r.ini.id] ?? 0) * r.ini.horas_otorgadas : 0),
    0,
  );

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-md px-4 py-4">
        {/* Métricas */}
        <section className="mb-5 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
            <div className="text-2xl font-bold">${totalInvertido.toFixed(2)}</div>
            <div className="text-xs text-neutral-500">Invertido</div>
          </div>
          <div className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
            <div className="text-2xl font-bold">{registros.length}</div>
            <div className="text-xs text-neutral-500">Iniciativas</div>
          </div>
          <div className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
            <div className="text-2xl font-bold">{totalInscritos}</div>
            <div className="text-xs text-neutral-500">Estudiantes inscritos</div>
          </div>
          <div className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
            <div className="text-2xl font-bold">{horasImpacto}</div>
            <div className="text-xs text-neutral-500">Horas de impacto</div>
          </div>
        </section>

        <h2 className="mb-3 font-semibold">Mis financiamientos</h2>

        {registros.length === 0 && (
          <p className="rounded-xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500 dark:border-neutral-700">
            Todavía no financiaste ninguna iniciativa. Mirá el catálogo o el mapa.
          </p>
        )}

        <ul className="flex flex-col gap-3">
          {registros.map((r, idx) => {
            if (!r.ini) return null;
            const zona = unwrap(r.ini.zonas);
            const inscritos = conteo[r.ini.id] ?? 0;
            return (
              <li
                key={idx}
                className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold leading-tight">{r.ini.nombre}</h3>
                  <BadgeEstado estado={r.ini.estado} />
                </div>
                <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-neutral-500">
                  <div>💵 ${r.monto.toFixed(2)}</div>
                  <div>📅 {r.ini.fecha_jornada}</div>
                  <div>
                    👥 {inscritos}/{r.ini.cupo_max} inscritos
                  </div>
                  {zona && (
                    <div>
                      📍 {zona.nombre} · {LABEL_NIVEL[zona.nivel_gravedad]}
                    </div>
                  )}
                </dl>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
