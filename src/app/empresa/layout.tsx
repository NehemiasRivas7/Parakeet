import { requireEmpresa } from '@/lib/auth';
import EncabezadoRol from '@/components/ui/EncabezadoRol';
import EmpresaNav from '@/components/ui/EmpresaNav';

export const dynamic = 'force-dynamic';

export default async function EmpresaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { empresa } = await requireEmpresa();

  return (
    <div className="flex h-dvh flex-col">
      <EncabezadoRol titulo={empresa.nombre} subtitulo="RSE · Financiamiento" />
      <EmpresaNav />
      {children}
    </div>
  );
}
