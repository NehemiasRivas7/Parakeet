# Parakeet — Soluciones y Propuestas de Valor (nueva propuesta)

_Documento de contexto para un nuevo proyecto · detallado punto por punto_
_Última actualización: 11 de julio de 2026_

---

## 0. Contexto de la nueva propuesta

Parakeet es una app de voluntariado que conecta tres actores en un mismo ecosistema:

- **Estudiantes** de pregrado y bachillerato que necesitan **horas sociales** para graduarse (y algunos voluntarios generales).
- **La comunidad** (líderes, ONGs locales, ADESCOs, clubes) que **propone iniciativas** —publicadas como un post en la web— e **implementa** esas iniciativas junto con los estudiantes.
- **Empresas ya consolidadas** que aportan financiamiento a través de sus programas de **Responsabilidad Social Empresarial (RSE)**.

**El modelo en una frase:** la comunidad propone iniciativas, las empresas las financian con su presupuesto de RSE, los estudiantes las ejecutan y cumplen sus horas sociales, y Parakeet conecta a las tres partes dejando **impacto medible, trazable y visible** para todos.

> **Nota importante sobre el pivote:** Parakeet **ya no** es una app de voluntariado para turismo (local ni extranjero). Todo lo que sigue reemplaza ese modelo anterior. La lógica central —conectar la intención de ayudar con acción real, verificable y con impacto visible— se conserva, pero ahora aplicada a horas sociales estudiantiles financiadas por RSE.

---

## 1. Visión general de la solución

Parakeet funciona como una **plataforma de tres lados** (estudiante ↔ comunidad ↔ empresa) construida alrededor de la **iniciativa** como unidad central. El recorrido completo es:

1. **Cualquier persona reporta un punto contaminado** (estudiantes o personas no verificadas): marca la ubicación en el mapa y describe la contaminación. A medida que más gente reporta el mismo punto, un **heatmap** refleja la **gravedad** de la contaminación en esa zona.
2. **La comunidad se entera** de las zonas críticas gracias al heatmap y **llena un formulario para solicitar financiamiento**, convirtiendo ese punto en una iniciativa de voluntariado.
3. **Una empresa financia** esa iniciativa con su presupuesto de RSE.
4. **Los estudiantes descubren** la iniciativa, verifican que les certificará horas y se inscriben.
5. **La organización capacita a los estudiantes** (de forma virtual) en las prácticas adecuadas de voluntariado antes de la jornada.
6. **La comunidad y los estudiantes ejecutan** la iniciativa juntos; la organización **toma asistencia** y **cuantifica** lo hecho en la sesión.
7. **Parakeet registra** el resultado, las horas cumplidas y el impacto; la zona pasa de "contaminada" a un nivel menor en el mapa, y se genera **trazabilidad** para la empresa, **constancia verificable** para el estudiante y **evidencia estructurada** para la comunidad.

Cada solución de las secciones siguientes es una pieza que hace posible o mejora una etapa de este recorrido.

---

## 2. Soluciones para el ESTUDIANTE (William)

Cada punto describe la solución, el dolor que resuelve y la ganancia que crea.

### 2.1 Catálogo central de iniciativas con horas sociales
- **Qué es:** un único lugar (buscador + mapa) donde el estudiante encuentra todas las iniciativas disponibles, cada una indicando cuántas horas sociales otorga.
- **Dolor que resuelve:** la oferta hoy está dispersa en WhatsApp, avisos de la U y contactos personales; el estudiante pierde tiempo y no sabe qué sigue vigente.
- **Ganancia que crea:** encuentra rápido, en un solo lugar, opciones reales y cercanas con las horas que ofrecen.

### 2.2 Sello de iniciativa verificada / legítima
- **Qué es:** un distintivo que marca cada iniciativa como legítima y respaldada (comunidad validada + empresa financiadora + Parakeet).
- **Dolor que resuelve:** el miedo a inscribirse en algo que resulte falso o que **no le certifique** las horas.
- **Ganancia que crea:** certeza de que la iniciativa es real y de que sus horas contarán antes de comprometerse.

