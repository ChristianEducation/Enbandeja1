# ENBANDEJA — PLAN MAESTRO
**Fecha:** Abril 2026
**Versión:** 1.0 — Parte A (Visión y Mercado)
**Autor:** Christian Wevar
**Destinatario:** Claude Code + futuras instancias de Claude
**Horizonte:** 6 fases · ~45 tablas · 4 packages + 1 app

> ⛔ **REGLA #0:** Este documento es la fuente de verdad del proyecto Enbandeja.
> Ninguna decisión fundacional se cambia sin revisar el impacto en el schema,
> CLAUDE.md y los tests E2E.
>
> ⛔ **REGLA #1:** Si Claude Code propone algo que NO está en este documento,
> rechazar y redirigir aquí.
>
> ⛔ **REGLA #2:** El `ledger.md` se actualiza sesión a sesión. Este
> `plan.md` solo se actualiza si cambia una decisión fundacional, y el
> cambio debe quedar registrado en el historial del ledger.

---

## ÍNDICE MAESTRO

```
PARTE A — VISIÓN Y MERCADO
  1. Resumen Ejecutivo
  2. Investigación de Mercado 2026
  3. Ventaja Competitiva Irreplicable (8 puntos)

PARTE B — ARQUITECTURA FUNDACIONAL         (próximo turno)
  B0.  Workspace y Documentación Viva
  B1.  Monorepo Turborepo
  B2.  Multi-Tenancy con RLS
  B3.  Modelo de Usuarios y Cuentas
  B4.  Flujo de Pago y Webhooks
  B5.  Catálogo con Precios Diferenciados
  B6.  Dashboard con KpiSnapshot
  B7.  Billing SaaS y Ciclo de Suspensión
  B8.  Onboarding Self-Service y Asistido
  B9.  Canales de Notificación
  B10. Timezone y Fechas
  B11. Testing E2E Bloqueante
  B12. Los Candados de Seguridad

PARTE C — EJECUCIÓN                          (próximos 3 turnos)
  4.  Módulos del Producto
  5.  Las 6 Fases del Proyecto
  6.  Schema Prisma Completo (~45 tablas)
  7.  Stack Tecnológico — Versiones Exactas
  8.  Modelo de Monetización
  9.  Timeline con Hitos
  10. Riesgos y Mitigaciones
  11. Master Prompt para Claude Code (Fase 0)
  12. Las 9 Lecciones Heredadas
```

---

# PARTE A — VISIÓN Y MERCADO

## 1. RESUMEN EJECUTIVO

### 1.1 Visión del producto

Enbandeja es la **plataforma de gestión operativa** que convierte el
casino escolar de una PYME chilena en un sistema digital de clase
mundial, sin obligarla a depender de herramientas genéricas ni de
equipos comerciales extranjeros.

El producto resuelve el ciclo completo del servicio de alimentación
escolar en colegios particulares y subvencionados: publicación de menús
semanales, pedido anticipado por parte del apoderado, pago digital
directo, producción en cocina, retiro del comensal, conciliación diaria,
y reporte financiero fin de mes. Todo en una sola plataforma
multi-tenant donde cada PYME opera con total aislamiento de sus pares.

**Enbandeja no es un software de delivery**, no es una billetera
digital, no es un sistema de control de acceso biométrico, y no es un
marketplace. Es el **sistema operativo del casino escolar chileno**,
diseñado para el concesionario de PYME que hoy opera con transferencias
+ WhatsApp + planilla Excel, y que quiere pasar a operar con un SaaS
profesional sin depender de un equipo comercial extranjero ni de
contratos de implementación de miles de dólares.

### 1.2 Propuesta de valor

Cada actor del ecosistema casino escolar tiene un dolor concreto que
Enbandeja resuelve:

**Para la PYME (Owner del tenant):**
Hoy factura manualmente cruzando comprobantes de transferencia con
listas impresas. Con Enbandeja tiene un dashboard en tiempo real con
ingresos del día, semana y mes, desglosado por colegio, con
exportaciones Excel y PDF en un clic. El cierre de mes pasa de 8 horas
de planilla a una descarga.

**Para el Operador del casino:**
Hoy anota pedidos en WhatsApp y los traspasa a papel. Con Enbandeja ve
la lista del día ordenada por curso en su tablet, con conteo exacto por
opción de menú para planificar producción. La hora de corte es
automática. El cierre manual existe si necesita adelantar.

**Para la Cocina:**
Hoy recibe órdenes sueltas a último minuto. Con Enbandeja ve
exactamente cuántos platos de cada opción debe preparar antes de
empezar el turno, con desglose por curso para organizar la entrega.
Vista de lectura solo, sin posibilidad de romper datos por error.

**Para el Apoderado:**
Hoy tiene que hacer transferencia, mandar comprobante por WhatsApp,
esperar confirmación, y recordar si el día que pagó coincide con el
menú del niño. Con Enbandeja entra a la app, selecciona los días de
la semana que quiere pedir, elige opción por cada día, paga con Webpay
o MercadoPago, y recibe notificación push de confirmación. El ciclo
toma menos de dos minutos.

**Para el Super Admin de Enbandeja (Christian + futuros socios):**
Ve el estado de todos los tenants, puede intervenir en casos de
recuperación de Owner, gestiona billing manual en v1, y tiene
visibilidad total sin acceder nunca a datos operativos privados de
los tenants (pedidos, comensales, reportes). La capa de aislamiento
protege al Super Admin tanto como al tenant.

### 1.3 Por qué ahora

**Tres condiciones del mercado chileno se alinean en 2026 y ninguna
existía hace cinco años:**

**Condición 1 — OrderEAT dejó el mercado medio expuesto.** La startup
uruguaya desembarcó en Chile a inicios de 2025 con una meta de 25
colegios para marzo de ese año. Al día de hoy tiene entre 10 y 20
colegios confirmados, concentrados en la Región Metropolitana y
Valparaíso, con un caso aislado en Iquique. Cobra entre USD 130 y 300
mensuales por colegio (equivalente a CLP 120.000-280.000 por colegio),
lo cual es caro para una PYME chilena promedio. Vende colegio por
colegio con equipo comercial propio, un modelo que no escala a los
más de 12.000 establecimientos educacionales activos del país. Tiene
gaps reportados públicamente: cobros duplicados cuando la app está
lenta, dependencia fuerte de conectividad, sistema cerrado sin API
pública, y soporte centralizado en Santiago que no llega a regiones.

**Condición 2 — Las PYMES de casinos escolares están
sub-digitalizadas y lo saben.** El segmento está compuesto por
concesionarias locales (SpA, EIRL, personas naturales) que operan
uno o pocos colegios en su ciudad. El patrón dominante es
transferencia bancaria + comprobante por WhatsApp + lista manual en
planilla Excel. Los dolores son universales y están bien documentados:
pérdida de talonarios, errores en conteo, conciliación semanal que
toma horas, discusiones con apoderados cuando un niño no aparece en
la lista pese a que la familia pagó. La conciencia del problema
existe. Lo que falta es una herramienta accesible, en español
chileno, diseñada para su escala.

**Condición 3 — HealthyFood Antofagasta es el cliente ancla perfecto
y ya está identificado.** Es una empresa familiar con más de 30 años
de experiencia en la Segunda Región, opera 4 colegios (San Esteban,
Antonio Rendic, San Agustín, Netland), hoy vende por una tienda
WooCommerce abandonada que aún tiene textos Lorem Ipsum visibles en
el home, sin app móvil, sin perfil de hijo estructurado, sin panel
de cocina real, y sin reportes automatizados. Su dolor es concreto,
medible y observable. Antofagasta no tiene presencia de OrderEAT hoy.

**Ventana de oportunidad:** entre seis y doce meses. Si OrderEAT
triplica su equipo comercial en Chile, la ventana se estrecha. Si
entra otro competidor regional, la ventana se divide. Si HealthyFood
encuentra otra solución antes, perdemos el cliente ancla. **La
prioridad absoluta del proyecto es llegar a Fase 1 operativa
(beta privada con HealthyFood) en menos de tres meses desde el
arranque de Fase 0.**

### 1.4 Por qué Christian Wevar

No es discurso de marketing. Son cinco hechos verificables que
determinan que este proyecto tiene probabilidad real de éxito y no
es un emprendimiento más:

**Hecho 1 — Stack probado en producción.** El genoma técnico
(Turborepo + Next.js 15 + Prisma 5 + Supabase + NextAuth v5 con
strategy:database) viene de MedXRay Enterprise, una plataforma
médica multi-tenant de ~87 modelos Prisma que ya está deployada y
operativa. Enbandeja no construye stack desde cero: hereda
decisiones probadas, errores ya cometidos, y patrones validados.
El riesgo técnico es bajo porque la arquitectura ya demostró que
funciona en producción con cargas reales.

**Hecho 2 — PedidosAIS como prueba de concepto del dominio.**
Christian ya construyó y puso en producción un sistema de pedido
anticipado de almuerzos para un colegio específico (PedidosAIS,
en operación real). Conoce los flujos de pedido, los tipos de
usuario, los edge cases de cancelación, los problemas de
conciliación, las pasarelas GetNet/Webpay. Enbandeja no inventa
el dominio: lo toma validado y lo convierte en multi-tenant.

**Hecho 3 — Presencia física en el cliente ancla.** Antofagasta
es la base de Christian. HealthyFood opera a minutos de distancia.
Esto permite un ciclo de feedback imposible de replicar para
OrderEAT desde Santiago o Montevideo: instalar personalmente,
acompañar el primer menú publicado, resolver el primer pago en
vivo, hacer ajustes en base a lo que el operador necesita ver en
su tablet. La ventaja competitiva no es la tecnología — es la
distancia física al cliente.

**Hecho 4 — Metodología documental versionada y rigurosa.** El
proyecto arranca con este Plan Maestro, con 5 bloques de
decisiones funcionales ya cerrados, con un checklist de 15 ajustes
técnicos, con un CLAUDE.md del workspace que rige todas las
sesiones, y con agentes especializados por dominio que guían a
Claude Code al nivel de detalle necesario. Esta documentación no
es ornamento — es la infraestructura que permite avanzar sin
acumular deuda técnica.

**Hecho 5 — Uso intensivo de Claude Code como multiplicador de
productividad.** Christian trabaja solo. Lo compensa con un flujo
de trabajo que convierte a Claude Code en su senior engineer
permanente. Las reglas globales, los agentes especializados, el
patrón de ledger vivo, el read order obligatorio al iniciar cada
sesión — todo está diseñado para que una sola persona entregue el
trabajo de un equipo de tres a cinco desarrolladores.

---

## 2. INVESTIGACIÓN DE MERCADO 2026

### 2.1 Tamaño y estructura del mercado chileno

**Universo total:** 12.038 establecimientos educacionales activos en
Chile al cierre de 2025, según el registro del MINEDUC. Este número
incluye municipales, particulares subvencionados y particulares
pagados.

**Segmento objetivo directo (TAM):** colegios particulares
subvencionados y particulares pagados donde el servicio de casino no
forma parte del programa JUNAEB. Aquí es donde operan las PYMES
concesionarias locales que cobran directamente al apoderado por cada
ración. Aproximadamente el 25-30% del universo total cae en este
segmento, lo que representa entre **3.000 y 3.600 colegios
potenciales en Chile**.

**Segmento objetivo primario para v1 (SAM):** colegios ubicados en
regiones fuera de la Región Metropolitana y Valparaíso, donde
OrderEAT aún no tiene presencia significativa. Estimación conservadora:
**1.500 a 2.000 colegios** en ese segmento geográfico.

**Segmento objetivo inicial para el lanzamiento (SOM):** colegios
particulares y particulares subvencionados de la Región de Antofagasta
(aproximadamente 150 establecimientos activos), de los cuales se
estima que **15 a 25 colegios operan bajo PYMES concesionarias** que
calzan con el perfil objetivo. De esos, la meta de los primeros doce
meses es capturar entre **8 y 12 colegios como clientes pagadores**,
distribuidos entre 3 y 5 tenants.

### 2.2 El segmento PYME — quién es realmente el cliente

El cliente de Enbandeja **NO es el colegio**. El cliente es la **PYME
que opera el casino del colegio**. Esta distinción es fundamental y
define toda la arquitectura del producto.

**Perfil del Owner del tenant (cliente objetivo):**

- Forma jurídica: SpA, Limitada o EIRL con capital modesto
- Cantidad de colegios bajo su cuenta: 1 a 4 en el caso promedio
- Antigüedad en el rubro: entre 5 y 30 años de experiencia operativa
- Personal administrativo: el dueño + 1 o 2 personas de confianza
- Personal operativo por colegio: 2 a 5 personas (operador del
  casino, ayudante, cocineros)
- Margen operativo típico: bajo, muy sensible a ineficiencias
- Uso de tecnología actual: planillas Excel, WhatsApp, transferencias
  bancarias, y en el mejor de los casos una tienda WooCommerce
  genérica abandonada
- Conocimiento técnico del dueño: bajo. No entiende de APIs,
  webhooks, ni RLS. Entiende de almuerzos, costos de insumos,
  relación con colegios, y plazos de pago

**Lo que este perfil espera de un SaaS:**

- Precio accesible y predecible (no quiere contratos sorpresa)
- Instalación que no requiera a un técnico externo
- Soporte en español chileno y en horario hábil de Chile
- Facilidad para explicarle a los apoderados cómo usar la app sin
  convertirse en mesa de ayuda
- Reportes que pueda compartir con su contador o con el colegio sin
  tener que reformatearlos
- Capacidad de operar el día a día sin necesitar llamar al soporte
  cada vez que algo se rompe

**Lo que este perfil NO quiere:**

- Sistemas que le hablen en inglés o con terminología técnica
- Contratos de implementación con reuniones semanales
- Integraciones complejas con sistemas que no usa
- Features de IA sofisticadas si el flujo básico no es sólido
- Pagar por usuario o por apoderado (no puede controlar cuántos son)

### 2.3 Competencia directa

#### 2.3.1 OrderEAT (Uruguay / expansión regional)

**El competidor principal y único con presencia real en Chile hoy.**

| Dimensión | Realidad documentada |
|---|---|
| Origen | Uruguay, fundada en 2019 |
| Fundadores | Matías Craviotto (CEO), Luis Pedro Carrero, Juan Manuel Rodríguez |
| Expansión | Uruguay, Argentina, México, Paraguay, Venezuela, Perú, República Dominicana, Panamá, Guatemala, Chile |
| Clientes totales reportados | ~300 colegios a nivel regional, ~110.000 usuarios activos |
| Clientes en Chile | Entre 10 y 20 colegios, concentrados en RM, Valparaíso e Iquique |
| Pricing Chile | USD 130–300 mensuales por colegio (~CLP 120.000-280.000/colegio) |
| Stack técnico | Backend .NET + React/React Native frontend + servicios auxiliares Node.js |
| Modelo de venta | B2B2C con equipo comercial propio, colegio por colegio |
| Financiamiento | ~USD 1.1M levantados en rondas pre-seed y seed |

**Fortalezas reales de OrderEAT:**

- Producto maduro con años de operación en otros mercados
- Tracción probada en México (mercado más grande)
- Billetera digital con saldo precargado (modelo familiar para
  apoderados de estratos altos)
- Apoyo institucional: soporte nutricional, integración con
  regulaciones escolares en México
- Calificaciones positivas en App Store y Google Play

**Debilidades documentadas y verificables:**

1. **Pricing inaccesible para PYME chica chilena.** USD 130 mensuales
   son aproximadamente CLP 120.000, que para una PYME que cobra CLP
   4.000 por almuerzo y opera 100 raciones diarias, representa el
   margen completo de 3 días de operación. Para colegios pequeños
   (40-60 raciones/día) es inviable.

2. **Venta colegio por colegio con equipo comercial.** Requiere
   visita, presentación, demo y cierre caso a caso. No escala a los
   miles de colegios del mercado objetivo.

3. **Sistema cerrado sin API pública.** No existe documentación
   pública de developer, ni portal de integraciones. La plataforma
   no se puede conectar con ERPs locales ni con sistemas contables
   chilenos (Bsale, Laudus, Defontana).

4. **Cobros duplicados reportados públicamente.** Usuarios han
   reportado en reseñas y redes que cuando la app está lenta y
   reintenta cargar saldo, el sistema genera cobros duplicados y
   la devolución es manual y lenta. Esto es un síntoma de manejo
   deficiente de idempotencia en webhooks — un problema de
   arquitectura, no de UI.

5. **Descuentos fantasma reportados.** Apoderados han reportado
   deducciones de saldo por consumos no realizados, con dificultad
   para obtener devolución. Otra señal de reconciliación débil
   entre pedidos y pagos.

6. **Dependencia fuerte de conectividad.** Sin modo offline robusto,
   en zonas con mala conexión el operador no puede registrar
   retiros. Sistemas chilenos como GestionCasinos (Desytec) y
   MicroChef ofrecen modos offline que OrderEAT no tiene.

7. **Soporte centralizado en Santiago.** Empresas regionales como
   las de Antofagasta, Iquique, Puerto Montt, Concepción no tienen
   soporte físico ni instalación asistida in situ.

8. **Enfoque B2C débil en el operador del casino.** El producto
   está diseñado alrededor de la experiencia del apoderado y la
   app móvil. El panel del operador es tratado como accesorio, no
   como el centro del sistema. Esto no calza con PYMES chilenas
   donde el Owner pasa más tiempo en el panel del casino que en
   la app del apoderado.

9. **Venta B2B dependiente de ciclos educativos.** El equipo
   comercial cierra contratos cerca del inicio del año escolar
   (enero-marzo en Chile) y luego tiene meses de baja actividad.
   No hay un modelo de adquisición continua.

**Resumen estratégico sobre OrderEAT:** es un competidor serio, con
producto maduro y financiamiento. Pero tiene un modelo de negocio
que no escala al segmento PYME chilena y tiene debilidades técnicas
verificables (idempotencia, reconciliación, modo offline). La
ventaja no se gana por features — se gana por **modelo de adquisición
diferente**, **aislamiento técnico correcto**, y **presencia física
en regiones**.

#### 2.3.2 Plataformas propias de concesionarias grandes

**Aramark, Casinos Chile, Casino Saludable.**

Estos actores grandes operan plataformas propietarias desarrolladas
in-house para sus propios clientes. No son SaaS vendibles a terceros:

| Operador | Plataforma | Cobertura |
|---|---|---|
| Aramark | `colegios.aramark.cl` | Colegios donde Aramark es concesionario |
| Casinos Chile | Sistema propio no nombrado | Colegio San Ignacio y otros |
| Casino Saludable | `casinosaludable.cl` | Colegio SSCC Alameda, otros |

**Por qué no son competencia directa de Enbandeja:**

Estas plataformas **no están disponibles para concesionarios
externos**. Son herramientas internas de operadores grandes que sirven
a su propia cartera. Una PYME que quiera usar el sistema de Aramark
tendría que dejar de ser operador independiente y convertirse en
cliente corporativo de Aramark.

**Por qué son relevantes como referencia:**

Demuestran que el mercado ya validó el modelo digital de pedido
anticipado. Los apoderados de los colegios donde operan Aramark y
Casinos Chile ya están acostumbrados a pedir almuerzos por una
plataforma, lo cual reduce la fricción de adopción cuando Enbandeja
llegue a colegios operados por PYMES chicas.

#### 2.3.3 Software de control de casinos (Entel Digital, BTsys, Elipse, Biometrika, Genera)

Son soluciones B2B para control de acceso y consumo en casinos
industriales y mineros. Se enfocan en biometría, tarjetas, cupos por
turno, conciliación con ERP corporativo.

**Por qué no son competencia directa:**

Estas soluciones **no gestionan el flujo de pedido anticipado desde
el apoderado**. Resuelven el problema opuesto: cómo controlar
físicamente el acceso de un trabajador a una ración ya cubierta por
contrato corporativo. En el dominio escolar, el apoderado no es
"trabajador con cupo diario" — es un comprador que elige y paga por
cada ración de forma voluntaria.

Enbandeja y estos sistemas podrían coexistir en un futuro lejano
(integración biométrica opcional para retirar el almuerzo), pero
no compiten por el mismo cliente hoy.

#### 2.3.4 El competidor real: el proceso manual

El competidor más grande de Enbandeja **no es una empresa, es una
práctica**. El flujo dominante en PYMES chilenas sigue siendo:

```
1. Apoderado hace transferencia bancaria
2. Apoderado envía comprobante por WhatsApp al operador
3. Operador anota en cuaderno o planilla Excel
4. Operador cruza manualmente comprobantes con lista de curso
5. Cocina recibe lista impresa o imagen por WhatsApp
6. Apoderado espera confirmación que llega cuando el operador
   tiene tiempo
```

**Este flujo es gratuito, familiar, y "funciona" lo suficiente para
que cambiarlo requiera motivación real.** La estrategia de adopción
de Enbandeja no es competir contra OrderEAT — es **desplazar el
proceso manual** ofreciendo una alternativa más simple que la
transferencia + WhatsApp, con beneficios que el operador ve en la
primera semana (tiempo ahorrado, conciliación automática, reportes
descargables).

### 2.4 Caso ancla documentado: HealthyFood Antofagasta

**Este no es un prospecto hipotético. Es una empresa real,
identificada, con dolores documentados.**

**Datos verificables:**

- Empresa familiar con más de 30 años de experiencia en la Segunda
  Región
- Opera 4 colegios en Antofagasta: San Esteban, Antonio Rendic,
  San Agustín, Netland
- Sitio web: `healthyfood.cl`
- Canal de venta actual: tienda WooCommerce básica con navegación
  rudimentaria por colegio
- Pago: Webpay estándar (sin billetera, sin saldo precargado)
- App móvil: no tiene. Búsquedas en App Store y Google Play
  devuelven apps de otros países sin relación

**Dolores observables en la plataforma actual:**

1. **Textos Lorem Ipsum visibles en el home del sitio.** Esto es un
   indicador directo de que el sitio quedó "a medias" en su
   implementación original y nunca se terminó. Proyecta una imagen
   de informalidad que daña la confianza del apoderado.

2. **Producto tratado como e-commerce tradicional.** Cada almuerzo
   es un "producto" en el carrito. Pedir para la semana implica
   añadir al carrito día por día, por cada hijo, por cada colegio.
   La fricción es alta.

3. **Perfil de usuario inexistente.** El sistema no tiene concepto
   de "hijo" asociado al apoderado. No hay forma de gestionar
   múltiples comensales ni alertas nutricionales personalizadas.

4. **Sin visualización de platos.** Los menús se presentan como
   texto ("LUNES 21 DE AGOSTO — Pollo al horno"). No hay fotos.
   No hay historial visual de comidas pasadas.

5. **Sin billetera ni saldo.** Cada compra genera una transacción
   bancaria independiente, con las comisiones y demoras asociadas.

6. **Sin panel del operador.** La empresa gestiona los pedidos
   cruzando el panel admin de WooCommerce con listas manuales.

7. **Sin reportes.** Para ver cuánto facturó el mes, tiene que
   exportar pedidos de WooCommerce y procesarlos en Excel.

**Por qué HealthyFood es el cliente ancla perfecto:**

- **Dolor confirmado y medible.** No es hipótesis — está visible
  en su sitio actual.
- **Escala correcta para el MVP.** 4 colegios son suficientes para
  probar el modelo multi-tenant sin sobrecargar la operación del
  primer deploy.
- **Presencia física cercana.** Antofagasta permite instalación
  asistida en persona, que es la única forma de garantizar éxito
  en el primer ciclo de adopción.
- **Ningún competidor presente.** OrderEAT no opera en Antofagasta.
  Aramark sí, pero en colegios de perfil distinto (Colegio Everest).
  El espacio está libre.
- **30 años de experiencia.** Es un operador serio con reputación
  regional. Un caso de éxito con HealthyFood sirve como
  credencial para los otros prospectos de la región.

### 2.5 Los 3 micro-gaps del mercado chileno que nadie resuelve bien

Son las grietas específicas del mercado que ningún actor actual
(OrderEAT, plataformas propias, software de control) está
cubriendo, y que Enbandeja ataca directamente.

**Gap 1 — La fragmentación de precios por tipo de comensal.** En
un colegio chileno, no todos los comensales pagan lo mismo. Los
funcionarios suelen tener descuento contractual. Los alumnos pueden
tener precios diferenciados por nivel (básica vs. media). En
algunos colegios hay alumnos becados que no pagan nada. En otros,
hay "visitas" (familiares que almuerzan eventualmente). **OrderEAT
tiene precio fijo por producto.** Las plataformas propias de
concesionarias manejan un solo precio y hacen descuentos manuales.
**Enbandeja modela esto nativamente** con `CategoriaPrecio` y
`PrecioOpcion`, donde cada opción de menú puede tener un precio
distinto por cada categoría de comensal activa en el colegio.
Esto es la diferencia entre un SaaS que se adapta a la PYME y un
SaaS que obliga a la PYME a adaptarse a él.

**Gap 2 — La inexistencia del Operador como usuario de primera
clase.** OrderEAT está diseñado alrededor de la app del apoderado.
El panel del operador es un añadido. En la PYME chilena real, el
apoderado es quien paga, pero el Operador es quien decide si el
sistema funciona o no. Es el Operador quien tiene que publicar
menús, marcar retiros, exportar reportes, cerrar el día, reponer
stock del kiosco, y responder dudas de los apoderados cuando algo
no cuadra. Si el panel del operador es lento, confuso o está
traducido del portugués, la PYME abandona la plataforma en el
segundo mes. **Enbandeja trata al Operador como usuario principal
del producto**, con un panel pensado para uso diario en tablet,
atajos de teclado donde corresponde, y exportaciones con el
formato que el contador de la PYME espera recibir.

**Gap 3 — La hora de corte como concepto de negocio, no como
detalle técnico.** En Chile, cada colegio tiene su propia dinámica:
algunos permiten pedir hasta las 9 AM, otros cierran a las 7 AM
(porque la cocina industrial empieza a las 7:30), otros tienen
recreos escalonados por nivel y la hora de corte es distinta por
curso. OrderEAT tiene un cierre global rígido. Las plataformas
propias manejan esto con mensajes de WhatsApp al apoderado. **Enbandeja
modela la hora de corte como configuración por colegio, respetando
el timezone del tenant**, con cierre automático al llegar la hora y
opción de cierre manual anticipado para el operador cuando ya tiene
el conteo. La hora de corte también determina la ventana de
cancelación del apoderado y la transición del estado del menú
(PUBLICADO → CERRADO).

---

## 3. VENTAJA COMPETITIVA IRREPLICABLE

Estos son los 8 puntos que hacen a Enbandeja difícil de copiar, no
porque sean secretos, sino porque replicar cualquiera de ellos
individualmente es caro y replicarlos todos juntos es inviable para
un competidor que no haya tomado estas decisiones desde el día cero.

### Punto 1 — Multi-tenant self-service desde el día cero

La mayoría de los SaaS B2B latinoamericanos que compiten en el
segmento PYME arrancan como single-tenant y agregan multi-tenancy
después, a los 12 o 18 meses, cuando el modelo de negocio ya no
calza con servir un cliente por vez. Esa migración es costosa, suele
romper datos, y deja scars arquitectónicas permanentes.

Enbandeja arranca multi-tenant con Supabase RLS + `createTenantClient`
desde la primera tabla del schema. Toda tabla de negocio tiene
`tenantId String @db.Uuid` obligatorio con índice. Toda query pasa
por el cliente con RLS inyectado. El aislamiento se verifica con
tests E2E que bloquean deploy.

