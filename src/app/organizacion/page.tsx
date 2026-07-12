import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireOrganizacion } from '@/lib/auth';
import { publicarIniciativa, abrirInscripciones } from '@/lib/iniciativas/acciones';
import BadgeEstado from '@/components/iniciativa/BadgeEstado';
import EncabezadoRol from '@/components/ui/EncabezadoRol';

export const dynamic = 'force-dynamic';

export default async function OrganizacionPage() {
  const { org } = await requireOrganizacion();
  const admin = createAdminClient();

  const { data: iniciativas } = await admin
    .from('iniciativas')
    .select('id, nombre, estado, fecha_jornada, cupo_max, horas_otorgadas, monto_requerido')
    .eq('organizacion_id', org.id)
    .order('creada_en', { ascending: false });

  const lista = iniciativas ?? [];

  return (
    <main className="flex flex-1 flex-col">
      <EncabezadoRol titulo={org.nombre} subtitulo="Panel de organización" />

      <div className="mx-auto w-full max-w-md flex-1 px-4 py-4">
        {/* Dos formas de crear una iniciativa */}
        <section className="mb-5 grid grid-cols-2 gap-2">
          <Link
            href="/organizacion/mapa"
            className="flex min-h-20 flex-col items-center justify-center gap-1 rounded-xl bg-emerald-600 p-3 text-center text-sm font-semibold text-white"
          >
            <span className="text-xl">🗺️</span>
            Crear desde el mapa
          </Link>
          <Link
            href="/organizacion/nueva"
            className="flex min-h-20 flex-col items-center justify-center gap-1 rounded-xl border border-neutral-300 p-3 text-center text-sm font-semibold dark:border-neutral-600"
          >
            <span className="text-xl">📝</span>
            Formulario directo
          </Link>
        </section>

        <h2 className="mb-3 font-semibold">Mis iniciativas</h2>

        {lista.length === 0 && (
          <p className="rounded-xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500 dark:border-neutral-700">
            Aún no tenés iniciativas. Creá una desde el mapa (tocando una zona) o
            con el formulario directo.
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
                <form action={publicarIniciativa} className="mt-3">
                  <input type="hidden" name="id" value={ini.id} />
                  <button className="min-h-10 w-full rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white">
                    Publicar para financiamiento
                  </button>
                </form>
              )}

              {ini.estado === 'financiable' && (
                <p className="mt-3 text-xs text-sky-700 dark:text-sky-400">
                  Visible para empresas. Esperando financiamiento.
                </p>
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