### 2.3 Filtros por tiempo, lugar y cantidad de horas
- **Qué es:** filtros para encajar iniciativas en su agenda (fecha, cercanía, duración, número de horas otorgadas, tipo de causa).
- **Dolor que resuelve:** el poco tiempo entre estudios y el requisito; hoy se apunta a lo primero que aparece.
- **Ganancia que crea:** puede planificar y elegir lo que mejor calza con su disponibilidad y sus intereses.

### 2.4 Inscripción en línea a la iniciativa
- **Qué es:** botón para unirse a una iniciativa desde la app, con confirmación de cupo, fecha, punto de encuentro y qué llevar.
- **Dolor que resuelve:** el proceso informal de "preguntar a un conocido" y coordinar por mensajes uno a uno.
- **Ganancia que crea:** entrada clara y directa a la iniciativa, sin intermediarios ni incertidumbre.

### 2.5 Registro y certificación automática de horas
- **Qué es:** al participar (con check-in por ubicación y/o validación del coordinador), la app **registra las horas automáticamente** y genera una constancia verificable.
- **Dolor que resuelve:** las constancias en papel que se pierden y la dependencia de que "alguien le firme".
- **Ganancia que crea:** sus horas quedan guardadas, sumadas y verificables sin trámites manuales.

### 2.6 Contador de progreso de horas ("cuánto llevo / cuánto me falta")
- **Qué es:** un panel personal que muestra el total de horas acumuladas y las que faltan para cumplir el requisito.
- **Dolor que resuelve:** el estrés de no saber cuánto le falta y llegar al plazo sin control.
- **Ganancia que crea:** tranquilidad y planificación; sabe exactamente dónde está parado.

### 2.7 Constancia / certificado verificable descargable
- **Qué es:** un documento o registro digital verificable (idealmente aceptable por la institución) que respalda las horas cumplidas.
- **Dolor que resuelve:** que la institución no acepte o dude de una constancia informal.
- **Ganancia que crea:** un respaldo formal y confiable para entregar a su centro de estudios.

### 2.8 Historial de participación
- **Qué es:** un registro acumulado de todas las iniciativas en las que participó, con fechas, horas e impacto logrado.
- **Dolor que resuelve:** que su esfuerzo se pierda sin dejar rastro.
- **Ganancia que crea:** un portafolio verificable de su contribución, útil incluso más allá del requisito (CV, becas, voluntariado).

### 2.9 Impacto visible ("antes / después")
- **Qué es:** cada iniciativa muestra el resultado concreto de la acción (qué cambió, con evidencia), y el estudiante ve el impacto al que aportó.
- **Dolor que resuelve:** la sensación de "relleno" y la desconfianza de que su esfuerzo sirva de algo.
- **Ganancia que crea:** siente que su tiempo valió la pena y que aportó a algo real.

### 2.10 Comunidad y participación grupal
- **Qué es:** ver quién más va a la iniciativa, poder ir con compañeros y conectar con otros estudiantes.
- **Dolor que resuelve:** el miedo a ir solo o a un evento con desconocidos.
- **Ganancia que crea:** pertenencia a una comunidad de estudiantes con el mismo objetivo.

### 2.11 Gamificación / reconocimiento (Green Passport o equivalente)
- **Qué es:** sellos, insignias o niveles que el estudiante gana por participar, con identidad visible.
- **Dolor que resuelve:** que su interés y compromiso no se traduzcan en algo visible ante su círculo o la institución.
- **Ganancia que crea:** reconocimiento, identidad de estudiante comprometido y motivación para repetir.

### 2.12 Stamps (sellos) automáticos por cada voluntariado
- **Qué es:** el estudiante recibe un **stamp** por cada voluntariado realizado. El sello se otorga **automáticamente al marcarse la asistencia** en la sesión (ver 5.8).
- **Dolor que resuelve:** que su participación no quede registrada de forma tangible ni gratificante.
- **Ganancia que crea:** una recompensa inmediata y sin trámite por cada acción, que refuerza el hábito de participar.

