# Parakeet — Plan de implementación

> **Nota sobre metodología:** este plan sustituye los ciclos TDD por **gates de verificación manual**. En una ventana de ~11 horas con demo en vivo, escribir suites de tests es malgastar el recurso escaso. Cada plan termina con un gate binario: pasa o no pasa. Si un gate no pasa, **no se avanza**.

**Meta:** una URL pública donde el jurado recorra el ciclo completo — reporte ciudadano → heatmap → iniciativa → financiamiento → inscripción → asistencia → horas → zona recuperada.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind · Supabase (Postgres + Auth + RLS) · Leaflet · Vercel

---

## Reglas globales

1. **Nada se mergea a `main` sin estar desplegado y verificado en la URL pública.**
2. **Commits cada 20-30 minutos.** Ramas cortas, merge rápido. No hay tiempo para resolver conflictos gigantes a las 4am.
3. **Mobile-first sin excepción.** Si se ve mal en 375px, está mal. Punto.
4. **Cada plan tiene un gate.** Si el gate falla, se corrige antes de seguir. No se acumula deuda.
5. **Plan 7 (entregables) NO es opcional ni negociable.** Se ejecuta aunque el código no esté terminado.

---

## Reparto por perfil 3H

| Perfil | Responsabilidad principal |
| --- | --- |
| **Hacker** | Planes 0, 1, 5, 6 (fundación, datos, lógica de impacto, API) |
| **Hipster** | Planes 2, 4 (reporte ciudadano, mapa, experiencia del estudiante) |
| **Hustler** | Planes 3, 7 (flujo de iniciativa/empresa, entregables, pitch, coopetencia) |

A partir del Plan 2 se trabaja **en paralelo**. Los Planes 0 y 1 son secuenciales y bloquean a todos.

---

# PLAN 0 — Fundación

**Tiempo:** 45 min · **Dueño:** Hacker · **Bloquea a todos**

> El objetivo NO es escribir features. Es tener una URL pública viva antes de escribir la primera línea de lógica. Un proyecto perfecto en localhost vale cero puntos.

### Tareas

- [ ] **0.1** Crear proyecto: `npx create-next-app@latest parakeet --typescript --tailwind --app --eslint`
- [ ] **0.2** Crear repositorio en GitHub. Push inicial a `main`.
- [ ] **0.3** Crear proyecto en Supabase. Copiar `URL` y `anon key`.
- [ ] **0.4** Crear `.env.local` y `.env.example`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

- [ ] **0.5** Instalar dependencias:

```bash
npm i @supabase/supabase-js @supabase/ssr leaflet react-leaflet leaflet.heat recharts
npm i -D @types/leaflet
```

- [ ] **0.6** Crear `src/app/api/health/route.ts`:

```ts
export async function GET() {
  return Response.json({
    status: 'ok',
    service: 'parakeet',
    timestamp: new Date().toISOString(),
  });
}
```

- [ ] **0.7** Conectar el repo a Vercel. Cargar las variables de entorno en el dashboard de Vercel.
- [ ] **0.8** Deploy.

### 🚦 GATE 0

```bash
curl https://<tu-app>.vercel.app/api/health
```

Debe devolver `200` con el JSON. **Si esto no responde, nadie escribe código de features.**

---

# PLAN 1 — Modelos y datos

**Tiempo:** 1h 15min · **Dueño:** Hacker · **Bloquea a todos**

### 1.1 Esquema base

- [ ] Ejecutar en el SQL editor de Supabase:

