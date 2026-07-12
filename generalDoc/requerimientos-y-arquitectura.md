# Parakeet — Requerimientos, Stack y Arquitectura

_Hackathon de Turismo Creativo Vol. 1 · Reto 4: EcoTrack_
_Documento técnico · 11 de julio de 2026, 23:00_

---

## 0. Encaje con el reto (EcoTrack — COMETAS)

| Apartado COMETAS | Cómo lo cumple Parakeet |
| --- | --- |
| **Contexto** | La contaminación afecta destinos turísticos, comunidades y la experiencia del visitante. |
| **Oportunidad** | Turistas, estudiantes, negocios y comunidades **reportan** puntos contaminados e impulsan acciones sostenibles. |
| **Mejora** | Hace **visibles los puntos críticos** (heatmap) y **mide** reportes, jornadas e impacto acumulado por zona piloto. |
| **Tecnología** | Web app mobile-first con reportes, mapas, geolocalización, indicadores ambientales y sistema de incentivos (stamps/badges). |
| **Expectativas** | Solución simple, accionable, donde el impacto de cada acción es visible (mapa antes/después). |
| **Área** | Turismo ecológico y sostenible. |

**Zona piloto sugerida:** una zona costera o turística concreta (ej. Playa El Tunco / Puerto de La Libertad). Elegir UNA sola zona para el demo.

---

## 1. Actores del sistema

| Actor | Rol | Auth requerida |
| --- | --- | --- |
| **Ciudadano anónimo** | Reporta puntos contaminados | ❌ No |
| **Estudiante (William)** | Busca iniciativas, se inscribe, cumple horas, recibe constancia | ✅ Sí |
| **Organización (Diego / Raíces)** | Propone iniciativas, capacita, toma asistencia, cuantifica impacto | ✅ Sí |
| **Empresa (RSE)** | Explora catálogo, financia, recibe reporte de impacto | ✅ Sí |
| **Admin (Parakeet)** | Verifica organizaciones e iniciativas | ✅ Sí |

---

## 2. Máquina de estados de la iniciativa

```
BORRADOR
   └─(org envía)──> PENDIENTE_REVISION
                        └─(admin aprueba)──> ABIERTA_FINANCIAMIENTO   [visible: empresas]
                                                  └─(empresa financia)──> FINANCIADA
                                                                            └─(org abre)──> INSCRIPCION_ABIERTA   [visible: estudiantes]
                                                                                                 └─(fecha llega)──> EN_CURSO
                                                                                                                      └─(org cierra)──> COMPLETADA
CANCELADA  <── (desde cualquier estado activo)
```

**Regla clave:** la iniciativa **no es visible para estudiantes** hasta el estado `INSCRIPCION_ABIERTA`. Solo es visible para empresas desde `ABIERTA_FINANCIAMIENTO`.

---

## 3. Requerimientos Funcionales

Leyenda de prioridad:
- 🟢 **MVP-DEMO** — se construye y se demuestra mañana
- 🟡 **SIMULADO** — se muestra con datos mock / hardcoded
- 🔴 **PENDIENTE** — se declara en README y pitch, no se construye

---

### RF-A · Reporte ciudadano y heatmap (núcleo del reto EcoTrack)

| ID | Requerimiento | Prioridad |
| --- | --- | --- |
| RF-A01 | El sistema permite a cualquier persona **sin autenticación** crear un reporte de punto contaminado. | 🟢 |
| RF-A02 | El reporte captura: latitud, longitud, descripción y tipo de contaminación. | 🟢 |
| RF-A03 | El sistema obtiene la ubicación vía **geolocalización del navegador**, con opción de ajustar manualmente en el mapa. | 🟢 |
| RF-A04 | El reporte permite adjuntar opcionalmente una fotografía. | 🟡 |
| RF-A05 | El sistema renderiza un **heatmap** cuya intensidad es proporcional al número de reportes acumulados en una zona. | 🟢 |
| RF-A06 | El sistema agrupa reportes cercanos (radio configurable) en una **zona** con nivel de gravedad calculado. | 🟢 |
| RF-A07 | El nivel de gravedad de una zona se calcula como: `CRITICO ≥10 reportes · ALTO 5-9 · MEDIO 2-4 · BAJO 1`. | 🟢 |
| RF-A08 | Al tocar una zona, el sistema muestra: número de reportes, tipo predominante y fecha del reporte más reciente. | 🟢 |
| RF-A09 | El sistema aplica rate limiting por IP para evitar spam de reportes. | 🔴 |
| RF-A10 | El sistema expone el heatmap como **API pública GeoJSON** consumible por terceros. | 🟢 ⭐ |