### 2.13 Badges por completar misiones específicas
- **Qué es:** insignias especiales que se desbloquean al cumplir **misiones** concretas (ej. "5 voluntariados completados", "3 jornadas en la playa", primera jornada, racha de participación, etc.).
- **Dolor que resuelve:** la falta de metas y de motivación de largo plazo más allá del requisito de horas.
- **Ganancia que crea:** objetivos claros y logros coleccionables que motivan a seguir participando y a diversificar el tipo de voluntariado.

---

## 3. Soluciones para la COMUNIDAD (Diego)

### 3.1 Publicación de iniciativas como post
- **Qué es:** un formato de post donde el líder comunitario describe su iniciativa (qué, dónde, cuántas manos, cuánto financiamiento necesita, qué impacto busca) y la hace visible a estudiantes y empresas.
- **Dolor que resuelve:** no tener un canal donde publicar y que la vean quienes pueden financiarla o ejecutarla.
- **Ganancia que crea:** un solo lugar donde su iniciativa llega a la gente correcta.

### 3.2 Vitrina ante empresas financiadoras
- **Qué es:** las iniciativas publicadas quedan visibles para las empresas que buscan dónde invertir su presupuesto de RSE.
- **Dolor que resuelve:** que la RSE de las empresas nunca llegue a comunidades pequeñas como la suya.
- **Ganancia que crea:** acceso directo a financiamiento sin depender de contactos ni de poner de su bolsillo.

### 3.3 Acceso a una base de estudiantes que buscan horas
- **Qué es:** al publicar, su iniciativa queda expuesta a estudiantes que ya están buscando dónde cumplir horas sociales.
- **Dolor que resuelve:** tener que reclutar voluntarios desde cero cada vez.
- **Ganancia que crea:** manos disponibles y motivadas, sin esfuerzo de reclutamiento repetido.

### 3.4 Gestión de la iniciativa (inscritos, cupo, logística)
- **Qué es:** panel para ver cuántos estudiantes confirmaron, gestionar cupos, fecha, punto de encuentro y comunicación.
- **Dolor que resuelve:** no saber cuántos van a llegar hasta que llegan (o no), y coordinar todo por mensajes sueltos.
- **Ganancia que crea:** control y previsibilidad para planear la iniciativa.

### 3.5 Registro de resultados y evidencia estructurada
- **Qué es:** al cerrar la iniciativa, la comunidad deja registro del resultado (evidencia, impacto, horas de los estudiantes) de forma estructurada.
- **Dolor que resuelve:** hoy solo quedan fotos sueltas en redes, sin historial ordenado.
- **Ganancia que crea:** construye automáticamente un historial verificable de su impacto.

### 3.6 Mini-dashboard de impacto de la comunidad
- **Qué es:** un resumen acumulado de todas sus iniciativas (cuántas ejecutó, cuántos estudiantes participaron, qué impacto generó, cuánto financiamiento canalizó).
- **Dolor que resuelve:** que su trabajo quede invisible fuera de su círculo cercano.
- **Ganancia que crea:** visibilidad y credibilidad para conseguir más apoyo, voluntarios y financiamiento.

### 3.7 Reconocimiento dentro del ecosistema
- **Qué es:** perfil público de la organización/comunidad con su historial e impacto verificable.
- **Dolor que resuelve:** la competencia invisible con otras organizaciones por los mismos apoyos.
- **Ganancia que crea:** diferenciación con resultados medibles y reconocimiento como actor activo.

### 3.8 Toma de asistencia y cuantificación de la jornada
- **Qué es:** espacio para que la organización **pase asistencia de los estudiantes enrollados** y **cuantifique lo hecho en la sesión** (ver detalle en 5.4).
- **Dolor que resuelve:** no saber quién asistió realmente ni tener una medida concreta de lo logrado.
- **Ganancia que crea:** asistencia confiable que dispara las horas y los stamps del estudiante, y datos concretos para reportar a la empresa.

