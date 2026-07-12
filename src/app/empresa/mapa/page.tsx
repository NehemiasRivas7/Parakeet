import { createAdminClient } from '@/lib/supabase/admin';
import { requireEmpresa } from '@/lib/auth';
import MapaIniciativasClient from '@/components/mapa/MapaIniciativasClient';
import type { IniciativaMapa } from '@/components/mapa/MapaIniciativas';

export const dynamic = 'force-dynamic';

export default async function EmpresaMapaPage() {
  await requireEmpresa();
  const admin = createAdminClient();

  const { data: inis } = await admin
    .from('iniciativas')
    .select('id, nombre, lat, lng, cupo_max, horas_otorgadas')
    .eq('estado', 'financiable');

  const iniciativas: IniciativaMapa[] = (inis ?? []).map((i) => ({
    id: i.id,
    nombre: i.nombre,
    lat: i.lat,
    lng: i.lng,
    horas_otorgadas: i.horas_otorgadas,
    cupos_restantes: i.cupo_max,
  }));

  return (
    <>
      <div className="border-b border-brand-soft/70 bg-white/60 px-4 py-2 text-xs font-medium text-muted backdrop-blur">
        Zonas contaminadas en vivo + {iniciativas.length} iniciativa(s) buscando
        financiamiento. Tocá un marcador 🌱 para financiar.
      </div>
      <div className="relative min-h-0 flex-1 p-3">
        <div className="h-full w-full overflow-hidden rounded-2xl border border-brand-soft/70">
          <MapaIniciativasClient
            iniciativas={iniciativas}
            hrefBase="/empresa/financiar"
            cta="Financiar →"
            conZonas
          />
        </div>
      </div>
    </>
  );
}