> ⭐ **RF-A10 es la pieza de COOPETENCIA.** Ver sección 8.

---

### RF-B · Organización (Diego)

| ID | Requerimiento | Prioridad |
| --- | --- | --- |
| RF-B01 | La organización se registra y queda en estado `PENDIENTE_VERIFICACION` hasta aprobación de admin. | 🟡 |
| RF-B02 | La organización visualiza el heatmap y puede **crear una iniciativa desde una zona crítica**, heredando su ubicación. | 🟢 |
| RF-B03 | La organización crea la iniciativa capturando: nombre, descripción, tipo de causa, fecha, ubicación, cupo de estudiantes, horas sociales otorgadas y monto de financiamiento requerido. | 🟢 |
| RF-B04 | El sistema permite guardar la iniciativa como `BORRADOR` y editarla antes de enviarla. | 🟡 |
| RF-B05 | La organización envía la iniciativa a revisión → estado `PENDIENTE_REVISION`. | 🟢 |
| RF-B06 | El sistema valida campos obligatorios antes de permitir el envío. | 🟢 |
| RF-B07 | La organización visualiza el estado actual de todas sus iniciativas en un panel. | 🟢 |
| RF-B08 | Al recibir financiamiento, la organización puede **abrir inscripciones** manualmente → `INSCRIPCION_ABIERTA`. | 🟢 |
| RF-B09 | La organización visualiza el listado de estudiantes inscritos (nombre, institución, fecha de inscripción). | 🟢 |
| RF-B10 | La organización publica contenido de capacitación (texto/enlaces) visible solo para inscritos. | 🟡 |
| RF-B11 | La organización envía mensajes masivos a los inscritos. | 🔴 |
| RF-B12 | La organización **marca asistencia** de cada estudiante inscrito el día de la jornada. | 🟢 |
| RF-B13 | Al marcar asistencia, el sistema **acredita horas y otorga stamp automáticamente** al estudiante. | 🟢 |
| RF-B14 | La organización registra **métricas cuantificadas** de la jornada (ej. kg recolectados, m² atendidos). | 🟢 |
| RF-B15 | La organización sube evidencia fotográfica de la jornada. | 🟡 |
| RF-B16 | La organización **cierra la iniciativa** → `COMPLETADA`; el sistema genera el resumen de impacto. | 🟢 |
| RF-B17 | Al cerrar, el sistema **reduce el nivel de gravedad de la zona** en el heatmap. | 🟢 ⭐ |
| RF-B18 | La organización cancela una iniciativa indicando motivo; se notifica a inscritos y empresa. | 🔴 |
| RF-B19 | La organización consulta un dashboard de impacto acumulado. | 🟡 |
| RF-B20 | La organización tiene un perfil público verificado con historial. | 🔴 |

> ⭐ **RF-B17 es el "wow moment" del demo.** El cierre de la jornada cambia visiblemente el mapa. Es literalmente lo que EcoTrack pide: *"el impacto de cada acción claramente visible"*.

---

### RF-C · Estudiante (William)

