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
          <h2 className="font-semibold text-brand-dark">Mis iniciativas</h2>
          <Link
            href="/organizacion/nueva"
            className="pk-btn pk-btn-primary min-h-10 rounded-full"
          >
            + Nueva
          </Link>
        </div>

        {lista.length === 0 && (
          <p className="rounded-2xl border border-dashed border-brand-soft p-6 text-center text-sm text-muted">
            Aún no tenés iniciativas. Creá una desde la pestaña{' '}
            <strong className="text-brand-dark">Mapa</strong> (tocando una zona) o
            con “+ Nueva”.
          </p>
        )}

        <ul className="flex flex-col gap-3">
          {lista.map((ini) => {
            const inscritos = conteo[ini.id] ?? 0;
            return (
              <li key={ini.id} className="pk-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold leading-tight text-brand-dark">
                    {ini.nombre}
                  </h3>
                  <BadgeEstado estado={ini.estado} />
                </div>
                <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted">
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
                      <button className="pk-btn pk-btn-primary min-h-10 w-full">
                        Publicar para financiamiento
                      </button>
                    </form>
                    <div className="flex gap-2">
                      <Link
                        href={`/organizacion/editar/${ini.id}`}
                        className="pk-btn pk-btn-outline min-h-10 flex-1"
                      >
                        Editar
                      </Link>
                      <form action={eliminarIniciativa} className="flex-1">
                        <input type="hidden" name="id" value={ini.id} />
                        <button className="pk-btn pk-btn-danger min-h-10 w-full">
                          Eliminar
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {ini.estado === 'financiable' && (
                  <div className="mt-3 flex flex-col gap-2">
                    <p className="text-xs font-medium text-brand-mid">
                      Visible para empresas. Esperando financiamiento.
                    </p>
                    <div className="flex gap-2">
                      <Link
                        href={`/organizacion/editar/${ini.id}`}
                        className="pk-btn pk-btn-outline min-h-10 flex-1"
                      >
                        Editar
                      </Link>
                      <form action={eliminarIniciativa} className="flex-1">
                        <input type="hidden" name="id" value={ini.id} />
                        <button className="pk-btn pk-btn-danger min-h-10 w-full">
                          Retirar
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {ini.estado === 'financiada' && (
                  <form action={abrirInscripciones} className="mt-3">
                    <input type="hidden" name="id" value={ini.id} />
                    <button className="pk-btn pk-btn-primary min-h-10 w-full">
                      Abrir inscripciones
                    </button>
                  </form>
                )}

                {ini.estado === 'inscripcion_abierta' && (
                  <div className="mt-3 flex flex-col gap-2">
                    <p className="text-xs font-medium text-brand-mid">
                      Inscripción abierta · {inscritos}/{ini.cupo_max} cupos
                      ocupados.
                    </p>
                    <Link
                      href={`/organizacion/jornada/${ini.id}`}
                      className="pk-btn pk-btn-primary min-h-10 w-full"
                    >
                      Gestionar jornada
                    </Link>
                  </div>
                )}

                {ini.estado === 'completada' && (
                  <Link
                    href={`/organizacion/jornada/${ini.id}`}
                    className="pk-btn pk-btn-outline mt-3 min-h-10 w-full"
                  >
                    Ver impacto
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
