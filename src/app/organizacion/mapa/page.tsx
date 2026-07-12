import { requireOrganizacion } from '@/lib/auth';
import MapaOrgClient from '@/components/mapa/MapaOrgClient';

export const dynamic = 'force-dynamic';

export default async function MapaOrganizacionPage() {
  await requireOrganizacion();
  return <MapaOrgClient />;
}