```sql
create type rol_usuario as enum ('estudiante','organizacion','empresa','admin');
create type nivel_gravedad as enum ('recuperada','bajo','medio','alto','critico');
create type estado_iniciativa as enum (
  'borrador','en_revision','financiable','financiada',
  'inscripcion_abierta','en_curso','completada','cancelada'
);
create type tipo_contaminacion as enum ('basura','plastico','aguas_negras','escombros','otro');

create table usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  rol rol_usuario not null,
  nombre text not null,
  creado_en timestamptz default now()
);

create table estudiantes (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid unique not null references usuarios(id) on delete cascade,
  institucion text not null,
  horas_requeridas int not null default 100,
  horas_acumuladas int not null default 0
);

create table organizaciones (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid unique not null references usuarios(id) on delete cascade,
  nombre text not null,
  zona_cobertura text,
  verificada boolean not null default false
);

create table empresas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid unique not null references usuarios(id) on delete cascade,
  nombre text not null,
  logo_url text,
  verificada boolean not null default false
);

create table zonas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  lat_centro double precision not null,
  lng_centro double precision not null,
  radio_m int not null default 300,
  nivel_gravedad nivel_gravedad not null default 'bajo',
  nivel_inicial nivel_gravedad not null default 'bajo',
  total_reportes int not null default 0,
  actualizada_en timestamptz default now()
);

create table reportes (
  id uuid primary key default gen_random_uuid(),
  zona_id uuid references zonas(id) on delete set null,
  lat double precision not null,
  lng double precision not null,
  tipo_contaminacion tipo_contaminacion not null,
  descripcion text,
  foto_url text,
  creado_en timestamptz default now()
);

create table iniciativas (
  id uuid primary key default gen_random_uuid(),
  organizacion_id uuid not null references organizaciones(id) on delete cascade,
  zona_id uuid references zonas(id) on delete set null,
  nombre text not null,
  descripcion text not null,
  tipo_causa text not null,
  lat double precision not null,
  lng double precision not null,
  fecha_jornada date not null,
  cupo_max int not null,
  horas_otorgadas int not null,
  monto_requerido numeric(10,2) not null,
  estado estado_iniciativa not null default 'borrador',
  motivo_cancelacion text,
  creada_en timestamptz default now()
);

create table financiamientos (
  id uuid primary key default gen_random_uuid(),
  iniciativa_id uuid unique not null references iniciativas(id) on delete cascade,
  empresa_id uuid not null references empresas(id),
  monto numeric(10,2) not null,
  estado_pago text not null default 'simulado',
  confirmado_en timestamptz default now()
);

create table inscripciones (
  id uuid primary key default gen_random_uuid(),
  iniciativa_id uuid not null references iniciativas(id) on delete cascade,
  estudiante_id uuid not null references estudiantes(id) on delete cascade,
  inscrito_en timestamptz default now(),
  unique (iniciativa_id, estudiante_id)
);

create table asistencias (
  id uuid primary key default gen_random_uuid(),
  inscripcion_id uuid unique not null references inscripciones(id) on delete cascade,
  asistio boolean not null,
  horas_acreditadas int not null default 0,
  marcada_en timestamptz default now()
);

create table resultados_jornada (
  id uuid primary key default gen_random_uuid(),
  iniciativa_id uuid not null references iniciativas(id) on delete cascade,
  metrica text not null,
  valor double precision not null,
  unidad text not null,
  registrado_en timestamptz default now()
);

create table stamps (
  id uuid primary key default gen_random_uuid(),
  estudiante_id uuid not null references estudiantes(id) on delete cascade,
  iniciativa_id uuid not null references iniciativas(id) on delete cascade,
  tipo text not null,
  otorgado_en timestamptz default now(),
  unique (estudiante_id, iniciativa_id)
);
```

### 1.2 Trigger de gravedad de zona

> Esta función es la que hace que el heatmap suba de intensidad solo. Sin esto, no hay reto EcoTrack.

- [ ] Ejecutar:

```sql
create or replace function recalcular_gravedad_zona()
returns trigger language plpgsql as $$
declare n int;
begin
  update zonas set total_reportes = total_reportes + 1,
                   actualizada_en = now()
  where id = new.zona_id
  returning total_reportes into n;

  update zonas set nivel_gravedad = case
    when n >= 10 then 'critico'::nivel_gravedad
    when n >= 5  then 'alto'::nivel_gravedad
    when n >= 2  then 'medio'::nivel_gravedad
    else 'bajo'::nivel_gravedad
  end
  where id = new.zona_id;

  return new;
end $$;

create trigger trg_gravedad
after insert on reportes
for each row when (new.zona_id is not null)
execute function recalcular_gravedad_zona();
```

### 1.3 RLS

- [ ] Ejecutar:

```sql
alter table reportes enable row level security;
alter table zonas enable row level security;
alter table iniciativas enable row level security;
alter table inscripciones enable row level security;
alter table estudiantes enable row level security;

create policy "reportes lectura publica" on reportes for select using (true);
create policy "reportes insert anonimo"  on reportes for insert with check (true);
create policy "zonas lectura publica"    on zonas    for select using (true);

create policy "iniciativas segun estado" on iniciativas for select using (
  estado in ('financiable','financiada','inscripcion_abierta','en_curso','completada')
  or organizacion_id in (
    select o.id from organizaciones o
    join usuarios u on u.id = o.usuario_id
    where u.id = auth.uid()
  )
);

create policy "estudiante ve solo lo suyo" on estudiantes for select using (
  usuario_id = auth.uid()
);
```

### 1.4 Seed de la zona piloto

- [ ] Insertar **una** zona (Playa El Tunco o la que elijan) con 6 reportes precargados para que el heatmap arranque en `alto` y suba a `critico` cuando el jurado reporte en vivo:

```sql
insert into zonas (id, nombre, lat_centro, lng_centro, nivel_gravedad, nivel_inicial, total_reportes)
values ('11111111-1111-1111-1111-111111111111', 'Playa El Tunco',
        13.4936, -89.3823, 'alto', 'alto', 6);
```

Insertar 6 reportes con `zona_id` apuntando a esa zona y coordenadas dispersas ±0.002.

### 1.5 Cliente y tipos

- [ ] Crear `src/lib/supabase/client.ts` y `src/lib/supabase/server.ts` (patrón estándar de `@supabase/ssr`).
- [ ] Generar tipos: `npx supabase gen types typescript --project-id <id> > src/lib/database.types.ts`

### 🚦 GATE 1

Insertar un reporte manualmente desde el SQL editor. Verificar que `zonas.total_reportes` sube y que `nivel_gravedad` cambia sola. **Si el trigger no dispara, todo lo demás se cae.**

---

# PLAN 2 — MVP núcleo: reporte ciudadano + heatmap ⭐

**Tiempo:** 2h · **Dueño:** Hipster (+ Hacker en el endpoint)

> **Este es EL reto.** EcoTrack pide exactamente esto: reportar, hacer visibles los puntos críticos, medir. Si solo tuvieran tiempo para un plan, sería este.

### Archivos

- `src/app/page.tsx` — landing + mapa público
- `src/components/mapa/HeatmapZonas.tsx` — mapa Leaflet + capa heat
- `src/app/reportar/page.tsx` — flujo de reporte anónimo
- `src/app/api/reportes/route.ts` — POST reporte

### Tareas

- [ ] **2.1** `HeatmapZonas.tsx` — Leaflet con tiles de OSM. Importar con `dynamic(() => ..., { ssr: false })`, Leaflet revienta en SSR.
- [ ] **2.2** Cargar `zonas` y pintar círculos con color por `nivel_gravedad`:
  `recuperada` verde · `bajo` amarillo · `medio` naranja · `alto` coral · `critico` rojo
- [ ] **2.3** Capa `leaflet.heat` alimentada por `reportes` (lat, lng, intensidad 0.6).
- [ ] **2.4** Popup al tocar zona: nombre, nº de reportes, nivel, tipo predominante.
- [ ] **2.5** `/reportar`: botón grande "Reportar punto contaminado", `navigator.geolocation`, selector de tipo (5 chips), campo de descripción.
- [ ] **2.6** `POST /api/reportes` — asigna `zona_id` por distancia Haversine < `radio_m`; si no cae en ninguna, crea zona nueva.
- [ ] **2.7** Tras enviar: redirigir al mapa con la zona centrada y el heatmap **ya actualizado**.

### 🚦 GATE 2

Desde un **teléfono real**, en la URL pública: reportar un punto y ver el heatmap intensificarse. Sin login. En menos de 3 taps.

---

# PLAN 3 — Ciclo de la iniciativa (org → admin → empresa)

**Tiempo:** 2h · **Dueño:** Hustler (+ Hacker en transiciones)

### Archivos