| ID | Requerimiento | Prioridad |
| --- | --- | --- |
| RF-C01 | El estudiante se registra con correo y datos básicos (nombre, institución, horas requeridas). | 🟢 |
| RF-C02 | El estudiante visualiza el **catálogo de iniciativas** solo en estado `INSCRIPCION_ABIERTA`. | 🟢 |
| RF-C03 | Cada iniciativa muestra: nombre, fecha, ubicación, horas otorgadas, cupos restantes, organización y empresa patrocinadora. | 🟢 |
| RF-C04 | El estudiante filtra iniciativas por fecha, tipo de causa y cantidad de horas. | 🟡 |
| RF-C05 | El estudiante visualiza el catálogo también en **vista de mapa**. | 🟢 |
| RF-C06 | Cada iniciativa muestra un **sello de verificación** con explicación de qué garantiza. | 🟢 |
| RF-C07 | El estudiante se **inscribe** a una iniciativa con un solo tap. | 🟢 |
| RF-C08 | El sistema bloquea la inscripción si el cupo está lleno. | 🟢 |
| RF-C09 | El estudiante visualiza sus iniciativas inscritas con fecha, lugar y punto de encuentro. | 🟢 |
| RF-C10 | El estudiante accede al contenido de capacitación de las iniciativas donde está inscrito. | 🟡 |
| RF-C11 | El estudiante visualiza su **contador de horas**: acumuladas / requeridas / restantes, con barra de progreso. | 🟢 |
| RF-C12 | El estudiante visualiza su **historial de participación** con horas e impacto por jornada. | 🟢 |
| RF-C13 | El estudiante recibe un **stamp** automáticamente al marcarse su asistencia. | 🟢 |
| RF-C14 | El estudiante desbloquea **badges** al cumplir misiones (1ª jornada, 3 jornadas, 5 jornadas). | 🟡 |
| RF-C15 | El estudiante descarga una **constancia verificable** de sus horas. | 🟡 |
| RF-C16 | La constancia es verificable públicamente mediante una URL con código único. | 🟡 |
| RF-C17 | El estudiante recibe recordatorios antes de la jornada. | 🔴 |
| RF-C18 | El estudiante ve el **impacto cuantificado** de las jornadas en las que participó. | 🟢 |
| RF-C19 | El estudiante ve quiénes más están inscritos en una iniciativa. | 🔴 |

---

### RF-D · Empresa (RSE)

| ID | Requerimiento | Prioridad |
| --- | --- | --- |
| RF-D01 | La empresa se registra y queda pendiente de verificación por admin. | 🟡 |
| RF-D02 | La empresa visualiza el **catálogo de iniciativas** solo en estado `ABIERTA_FINANCIAMIENTO`. | 🟢 |
| RF-D03 | Cada iniciativa del catálogo muestra: nombre, causa, zona, organización, monto requerido, estudiantes esperados e impacto proyectado. | 🟢 |
| RF-D04 | La empresa consulta el detalle de la iniciativa, incluyendo la zona en el mapa y su gravedad actual. | 🟢 |
| RF-D05 | La empresa **confirma el financiamiento** de una iniciativa → `FINANCIADA`. | 🟢 |
| RF-D06 | El flujo de pago es un **mockup simulado** (formulario de tarjeta sin cobro real), claramente declarado. | 🟡 |
| RF-D07 | La empresa recibe un comprobante de compromiso de financiamiento. | 🟡 |
| RF-D08 | La empresa da seguimiento al estado de las iniciativas que financió. | 🟢 |
| RF-D09 | La empresa recibe un **reporte de impacto** al completarse la iniciativa: asistentes, horas generadas, métricas y evidencia. | 🟢 |
| RF-D10 | La empresa visualiza el **antes/después de la zona en el mapa**. | 🟢 ⭐ |
| RF-D11 | La empresa consulta un **dashboard consolidado**: monto invertido, iniciativas, estudiantes, horas, zonas recuperadas. | 🟢 |
| RF-D12 | La empresa exporta el reporte consolidado en PDF. | 🔴 |
| RF-D13 | El logo de la empresa aparece asociado a las iniciativas que financia. | 🟡 |
| RF-D14 | La empresa es notificada si una iniciativa financiada es cancelada. | 🔴 |

