// Parakeet — seed de datos de demo (iniciativas financiables + completadas con impacto).
// Usa fetch + service_role (sin supabase-js). Da vida al perfil de empresa.
//   node --env-file=.env.local supabase/seed-datos.mjs

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !service) {
  console.error('Faltan env de Supabase');
  process.exit(1);
}
const H = {
  apikey: service,
  Authorization: `Bearer ${service}`,
  'Content-Type': 'application/json',
};

async function get(path) {
  const r = await fetch(`${url}/rest/v1/${path}`, { headers: H });
  if (!r.ok) throw new Error(`GET ${path}: ${r.status}`);
  return r.json();
}
async function insert(table, row, rep = false) {
  const r = await fetch(`${url}/rest/v1/${table}`, {
    method: 'POST',
    headers: { ...H, Prefer: rep ? 'return=representation' : 'return=minimal' },
    body: JSON.stringify(row),
  });
  if (!r.ok) throw new Error(`POST ${table}: ${r.status} ${await r.text()}`);
  return rep ? (await r.json())[0] : null;
}

const org = (await get('organizaciones?select=id&limit=1'))[0];
const emp = (await get('empresas?select=id&limit=1'))[0];
const zona = (await get('zonas?select=id&nombre=eq.Playa%20El%20Tunco&limit=1'))[0];
if (!org || !emp) {
  console.error('Falta org o empresa (corré primero seed-auth.mjs)');
  process.exit(1);
}
const zonaId = zona?.id ?? null;

// Evitar duplicados: si ya hay financiables sembradas, salir.
const yaFinanciables = await get(
  'iniciativas?select=id&nombre=eq.Reforestaci%C3%B3n%20de%20la%20ribera&limit=1',
);
if (yaFinanciables.length > 0) {
  console.log('Ya sembrado (existe "Reforestación de la ribera"). Saliendo.');
  process.exit(0);
}

const B = { lat: 13.4936, lng: -89.3823 }; // El Tunco

// ── Financiables (catálogo + mapa + matching) ──────────────────────────────
const financiables = [
  { nombre: 'Reforestación de la ribera', tipo_causa: 'Reforestación', monto: 800, cupo: 15, horas: 8, dl: 0.004, dg: 0.003 },
  { nombre: 'Reciclaje comunitario en El Tunco', tipo_causa: 'Reciclaje', monto: 500, cupo: 20, horas: 6, dl: -0.003, dg: 0.004 },
  { nombre: 'Limpieza costera de temporada', tipo_causa: 'Limpieza costera', monto: 650, cupo: 25, horas: 10, dl: 0.002, dg: -0.004 },
  { nombre: 'Educación ambiental en la playa', tipo_causa: 'Educación ambiental', monto: 400, cupo: 12, horas: 5, dl: -0.004, dg: -0.002 },
  { nombre: 'Saneamiento de quebradas', tipo_causa: 'Saneamiento de ríos', monto: 900, cupo: 18, horas: 8, dl: 0.005, dg: 0.005 },
];

for (const f of financiables) {
  await insert('iniciativas', {
    organizacion_id: org.id,
    zona_id: zonaId,
    nombre: f.nombre,
    descripcion: `Jornada de ${f.tipo_causa.toLowerCase()} en la zona piloto. Buscamos voluntarios comprometidos con el ambiente.`,
    tipo_causa: f.tipo_causa,
    lat: B.lat + f.dl,
    lng: B.lng + f.dg,
    fecha_jornada: '2026-07-26',
    cupo_max: f.cupo,
    horas_otorgadas: f.horas,
    monto_requerido: f.monto,
    estado: 'financiable',
  });
  console.log(`✓ financiable: ${f.nombre}`);
}

// ── Completadas con impacto (dashboard de empresa) ─────────────────────────
const completadas = [
  {
    nombre: 'Limpieza costera de verano',
    tipo_causa: 'Limpieza costera',
    monto: 600,
    metricas: [
      { metrica: 'Basura recolectada', valor: 240, unidad: 'kg' },
      { metrica: 'Bolsas llenadas', valor: 35, unidad: 'bolsas' },
      { metrica: 'Área limpiada', valor: 800, unidad: 'm²' },
    ],
  },
  {
    nombre: 'Reforestación de manglares',
    tipo_causa: 'Reforestación',
    monto: 750,
    metricas: [
      { metrica: 'Árboles plantados', valor: 120, unidad: 'árboles' },
      { metrica: 'Área recuperada', valor: 500, unidad: 'm²' },
    ],
  },
];

for (const c of completadas) {
  const ini = await insert(
    'iniciativas',
    {
      organizacion_id: org.id,
      zona_id: zonaId,
      nombre: c.nombre,
      descripcion: `Jornada de ${c.tipo_causa.toLowerCase()} ya ejecutada, con impacto medido.`,
      tipo_causa: c.tipo_causa,
      lat: B.lat,
      lng: B.lng,
      fecha_jornada: '2026-07-05',
      cupo_max: 20,
      horas_otorgadas: 8,
      monto_requerido: c.monto,
      estado: 'completada',
    },
    true,
  );
  await insert('financiamientos', {
    iniciativa_id: ini.id,
    empresa_id: emp.id,
    monto: c.monto,
    estado_pago: 'simulado',
  });
  for (const m of c.metricas) {
    await insert('resultados_jornada', { iniciativa_id: ini.id, ...m });
  }
  console.log(`✓ completada con impacto: ${c.nombre}`);
}

console.log('\nSeed de datos completo.');