- `src/app/organizacion/page.tsx` — panel de iniciativas con estados
- `src/app/organizacion/nueva/page.tsx` — formulario desde zona
- `src/app/admin/page.tsx` — cola de aprobación
- `src/app/empresa/page.tsx` — catálogo financiable
- `src/app/empresa/financiar/[id]/page.tsx` — mockup de pago
- `src/lib/iniciativas/transiciones.ts` — máquina de estados

### Tareas

- [ ] **3.1** `transiciones.ts` — función única que valida y aplica cambios de estado:

```ts
const TRANSICIONES: Record<EstadoIniciativa, EstadoIniciativa[]> = {
  borrador: ['en_revision', 'cancelada'],
  en_revision: ['financiable', 'borrador', 'cancelada'],
  financiable: ['financiada', 'cancelada'],
  financiada: ['inscripcion_abierta', 'cancelada'],
  inscripcion_abierta: ['en_curso', 'cancelada'],
  en_curso: ['completada', 'cancelada'],
  completada: [],
  cancelada: [],
};
```

  **Toda transición pasa por aquí.** Nada de `update iniciativas set estado = ...` regado en el código.

- [ ] **3.2** Panel de organización: lista con badge de estado por color (el mismo mapeo del diagrama).
- [ ] **3.3** Formulario "nueva iniciativa": si viene con `?zona=<id>`, precargar lat/lng y nombre de zona. Guardar como `borrador` → botón "Enviar a revisión" → `en_revision`.
- [ ] **3.4** `/admin`: lista de `en_revision`, botón Aprobar → `financiable`.
- [ ] **3.5** `/empresa`: catálogo filtrado a `estado = 'financiable'`. Tarjetas con monto, zona, org, estudiantes esperados.
- [ ] **3.6** Mockup de pago: formulario de tarjeta con banner visible **"Simulación — no se procesa ningún cobro real"**. Al confirmar: insert en `financiamientos` + transición a `financiada`.
- [ ] **3.7** Panel de organización: botón "Abrir inscripciones" en iniciativas `financiada` → `inscripcion_abierta`.

### 🚦 GATE 3

Recorrer los 5 estados con 3 sesiones distintas (org, admin, empresa) en la URL pública. Verificar que una iniciativa `financiable` **NO aparece** en el catálogo de estudiantes.

---

# PLAN 4 — Estudiante

**Tiempo:** 1h 30min · **Dueño:** Hipster

### Archivos

- `src/app/estudiante/page.tsx` — catálogo (lista + mapa)
- `src/app/estudiante/iniciativa/[id]/page.tsx` — detalle + inscripción
- `src/app/estudiante/horas/page.tsx` — progreso, historial, stamps

### Tareas

- [ ] **4.1** Catálogo: solo `estado = 'inscripcion_abierta'`. Tarjeta con nombre, fecha, horas otorgadas, cupos restantes, sello de verificación, logo de la empresa patrocinadora.
- [ ] **4.2** Toggle lista ↔ mapa (reusar `HeatmapZonas` con marcadores de iniciativa).
- [ ] **4.3** Detalle: descripción, punto de encuentro, sello verificado con tooltip explicando qué garantiza.
- [ ] **4.4** Botón "Inscribirme" → insert en `inscripciones`. Bloquear si `count(inscripciones) >= cupo_max`.
- [ ] **4.5** `/estudiante/horas`: barra de progreso `horas_acumuladas / horas_requeridas`, historial y grid de stamps.

### 🚦 GATE 4

Inscribirse desde móvil en ≤2 taps. Verificar que una segunda inscripción del mismo estudiante a la misma iniciativa **falla** (constraint `unique`).

---

# PLAN 5 — Cierre de impacto ⭐⭐ EL MOMENTO WOW

**Tiempo:** 1h 30min · **Dueño:** Hacker

> Este plan es el clímax de la demo: la organización cierra la jornada y **la zona baja de nivel en el mapa, en vivo**. Es literalmente el criterio *"visualización del impacto"* de la rúbrica de EcoTrack.

### Archivos

- `src/app/organizacion/jornada/[id]/page.tsx` — asistencia + cuantificación
- `supabase/functions/cerrar_jornada.sql` — RPC transaccional

### Tareas