---

### RF-E · Plataforma / Admin

| ID | Requerimiento | Prioridad |
| --- | --- | --- |
| RF-E01 | El admin aprueba o rechaza iniciativas en `PENDIENTE_REVISION`. | 🟡 |
| RF-E02 | El admin verifica organizaciones y empresas. | 🔴 |
| RF-E03 | El sistema expone un **panel de métricas generales** del ecosistema. | 🟢 |
| RF-E04 | El sistema gestiona roles y permisos por tipo de usuario. | 🟢 |
| RF-E05 | El sistema expone una **API pública documentada** de zonas y reportes (GeoJSON). | 🟢 ⭐ |
| RF-E06 | El sistema expone un endpoint `/api/health` de verificación. | 🟢 |

---

## 4. Requerimientos No Funcionales

### RNF-1 · Usabilidad y experiencia
| ID | Requerimiento | Criterio verificable |
| --- | --- | --- |
| RNF-1.1 | **Mobile-first**: toda la interfaz se diseña primero para viewport de 375px y escala hacia arriba. | Ninguna vista requiere scroll horizontal en 375px. |
| RNF-1.2 | El reporte ciudadano se completa **sin registro** y en **máximo 3 taps**. | Medible en el demo. |
| RNF-1.3 | La inscripción de un estudiante se completa en **máximo 2 taps** desde el catálogo. | Medible en el demo. |
| RNF-1.4 | Áreas táctiles mínimas de 44×44 px. | Auditoría visual. |
| RNF-1.5 | Estados de carga y error explícitos en toda operación asíncrona. | Sin pantallas en blanco. |

### RNF-2 · Rendimiento
| ID | Requerimiento | Criterio verificable |
| --- | --- | --- |
| RNF-2.1 | First Contentful Paint < 2s en 4G. | Lighthouse. |
| RNF-2.2 | El heatmap renderiza < 1s con hasta 500 reportes. | Test con seed. |
| RNF-2.3 | Las respuestas de API responden en < 500ms (p95). | Logs. |

### RNF-3 · Disponibilidad (crítico para la evaluación)
| ID | Requerimiento | Criterio verificable |
| --- | --- | --- |
| RNF-3.1 | La URL pública debe estar **activa al momento de la evaluación**. | Verificación 3:00pm. |
| RNF-3.2 | Endpoint `/api/health` retorna `200 OK` con timestamp. | `curl`. |
| RNF-3.3 | Se dispone de **plan B**: capturas + video de respaldo del flujo completo. | Grabado antes de las 2pm. |

### RNF-4 · Seguridad y privacidad
| ID | Requerimiento | Criterio verificable |
| --- | --- | --- |
| RNF-4.1 | Autenticación por rol; cada rol solo accede a sus vistas. | Test manual por rol. |
| RNF-4.2 | **Row Level Security** en base de datos: un estudiante no puede leer datos de otro. | Políticas RLS activas. |
| RNF-4.3 | El reporte ciudadano es anónimo: no se almacena identidad. | Esquema sin FK a user. |
| RNF-4.4 | La empresa accede a métricas agregadas, **nunca a datos personales de estudiantes**. | Vistas agregadas. |
| RNF-4.5 | Ninguna credencial real en el repositorio; se incluye `.env.example`. | Revisión de repo. |

### RNF-5 · Datos
| ID | Requerimiento | Criterio verificable |
| --- | --- | --- |
| RNF-5.1 | Los datos del demo son **mixtos**: reportes ciudadanos reales generados en vivo + seed simulado de contexto. | Declarado en README y pitch. |
| RNF-5.2 | Existe un `seed.sql` que puebla el estado inicial reproducible. | Ejecutable. |
| RNF-5.3 | Todo cambio de estado de iniciativa queda registrado con timestamp. | Tabla de auditoría o campos `*_at`. |

