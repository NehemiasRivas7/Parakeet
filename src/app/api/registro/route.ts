import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

function bad(reason: string) {
  return Response.json({ ok: false, reason }, { status: 400 });
}

// POST /api/registro — alta de estudiante (auth + fila usuarios + fila estudiantes).
// Solo para el rol estudiante (los demás usan cuentas pre-verificadas).
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return bad('JSON inválido');
  }

  const { email, password, nombre, institucion } = (body ?? {}) as {
    email?: unknown;
    password?: unknown;
    nombre?: unknown;
    institucion?: unknown;
  };

  if (typeof email !== 'string' || !email.includes('@')) {
    return bad('Correo inválido');
  }
  if (typeof password !== 'string' || password.length < 6) {
    return bad('La contraseña debe tener al menos 6 caracteres');
  }
  if (typeof nombre !== 'string' || !nombre.trim()) {
    return bad('Ingresá tu nombre');
  }
  if (typeof institucion !== 'string' || !institucion.trim()) {
    return bad('Ingresá tu institución');
  }

  const admin = createAdminClient();

  const { data: created, error } = await admin.auth.admin.createUser({
    email: email.trim(),
    password,
    email_confirm: true,
  });
  if (error || !created?.user) {
    return Response.json(
      { ok: false, reason: 'Ese correo ya está registrado o no es válido.' },
      { status: 400 },
    );
  }

  const userId = created.user.id;

  const { error: uErr } = await admin.from('usuarios').insert({
    id: userId,
    email: email.trim(),
    rol: 'estudiante',
    nombre: nombre.trim(),
  });
  if (uErr) {
    return Response.json({ ok: false, reason: uErr.message }, { status: 500 });
  }

  const { error: eErr } = await admin.from('estudiantes').insert({
    usuario_id: userId,
    institucion: institucion.trim(),
  });
  if (eErr) {
    return Response.json({ ok: false, reason: eErr.message }, { status: 500 });
  }

  return Response.json({ ok: true }, { status: 201 });
}