- [ ] **5.1** Vista de jornada: lista de inscritos con checkbox de asistencia.
- [ ] **5.2** Formulario de cuantificación: métrica + valor + unidad (ej. "basura recolectada" / 240 / "kg").
- [ ] **5.3** **RPC transaccional** — todo o nada. Cinco llamadas sueltas desde el cliente dejarían horas sin stamp si una falla a medias:

```sql
create or replace function cerrar_jornada(p_iniciativa uuid)
returns void language plpgsql security definer as $$
declare h int; z uuid;
begin
  select horas_otorgadas, zona_id into h, z from iniciativas where id = p_iniciativa;

  insert into asistencias (inscripcion_id, asistio, horas_acreditadas)
  select i.id, true, h from inscripciones i
  where i.iniciativa_id = p_iniciativa
  on conflict (inscripcion_id) do nothing;

  update estudiantes e set horas_acumuladas = horas_acumuladas + h
  where e.id in (select estudiante_id from inscripciones where iniciativa_id = p_iniciativa);

  insert into stamps (estudiante_id, iniciativa_id, tipo)
  select estudiante_id, p_iniciativa, 'jornada'
  from inscripciones where iniciativa_id = p_iniciativa
  on conflict do nothing;

  update zonas set nivel_gravedad = case nivel_gravedad
    when 'critico' then 'medio'::nivel_gravedad
    when 'alto'    then 'bajo'::nivel_gravedad
    when 'medio'   then 'bajo'::nivel_gravedad
    else 'recuperada'::nivel_gravedad
  end,
  actualizada_en = now()
  where id = z;

  update iniciativas set estado = 'completada' where id = p_iniciativa;
end $$;
```

- [ ] **5.4** Botón "Cerrar jornada" llama al RPC y redirige al **mapa público**.
- [ ] **5.5** El mapa muestra la zona con su nuevo color + etiqueta "Recuperada tras jornada del <fecha>".

### 🚦 GATE 5

Correr el flujo completo de punta a punta (los 10 pasos). **Cronometrarlo.** Debe caber en menos de 4 minutos hablando.

---

# PLAN 6 — API pública + coopetencia + dashboards

**Tiempo:** 1h · **Dueño:** Hacker (API) + Hustler (coordinación con el otro equipo)

> Coopetencia vale **20 de 200 puntos** y casi nadie la va a hacer bien. La rúbrica es explícita: feedback entre equipos NO cuenta; tiene que ser consumo de datos o integración.

### Tareas

- [ ] **6.1** `GET /api/public/zonas.geojson` — FeatureCollection con `nivel_gravedad`, `total_reportes`, `nivel_inicial`.
- [ ] **6.2** `GET /api/public/reportes.geojson` — puntos con tipo y fecha.
- [ ] **6.3** CORS abierto en ambos endpoints (`Access-Control-Allow-Origin: *`). Sin esto, nadie los puede consumir desde el browser y la coopetencia muere.
- [ ] **6.4** **Hablar con el equipo de DataTour (Reto 5) a primera hora.** Ellos *necesitan* que otra solución consuma sus datos; ustedes necesitan exponer los suyos. Es simbiótico en las dos direcciones. Segunda opción: TwinScape (Reto 6), que necesita dos capas de datos.
- [ ] **6.5** **Consumir también** el endpoint del otro equipo — mostrar destinos turísticos cercanos a cada zona contaminada. Eso conecta contaminación ↔ turismo, que es el corazón de EcoTrack.
- [ ] **6.6** Dashboard de empresa: monto invertido, estudiantes, horas, zonas recuperadas, antes/después de la zona.
- [ ] **6.7** Dashboard de organización: iniciativas ejecutadas, horas generadas, impacto acumulado.

### 🚦 GATE 6

`curl` a los dos endpoints desde fuera. Captura del otro equipo consumiendo los datos. **Commit con la integración** (es la evidencia que pide la rúbrica).

---

# PLAN 7 — Entregables 🔒 NO NEGOCIABLE

**Tiempo:** 2h · **Dueño:** Hustler (+ todos) · **Empieza a las 12:30pm sin importar el estado del código**

> Un proyecto brillante sin entregables saca menos puntos que uno mediocre con los seis entregables completos. **Este plan se ejecuta aunque el Plan 6 no haya terminado.**

### Tareas