### RNF-6 · Mantenibilidad y evaluabilidad
| ID | Requerimiento | Criterio verificable |
| --- | --- | --- |
| RNF-6.1 | Código organizado por módulos/carpetas. | Estructura del repo. |
| RNF-6.2 | README con: proyecto, descripción, stack, instalación, ejecución, variables de entorno y **qué está funcional / simulado / pendiente**. | Requisito explícito de la rúbrica. |
| RNF-6.3 | Diagrama de arquitectura incluido en el repo. | Imagen o Mermaid en README. |
| RNF-6.4 | API pública documentada (endpoints, método, ejemplo de respuesta). | Sección en README. |
| RNF-6.5 | Credenciales de prueba entregadas para cada rol. | Tabla en README. |

---

## 5. Stack recomendado

| Capa | Elección | Justificación |
| --- | --- | --- |
| **Framework** | **Next.js 16 (App Router) + TypeScript · React 19** | Un solo proyecto sirve frontend y API routes. Un solo deploy. En un hackathon, cada servicio extra que hay que desplegar es un punto de fallo a las 2am. _(Nota: `create-next-app@latest` instaló Next 16; `params`/`searchParams` son ahora `Promise`.)_ |
| **UI** | **Tailwind CSS v4 + shadcn/ui** | Mobile-first por defecto. Componentes accesibles sin diseñar desde cero. El Hipster maqueta rápido sin pelear con CSS. _(v4: config CSS-first vía `@import "tailwindcss"` en `globals.css`, sin `tailwind.config.js`.)_ |
| **Backend / BD** | **Supabase (PostgreSQL + Auth + Storage + RLS)** | Es el mayor ahorro de tiempo del stack. Da autenticación por rol, base de datos relacional, almacenamiento de imágenes y seguridad a nivel de fila **sin escribir un backend**. RLS resuelve RNF-4.2 y RNF-4.4 declarativamente. |
| **Mapa** | **Leaflet + react-leaflet + OpenStreetMap** | **Sin API key, sin tarjeta de crédito, sin límite de cuota.** A las 11pm no quieres estar esperando aprobación de una cuenta de Mapbox. |
| **Heatmap** | **leaflet.heat** | Plugin de una línea, exactamente lo que pide el reto. |
| **Gráficas** | **Recharts** | Para los dashboards de empresa y organización. Rápido de integrar. |
| **Deploy** | **Vercel** | `git push` → URL pública HTTPS en 60s. Cumple RNF-3.1 sin configuración. Free tier suficiente. |
| **Geolocalización** | **Navigator Geolocation API** (nativa del navegador) | Cero dependencias. |
| **Constancia** | **Página pública verificable por URL** (`/verificar/[codigo]`) | Más rápido de construir que un PDF y **más impresionante en demo**: se abre en cualquier navegador y demuestra la verificabilidad. |

### Por qué NO otras opciones

- **NO Firebase**: no es relacional. El modelo de Parakeet es relacional puro (iniciativa → inscripciones → asistencias → horas). Postgres es la elección natural.
- **NO backend separado (Express/Nest/FastAPI)**: dos repos, dos deploys, CORS, dos veces la superficie de fallo. No hay tiempo.
- **NO React Native / app nativa**: el jurado necesita **una URL pública en navegador**. Una app nativa sería un tiro en el pie contra el criterio de aceptación.
- **NO Mapbox como primera opción**: requiere API key y cuenta. Leaflet arranca en 5 minutos.
- **NO PostGIS**: sobrecarga innecesaria. El clustering de reportes se resuelve con un cálculo de distancia simple (Haversine) en una función SQL o en TypeScript.

---

## 6. Arquitectura