### 3.9 Capacitación virtual a los estudiantes
- **Qué es:** la organización usa el espacio de interacción virtual (ver 5.1) para enseñar a los inscritos las prácticas adecuadas de voluntariado antes de la jornada.
- **Dolor que resuelve:** que los estudiantes lleguen sin preparación y la jornada pierda calidad.
- **Ganancia que crea:** voluntarios preparados y jornadas más efectivas y seguras.

### 3.10 Detección de necesidades vía heatmap
- **Qué es:** la organización se apoya en el heatmap de reportes ciudadanos (ver 5.2) para identificar zonas críticas y, desde ahí, llenar el formulario de solicitud de financiamiento (ver 5.3).
- **Dolor que resuelve:** la falta de datos para decidir dónde intervenir con más urgencia.
- **Ganancia que crea:** priorización basada en datos reales de dónde se necesita acción.

---

## 4. Soluciones para las EMPRESAS (RSE)

### 4.1 Catálogo de iniciativas listas para financiar
- **Qué es:** un portafolio de iniciativas comunitarias legítimas y verificadas donde la empresa elige dónde poner su presupuesto de RSE.
- **Dolor que resuelve:** lo difícil que es encontrar iniciativas legítimas sin investigar cada una.
- **Ganancia que crea:** iniciativas listas para financiar, sin montar la operación desde cero.

### 4.2 Financiamiento dirigido y trazable
- **Qué es:** la empresa financia iniciativas específicas y recibe trazabilidad de en qué se usó el dinero y qué se logró.
- **Dolor que resuelve:** financiar sin saber con certeza qué resultado generó su aporte.
- **Ganancia que crea:** trazabilidad clara del uso y del impacto de cada aporte.

### 4.3 Reporte de impacto medible
- **Qué es:** métricas estructuradas (iniciativas financiadas, estudiantes participantes, horas generadas, comunidad beneficiada, resultado concreto) listas para reportar a dirección y stakeholders.
- **Dolor que resuelve:** los reportes de impacto poco confiables que debilitan la narrativa de la marca.
- **Ganancia que crea:** evidencia sólida y verificable del retorno social de la inversión.

### 4.4 Visibilidad y asociación de marca con impacto real
- **Qué es:** la empresa asocia su marca a iniciativas reales y verificables, con material y datos para comunicar.
- **Dolor que resuelve:** que la RSE quede como un gasto invisible o poco diferenciable de la competencia.
- **Ganancia que crea:** visibilidad de marca respaldada por impacto medible, no solo por intención.

### 4.5 Operación delegada (sin cargar al equipo interno)
- **Qué es:** la ejecución la hacen la comunidad y los estudiantes; Parakeet coordina y reporta. La empresa no monta ni supervisa la logística.
- **Dolor que resuelve:** que montar y supervisar la operación consuma a un equipo que no da abasto.
- **Ganancia que crea:** impacto sin sobrecarga operativa interna.

### 4.6 Reducción de riesgo reputacional
- **Qué es:** solo financia iniciativas verificadas, con evidencia y trazabilidad de principio a fin.
- **Dolor que resuelve:** el temor a asociarse con algo que resulte poco transparente o que no rinda.
- **Ganancia que crea:** confianza y respaldo para invertir y para comunicar públicamente.

### 4.7 Espacio de pago (mockup de tarjeta / validación — simulación)
- **Qué es:** un **mockup** del flujo de pago donde la empresa realiza el aporte a una iniciativa mediante tarjeta/validación. En esta etapa es una **simulación** (no un cobro real), pensada para demostrar y validar cómo la empresa financiaría desde la plataforma.
- **Dolor que resuelve:** la falta de una vía clara y directa para ejecutar el financiamiento sin procesos externos.
- **Ganancia que crea:** un camino visible y sencillo para aportar a la iniciativa desde la app, que sirve como base para el pago real a futuro.

