import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireEmpresa } from '@/lib/auth';
import { financiarIniciativa } from '@/lib/iniciativas/acciones';

export const dynamic = 'force-dynamic';

export default async function FinanciarPage({
  params,
}: {
  // Next 16: params es una Promise
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireEmpresa();
  const admin = createAdminClient();

  const { data: ini } = await admin
    .from('iniciativas')
    .select('id, nombre, estado, monto_requerido, organizaciones(nombre)')
    .eq('id', id)
    .single();

  if (!ini) notFound();

  const org = Array.isArray(ini.organizaciones)
    ? ini.organizaciones[0]
    : (ini.organizaciones as { nombre: string } | null);

  const inputCls = 'pk-input';

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-md px-4 py-4">
        <Link href="/empresa" className="text-sm font-medium text-brand-mid">
          ← Catálogo
        </Link>
        <h2 className="mb-3 mt-2 text-lg font-bold text-brand-dark">
          {ini.nombre}
        </h2>

        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          ⚠️ <strong>Simulación</strong> — no se procesa ningún cobro real. Este
          formulario es una demostración del flujo de financiamiento.
        </div>

        {ini.estado !== 'financiable' ? (
          <div className="pk-card p-6 text-center">
            <p className="text-sm text-muted">
              Esta iniciativa ya no está disponible para financiar (estado:{' '}
              {ini.estado}).
            </p>
            <Link
              href="/empresa"
              className="mt-3 inline-block text-sm font-medium text-brand-mid"
            >
              Volver al catálogo
            </Link>
          </div>
        ) : (
          <>
            <div className="pk-card mb-4 p-4">
              <p className="text-xs text-muted">
                {org?.nombre ?? 'Organización'}
              </p>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-sm text-ink">Monto a financiar</span>
                <span className="text-2xl font-bold text-brand-dark">
                  ${Number(ini.monto_requerido).toFixed(2)}
                </span>
              </div>
            </div>

            <form action={financiarIniciativa} className="flex flex-col gap-3">
              <input type="hidden" name="id" value={ini.id} />
              <label className="text-sm font-semibold">
                Nombre en la tarjeta
              </label>
              <input placeholder="EcoCorp S.A." className={inputCls} />
              <label className="text-sm font-semibold">Número de tarjeta</label>
              <input
                placeholder="4242 4242 4242 4242"
                inputMode="numeric"
                className={inputCls}
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold">Vence</label>
                  <input placeholder="12/28" className={inputCls} />
                </div>
                <div>
                  <label className="text-sm font-semibold">CVV</label>
                  <input placeholder="123" className={inputCls} />
                </div>
              </div>
              <button className="pk-btn pk-btn-primary mt-2 min-h-12">
                Confirmar financiamiento (simulado)
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
