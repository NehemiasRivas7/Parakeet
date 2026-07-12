import { createAdminClient } from '@/lib/supabase/admin';
import { requireRol } from '@/lib/auth';
import BadgeEstado from '@/components/iniciativa/BadgeEstado';
import EncabezadoRol from '@/components/ui/EncabezadoRol';
import type { EstadoIniciativa } from '@/lib/database.types';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  await requireRol('admin');
  const admin = createAdminClient();

  const [{ data: iniciativas }, { count: reportes }, { count: zonas }] =
    await Promise.all([
      admin
        .from('iniciativas')
        .select('id, nombre, estado, organizaciones(nombre)')
        .order('creada_en', { ascending: false }),
      admin.from('reportes').select('*', { count: 'exact', head: true }),
      admin.from('zonas').select('*', { count: 'exact', head: true }),
    ]);

  const lista = iniciativas ?? [];
  const porEstado = lista.reduce<Record<string, number>>((acc, i) => {
    acc[i.estado] = (acc[i.estado] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <main className="flex flex-1 flex-col">
      <EncabezadoRol titulo="Administración" subtitulo="Métricas del ecosistema" />

      <div className="mx-auto w-full max-w-md flex-1 px-4 py-4">
        <section className="mb-5 grid grid-cols-3 gap-2 text-center">
          <div className="pk-card p-3">
            <div className="text-2xl font-bold text-brand-dark">{lista.length}</div>
            <div className="text-xs text-muted">Iniciativas</div>
          </div>
          <div className="pk-card p-3">
            <div className="text-2xl font-bold text-brand-dark">{reportes ?? 0}</div>
            <div className="text-xs text-muted">Reportes</div>
          </div>
          <div className="pk-card p-3">
            <div className="text-2xl font-bold text-brand-dark">{zonas ?? 0}</div>
            <div className="text-xs text-muted">Zonas</div>
          </div>
        </section>

        <h2 className="mb-3 font-semibold text-brand-dark">
          Iniciativas del ecosistema
        </h2>

        {lista.length === 0 && (
          <p className="rounded-2xl border border-dashed border-brand-soft p-6 text-center text-sm text-muted">
            Todavía no hay iniciativas.
          </p>
        )}

        <ul className="flex flex-col gap-2">
          {lista.map((ini) => {
            const org = Array.isArray(ini.organizaciones)
              ? ini.organizaciones[0]
              : (ini.organizaciones as { nombre: string } | null);
            return (
              <li
                key={ini.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-brand-soft/70 bg-white px-3 py-2.5"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-ink">
                    {ini.nombre}
                  </div>
                  <div className="text-xs text-muted">
                    {org?.nombre ?? 'Organización'}
                  </div>
                </div>
                <BadgeEstado estado={ini.estado as EstadoIniciativa} />
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
