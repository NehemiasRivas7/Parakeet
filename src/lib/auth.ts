import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { HOME_POR_ROL } from '@/lib/roles';
import type { RolUsuario } from '@/lib/database.types';

export type Usuario = {
  id: string;
  email: string;
  rol: RolUsuario;
  nombre: string;
};

// Devuelve el usuario logueado (fila de `usuarios`) o null.
export async function getUsuario(): Promise<Usuario | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('id, email, rol, nombre')
    .eq('id', user.id)
    .single();

  return usuario ?? null;
}

// Exige un rol concreto; si no, redirige a /login.
export async function requireRol(rol: RolUsuario): Promise<Usuario> {
  const usuario = await getUsuario();
  if (!usuario) redirect(`/login?next=${HOME_POR_ROL[rol]}`);
  if (usuario.rol !== rol) redirect('/login?error=rol');
  return usuario;
}

// Helpers que ademas traen la fila del rol.
export async function requireOrganizacion() {
  const usuario = await requireRol('organizacion');
  const supabase = await createClient();
  const { data: org } = await supabase
    .from('organizaciones')
    .select('id, nombre, zona_cobertura, verificada')
    .eq('usuario_id', usuario.id)
    .single();
  if (!org) redirect('/login?error=sin-organizacion');
  return { usuario, org };
}

export async function requireEmpresa() {
  const usuario = await requireRol('empresa');
  const supabase = await createClient();
  const { data: empresa } = await supabase
    .from('empresas')
    .select('id, nombre, logo_url, verificada')
    .eq('usuario_id', usuario.id)
    .single();
  if (!empresa) redirect('/login?error=sin-empresa');
  return { usuario, empresa };
}