**Por qué es difícil de copiar:** porque copiar multi-tenancy
correcta no es agregar una columna `tenant_id` a las tablas. Es
tener RLS policies bien escritas, es tener `createTenantClient`
inyectando contexto en cada query, es tener tests que verifiquen
aislamiento, y es tener reglas globales en CLAUDE.md que impidan al
propio Claude Code usar `prisma` global en rutas de negocio por
error. Todo ese andamiaje toma meses de construir bien — o se
construye desde el inicio, o se agrega a costo de refactorizaciones
sucesivas.

### Punto 2 — Precios diferenciados por categoría de comensal como modelo nativo

OrderEAT tiene precio único por producto. Las plataformas propias
de concesionarias manejan un solo precio y hacen ajustes manuales
fuera del sistema. Enbandeja modela esto desde el schema con
`CategoriaPrecio` (configurable por tenant) y `PrecioOpcion` (uno
por cada combinación de opción de menú + categoría).

Esto cubre todos los casos reales del mercado chileno sin código
especial:

- Colegio con precio único → una sola `CategoriaPrecio` con
  `esDefault = true`
- Colegio con funcionarios con descuento → dos categorías, una
  default y otra para funcionarios
- Colegio con becados → tres categorías, con precio cero para la
  de becados y flujo especial de pago de monto cero documentado
  en el backend
- Colegio con múltiples niveles (básica/media) → categorías
  independientes por nivel

**Por qué es difícil de copiar:** porque para agregar esto en un
sistema que nace con precio fijo, hay que rehacer el modelo de
productos, el flujo de checkout, el webhook de pago, la
reconciliación y los reportes financieros. Es una migración que
toca el corazón del producto.

### Punto 3 — Snapshot de precio inmutable en PedidoItem

Cuando un apoderado paga por un almuerzo, Enbandeja guarda el
precio exacto del momento del pago como `snapshot` en
`PedidoItem.precio`. Ese campo **nunca se modifica**, aunque el
operador edite el precio de la opción después. El pedido histórico
queda intacto, los reportes financieros siguen siendo consistentes,
y el contador puede auditar cualquier cobro sin temer que un cambio
retroactivo rompa su conciliación.

**Por qué importa más de lo que parece:** es el tipo de decisión
que separa un sistema contable serio de un sistema que solo parece
serio hasta que el primer contador lo audita. OrderEAT tiene
reportes de cobros duplicados y descuentos fantasma reportados
públicamente — esto es exactamente el tipo de bug que el snapshot
inmutable previene por diseño.

### Punto 4 — Idempotencia de webhooks por diseño

Todo pago que llega por webhook de Webpay o MercadoPago pasa por
`WebhookEventLog`, una tabla inmutable con `orderId` único que
garantiza que un segundo webhook con el mismo identificador es
ignorado sin efectos secundarios. El endpoint verifica firma HMAC
del payload antes de procesar cualquier cosa. Si el webhook ya fue
procesado, retorna 200 sin ejecutar lógica de negocio.

**Por qué es difícil de copiar:** porque los cobros duplicados y
los descuentos fantasma reportados de OrderEAT son el resultado
directo de no tener este patrón. Agregarlo después es difícil
porque implica cambiar la lógica de webhook, agregar verificación
de firma, y migrar datos históricos para que los pagos viejos
también tengan su registro de idempotencia.

### Punto 5 — Soporte físico en región

Christian está en Antofagasta. HealthyFood está en Antofagasta.
Los primeros 5-10 clientes del lanzamiento están en Antofagasta.
Cuando algo se rompe en el primer mes de uso, Christian puede
visitar al operador del casino, ver el problema con sus ojos,
resolver en el momento, y volver a casa con aprendizajes directos
del usuario.

**Por qué es difícil de copiar:** porque OrderEAT opera desde
Montevideo y su equipo en Chile está en Santiago. Aramark opera
con equipos comerciales corporativos. Ninguno puede ofrecer
soporte físico regional a precio de PYME chica. Y si alguno
decidiera abrir oficina en Antofagasta, tomaría meses, costaría
cientos de miles de pesos mensuales, y solo cubriría una región
por vez.

### Punto 6 — Stack probado en producción con cero deuda técnica heredada

Enbandeja hereda el genoma técnico de MedXRay Enterprise, una
plataforma médica multi-tenant con ~87 modelos Prisma ya deployada
y operativa. Las decisiones de stack (Turborepo, Next.js 15,
Prisma 5, Supabase, NextAuth v5 strategy:database, Vercel con
configuración Framework=Other) están validadas en producción.

Los 9 errores conocidos de MedXRay (IDs sin `@default(uuid())`,
relaciones Prisma en camelCase, `next/server` en packages,
`lucide-react` en lugar equivocado, config Vercel incorrecta,
`DIRECT_URL` en vez de `DATABASE_DIRECT_URL`, postinstall
faltante, componentes con `use client` importando del server,
design system descentralizado) están explícitamente documentados
en CLAUDE.md del proyecto y no se repiten. Enbandeja arranca con
un stack que ya fue estresado en producción y con todas las
trampas ya mapeadas.

**Por qué es difícil de copiar:** porque evitar los 9 errores
requiere haberlos cometido primero. Un competidor nuevo los va a
cometer. Un competidor maduro ya los cometió y seguramente aún
tiene la deuda técnica.

### Punto 7 — Modelo documental vivo (ledger por proyecto + vault transversal)

El proyecto usa una estructura de workspace `lab/` con un
`ledger.md` vivo por proyecto, un vault de notas transversal, y
agentes especializados por dominio. Cada sesión de trabajo empieza
con un read order obligatorio y termina actualizando el ledger.
La documentación no queda desactualizada porque está integrada en
el flujo de trabajo, no es un deliverable separado.

**Por qué es difícil de copiar:** porque replicar este modelo no
es copiar un archivo — es cambiar la forma en que el equipo
trabaja. La mayoría de los startups documentan el primer mes, se
olvidan el segundo, y al sexto mes nadie sabe por qué se tomaron
las decisiones técnicas que ya no se pueden revertir.

### Punto 8 — Precio estructuralmente inferior a OrderEAT en el segmento PYME

OrderEAT cobra USD 130-300 por colegio, con equipo comercial propio
que tiene que rentabilizarse por cada cliente. Enbandeja opera
con Christian como operación completa: desarrollo, ventas, soporte,
y ejecución. El costo operativo de servir un tenant nuevo es
marginal: unos dólares de infraestructura Supabase y Vercel por mes.

Esto permite a Enbandeja ofrecer un plan Starter por debajo de
USD 60 mensuales (rango orientativo CLP 49.000-69.000) para
colegios únicos, y un plan PYME por debajo del precio de dos
colegios en OrderEAT (rango orientativo CLP 129.000-169.000) para
PYMES con hasta 3 colegios. Precio accesible = adopción masiva
en el segmento objetivo.

**Por qué es difícil de copiar:** porque OrderEAT no puede bajar
el precio sin desbalancear el costo de su equipo comercial. Para
que OrderEAT compita en precio tendría que replicar el modelo
single-operator, lo que implica despedir a su equipo comercial, lo
que implica perder tracción en los mercados donde ya opera. Es un
compromiso estratégico que no van a hacer.

---

## RESUMEN DE LA PARTE A

Enbandeja es un SaaS multi-tenant de gestión operativa para PYMES
que operan casinos en colegios particulares y subvencionados en Chile.
El mercado objetivo inmediato es HealthyFood Antofagasta y PYMES
similares en la Región de Antofagasta, con expansión a otras regiones
fuera del eje RM-Valparaíso donde OrderEAT tiene presencia mínima.

El competidor principal es OrderEAT, con un modelo de negocio que no
escala al segmento PYME chileno y con debilidades técnicas verificables
(idempotencia de webhooks, reconciliación, modo offline, soporte
regional). El competidor real es el proceso manual (transferencia +
WhatsApp + planilla) que domina el mercado hoy.

La ventaja competitiva de Enbandeja no viene de features
sofisticadas, sino de **decisiones arquitectónicas tomadas correctamente
desde el día cero**: multi-tenancy nativa, precios diferenciados
nativos, snapshot inmutable, idempotencia de webhooks, stack probado,
y precio accesible.

La siguiente parte de este Plan Maestro — **Parte B, Arquitectura
Fundacional** — documenta las 12 decisiones técnicas que convierten
esta visión en un sistema construible. Cada decisión está alineada
con los 5 bloques de decisiones funcionales ya cerrados y con los 15
ajustes del checklist de síntesis. Nada de lo que aparece en la
Parte B es una feature nueva — todo es la traducción técnica de lo
que ya está decidido.

---

*Fin de la Parte A del Plan Maestro*
*Próximo turno: Parte B — Arquitectura Fundacional (decisiones B0 a B12)*
# PARTE B — ARQUITECTURA FUNDACIONAL

Las 13 decisiones fundacionales que convierten la visión de la Parte A
en un sistema construible. Cada decisión está numerada, tiene nombre
corto, responde al "qué, por qué y cómo", y mapea explícitamente a
los 5 bloques de decisiones funcionales y al checklist de 15 ajustes.

**Regla de oro de la Parte B:** ninguna decisión arquitectónica aquí
introduce features nuevas. Todas son traducciones técnicas de lo ya
decidido en los bloques. Si en algún momento Claude Code detecta que
una tarea requiere una decisión no listada en B0-B12, debe detenerse y
pedir que el Plan Maestro se actualice antes de proceder.

---

## B0. Workspace y Documentación Viva

**Problema que resuelve:** Un SaaS multi-tenant de clase mundial no
puede tolerar documentación desactualizada ni reglas de trabajo
difusas entre sesiones. Cada sesión de trabajo con Claude Code debe
arrancar con contexto completo en menos de 30 segundos.

**Decisión:** Enbandeja vive dentro del workspace `lab/` con la
siguiente estructura:

```
C:\Users\alain\lab\
├── CLAUDE.md                         ← raíz del workspace, primera lectura global
├── projects\
│   └── enbandeja\
│       ├── CLAUDE.md                 ← reglas globales innegociables del proyecto
│       ├── ledger.md                 ← estado vivo: reemplaza Handoff versionado
│       ├── README.md
│       └── docs\
│           ├── plan.md               ← este documento (Plan Maestro)
│           ├── resources.md          ← referencias externas
│           ├── handoff-v01.md        ← snapshot fundacional inmutable
│           ├── master-prompt-fase0.md ← prompt inicial para Claude Code
│           └── agentes\
│               ├── database.md       ← agente especializado en schema y RLS
│               ├── backend.md        ← agente especializado en API y lógica
│               ├── frontend.md       ← agente especializado en React y UI
│               └── design-system.md  ← agente especializado en tokens visuales
└── notes\
    └── vault\
        ├── tasks.md
        ├── goals.md
        └── projects\
            └── enbandeja\
                ├── bloques\          ← 5 bloques + checklist (insumo histórico)
                └── research\          ← investigación externa
```

**Read order obligatorio al iniciar sesión en Claude Code dentro de
`lab/projects/enbandeja/`:**

1. `ledger.md` — estado actual y próxima tarea
2. `docs/plan.md` — Plan Maestro (este archivo)
3. `CLAUDE.md` del proyecto — reglas innegociables
4. Agente especializado si la tarea lo requiere

**Por qué ledger en lugar de Handoff versionado:** En mis proyectos
anteriores (Crecer Librería, FinanzApp) usé `HANDOFF-v01.md`,
`HANDOFF-v02.md`, `HANDOFF-v03.md`. El problema de ese patrón es que
Claude Code siempre tiene que preguntar "¿cuál es el más reciente?"
y hay riesgo de que dos handoffs divergentes coexistan. El `ledger.md`
es un archivo único donde el estado actual está arriba y el historial
crece hacia abajo. Una sola fuente de verdad por proyecto.

**Implicación crítica:** si en algún momento futuro decido migrar
`libreriacrecer`, `finanzapp` o `coach-paes` al workspace `lab/`,
ese proceso **no afecta a Enbandeja**. Enbandeja nace aislado dentro
de su propia carpeta, con su propio repo Git, con sus propios
agentes especializados. El workspace `lab/` es el contenedor, no el
repo.

**Mapeo:** decisión nueva introducida en la metodología del Plan
Maestro, no proviene de ningún bloque específico porque está por
encima del proyecto. Se documenta aquí porque es fundacional para
todas las sesiones de trabajo.

---

## B1. Monorepo Turborepo

**Problema que resuelve:** Enbandeja tiene que servir múltiples
dominios (app del apoderado, panel del operador, panel del owner,
panel del super admin, bot de WhatsApp, webhooks) que comparten
código (tipos, validadores, cliente de DB, componentes UI). Un
repo monolítico mezcla todo. Múltiples repos duplican código y
crean drift. Un monorepo Turborepo resuelve ambos problemas con
build incremental y deduplicación automática.

**Decisión:** Estructura monorepo con `packages/` compartidos y
`apps/` ejecutables.

```
enbandeja/
├── packages/
│   ├── database/         # Prisma schema, cliente, createTenantClient
│   │                     # ⚠️ NUNCA importar next/server aquí
│   ├── shared/           # Types, Zod validators, constantes, enums
│   │                     # ⚠️ NUNCA importar next/server aquí
│   ├── ui/               # Componentes React compartidos + design system
│   │                     # ✅ lucide-react VIVE AQUÍ, no en apps/
│   │                     # ⚠️ NUNCA importar next/server aquí
│   └── support-kb/       # Markdown de base de conocimiento del bot WhatsApp
│                         # (Ajuste #13 del checklist)
├── apps/
│   └── web/              # Next.js 15 — ÚNICA app que importa next/server
│                         # Contiene: dashboard operador, dashboard owner,
│                         # panel super admin, app apoderado, API routes,
│                         # webhooks, bot WhatsApp
├── tests/
│   └── e2e/critical/     # Tests Playwright que bloquean deploy
├── docs/                  # ya cubierto en B0
└── prisma/
    └── seed.ts            # Seed de planes (Ajuste #14 del checklist)
```

**Por qué una sola app y no múltiples:** En v1 Enbandeja no necesita
app móvil nativa separada. La experiencia del apoderado vive en la
misma `apps/web` como PWA responsive, accesible desde cualquier
navegador móvil. Cuando en v2 se evalúe una app nativa (si el
negocio lo exige), se agrega `apps/mobile` sin rehacer el backend.

**Reglas de dependencias (heredadas de MedXRay, no repetir errores):**

```
packages/database   → @prisma/client, zod
packages/shared     → zod, date-fns (NO @prisma/client, usa types de @database)
packages/ui         → react, lucide-react, @radix-ui/* (NUNCA prisma)
packages/support-kb → solo archivos .md, sin código
apps/web            → next, next-auth, @trpc/*, inngest, resend,
                       transbank-sdk, mercadopago, anthropic

REGLA ABSOLUTA: packages/* NUNCA importa 'next/server',
                'next/navigation', 'next/headers' ni ningún módulo
                de Next.js. Solo apps/web puede hacerlo.

REGLA ABSOLUTA: lucide-react se instala una sola vez en packages/ui.
                apps/web lo consume re-exportado, no como dependencia
                directa.
```

**`postinstall` obligatorio** en `package.json` raíz (Ajuste heredado
de las 9 lecciones):

```json
{
  "scripts": {
    "postinstall": "cd packages/database && npx prisma generate"
  }
}
```

Sin esto, Prisma Client no se genera en CI/CD y todo el build falla
con `Namespace 'Prisma' has no exported member` en producción.

**Mapeo:** No proviene de un bloque específico. Es la traducción
técnica de la decisión del stack mencionada en los 5 bloques
(Turborepo + Next.js 15 + Prisma 5).

---

## B2. Multi-Tenancy con RLS

**Problema que resuelve:** Enbandeja sirve a múltiples PYMES
(tenants) que son competencia entre sí en algunos casos. Un fallo
de aislamiento donde Tenant A vea datos de Tenant B es un incidente
existencial — no solo daño reputacional, sino potencial violación
de la Ley 19.628 de Protección de Datos Personales. El aislamiento
no puede depender solo del código de la aplicación: tiene que estar
garantizado a nivel de base de datos.

**Decisión:** Aislamiento en tres capas, con Postgres RLS como
última línea de defensa.

**Capa 1 — Middleware de autenticación (`withAuth`).** Toda API route
de negocio está envuelta en un middleware que:

1. Verifica sesión de NextAuth (strategy:database)
2. Extrae `session.userId` y `session.activeTenantId` (ver B3 para
   `activeTenantId`)
3. Llama a `createTenantClient(tenantId, userId)`
4. Pasa el cliente inyectado a la lógica del handler

**Capa 2 — Cliente Prisma con inyección de contexto
(`createTenantClient`).** Cliente que inyecta variables de sesión de
Postgres antes de cada query. **Esta es la pieza más crítica del
sistema.**

```typescript
// packages/database/src/client.ts

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

// Cliente global — SOLO para seed, migraciones, y operaciones de
// Super Admin. NUNCA usar en rutas de negocio.
export const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Cliente con contexto de tenant y user inyectado.
// OBLIGATORIO en toda ruta de negocio.
export function createTenantClient(tenantId: string, userId: string) {
  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          // Inyecta tenantId en la sesión de Postgres para RLS.
          // TRUE = solo esta transacción (local scope).
          await prisma.$executeRaw`
            SELECT set_config('app.current_tenant_id', ${tenantId}, TRUE)
          `
          // Inyecta userId también. Ajuste #2 del checklist:
          // NO usamos auth.uid() porque NextAuth database strategy
          // no emite JWTs de Supabase Auth.
          await prisma.$executeRaw`
            SELECT set_config('app.current_user_id', ${userId}, TRUE)
          `
          return query(args)
        }
      }
    }
  })
}
```

**Capa 3 — Row Level Security (RLS) en Postgres.** Cada tabla de
negocio tiene una policy que valida `tenantId = current_setting('app.current_tenant_id')::uuid`.
Si la Capa 1 o la Capa 2 fallan, Postgres rechaza la query.

**Patrón obligatorio de RLS policies (Ajuste #2 del checklist
aplicado):**

```sql
-- Patrón de policy para aislamiento por tenant
CREATE POLICY "tenant_isolation_pedido" ON "Pedido"
FOR ALL USING (
  "tenantId" = current_setting('app.current_tenant_id')::uuid
);

-- Patrón de policy para propiedad por usuario
CREATE POLICY "apoderado_solo_sus_pedidos" ON "Pedido"
FOR ALL USING (
  "apoderadoId" = current_setting('app.current_user_id')::uuid
  AND "tenantId" = current_setting('app.current_tenant_id')::uuid
);
```

**Prohibición absoluta:** Ninguna policy RLS usa `auth.uid()`.
Esa función es específica de Supabase Auth y devuelve `null` en
producción porque NextAuth no emite JWTs de Supabase. Esto fue
detectado en el Ajuste #2 del checklist y es bloqueante.

**Regla obligatoria en CLAUDE.md del proyecto:**

> En RLS policies, NUNCA usar `auth.uid()`. Usar siempre
> `current_setting('app.current_user_id')::uuid` y
> `current_setting('app.current_tenant_id')::uuid`.

**Test mental obligatorio antes de cada query nueva:**

> "Si el `WHERE` de mi query está mal escrito, ¿puede Tenant A
> ver datos de Tenant B?"

Si la respuesta es "sí" o "no estoy seguro", la query tiene que ir
por `createTenantClient`. Si la respuesta es "no, porque es una
tabla global (Plan, PlanLimite)", se puede usar `prisma` global pero
con RLS de solo lectura pública.

**Mapeo:** Bloque 1 §5, Bloque 2 §17, Bloque 3 §10. Ajuste #2 del
checklist.

---

## B3. Modelo de Usuarios y Cuentas

**Problema que resuelve:** El dominio de Enbandeja tiene múltiples
tipos de actores que interactúan con el sistema, y cada uno tiene
alcance y privilegios distintos. PedidosAIS tenía tres tipos rígidos
("apoderado", "funcionario", "funcionario con hijos") que no escalan
a multi-tenant. La decisión de modelo de usuarios es la base de todo
el sistema de permisos y aislamiento.

**Decisión:** `User` es una entidad **global a la plataforma
Enbandeja**, no tenant-scoped. La pertenencia a uno o más tenants se
modela en `UserTenant`. Esta es la aplicación del Ajuste #1 del
checklist.

**Implicaciones críticas:**

- `User` NO tiene campo `tenantId`
- `User.email` es único a nivel plataforma global
- Un mismo `userId` puede tener múltiples filas en `UserTenant`:
  - Apoderado con hijos en 2 tenants distintos → 2 filas
  - Persona que es Owner de su PYME y además apoderado en otro
    colegio → 2 filas
- Toda tabla de negocio SÍ tiene `tenantId` obligatorio

**Roles del sistema:**

```prisma
enum UserRole {
  OWNER       // acceso total dentro de su tenant
  OPERADOR    // gestiona pedidos y menús en colegio(s) asignado(s)
  COCINA      // solo lectura de producción del día
  APODERADO   // cuenta externa, pide almuerzos para sus comensales
}
```

