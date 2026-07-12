// Parakeet — seed de cuentas de prueba (una por rol).
// Crea usuarios en Supabase Auth + sus filas en usuarios/organizaciones/empresas/estudiantes.
// Usa fetch directo (Auth Admin API + PostgREST) para evitar el WebSocket de
// supabase-js, que no anda en Node 20 plano. Idempotente: se puede re-correr.
//
// Correr:  node --env-file=.env.local supabase/seed-auth.mjs
//
// RNF-6.5: estas son las credenciales de prueba por rol que van en el README.

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !service) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const H = {
  apikey: service,
  Authorization: `Bearer ${service}`,
  'Content-Type': 'application/json',
};

const PASSWORD = 'parakeet2026';

const cuentas = [
  { email: 'admin@parakeet.sv', nombre: 'Admin Parakeet', rol: 'admin' },
  {
    email: 'org@parakeet.sv',
    nombre: 'Diego — Raíces',
    rol: 'organizacion',
    organizacion: {
      nombre: 'Fundación Raíces',
      zona_cobertura: 'La Libertad',
      verificada: true,
    },
  },
  {
    email: 'empresa@parakeet.sv',
    nombre: 'EcoCorp (RSE)',
    rol: 'empresa',
    empresa: { nombre: 'EcoCorp S.A. de C.V.', logo_url: null, verificada: true },
  },
  {
    email: 'estudiante@parakeet.sv',
    nombre: 'William Estudiante',
    rol: 'estudiante',
    estudiante: { institucion: 'Universidad de El Salvador', horas_requeridas: 100 },
  },
];

async function crearUObtenerUsuario(email, password) {
  const res = await fetch(`${url}/auth/v1/admin/users`, {
    method: 'POST',
    headers: H,
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  if (res.ok) {
    const u = await res.json();
    return u.id;
  }
  // Ya existe (o error): buscarlo paginando.
  for (let page = 1; ; page += 1) {
    const r = await fetch(`${url}/auth/v1/admin/users?page=${page}&per_page=200`, {
      headers: H,
    });
    if (!r.ok) throw new Error(`listUsers: ${r.status} ${await r.text()}`);
    const data = await r.json();
    const users = data.users ?? data;
    const found = users.find((u) => u.email === email);
    if (found) {
      // Reasegurar la contraseña conocida.
      await fetch(`${url}/auth/v1/admin/users/${found.id}`, {
        method: 'PUT',
        headers: H,
        body: JSON.stringify({ password }),
      });
      return found.id;
    }
    if (users.length < 200) throw new Error(`No se pudo crear ni encontrar ${email}`);
  }
}

async function upsert(table, row, onConflict) {
  const qs = onConflict ? `?on_conflict=${onConflict}` : '';
  const res = await fetch(`${url}/rest/v1/${table}${qs}`, {
    method: 'POST',
    headers: { ...H, Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(row),
  });
  if (!res.ok) throw new Error(`${table}: ${res.status} ${await res.text()}`);
}

for (const c of cuentas) {
  try {
    const userId = await crearUObtenerUsuario(c.email, PASSWORD);
    await upsert(
      'usuarios',
      { id: userId, email: c.email, rol: c.rol, nombre: c.nombre },
      'id',
    );
    if (c.organizacion) {
      await upsert('organizaciones', { usuario_id: userId, ...c.organizacion }, 'usuario_id');
    }
    if (c.empresa) {
      await upsert('empresas', { usuario_id: userId, ...c.empresa }, 'usuario_id');
    }
    if (c.estudiante) {
      await upsert('estudiantes', { usuario_id: userId, ...c.estudiante }, 'usuario_id');
    }
    console.log(`✓ ${c.email}  ·  ${c.rol}  ·  pass: ${PASSWORD}`);
  } catch (e) {
    console.error(`✗ ${c.email}: ${e.message}`);
  }
}

console.log('\nSeed de cuentas completo.');