```
┌──────────────────────────────────────────────────────────────┐
│                      CLIENTE (Mobile-first)                   │
│  Next.js App Router · React · Tailwind · shadcn/ui           │
│                                                               │
│  /                      → Landing + Mapa público (heatmap)   │
│  /reportar              → Reporte anónimo (SIN AUTH)         │
│  /estudiante/*          → Catálogo · Mis horas · Historial   │
│  /organizacion/*        → Crear iniciativa · Asistencia      │
│  /empresa/*             → Catálogo · Financiar · Dashboard   │
│  /verificar/[codigo]    → Constancia pública verificable     │
└─────────────────────────┬────────────────────────────────────┘
                          │
┌─────────────────────────▼────────────────────────────────────┐
│                   API ROUTES (Next.js)                        │
│                                                               │
│  GET  /api/health                    → verificación           │
│  GET  /api/public/zonas.geojson      → API PÚBLICA ⭐         │
│  GET  /api/public/reportes.geojson   → API PÚBLICA ⭐         │
│  POST /api/reportes                  → crear reporte anónimo  │
│  ...  /api/iniciativas/*             → CRUD + transiciones    │
│  POST /api/asistencia                → marcar + acreditar     │
└─────────────────────────┬────────────────────────────────────┘
                          │
┌─────────────────────────▼────────────────────────────────────┐
│                        SUPABASE                               │
│                                                               │
│  Auth (roles: estudiante | organizacion | empresa | admin)   │
│  PostgreSQL + Row Level Security                              │
│  Storage (fotos de reportes y evidencia de jornadas)         │
└──────────────────────────────────────────────────────────────┘
                          │
                    Deploy: VERCEL
```

### Modelo de datos (núcleo)

```
usuarios          (id, email, rol, nombre)
  ├── estudiantes     (user_id, institucion, horas_requeridas)
  ├── organizaciones  (user_id, nombre_org, zona, verificada)
  └── empresas        (user_id, nombre_empresa, logo_url, verificada)

reportes          (id, lat, lng, tipo, descripcion, foto_url, creado_en)
                   ── SIN user_id: es anónimo por diseño (RNF-4.3)

zonas             (id, lat_centro, lng_centro, radio, nivel_gravedad,
                   nivel_inicial, total_reportes, actualizada_en)

iniciativas       (id, org_id, zona_id, empresa_id?, nombre, descripcion,
                   tipo_causa, lat, lng, fecha, cupo, horas_otorgadas,
                   monto_requerido, estado, creada_en, ...timestamps por estado)

inscripciones     (id, iniciativa_id, estudiante_id, estado, inscrito_en)

asistencias       (id, inscripcion_id, asistio, horas_acreditadas,
                   marcada_en, marcada_por)

resultados        (id, iniciativa_id, metrica, valor, unidad, fotos[])

stamps            (id, estudiante_id, iniciativa_id, tipo, otorgado_en)

constancias       (id, estudiante_id, iniciativa_id, codigo_verificacion,
                   horas, emitida_en)
```

### Flujo crítico del demo (el que se presenta ante el jurado)

```
1. [Móvil, sin login]  Reportar punto contaminado    → aparece en heatmap ✨
2. [Organización]      Ver zona crítica → crear iniciativa → enviar
3. [Admin]             Aprobar → ABIERTA_FINANCIAMIENTO
4. [Empresa]           Ver catálogo → financiar (mockup) → FINANCIADA
5. [Organización]      Abrir inscripciones → INSCRIPCION_ABIERTA
6. [Estudiante]        Ver catálogo → inscribirse
7. [Organización]      Marcar asistencia → cuantificar → CERRAR
8. [Estudiante]        Ver horas acreditadas + stamp + constancia
9. [Mapa]              Zona baja de CRÍTICO a MEDIO  ← 🎯 EL MOMENTO WOW
10.[Empresa]           Ver reporte de impacto + antes/después
```

**Este flujo completo debe correr en menos de 4 minutos en vivo.** Es la demo.

---

## 7. Plan de ejecución sugerido (10–12 horas restantes)