---

## 5. Soluciones GENERALES / transversales de la PLATAFORMA

Estas piezas sostienen a los tres actores a la vez y son el corazón de la confianza y del funcionamiento del sistema.

### 5.1 Interacción y capacitación virtual organización ↔ estudiantes
- **Qué es:** un espacio de **interacción virtual** donde la organización (comunidad) se comunica con los estudiantes inscritos para **enseñarles las prácticas adecuadas de voluntariado** antes (y durante) la jornada: qué hacer, qué no hacer, seguridad, materiales, comportamiento según el tipo de actividad.
- **Dolor que resuelve:** que los estudiantes lleguen sin preparación y que la comunidad tenga que explicar todo en el sitio, perdiendo tiempo y calidad.
- **Ganancia que crea:** voluntarios preparados, jornadas más efectivas y seguras, y estudiantes que aprenden a hacer bien el voluntariado.

### 5.2 Reporte ciudadano de puntos contaminados + heatmap de gravedad
- **Qué es:** **cualquier persona —estudiantes o usuarios no verificados—** puede marcar en el mapa un **punto contaminado** y **describir la contaminación**. A medida que **más personas reportan el mismo punto**, un **heatmap** refleja la **gravedad** de la contaminación en esa zona (más reportes = mayor intensidad).
- **Para qué sirve:** el heatmap se convierte en el **detonante de nuevas iniciativas**: las organizaciones se enteran de las zonas críticas y **llenan el formulario para solicitar financiamiento** y así montar el voluntariado (ver 3.x y sección 1, pasos 1–2).
- **Dolor que resuelve:** que las zonas contaminadas no tengan un canal de visibilidad y que las organizaciones no sepan dónde intervenir con más urgencia.
- **Ganancia que crea:** un mapa colaborativo y en tiempo real de dónde se necesita acción, que prioriza el trabajo y alimenta el pipeline de iniciativas.

### 5.3 Formulario de solicitud de financiamiento (organización → empresa)
- **Qué es:** a partir de un punto crítico del heatmap, la organización **llena un formulario** para solicitar financiamiento y convertir ese punto en una iniciativa de voluntariado financiable.
- **Dolor que resuelve:** la falta de un proceso claro para pasar de "aquí hay un problema" a "aquí hay una iniciativa lista para financiar".
- **Ganancia que crea:** un puente estructurado entre la necesidad detectada y el financiamiento de RSE.

### 5.4 Toma de asistencia y cuantificación de la sesión
- **Qué es:** un espacio para que las organizaciones **tomen asistencia de los estudiantes enrollados** en la jornada y, además, **cuantifiquen lo hecho en la sesión** (ej. cantidad recolectada, área atendida, personas beneficiadas, tareas completadas).
- **Dolor que resuelve:** no saber quién asistió realmente ni tener una medida concreta de lo logrado en cada jornada.
- **Ganancia que crea:** asistencia confiable (que dispara las horas y los stamps del estudiante) y datos concretos de impacto por sesión para el reporte a la empresa.

### 5.5 Mapa de eventos y zonas (contaminadas ↔ recuperadas) — impacto visible
- **Qué es:** un mapa que identifica **los eventos y las zonas**, mostrando tanto las **zonas contaminadas** como las que **salen de ese nivel de contaminación hacia uno menor** tras las jornadas, para que el **impacto positivo sea visible**.
- **Dolor que resuelve:** que el esfuerzo colectivo quede invisible y que nadie vea el cambio real generado.
- **Ganancia que crea:** un "antes y después" geográfico y público que demuestra el impacto a estudiantes, comunidad y empresas.

