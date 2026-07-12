import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireEstudiante } from '@/lib/auth';
import EncabezadoRol from '@/components/ui/EncabezadoRol';

export const dynamic = 'force-dynamic';

export default async function HorasPage() {
  const { estudiante } = await requireEstudiante();
  const admin = createAdminClient();

  const [{ data: inscripciones }, { data: stamps }] = await Promise.all([
    admin
      .from('inscripciones')
      .select(
        'id, iniciativas(nombre, fecha_jornada, horas_otorgadas), asistencias(asistio, horas_acreditadas)',
      )
      .eq('estudiante_id', estudiante.id)
      .order('inscrito_en', { ascending: false }),
    admin
      .from('stamps')
      .select('tipo, otorgado_en, iniciativas(nombre)')
      .eq('estudiante_id', estudiante.id)
      .order('otorgado_en', { ascending: false }),
  ]);

  const acumuladas = estudiante.horas_acumuladas;
  const requeridas = estudiante.horas_requeridas;
  const restantes = Math.max(0, requeridas - acumuladas);
  const pct = requeridas > 0 ? Math.min(100, Math.round((acumuladas / requeridas) * 100)) : 0;

  const historial = inscripciones ?? [];
  const listaStamps = stamps ?? [];

  function unwrap<T>(rel: T | T[] | null): T | null {
    return Array.isArray(rel) ? (rel[0] ?? null) : rel;
  }

  return (
    <main className="flex flex-1 flex-col">
      <EncabezadoRol titulo="Mis horas" subtitulo={estudiante.institucion} />

      <div className="mx-auto w-full max-w-md flex-1 px-4 py-4">
        <Link href="/estudiante" className="text-sm font-medium text-brand-mid">
          ← Catálogo
        </Link>

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
            {restantes > 0 ? `Te faltan ${restantes} h` : '¡Horas completas! 🎉'}
          </p>
        </section>

        {/* Stamps */}
        <section className="mb-5">
          <h2 className="mb-2 font-semibold text-brand-dark">
            Stamps ({listaStamps.length})
          </h2>
          {listaStamps.length === 0 ? (
            <p className="text-sm text-muted">
              Aún no tenés stamps. Ganás uno al asistir a una jornada.
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {listaStamps.map((s, i) => {
                const ini = unwrap(s.iniciativas);
                return (
                  <div
                    key={i}
                    title={ini?.nombre ?? s.tipo}
                    className="flex aspect-square flex-col items-center justify-center rounded-2xl border border-brand-soft bg-brand-tint text-center"
                  >
                    <span className="text-2xl">🏅</span>
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
    </main>
  );
}
