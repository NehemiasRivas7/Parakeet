# Parakeet

App de voluntariado que conecta **estudiantes que necesitan horas sociales** con **iniciativas comunitarias**, financiadas por la **RSE de empresas consolidadas**.

**Evento:** Hackathon de Turismo Creativo Vol. 1 · **Reto 4: EcoTrack** (turismo ecológico y sostenible)
**Deadline:** Demo Show — domingo 12 de julio, 3:30 PM, Key Institute.

---

## Contexto obligatorio

**Antes de escribir cualquier línea de código, leé:**

- `docs/requerimientos-y-arquitectura.md` — requerimientos funcionales (RF), no funcionales (RNF), stack justificado, modelo de datos completo, máquina de estados.
- `docs/plan-implementacion.md` — planes 0 a 8 con gates de verificación. **Se ejecutan en orden.**

Si algo en este archivo contradice a esos documentos, ganan esos documentos.

---

## El modelo en una frase

La comunidad propone iniciativas, las empresas las financian con su presupuesto de RSE, los estudiantes las ejecutan y cumplen sus horas sociales, y Parakeet conecta a las tres partes dejando impacto medible, trazable y visible.

## Los tres actores

| Actor | Rol | Auth |
| --- | --- | --- |
| Ciudadano anónimo | Reporta puntos contaminados | ❌ No requiere cuenta |
| Estudiante | Busca iniciativas, se inscribe, acumula horas | ✅ |
| Organización | Propone iniciativas, capacita, toma asistencia, cuantifica | ✅ |
| Empresa (RSE) | Financia, recibe reporte de impacto | ✅ |
| Admin | Verifica y aprueba | ✅ |

---

## Stack

| Capa | Tecnología |
| --- | --- |
| Framework | Next.js 16 (App Router) + TypeScript · React 19 |
| Estilos | Tailwind CSS v4 (config CSS-first en `globals.css`) |
| Backend / BD | Supabase (PostgreSQL + Auth + Storage + RLS) |
| Mapas | Leaflet + react-leaflet + OpenStreetMap |
| Heatmap | leaflet.heat |
| Gráficas | Recharts |
| Deploy | Vercel |

**No agregar dependencias sin justificarlo.** Cada librería nueva es tiempo de integración que no tenemos.

---

## Estructura de carpetas

```
src/
├── app/
│   ├── page.tsx                          # Landing + mapa público con heatmap
│   ├── reportar/                         # Reporte ciudadano (SIN AUTH)
│   ├── estudiante/
│   │   ├── page.tsx                      # Catálogo de iniciativas
│   │   ├── iniciativa/[id]/page.tsx      # Detalle + inscripción
│   │   └── horas/page.tsx                # Progreso, historial, stamps
│   ├── organizacion/
│   │   ├── page.tsx                      # Panel con estados
│   │   ├── nueva/page.tsx                # Crear iniciativa desde zona
│   │   └── jornada/[id]/page.tsx         # Asistencia + cuantificación
│   ├── empresa/
│   │   ├── page.tsx                      # Catálogo financiable
│   │   ├── financiar/[id]/page.tsx       # Mockup de pago (SIMULADO)
│   │   └── dashboard/page.tsx            # Impacto acumulado
│   ├── admin/page.tsx                    # Cola de aprobación
│   └── api/
│       ├── health/route.ts               # GET  — verificación
│       ├── reportes/route.ts             # POST — crear reporte anónimo
│       ├── iniciativas/[id]/estado/      # PATCH — transiciones
│       └── public/
│           ├── zonas.geojson/route.ts    # GET  — API PÚBLICA (coopetencia)
│           └── reportes.geojson/route.ts # GET  — API PÚBLICA (coopetencia)
├── components/
│   ├── mapa/
│   │   ├── HeatmapZonas.tsx              # Mapa Leaflet + capa heat
│   │   └── MarcadorIniciativa.tsx
│   ├── iniciativa/
│   │   ├── TarjetaIniciativa.tsx
│   │   └── BadgeEstado.tsx
│   └── ui/                               # Botones, inputs, cards
├── lib/
│   ├── supabase/
│   │   ├── client.ts                     # Cliente de browser
│   │   └── server.ts                     # Cliente de servidor (SSR)
│   ├── iniciativas/
│   │   └── transiciones.ts               # ⚠️ MÁQUINA DE ESTADOS — ver abajo
│   ├── zonas/
│   │   └── gravedad.ts                   # Cálculo de nivel + Haversine
│   └── database.types.ts                 # Tipos generados de Supabase
└── supabase/
    ├── schema.sql
    ├── rls.sql
    ├── functions.sql                     # Triggers y RPCs
    └── seed.sql                          # Zona piloto
```

---

## Reglas del proyecto

