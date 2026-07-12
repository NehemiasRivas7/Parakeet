import { createAdminClient } from '@/lib/supabase/admin';
import { requireRol } from '@/lib/auth';
import { aprobarIniciativa } from '@/lib/iniciativas/acciones';
import EncabezadoRol from '@/components/ui/EncabezadoRol';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  await requireRol('admin');
  const admin = createAdminClient();

  const { data: pendientes } = await admin
    .from('iniciativas')
    .select(
      'id, nombre, descripcion, tipo_causa, fecha_jornada, monto_requerido, cupo_max, organizaciones(nombre)',
    )
    .eq('estado', 'en_revision')
    .order('creada_en', { ascending: true });

  const lista = pendientes ?? [];

  return (
    <main className="flex flex-1 flex-col">
      <EncabezadoRol titulo="Cola de aprobación" subtitulo="Admin · Parakeet" />

      <div className="mx-auto w-full max-w-md flex-1 px-4 py-4">
        <h2 className="mb-3 font-semibold">
          Iniciativas en revisión ({lista.length})
        </h2>

        {lista.length === 0 && (
          <p className="rounded-xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500 dark:border-neutral-700">
            No hay iniciativas pendientes de revisión.
          </p>
        )}

        <ul className="flex flex-col gap-3">
          {lista.map((ini) => {
            const orgNombre = Array.isArray(ini.organizaciones)
              ? ini.organizaciones[0]?.nombre
              : (ini.organizaciones as { nombre: string } | null)?.nombre;
            return (
              <li
                key={ini.id}
                className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800"
              >
                <h3 className="font-semibold leading-tight">{ini.nombre}</h3>
                <p className="text-xs text-neutral-500">
                  {orgNombre ?? 'Organización'} · {ini.tipo_causa}
                </p>
                <p className="mt-1 text-sm">{ini.descripcion}</p>
                <dl className="mt-2 grid grid-cols-3 gap-2 text-xs text-neutral-500">
                  <div>📅 {ini.fecha_jornada}</div>
                  <div>👥 {ini.cupo_max}</div>
                  <div>💵 ${Number(ini.monto_requerido).toFixed(2)}</div>
                </dl>
                <form action={aprobarIniciativa} className="mt-3">
                  <input type="hidden" name="id" value={ini.id} />
                  <button className="min-h-10 w-full rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white">
                    Aprobar → Financiable
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