- [ ] **7.1** README con: nombre, descripción, stack, instalación, ejecución, `.env.example`, **tabla de qué está funcional / simulado / pendiente**, diagrama de arquitectura, documentación de la API pública, **credenciales de prueba por rol**.
- [ ] **7.2** Resumen ejecutivo (11 puntos exigidos por la organización).
- [ ] **7.3** Rocket Pitch — 5 a 8 diapositivas, estructura obligatoria: problema (COMETAS) · beneficiario (GTM) · solución · demo · tecnología · impacto · evidencia de prueba · coopetencia · monetización y proyección a 5-10 años.
- [ ] **7.4** Evidencia de prueba (máx. 3 páginas + subcarpeta con 5-7 imágenes del trayecto). Debe mostrar **una decisión concreta tomada a partir de feedback**.
- [ ] **7.5** Evidencia de coopetencia + **video de 30-60 segundos**.
- [ ] **7.6** 🎥 **GRABAR VIDEO DE RESPALDO DEL FLUJO COMPLETO ANTES DE LAS 2:00 PM.** La rúbrica lo permite explícitamente si el deployment falla por causa externa. Es un seguro de 2 minutos contra perder todos los puntos técnicos.
- [ ] **7.7** Carpeta consolidada con la estructura exacta que pide la organización.

### 🚦 GATE 7 — 2:00 PM

Los seis entregables existen. URL viva. Video de respaldo grabado. **Se para de codear.**

---

# PLAN 8 — Backlog post-hackathon

Todo esto se **declara en el README y en el pitch** como próximos pasos. No se construye.

| # | Feature | Por qué se pospone |
| --- | --- | --- |
| 8.1 | Notificaciones y recordatorios | No aporta nada en una demo en vivo. Cero puntos de rúbrica. |
| 8.2 | Constancia en PDF descargable | La página verificable por URL demuestra lo mismo y cuesta 10× menos. |
| 8.3 | Badges y misiones | Los stamps ya dan el momento de gratificación. Diminishing returns. |
| 8.4 | Sincronización offline de asistencia | Complejidad alta, imposible de demostrar en vivo. |
| 8.5 | Capacitación virtual (chat org ↔ estudiantes) | Es un módulo entero. No cabe. |
| 8.6 | Cancelación con notificación a inscritos | El estado existe en la máquina; la UI puede esperar. |
| 8.7 | Verificación real de organizaciones y empresas | Se pre-aprueban en el seed y se declara como simulado. |
| 8.8 | Pago real (Stripe/Wompi) | El mockup declarado es suficiente y la rúbrica no penaliza simulaciones declaradas. |
| 8.9 | Rate limiting de reportes | Riesgo real en producción, irrelevante ante el jurado. |
| 8.10 | Convenio de validación institucional de horas | No es técnico. Es el próximo paso de negocio del pitch. |

---

## Línea de tiempo consolidada

| Hora | Plan | Quién |
| --- | --- | --- |
| 23:00 – 23:45 | Plan 0 — Fundación | Hacker |
| 23:45 – 01:00 | Plan 1 — Modelos y datos | Hacker |
| 01:00 – 03:00 | Plan 2 — Reporte + heatmap ⭐ | Hipster |
| 01:00 – 03:00 | Plan 3 — Ciclo de iniciativa | Hustler |
| 03:00 – 06:00 | Descanso por turnos | — |
| 06:00 – 07:30 | Plan 4 — Estudiante | Hipster |
| 06:00 – 07:30 | Plan 5 — Cierre de impacto ⭐⭐ | Hacker |
| 07:30 – 09:00 | Plan 6 — API + coopetencia | Hacker / Hustler |
| 09:00 – 12:30 | Buffer, pulido, ensayo de la demo | Todos |
| 12:30 – 14:30 | Plan 7 — Entregables 🔒 | Todos |
| 14:30 – 15:00 | Ensayo final del pitch | Todos |
| 15:00 | Registro en Key Institute | Todos |
| 15:30 | Demo Show | Todos |

**El buffer de 09:00 a 12:30 no es opcional.** Algo va a fallar. Si no falla nada, se usa para ensayar la demo, que es lo que el jurado realmente califica.