### 1. Mobile-first sin excepción
Todo se diseña primero para **375px** de ancho. Si requiere scroll horizontal en un teléfono, está mal. Los usuarios reales (estudiantes reportando en la playa) no tienen un monitor.

### 2. Nada se mergea sin estar desplegado
La rúbrica exige una **URL pública activa al momento de la evaluación**. Un feature perfecto en localhost vale cero puntos. Cada merge a `main` se verifica en la URL de Vercel.

### 3. Toda transición de estado pasa por `transiciones.ts`
**Nunca** escribir `update iniciativas set estado = ...` suelto en un route handler o un componente. La máquina de estados vive en un solo archivo:

```
borrador → en_revision → financiable → financiada → inscripcion_abierta → en_curso → completada
                                                                                         ↑
cancelada ← (desde cualquier estado activo)
```

**Regla de visibilidad crítica:**
- `financiable` y `financiada` → visibles solo para **empresas**
- `inscripcion_abierta` en adelante → visibles para **estudiantes**
- Una iniciativa **nunca** aparece en el catálogo de estudiantes antes de estar financiada.

### 4. Los reportes son anónimos por diseño
La tabla `reportes` **no tiene FK a `usuarios`**. Es deliberado: el reto EcoTrack quiere maximizar la captación de datos sin fricción de registro. No agregar `usuario_id` "por si acaso".

### 5. El cierre de jornada es transaccional
Marcar asistencia dispara cinco efectos: acreditar horas, sumar a `horas_acumuladas`, otorgar stamp, emitir constancia y **bajar el nivel de gravedad de la zona**. Esto va en un **RPC de Postgres** (`cerrar_jornada`), no en cinco llamadas desde el cliente. Si una falla a medias, quedan horas sin constancia.

### 6. Commits cada 20-30 minutos
Ramas cortas, merge rápido. No hay tiempo para resolver conflictos gigantes.

### 7. Declarar lo simulado, no esconderlo
La rúbrica **no penaliza** el uso declarado de mocks y datos simulados. Sí penaliza prometer y no demostrar. El mockup de pago lleva un banner visible: *"Simulación — no se procesa ningún cobro real"*.

---

## El momento wow (no perderlo de vista)

Cuando la organización **cierra la jornada**, la zona **baja de nivel en el heatmap, en vivo**, y el mapa muestra el antes/después.

Ese es el criterio *"visualización del impacto"* de la rúbrica específica de EcoTrack. Si el proyecto llega a la demo sin eso, es una app de voluntariado bonita que **no responde al reto**.

---

## Coopetencia (20 de 200 puntos)

Parakeet expone `/api/public/zonas.geojson` y `/api/public/reportes.geojson` con **CORS abierto**.

La rúbrica es explícita: el feedback entre equipos **no cuenta** como coopetencia. Solo cuenta consumo de datos, uso de API/dataset compartido, integración parcial o demo conectada.

Equipos objetivo: **DataTour (Reto 5)** — ellos necesitan que otra solución consuma sus datos, nosotros necesitamos exponer los nuestros. Es simbiótico en ambas direcciones. Segunda opción: **TwinScape (Reto 6)**, que necesita integrar al menos dos capas de datos.

Si se toca la integración, **commitear la evidencia** (es lo que pide la rúbrica).

---

## Convenciones de código

- **Nombres en español** para el dominio (`iniciativas`, `zonas`, `horas_acumuladas`), **inglés** para lo técnico (`handler`, `fetch`, `props`). El dominio es salvadoreño; que se lea como tal.
- Server Components por defecto. `'use client'` solo donde hay estado o eventos.
- **Next 16:** `params` y `searchParams` son `Promise`. En rutas `[id]` hay que `await params` (o `use(params)` en Client Components). No usar la firma síncrona de Next 14.
- Leaflet **revienta en SSR**. Siempre importarlo con `dynamic(() => import(...), { ssr: false })`.
- Nada de `any`. Usar los tipos generados de `database.types.ts`.
- Sin `localStorage` ni `sessionStorage` para datos de dominio — todo va a Supabase.

---

## Lo que NO se construye

Está en el backlog (Plan 8) y se **declara en el README y el pitch** como próximos pasos:

notificaciones y recordatorios · constancia en PDF · badges y misiones · sincronización offline · chat de capacitación virtual · cancelación con notificaciones · verificación real de actores · pago real (Stripe/Wompi) · rate limiting.

No los construyas aunque parezcan rápidos. El tiempo va al flujo principal.

---

## Comandos

```bash
npm run dev              # Desarrollo local
npm run build            # Verificar que compila antes de pushear
npx supabase gen types typescript --project-id <id> > src/lib/database.types.ts
curl https://<app>.vercel.app/api/health   # Verificar deployment
```