### 5.6 Métricas generales
- **Qué es:** un panel de **métricas generales** del ecosistema (ej. total de iniciativas, zonas atendidas, zonas recuperadas, estudiantes activos, horas generadas, financiamiento canalizado, reportes recibidos).
- **Dolor que resuelve:** la falta de una visión agregada del funcionamiento y del impacto de la plataforma.
- **Ganancia que crea:** una fotografía global que sirve para reportar, comunicar, atraer empresas y demostrar tracción.

### 5.7 Verificación de horas de extremo a extremo
- Check-in por ubicación, **asistencia tomada por la organización** (ver 5.4) y registro automático hacen que las horas sean confiables tanto para el estudiante como para la institución y la empresa.

### 5.8 Trazabilidad del financiamiento
- Cada aporte de RSE queda ligado a una iniciativa concreta y a su resultado, cerrando el círculo entre lo que la empresa aporta y lo que la comunidad logra.

### 5.9 Sistema de reputación y verificación de actores
- Comunidades verificadas, empresas verificadas y estudiantes con historial: reduce el costo de confianza sin fricción. (Nota: el **reporte de puntos contaminados no requiere verificación** —ver 5.2— para maximizar la captación de datos; la verificación aplica a quienes ejecutan y financian.)

### 5.10 Matching iniciativa ↔ estudiante ↔ empresa
- La lógica que conecta las tres puntas: iniciativas de la comunidad se emparejan con estudiantes que buscan horas y con empresas que buscan impacto.

---

## 6. Mapa de Valor (Value Map) por persona

### 6.1 William (estudiante)

| Gain Creators | Pain Relievers |
| --- | --- |
| Catálogo central de iniciativas con horas claras | Elimina la dispersión de la oferta entre WhatsApp, avisos y contactos |
| Registro y certificación automática de horas | Acaba con las constancias en papel que se pierden y con depender de que "le firmen" |
| Sello de iniciativa verificada | Elimina el miedo a que no le certifiquen las horas |
| Contador de progreso de horas | Quita el estrés de no saber cuánto le falta |
| Impacto visible (antes/después) | Combate la sensación de "relleno" y la desconfianza de que su esfuerzo sirva |
| Comunidad y participación grupal | Resuelve el miedo a ir solo y la falta de pertenencia |
| Gamificación / reconocimiento | Hace visible su compromiso ante su círculo y la institución |
| Stamps automáticos por asistencia y badges por misiones | Convierte cada jornada en un logro tangible y da metas de largo plazo |
| Reporte ciudadano de contaminación | Le da voz para señalar problemas aunque no participe todavía |

### 6.2 Diego (comunidad)

| Gain Creators | Pain Relievers |
| --- | --- |
| Publicación de iniciativas como post, visible a estudiantes y empresas | Elimina la dependencia de contactos personales y de difundir en múltiples canales |
| Acceso a financiamiento de RSE | Resuelve la falta de fondos y el poner de su propio bolsillo |
| Acceso a estudiantes que buscan horas | Reduce el esfuerzo de reclutar voluntarios desde cero |
| Registro de resultados y evidencia estructurada | Construye el historial que hoy no tiene (solo fotos sueltas) |
| Mini-dashboard de impacto de la comunidad | Da la visibilidad y credibilidad que hoy dependían de redes |
| Perfil y reconocimiento en el ecosistema | Lo diferencia de otras organizaciones con resultados medibles |
| Heatmap de reportes ciudadanos | Le dice con datos dónde intervenir con más urgencia |
| Toma de asistencia y cuantificación de la sesión | Elimina el descontrol de quién asiste y mide lo logrado |
| Capacitación virtual a estudiantes | Le ahorra explicar todo en el sitio y mejora la calidad de la jornada |

### 6.3 Empresas (RSE)