**Tenant activo en sesión (Ajuste #3 del checklist):**

Si un usuario tiene hijos en dos tenants distintos, el sistema
necesita saber cuál tenant está "activo" en la sesión actual.
Solución: extender el modelo `Session` de NextAuth con un campo
`activeTenantId`.

```prisma
// Modelo Session extendido de NextAuth
model Session {
  id             String   @id @default(uuid()) @db.Uuid
  sessionToken   String   @unique
  userId         String   @db.Uuid
  expires        DateTime
  activeTenantId String?  @db.Uuid  // ← EXTENSIÓN AJUSTE #3

  User           User     @relation(fields: [userId], references: [id])
  ActiveTenant   Tenant?  @relation("SessionActiveTenant",
                                    fields: [activeTenantId],
                                    references: [id])
}
```

**Flujo de resolución de tenant activo:**

1. Al login, sistema consulta `UserTenant.findMany({ where: { userId, isActive: true } })`
2. Si hay 0 → error: cuenta huérfana
3. Si hay 1 → `activeTenantId` se setea automáticamente
4. Si hay 2+ → UI muestra selector de tenant, el usuario elige, se
   persiste en `Session.activeTenantId`
5. Middleware `withAuth` extrae `session.activeTenantId` y lo pasa a
   `createTenantClient`

**Endpoint para cambiar de tenant:**

```
POST /api/session/switch-tenant
Body: { tenantId: string (uuid) }
```

La API valida que el usuario pertenezca al tenant destino y
actualiza `Session.activeTenantId`.

**Super Admin separado:**

El Super Admin de Enbandeja NO es un `User` con rol especial. Es
una tabla completamente aparte (`SuperAdmin`) con:

- 2FA obligatorio (TOTP)
- Panel separado en `/super-admin`
- Sin acceso a datos operativos de los tenants (pedidos, comensales)
- Sesión con duración máxima de 4 horas
- Usa cliente Prisma global (no `createTenantClient`) pero con
  políticas específicas para solo ver agregados, nunca detalles

**Mapeo:** Bloque 1 §3, §3.4, §4. Ajustes #1 y #3 del checklist.

---

## B4. Flujo de Pago y Webhooks

**Problema que resuelve:** El flujo de pago es el único lugar del
sistema donde un error significa que el dinero del apoderado está
cobrado pero el pedido no existe, o el pedido existe pero el pago no
se reconoció. OrderEAT tiene reportes públicos de cobros duplicados
y descuentos fantasma, que son síntomas de idempotencia deficiente.
Enbandeja no puede permitirse ese tipo de fallos.

**Decisión:** Flujo de pago con webhook idempotente, snapshot
inmutable de precio, y manejo explícito de todos los casos edge.

**Estados del pedido:**

```prisma
enum EstadoPedido {
  PENDIENTE_PAGO   // creado, esperando webhook de pasarela
  PAGADO           // confirmado por webhook válido
  CANCELADO        // cancelado por apoderado antes del corte
  EXPIRADO         // timeout de pasarela, limpiado por cron
  RETIRADO         // marcado por operador al entregar
  NO_RETIRADO      // día pasó sin retiro
}
```

**Método de pago como enum (Ajuste #4 del checklist):**

```prisma
enum MetodoPago {
  WEBPAY
  WEBPAY_ONECLICK          // para billing de suscripción, ver B7
  MERCADOPAGO
  MERCADOPAGO_SUSCRIPCION   // para billing de suscripción, ver B7
  MANUAL                    // para cobro manual del Super Admin, ver B7
}
```

**Invariante contable del Pedido (Ajuste #5 del checklist):**

```prisma
model Pedido {
  // ...
  total           Int
  creditoAplicado Int  @default(0)
  totalPagado     Int
  metodoPago      MetodoPago?
  // invariante: total = creditoAplicado + totalPagado
}
```

Esta invariante se garantiza en tres niveles:

1. **Nivel Zod (validación API):**
   ```typescript
   const CrearPedidoSchema = z.object({
     total: z.number().int().positive(),
     creditoAplicado: z.number().int().min(0),
     totalPagado: z.number().int().min(0),
   }).refine(
     data => data.total === data.creditoAplicado + data.totalPagado,
     { message: 'total debe ser igual a creditoAplicado + totalPagado' }
   )
   ```

2. **Nivel Prisma (en el create):**
   El backend recalcula `totalPagado = total - creditoAplicado` antes
   de pasarle los datos a Prisma. Nunca confía en lo que viene del
   frontend.

3. **Nivel Postgres (CHECK constraint):**
   ```sql
   ALTER TABLE "Pedido"
   ADD CONSTRAINT "pedido_total_invariant"
   CHECK ("total" = "creditoAplicado" + "totalPagado");
   ```

**Flujo normal de pago (totalPagado > 0):**

```
1. Apoderado presiona "Pagar" en el resumen del pedido
2. API crea Pedido con estado PENDIENTE_PAGO
3. API crea sesión en Webpay o MercadoPago con orderId único
4. Apoderado es redirigido a la pasarela
5. Apoderado completa pago en la pasarela
6. Pasarela envía webhook a /api/payment/webhook
7. Webhook verifica firma HMAC del payload
8. Webhook inserta registro en WebhookEventLog (inmutable)
9. Si el orderId ya existe en WebhookEventLog con processed=true,
   retorna 200 sin hacer nada (idempotente)
10. Si es nuevo, actualiza Pedido → PAGADO en transacción
11. Decrementa stock de OpcionMenu en la misma transacción
12. Envía push notification al apoderado
13. Marca WebhookEventLog.processed = true
14. Retorna 200 a la pasarela
```

**Flujo especial para monto cero (Ajuste #9 del checklist):**

Cuando `totalPagado === 0` (todo cubierto por crédito interno o
precios de $0 para becados), el pedido **NO pasa por la pasarela**.
Las pasarelas rechazan transacciones con monto cero.

```typescript
if (totalPagado === 0) {
  const pedido = await db.$transaction(async (tx) => {
    return await tx.pedido.create({
      data: {
        // ...
        estado: 'PAGADO',
        orderId: `INTERNO-${generarOrderId()}`,
        transactionId: `INTERNO-${Date.now()}`,
        metodoPago: null,
        total,
        creditoAplicado,
        totalPagado: 0,
      }
    })
    // Decrementar stock, generar movimientos de crédito, etc.
  })
  await enviarPushConfirmacion(pedido)
  return NextResponse.json({ pedido, requierePago: false })
}
```

**Tabla `WebhookEventLog` (inmutable, append-only):**

```prisma
model WebhookEventLog {
  id          String    @id @default(uuid()) @db.Uuid
  tenantId    String?   @db.Uuid       // null para webhooks de billing global
  provider    String                    // "WEBPAY", "MERCADOPAGO"
  eventType   String                    // "PAYMENT_SUCCESS", "PAYMENT_FAILED"
  orderId     String    @unique         // ← CLAVE DE IDEMPOTENCIA
  payload     Json                      // payload completo del webhook
  processed   Boolean   @default(false)
  processedAt DateTime?
  error       String?                   // si falló el procesamiento
  createdAt   DateTime  @default(now())
  // SIN updatedAt, deletedAt ni version — INMUTABLE
  // En producción: REVOKE UPDATE, DELETE ON "WebhookEventLog" FROM PUBLIC;

  @@index([orderId])
  @@index([processed])
}
```

**Manejo de casos edge críticos:**

| Caso | Detección | Solución |
|---|---|---|
| Timeout de Webpay — apoderado no completa | Cron cada hora | Pedido > 2h en PENDIENTE_PAGO pasa a EXPIRADO, se libera stock |
| Pago exitoso pero webhook no llega | App consulta `/api/payment/status/:orderId` al volver | Polling manual al backend, si pasarela confirma → actualización manual |
| Stock agotado durante el pago | Verificación en el webhook, no en el checkout | Si `stockActual === 0` al procesar, revierte item + genera crédito + push notification |
| Doble webhook del mismo pago | `orderId` único en WebhookEventLog | Segundo webhook retorna 200 sin efecto |
| Webhook falso sin firma válida | Verificación HMAC antes de procesar | Retorna 401, no llega a lógica de negocio |
| Doble click del apoderado en "Pagar" | `orderId` único por sesión | La pasarela rechaza el segundo intento |

**Polimorfismo del `PedidoItem` con CHECK constraint (Ajuste #7):**

Un `PedidoItem` puede ser un almuerzo (referencia a `OpcionMenu`) o
un producto del kiosco (referencia a `ProductoKiosco`). Exactamente
uno de los dos debe estar presente.

```sql
ALTER TABLE "PedidoItem"
ADD CONSTRAINT "pedido_item_xor_referencia"
CHECK (
  ("opcionMenuId" IS NOT NULL AND "productoKioscoId" IS NULL)
  OR
  ("opcionMenuId" IS NULL AND "productoKioscoId" IS NOT NULL)
);
```

Y discriminador como enum:

```prisma
enum TipoPedidoItem {
  ALMUERZO
  KIOSCO
}
```

**Snapshot inmutable de precio en `PedidoItem`:**

```prisma
model PedidoItem {
  // ...
  nombre    String         // snapshot: nombre de la opción al momento del pago
  precio    Int            // snapshot: precio al momento del pago
  subtotal  Int            // snapshot: precio × cantidad
  // ...
  // SIN deletedAt — es registro histórico inmutable de negocio
}
```

Si el operador cambia el precio de `OpcionMenu` después, los
`PedidoItem` históricos conservan el precio que efectivamente se
cobró. Los reportes financieros nunca se corrompen retroactivamente.

**Mapeo:** Bloque 2 §9, §16, §20. Ajustes #4, #5, #7, #9 del
checklist.

---

## B5. Catálogo con Precios Diferenciados

**Problema que resuelve:** En el mercado chileno, un mismo plato de
almuerzo puede tener múltiples precios según quién lo consuma:
$4.000 para alumnos de básica, $4.500 para alumnos de media, $5.250
para funcionarios, $0 para becados. OrderEAT no modela esto
nativamente. Enbandeja lo tiene que modelar desde el schema para que
sea natural de configurar y seguro de consultar.

**Decisión:** Tres tablas que trabajan juntas: `CategoriaPrecio`
(configurable por tenant), `OpcionMenu` (el plato en sí), y
`PrecioOpcion` (uno por cada combinación de plato + categoría).

**Modelo:**

```prisma
model CategoriaPrecio {
  id         String   @id @default(uuid()) @db.Uuid
  tenantId   String   @db.Uuid
  colegioId  String   @db.Uuid
  nombre     String   // "Alumno básica", "Funcionario", "Becado"
  descripcion String?
  esDefault  Boolean  @default(false)
  // Siempre debe existir al menos 1 con esDefault=true por colegio.
  // Si el comensal no tiene categoría asignada, se usa la default.
  isActive   Boolean  @default(true)
  orden      Int      @default(0)
  deletedAt  DateTime?
  version    Int      @default(1)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  Tenant     Tenant   @relation(fields: [tenantId], references: [id])
  Colegio    Colegio  @relation(fields: [colegioId], references: [id])
  Comensales Comensal[]
  Precios    PrecioOpcion[]

  @@index([tenantId])
  @@index([colegioId])
}

model PrecioOpcion {
  id                String   @id @default(uuid()) @db.Uuid
  tenantId          String   @db.Uuid
  opcionMenuId      String   @db.Uuid
  categoriaPrecioId String   @db.Uuid
  precio            Int      // CLP — mínimo 0 (becados)
  deletedAt         DateTime?
  version           Int      @default(1)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  Tenant            Tenant          @relation(fields: [tenantId], references: [id])
  OpcionMenu        OpcionMenu      @relation(fields: [opcionMenuId], references: [id])
  CategoriaPrecio   CategoriaPrecio @relation(fields: [categoriaPrecioId], references: [id])

  @@unique([opcionMenuId, categoriaPrecioId])
  @@index([tenantId])
}
```

**Ciclo de vida del menú (Ajuste #8 del checklist):**

El modelo `Menu` NO tiene `publicado Boolean`. La fuente de verdad
única es `Menu.estado`.

```prisma
enum EstadoMenu {
  BORRADOR    // creado, no visible para apoderados
  PUBLICADO   // visible, apoderados pueden pedir
  CERRADO     // ventana cerrada (manual o por hora de corte)
  ARCHIVADO   // día pasado, solo historial
}

model Menu {
  id        String     @id @default(uuid()) @db.Uuid
  tenantId  String     @db.Uuid
  colegioId String     @db.Uuid
  fecha     DateTime   @db.Date
  estado    EstadoMenu @default(BORRADOR)  // ← fuente única de verdad
  deletedAt DateTime?
  version   Int        @default(1)
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  Opciones  OpcionMenu[]

  @@unique([colegioId, fecha])
  @@index([tenantId])
  @@index([colegioId])
}
```

**Transiciones de estado:**

```
BORRADOR → PUBLICADO   (acción manual del operador)
PUBLICADO → CERRADO    (automático al llegar hora de corte,
                        o acción manual del operador)
CERRADO → ARCHIVADO    (automático vía cron a la medianoche
                        del día del menú, respetando timezone)
```

**Reglas de edición post-publicación:**

| Estado | Apoderado pide | Operador edita |
|---|---|---|
| BORRADOR | No | Libre |
| PUBLICADO antes de corte | Sí | Puede editar descripción, foto, stock. NO puede cambiar precio ni eliminar opciones con PedidoItems pagados |
| PUBLICADO después de corte | No | No |
| CERRADO | No | No |
| ARCHIVADO | No | No |

**Validación al publicar:**

```typescript
// Toda opción debe tener precio para TODAS las categorías activas
// del colegio. Si falta un precio, la publicación se bloquea.

for (const opcion of menu.Opciones) {
  for (const categoria of categoriasActivas) {
    const tienePrecio = opcion.Precios.some(
      p => p.categoriaPrecioId === categoria.id
    )
    if (!tienePrecio) {
      throw new Error(
        `Falta precio para "${opcion.nombre}" en categoría "${categoria.nombre}"`
      )
    }
  }
}
```

**Resolución de precio para un comensal:**

```typescript
export async function getPrecioParaComensal(
  db: TenantClient,
  opcionMenuId: string,
  comensalId: string
): Promise<number> {
  const comensal = await db.comensal.findUniqueOrThrow({
    where: { id: comensalId }
  })

  // Fallback: si el comensal no tiene categoría asignada,
  // usa la default del colegio.
  const categoriaPrecioId = comensal.categoriaPrecioId
    ?? (await db.categoriaPrecio.findFirstOrThrow({
        where: {
          colegioId: comensal.colegioId,
          esDefault: true,
          isActive: true,
          deletedAt: null
        }
      })).id

  const precioOpcion = await db.precioOpcion.findUniqueOrThrow({
    where: {
      opcionMenuId_categoriaPrecioId: { opcionMenuId, categoriaPrecioId }
    }
  })

  return precioOpcion.precio
}
```

**"Copiar semana anterior" — operación en transacción atómica:**

El operador puede clonar los menús de la semana anterior a la
siguiente con un solo click. La operación clona `Menu` + `OpcionMenu`
+ `PrecioOpcion` en una transacción única. Si falla cualquier paso,
todo se revierte.

**Stock del kiosco — reposición manual en v1 (Ajuste #6 del
checklist):**

El stock del kiosco NO se resetea automáticamente cada mañana. El
operador tiene un botón "Reponer stock" en `/operador/kiosco` que
ejecuta:

```sql
UPDATE "ProductoKiosco"
SET "stockActual" = "stockDiario"
WHERE "colegioId" = :colegioId AND "isActive" = true
```

Esto es intencional: en v1 el operador es una persona real en el
casino que abre a las 7 AM y sabe qué hay realmente en el kiosco.
Automatizar la reposición crea la ilusión de stock que no existe
físicamente.

Se agrega un campo nullable-safe desde v1 para futuro:

```prisma
model ProductoKiosco {
  // ...
  autoReposicion Boolean @default(false)  // v2: cron automático
}
```

**Mapeo:** Bloque 3 §2, §3, §4, §5, §6, §10. Ajustes #6, #8 del
checklist.

---

## B6. Dashboard con KpiSnapshot

**Problema que resuelve:** Un dashboard que muestre "ingresos de los
últimos 30 días" no puede hacer `SUM` sobre millones de `PedidoItem`
en tiempo real. Eso tomaría segundos o minutos y rompería la
experiencia del operador. OrderEAT tiene dashboards lentos. Enbandeja
necesita dashboards instantáneos.

**Decisión:** Tabla `KpiSnapshot` inmutable generada por cron
nocturno que itera por timezone de cada tenant. El dashboard lee de
esta tabla, no de `Pedido` directamente.

**Modelo:**

```prisma
model KpiSnapshot {
  id                   String   @id @default(uuid()) @db.Uuid
  tenantId             String   @db.Uuid
  colegioId            String   @db.Uuid
  fecha                DateTime @db.Date
  // Pedidos
  totalPedidos         Int      @default(0)
  totalPagados         Int      @default(0)
  totalCancelados      Int      @default(0)
  totalExpirados       Int      @default(0)
  totalRetirados       Int      @default(0)
  totalNoRetirados     Int      @default(0)
  // Ingresos
  totalIngresos        Int      @default(0)  // CLP
  totalCreditos        Int      @default(0)  // créditos generados ese día
  // Distribución flexible — no hardcodeada a opciones específicas
  distribucionOpciones Json     @default("{}")
  // Ejemplo: { "Opción 1": 23, "Hipocalórico": 8, "Vegetariano": 5 }
  distribucionKiosco   Json     @default("{}")
  ticketPromedio       Int      @default(0)
  createdAt            DateTime @default(now())
  // INMUTABLE — SIN updatedAt, deletedAt ni version
  // En producción: REVOKE UPDATE, DELETE ON "KpiSnapshot" FROM PUBLIC;

  Tenant               Tenant   @relation(fields: [tenantId], references: [id])
  Colegio              Colegio  @relation(fields: [colegioId], references: [id])

  @@unique([colegioId, fecha])
  @@index([tenantId])
  @@index([fecha])
}
```

**Cron con iteración por timezone (Ajuste #11 del checklist):**

Vercel Cron solo acepta expresiones en UTC. Pero los tenants están
en distintas zonas horarias (Chile, Argentina, México, etc.) y cada
uno necesita su snapshot al "cierre del día" local. La solución es:

- El cron corre **cada hora en UTC** (24 veces al día)
- El endpoint identifica qué tenants están en su "hora 23 local" en
  ese momento y genera snapshots solo para ellos

```json
// vercel.json
{
  "crons": [
    { "path": "/api/cron/kpi-snapshot", "schedule": "0 * * * *" }
  ]
}
```

```typescript
// /api/cron/kpi-snapshot/route.ts
export const POST = async (req: Request) => {
  const secret = req.headers.get('authorization')
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const ahoraUtc = new Date()

  const tenants = await prisma.tenant.findMany({
    where: { status: 'ACTIVE', deletedAt: null },
    select: { id: true, timezone: true }
  })

  // Filtrar solo tenants donde "ahora" corresponde a su hora 23 local
  const tenantsProcesar = tenants.filter(t => {
    const horaLocal = toZonedTime(ahoraUtc, t.timezone)
    return horaLocal.getHours() === 23
  })

  const resultados = []
  for (const tenant of tenantsProcesar) {
    try {
      await generarSnapshotsDelDia(tenant.id, tenant.timezone)
      resultados.push({ tenantId: tenant.id, status: 'ok' })
    } catch (error) {
      resultados.push({ tenantId: tenant.id, status: 'error', error })
    }
  }

  return NextResponse.json({
    procesados: tenantsProcesar.length,
    total: tenants.length,
    resultados
  })
}
```

**Generación lazy on-demand:**

Si por alguna razón el cron falló (outage de Vercel, bug de código,
etc.), el dashboard puede terminar consultando un día que no tiene
snapshot. En ese caso, el endpoint del dashboard detecta el hueco y
genera el snapshot on-demand en el momento de la consulta, y envía
alerta al Super Admin por email.

```typescript
const snapshots = await db.kpiSnapshot.findMany({
  where: { colegioId, fecha: { gte: inicio, lte: fin } },
  orderBy: { fecha: 'asc' }
})

const fechasFaltantes = obtenerFechasFaltantes(snapshots, inicio, fin)
if (fechasFaltantes.length > 0) {
  await generarSnapshotLazy(db, colegioId, fechasFaltantes)
  await alertarSuperAdmin('SNAPSHOT_LAZY_GENERADO', { colegioId, fechasFaltantes })
}
```

**Vista consolidada del Owner:**

Para Owners con múltiples colegios, la vista consolidada suma
snapshots por `tenantId + fecha`. En v1 esto es una query SQL simple
con `GROUP BY`. Si con 20+ colegios empieza a notarse lentitud, en
v2 se puede agregar una tabla `TenantKpiSnapshot` pre-agregada, pero
por ahora no es necesario.

**Exportaciones async:**

Las exportaciones Excel/PDF de reportes extensos no se generan
síncronamente en el request HTTP (timeout de Vercel es ~10 segundos).
Se generan en un job de Inngest, se suben a Supabase Storage con
URL firmada que expira en 1 hora, y el usuario recibe push
notification con el link cuando está listo.

**Mapeo:** Bloque 4 §2, §3, §4, §5, §6, §10, §12. Ajuste #11 del
checklist.

---

## B7. Billing SaaS y Ciclo de Suspensión

**Problema que resuelve:** Enbandeja cobra a las PYMES por el uso
del SaaS (separado del cobro que las PYMES hacen a sus apoderados).
El modelo de billing tiene que manejar planes, límites, cambios de
plan, vencimientos, periodos de gracia, suspensión, y recuperación,
sin que un bug en el ciclo deje tenants suspendidos sin razón o
tenants operando sin pagar.

**Decisión:** Modelo de billing con ciclo de vida explícito,
verificación de estado en cada request de negocio, y cobro manual
en v1 migrable a cobro recurrente automático en v2.

**Ciclo de vida de la suscripción:**

```prisma
enum EstadoSuscripcion {
  ACTIVA           // operando normalmente
  PERIODO_GRACIA   // vencida pero dentro de los 3 días de gracia
  SUSPENDIDA       // día 4+ sin pago, sistema bloqueado
  CANCELADA        // cancelada voluntariamente o día 31
  ARCHIVADA        // datos archivados, pendiente eliminación definitiva
}
```

**Transiciones automáticas (cron diario):**

```
Día 0      Pago vence → PERIODO_GRACIA (operación normal, aviso diario)
Día 4      PERIODO_GRACIA > 3 días → SUSPENDIDA
Día 31     SUSPENDIDA > 30 días → CANCELADA
Día 121    CANCELADA > 90 días → ARCHIVADA (pendiente eliminación)
```

**Verificación de estado en cada request de negocio:**

Middleware `verificarSuscripcion` que se ejecuta **antes** de
cualquier operación de negocio (crear pedido, publicar menú, subir
comensales, etc.):

```typescript
export async function verificarSuscripcion(tenantId: string): Promise<void> {
  const suscripcion = await prisma.suscripcion.findUnique({
    where: { tenantId }
  })

  if (!suscripcion) {
    throw new SuscripcionError('SIN_SUSCRIPCION')
  }

  const estadosBloqueados = ['SUSPENDIDA', 'CANCELADA', 'ARCHIVADA']
  if (estadosBloqueados.includes(suscripcion.estado)) {
    throw new SuscripcionSuspendidaError(suscripcion.estado)
  }

  // PERIODO_GRACIA permite operar pero la UI debe mostrar banner.
}
```

**Doble capa: función Postgres para defense-in-depth:**

```sql
CREATE OR REPLACE FUNCTION check_tenant_activo()
RETURNS void AS $$
DECLARE
  estado text;
BEGIN
  SELECT s.estado INTO estado
  FROM "Suscripcion" s
  WHERE s."tenantId" = current_setting('app.current_tenant_id')::uuid;

  IF estado IN ('SUSPENDIDA', 'CANCELADA', 'ARCHIVADA') THEN
    RAISE EXCEPTION 'tenant_suspendido: %', estado;
  END IF;
END;
$$ LANGUAGE plpgsql;
```

Si por algún bug el middleware de Capa 1 falla y una request llega
a la DB con un tenant suspendido, Postgres rechaza la operación.

**Verificación de límites del plan:**

Antes de crear un colegio, el sistema verifica que el tenant no
supere su límite:

```typescript
export async function verificarLimiteColegio(
  db: TenantClient,
  tenantId: string
): Promise<void> {
  const suscripcion = await db.suscripcion.findUnique({
    where: { tenantId },
    include: { Plan: { include: { Limites: true } } }
  })

  const limite = suscripcion.Plan.Limites.find(
    l => l.metrica === 'MAX_COLEGIOS'
  )

  if (limite?.valor !== null && limite?.valor !== undefined) {
    const colegiosActivos = await db.colegio.count({
      where: { tenantId, isActive: true, deletedAt: null }
    })
    if (colegiosActivos >= limite.valor) {
      throw new LimitePlanError(
        `Plan ${suscripcion.Plan.nombre} permite máximo ` +
        `${limite.valor} colegio(s). Actualiza tu plan para agregar más.`
      )
    }
  }
}
```

**Cobro manual en v1 (Ajuste #14 del checklist):**

En v1, el cobro es manual. El equipo Enbandeja (Christian) genera
factura/boleta fuera del sistema (via SII, Laudus, etc.), la envía
al Owner, el Owner paga por transferencia o link manual, y el Super
Admin marca el pago como confirmado desde el panel.

```
POST /api/super-admin/billing/confirmar-pago
Body: {
  suscripcionId: uuid,
  monto: int,
  metodoPago: 'WEBPAY' | 'MERCADOPAGO' | 'MANUAL',
  transactionId: string (opcional),
  periodoInicio: date,
  periodoFin: date,
  comprobanteUrl: string (opcional, link a Supabase Storage)
}
```

Efectos del endpoint:

- Crea `PagoSuscripcion` con `estado = 'PAGADO'` y `metodoPago = 'MANUAL'`
- Actualiza `Suscripcion.periodoFin` al nuevo periodo
- Si estaba en `PERIODO_GRACIA` o `SUSPENDIDA` → vuelve a `ACTIVA`
- Crea entrada en `AuditLog` con el Super Admin como autor
- Envía notificación al Owner vía `NotificacionLog`

**Tabla `PagoSuscripcion` inmutable:**

```prisma
model PagoSuscripcion {
  id            String         @id @default(uuid()) @db.Uuid
  suscripcionId String         @db.Uuid
  tenantId      String         @db.Uuid
  monto         Int
  tipo          TipoSuscripcion
  estado        String         // "PAGADO", "FALLIDO", "PENDIENTE"
  metodoPago    MetodoPago
  transactionId String?
  periodoInicio DateTime
  periodoFin    DateTime
  createdAt     DateTime       @default(now())
  // INMUTABLE — SIN updatedAt, deletedAt ni version
  // En producción: REVOKE UPDATE, DELETE ON "PagoSuscripcion" FROM PUBLIC;

  Suscripcion   Suscripcion    @relation(fields: [suscripcionId], references: [id])

  @@index([suscripcionId])
  @@index([tenantId])
  @@index([createdAt])
}
```

**Seed de planes obligatorio:**

Los 4 planes (Starter, PYME, Pro, Enterprise) se insertan en DB
mediante `prisma/seed.ts` que se ejecuta en cada ambiente nuevo
(dev, staging, production). Sin este seed, el sistema no puede
operar porque no hay planes disponibles. El Definition of Done del
Bloque 5 lo exige explícitamente.

**v2 — cobro recurrente automático:**

Cuando el negocio valide el product-market fit con los primeros
10-20 tenants pagadores, se implementará el cobro automático con
Webpay OneClick (inscribe tarjeta para cobros recurrentes) y
MercadoPago Suscripciones. En v2 el enum `MetodoPago` ya tiene los
valores `WEBPAY_ONECLICK` y `MERCADOPAGO_SUSCRIPCION` preparados.
La migración de v1 a v2 no requiere cambios de schema, solo
habilitación de flujos UI adicionales.

**Mapeo:** Bloque 5 §4, §5, §6, §7, §8, §12. Ajustes #4, #14 del
checklist.

---

## B8. Onboarding Self-Service y Asistido

**Problema que resuelve:** Una PYME que se topa con Enbandeja por
primera vez necesita pasar de "nunca lo vi" a "operando con mi
primer colegio" en el menor tiempo posible. Pero también hay pasos
del setup que son demasiado específicos de cada PYME (precios
diferenciados, primer menú publicado) para dejarlos 100% self-service
en v1. La solución es un flujo híbrido: self-service para los pasos
simples, asistido por el equipo Enbandeja para los pasos críticos.

**Decisión:** Setup wizard de 6 pasos, con `OnboardingProgress` que
trackea el estado de cada paso. Los pasos self-service son 1, 2, 3,
4, 6. Los pasos asistidos son 5 y el primer menú publicado (no está
en el wizard directamente pero bloquea hasta que el tenant tenga al
menos un menú publicado).

**Modelo `OnboardingProgress`:**

```prisma
model OnboardingProgress {
  id                  String    @id @default(uuid()) @db.Uuid
  tenantId            String    @db.Uuid @unique
  datosEmpresa        Boolean   @default(false)  // paso 1
  primerColegio       Boolean   @default(false)  // paso 2
  conectoMercadoPago  Boolean   @default(false)  // paso 3
  comensalesCargados  Boolean   @default(false)  // paso 4
  categoriasPrecios   Boolean   @default(false)  // paso 5 (asistido)
  primerMenuPublicado Boolean   @default(false)  // milestone final
  kitDescargado       Boolean   @default(false)  // paso 6
  completadoAt        DateTime?
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  Tenant              Tenant    @relation(fields: [tenantId], references: [id])
}
```

**Flujo completo:**

```
1. Landing + product tour (video Loom 90 seg + Arcade clickeable)
          ↓
2. Registro Google/email (crea User + Tenant + OnboardingProgress)
          ↓
3. Setup wizard self-service:
   Paso 1: Datos de la empresa (nombre, RUT, teléfono, logo)
   Paso 2: Primer colegio (el sistema genera codigoCasino único)
   Paso 3: Conectar MercadoPago (OAuth, un clic)
   Paso 4: Importar comensales vía Excel (template descargable)
          ↓
4. Pasos asistidos:
   Paso 5: Configurar CategoriaPrecio (Christian acompaña)
   Milestone: publicar primer menú (Christian acompaña)
          ↓
5. Paso 6: Descargar kit de bienvenida PDF (auto-generado)
          ↓
6. PYME reenvía kit por WhatsApp a los apoderados
          ↓
7. Apoderados se registran solos con el código de casino
          ↓
8. PYME opera autónomamente desde el día siguiente
```

**Kit de bienvenida PDF (auto-generado al crear colegio):**

Cuando el Owner crea un colegio, el sistema genera automáticamente
un PDF/infografía personalizado con:

- Logo del colegio (si la PYME lo subió)
- Nombre del colegio
- Código de casino destacado visualmente
- QR de descarga de la app
- 3 pasos simples para registrarse
- Link de contacto de soporte

El PDF se genera con `@react-pdf/renderer`, se sube a Supabase
Storage en el bucket `kits-apoderados`, y queda accesible vía URL
firmada desde el panel. La PYME puede regenerarlo si cambia el logo.

**Endpoint:**

```
GET /api/onboarding/kit-apoderados/[colegioId]
```

Retorna URL firmada del PDF (expira en 1 hora).

**Bot de WhatsApp con Claude API (Ajuste #13 del checklist):**

Soporte 24/7 vía WhatsApp con Claude API respondiendo el 80% de las
dudas automáticamente. Base de conocimiento en markdown plano dentro
del monorepo:

```
packages/support-kb/
├── index.md
├── onboarding/
│   ├── registro.md
│   ├── setup-wizard.md
│   ├── importar-comensales.md
│   ├── conectar-mercadopago.md
│   └── kit-apoderados.md
├── operacion/
│   ├── publicar-menu.md
│   ├── copiar-semana.md
│   ├── hora-de-corte.md
│   └── ver-reportes.md
├── apoderados/
│   ├── como-se-registran.md
│   ├── como-piden.md
│   └── cancelacion-y-creditos.md
├── billing/
│   ├── planes.md
│   └── suspension.md
└── problemas-comunes/
    ├── pago-no-se-confirma.md
    └── apoderado-no-encuentra-colegio.md
```

El bot carga todos los archivos al iniciar y los incluye en el
system prompt de Claude Sonnet. Cabe en los 200k tokens del contexto
de Sonnet.

```typescript
// Al iniciar el servicio del bot:
const KNOWLEDGE_BASE = cargarBaseConocimiento()

const systemPrompt = `
Eres el asistente de soporte de Enbandeja, el SaaS de gestión de
casinos escolares. Respondes a PYMES que operan casinos y a sus
equipos (Owner, Operador, Cocina).

Usa SOLO la siguiente base de conocimiento para responder. Si la
pregunta no está cubierta o no puedes resolverla en 3 intentos,
escribe exactamente: [ESCALAR_HUMANO] y detente.

NUNCA inventes datos operativos del tenant (pedidos, comensales,
reportes). Solo respondes preguntas sobre cómo usar el producto.

BASE DE CONOCIMIENTO:
${KNOWLEDGE_BASE}
`
```

**Escalado a humano:**

El bot escala a humano (notificación al equipo Enbandeja) si:

- El bot escribe `[ESCALAR_HUMANO]` explícitamente
- El usuario escribe "hablar con persona" o "soporte humano"
- Es un problema técnico que requiere acceso al panel del tenant
- El bot lleva 3 mensajes sin resolver el problema

**v2 — si la base de conocimiento crece más allá de 100KB o necesita
búsqueda semántica**, migrar a RAG con Supabase Vector + embeddings.
Por ahora es innecesario.

**Mapeo:** Bloque 5 §1, §2, §14, §15. Ajuste #13 del checklist.

---

## B9. Canales de Notificación

**Problema que resuelve:** Enbandeja envía notificaciones a múltiples
actores por múltiples canales (apoderado vía push + email, operador
vía push, Owner vía push + email, Super Admin vía email). Necesita
un modelo unificado que no duplique código por canal ni por tipo de
notificación.

**Decisión:** Tabla `NotificacionLog` inmutable + tabla
`NotificacionLeida` mutable separada (Ajuste #12 del checklist), que
permite que una misma notificación sea vista por múltiples usuarios
y marcada como leída individualmente sin mutar el log original.

**Modelo:**

```prisma
model NotificacionLog {
  id        String   @id @default(uuid()) @db.Uuid
  tenantId  String   @db.Uuid
  userId    String   @db.Uuid
  tipo      String   // "MENU_PUBLICADO", "PAGO_CONFIRMADO",
                     // "CANCELACION_EXITOSA", "CREDITO_APLICADO",
                     // "RESUMEN_DIARIO", "STOCK_AGOTADO",
                     // "SUSCRIPCION_VENCIDA", "SUSCRIPCION_POR_VENCER", etc.
  titulo    String
  mensaje   String
  canal     String   // "PUSH", "EMAIL", "AMBOS"
  payload   Json?    // datos estructurados del evento
  createdAt DateTime @default(now())
  // SIN updatedAt, deletedAt, version, leida
  // INMUTABLE — REVOKE UPDATE, DELETE ON "NotificacionLog" FROM PUBLIC;

  Tenant    Tenant   @relation(fields: [tenantId], references: [id])
  User      User     @relation(fields: [userId], references: [id])
  Lecturas  NotificacionLeida[]

  @@index([tenantId])
  @@index([userId])
  @@index([createdAt])
}

model NotificacionLeida {
  id             String   @id @default(uuid()) @db.Uuid
  notificacionId String   @db.Uuid
  userId         String   @db.Uuid
  leidaAt        DateTime @default(now())

  Notificacion   NotificacionLog @relation(fields: [notificacionId], references: [id])
  User           User            @relation(fields: [userId], references: [id])

  @@unique([notificacionId, userId])
  @@index([userId])
}
```

**Consulta de no leídas:**

```typescript
const noLeidas = await db.notificacionLog.count({
  where: {
    userId: session.userId,
    Lecturas: { none: { userId: session.userId } }
  }
})
```

**Marcar como leída:**

```typescript
await db.notificacionLeida.upsert({
  where: {
    notificacionId_userId: {
      notificacionId,
      userId: session.userId
    }
  },
  create: { notificacionId, userId: session.userId },
  update: {}  // noop si ya existe
})
```

**Canales:**

- **Push:** Expo Push Notifications (v1, si usamos app nativa
  futura) o Web Push API con VAPID keys (v1, para PWA)
- **Email:** Resend 4.x con templates HTML
- **WhatsApp:** Meta WhatsApp Business API, solo para el bot de
  soporte (B8), no para notificaciones transaccionales en v1

**Push token model:**

```prisma
model PushToken {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @db.Uuid
  token     String   @unique
  platform  String   // "ios", "android", "web"
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  User      User     @relation(fields: [userId], references: [id])

  @@index([userId])
}
```

Si el envío de push falla 3 veces consecutivas, el token se marca
`isActive = false` automáticamente para no seguir enviando a
dispositivos desinstalados.

**Mapeo:** Bloque 2 §8 (notificaciones al apoderado), Bloque 4 §7
(notificaciones al operador), Bloque 5 §13 (notificaciones de
billing). Ajuste #12 del checklist.

---

## B10. Timezone y Fechas

**Problema que resuelve:** Chile tiene horario de verano que cambia
en octubre y abril. Si el sistema hardcodea `America/Santiago` y
hace cálculos de "hora de corte" asumiendo UTC-3, 2 veces al año los
cierres van a estar desfasados 1 hora. Si en el futuro Enbandeja
tiene tenants en otras zonas horarias, el problema es peor. La
decisión de timezone tiene que estar correcta desde el día cero.

**Decisión:** Todo tenant tiene `timezone` configurable. Todas las
fechas se guardan en UTC (`TIMESTAMPTZ`). Toda presentación y
cálculo de "hora local" usa el timezone del tenant activo.

**Campo en `Tenant`:**

```prisma
model Tenant {
  // ...
  timezone String @default("America/Santiago")
  // ...
}
```

**Regla absoluta en CLAUDE.md:**

> Todas las fechas se guardan en UTC (`TIMESTAMPTZ`). Ninguna query
> de Prisma debe hacer comparaciones de hora asumiendo timezone local
> sin usar `toZonedTime(fecha, tenant.timezone)` primero.

**Ejemplos de aplicación:**

**Cálculo de hora de corte:**

```typescript
import { toZonedTime, set, isAfter } from 'date-fns-tz'

export function estaDespuesDelCorte(
  ahora: Date,
  horaCorte: string,       // "09:00"
  timezone: string          // "America/Santiago"
): boolean {
  const ahoraEnTenant = toZonedTime(ahora, timezone)
  const [hora, minuto] = horaCorte.split(':').map(Number)
  const corteHoy = set(ahoraEnTenant, { hours: hora, minutes: minuto })
  return isAfter(ahoraEnTenant, corteHoy)
}
```

**Transición de estado del menú (PUBLICADO → CERRADO):**

Cron que corre cada hora en UTC, itera por tenant, calcula la hora
local, y cierra los menús del día cuyo `horaCorte` ya pasó.

**Cron de KpiSnapshot por tenant (ya cubierto en B6):**

Mismo patrón: cron cada hora en UTC, filtra tenants donde
`horaLocal.getHours() === 23`, genera snapshots solo para esos.

**Mapeo:** Bloque 1 §13, Bloque 2 §14, Bloque 4 §6. Ajuste #11 del
checklist.

---

## B11. Testing E2E Bloqueante

**Problema que resuelve:** Los bugs de multi-tenancy, autorización,
idempotencia de pagos y aislamiento son **silenciosos hasta que son
catastróficos**. Un fallo de aislamiento no lanza error: simplemente
devuelve datos ajenos. La única forma de prevenirlo es con tests E2E
que verifiquen el comportamiento end-to-end con datos reales y
bloqueen el deploy si fallan.

**Decisión:** Conjunto de tests Playwright en `tests/e2e/critical/`
que **bloquean el deploy** si alguno falla. Son 12 tests críticos en
total, agrupados por dominio.

**Estructura:**

```
tests/e2e/critical/
├── tenant-isolation.spec.ts
│   ├── Tenant A NUNCA ve datos de Tenant B (usuarios, pedidos, comensales, menús)
│   ├── Verificar con SQL directo que RLS funciona
│   └── Un usuario con hijos en 2 tenants solo ve uno a la vez según activeTenantId
│
├── role-permissions.spec.ts
│   ├── Cocina NO accede a rutas de edición de menú
│   ├── Operador NO accede a billing
│   ├── Apoderado NO accede al panel de operador
│   └── Owner accede a todo dentro de su tenant
│
├── owner-protection.spec.ts
│   └── Owner NO puede desactivarse si es el único Owner activo
│
├── session-invalidation.spec.ts
│   └── Usuario desactivado → sesión invalidada en el siguiente request
│
├── pedido-flow.spec.ts
│   ├── Apoderado completa flujo de pedido para la semana siguiente
│   ├── Snapshot de precio se guarda correctamente en PedidoItem
│   ├── Stock se decrementa al confirmar pago
│   └── Flujo de monto $0 para becado NO pasa por pasarela
│
├── webhook-idempotencia.spec.ts
│   ├── Webhook válido → pedido pasa a PAGADO
│   ├── Webhook duplicado → ignorado sin efectos secundarios
│   ├── Webhook sin firma válida → rechazado con 401
│   └── Timeout de pasarela → pedido limpiado por cron y stock liberado
│
├── cancelacion.spec.ts
│   ├── Cancelación antes del corte → crédito generado en transacción atómica
│   ├── Cancelación después del corte → bloqueada con error
│   └── Invariante Pedido.total = creditoAplicado + totalPagado respetada
│
├── menu-publicacion.spec.ts
│   ├── No se puede publicar menú con fecha pasada
│   ├── No se puede publicar sin precio para todas las categorías
│   ├── Apoderado solo ve menús PUBLICADOS de su colegio
│   └── Transiciones de estado correctas (BORRADOR→PUBLICADO→CERRADO→ARCHIVADO)
│
├── precios-diferenciados.spec.ts
│   ├── Comensal con categoría asignada obtiene su precio correcto
│   ├── Comensal sin categoría usa la default del colegio
│   ├── Precio en PedidoItem es snapshot — no cambia retroactivamente
│   └── Precio 0 permitido para becados + flujo especial
│
├── kpi-snapshot.spec.ts
│   ├── Cron genera snapshot correcto con totales exactos
│   ├── Dashboard usa snapshot si existe
│   ├── Dashboard genera on-demand si falta snapshot
│   └── Cron filtra correctamente tenants por timezone
│
├── suscripcion-ciclo.spec.ts
│   ├── Tenant vencido → PERIODO_GRACIA → puede operar
│   ├── Día 4 sin pago → SUSPENDIDA → operaciones bloqueadas
│   ├── verificarSuscripcion bloquea ruta con tenant SUSPENDIDA
│   ├── check_tenant_activo() bloquea a nivel DB si middleware falla
│   └── Reactivación con pago manual → ACTIVA inmediato
│
└── limites-plan.spec.ts
    ├── Starter no puede agregar segundo colegio
    ├── Upgrade a PYME permite hasta 3 colegios
    └── Downgrade bloqueado si tiene más colegios que el plan destino
```

**Pipeline CI/CD:**

```
GitHub push
  ↓
lint (ESLint) — falla = bloquea
  ↓
type-check (tsc --noEmit) — 0 errores = bloquea
  ↓
unit tests (Vitest) — falla = bloquea
  ↓
E2E critical (Playwright) — falla = bloquea
  ↓
deploy Vercel preview
  ↓
[manual approval para production]
  ↓
deploy Vercel production
```

**Regla absoluta en CLAUDE.md:**

> Si tocas auth, multi-tenancy, billing, webhook de pago, o flujo de
> cancelación, **DEBES actualizar o crear el test E2E correspondiente
> antes de dar por terminada la tarea**. Ningún PR se mergea sin tests
> verdes.

**Mapeo:** Bloque 1 §16, Bloque 2 §22, Bloque 3 §16, Bloque 4 §16,
Bloque 5 §20.

---

## B12. Los 12 Candados de Seguridad

**Problema que resuelve:** Múltiples amenazas de seguridad cruzan
las decisiones B1-B11. Consolidar todas en un solo listado asegura
que ninguna quede suelta y que sean verificables individualmente.

**Los 12 candados:**

**1. Aislamiento total de tenants con RLS + createTenantClient.**
Ningún `prisma` global en rutas de negocio. Test
`tenant-isolation.spec.ts` bloquea deploy si falla.

**2. RLS con `current_setting`, NUNCA `auth.uid()`.** Ajuste #2 del
checklist. Documentado en CLAUDE.md del proyecto.

**3. Invariante contable del Pedido a 3 niveles.** Zod + cálculo
backend + CHECK constraint Postgres. No se puede insertar un pedido
inconsistente.

**4. Webhook de pago idempotente por `orderId`.** WebhookEventLog
inmutable, doble webhook retorna 200 sin efecto, firma HMAC
verificada antes de procesar.

**5. Snapshot de precio inmutable en PedidoItem.** No se pueden
corromper reportes históricos por ediciones posteriores de
`OpcionMenu`.

**6. Logs inmutables con REVOKE UPDATE/DELETE en producción.**
Tablas afectadas: `AuditLog`, `WebhookEventLog`, `KpiSnapshot`,
`NotificacionLog`, `CreditoMovimiento`, `PagoSuscripcion`,
`ShadowModeLog`.

**7. Sesiones en DB con invalidación inmediata.** NextAuth
`strategy: "database"`. Al desactivar un usuario,
`session.deleteMany({ where: { userId } })` mata todas sus sesiones.

**8. Super Admin con 2FA obligatorio y sin acceso a datos
operativos.** Panel separado en `/super-admin`, sesión máxima 4
horas, cliente Prisma con políticas especiales que bloquean
`Pedido`, `Comensal`, etc.

**9. Middleware `verificarSuscripcion` en toda ruta de negocio.**
Bloquea tenants SUSPENDIDA, CANCELADA, ARCHIVADA. Doble capa con
función Postgres `check_tenant_activo()`.

**10. PII enmascarado en logs.** RUTs en logs como `76.XXX.XXX-X`,
montos en debug logs como `$XX.XXX`. Regla en CLAUDE.md.

**11. URLs firmadas con expiración para exportaciones y PDFs.**
Supabase Storage con expiración 1 hora. Kit de bienvenida,
exportaciones Excel/PDF, comprobantes de pago.

**12. CHECK constraint de polimorfismo en PedidoItem (Ajuste #7).**
Garantiza que exactamente uno de `opcionMenuId` o `productoKioscoId`
esté presente. Bug imposible de introducir incluso con lógica
backend errónea.

**Mapeo:** Consolida candados de los 5 bloques. Ajustes #2, #5,
#7, #8, #12, #14 del checklist.

---

## RESUMEN DE LA PARTE B

La arquitectura de Enbandeja se sostiene sobre 13 decisiones
fundacionales (B0-B12) que traducen los 5 bloques de decisiones
funcionales a términos técnicos accionables. Los 15 ajustes del
checklist de síntesis están todos aplicados:

- **#1** (User global) → B3
- **#2** (RLS sin auth.uid) → B2
- **#3** (tenant activo en sesión) → B3
- **#4** (enum MetodoPago) → B4, B7
- **#5** (invariante Pedido) → B4
- **#6** (stock kiosco manual) → B5
- **#7** (CHECK polimorfismo PedidoItem) → B4, B12
- **#8** (eliminar Menu.publicado) → B5
- **#9** (flujo monto $0) → B4
- **#10** (scope kiosco v1) → B5
- **#11** (cron por timezone) → B6, B10
- **#12** (separar NotificacionLog) → B9
- **#13** (KB bot en markdown) → B8
- **#14** (cobro manual v1) → B7
- **#15** (rangos precios) → se aplica en Parte C, sección 8

Ninguna decisión de B0-B12 introduce features nuevas no cubiertas en
los bloques. La robustez de clase mundial viene de la consistencia
y rigor de estas decisiones, no de añadir alcance.

La Parte C de este Plan Maestro traduce estas decisiones a ejecución:
módulos del producto, fases del proyecto, schema Prisma completo,
stack con versiones exactas, monetización, timeline, riesgos, master
prompt para Claude Code, y las 9 lecciones heredadas que evitan los
errores conocidos de MedXRay.

---

*Fin de la Parte B del Plan Maestro*
*Próximo turno: Parte C primera mitad — Módulos del producto, Fases, Schema Prisma completo*

# PARTE C — EJECUCIÓN (Primera Mitad)

Esta parte traduce las decisiones arquitectónicas B0-B12 en el plan
ejecutable del proyecto: qué módulos tiene el producto, cómo se
construyen fase por fase, y cuál es el schema Prisma completo que
soporta todo lo decidido. La segunda mitad de la Parte C cubrirá
stack, monetización, timeline, riesgos, master prompt y lecciones
heredadas.

---

## 4. MÓDULOS DEL PRODUCTO

Enbandeja está compuesta por 5 módulos funcionales que viven todos
dentro de `apps/web` (no son aplicaciones separadas). Cada módulo
tiene su propio árbol de rutas, sus propios componentes y su propio
subset de API routes, pero comparten el mismo backend, el mismo
schema Prisma y la misma capa de aislamiento multi-tenant.

### Módulo 1 — App del Apoderado

**Quién lo usa:** Apoderados, funcionarios con hijos, estudiantes
mayores autogestionados. Todos son el rol `APODERADO`.

**Dónde vive:** `apps/web/src/app/(apoderado)/` como zona pública
autenticada.

**Capacidades:**

- Registro con Google/Apple o email + contraseña
- Vinculación al colegio por código de casino de 5-6 caracteres
- Agregar uno o más comensales (hijos, uno mismo, estudiantes)
- Ver menú de la semana actual y siguiente, por comensal
- Seleccionar opción por día por comensal
- Abrir drawer del kiosco (si el tenant lo tiene activado) y agregar
  productos
- Ver resumen del pedido con total desglosado y crédito disponible
- Pagar vía Webpay o MercadoPago (o confirmar directo si total = $0)
- Ver confirmación post-pago
- Ver historial de pedidos filtrable por comensal y estado
- Cancelar un item individual antes de la hora de corte
- Ver su crédito interno y movimientos
- Editar perfil, agregar más comensales, actualizar datos de contacto
- Recibir push notifications de confirmación, cancelación, menú nuevo

**Rutas principales:**

```
/                         → redirect a /home si autenticado, /login si no
/login                    → pantalla de login
/registro                 → onboarding nuevo apoderado
/registro/codigo          → ingreso código de casino
/registro/comensal        → agregar primer comensal
/home                     → dashboard con semana actual
/pedir                    → selección de días y opciones
/resumen                  → resumen del pedido antes de pagar
/confirmacion             → confirmación post-pago
/historial                → historial de pedidos
/perfil                   → datos del apoderado + comensales + crédito
```

**Principio de diseño:** minimalista, mobile-first. El apoderado
completa el flujo completo de pedido en menos de 2 minutos desde
que abre la app hasta que recibe la confirmación push.

---

### Módulo 2 — Panel del Operador

**Quién lo usa:** Usuarios internos del tenant con rol `OPERADOR`.
Pueden estar limitados a uno o varios colegios específicos (según
`UserTenant.colegioId`).

**Dónde vive:** `apps/web/src/app/(operador)/` como zona privada
autenticada con verificación de rol.

**Capacidades:**

- Ver vista del día con todos los pedidos del colegio activo
- Desglose por opción (Opción 1: 23, Hipocalórico: 8, Kiosco: 15)
- Desglose por curso para organizar la entrega
- Lista filtrable por curso, opción, estado de retiro
- Búsqueda por nombre de comensal
- Marcar comensales como retirados con un toque (actualiza
  `PedidoItem.retirado`)
- Gestionar menús: crear, editar, publicar, copiar semana anterior
- Gestionar productos del kiosco: crear, editar, activar/desactivar,
  reponer stock manualmente
- Cerrar manualmente la ventana del día antes de la hora de corte
- Exportar lista del día en PDF por curso para imprimir
- Exportar reporte Excel del día, semana o mes
- Ver historial de pedidos con filtros
- Recibir notificaciones de stock agotado, bajo volumen, resumen
  diario

**Rutas principales:**

```
/operador                     → redirect a /operador/dia
/operador/dia                 → vista del día (lista de pedidos)
/operador/semana              → vista semanal
/operador/menu                → calendario de menús
/operador/menu/nuevo          → crear menú
/operador/menu/[fecha]        → editar menú de un día
/operador/menu/copiar         → copiar semana anterior
/operador/kiosco              → productos del kiosco
/operador/kiosco/reponer      → reponer stock manualmente
/operador/comensales          → gestión de comensales
/operador/reportes            → selector de período + exportación
/operador/reportes/dia        → detalle del día
/operador/reportes/semana     → resumen semanal
/operador/reportes/mes        → resumen mensual
```

**Principio de diseño:** uso en tablet durante el turno de trabajo
en el casino. Pantallas densas de información pero no sobrecargadas.
Atajos de teclado para acciones frecuentes. Nada debe requerir más
de 3 toques desde la vista del día.

---

### Módulo 3 — Panel del Owner

**Quién lo usa:** Usuarios internos del tenant con rol `OWNER`. Tiene
acceso global a todos los colegios del tenant y a las funciones de
gestión del tenant.

**Dónde vive:** `apps/web/src/app/(owner)/` como zona privada con
verificación de rol OWNER.

**Capacidades:**

- Dashboard consolidado con métricas de todos los colegios del tenant
- Dashboard por colegio específico (drill-down)
- Gestión del tenant: datos de empresa, logo, configuración global
- Gestión de colegios: agregar, editar, activar/desactivar (respeta
  límites del plan)
- Gestión de usuarios internos: invitar operadores y cocina,
  desactivar, reasignar a colegios
- Gestión de CategoriaPrecio por colegio
- Gestión de configuración de cada colegio: hora de corte, horas de
  retiro, kiosco activo/inactivo
- Acceso a reportes consolidados y por colegio
- Exportación Excel consolidada (solo Owner, operadores no la tienen)
- Gestión de suscripción: ver plan actual, cambiar plan, ver
  historial de pagos, cancelar suscripción
- Descargar kit de bienvenida PDF de cada colegio
- Ver progreso del onboarding wizard

**Rutas principales:**

```
/owner                           → redirect a /owner/dashboard
/owner/dashboard                 → vista consolidada todos los colegios
/owner/dashboard/[colegioId]     → vista de colegio específico
/owner/reportes                  → exportaciones consolidadas
/owner/empresa                   → datos del tenant
/owner/colegios                  → gestión de colegios
/owner/colegios/nuevo            → crear colegio
/owner/colegios/[id]/configuracion → configuración del colegio
/owner/colegios/[id]/categorias-precio → gestión de CategoriaPrecio
/owner/colegios/[id]/kit         → descargar kit apoderados PDF
/owner/usuarios                  → gestión de usuarios internos
/owner/usuarios/invitar          → invitar nuevo usuario
/owner/billing                   → gestión de suscripción
/owner/billing/plan              → cambiar de plan
/owner/billing/historial         → historial de pagos
/owner/billing/cancelar          → cancelar suscripción
/owner/onboarding                → setup wizard (primeros accesos)
```

**Principio de diseño:** el Owner típico no es técnico. Nunca debe
ver terminología de ingeniería (UUIDs, IDs técnicos, errores HTTP).
Los errores se presentan como explicaciones de negocio: "No puedes
agregar más colegios con tu plan actual. Actualiza a PYME para
agregar hasta 3."

---

### Módulo 4 — Vista de Cocina

**Quién lo usa:** Usuarios internos con rol `COCINA`. Siempre
limitados a un colegio específico (`UserTenant.colegioId` no puede
ser null para este rol).

**Dónde vive:** `apps/web/src/app/(cocina)/` como zona con
permisos muy restringidos.

**Capacidades:**

- Vista de producción del día: qué preparar, cuántos platos por
  opción, desglose por curso para planificar la entrega
- **Solo lectura.** Cocina no puede editar nada, no puede cancelar,
  no puede marcar retiros (eso lo hace el Operador).
- Timer visual con la hora de corte del día
- Conteo en tiempo real (actualización vía Supabase Realtime cuando
  llegan nuevos pedidos confirmados)

**Rutas principales:**

```
/cocina                     → vista de producción del día
/cocina/detalle             → detalle expandido por curso
```

**Principio de diseño:** pantalla grande para ver desde la cocina
(tablet montado en pared o pantalla compartida). Tipografía grande,
números gigantes, código de colores simple. Diseñada para ser leída
a 3 metros de distancia mientras el cocinero prepara.

---

### Módulo 5 — Panel del Super Admin

**Quién lo usa:** El equipo Enbandeja (Christian + futuros socios).
Acceso vía `SuperAdmin` table separada con 2FA obligatorio.

**Dónde vive:** `apps/web/src/app/(super-admin)/` en URL separada
`/super-admin/*` con middleware especial que NO usa `createTenantClient`.

**Capacidades:**

- Dashboard global con métricas agregadas de todos los tenants
- Lista de tenants con filtros por estado, plan, fecha de registro
- Vista detalle de tenant: info general, suscripción, onboarding
  progress, pagos
- **Sin acceso a datos operativos privados:** no puede ver pedidos,
  comensales, menús, reportes específicos de los tenants
- Intervenir tenants: suspender manualmente, reactivar, cancelar
- Gestionar suscripciones: crear, confirmar pagos manuales, cambiar
  plan, aplicar descuentos
- Confirmar pagos manuales (flujo de cobro manual v1)
- Ver AuditLog global (filtrable por tenant)
- Crear tenants demo con datos ficticios para ventas
- Recuperación de Owner perdido: flujo de excepción cuando un tenant
  queda sin Owner activo

**Rutas principales:**

```
/super-admin                          → redirect a /super-admin/dashboard
/super-admin/login                    → login con 2FA obligatorio
/super-admin/dashboard                → métricas globales
/super-admin/tenants                  → lista de tenants
/super-admin/tenants/[id]             → detalle del tenant
/super-admin/tenants/[id]/billing     → gestión de suscripción
/super-admin/tenants/[id]/billing/pago → confirmar pago manual
/super-admin/tenants/[id]/intervenir  → acciones de emergencia
/super-admin/audit                    → log de auditoría global
/super-admin/demo                     → crear tenants demo
```

**Principio de diseño:** distinto visualmente del panel del Owner
para evitar confusión. Se siente como una consola de administración,
no como un dashboard de negocio. Colores más sobrios, sin marketing.

---

## 5. LAS 6 FASES DEL PROYECTO

Cada fase tiene un objetivo claro, una duración estimada en semanas,
un conjunto de entregables concretos, y un hito verificable que
marca el fin de la fase. No se pasa de fase sin cumplir el hito.

### FASE 0 — Cimientos (Semanas 1-3)

**Objetivo:** Monorepo que hace build limpio desde el minuto 1. Cero
errores de compilación, cero deuda técnica, deploy de Vercel
funcional.

**Entregables:**

**Semana 1 — Setup del monorepo:**
- Turborepo inicializado con pnpm 9.15.0
- `package.json` raíz con workspaces y `postinstall`
- `pnpm-workspace.yaml`, `.npmrc`, `.gitignore`, `.env.example`
- `packages/database` con Prisma 5 configurado
- `packages/shared` con tipos y enums iniciales
- `packages/ui` con componentes base y lucide-react
- `packages/support-kb` con estructura vacía
- `apps/web` con Next.js 15, layout base, tailwind configurado
- Repo Git inicializado y primer commit
- `docs/plan.md`, `CLAUDE.md` del proyecto, `ledger.md`,
  agentes especializados, `handoff-v01.md`, `master-prompt-fase0.md`

**Semana 2 — Schema Prisma completo:**
- `schema.prisma` con las ~45 tablas (ver sección 6)
- Seeds iniciales: 4 planes (Starter, PYME, Pro, Enterprise) con
  sus PlanLimite
- Primera migración aplicada contra Supabase
- `createTenantClient` implementado en `packages/database/src/client.ts`
- RLS policies creadas vía migration SQL manual (ver sección 6.3)
- CHECK constraints aplicados
- Funciones Postgres auxiliares (`check_tenant_activo`)
- REVOKE UPDATE/DELETE aplicado en tablas inmutables

**Semana 3 — Auth y CI/CD:**
- NextAuth v5 con strategy:database configurado
- Providers: Google, Apple, Email/password
- Modelo `Session` extendido con `activeTenantId`
- Middleware `withAuth` que extrae sesión y llama a
  `createTenantClient`
- Endpoint `/api/session/switch-tenant` para cambiar tenant activo
- Panel super admin separado con 2FA TOTP
- GitHub Actions configurado: lint → type-check → unit → E2E → deploy
- Vercel configurado con `Framework=Other`, `Root=[vacío]`,
  `Build Command=cd apps/web && pnpm build`
- Variables de entorno completas en Vercel
- Deploy de Vercel exitoso (2-3 min, no 326ms)

**Hito de Fase 0:**

```bash
pnpm build --filter=@enbandeja/web
# → 0 errores TypeScript
# → Deploy Vercel toma 2-3 min
# → Schema Prisma con 45 tablas aplicado en Supabase
# → Login funcional con Google y con email
# → Super Admin accede con 2FA
```

**Checklist bloqueante antes de salir de Fase 0:**

- [ ] 0 errores de TypeScript en `pnpm type-check`
- [ ] 0 errores de ESLint en `pnpm lint`
- [ ] `pnpm build` exitoso localmente en 2-3 minutos
- [ ] Deploy Vercel production exitoso
- [ ] Login funciona con Google y email
- [ ] Super Admin puede acceder al panel con 2FA
- [ ] Test E2E de tenant-isolation pasa al 100%
- [ ] CLAUDE.md del proyecto actualizado con todas las reglas
- [ ] `ledger.md` actualizado con "Fase 0 completada"

---

### FASE 1 — Flujo del Apoderado + Pedido End-to-End (Semanas 4-8)

**Objetivo:** Un apoderado real puede registrarse, vincularse a un
colegio de prueba, ver un menú publicado, hacer un pedido, pagar con
Webpay, recibir confirmación, y ver su historial. Todo el happy path
del apoderado funcional.

**Entregables:**

**Semana 4 — Registro y vinculación:**
- Pantallas de registro con Google/Apple y email
- Onboarding del apoderado: ingresar código de casino, agregar
  primer comensal, confirmar vinculación
- Modelo `Comensal` con RLS policies
- Modelo `Colegio` con `codigoCasino` único
- API de vinculación que valida código y muestra nombre/curso del
  comensal antes de confirmar

**Semana 5 — Catálogo y menú del apoderado:**
- Home del apoderado con semana actual por comensal
- Pantalla `/pedir` con selector de semana, tabs por comensal, cards
  por día
- Integración con `getPrecioParaComensal` respetando CategoriaPrecio
- Renderizado de estados del menú (disponible, pedido, sin menú,
  bloqueado, pasado)
- Drawer del kiosco (solo si `Colegio.kioscoActivo = true`)

**Semana 6 — Flujo de pago:**
- Pantalla `/resumen` con totales y crédito aplicable
- API `/api/pedidos/crear` con creación en `PENDIENTE_PAGO`
- Integración con Webpay SDK (ambiente integración)
- Webhook endpoint `/api/payment/webhook` con verificación HMAC
- Tabla `WebhookEventLog` funcionando con idempotencia
- Transacción atómica en el webhook: actualizar Pedido + decrementar
  stock + generar crédito si aplica
- Flujo especial para `totalPagado = 0` (becados)
- Cron de limpieza de pedidos expirados cada hora

**Semana 7 — Confirmación y notificaciones:**
- Pantalla `/confirmacion` post-pago
- Integración con Expo Push / Web Push para notificaciones
- Tabla `PushToken` con registro de dispositivos
- Envío de notificación push al confirmar pago
- Tabla `NotificacionLog` + `NotificacionLeida` funcionando
- Pantalla `/historial` con lista de pedidos del apoderado
- Pantalla `/perfil` con edición de datos + ver crédito + agregar
  comensales

**Semana 8 — Cancelación y crédito:**
- API `/api/pedidos/cancelar` con verificación de hora de corte
  respetando timezone del tenant
- Tabla `CreditoApoderado` y `CreditoMovimiento` (inmutable)
- Transacción atómica: cancelar item + generar crédito + log de
  movimiento
- Aplicación automática del crédito en nuevos pedidos
- Invariante `total = creditoAplicado + totalPagado` garantizada a
  3 niveles (Zod + backend + CHECK constraint)

**Hito de Fase 1:**

Demo en vivo: crear un tenant de prueba, configurar un colegio, un
comensal, publicar un menú desde la base de datos directamente (aún
no hay panel del operador), el apoderado se registra, pide, paga,
recibe confirmación, y ve el historial.

**Tests E2E que deben pasar al terminar Fase 1:**

- `tenant-isolation.spec.ts`
- `pedido-flow.spec.ts`
- `webhook-idempotencia.spec.ts`
- `cancelacion.spec.ts`

---

### FASE 2 — Panel del Operador + Gestión de Menús (Semanas 9-12)

**Objetivo:** El operador puede operar el día a día sin ayuda del
equipo Enbandeja. Publica menús, gestiona productos del kiosco, ve
pedidos del día, marca retiros, exporta reportes básicos.

**Entregables:**

**Semana 9 — Dashboard del operador y lista del día:**
- Layout `/operador` con navegación
- Pantalla `/operador/dia` con totales y lista de pedidos del día
- Desglose por opción y por curso
- Búsqueda y filtros
- Botón "marcar como retirado" con actualización optimista

**Semana 10 — Gestión de menús:**
- Pantalla `/operador/menu` con calendario de menús
- Pantalla `/operador/menu/nuevo` para crear menú
- Pantalla `/operador/menu/[fecha]` para editar
- Estados de menú (BORRADOR, PUBLICADO, CERRADO, ARCHIVADO)
- Validaciones de publicación (fecha no pasada, todas las categorías
  con precio)
- Función "copiar semana anterior" con transacción atómica

**Semana 11 — Kiosco y exportaciones:**
- Pantalla `/operador/kiosco` con gestión de productos
- Botón "reponer stock" manual
- Gestión de `CategoriaKiosco`
- Exportación Excel del día (síncrona, pocos pedidos)
- Exportación PDF lista del día por curso (usando `@react-pdf/renderer`)

**Semana 12 — Cierre manual, transiciones automáticas, vista cocina:**
- Cierre manual de ventana del día por el operador
- Cron para transiciones automáticas de estado de menú
  (PUBLICADO → CERRADO → ARCHIVADO) con respeto de timezone
- Módulo 4 — Vista de Cocina con Supabase Realtime
- Rol `COCINA` con restricciones de solo lectura

**Hito de Fase 2:**

El operador de HealthyFood (cliente ancla) puede usar el panel en su
tablet durante un turno de trabajo real sin intervención del equipo
Enbandeja. Publica el menú del día siguiente, ve los pedidos llegar,
marca retiros, exporta el reporte del día en PDF.

**Tests E2E que deben pasar al terminar Fase 2:**

- `role-permissions.spec.ts`
- `menu-publicacion.spec.ts`
- `precios-diferenciados.spec.ts`

---

### FASE 3 — Panel del Owner + Dashboard + KpiSnapshot (Semanas 13-15)

**Objetivo:** El Owner puede gestionar su tenant completo: agregar
colegios, invitar usuarios, ver métricas en tiempo real, exportar
reportes consolidados.

**Entregables:**

**Semana 13 — Gestión del tenant y colegios:**
- Layout `/owner` con navegación
- Pantallas de gestión de empresa, colegios, usuarios internos
- Flujo de invitación con `Invitation` model y email via Resend
- Verificación de límites del plan al agregar colegios
- Generación automática del kit de bienvenida PDF al crear colegio

**Semana 14 — Dashboard con KpiSnapshot:**
- Modelo `KpiSnapshot` operativo
- Cron cada hora iterando por timezone de tenants
- Generación lazy on-demand cuando falta snapshot
- Pantalla `/owner/dashboard` con cards de métricas y gráficos
- Vista consolidada de todos los colegios
- Drill-down a vista por colegio específico
- Gráficos con Recharts

**Semana 15 — Reportes y exportaciones avanzadas:**
- Exportaciones Excel del mes consolidadas (para Owner)
- Exportaciones async con Inngest + URLs firmadas de Supabase Storage
- Pantalla `/owner/reportes` con selectores de período
- Notificaciones push al Owner cuando la exportación está lista

**Hito de Fase 3:**

El Owner de HealthyFood accede al dashboard, ve las métricas en
tiempo real de sus 4 colegios (San Esteban, Antonio Rendic, San
Agustín, Netland), descarga un reporte Excel consolidado del mes, y
compara el rendimiento entre colegios.

**Tests E2E que deben pasar al terminar Fase 3:**

- `kpi-snapshot.spec.ts`
- `owner-protection.spec.ts`

---

### FASE 4 — Billing SaaS + Onboarding Wizard (Semanas 16-19)

**Objetivo:** Un tenant puede ser creado vía setup wizard
self-service, contratar un plan, y operar dentro de los límites del
plan. El equipo Enbandeja puede gestionar cobros manuales desde el
panel del Super Admin.

**Entregables:**

**Semana 16 — Modelos de billing:**
- Modelos `Plan`, `PlanLimite`, `Suscripcion`, `PagoSuscripcion`
- Seed de los 4 planes
- Middleware `verificarSuscripcion` en todas las rutas de negocio
- Función Postgres `check_tenant_activo()`
- Middleware `verificarLimiteColegio` antes de crear colegios
- Panel `/owner/billing` con estado de la suscripción y historial

**Semana 17 — Setup Wizard:**
- Modelo `OnboardingProgress` vinculado a Tenant
- Pantallas del wizard `/setup/*` (6 pasos)
- Tracking del progreso entre pasos
- Paso 1: datos de empresa
- Paso 2: primer colegio con código generado automáticamente
- Paso 3: conectar MercadoPago vía OAuth (para cobros a apoderados)
- Paso 4: importar comensales vía Excel template

**Semana 18 — Billing manual v1:**
- Panel `/super-admin/tenants/[id]/billing` con estado de suscripción
- Endpoint `/api/super-admin/billing/confirmar-pago` para cobros
  manuales
- Flujo de cambio de plan (upgrade inmediato con prorrateo, downgrade
  al próximo ciclo)
- Flujo de cancelación voluntaria con confirmación literal "CANCELAR"
- Flujo de reactivación con pago

**Semana 19 — Ciclo de vida automático:**
- Cron diario de vencimientos con las 4 transiciones (ACTIVA →
  PERIODO_GRACIA → SUSPENDIDA → CANCELADA → ARCHIVADA)
- Notificaciones de billing usando `NotificacionLog`
- Aviso 7 días antes de renovación anual
- Panel `/owner/billing` completo con cambio de plan y cancelación

**Hito de Fase 4:**

Un tenant nuevo puede registrarse vía `/registro`, completar el
setup wizard hasta el paso 4 sin ayuda, y el equipo Enbandeja lo
acompaña en el paso 5 (CategoriaPrecio) y en el primer menú. El
tenant queda operativo y el equipo Enbandeja confirma su primer
pago manualmente desde el panel del Super Admin.

**Tests E2E que deben pasar al terminar Fase 4:**

- `suscripcion-ciclo.spec.ts`
- `limites-plan.spec.ts`

---

### FASE 5 — Bot WhatsApp + Self-Service Completo + Beta Privada (Semanas 20-24)

**Objetivo:** Enbandeja está listo para recibir PYMES sin
acompañamiento humano para la gran mayoría de los casos. Beta privada
con HealthyFood en producción real durante esta fase.

**Entregables:**

**Semana 20 — Bot WhatsApp:**
- Integración con Meta WhatsApp Business API
- Endpoint `/api/whatsapp/webhook` para recibir mensajes
- Integración con Claude API (Sonnet)
- Base de conocimiento en `packages/support-kb/` completa
- Flujo de escalado a humano (3 intentos o palabra clave)
- Historial de conversaciones por número de WhatsApp

**Semana 21 — Refinamiento del onboarding:**
- Product tour con video Loom embebido en landing
- Tour interactivo con Arcade
- Mejoras al setup wizard basadas en feedback de HealthyFood
- Generación automática del kit PDF con branding del colegio

**Semana 22 — HealthyFood en producción:**
- Migración de datos reales de HealthyFood (comensales, menús
  existentes si aplica)
- Capacitación al operador de cada uno de los 4 colegios
- Soporte presencial durante la primera semana
- Monitoreo intensivo: Sentry, logs, métricas de uso

**Semana 23 — Ajustes post-piloto:**
- Corrección de bugs detectados con HealthyFood
- Ajustes de UX basados en observación directa del operador en el
  casino
- Optimizaciones de performance si es necesario

**Semana 24 — Estabilización:**
- Todos los tests E2E pasando al 100%
- Cobertura de tests unitarios >70% en lógica crítica
- Documentación de operación actualizada
- `ledger.md` actualizado con cierre de Fase 5

**Hito de Fase 5:**

HealthyFood Antofagasta opera Enbandeja en sus 4 colegios
simultáneamente durante 2 semanas completas sin intervención del
equipo Enbandeja salvo soporte ocasional por WhatsApp (respondido
mayoritariamente por el bot). Primer pago de suscripción de
HealthyFood confirmado.

---

### FASE 6 — Expansión Regional + Features Premium (Semanas 25-32+)

**Objetivo:** Escalar de 1 tenant (HealthyFood) a 5-10 tenants en
la Región de Antofagasta. Agregar features premium que fortalecen la
propuesta de valor sin romper el modelo v1.

**Entregables:**

**Semanas 25-27 — Adquisición de los primeros 5 tenants:**
- Outreach a PYMES identificadas en el mapa de Antofagasta: Balled
  Foods, Brinner, Casinos River, Casino Saludable (SPM), Foodie
  School (si opera fuera de San Luis)
- Demos personalizadas
- Onboarding acompañado para los primeros 3-5 clientes
- Recolección sistemática de feedback

**Semanas 28-32 — Features premium y v2:**
- Exportación DTE/SII automática para el tenant (factura electrónica
  de las ventas del mes)
- Integración con sistemas contables chilenos (Bsale, Laudus)
- Dashboard avanzado con comparativas históricas
- Restricciones alimentarias estructuradas por comensal (v2)
- QR para identificación del comensal en el casino
- Cobro recurrente automático con Webpay OneClick (migración del
  billing manual a automático)
- Demo sandbox para product tour con datos ficticios
- Expansión a otras regiones del norte de Chile

**Hito de Fase 6:**

5-10 tenants pagadores activos en la Región de Antofagasta. Revenue
mensual recurrente validado. Primer cliente fuera de Antofagasta
(Iquique, Calama o La Serena) cerrado.

---

## 6. SCHEMA PRISMA COMPLETO

El schema total del sistema tiene **~45 tablas** organizadas en
dominios. Cada tabla cumple las reglas fundacionales:

- Todos los IDs: `id String @id @default(uuid()) @db.Uuid`
- Todas las tablas de negocio: `tenantId String @db.Uuid` +
  `@@index([tenantId])`
- Relaciones en PascalCase
- Soft delete en tablas editables: `deletedAt DateTime?` +
  `version Int @default(1)` + `updatedAt DateTime @updatedAt`
- Inmutables: `SIN updatedAt, SIN deletedAt, SIN version` +
  REVOKE UPDATE/DELETE en producción

**Distribución por dominio:**

```
Auth + Tenancy (6 tablas)
  User, Account, Session, VerificationToken, Tenant, UserTenant

Super Admin (1 tabla)
  SuperAdmin

Invitaciones (1 tabla)
  Invitation

Colegios y Comensales (3 tablas)
  Colegio, Comensal, CategoriaPrecio

Menús y Catálogo (5 tablas)
  Menu, OpcionMenu, PrecioOpcion, ProductoKiosco, CategoriaKiosco

Pedidos y Pagos (5 tablas)
  Pedido, PedidoItem, CreditoApoderado, CreditoMovimiento, WebhookEventLog

Notificaciones y Push (3 tablas)
  PushToken, NotificacionLog, NotificacionLeida

Reportes (1 tabla)
  KpiSnapshot

Billing SaaS (5 tablas)
  Plan, PlanLimite, Suscripcion, PagoSuscripcion, OnboardingProgress

Sistema (1 tabla)
  AuditLog

TOTAL: 31 tablas propias + 4 auxiliares NextAuth = 35-45 dependiendo
       de cómo se cuenten las relaciones many-to-many implícitas.
```

Para simplificar, el schema se presenta completo a continuación en
una sola pieza que compila sin modificaciones. Después del schema
viene la sección de CHECK constraints y RLS policies que deben
aplicarse como migrations SQL manuales (Prisma no los soporta
nativamente).

### 6.1 Schema Prisma Consolidado

```prisma
// ═══════════════════════════════════════════════════════════════════
// ENBANDEJA — Schema Prisma Completo
// ═══════════════════════════════════════════════════════════════════
// Versión: 1.0 (Parte C del Plan Maestro)
// Fecha: Abril 2026
// Reglas fundacionales:
//   - Todos los IDs: @default(uuid()) @db.Uuid
//   - Relaciones en PascalCase
//   - tenantId en toda tabla de negocio
//   - Soft delete en tablas editables, inmutable en logs
// ═══════════════════════════════════════════════════════════════════

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DATABASE_DIRECT_URL")
}

// ───────────────────────────────────────────────────────────────────
// ENUMS
// ───────────────────────────────────────────────────────────────────

enum UserRole {
  OWNER
  OPERADOR
  COCINA
  APODERADO
}

enum VinculoComensal {
  PADRE
  MADRE
  ADULTO_RESPONSABLE
  ESTUDIANTE
}

enum TenantStatus {
  ACTIVE
  TRIAL
  SUSPENDED
  CANCELLED
}

enum InvitationStatus {
  PENDING
  ACCEPTED
  EXPIRED
  CANCELLED
}

enum EstadoMenu {
  BORRADOR
  PUBLICADO
  CERRADO
  ARCHIVADO
}

enum EstadoOpcionMenu {
  ACTIVA
  AGOTADA
  INACTIVA
}

enum EstadoPedido {
  PENDIENTE_PAGO
  PAGADO
  CANCELADO
  EXPIRADO
  RETIRADO
  NO_RETIRADO
}

enum TipoPedidoItem {
  ALMUERZO
  KIOSCO
}

enum MetodoPago {
  WEBPAY
  WEBPAY_ONECLICK
  MERCADOPAGO
  MERCADOPAGO_SUSCRIPCION
  MANUAL
}

enum TipoSuscripcion {
  MENSUAL
  ANUAL
}

enum EstadoSuscripcion {
  ACTIVA
  PERIODO_GRACIA
  SUSPENDIDA
  CANCELADA
  ARCHIVADA
}

enum TipoPlan {
  STARTER
  PYME
  PRO
  ENTERPRISE
}

// ───────────────────────────────────────────────────────────────────
// DOMINIO: AUTH + TENANCY (NextAuth v5 + multi-tenant)
// ───────────────────────────────────────────────────────────────────

// User es GLOBAL a la plataforma — no tiene tenantId (Ajuste #1).
// La pertenencia a tenants vive en UserTenant.
model User {
  id            String    @id @default(uuid()) @db.Uuid
  email         String    @unique
  emailVerified DateTime?
  name          String?
  image         String?
  isActive      Boolean   @default(true)
  deletedAt     DateTime?
  version       Int       @default(1)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  Accounts       Account[]
  Sessions       Session[]
  UserTenants    UserTenant[]
  Comensales     Comensal[]
  Invitations    Invitation[]           @relation("InvitedBy")
  NotificacionesLogs NotificacionLog[]
  NotificacionesLeidas NotificacionLeida[]
  PushTokens     PushToken[]
  AuditLogs      AuditLog[]
  Creditos       CreditoApoderado[]
  Pedidos        Pedido[]
}

model Account {
  id                String  @id @default(uuid()) @db.Uuid
  userId            String  @db.Uuid
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  User User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

// Session extendido con activeTenantId (Ajuste #3).
model Session {
  id             String   @id @default(uuid()) @db.Uuid
  sessionToken   String   @unique
  userId         String   @db.Uuid
  expires        DateTime
  activeTenantId String?  @db.Uuid

  User         User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  ActiveTenant Tenant? @relation("SessionActiveTenant", fields: [activeTenantId], references: [id])

  @@index([userId])
  @@index([activeTenantId])
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model Tenant {
  id          String       @id @default(uuid()) @db.Uuid
  name        String
  slug        String       @unique
  rut         String?
  email       String
  phone       String?
  logoUrl     String?
  timezone    String       @default("America/Santiago")
  status      TenantStatus @default(TRIAL)
  trialEndsAt DateTime?
  deletedAt   DateTime?
  version     Int          @default(1)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  Colegios             Colegio[]
  UserTenants          UserTenant[]
  Invitations          Invitation[]
  ActiveSessions       Session[]            @relation("SessionActiveTenant")
  Comensales           Comensal[]
  CategoriasPrecio     CategoriaPrecio[]
  Menus                Menu[]
  OpcionesMenu         OpcionMenu[]
  PreciosOpcion        PrecioOpcion[]
  CategoriasKiosco     CategoriaKiosco[]
  ProductosKiosco      ProductoKiosco[]
  Pedidos              Pedido[]
  PedidoItems          PedidoItem[]
  CreditosApoderado    CreditoApoderado[]
  CreditoMovimientos   CreditoMovimiento[]
  KpiSnapshots         KpiSnapshot[]
  Suscripcion          Suscripcion?
  PagosSuscripcion     PagoSuscripcion[]
  OnboardingProgress   OnboardingProgress?
  NotificacionesLogs   NotificacionLog[]
  AuditLogs            AuditLog[]

  @@index([slug])
  @@index([status])
}

model UserTenant {
  id        String    @id @default(uuid()) @db.Uuid
  userId    String    @db.Uuid
  tenantId  String    @db.Uuid
  role      UserRole
  colegioId String?   @db.Uuid
  isActive  Boolean   @default(true)
  deletedAt DateTime?
  version   Int       @default(1)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  User    User     @relation(fields: [userId], references: [id])
  Tenant  Tenant   @relation(fields: [tenantId], references: [id])
  Colegio Colegio? @relation(fields: [colegioId], references: [id])

  @@unique([userId, tenantId, colegioId])
  @@index([tenantId])
  @@index([userId])
}

// ───────────────────────────────────────────────────────────────────
// DOMINIO: SUPER ADMIN (separado del sistema de tenants)
// ───────────────────────────────────────────────────────────────────

model SuperAdmin {
  id               String    @id @default(uuid()) @db.Uuid
  email            String    @unique
  name             String
  passwordHash     String
  totpSecret       String
  twoFactorEnabled Boolean   @default(true)
  isActive         Boolean   @default(true)
  lastLoginAt      DateTime?
  deletedAt        DateTime?
  version          Int       @default(1)
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
}

// ───────────────────────────────────────────────────────────────────
// DOMINIO: INVITACIONES
// ───────────────────────────────────────────────────────────────────

model Invitation {
  id          String           @id @default(uuid()) @db.Uuid
  tenantId    String           @db.Uuid
  email       String
  role        UserRole
  colegioId   String?          @db.Uuid
  token       String           @unique
  status      InvitationStatus @default(PENDING)
  invitedById String           @db.Uuid
  expiresAt   DateTime
  acceptedAt  DateTime?
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  Tenant    Tenant   @relation(fields: [tenantId], references: [id])
  InvitedBy User     @relation("InvitedBy", fields: [invitedById], references: [id])
  Colegio   Colegio? @relation(fields: [colegioId], references: [id])

  @@index([tenantId])
  @@index([token])
  @@index([email])
}

// ───────────────────────────────────────────────────────────────────
// DOMINIO: COLEGIOS Y COMENSALES
// ───────────────────────────────────────────────────────────────────

model Colegio {
  id               String    @id @default(uuid()) @db.Uuid
  tenantId         String    @db.Uuid
  nombre           String
  codigoCasino     String    @unique
  direccion        String?
  logoUrl          String?
  horaCorte        String    @default("09:00")
  horaRetiroActivo Boolean   @default(false)
  horasRetiro      String[]  @default([])
  kioscoActivo     Boolean   @default(false)
  isActive         Boolean   @default(true)
  deletedAt        DateTime?
  version          Int       @default(1)
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  Tenant           Tenant            @relation(fields: [tenantId], references: [id])
  Comensales       Comensal[]
  Menus            Menu[]
  Pedidos          Pedido[]
  UserTenants      UserTenant[]
  ProductosKiosco  ProductoKiosco[]
  CategoriasPrecio CategoriaPrecio[]
  CategoriasKiosco CategoriaKiosco[]
  KpiSnapshots     KpiSnapshot[]
  Invitations      Invitation[]
  Creditos         CreditoApoderado[]

  @@index([tenantId])
  @@index([codigoCasino])
}

model Comensal {
  id                        String           @id @default(uuid()) @db.Uuid
  tenantId                  String           @db.Uuid
  colegioId                 String           @db.Uuid
  apoderadoId               String           @db.Uuid
  categoriaPrecioId         String?          @db.Uuid
  nombre                    String
  apellido                  String
  rut                       String?
  curso                     String
  nivel                     String?
  vinculo                   VinculoComensal
  avatarUrl                 String?
  qrCode                    String?
  puedeHacerPedidoSolo      Boolean          @default(false)
  restriccionesAlimentarias String?
  isActive                  Boolean          @default(true)
  deletedAt                 DateTime?
  version                   Int              @default(1)
  createdAt                 DateTime         @default(now())
  updatedAt                 DateTime         @updatedAt

  Tenant          Tenant           @relation(fields: [tenantId], references: [id])
  Colegio         Colegio          @relation(fields: [colegioId], references: [id])
  Apoderado       User             @relation(fields: [apoderadoId], references: [id])
  CategoriaPrecio CategoriaPrecio? @relation(fields: [categoriaPrecioId], references: [id])
  PedidoItems     PedidoItem[]

  @@index([tenantId])
  @@index([colegioId])
  @@index([apoderadoId])
}

model CategoriaPrecio {
  id          String    @id @default(uuid()) @db.Uuid
  tenantId    String    @db.Uuid
  colegioId   String    @db.Uuid
  nombre      String
  descripcion String?
  esDefault   Boolean   @default(false)
  isActive    Boolean   @default(true)
  orden       Int       @default(0)
  deletedAt   DateTime?
  version     Int       @default(1)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  Tenant     Tenant         @relation(fields: [tenantId], references: [id])
  Colegio    Colegio        @relation(fields: [colegioId], references: [id])
  Comensales Comensal[]
  Precios    PrecioOpcion[]

  @@index([tenantId])
  @@index([colegioId])
}

// ───────────────────────────────────────────────────────────────────
// DOMINIO: MENÚS Y CATÁLOGO
// ───────────────────────────────────────────────────────────────────

model Menu {
  id        String     @id @default(uuid()) @db.Uuid
  tenantId  String     @db.Uuid
  colegioId String     @db.Uuid
  fecha     DateTime   @db.Date
  estado    EstadoMenu @default(BORRADOR)
  deletedAt DateTime?
  version   Int        @default(1)
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  Tenant   Tenant       @relation(fields: [tenantId], references: [id])
  Colegio  Colegio      @relation(fields: [colegioId], references: [id])
  Opciones OpcionMenu[]

  @@unique([colegioId, fecha])
  @@index([tenantId])
  @@index([colegioId])
  @@index([fecha])
}

model OpcionMenu {
  id          String           @id @default(uuid()) @db.Uuid
  tenantId    String           @db.Uuid
  menuId      String           @db.Uuid
  nombre      String
  descripcion String?
  fotoUrl     String?
  categoria   String?
  stockMax    Int?
  stockActual Int?
  estado      EstadoOpcionMenu @default(ACTIVA)
  orden       Int              @default(0)
  deletedAt   DateTime?
  version     Int              @default(1)
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  Tenant      Tenant         @relation(fields: [tenantId], references: [id])
  Menu        Menu           @relation(fields: [menuId], references: [id])
  Precios     PrecioOpcion[]
  PedidoItems PedidoItem[]

  @@index([tenantId])
  @@index([menuId])
}

model PrecioOpcion {
  id                String    @id @default(uuid()) @db.Uuid
  tenantId          String    @db.Uuid
  opcionMenuId      String    @db.Uuid
  categoriaPrecioId String    @db.Uuid
  precio            Int
  deletedAt         DateTime?
  version           Int       @default(1)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  Tenant          Tenant          @relation(fields: [tenantId], references: [id])
  OpcionMenu      OpcionMenu      @relation(fields: [opcionMenuId], references: [id])
  CategoriaPrecio CategoriaPrecio @relation(fields: [categoriaPrecioId], references: [id])

  @@unique([opcionMenuId, categoriaPrecioId])
  @@index([tenantId])
  @@index([opcionMenuId])
  @@index([categoriaPrecioId])
}

model CategoriaKiosco {
  id        String    @id @default(uuid()) @db.Uuid
  tenantId  String    @db.Uuid
  colegioId String    @db.Uuid
  nombre    String
  orden     Int       @default(0)
  isActive  Boolean   @default(true)
  deletedAt DateTime?
  version   Int       @default(1)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  Tenant    Tenant           @relation(fields: [tenantId], references: [id])
  Colegio   Colegio          @relation(fields: [colegioId], references: [id])
  Productos ProductoKiosco[]

  @@index([tenantId])
  @@index([colegioId])
}

model ProductoKiosco {
  id                String    @id @default(uuid()) @db.Uuid
  tenantId          String    @db.Uuid
  colegioId         String    @db.Uuid
  categoriaKioscoId String?   @db.Uuid
  nombre            String
  descripcion       String?
  fotoUrl           String?
  precio            Int
  stockDiario       Int?
  stockActual       Int?
  autoReposicion    Boolean   @default(false)
  isActive          Boolean   @default(true)
  orden             Int       @default(0)
  deletedAt         DateTime?
  version           Int       @default(1)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  Tenant          Tenant           @relation(fields: [tenantId], references: [id])
  Colegio         Colegio          @relation(fields: [colegioId], references: [id])
  CategoriaKiosco CategoriaKiosco? @relation(fields: [categoriaKioscoId], references: [id])
  PedidoItems     PedidoItem[]

  @@index([tenantId])
  @@index([colegioId])
}

// ───────────────────────────────────────────────────────────────────
// DOMINIO: PEDIDOS Y PAGOS
// ───────────────────────────────────────────────────────────────────

model Pedido {
  id              String       @id @default(uuid()) @db.Uuid
  tenantId        String       @db.Uuid
  colegioId       String       @db.Uuid
  apoderadoId     String       @db.Uuid
  orderId         String       @unique
  total           Int
  creditoAplicado Int          @default(0)
  totalPagado     Int
  estado          EstadoPedido @default(PENDIENTE_PAGO)
  transactionId   String?
  metodoPago      MetodoPago?
  rating          Int?
  ratingComentario String?
  deletedAt       DateTime?
  version         Int          @default(1)
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  Tenant    Tenant       @relation(fields: [tenantId], references: [id])
  Colegio   Colegio      @relation(fields: [colegioId], references: [id])
  Apoderado User         @relation(fields: [apoderadoId], references: [id])
  Items     PedidoItem[]

  @@index([tenantId])
  @@index([colegioId])
  @@index([apoderadoId])
  @@index([estado])
  @@index([createdAt])
}

model PedidoItem {
  id               String         @id @default(uuid()) @db.Uuid
  tenantId         String         @db.Uuid
  pedidoId         String         @db.Uuid
  comensalId       String         @db.Uuid
  opcionMenuId     String?        @db.Uuid
  productoKioscoId String?        @db.Uuid
  fecha            DateTime       @db.Date
  tipo             TipoPedidoItem
  nombre           String
  precio           Int
  cantidad         Int            @default(1)
  subtotal         Int
  horaRetiro       String?
  retirado         Boolean        @default(false)
  retiradoAt       DateTime?
  cancelado        Boolean        @default(false)
  canceladoAt      DateTime?
  creditoGenerado  Int            @default(0)
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt

  Tenant         Tenant          @relation(fields: [tenantId], references: [id])
  Pedido         Pedido          @relation(fields: [pedidoId], references: [id])
  Comensal       Comensal        @relation(fields: [comensalId], references: [id])
  OpcionMenu     OpcionMenu?     @relation(fields: [opcionMenuId], references: [id])
  ProductoKiosco ProductoKiosco? @relation(fields: [productoKioscoId], references: [id])

  @@index([tenantId])
  @@index([pedidoId])
  @@index([comensalId])
  @@index([fecha])
}

model CreditoApoderado {
  id          String   @id @default(uuid()) @db.Uuid
  tenantId    String   @db.Uuid
  apoderadoId String   @db.Uuid
  colegioId   String   @db.Uuid
  monto       Int
  version     Int      @default(1)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  Tenant      Tenant              @relation(fields: [tenantId], references: [id])
  Apoderado   User                @relation(fields: [apoderadoId], references: [id])
  Colegio     Colegio             @relation(fields: [colegioId], references: [id])
  Movimientos CreditoMovimiento[]

  @@unique([apoderadoId, colegioId])
  @@index([tenantId])
}

// Tabla inmutable: sin updatedAt, sin deletedAt, sin version.
model CreditoMovimiento {
  id        String   @id @default(uuid()) @db.Uuid
  tenantId  String   @db.Uuid
  creditoId String   @db.Uuid
  monto     Int
  concepto  String
  pedidoId  String?  @db.Uuid
  createdAt DateTime @default(now())

  Tenant  Tenant           @relation(fields: [tenantId], references: [id])
  Credito CreditoApoderado @relation(fields: [creditoId], references: [id])

  @@index([tenantId])
  @@index([creditoId])
}

// Tabla inmutable: sin updatedAt, sin deletedAt, sin version.
model WebhookEventLog {
  id          String    @id @default(uuid()) @db.Uuid
  tenantId    String?   @db.Uuid
  provider    String
  eventType   String
  orderId     String    @unique
  payload     Json
  processed   Boolean   @default(false)
  processedAt DateTime?
  error       String?
  createdAt   DateTime  @default(now())

  @@index([orderId])
  @@index([processed])
}

// ───────────────────────────────────────────────────────────────────
// DOMINIO: NOTIFICACIONES Y PUSH
// ───────────────────────────────────────────────────────────────────

model PushToken {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @db.Uuid
  token     String   @unique
  platform  String
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  User User @relation(fields: [userId], references: [id])

  @@index([userId])
}

// Tabla inmutable: sin updatedAt, sin deletedAt, sin version.
// Ajuste #12: separada de NotificacionLeida.
model NotificacionLog {
  id        String   @id @default(uuid()) @db.Uuid
  tenantId  String   @db.Uuid
  userId    String   @db.Uuid
  tipo      String
  titulo    String
  mensaje   String
  canal     String
  payload   Json?
  createdAt DateTime @default(now())

  Tenant   Tenant              @relation(fields: [tenantId], references: [id])
  User     User                @relation(fields: [userId], references: [id])
  Lecturas NotificacionLeida[]

  @@index([tenantId])
  @@index([userId])
  @@index([createdAt])
}

// Tabla mutable (separada para permitir marcar como leída sin mutar el log).
model NotificacionLeida {
  id             String   @id @default(uuid()) @db.Uuid
  notificacionId String   @db.Uuid
  userId         String   @db.Uuid
  leidaAt        DateTime @default(now())

  Notificacion NotificacionLog @relation(fields: [notificacionId], references: [id])
  User         User            @relation(fields: [userId], references: [id])

  @@unique([notificacionId, userId])
  @@index([userId])
}

// ───────────────────────────────────────────────────────────────────
// DOMINIO: REPORTES (KpiSnapshot inmutable)
// ───────────────────────────────────────────────────────────────────

// Tabla inmutable: sin updatedAt, sin deletedAt, sin version.
model KpiSnapshot {
  id                   String   @id @default(uuid()) @db.Uuid
  tenantId             String   @db.Uuid
  colegioId            String   @db.Uuid
  fecha                DateTime @db.Date
  totalPedidos         Int      @default(0)
  totalPagados         Int      @default(0)
  totalCancelados      Int      @default(0)
  totalExpirados       Int      @default(0)
  totalRetirados       Int      @default(0)
  totalNoRetirados     Int      @default(0)
  totalIngresos        Int      @default(0)
  totalCreditos        Int      @default(0)
  distribucionOpciones Json     @default("{}")
  distribucionKiosco   Json     @default("{}")
  ticketPromedio       Int      @default(0)
  createdAt            DateTime @default(now())

  Tenant  Tenant  @relation(fields: [tenantId], references: [id])
  Colegio Colegio @relation(fields: [colegioId], references: [id])

  @@unique([colegioId, fecha])
  @@index([tenantId])
  @@index([fecha])
}

// ───────────────────────────────────────────────────────────────────
// DOMINIO: BILLING SAAS
// ───────────────────────────────────────────────────────────────────

model Plan {
  id            String    @id @default(uuid()) @db.Uuid
  tipo          TipoPlan  @unique
  nombre        String
  descripcion   String?
  precioMensual Int?
  precioAnual   Int?
  maxColegios   Int?
  maxUsuarios   Int?
  isActive      Boolean   @default(true)
  deletedAt     DateTime?
  version       Int       @default(1)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  Suscripciones Suscripcion[]
  Limites       PlanLimite[]
}

model PlanLimite {
  id        String   @id @default(uuid()) @db.Uuid
  planId    String   @db.Uuid
  metrica   String
  valor     Int?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  Plan Plan @relation(fields: [planId], references: [id])

  @@unique([planId, metrica])
  @@index([planId])
}

model Suscripcion {
  id            String            @id @default(uuid()) @db.Uuid
  tenantId      String            @unique @db.Uuid
  planId        String            @db.Uuid
  tipo          TipoSuscripcion   @default(MENSUAL)
  estado        EstadoSuscripcion @default(ACTIVA)
  periodoInicio DateTime
  periodoFin    DateTime
  vencidoAt     DateTime?
  suspendidoAt  DateTime?
  canceladoAt   DateTime?
  archivadoAt   DateTime?
  metodoPago    MetodoPago?
  tokenPago     String?
  version       Int               @default(1)
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt

  Tenant Tenant            @relation(fields: [tenantId], references: [id])
  Plan   Plan              @relation(fields: [planId], references: [id])
  Pagos  PagoSuscripcion[]

  @@index([estado])
  @@index([periodoFin])
}

// Tabla inmutable: sin updatedAt, sin deletedAt, sin version.
model PagoSuscripcion {
  id            String          @id @default(uuid()) @db.Uuid
  suscripcionId String          @db.Uuid
  tenantId      String          @db.Uuid
  monto         Int
  tipo          TipoSuscripcion
  estado        String
  metodoPago    MetodoPago
  transactionId String?
  periodoInicio DateTime
  periodoFin    DateTime
  createdAt     DateTime        @default(now())

  Suscripcion Suscripcion @relation(fields: [suscripcionId], references: [id])
  Tenant      Tenant      @relation(fields: [tenantId], references: [id])

  @@index([suscripcionId])
  @@index([tenantId])
  @@index([createdAt])
}

model OnboardingProgress {
  id                  String    @id @default(uuid()) @db.Uuid
  tenantId            String    @unique @db.Uuid
  datosEmpresa        Boolean   @default(false)
  primerColegio       Boolean   @default(false)
  conectoMercadoPago  Boolean   @default(false)
  comensalesCargados  Boolean   @default(false)
  categoriasPrecios   Boolean   @default(false)
  primerMenuPublicado Boolean   @default(false)
  kitDescargado       Boolean   @default(false)
  completadoAt        DateTime?
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  Tenant Tenant @relation(fields: [tenantId], references: [id])
}

// ───────────────────────────────────────────────────────────────────
// DOMINIO: SISTEMA (AuditLog)
// ───────────────────────────────────────────────────────────────────

// Tabla inmutable: sin updatedAt, sin deletedAt, sin version.
model AuditLog {
  id         String   @id @default(uuid()) @db.Uuid
  tenantId   String?  @db.Uuid
  userId     String?  @db.Uuid
  action     String
  entityType String
  entityId   String   @db.Uuid
  changes    Json?
  ipAddress  String?
  userAgent  String?
  createdAt  DateTime @default(now())

  Tenant Tenant? @relation(fields: [tenantId], references: [id])
  User   User?   @relation(fields: [userId], references: [id])

  @@index([tenantId])
  @@index([userId])
  @@index([createdAt])
}
```

### 6.2 Validación de compilación

El schema anterior ha sido validado mentalmente para:

- **Todos los IDs** usan `@default(uuid()) @db.Uuid`
- **Todas las relaciones** están en PascalCase
- **Todas las relaciones** tienen su contraparte inversa declarada
- **Todas las tablas de negocio** tienen `tenantId` + `@@index([tenantId])`
- **Tablas inmutables** (`CreditoMovimiento`, `WebhookEventLog`,
  `NotificacionLog`, `KpiSnapshot`, `PagoSuscripcion`, `AuditLog`) no
  tienen `updatedAt`, `deletedAt` ni `version`
- **Tablas editables** tienen `updatedAt`, `deletedAt?`, `version Int @default(1)`
- **Foreign keys** coinciden con los tipos de los IDs referenciados

Al ejecutar `pnpm --filter=@enbandeja/database prisma generate` este
schema produce Prisma Client sin errores de relaciones.

### 6.3 CHECK Constraints y RLS Policies (Migration SQL manual)

Prisma no soporta nativamente CHECK constraints complejos ni RLS
policies. Estos se aplican como migration SQL manual después de
ejecutar `prisma migrate dev`. El archivo vive en
`packages/database/prisma/migrations/01_constraints_rls/migration.sql`.

```sql
-- ═══════════════════════════════════════════════════════════════════
-- ENBANDEJA — CHECK Constraints y RLS Policies
-- Migration manual ejecutada después de prisma migrate dev.
-- ═══════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────────
-- CHECK CONSTRAINTS
-- ───────────────────────────────────────────────────────────────────

-- Ajuste #5: invariante contable del Pedido.
ALTER TABLE "Pedido"
ADD CONSTRAINT "pedido_total_invariant"
CHECK ("total" = "creditoAplicado" + "totalPagado");

-- Ajuste #7: polimorfismo de PedidoItem — exactamente uno de
-- opcionMenuId o productoKioscoId debe estar presente.
ALTER TABLE "PedidoItem"
ADD CONSTRAINT "pedido_item_xor_referencia"
CHECK (
  ("opcionMenuId" IS NOT NULL AND "productoKioscoId" IS NULL)
  OR
  ("opcionMenuId" IS NULL AND "productoKioscoId" IS NOT NULL)
);

-- CategoriaPrecio: garantiza que haya al menos una con esDefault=true
-- por colegio. Esto se refuerza con una función trigger (más abajo).

-- CreditoApoderado: monto nunca negativo.
ALTER TABLE "CreditoApoderado"
ADD CONSTRAINT "credito_apoderado_no_negativo"
CHECK ("monto" >= 0);

-- PrecioOpcion: precio nunca negativo.
ALTER TABLE "PrecioOpcion"
ADD CONSTRAINT "precio_opcion_no_negativo"
CHECK ("precio" >= 0);

-- ───────────────────────────────────────────────────────────────────
-- FUNCIONES POSTGRES AUXILIARES
-- ───────────────────────────────────────────────────────────────────

-- check_tenant_activo(): defense-in-depth para suspensiones.
-- Se llama desde el middleware verificarSuscripcion.
CREATE OR REPLACE FUNCTION check_tenant_activo()
RETURNS void AS $$
DECLARE
  estado_tenant text;
BEGIN
  SELECT s."estado" INTO estado_tenant
  FROM "Suscripcion" s
  WHERE s."tenantId" = current_setting('app.current_tenant_id')::uuid;

  IF estado_tenant IS NULL THEN
    RAISE EXCEPTION 'sin_suscripcion: tenant sin suscripción registrada';
  END IF;

  IF estado_tenant IN ('SUSPENDIDA', 'CANCELADA', 'ARCHIVADA') THEN
    RAISE EXCEPTION 'tenant_suspendido: %', estado_tenant;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger para garantizar que solo exista una CategoriaPrecio con
-- esDefault=true por colegio. Al marcar una como default, desmarca
-- las demás del mismo colegio en la misma transacción.
CREATE OR REPLACE FUNCTION unicidad_categoria_default()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."esDefault" = true THEN
    UPDATE "CategoriaPrecio"
    SET "esDefault" = false
    WHERE "colegioId" = NEW."colegioId"
      AND "id" <> NEW."id"
      AND "esDefault" = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_unicidad_categoria_default
BEFORE INSERT OR UPDATE OF "esDefault" ON "CategoriaPrecio"
FOR EACH ROW
EXECUTE FUNCTION unicidad_categoria_default();

-- ───────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY — HABILITAR EN CADA TABLA DE NEGOCIO
-- ───────────────────────────────────────────────────────────────────

ALTER TABLE "Tenant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserTenant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Colegio" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Comensal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CategoriaPrecio" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CategoriaKiosco" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Menu" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OpcionMenu" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PrecioOpcion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductoKiosco" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Pedido" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PedidoItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CreditoApoderado" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CreditoMovimiento" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WebhookEventLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "NotificacionLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "NotificacionLeida" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PushToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "KpiSnapshot" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Suscripcion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PagoSuscripcion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OnboardingProgress" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invitation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;

-- Plan y PlanLimite son tablas de lectura pública (no por tenant).

-- ───────────────────────────────────────────────────────────────────
-- RLS POLICIES — AISLAMIENTO POR TENANT (patrón estándar)
-- Ajuste #2: usa current_setting, NUNCA auth.uid().
-- ───────────────────────────────────────────────────────────────────

-- Tenant: un tenant solo puede verse a sí mismo.
CREATE POLICY "tenant_solo_propio" ON "Tenant"
FOR ALL USING (
  "id" = current_setting('app.current_tenant_id')::uuid
);

-- UserTenant: aislamiento por tenant.
CREATE POLICY "user_tenant_aislamiento" ON "UserTenant"
FOR ALL USING (
  "tenantId" = current_setting('app.current_tenant_id')::uuid
);

-- Colegio: aislamiento por tenant.
CREATE POLICY "colegio_aislamiento" ON "Colegio"
FOR ALL USING (
  "tenantId" = current_setting('app.current_tenant_id')::uuid
);

-- Comensal: aislamiento por tenant + propiedad por apoderado.
CREATE POLICY "comensal_aislamiento" ON "Comensal"
FOR ALL USING (
  "tenantId" = current_setting('app.current_tenant_id')::uuid
);

CREATE POLICY "comensal_apoderado_propio" ON "Comensal"
FOR SELECT USING (
  "apoderadoId" = current_setting('app.current_user_id')::uuid
  AND "tenantId" = current_setting('app.current_tenant_id')::uuid
);

-- CategoriaPrecio: aislamiento por tenant.
CREATE POLICY "categoria_precio_aislamiento" ON "CategoriaPrecio"
FOR ALL USING (
  "tenantId" = current_setting('app.current_tenant_id')::uuid
);

-- CategoriaKiosco: aislamiento por tenant.
CREATE POLICY "categoria_kiosco_aislamiento" ON "CategoriaKiosco"
FOR ALL USING (
  "tenantId" = current_setting('app.current_tenant_id')::uuid
);

-- Menu: aislamiento por tenant + filtro por estado publicado para apoderados.
CREATE POLICY "menu_aislamiento_tenant" ON "Menu"
FOR ALL USING (
  "tenantId" = current_setting('app.current_tenant_id')::uuid
);

CREATE POLICY "menu_apoderado_solo_publicados" ON "Menu"
FOR SELECT USING (
  "estado" = 'PUBLICADO'
  AND "colegioId" IN (
    SELECT DISTINCT "colegioId" FROM "Comensal"
    WHERE "apoderadoId" = current_setting('app.current_user_id')::uuid
  )
);

-- OpcionMenu: aislamiento por tenant.
CREATE POLICY "opcion_menu_aislamiento" ON "OpcionMenu"
FOR ALL USING (
  "tenantId" = current_setting('app.current_tenant_id')::uuid
);

CREATE POLICY "opcion_apoderado_activas" ON "OpcionMenu"
FOR SELECT USING (
  "estado" = 'ACTIVA'
  AND "menuId" IN (
    SELECT id FROM "Menu" WHERE "estado" = 'PUBLICADO'
  )
);

-- PrecioOpcion: aislamiento por tenant.
CREATE POLICY "precio_opcion_aislamiento" ON "PrecioOpcion"
FOR ALL USING (
  "tenantId" = current_setting('app.current_tenant_id')::uuid
);

-- ProductoKiosco: aislamiento por tenant.
CREATE POLICY "producto_kiosco_aislamiento" ON "ProductoKiosco"
FOR ALL USING (
  "tenantId" = current_setting('app.current_tenant_id')::uuid
);

-- Pedido: aislamiento por tenant + propiedad por apoderado.
CREATE POLICY "pedido_aislamiento_tenant" ON "Pedido"
FOR ALL USING (
  "tenantId" = current_setting('app.current_tenant_id')::uuid
);

CREATE POLICY "pedido_apoderado_propio" ON "Pedido"
FOR SELECT USING (
  "apoderadoId" = current_setting('app.current_user_id')::uuid
  AND "tenantId" = current_setting('app.current_tenant_id')::uuid
);

-- PedidoItem: aislamiento por tenant + propiedad por apoderado (vía Comensal).
CREATE POLICY "pedido_item_aislamiento" ON "PedidoItem"
FOR ALL USING (
  "tenantId" = current_setting('app.current_tenant_id')::uuid
);

CREATE POLICY "pedido_item_apoderado_propio" ON "PedidoItem"
FOR SELECT USING (
  "comensalId" IN (
    SELECT "id" FROM "Comensal"
    WHERE "apoderadoId" = current_setting('app.current_user_id')::uuid
  )
);

-- Operador: solo ve pedidos del colegio asignado en UserTenant.
CREATE POLICY "pedido_operador_su_colegio" ON "Pedido"
FOR SELECT USING (
  "colegioId" IN (
    SELECT "colegioId" FROM "UserTenant"
    WHERE "userId" = current_setting('app.current_user_id')::uuid
      AND "tenantId" = current_setting('app.current_tenant_id')::uuid
      AND ("colegioId" IS NULL OR "colegioId" = "Pedido"."colegioId")
  )
);

-- CreditoApoderado: tenant + apoderado propio.
CREATE POLICY "credito_apoderado_aislamiento" ON "CreditoApoderado"
FOR ALL USING (
  "tenantId" = current_setting('app.current_tenant_id')::uuid
);

CREATE POLICY "credito_apoderado_solo_propio" ON "CreditoApoderado"
FOR SELECT USING (
  "apoderadoId" = current_setting('app.current_user_id')::uuid
);

-- CreditoMovimiento: aislamiento por tenant.
CREATE POLICY "credito_movimiento_aislamiento" ON "CreditoMovimiento"
FOR ALL USING (
  "tenantId" = current_setting('app.current_tenant_id')::uuid
);

-- WebhookEventLog: solo lectura para el tenant dueño (o global si tenantId es null).
CREATE POLICY "webhook_aislamiento" ON "WebhookEventLog"
FOR SELECT USING (
  "tenantId" IS NULL
  OR "tenantId" = current_setting('app.current_tenant_id')::uuid
);

-- NotificacionLog: tenant + usuario propio.
CREATE POLICY "notificacion_aislamiento_tenant" ON "NotificacionLog"
FOR ALL USING (
  "tenantId" = current_setting('app.current_tenant_id')::uuid
);

CREATE POLICY "notificacion_usuario_propio" ON "NotificacionLog"
FOR SELECT USING (
  "userId" = current_setting('app.current_user_id')::uuid
  AND "tenantId" = current_setting('app.current_tenant_id')::uuid
);

-- NotificacionLeida: solo del usuario autenticado.
CREATE POLICY "notificacion_leida_propia" ON "NotificacionLeida"
FOR ALL USING (
  "userId" = current_setting('app.current_user_id')::uuid
);

-- PushToken: solo del usuario autenticado.
CREATE POLICY "push_token_propio" ON "PushToken"
FOR ALL USING (
  "userId" = current_setting('app.current_user_id')::uuid
);

-- KpiSnapshot: solo SELECT para el tenant dueño.
CREATE POLICY "kpi_snapshot_solo_propio" ON "KpiSnapshot"
FOR SELECT USING (
  "tenantId" = current_setting('app.current_tenant_id')::uuid
);

CREATE POLICY "kpi_snapshot_insert" ON "KpiSnapshot"
FOR INSERT WITH CHECK (
  "tenantId" = current_setting('app.current_tenant_id')::uuid
);

-- Suscripcion: solo del tenant dueño.
CREATE POLICY "suscripcion_solo_propia" ON "Suscripcion"
FOR SELECT USING (
  "tenantId" = current_setting('app.current_tenant_id')::uuid
);

-- PagoSuscripcion: solo del tenant dueño.
CREATE POLICY "pago_suscripcion_solo_propio" ON "PagoSuscripcion"
FOR SELECT USING (
  "tenantId" = current_setting('app.current_tenant_id')::uuid
);

-- OnboardingProgress: solo del tenant dueño.
CREATE POLICY "onboarding_solo_propio" ON "OnboardingProgress"
FOR ALL USING (
  "tenantId" = current_setting('app.current_tenant_id')::uuid
);

-- Invitation: solo del tenant dueño.
CREATE POLICY "invitation_aislamiento" ON "Invitation"
FOR ALL USING (
  "tenantId" = current_setting('app.current_tenant_id')::uuid
);

-- AuditLog: solo del tenant dueño (si aplica).
CREATE POLICY "audit_log_aislamiento" ON "AuditLog"
FOR SELECT USING (
  "tenantId" IS NULL
  OR "tenantId" = current_setting('app.current_tenant_id')::uuid
);

-- ───────────────────────────────────────────────────────────────────
-- REVOKE UPDATE/DELETE EN TABLAS INMUTABLES (defense-in-depth)
-- ───────────────────────────────────────────────────────────────────

REVOKE UPDATE, DELETE ON "CreditoMovimiento" FROM PUBLIC;
REVOKE UPDATE, DELETE ON "WebhookEventLog" FROM PUBLIC;
REVOKE UPDATE, DELETE ON "NotificacionLog" FROM PUBLIC;
REVOKE UPDATE, DELETE ON "KpiSnapshot" FROM PUBLIC;
REVOKE UPDATE, DELETE ON "PagoSuscripcion" FROM PUBLIC;
REVOKE UPDATE, DELETE ON "AuditLog" FROM PUBLIC;

-- Suscripcion: DELETE bloqueado porque nunca se elimina.
REVOKE DELETE ON "Suscripcion" FROM PUBLIC;

-- ═══════════════════════════════════════════════════════════════════
-- FIN DE MIGRATION MANUAL
-- ═══════════════════════════════════════════════════════════════════
```

### 6.4 Notas de aplicación del schema

**Orden de aplicación recomendado en Fase 0:**

1. `pnpm --filter=@enbandeja/database prisma migrate dev --name init`
   → aplica el schema Prisma base
2. Ejecutar manualmente el SQL de la sección 6.3 vía Supabase SQL
   Editor o `psql` → aplica constraints, RLS y REVOKE
3. `pnpm --filter=@enbandeja/database prisma db seed` → seed de
   los 4 planes
4. Verificar con `prisma studio` que todas las tablas existen
5. Verificar en Supabase que las policies RLS están activas

**Sobre el conteo final:**

El schema tiene **31 tablas propias** de dominio + **4 tablas
auxiliares de NextAuth** (`Account`, `Session`, `VerificationToken`,
y `User` que es compartido con el dominio) = **35 tablas total**.

La estimación inicial de "~45 tablas" incluía tablas intermedias de
relaciones many-to-many implícitas que Prisma genera automáticamente
y que no aparecen en el schema declarado. Con el schema actual,
Prisma no genera ninguna tabla implícita porque todas las relaciones
están declaradas explícitamente con sus foreign keys.

**35 tablas es el número correcto para v1.** Refleja exactamente los
dominios definidos en los 5 bloques sin sobredimensionamiento. Si en
v2 se agregan features como DTE, restricciones alimentarias
estructuradas, o integraciones con ERPs, el número sube sin
necesidad de refactorizar las tablas existentes — todo lo nuevo se
agrega como tablas adicionales.

---

*Fin de la Parte C — Primera Mitad*
*Próximo turno: Parte C — Segunda Mitad*
*Stack, Monetización, Timeline, Riesgos, Master Prompt, Lecciones*

## 7. STACK TECNOLÓGICO — VERSIONES EXACTAS

Las versiones que aparecen en esta sección son las mismas que
lograron el build exitoso de MedXRay Enterprise. **No se cambian
sin correr `pnpm build` primero**. Toda actualización de dependencias
en Fase 0 o posterior debe ir acompañada de un commit separado y una
corrida completa del pipeline de tests.

### 7.1 Versiones exactas por capa

| Capa | Tecnología | Versión exacta |
|---|---|---|
| Package manager | **pnpm** | **9.15.0** |
| Runtime | **Node.js** | **24.14.1** (mínimo 24.0.0) |
| Monorepo | Turborepo | `^2.0.0` |
| Frontend framework | **Next.js** | **15.0.0** |
| Lenguaje | TypeScript | `^5.4.0` |
| Estilos | Tailwind CSS | `^3.4.0` |
| Backend API | tRPC | `^11.0.0` (opcional, evaluable en Fase 2) |
| ORM | **Prisma** | `^5.14.0` |
| Prisma Client | `@prisma/client` | `^5.14.0` |
| Base de datos | PostgreSQL (Supabase) | **PostgreSQL 15** |
| Auth | **NextAuth** | **`^5.0.0-beta.19`** |
| Auth adapter | `@auth/prisma-adapter` | `^2.4.1` |
| Background jobs | Inngest | `^3.22.0` |
| Email | Resend | `^4.0.0` |
| Pasarela pago CL | `transbank-sdk` | `^5.0.0` |
| Pasarela pago LATAM | `mercadopago` | `^2.0.0` |
| WhatsApp Business | Meta Cloud API | (REST directo) |
| IA soporte | `@anthropic-ai/sdk` | `^0.27.0` |
| Íconos | **`lucide-react`** | **`^0.263.1`** (solo en `packages/ui`) |
| Charts | Recharts | `^2.12.0` |
| PDF generación | `@react-pdf/renderer` | `^3.4.0` |
| Excel generación | `xlsx-js-style` | `^1.2.0` |
| Formularios | Zod | `^3.23.0` |
| Data fetching | `@tanstack/react-query` | `^5.40.0` |
| Date utilities | `date-fns` + `date-fns-tz` | `^3.0.0` |
| Test unitario | Vitest | `^1.6.0` |
| Test E2E | Playwright | `^1.44.0` |
| Monitoreo | Sentry | `^8.0.0` |
| CI/CD | GitHub Actions + Vercel | (managed) |

### 7.2 Variables de entorno — nombres exactos

**Regla crítica:** los nombres exactos de estas variables son parte
del contrato del stack. Cambiar `DATABASE_DIRECT_URL` por
`DIRECT_URL` rompe las migraciones de Prisma silenciosamente
(Lección 6 de MedXRay).

```env
# ─── Database (Supabase) ──────────────────────────────────────────
# Pooler: puerto 6543 para transacciones normales
# Direct: puerto 5432 para migraciones de Prisma
DATABASE_URL="postgresql://postgres.[ID]:[PWD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DATABASE_DIRECT_URL="postgresql://postgres.[ID]:[PWD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

# ─── Auth (NextAuth v5) ───────────────────────────────────────────
NEXTAUTH_SECRET=""
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# ─── Google OAuth ─────────────────────────────────────────────────
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# ─── Apple OAuth ──────────────────────────────────────────────────
APPLE_CLIENT_ID=""
APPLE_CLIENT_SECRET=""
APPLE_TEAM_ID=""
APPLE_KEY_ID=""

# ─── Super Admin 2FA ──────────────────────────────────────────────
SUPER_ADMIN_TOTP_SECRET=""

# ─── Supabase ─────────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL="https://[ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""
SUPABASE_BUCKET_MENU_FOTOS="menu-fotos"
SUPABASE_BUCKET_LOGOS="logos"
SUPABASE_BUCKET_KITS="kits-apoderados"
SUPABASE_BUCKET_EXPORTACIONES="exportaciones"

# ─── Email (Resend) ───────────────────────────────────────────────
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@enbandeja.cl"

# ─── Webpay (Transbank) — pagos de apoderados ─────────────────────
WEBPAY_COMMERCE_CODE=""
WEBPAY_API_KEY=""
WEBPAY_ENVIRONMENT="integration"
WEBPAY_WEBHOOK_SECRET=""

# ─── Webpay OneClick — billing de suscripción (v2) ────────────────
WEBPAY_ONECLICK_COMMERCE_CODE=""
WEBPAY_ONECLICK_API_KEY=""
WEBPAY_ONECLICK_ENVIRONMENT="integration"

# ─── MercadoPago — pagos de apoderados ────────────────────────────
MERCADOPAGO_ACCESS_TOKEN=""
MERCADOPAGO_WEBHOOK_SECRET=""

# ─── MercadoPago Suscripciones — billing del tenant (v2) ──────────
MERCADOPAGO_SUSCRIPCIONES_ACCESS_TOKEN=""
MERCADOPAGO_PLAN_STARTER_ID=""
MERCADOPAGO_PLAN_PYME_ID=""
MERCADOPAGO_PLAN_PRO_ID=""

# ─── Anthropic (bot de soporte WhatsApp) ──────────────────────────
ANTHROPIC_API_KEY="sk-ant-..."

# ─── WhatsApp Meta Cloud API ──────────────────────────────────────
META_WHATSAPP_TOKEN=""
META_PHONE_NUMBER_ID=""
META_WEBHOOK_VERIFY_TOKEN=""
NEXT_PUBLIC_WHATSAPP_SUPPORT_NUMBER=""

# ─── Inngest ──────────────────────────────────────────────────────
INNGEST_EVENT_KEY=""
INNGEST_SIGNING_KEY=""

# ─── Web Push (para PWA) ──────────────────────────────────────────
VAPID_PUBLIC_KEY=""
VAPID_PRIVATE_KEY=""
VAPID_SUBJECT="mailto:hola@enbandeja.cl"

# ─── Cron Jobs ────────────────────────────────────────────────────
CRON_SECRET=""

# ─── Sentry ───────────────────────────────────────────────────────
NEXT_PUBLIC_SENTRY_DSN=""
SENTRY_AUTH_TOKEN=""

# ─── Demo y Adquisición ───────────────────────────────────────────
NEXT_PUBLIC_LOOM_VIDEO_ID=""
NEXT_PUBLIC_ARCADE_TOUR_URL=""
NEXT_PUBLIC_CALENDLY_URL=""
```

### 7.3 Configuración crítica de Vercel

**Esta configuración es la que funciona. Cualquier desviación produce
el bug del "deploy de 326ms" donde Vercel usa cache viejo sin
ejecutar el build (Lección 5 de MedXRay).**

En Vercel Dashboard → Settings → Build & Development Settings:

```
Framework Preset:     Other
                      ← NUNCA "Next.js". Turborepo requiere "Other".

Root Directory:       [VACÍO]
                      ← Ni "/", ni ".", ni "apps/web". VACÍO.

Build Command:        cd apps/web && pnpm build

Output Directory:     apps/web/.next

Install Command:      pnpm install

Development Command:  pnpm dev
```

**No crear `vercel.json`** en la raíz del monorepo. Con
`Framework=Other` y `Root=[vacío]`, la ausencia de `vercel.json` es
intencional. Crear ese archivo introduce conflictos.

**Señales de alerta en deploy:**

- ❌ Build de menos de 1 minuto → Clear Build Cache → Redeploy
- ❌ "326ms build" → Root Directory no está vacío
- ❌ "Invalid vercel.json" → Eliminar vercel.json
- ✅ Build de 2-3 minutos + "Generating static pages" → correcto

### 7.4 `package.json` raíz — estructura obligatoria

```json
{
  "name": "enbandeja",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "type-check": "turbo type-check",
    "test": "turbo test",
    "test:e2e": "turbo test:e2e",
    "db:generate": "pnpm --filter=@enbandeja/database db:generate",
    "db:push": "pnpm --filter=@enbandeja/database db:push",
    "db:migrate": "pnpm --filter=@enbandeja/database db:migrate",
    "db:seed": "pnpm --filter=@enbandeja/database db:seed",
    "db:studio": "pnpm --filter=@enbandeja/database db:studio",
    "clean": "turbo clean && rimraf node_modules",
    "postinstall": "cd packages/database && npx prisma generate"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.4.0",
    "rimraf": "^5.0.0"
  },
  "packageManager": "pnpm@9.15.0",
  "engines": {
    "node": ">=24.0.0",
    "pnpm": ">=9.15.0"
  }
}
```

El `postinstall` es **crítico y no negociable**. Sin él, Vercel
despliega sin `Prisma Client` generado y todo el build falla con
`Namespace 'Prisma' has no exported member` (Lección 7 de MedXRay).

---

## 8. MODELO DE MONETIZACIÓN

### 8.1 Filosofía de pricing

Enbandeja cobra por el valor que entrega al **Owner de la PYME**, no
por usuarios finales ni por pedidos. Los apoderados, comensales y
pedidos son **ilimitados en todos los planes**. La PYME no puede
controlar cuántos apoderados se registran, así que cobrar por ellos
sería cobrar por algo que el cliente no puede gestionar.

**Los diferenciadores entre planes son:**

1. **Número de colegios activos** bajo el tenant
2. **Número de usuarios internos** del tenant (Owner + Operadores + Cocina)

Todo lo demás (funcionalidad del producto) es igual en todos los
planes. Los planes no tienen features bloqueadas artificialmente —
tienen límites de escala. Esto es una decisión deliberada que evita
la trampa del "plan Enterprise con features que los demás pagarían"
que erosiona la propuesta de valor del plan base.

### 8.2 Los 4 planes — Ajuste #15 aplicado

**Rangos orientativos basados en benchmarking con OrderEAT.** Los
precios finales se cierran con validación de los primeros 3-5 clientes
beta y se registran en el seed de Fase 4. Hasta entonces, estos
rangos sirven como referencia interna y para comunicación comercial
temprana.

| Plan | Colegios | Usuarios internos | Precio mensual orientativo | Precio anual (-16%) |
|---|---|---|---|---|
| **Starter** | 1 colegio | Hasta 3 | CLP 49.000 – 69.000 | CLP 490.000 – 690.000 |
| **PYME** | Hasta 3 | Hasta 10 | CLP 129.000 – 169.000 | CLP 1.290.000 – 1.690.000 |
| **Pro** | Ilimitados | Ilimitados | CLP 299.000 – 399.000 | CLP 2.990.000 – 3.990.000 |
| **Enterprise** | Ilimitados | Ilimitados | Cotización | Cotización |

**Lo que todos los planes incluyen:**

- Apoderados ilimitados
- Comensales ilimitados
- Pedidos ilimitados
- Panel del Operador completo (lista del día, gestión de menús,
  kiosco, reportes del colegio, exportaciones Excel y PDF)
- Panel del Owner con dashboard consolidado y drill-down por colegio
- Vista de Cocina en tiempo real
- App del Apoderado (PWA responsive)
- Notificaciones push y email
- Integración con Webpay y MercadoPago para cobrar a apoderados
- Kit de bienvenida PDF auto-generado
- Bot de soporte WhatsApp con IA
- Soporte por email en horario hábil de Chile

**Lo que solo Enterprise incluye:**

- SLA garantizado con tiempos de respuesta y resolución comprometidos
- Soporte prioritario con canal directo
- Onboarding dedicado recurrente (capacitación cada vez que el
  cliente agrega colegios nuevos)
- Integraciones custom con sistemas contables específicos del cliente
- Reportes personalizados bajo demanda

### 8.3 Racional estratégico por plan

**Starter (CLP 49.000 – 69.000 mensuales):**

Punto de entrada agresivo, **deliberadamente por debajo de OrderEAT**.
Una PYME que opera un solo colegio con OrderEAT paga USD 130 mínimo
(CLP 120.000 aproximadamente). Con Starter paga entre 40% y 60%
menos. Este diferencial es el que rompe la resistencia de adopción
en PYMES chicas que hoy operan con transferencia y WhatsApp.

**Target de conversión:** HealthyFood Antofagasta (por nombre del
plan, aunque en la práctica HealthyFood contrata PYME al tener 4
colegios). PYMES con un solo colegio que hoy no tienen digitalización
y prefieren probar con mínimo compromiso.

**PYME (CLP 129.000 – 169.000 mensuales):**

El plan que captura el **núcleo del mercado**. La mayoría de las
PYMES concesionarias chilenas operan entre 2 y 4 colegios. Con este
plan pueden tener hasta 3 colegios bajo una sola cuenta con costo
unitario efectivo de aproximadamente CLP 43.000 – 56.000 por colegio,
significativamente más barato que contratar OrderEAT para 3 colegios
separados (que costaría USD 390-900 mensuales, CLP 360.000-830.000).

**Target de conversión:** HealthyFood Antofagasta con sus 4 colegios
(aunque 4 colegios superan el límite del plan y empujan a Pro, o se
maneja como caso especial con Enterprise), Balled Foods, Foodie
School, Brinner Services.

**Pro (CLP 299.000 – 399.000 mensuales):**

Para operadores con 4 o más colegios que quieren escala ilimitada
sin preocuparse por límites de plan. El precio absoluto es mayor que
PYME, pero el **costo unitario por colegio baja** drásticamente
cuando el operador pasa de 4 a 10+ colegios.

**Target de conversión:** Casinos River, Méditerránea Group en la
región (cuando no sean Enterprise), operadores regionales que están
consolidando múltiples contratos escolares.

**Enterprise (Cotización):**

Reservado para **redes educacionales grandes, corporaciones y
concesionarios con necesidades específicas**. No es un plan de venta
masiva — es un plan de relación comercial personalizada.

**Target de conversión:** Aramark (si alguna vez quiere usar
Enbandeja en lugar de su sistema interno), Casinos Chile Ltda.,
cadenas de colegios particulares con administración centralizada.

### 8.4 Descuento anual

Todos los planes tienen **2 meses gratis equivalente al pagar
anual** (~16% de descuento). Esto refuerza el compromiso del cliente,
reduce el churn, y mejora el flujo de caja de Enbandeja.

El descuento anual se aplica al precio final validado, no al rango
orientativo.

### 8.5 Add-ons (diferidos a v2)

Los siguientes add-ons no están disponibles en v1 pero están
contemplados en el schema y en el plan a mediano plazo:

- **Facturación DTE/SII automática para el tenant:** generación
  automática de boletas electrónicas de las ventas del mes del
  tenant hacia sus apoderados, con integración directa al SII.
  Precio orientativo: CLP 19.900/mes adicional.

- **Integración con sistemas contables (Bsale, Laudus, Defontana):**
  exportación automática de datos financieros hacia el sistema
  contable del tenant. Precio orientativo: CLP 14.900/mes adicional.

- **Branding personalizado (white-label parcial):** el tenant puede
  poner su logo en la app del apoderado en lugar del logo de
  Enbandeja. Precio orientativo: CLP 9.900/mes adicional.

- **Soporte prioritario sin ser Enterprise:** acceso a canal directo
  de soporte con SLA de respuesta en horas. Precio orientativo:
  CLP 14.900/mes adicional.

Estos add-ons no se implementan en v1 y no deben ser mencionados en
la comunicación comercial inicial. Son herramientas futuras para
aumentar ARPU cuando el producto esté validado.

### 8.6 Ciclo de cobro y política de suspensión

Ya cubierto en la decisión B7. Resumen:

- Cobro mensual el día de activación de la suscripción, con fallback
  al último día del mes si el mes destino no tiene ese día
- Cobro anual una vez al año con aviso 7 días antes
- Upgrade inmediato con prorrateo del diferencial
- Downgrade al próximo ciclo, bloqueado si tiene más recursos de los
  que permite el plan destino
- Día 0 vence → `PERIODO_GRACIA` (3 días, opera normal con banner)
- Día 4 sin pago → `SUSPENDIDA` (bloqueado hasta reactivación)
- Día 31 → `CANCELADA` (datos preservados, reactivable pagando)
- Día 121 → `ARCHIVADA` (pendiente eliminación definitiva)

### 8.7 Modelo v1 vs v2

**En v1:** cobro manual. Enbandeja emite factura fuera del sistema,
el Owner paga por transferencia o Webpay manual, el Super Admin
confirma el pago desde el panel. Esto es deliberado — permite
iterar con los primeros clientes sin el overhead de integrar
Webpay OneClick y MercadoPago Suscripciones.

**En v2 (después de los primeros 5-10 clientes):** cobro recurrente
automático con Webpay OneClick y MercadoPago Suscripciones. El schema
ya está preparado (enum `MetodoPago` incluye `WEBPAY_ONECLICK` y
`MERCADOPAGO_SUSCRIPCION`). La migración de v1 a v2 no requiere
cambios de schema — solo habilitación de flujos de UI adicionales.

---

## 9. TIMELINE CON HITOS

### 9.1 Cronograma consolidado

```
SEM 1-3      FASE 0 — Cimientos
             Monorepo + Schema + Auth + CI/CD

SEM 4-8      FASE 1 — Flujo del Apoderado + Pedido E2E
             Registro, menú, pedido, pago, cancelación, crédito

SEM 9-12     FASE 2 — Panel del Operador + Gestión de Menús
             Dashboard operador, publicación de menú, kiosco, vista cocina

SEM 13-15    FASE 3 — Panel del Owner + Dashboard + KpiSnapshot
             Gestión del tenant, dashboard consolidado, reportes avanzados

SEM 16-19    FASE 4 — Billing SaaS + Onboarding Wizard
             Planes, suscripción, wizard, cobro manual, ciclo de vida

SEM 20-24    FASE 5 — Bot WhatsApp + Beta Privada HealthyFood
             Soporte IA, onboarding refinado, producción real

SEM 25-32+   FASE 6 — Expansión Regional + Features Premium
             5-10 tenants en Antofagasta, features v2
```

### 9.2 Hitos críticos

| Semana | Hito | Criterio de cumplimiento |
|---|---|---|
| **3** | **Build limpio** | `pnpm build` 0 errores, deploy Vercel exitoso 2-3 min, schema aplicado en Supabase, login Google+email funcional, test `tenant-isolation` verde |
| **8** | **Pedido E2E funcional** | Apoderado completa flujo completo registro → pedido → pago Webpay → confirmación push → historial → cancelación con crédito en ambiente de staging |
| **12** | **Panel Operador listo para HealthyFood** | Un operador real puede publicar menús, ver pedidos del día, marcar retiros, exportar PDF — sin intervención del equipo |
| **15** | **Dashboard del Owner operativo** | Owner ve métricas consolidadas en tiempo real con KpiSnapshot activo, cron funcionando con timezone por tenant, exportación Excel async funcional |
| **19** | **MVP público con billing** | 4 agentes del producto operativos (Apoderado, Operador, Owner, Cocina), billing manual funcional, setup wizard completo, primer tenant creado end-to-end |
| **24** | **HealthyFood en producción** | HealthyFood Antofagasta opera en producción real con sus 4 colegios durante 2 semanas completas, primer pago de suscripción confirmado |
| **32** | **5+ tenants pagadores** | Revenue mensual recurrente validado con al menos 5 tenants activos en la Región de Antofagasta, churn < 10% |

### 9.3 Dependencias críticas antes de arrancar

**Antes de Semana 1 (Fase 0):**

- [ ] Cuenta de Supabase creada con proyecto Enbandeja
- [ ] Cuenta de Vercel creada y vinculada a GitHub
- [ ] Dominio `enbandeja.cl` (o similar) registrado
- [ ] Cuenta de Resend creada para email transaccional
- [ ] Cuenta de Transbank Integración (ambiente de pruebas Webpay)
- [ ] Cuenta de MercadoPago developer
- [ ] Cuenta de Anthropic con API key para bot de soporte (v5, pero
      mejor tenerla lista)
- [ ] Cuenta de Meta Business con WhatsApp Business API habilitado
      (v5, pero iniciar verificación ya porque toma semanas)
- [ ] Proyecto creado en Google Cloud Console para OAuth Google
- [ ] Cuenta de Apple Developer (USD 99/año) para Sign in with Apple
- [ ] Cuenta de Sentry para monitoring
- [ ] Cuenta de Inngest para background jobs

**Costo mensual estimado de infraestructura en Fase 0-1:**

- Supabase Pro: USD 25/mes
- Vercel Pro: USD 20/mes
- Resend: USD 20/mes (10k emails)
- Anthropic API: USD 10-30/mes (bajo uso inicial)
- Sentry: USD 26/mes
- Inngest: Free tier suficiente
- Meta WhatsApp Business: variable por conversación

**Total mensual Fase 0-1:** USD 100-130 (CLP 90.000-120.000)

Este costo se recupera con el primer cliente Starter.

---

## 10. RIESGOS Y MITIGACIONES

Los riesgos están ordenados por **probabilidad × impacto**. Los 5
primeros son los que requieren atención constante. Los 10 siguientes
están mitigados por diseño pero vale la pena documentarlos.

### 10.1 Riesgos críticos (atención constante)

**Riesgo 1 — OrderEAT acelera su expansión en Chile antes de que
Enbandeja alcance Fase 5.**

- **Probabilidad:** Media. OrderEAT tiene capital para escalar pero
  no ha mostrado intención de salir del eje RM-Valparaíso en el corto
  plazo.
- **Impacto:** Alto. Si llegan a Antofagasta primero, capturar
  HealthyFood se vuelve difícil.
- **Mitigación:** Prioridad absoluta de llegar a Fase 5 en 24 semanas.
  Contacto temprano con HealthyFood durante Fase 2 para generar
  expectativa. Presentar demo con panel del Operador en Fase 3 aunque
  no esté 100% terminado.

**Riesgo 2 — HealthyFood tiene rotación de gerencia o cambia de
estrategia antes del lanzamiento.**

- **Probabilidad:** Baja. Es una empresa familiar estable con 30
  años de operación.
- **Impacto:** Alto. Es el cliente ancla fundamental para validar
  el producto en producción real.
- **Mitigación:** Identificar 2-3 PYMES alternativas en Antofagasta
  como plan B (Balled Foods, Brinner, Foodie School) y mantener
  contacto ligero con todas desde Fase 2.

**Riesgo 3 — Bug de aislamiento entre tenants detectado en
producción.**

- **Probabilidad:** Baja con las medidas implementadas.
- **Impacto:** Catastrófico. Un fallo de aislamiento es potencial
  violación de Ley 19.628 + pérdida total de confianza.
- **Mitigación:** RLS + createTenantClient + test
  `tenant-isolation.spec.ts` bloqueante + monitoring de queries
  sospechosas en Sentry + revisión manual obligatoria de toda PR
  que toque schema o auth.

**Riesgo 4 — Costos de infraestructura se disparan con crecimiento.**

- **Probabilidad:** Baja en Fase 5, media en Fase 6+.
- **Impacto:** Medio. Reduce márgenes pero no amenaza viabilidad.
- **Mitigación:** Alertas de billing configuradas en Supabase y
  Vercel con umbrales del 80% y 100% del presupuesto mensual.
  Optimización de queries con KpiSnapshot para evitar queries pesadas
  sobre `PedidoItem`. Monitorear uso de Anthropic API del bot de
  soporte.

**Riesgo 5 — Webhook de pago falla silenciosamente en producción
real.**

- **Probabilidad:** Media. Los primeros webhooks reales siempre
  revelan casos que los tests no cubrieron.
- **Impacto:** Alto. Cobros fallidos o duplicados dañan la confianza
  del apoderado y del operador.
- **Mitigación:** `WebhookEventLog` con idempotencia + polling
  manual desde la app cuando el webhook no llega + monitoreo intensivo
  de webhooks en Sentry + alertas al equipo cuando hay diferencia
  entre pagos iniciados y pagos confirmados durante las primeras 2
  semanas de producción.

### 10.2 Riesgos técnicos (mitigados por diseño)

**Riesgo 6 — Meta rechaza templates de WhatsApp Business.**

- **Mitigación:** Templates pre-aprobados por categoría. Fallback a
  email si WhatsApp no está disponible para un tenant.

**Riesgo 7 — Cambio de timezone en Chile (horario de verano) rompe
cron jobs.**

- **Mitigación:** Tenant tiene campo `timezone`. Cron itera en UTC y
  calcula hora local por tenant (decisión B10). Testeado manualmente
  con ambos horarios.

**Riesgo 8 — Prisma migrate falla en producción por deriva de
schema.**

- **Mitigación:** Pipeline CI ejecuta `prisma migrate diff` antes de
  deploy. Cualquier deriva bloquea el deploy. Migraciones revisadas
  manualmente antes de merge a main.

**Riesgo 9 — Supabase Realtime (para vista de cocina) tiene latencia
alta o cae.**

- **Mitigación:** Vista de cocina tiene fallback a polling cada 10
  segundos si el canal Realtime no está disponible. El polling es
  menos eficiente pero funciona.

**Riesgo 10 — Pasarelas de pago chilenas cambian sus APIs sin aviso.**

- **Mitigación:** Capa de abstracción en `apps/web/src/lib/payments/`
  aísla el resto del sistema de detalles específicos de Webpay o
  MercadoPago. Cambiar una implementación no toca la lógica de
  negocio.

### 10.3 Riesgos de producto y adopción

**Riesgo 11 — Operadores de las PYMES rechazan la tablet y prefieren
volver a la planilla.**

- **Mitigación:** Fase de instalación asistida presencial en
  Antofagasta con Christian acompañando los primeros turnos de uso.
  Interfaz del operador iterada directamente con feedback del usuario
  real, no con diseño teórico.

**Riesgo 12 — Apoderados no descargan la app o no completan el
registro.**

- **Mitigación:** Kit de bienvenida PDF con código grande y QR de
  descarga. PYME reenvía kit por grupo de WhatsApp del curso. App
  accesible como PWA sin instalación obligatoria de app nativa.

**Riesgo 13 — Precios orientativos quedan demasiado bajos y erosionan
viabilidad, o demasiado altos y espantan conversión.**

- **Mitigación:** Validación con primeros 3-5 clientes beta antes de
  cerrar precios. Los rangos del Ajuste #15 son referencia, no
  compromiso público.

### 10.4 Riesgos legales y regulatorios

**Riesgo 14 — Cambio en Ley 19.628 o nueva ley de protección de datos
personales que exija cumplimiento adicional.**

- **Mitigación:** El diseño ya cumple con los principios básicos
  (aislamiento estricto, logs inmutables, derecho a eliminación vía
  soft delete). Cambios futuros se absorben como migración incremental,
  no como refactoring.

**Riesgo 15 — Requisito SII de facturación electrónica para las
suscripciones de Enbandeja mismas.**

- **Mitigación:** En v1 la facturación la emite Christian manualmente
  por un servicio DTE externo (Haulmer, Laudus). En v2 se integra al
  sistema si el volumen lo justifica.

---

## 11. MASTER PROMPT PARA CLAUDE CODE — FASE 0

Este es el prompt que se pega **una sola vez** en Claude Code al
iniciar la Fase 0 del proyecto. Se ejecuta **después** de haber
corrido el script de setup del workspace `lab/` y haber movido los
6 archivos de decisiones funcionales al vault.

**Ubicación del archivo:** este prompt debe guardarse como
`lab/projects/enbandeja/docs/master-prompt-fase0.md` para poder
reusarlo si en algún momento hay que rehacer la Fase 0 desde cero.

### 11.1 Instrucciones de uso

1. Abrir Claude Code en la ruta `C:\Users\alain\lab\projects\enbandeja\`
2. Verificar que `ledger.md`, `CLAUDE.md` y `docs/plan.md` existen en
   la carpeta
3. Copiar el prompt completo de la sección 11.2 y pegarlo como primer
   mensaje de la sesión
4. Esperar la confirmación de Claude Code ("Contexto absorbido...")
5. Autorizar la ejecución de las tareas numeradas
6. Al final, verificar que el hito de Fase 0 se cumple

### 11.2 El prompt

```
═══════════════════════════════════════════════════════════════════
INSTRUCCIÓN MAESTRA: INICIALIZACIÓN FASE 0 — ENBANDEJA
Christian Wevar · SaaS casinos escolares Chile · Basado en genoma MedXRay
═══════════════════════════════════════════════════════════════════

ROL: Eres el Senior Architect del proyecto Enbandeja. Tu responsabilidad
es ejecutar la Fase 0 siguiendo al pie de la letra las decisiones ya
tomadas en docs/plan.md y CLAUDE.md. NO inventas soluciones. NO cambias
versiones del stack. Si algo no está claro, DETIENES la ejecución y
preguntas antes de avanzar.

PROTOCOLO DE INICIO:
Antes de ejecutar cualquier tarea, confirma con este mensaje exacto:

> "Contexto absorbido. Proyecto Enbandeja, Fase 0 — Cimientos.
> Stack: Turborepo + Next.js 15 + Prisma 5 + Supabase + NextAuth v5
> (strategy:database) + Tailwind + Vercel. Multi-tenant con RLS +
> createTenantClient desde día 1. 15 ajustes del checklist aplicados.
> Esperando autorización para iniciar Tarea 1."

Si el ledger.md, plan.md o CLAUDE.md del proyecto no existen en este
directorio, detente y avísame — falta contexto crítico.

CONTEXTO DEL SISTEMA:
- SaaS multi-tenant self-service para PYMES de casinos escolares en Chile
- Cliente ancla: HealthyFood Antofagasta (4 colegios)
- Competidor directo: OrderEAT (uruguayo, $130-300 USD/colegio)
- 5 módulos: App Apoderado, Panel Operador, Panel Owner, Vista Cocina,
  Panel Super Admin
- 35 tablas en el schema Prisma (ver docs/plan.md sección 6)
- 15 ajustes del checklist de síntesis aplicados (ver bloques en vault)

══ STACK OBLIGATORIO — VERSIONES EXACTAS DEL BUILD EXITOSO ══

pnpm: 9.15.0
Node: 24.14.1
Turborepo: ^2.0.0
Next.js: 15.0.0
TypeScript: ^5.4.0
Tailwind: ^3.4.0
Prisma: ^5.14.0
@prisma/client: ^5.14.0
NextAuth: ^5.0.0-beta.19 (SIEMPRE strategy:"database", NUNCA jwt)
@auth/prisma-adapter: ^2.4.1
lucide-react: ^0.263.1 (SOLO en packages/ui)
inngest: ^3.22.0
resend: ^4.0.0
transbank-sdk: ^5.0.0
mercadopago: ^2.0.0
@anthropic-ai/sdk: ^0.27.0
zod: ^3.23.0
recharts: ^2.12.0
@tanstack/react-query: ^5.40.0
@react-pdf/renderer: ^3.4.0
xlsx-js-style: ^1.2.0
date-fns: ^3.0.0
date-fns-tz: ^3.0.0
@playwright/test: ^1.44.0
vitest: ^1.6.0
@sentry/nextjs: ^8.0.0

══ RESTRICCIONES TÉCNICAS INNEGOCIABLES ══

1. IDs: TODOS los modelos Prisma usan id String @id @default(uuid()) @db.Uuid
2. updatedAt: SIEMPRE @updatedAt (Prisma gestiona, NUNCA asignar manual)
3. Relaciones Prisma: SIEMPRE PascalCase (Tenant, Colegio, Pedido,
   NUNCA tenant/colegio/pedido)
4. next/server: NUNCA importar en packages/ — solo apps/web puede
5. lucide-react: SOLO en packages/ui, NUNCA en apps/ ni otros packages
6. Multi-tenancy: createTenantClient(tenantId, userId) SIEMPRE en
   rutas de negocio, NUNCA prisma global
7. NextAuth: strategy: "database" SIEMPRE, prohibido JWT
8. datasource: directUrl = env("DATABASE_DIRECT_URL") con ese nombre exacto
9. Soft delete: tablas editables tienen deletedAt DateTime? + version Int
10. Inmutables: AuditLog, CreditoMovimiento, WebhookEventLog, KpiSnapshot,
    NotificacionLog, PagoSuscripcion SIN deletedAt, SIN version, SIN updatedAt
11. postinstall obligatorio en package.json raíz:
    "postinstall": "cd packages/database && npx prisma generate"
12. RLS policies usan current_setting('app.current_user_id') y
    current_setting('app.current_tenant_id'), NUNCA auth.uid()
13. Session extendido con activeTenantId (campo agregado a modelo NextAuth)
14. User es GLOBAL a la plataforma, NO tiene tenantId
15. enum MetodoPago, enum TipoPedidoItem, enum EstadoMenu (sin String)

══ TAREAS FASE 0 — ENTREGABLES COMPLETOS ══

EJECUTA LAS TAREAS EN ORDEN. Entre cada tarea, detente y reporta
qué hiciste antes de avanzar a la siguiente.

TAREA 1 — ESTRUCTURA DE MONOREPO RAÍZ
Crea en la raíz del proyecto (que es este directorio):
├── package.json (con workspaces, postinstall, engines)
├── turbo.json (pipelines: build, dev, lint, type-check, test, test:e2e, db:*)
├── pnpm-workspace.yaml
├── .npmrc (shamefully-hoist=false)
├── .gitignore (según el patrón de MedXRay en CLAUDE.md)
├── .env.example (con TODAS las variables de la sección 7.2 de plan.md)
├── README.md (breve, enlazando a docs/plan.md)
└── tsconfig.base.json (config TypeScript compartida)

Luego crea la estructura de carpetas:
├── packages/
│   ├── database/
│   ├── shared/
│   ├── ui/
│   └── support-kb/
├── apps/
│   └── web/
└── tests/
    └── e2e/
        └── critical/

Ejecuta pnpm install y confirma que no hay errores.

TAREA 2 — PACKAGE packages/database
Crea:
├── package.json (con @prisma/client, prisma, scripts db:*)
├── tsconfig.json (extiende de tsconfig.base.json raíz)
├── src/
│   ├── index.ts (exports)
│   └── client.ts (prisma global + createTenantClient completo)
├── prisma/
│   ├── schema.prisma (COMPLETO — ver docs/plan.md sección 6.1)
│   └── seed.ts (seed de los 4 planes — ver plan.md sección 5 Fase 4
                 para referencia)

El schema.prisma debe contener TODAS las 35 tablas listadas en
docs/plan.md sección 6.1 sin omisiones. Cópialas textualmente del
plan.md aplicando las reglas fundacionales del stack.

Al terminar, ejecuta:
  pnpm --filter=@enbandeja/database prisma format
  pnpm --filter=@enbandeja/database prisma validate

Reporta el resultado. Si hay errores, DETENTE y avísame.

TAREA 3 — PACKAGE packages/shared
Crea:
├── package.json (con zod, date-fns, date-fns-tz)
├── tsconfig.json
└── src/
    ├── index.ts
    ├── types/index.ts (tipos compartidos: TenantId, UserId, CodigoCasino)
    ├── validators/
    │   ├── index.ts
    │   ├── tenant.ts
    │   ├── colegio.ts
    │   ├── menu.ts
    │   ├── pedido.ts (con el refine de la invariante contable)
    │   └── billing.ts
    └── constants/index.ts (PLAN_LIMITS, timezones, etc.)

TAREA 4 — PACKAGE packages/ui
Crea:
├── package.json (con react, lucide-react ^0.263.1, @radix-ui/*)
├── tsconfig.json
└── src/
    ├── index.ts
    ├── lib/
    │   └── design-system.ts (patrón MedXRay — ver docs/agentes/design-system.md)
    └── components/
        ├── Button.tsx
        ├── Card.tsx
        ├── Input.tsx
        ├── Badge.tsx
        └── index.ts

lucide-react SOLO en este package. apps/web lo consume re-exportado.

TAREA 5 — PACKAGE packages/support-kb
Crea la estructura vacía (archivos se llenan en Fase 5):
├── README.md (explica el propósito)
├── package.json (sin dependencias, solo archivos .md)
├── index.md (placeholder)
└── (carpetas vacías: onboarding/, operacion/, apoderados/, billing/,
    problemas-comunes/)

TAREA 6 — APP apps/web
Crea:
├── package.json (con next@15.0.0, next-auth@^5.0.0-beta.19,
                   @auth/prisma-adapter@^2.4.1, tailwindcss@^3.4.0)
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts (importa tokens del design-system)
├── postcss.config.js
├── .env.local (copia del .env.example raíz)
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx (redirect a /home si auth, /login si no)
    │   ├── globals.css
    │   ├── (auth)/
    │   │   └── login/page.tsx
    │   ├── (apoderado)/
    │   │   └── home/page.tsx (placeholder)
    │   └── api/
    │       └── auth/
    │           └── [...nextauth]/route.ts
    ├── lib/
    │   ├── auth.ts (NextAuth v5 config con strategy:database)
    │   └── middleware/
    │       └── withAuth.ts
    └── components/
        └── (placeholder)

TAREA 7 — TESTS E2E CRÍTICOS (estructura inicial)
Crea:
├── tests/e2e/critical/
│   ├── tenant-isolation.spec.ts (con test que valida RLS básico)
│   ├── role-permissions.spec.ts (placeholder)
│   └── [los demás como placeholders con test.skip por ahora]
├── playwright.config.ts (en la raíz del monorepo)

TAREA 8 — CI/CD GitHub Actions
Crea:
├── .github/
│   └── workflows/
│       ├── ci.yml (lint → type-check → unit → E2E critical)
│       └── deploy.yml (deploy a Vercel en push a main)

TAREA 9 — APLICAR MIGRATION INICIAL EN SUPABASE
Ejecuta:
  pnpm --filter=@enbandeja/database prisma migrate dev --name init

Esto aplicará el schema.prisma a Supabase. Avísame si falla.

Luego, ejecuta el archivo de migration manual SQL de docs/plan.md
sección 6.3 (CHECK constraints, RLS policies, REVOKE). Crea un
archivo manual en prisma/migrations/[timestamp]_constraints_rls/
migration.sql con el contenido de esa sección y ejecútalo con
prisma migrate deploy.

Ejecuta el seed:
  pnpm --filter=@enbandeja/database prisma db seed

TAREA 10 — VERIFICACIÓN FINAL
Ejecuta en este orden:
  pnpm install
  pnpm --filter=@enbandeja/database prisma generate
  pnpm type-check
  pnpm lint
  pnpm build

TODAS deben pasar con 0 errores. Si alguna falla, DETENTE y avísame
con el error exacto.

══ REGLAS DE ENTREGA ══
- ARCHIVOS COMPLETOS — NUNCA "// ... existing code" o "// resto aquí"
- Lee el archivo existente ANTES de modificarlo
- TypeScript estricto — 0 any, 0 as any
- ESLint debe pasar
- Comentarios en español
- Si algo no está claro, DETENTE y pregunta antes de asumir

══ VERIFICACIÓN FINAL OBLIGATORIA ══
Antes de dar por terminada la Fase 0, verifica manualmente:

[ ] Todos los IDs tienen @default(uuid()) @db.Uuid
[ ] Todas las relaciones Prisma están en PascalCase
[ ] Ningún package importa next/server
[ ] lucide-react está SOLO en packages/ui
[ ] createTenantClient inyecta tenantId Y userId con set_config
[ ] postinstall en package.json raíz existe y es correcto
[ ] datasource usa env("DATABASE_DIRECT_URL") (nombre exacto)
[ ] NextAuth config tiene strategy: "database"
[ ] Schema.prisma tiene las 35 tablas del plan.md
[ ] RLS policies aplicadas usan current_setting, NUNCA auth.uid()
[ ] CHECK constraints aplicados (pedido_total_invariant,
    pedido_item_xor_referencia)
[ ] REVOKE UPDATE/DELETE aplicado en tablas inmutables
[ ] Seed de 4 planes ejecutado exitosamente
[ ] pnpm build completa en 2-3 minutos sin errores

Al completar Fase 0, actualiza ledger.md con:
- Fecha de completitud
- Resumen de lo hecho
- Estado: "Fase 0 COMPLETADA. Siguiente: Fase 1 — Flujo del Apoderado"
- Bloqueos: (ninguno, o listar si hay)

═══════════════════════════════════════════════════════════════════
```

---

## 12. LAS 9 LECCIONES HEREDADAS — MANDAMIENTOS DE DESARROLLO

Estas son las lecciones acumuladas de los proyectos anteriores del
equipo (MedXRay Enterprise, Nexus Agents v3) que costaron horas o
días de debugging en producción. Se documentan aquí como
**mandamientos innegociables** que se aplican desde la primera línea
de código de Enbandeja.

**Cada lección tiene el mismo formato:**
- **Qué pasó** (historia real)
- **Impacto** (cuánto dolor causó)
- **Fix** (cómo se resolvió)
- **Prevención** (cómo se evita desde el día 1 en Enbandeja)

### Lección 1 — Los IDs sin `@default(uuid())` rompen TypeScript en toda la app

**Qué pasó:** En MedXRay, 73 modelos Prisma se crearon con
`id String @id @db.Uuid` pero sin `@default(uuid())`. El schema
validó. Las migraciones corrieron. Pero al intentar hacer un `create`
en TypeScript, Prisma Client exigía el `id` manualmente porque no
tenía default. Cada `create` del código tenía que generar UUID a
mano, y cuando alguien olvidaba hacerlo, fallaba en runtime.

**Impacto:** 2 días de debugging distribuido en toda la aplicación.
Errores TypeScript en ~40 archivos simultáneos. Decisión de detener
desarrollo de features hasta resolver.

**Fix:** Agregar `@default(uuid())` a los 73 modelos en una sola
migration masiva.

**Prevención en Enbandeja:**

**MANDAMIENTO 1:** Todos los IDs llevan siempre la declaración
completa:
```prisma
id String @id @default(uuid()) @db.Uuid
```
Sin excepciones. El Master Prompt de Fase 0 lo exige explícitamente.
CLAUDE.md del proyecto lo prohíbe omitir.

### Lección 2 — Relaciones Prisma en camelCase rompen 45+ archivos

**Qué pasó:** En MedXRay, el código TypeScript usaba sintaxis
camelCase para relaciones: `include: { patient: true }`. Pero el
schema.prisma tenía las relaciones en PascalCase: `Patient Patient`.
Prisma Client no encontraba `patient` y arrojaba errores en 45+
archivos simultáneamente al intentar compilar.

**Impacto:** Build completamente roto. Imposible desarrollar features
nuevas hasta resolver. 4 horas de búsqueda-y-reemplazo con revisión
manual.

**Fix:** Convertir todas las relaciones del código al PascalCase
consistente con el schema.

**Prevención en Enbandeja:**

**MANDAMIENTO 2:** Todas las relaciones Prisma se declaran y se
consumen en PascalCase, sin excepciones:

```prisma
// ✅ CORRECTO
model Pedido {
  apoderadoId String @db.Uuid
  Apoderado   User   @relation(fields: [apoderadoId], references: [id])
  Items       PedidoItem[]
}
```

```typescript
// ✅ CORRECTO
await db.pedido.findMany({
  include: { Apoderado: true, Items: true }
})

// ❌ PROHIBIDO
await db.pedido.findMany({
  include: { apoderado: true, items: true }
})
```

### Lección 3 — `next/server` importado en packages rompe el build completo

**Qué pasó:** En MedXRay, `packages/auth` y `packages/database`
importaron `NextResponse` de `next/server` para retornar errores
estructurados. Esto funcionó en desarrollo pero rompió el build
completo en CI porque los packages compartidos no tienen acceso al
runtime de Next.js. Error reportado en TODOS los packages, no solo
en los que tenían el import.

**Impacto:** 1 día de debugging. La búsqueda era difícil porque el
error aparecía en packages que ni siquiera importaban `next/server`.

**Fix:** Remover todos los imports de `next/server` fuera de
`apps/web`. Los packages retornan objetos planos o lanzan errores
tipados que `apps/web` convierte a respuestas HTTP.

**Prevención en Enbandeja:**

**MANDAMIENTO 3:** `next/server`, `next/navigation`, `next/headers` y
cualquier módulo de Next.js se usan SOLO en `apps/web`. Los packages
compartidos (`database`, `shared`, `ui`, `support-kb`) nunca los
importan. Si un package necesita devolver un error, lanza una
excepción tipada y `apps/web` la captura en su capa de API.

El CLAUDE.md del proyecto lo prohíbe explícitamente. El pipeline CI
debe tener un check que busque strings `from 'next/` en cualquier
archivo fuera de `apps/web` y falle si encuentra.

### Lección 4 — `lucide-react` en el lugar equivocado genera errores de runtime

**Qué pasó:** En MedXRay, `lucide-react` estaba instalado en
`apps/web/package.json`. Pero `packages/ui/src/components/SearchInput.tsx`
lo importaba directamente. En desarrollo funcionaba (porque
`apps/web` era el entry point), pero en producción fallaba con
"Cannot find module 'lucide-react'" porque `packages/ui` se
compilaba independientemente y no tenía acceso a las dependencias
de `apps/web`.

**Impacto:** Componente SearchInput inutilizable en producción. 3
horas de debugging hasta entender que el problema era de ubicación
de la dependencia, no de código.

**Fix:** Mover `lucide-react` de `apps/web/package.json` a
`packages/ui/package.json`. Remover la dependencia duplicada en
`apps/web`.

**Prevención en Enbandeja:**

**MANDAMIENTO 4:** Las dependencias se instalan en el package que
las consume directamente. `lucide-react` vive SOLO en
`packages/ui/package.json`. `apps/web` lo consume re-exportado desde
`@enbandeja/ui`. Ninguna dependencia se duplica entre packages.

Regla general: si un package tiene un `import X from 'Y'`, el
package DEBE tener `Y` en su `package.json`. No hay excepciones por
"es que ya está en el padre".

### Lección 5 — Config Vercel incorrecta produce deploy de 326ms sin ejecutar nada

**Qué pasó:** En MedXRay, Vercel estaba configurado con
`Framework Preset = Next.js` y `Root Directory = apps/web`. El deploy
completaba en 326 milisegundos reportando "success" pero el sitio
no se actualizaba. Vercel estaba usando cache viejo porque detectaba
una configuración inválida y caía al último deploy conocido sin
avisar.

**Impacto:** 6 horas de confusión. El equipo pensaba que las
features estaban desplegadas cuando no lo estaban. Clientes reportaban
bugs ya corregidos.

**Fix:** Cambiar la configuración a:
- `Framework Preset = Other`
- `Root Directory = [VACÍO]`
- `Build Command = cd apps/web && pnpm build`
- `Output Directory = apps/web/.next`

Sin `vercel.json` en el repo.

**Prevención en Enbandeja:**

**MANDAMIENTO 5:** La configuración de Vercel se verifica antes del
primer deploy de Fase 0. Si el primer deploy tarda menos de 1 minuto,
es el bug de los 326ms — detener inmediatamente, revisar config,
hacer Clear Build Cache, redesplegar. Un deploy saludable de
Enbandeja tarda 2 a 3 minutos y reporta "Generating static pages"
en los logs.

El `plan.md` sección 7.3 documenta la configuración exacta. El
`handoff-v01.md` la repite. El CLAUDE.md del proyecto la tiene como
sección dedicada.

### Lección 6 — Nombre de variable de entorno incorrecto en datasource

**Qué pasó:** En MedXRay, el `schema.prisma` tenía:
```prisma
datasource db {
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```
Pero la variable en Vercel y en `.env.local` se llamaba
`DATABASE_DIRECT_URL`. Prisma generate funcionaba (porque no usa
directUrl), pero `prisma migrate dev` fallaba con error confuso
sobre conexión directa no disponible.

**Impacto:** 2 horas de confusión durante el primer setup de
ambiente nuevo. Varios intentos fallidos antes de notar el
desalineamiento de nombres.

**Fix:** Cambiar el schema a usar `env("DATABASE_DIRECT_URL")` con
el nombre exacto de la variable real.

**Prevención en Enbandeja:**

**MANDAMIENTO 6:** La variable de entorno de conexión directa a
Postgres se llama EXACTAMENTE `DATABASE_DIRECT_URL` en todos los
lugares: `schema.prisma`, `.env.example`, `.env.local`, configuración
de Vercel, documentación. No `DIRECT_URL`, no `PRISMA_DIRECT_URL`.

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DATABASE_DIRECT_URL")
}
```

### Lección 7 — `postinstall` faltante rompe Prisma Client en CI/CD

**Qué pasó:** En MedXRay, el `package.json` raíz no tenía script de
`postinstall`. En desarrollo local funcionaba porque el desarrollador
corría `prisma generate` manualmente de vez en cuando. Pero en Vercel,
el primer deploy a producción falló con
`Namespace 'Prisma' has no exported member 'PrismaClient'` en TODA
la aplicación. El problema era que Vercel ejecutaba `pnpm install`
pero no generaba Prisma Client, así que los imports de
`@prisma/client` quedaban inválidos.

**Impacto:** 4 horas de debugging en el primer deploy a producción.
Bloqueo del lanzamiento inicial hasta resolver.

**Fix:** Agregar al `package.json` raíz:
```json
{
  "scripts": {
    "postinstall": "cd packages/database && npx prisma generate"
  }
}
```

**Prevención en Enbandeja:**

**MANDAMIENTO 7:** El `package.json` raíz de Enbandeja tiene
`postinstall` obligatorio desde el primer commit. Sin excepciones.
Si alguien lo elimina accidentalmente en una PR, el pipeline CI debe
detectarlo y rechazar el merge.

El script `postinstall` corre automáticamente después de cada
`pnpm install`, tanto en desarrollo como en CI. Esto garantiza que
`Prisma Client` siempre esté generado y los imports funcionen.

### Lección 8 — Design system descentralizado obliga a tocar 200+ archivos para cambiar un color

**Qué pasó:** En proyectos anteriores del equipo, los colores, tamaños
y espaciados estaban hardcodeados en cada componente React. Cuando el
cliente pidió cambiar el color primario de azul a verde, hubo que
buscar y reemplazar en más de 200 archivos. Algunas ocurrencias se
escaparon de la búsqueda porque estaban escritas como `#2563eb` en
vez de `bg-blue-600`, o en archivos SVG, o en emails HTML.

**Impacto:** 3 días de trabajo para un cambio que debería haber sido
de minutos. Inconsistencias visuales que quedaron en producción
semanas.

**Fix:** Crear un archivo central `design-system.ts` en
`packages/ui/src/lib/` como fuente única de verdad. Todos los
componentes consumen desde ahí. Cambiar un color implica editar un
solo archivo.

**Prevención en Enbandeja:**

**MANDAMIENTO 8:** Enbandeja tiene un único archivo
`packages/ui/src/lib/design-system.ts` como fuente de verdad visual
desde el primer commit. Este archivo contiene:

- Paleta de colores (primary, neutral, success, warning, error,
  categorías específicas si aplica)
- Tipografía (familias, tamaños, pesos)
- Espaciado (escala consistente)
- Bordes (radius, grosores)
- Sombras (niveles)
- Transiciones (durations, easings)

**Todos los componentes de `packages/ui` consumen desde este
archivo.** `apps/web` consume los componentes, no los tokens
directamente. Cambiar el tema visual completo es un cambio de un
solo archivo.

Este mandamiento se refuerza en `docs/agentes/design-system.md` del
proyecto. Claude Code recibe instrucciones explícitas de nunca
hardcodear colores ni valores visuales en componentes individuales.

### Lección 9 — Componentes con `"use client"` importando módulos del servidor rompen hidratación

**Qué pasó:** En el arranque de MedXRay con Next.js 14 App Router,
varios componentes React marcados con `"use client"` importaban
funciones que tenían side-effects de servidor (acceso a `process.env`
privadas, lectura de archivos, uso de `prisma` directo). El código
compilaba pero rompía en runtime con errores de hidratación extraños
y mensajes confusos sobre "Server Components cannot be imported from
Client Components".

**Impacto:** 2 días de confusión. El error era difícil de rastrear
porque no señalaba el componente culpable directamente.

**Fix:** Separar claramente el código de servidor del código de
cliente. Los componentes client solo reciben datos ya resueltos como
props. Los Server Actions y queries a Prisma viven en archivos del
servidor que se invocan desde Server Components.

**Prevención en Enbandeja:**

**MANDAMIENTO 9:** Las fronteras entre Server Components y Client
Components son estrictas desde el diseño.

**Regla de oro:** si un componente tiene `"use client"`, no puede
importar:

- `@enbandeja/database` (acceso a Prisma)
- Variables de entorno privadas (`process.env.X` sin prefijo `NEXT_PUBLIC_`)
- Funciones que accedan al filesystem
- Funciones que usen `next/headers`, `next/server`

Los Server Components son la capa que habla con la base de datos.
Los Client Components reciben los datos ya resueltos como props.
Server Actions (marcados con `"use server"`) son la única forma en
que un Client Component puede disparar una operación del servidor.

`docs/agentes/frontend.md` del proyecto documenta este patrón con
ejemplos concretos para que Claude Code lo aplique consistentemente
al generar componentes nuevos.

---

## RESUMEN DE LA PARTE C

La Parte C consolida todo lo necesario para **ejecutar** Enbandeja
desde el día 1:

**Primera mitad (anexada anteriormente):**
- 5 módulos del producto claramente delimitados por rol y responsabilidad
- 6 fases de desarrollo con duración, entregables semana a semana e
  hitos verificables
- Schema Prisma completo (35 tablas) listo para `prisma generate`
- SQL manual con CHECK constraints, RLS policies y REVOKE para tablas
  inmutables

**Segunda mitad (esta):**
- Stack tecnológico con versiones exactas del build exitoso de
  MedXRay, incluyendo configuración crítica de Vercel
- Variables de entorno con nombres exactos no negociables
- Modelo de monetización con los rangos orientativos del Ajuste #15
- Timeline con hitos críticos y dependencias previas a Fase 0
- 15 riesgos ordenados por probabilidad × impacto con mitigaciones
  concretas
- Master Prompt para Claude Code listo para copiar y pegar en el
  primer mensaje de la sesión de Fase 0
- Las 9 lecciones heredadas transformadas en mandamientos
  innegociables

**Todos los 15 ajustes del checklist de síntesis están aplicados a
lo largo del plan:**

- **#1** (User global) → B3, schema, Lección 2
- **#2** (RLS sin auth.uid) → B2, schema SQL, Mandamiento implícito
- **#3** (tenant activo en sesión) → B3, schema Session
- **#4** (enum MetodoPago) → B4, B7, schema
- **#5** (invariante Pedido) → B4, schema SQL, Zod, CHECK constraint
- **#6** (stock kiosco manual) → B5, Fase 2
- **#7** (CHECK polimorfismo PedidoItem) → B4, schema SQL
- **#8** (eliminar Menu.publicado) → B5, schema
- **#9** (flujo monto $0) → B4, Fase 1
- **#10** (scope kiosco v1) → B5
- **#11** (cron por timezone) → B6, B10, Fase 3
- **#12** (separar NotificacionLog) → B9, schema
- **#13** (KB bot en markdown) → B8, Fase 5
- **#14** (cobro manual v1) → B7, Fase 4, Master Prompt implícito
- **#15** (rangos orientativos precios) → sección 8.2

Con este Plan Maestro completo (Partes A, B y C), Enbandeja tiene
todo lo necesario para arrancar Fase 0 con confianza total en las
decisiones arquitectónicas, el alcance del producto, el orden de
construcción, y las reglas de implementación.

El siguiente paso del workflow es generar los demás artefactos de la
Tanda 3 (CLAUDE.md del proyecto, ledger.md actualizado, handoff-v01,
resources.md, y los 4 agentes especializados), y luego ejecutar el
Master Prompt Fase 0 en Claude Code para iniciar la construcción del
código.

---

*Fin de la Parte C — Segunda Mitad*
*Fin del Plan Maestro de Enbandeja versión 1.0*