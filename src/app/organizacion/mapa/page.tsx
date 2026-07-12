import { requireOrganizacion } from '@/lib/auth';
import EncabezadoRol from '@/components/ui/EncabezadoRol';
import MapaOrgClient from '@/components/mapa/MapaOrgClient';

export const dynamic = 'force-dynamic';

export default async function MapaOrganizacionPage() {
  const { org } = await requireOrganizacion();

  return (
    <main className="flex h-dvh flex-col">
      <EncabezadoRol titulo={org.nombre} subtitulo="Elegí dónde crear la iniciativa" />
      <MapaOrgClient />
    </main>
  );
}