| Gain Creators | Pain Relievers |
| --- | --- |
| Catálogo de iniciativas legítimas listas para financiar | Elimina el trabajo de buscar y verificar iniciativas una por una |
| Financiamiento dirigido y trazable | Resuelve la falta de trazabilidad de lo que financia |
| Reporte de impacto medible | Reemplaza los reportes poco confiables con evidencia sólida |
| Visibilidad de marca con impacto real | Convierte la RSE de gasto invisible en diferenciador comunicable |
| Operación delegada a comunidad y estudiantes | Quita la carga operativa a su equipo interno |
| Financiamiento solo de iniciativas verificadas | Reduce el riesgo reputacional |
| Espacio de pago (mockup de tarjeta/validación) | Le da una vía directa y simple para ejecutar el aporte desde la app |
| Mapa de zonas recuperadas y métricas generales | Convierte su aporte en impacto geográfico y cifras comunicables |

---

## 7. Propuestas de Valor (statement por persona)

Formato: _Para [persona] que [necesidad no resuelta], Parakeet es [categoría] que [beneficio central / diferenciador], a diferencia de [alternativa actual]._

### 7.1 William (estudiante)
> Para los **estudiantes de bachillerato y pregrado que necesitan cumplir horas sociales** pero no encuentran un lugar confiable donde hacerlo ni tienen certeza de que sus horas les serán certificadas, **Parakeet es la app que centraliza iniciativas reales y verificadas, registra sus horas automáticamente con constancia válida y les muestra el impacto de lo que hicieron** — a diferencia del panorama actual, disperso entre grupos de WhatsApp, avisos sueltos y contactos personales, donde muchos terminan "rellenando" horas en algo sin sentido y con papeles que se pierden.

### 7.2 Diego (comunidad)
> Para los **líderes comunitarios, ONGs locales y grupos que tienen iniciativas pero les faltan manos y financiamiento**, **Parakeet es el canal que publica su iniciativa ante empresas que la financian y estudiantes que la ejecutan, y convierte su trabajo en un historial de impacto verificable** — a diferencia de depender de WhatsApp, contactos y su propio bolsillo, donde las buenas ideas no arrancan y el esfuerzo queda invisible.

### 7.3 Empresas (RSE)
> Para las **empresas consolidadas que tienen presupuesto de RSE pero no encuentran iniciativas legítimas ni logran demostrar impacto medible**, **Parakeet es la plataforma que les entrega iniciativas comunitarias verificadas, listas para financiar, ejecutadas por la comunidad y los estudiantes, con trazabilidad y reporte de impacto** — a diferencia de donaciones puntuales y patrocinios sueltos, donde la operación recae en su equipo y el impacto queda sin evidencia confiable.

---

## 8. Cómo se conecta el valor (flujo del ecosistema)

- **La comunidad propone** → genera las iniciativas que dan a los estudiantes dónde cumplir horas y a las empresas dónde invertir.
- **Las empresas financian** → hacen viables las iniciativas y dan estructura y respaldo a la experiencia del estudiante.
- **Los estudiantes ejecutan y cumplen horas** → aportan las manos que la comunidad necesita y generan la evidencia medible que la empresa necesita para reportar.
- **Parakeet conecta y da trazabilidad** → captura horas, financiamiento e impacto, y los devuelve como constancia (estudiante), historial (comunidad) y reporte (empresa).

Cada solución de este documento existe para fortalecer una de estas conexiones y para que el círculo —proponer, financiar, ejecutar, demostrar— se cierre con confianza y sin fricción.

---

## 9. Diferenciadores clave (por qué Parakeet y no las alternativas)

1. **Un solo lugar para las tres puntas:** hoy estudiantes, comunidad y empresas operan en canales separados; Parakeet los reúne alrededor de la iniciativa.
2. **Horas sociales verificables:** no es "voluntariado suelto", es cumplimiento de un requisito real con constancia válida.
3. **Financiamiento que sí aterriza:** el presupuesto de RSE llega a iniciativas comunitarias concretas, no se queda en donaciones difusas.
4. **Impacto medible y visible:** trazabilidad de punta a punta —horas, dinero y resultado— que sirve a los tres actores.
5. **Costo cero para el estudiante y la comunidad:** el modelo se sostiene desde la RSE de las empresas, no desde el bolsillo de quien menos tiene.
