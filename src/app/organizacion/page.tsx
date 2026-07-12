import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireOrganizacion } from '@/lib/auth';
import { enviarARevision, abrirInscripciones } from '@/lib/iniciativas/acciones';
import BadgeEstado from '@/components/iniciativa/BadgeEstado';
import EncabezadoRol from '@/components/ui/EncabezadoRol';
import { LABEL_NIVEL } from '@/lib/zonas/gravedad';

export const dynamic = 'force-dynamic';

const ORDEN_NIVEL: Record<string, number> = {
  critico: 0,
  alto: 1,
  medio: 2,
  bajo: 3,
  recuperada: 4,
};

export default async function OrganizacionPage() {
  const { org } = await requireOrganizacion();
  const admin = createAdminClient();

  const [{ data: iniciativas }, { data: zonas }] = await Promise.all([
    admin
      .from('iniciativas')
      .select('id, nombre, estado, fecha_jornada, cupo_max, horas_otorgadas, monto_requerido')
      .eq('organizacion_id', org.id)
      .order('creada_en', { ascending: false }),
    admin
      .from('zonas')
      .select('id, nombre, nivel_gravedad, total_reportes'),
  ]);

  const lista = iniciativas ?? [];
  const zonasOrdenadas = (zonas ?? []).sort(
    (a, b) => ORDEN_NIVEL[a.nivel_gravedad] - ORDEN_NIVEL[b.nivel_gravedad],
  );

  return (
    <main className="flex flex-1 flex-col">
      <EncabezadoRol titulo={org.nombre} subtitulo="Panel de organización" />

      <div className="mx-auto w-full max-w-md flex-1 px-4 py-4">
        {/* Zonas que necesitan atención — crear iniciativa desde una zona (RF-B02) */}
        <section className="mb-5">
          <h2 className="mb-2 font-semibold">Zonas que necesitan atención</h2>
          <ul className="flex flex-col gap-2">
            {zonasOrdenadas.map((z) => (
              <li
                key={z.id}
                className="flex items-center justify-between rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-800"
              >
                <span>
                  <span className="font-medium">{z.nombre}</span>{' '}
                  <span className="text-xs text-neutral-500">
                    · {LABEL_NIVEL[z.nivel_gravedad]} · {z.total_reportes} rep.
                  </span>
                </span>
                <Link
                  href={`/organizacion/nueva?zona=${z.id}`}
                  className="shrink-0 text-emerald-700 underline dark:text-emerald-400"
                >
                  Crear iniciativa
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Mis iniciativas</h2>
          <Link
            href="/organizacion/nueva"
            className="min-h-10 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
          >
            + Nueva
          </Link>
        </div>

        {lista.length === 0 && (
          <p className="rounded-xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500 dark:border-neutral-700">
            Aún no tenés iniciativas. Creá una desde una zona crítica del mapa o
            con el botón “+ Nueva”.
          </p>
        )}

        <ul className="flex flex-col gap-3">
          {lista.map((ini) => (
            <li
              key={ini.id}
              className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold leading-tight">{ini.nombre}</h3>
                <BadgeEstado estado={ini.estado} />
              </div>
              <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-neutral-500">
                <div>📅 {ini.fecha_jornada}</div>
                <div>👥 {ini.cupo_max} cupos</div>
                <div>⏱️ {ini.horas_otorgadas} h sociales</div>
                <div>💵 ${Number(ini.monto_requerido).toFixed(2)}</div>
              </dl>

              {ini.estado === 'borrador' && (
                <form action={enviarARevision} className="mt-3">
                  <input type="hidden" name="id" value={ini.id} />
                  <button className="min-h-10 w-full rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-white">
                    Enviar a revisión
                  </button>
                </form>
              )}

              {ini.estado === 'financiada' && (
                <form action={abrirInscripciones} className="mt-3">
                  <input type="hidden" name="id" value={ini.id} />
                  <button className="min-h-10 w-full rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">
                    Abrir inscripciones
                  </button>
                </form>
              )}

              {ini.estado === 'inscripcion_abierta' && (
                <p className="mt-3 text-xs text-emerald-700 dark:text-emerald-400">
                  Visible para estudiantes. Gestioná la jornada cuando llegue la
                  fecha.
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
