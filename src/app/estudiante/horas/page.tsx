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
        <Link href="/estudiante" className="text-sm text-neutral-500 underline">
          ← Catálogo
        </Link>

        {/* Progreso */}
        <section className="my-4 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold">{acumuladas}</span>
            <span className="text-sm text-neutral-500">de {requeridas} h</span>
          </div>
          <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            {restantes > 0 ? `Te faltan ${restantes} h` : '¡Horas completas! 🎉'}
          </p>
        </section>

        {/* Stamps */}
        <section className="mb-5">
          <h2 className="mb-2 font-semibold">Stamps ({listaStamps.length})</h2>
          {listaStamps.length === 0 ? (
            <p className="text-sm text-neutral-500">
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
                    className="flex aspect-square flex-col items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-center dark:border-emerald-900 dark:bg-emerald-950/40"
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
          <h2 className="mb-2 font-semibold">Historial</h2>
          {historial.length === 0 ? (
            <p className="text-sm text-neutral-500">
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
                    className="flex items-center justify-between gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-800"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium">
                        {ini?.nombre ?? 'Iniciativa'}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {ini?.fecha_jornada}
                      </div>
                    </div>
                    <span className="shrink-0 text-xs">
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
