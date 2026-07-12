import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireEmpresa } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Intereses RSE de la empresa (mock/demo: en producción los elegiría al
// registrarse). Alimentan el matching del Top 3 recomendado.
const INTERESES_EMPRESA = ['Reciclaje', 'Limpieza costera', 'Reforestación'];

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

  // Matching por intereses: prioridad según el orden de la lista de intereses.
  const puntuar = (tipo: string) => {
    const i = INTERESES_EMPRESA.findIndex(
      (int) => int.toLowerCase() === tipo.toLowerCase(),
    );
    return i === -1 ? Infinity : i;
  };
  const top3 = [...lista]
    .filter((i) => puntuar(i.tipo_causa) !== Infinity)
    .sort((a, b) => puntuar(a.tipo_causa) - puntuar(b.tipo_causa))
    .slice(0, 3);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-md px-4 py-4">
        {sp.financiada === '1' && (
          <div className="mb-3 rounded-xl border border-brand-soft bg-brand-tint px-3 py-2 text-sm font-medium text-brand-dark">
            ¡Financiamiento confirmado! Lo ves en la pestaña Financiamientos.
          </div>
        )}

        {/* Top 3 recomendadas por matching de intereses RSE */}
        {top3.length > 0 && (
          <section className="mb-5">
            <h2 className="font-semibold text-brand-dark">
              Recomendadas para vos
            </h2>
            <p className="mb-3 text-xs text-muted">
              Según tus intereses RSE: {INTERESES_EMPRESA.join(' · ')}
            </p>
            <ul className="flex flex-col gap-2">
              {top3.map((ini, idx) => (
                <li key={ini.id}>
                  <Link
                    href={`/empresa/financiar/${ini.id}`}
                    className="pk-card flex items-center gap-3 border-brand/40 p-3 transition hover:-translate-y-0.5"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                      {idx + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-brand-dark">
                        {ini.nombre}
                      </span>
                      <span className="block text-xs text-muted">
                        {ini.tipo_causa} · ${Number(ini.monto_requerido).toFixed(2)}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-full bg-brand-tint px-2 py-0.5 text-[11px] font-semibold text-brand-dark">
                      Match
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
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
                  <div>👥 {ini.cupo_max} voluntarios</div>
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
