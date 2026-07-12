import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireOrganizacion } from '@/lib/auth';
import {
  publicarIniciativa,
  abrirInscripciones,
  eliminarIniciativa,
} from '@/lib/iniciativas/acciones';
import BadgeEstado from '@/components/iniciativa/BadgeEstado';

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

  // Conteo de inscripciones en vivo por iniciativa.
  const ids = lista.map((i) => i.id);
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

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-md px-4 py-4">
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
            Aún no tenés iniciativas. Creá una desde la pestaña{' '}
            <strong>Mapa</strong> (tocando una zona) o con “+ Nueva”.
          </p>
        )}

        <ul className="flex flex-col gap-3">
          {lista.map((ini) => {
            const inscritos = conteo[ini.id] ?? 0;
            return (
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
                  <div>
                    👥 {inscritos}/{ini.cupo_max} inscritos
                  </div>
                  <div>⏱️ {ini.horas_otorgadas} h sociales</div>
                  <div>💵 ${Number(ini.monto_requerido).toFixed(2)}</div>
                </dl>

                {ini.estado === 'borrador' && (
                  <div className="mt-3 flex flex-col gap-2">
                    <form action={publicarIniciativa}>
                      <input type="hidden" name="id" value={ini.id} />
                      <button className="min-h-10 w-full rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white">
                        Publicar para financiamiento
                      </button>
                    </form>
                    <div className="flex gap-2">
                      <Link
                        href={`/organizacion/editar/${ini.id}`}
                        className="flex min-h-10 flex-1 items-center justify-center rounded-lg border border-neutral-300 text-sm font-semibold dark:border-neutral-600"
                      >
                        Editar
                      </Link>
                      <form action={eliminarIniciativa} className="flex-1">
                        <input type="hidden" name="id" value={ini.id} />
                        <button className="min-h-10 w-full rounded-lg border border-red-300 text-sm font-semibold text-red-600 dark:border-red-800">
                          Eliminar
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {ini.estado === 'financiable' && (
                  <div className="mt-3 flex flex-col gap-2">
                    <p className="text-xs text-sky-700 dark:text-sky-400">
                      Visible para empresas. Esperando financiamiento.
                    </p>
                    <div className="flex gap-2">
                      <Link
                        href={`/organizacion/editar/${ini.id}`}
                        className="flex min-h-10 flex-1 items-center justify-center rounded-lg border border-neutral-300 text-sm font-semibold dark:border-neutral-600"
                      >
                        Editar
                      </Link>
                      <form action={eliminarIniciativa} className="flex-1">
                        <input type="hidden" name="id" value={ini.id} />
                        <button className="min-h-10 w-full rounded-lg border border-red-300 text-sm font-semibold text-red-600 dark:border-red-800">
                          Retirar
                        </button>
                      </form>
                    </div>
                  </div>
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
                    Inscripción abierta · {inscritos}/{ini.cupo_max} cupos ocupados.
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
