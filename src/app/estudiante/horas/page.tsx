import { createAdminClient } from '@/lib/supabase/admin';
import { requireEstudiante } from '@/lib/auth';
import MetricasImpacto, {
  type ResultadoMetrica,
} from '@/components/impacto/MetricasImpacto';

export const dynamic = 'force-dynamic';

const BADGES = [
  { umbral: 1, nombre: 'Primera jornada' },
  { umbral: 3, nombre: 'Tres jornadas' },
  { umbral: 5, nombre: 'Cinco jornadas' },
];

function unwrap<T>(rel: T | T[] | null): T | null {
  return Array.isArray(rel) ? (rel[0] ?? null) : rel;
}

export default async function HorasPage() {
  const { estudiante } = await requireEstudiante();
  const admin = createAdminClient();

  const [{ data: inscripciones }, { data: stamps }] = await Promise.all([
    admin
      .from('inscripciones')
      .select(
        'id, iniciativas(id, nombre, fecha_jornada, horas_otorgadas), asistencias(asistio, horas_acreditadas)',
      )
      .eq('estudiante_id', estudiante.id)
      .order('inscrito_en', { ascending: false }),
    admin
      .from('stamps')
      .select('tipo, otorgado_en, iniciativas(nombre)')
      .eq('estudiante_id', estudiante.id)
      .order('otorgado_en', { ascending: false }),
  ]);

  const historial = inscripciones ?? [];
  const listaStamps = stamps ?? [];
  const jornadas = listaStamps.length;

  // Impacto agregado de las jornadas donde asistió.
  const idsAsistidas = historial
    .filter((h) => unwrap(h.asistencias)?.asistio)
    .map((h) => unwrap(h.iniciativas)?.id)
    .filter((x): x is string => !!x);

  let impacto: ResultadoMetrica[] = [];
  if (idsAsistidas.length > 0) {
    const { data: res } = await admin
      .from('resultados_jornada')
      .select('metrica, valor, unidad')
      .in('iniciativa_id', idsAsistidas);
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

  const acumuladas = estudiante.horas_acumuladas;
  const requeridas = estudiante.horas_requeridas;
  const restantes = Math.max(0, requeridas - acumuladas);
  const pct =
    requeridas > 0 ? Math.min(100, Math.round((acumuladas / requeridas) * 100)) : 0;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-md px-4 py-4">
        {/* Progreso */}
        <section className="my-4 rounded-2xl bg-gradient-to-br from-brand-dark to-brand p-5 text-white shadow-[0_14px_30px_-12px_rgba(0,99,65,0.5)]">
          <div className="flex items-end justify-between">
            <span className="text-4xl font-bold leading-none">{acumuladas}</span>
            <span className="text-sm text-white/80">de {requeridas} h</span>
          </div>
          <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-white/25">
            <div
              className="h-full rounded-full bg-white transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-white/85">
            {restantes > 0 ? `Te faltan ${restantes} h` : '¡Horas completas!'}
          </p>
        </section>

        {/* Tu impacto */}
        {impacto.length > 0 && (
          <section className="mb-5">
            <h2 className="mb-2 font-semibold text-brand-dark">
              Tu impacto acumulado
            </h2>
            <MetricasImpacto metricas={impacto} />
          </section>
        )}

        {/* Badges */}
        <section className="mb-5">
          <h2 className="mb-2 font-semibold text-brand-dark">Badges</h2>
          <div className="grid grid-cols-3 gap-2">
            {BADGES.map((b) => {
              const logrado = jornadas >= b.umbral;
              return (
                <div
                  key={b.umbral}
                  className={`flex flex-col items-center rounded-2xl border p-3 text-center ${
                    logrado
                      ? 'border-brand bg-brand-tint'
                      : 'border-brand-soft/60 bg-white opacity-60'
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold ${
                      logrado
                        ? 'bg-brand text-white'
                        : 'bg-brand-soft text-brand-mid'
                    }`}
                  >
                    {logrado ? '✓' : b.umbral}
                  </span>
                  <span className="mt-1.5 text-[11px] font-medium text-brand-dark">
                    {b.nombre}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Sellos (green passport) */}
        <section className="mb-5">
          <h2 className="mb-2 font-semibold text-brand-dark">
            Sellos ({jornadas})
          </h2>
          {jornadas === 0 ? (
            <p className="text-sm text-muted">
              Aún no tenés sellos. Ganás uno al asistir a una jornada.
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {listaStamps.map((s, i) => {
                const ini = unwrap(s.iniciativas);
                return (
                  <div
                    key={i}
                    title={ini?.nombre ?? s.tipo}
                    className="flex aspect-square flex-col items-center justify-center rounded-full border-2 border-dashed border-brand bg-brand-tint text-center"
                  >
                    <span className="text-lg font-bold text-brand">✓</span>
                    <span className="text-[8px] font-semibold uppercase text-brand-mid">
                      Parakeet
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Historial */}
        <section>
          <h2 className="mb-2 font-semibold text-brand-dark">Historial</h2>
          {historial.length === 0 ? (
            <p className="text-sm text-muted">
              Todavía no te inscribiste a ninguna iniciativa.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {historial.map((h) => {
                const ini = unwrap(h.iniciativas);
                const asis = unwrap(h.asistencias);
                return (
                  <li
                    key={h.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-brand-soft/70 bg-white px-3 py-2.5 text-sm"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium text-ink">
                        {ini?.nombre ?? 'Iniciativa'}
                      </div>
                      <div className="text-xs text-muted">
                        {ini?.fecha_jornada}
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        asis?.asistio
                          ? 'bg-brand text-white'
                          : 'bg-brand-tint text-brand-dark'
                      }`}
                    >
                      {asis?.asistio
                        ? `✓ +${asis.horas_acreditadas} h`
                        : 'Inscrito'}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
