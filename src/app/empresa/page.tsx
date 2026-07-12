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
          <div className="mb-3 rounded-xl border border-brand-soft bg-brand-tint px-3 py-2 text-sm font-medium text-brand-dark">
            ¡Financiamiento confirmado! Lo ves en la pestaña Financiamientos.
          </div>
        )}

        <h2 className="mb-3 font-semibold text-brand-dark">
          Iniciativas por financiar ({lista.length})
        </h2>

        {lista.length === 0 && (
          <p className="rounded-2xl border border-dashed border-brand-soft p-6 text-center text-sm text-muted">
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
              <li key={ini.id} className="pk-card p-4">
                <h3 className="font-semibold leading-tight text-brand-dark">
                  {ini.nombre}
                </h3>
                <p className="mt-0.5 text-xs text-muted">
                  {org?.nombre ?? 'Organización'}
                  {zona?.nombre ? ` · ${zona.nombre}` : ''} · {ini.tipo_causa}
                </p>
                <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted">
                  <div>📅 {ini.fecha_jornada}</div>
                  <div>👥 {ini.cupo_max} estudiantes</div>
                  <div>⏱️ {ini.horas_otorgadas} h c/u</div>
                  <div>🌱 {ini.cupo_max * ini.horas_otorgadas} h de impacto</div>
                </dl>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-bold text-brand-dark">
                    ${Number(ini.monto_requerido).toFixed(2)}
                  </span>
                  <Link
                    href={`/empresa/financiar/${ini.id}`}
                    className="pk-btn pk-btn-primary min-h-10"
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
