import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireEmpresa } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function EmpresaPage({
  searchParams,
}: {
  searchParams: Promise<{ financiada?: string }>;
}) {
  await requireEmpresa();
  const sp = await searchParams;
  const admin = createAdminClient();

  const { data: iniciativas } = await admin
    .from('iniciativas')
    .select(
      'id, nombre, tipo_causa, fecha_jornada, cupo_max, horas_otorgadas, monto_requerido, organizaciones(nombre), zonas(nombre, nivel_gravedad)',
    )
    .eq('estado', 'financiable')
    .order('creada_en', { ascending: true });

  const lista = iniciativas ?? [];

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-md px-4 py-4">
        {sp.financiada === '1' && (
          <div className="mb-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
            ¡Financiamiento confirmado! Lo ves en la pestaña Financiamientos.
          </div>
        )}

        <h2 className="mb-3 font-semibold">
          Iniciativas por financiar ({lista.length})
        </h2>

        {lista.length === 0 && (
          <p className="rounded-xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500 dark:border-neutral-700">
            No hay iniciativas disponibles para financiar en este momento.
          </p>
        )}

        <ul className="flex flex-col gap-3">
          {lista.map((ini) => {
            const org = Array.isArray(ini.organizaciones)
              ? ini.organizaciones[0]
              : (ini.organizaciones as { nombre: string } | null);
            const zona = Array.isArray(ini.zonas)
              ? ini.zonas[0]
              : (ini.zonas as { nombre: string } | null);
            return (
              <li
                key={ini.id}
                className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800"
              >
                <h3 className="font-semibold leading-tight">{ini.nombre}</h3>
                <p className="text-xs text-neutral-500">
                  {org?.nombre ?? 'Organización'}
                  {zona?.nombre ? ` · ${zona.nombre}` : ''} · {ini.tipo_causa}
                </p>
                <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-neutral-500">
                  <div>📅 {ini.fecha_jornada}</div>
                  <div>👥 {ini.cupo_max} estudiantes</div>
                  <div>⏱️ {ini.horas_otorgadas} h c/u</div>
                  <div>🌱 {ini.cupo_max * ini.horas_otorgadas} h de impacto</div>
                </dl>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-bold">
                    ${Number(ini.monto_requerido).toFixed(2)}
                  </span>
                  <Link
                    href={`/empresa/financiar/${ini.id}`}
                    className="min-h-10 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Financiar
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