| Bloque | Horas | Entregable |
| --- | --- | --- |
| **Setup** | 1h | Next.js + Supabase + Vercel desplegado con "Hello World" y `/api/health` respondiendo. **No pasar de aquí sin URL pública funcionando.** |
| **Datos** | 1h | Esquema SQL + RLS + `seed.sql` con reportes precargados en la zona piloto. |
| **Mapa + Reporte** | 2h | Heatmap funcional + flujo de reporte anónimo. Es el corazón del reto. |
| **Organización** | 2h | Crear iniciativa desde zona + panel de estados + asistencia + cierre. |
| **Estudiante** | 1.5h | Catálogo + inscripción + contador de horas + stamps. |
| **Empresa** | 1.5h | Catálogo + financiar (mockup) + dashboard de impacto. |
| **API pública + Coopetencia** | 0.5h | Endpoints GeoJSON + coordinar con el otro equipo. |
| **Entregables** | 2h | README, diagrama, resumen ejecutivo, evidencia, video de coopetencia, **grabar video de respaldo**. |

> ⚠️ **Regla de oro:** desplegar desde la PRIMERA hora, no la última. Un proyecto perfecto en localhost vale **cero puntos** en esta rúbrica.

---

## 8. Estrategia de Coopetencia ⭐

**Vale 20 de 200 puntos y es fácil de ganar si se hace bien.**

La rúbrica es explícita: solo cuentan como coopetencia válida el **consumo de datos**, **uso de API/endpoint/dataset compartido**, **integración parcial** o **demo conectada**. El feedback entre equipos NO cuenta.

### Jugada recomendada

Parakeet **expone** una API pública de datos ambientales georreferenciados:

```
GET /api/public/zonas.geojson
GET /api/public/reportes.geojson
```

Esto es un **activo directamente consumible** por:
- **DataTour (Reto 5)** — es literalmente su reto: una capa compartida de datos turísticos. Necesitan demostrar que **al menos otra solución consume sus datos**. Es simbiótico en ambas direcciones.
- **TwinScape (Reto 6)** — necesitan integrar **al menos dos capas de datos** en su digital twin. La capa ambiental de Parakeet es una de ellas, servida en GeoJSON, lista para pintar.
- **TouristSV (Reto 1)** — puede advertir al turista sobre zonas contaminadas cercanas a su ruta.

### Doble vía (más fuerte)

No solo **exponer**: también **consumir**. Si DataTour tiene un endpoint de lugares turísticos, Parakeet lo consume para mostrar en el mapa qué **destinos turísticos** están cerca de cada zona contaminada. Eso conecta directamente contaminación ↔ turismo, que es el corazón del reto EcoTrack.

### Evidencia a capturar

- Commit con la integración.
- Captura del endpoint respondiendo.
- Mención cruzada en ambos pitches.
- **Video de 30–60 segundos** explicando la simbiocreación (requisito obligatorio).

---

## 9. Declaración de estado para el README

Esta tabla va tal cual en el README (la rúbrica lo pide explícitamente y **no penaliza declarar simulaciones**):

| Componente | Estado |
| --- | --- |
| Reporte ciudadano + heatmap | ✅ Funcional |
| Cálculo de gravedad por zona | ✅ Funcional |
| API pública GeoJSON | ✅ Funcional |
| Ciclo de vida de iniciativa (7 estados) | ✅ Funcional |
| Inscripción de estudiantes | ✅ Funcional |
| Asistencia → horas → stamps | ✅ Funcional |
| Cuantificación de impacto + cierre | ✅ Funcional |
| Actualización de zona en el mapa | ✅ Funcional |
| Dashboards | ✅ Funcional |
| Flujo de pago de la empresa | 🟡 Simulado (mockup, sin cobro real) |
| Verificación de organizaciones/empresas | 🟡 Simulado (pre-aprobadas en seed) |
| Constancia descargable | 🟡 Simulada (página verificable, sin PDF) |
| Notificaciones y recordatorios | 🔴 Pendiente |
| Sincronización offline | 🔴 Pendiente |
| Validación institucional de horas | 🔴 Pendiente (requiere convenio) |
