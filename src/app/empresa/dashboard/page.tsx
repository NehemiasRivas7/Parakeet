import { createAdminClient } from '@/lib/supabase/admin';
import { requireEmpresa } from '@/lib/auth';
import BadgeEstado from '@/components/iniciativa/BadgeEstado';
import TarjetaAntesDespues from '@/components/impacto/TarjetaAntesDespues';
import MetricasImpacto, {
  type ResultadoMetrica,
} from '@/components/impacto/MetricasImpacto';
import { LABEL_NIVEL } from '@/lib/zonas/gravedad';
import type { EstadoIniciativa, NivelGravedad } from '@/lib/database.types';

export const dynamic = 'force-dynamic';

type Zona = {
  nombre: string;
  nivel_inicial: NivelGravedad;
  nivel_gravedad: NivelGravedad;
};
type IniRel = {
  id: string;
  nombre: string;
  estado: EstadoIniciativa;
  cupo_max: number;
  horas_otorgadas: number;
  fecha_jornada: string;
  zonas: Zona | Zona[] | null;
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
      'monto, confirmado_en, iniciativas(id, nombre, estado, cupo_max, horas_otorgadas, fecha_jornada, zonas(nombre, nivel_inicial, nivel_gravedad))',
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

  // Impacto de las iniciativas completadas que financió esta empresa.
  const completadas = registros.filter((r) => r.ini?.estado === 'completada');
  const idsCompletadas = completadas
    .map((r) => r.ini?.id)
    .filter((x): x is string => !!x);
  let impacto: ResultadoMetrica[] = [];
  if (idsCompletadas.length > 0) {
    const { data: res } = await admin
      .from('resultados_jornada')
      .select('metrica, valor, unidad')
      .in('iniciativa_id', idsCompletadas);
    const acc = new Map<string, ResultadoMetrica>();
    for (const r of res ?? []) {
      const clave = `${r.metrica}|${r.unidad}`;
      const prev = acc.get(clave);
      acc.set(clave, {
        metrica: r.metrica,
        unidad: r.unidad,
        valor: (prev?.valor ?? 0) + (r.valor ?? 0),
      });
    }
    impacto = Array.from(acc.values());
  }
  const zonaRepresentativa = completadas
    .map((r) => unwrap(r.ini?.zonas ?? null))
    .find((z): z is Zona => !!z);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-md px-4 py-4">
        {/* Métricas */}
        <section className="mb-5 grid grid-cols-2 gap-2.5">
          <div className="col-span-2 rounded-2xl bg-gradient-to-br from-brand-dark to-brand p-4 text-white shadow-[0_14px_30px_-14px_rgba(0,99,65,0.5)]">
            <div className="text-3xl font-bold leading-none">
              ${totalInvertido.toFixed(2)}
            </div>
            <div className="mt-1 text-xs text-white/80">Total invertido en RSE</div>
          </div>
          <div className="pk-card p-3">
            <div className="text-2xl font-bold text-brand-dark">{registros.length}</div>
            <div className="text-xs text-muted">Iniciativas</div>
          </div>
          <div className="pk-card p-3">
            <div className="text-2xl font-bold text-brand-dark">{totalInscritos}</div>
            <div className="text-xs text-muted">Voluntarios</div>
          </div>
          <div className="pk-card col-span-2 p-3">
            <div className="text-2xl font-bold text-brand-dark">{horasImpacto}</div>
            <div className="text-xs text-muted">Horas de impacto generadas</div>
          </div>
        </section>

        {/* Impacto generado (iniciativas completadas) */}
        {(impacto.length > 0 || zonaRepresentativa) && (
          <section className="mb-6">
            <h2 className="mb-2 font-semibold text-brand-dark">
              Impacto generado
            </h2>
            {zonaRepresentativa && (
              <div className="mb-3">
                <TarjetaAntesDespues
                  nivelInicial={zonaRepresentativa.nivel_inicial}
                  nivelActual={zonaRepresentativa.nivel_gravedad}
                />
              </div>
            )}
            <MetricasImpacto metricas={impacto} />
          </section>
        )}

        <h2 className="mb-3 font-semibold text-brand-dark">Mis financiamientos</h2>

        {registros.length === 0 && (
          <p className="rounded-2xl border border-dashed border-brand-soft p-6 text-center text-sm text-muted">
            Todavía no financiaste ninguna iniciativa. Mirá el catálogo o el mapa.
          </p>
        )}

        <ul className="flex flex-col gap-3">
          {registros.map((r, idx) => {
            if (!r.ini) return null;
            const zona = unwrap(r.ini.zonas);
            const inscritos = conteo[r.ini.id] ?? 0;
            return (
              <li key={idx} className="pk-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold leading-tight text-brand-dark">
                    {r.ini.nombre}
                  </h3>
                  <BadgeEstado estado={r.ini.estado} />
                </div>
                <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted">
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
