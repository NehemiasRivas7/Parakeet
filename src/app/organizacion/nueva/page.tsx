import { createAdminClient } from '@/lib/supabase/admin';
import { requireOrganizacion } from '@/lib/auth';
import EncabezadoRol from '@/components/ui/EncabezadoRol';
import FormNuevaIniciativa from '@/components/iniciativa/FormNuevaIniciativa';

export const dynamic = 'force-dynamic';

const CENTRO_DEFAULT = { lat: 13.4936, lng: -89.3823 }; // Playa El Tunco

export default async function NuevaIniciativaPage({
  searchParams,
}: {
  searchParams: Promise<{ zona?: string; lat?: string; lng?: string; error?: string }>;
}) {
  await requireOrganizacion();
  const sp = await searchParams;

  // Ubicacion inicial: prioridad a lat/lng (click en mapa), luego zona, luego default.
  let lat = sp.lat ? Number(sp.lat) : CENTRO_DEFAULT.lat;
  let lng = sp.lng ? Number(sp.lng) : CENTRO_DEFAULT.lng;
  let zonaId: string | null = sp.zona ?? null;
  let zonaNombre: string | null = null;

  if (sp.zona) {
    const admin = createAdminClient();
    const { data } = await admin
      .from('zonas')
      .select('id, nombre, lat_centro, lng_centro')
      .eq('id', sp.zona)
      .single();
    if (data) {
      zonaNombre = data.nombre;
      // Si no vino lat/lng explicito, centrar en la zona.
      if (!sp.lat) lat = data.lat_centro;
      if (!sp.lng) lng = data.lng_centro;
    }
  }

  if (!Number.isFinite(lat)) lat = CENTRO_DEFAULT.lat;
  if (!Number.isFinite(lng)) lng = CENTRO_DEFAULT.lng;

  return (
    <main className="flex flex-1 flex-col">
      <EncabezadoRol titulo="Nueva iniciativa" subtitulo="Guardá y publicá para financiamiento" />
      <FormNuevaIniciativa
        initialLat={lat}
        initialLng={lng}
        zonaId={zonaId}
        zonaNombre={zonaNombre}
        huboError={sp.error === 'campos'}
      />
    </main>
  );
}
