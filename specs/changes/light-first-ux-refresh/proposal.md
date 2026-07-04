# Proposal: Light-first UX Refresh

## Resumen

Evolucionar Enbandeja desde una interfaz dark-first, densa y basada en
liquid glass hacia una experiencia light-first, clara, aireada y accesible,
sin alterar la lógica de negocio ni convertir el producto en una aplicación
infantil.

El cambio combina:

1. correcciones funcionales detectadas durante el inventario visual;
2. consolidación del sistema de diseño;
3. un piloto visual en tres superficies representativas;
4. despliegue gradual al resto de las pantallas;
5. verificación completa de estados, responsive y accesibilidad.

## Contexto

La auditoría visual del 22 de junio de 2026 inventarió 31 rutas/pantallas.
Se detectaron siete superficies con mejoras relevantes, ocho que requieren
revisión y varias oportunidades sistémicas:

- fondo oscuro dominante y baja separación entre niveles;
- textos secundarios pequeños o con contraste justo;
- estados vacíos que informan poco y no siempre orientan al usuario;
- uso del color como señal principal en límites, métricas y estados;
- patrones repetidos que deberían vivir en componentes compartidos;
- una redirección rota en la ruta dinámica del menú;
- ausencia de fixtures para revisar Resumen y Confirmación en su estado real.

## Objetivos

- Adoptar un tema claro como experiencia predeterminada.
- Aumentar legibilidad, espacio útil y jerarquía visual.
- Mantener el azul eléctrico de Enbandeja como color principal.
- Dar un tono educativo moderado: amable y fácil de entender, no infantil.
- Conservar eficiencia y densidad adecuada en operador, cocina, owner y
  superadministración.
- Corregir hallazgos funcionales antes de extender el nuevo estilo.
- Centralizar tokens y componentes para evitar ajustes pantalla por pantalla.
- Lograr WCAG AA en contraste, foco, semántica e interacción esencial.
- Validar cada etapa con capturas comparativas y pruebas automatizadas.

## Alcance

### A. Correcciones y capacidad de prueba

- Corregir la redirección rota de `/menu/[fecha]`.
- Crear fixtures o preparación E2E para visualizar:
  - `/resumen` con selección/pedido temporal válido;
  - `/confirmacion` con pedido confirmado válido.
- Añadir cobertura de navegación para las rutas corregidas.

### B. Sistema visual light-first

- Actualizar la fuente de verdad visual:
  - `docs/PLAN_MAESTRO_DISEÑO.md`;
  - `docs/agentes/design-system.md`;
  - `packages/ui/src/lib/design-system.ts`;
  - `apps/web/tailwind.config.ts`.
- Definir tokens semánticos para tema claro y variante oscura opcional.
- Mantener Plus Jakarta Sans, Inter, JetBrains Mono y escala base de 8 px.
- Reducir liquid glass, glows y sombras profundas.
- Normalizar radios, bordes, elevación, estados y foco.

### C. Componentes compartidos

- Adaptar componentes base: Button, Input, Card y Badge.
- Incorporar patrones reutilizables:
  - EmptyState;
  - StatusBadge;
  - PlanLimit;
  - MetricCard;
  - SectionHeader;
  - FeedbackState para loading/error/success.

### D. Piloto visual

Aplicar y validar primero en:

1. Apoderado Home (`/home`);
2. Dashboard del operador (`/dia`);
3. Dashboard del owner (`/dashboard`).

Estas pantallas cubren mobile, operación diaria y administración.

### E. Extensión por familias

- Flujo apoderado.
- Operador y cocina.
- Owner y billing.
- Setup/onboarding.
- Super Admin.
- Auth.

### F. Calidad transversal

- Responsive en 375, 768, 1024 y 1440 px.
- Touch targets mínimos de 44 × 44 px.
- Foco visible y navegación por teclado.
- Contraste mínimo 4.5:1 para texto normal.
- Estados loading, vacío, error y feedback post-acción.
- `prefers-reduced-motion`.

## Fuera de alcance

- Cambios en reglas de negocio, precios o planes.
- Migraciones de base de datos.
- Sustitución de Next.js, Prisma, Tailwind o Turborepo.
- Rediseño del logo.
- Nueva aplicación móvil nativa.
- Nuevas funciones comerciales.
- Rediseño infantil, gamificación o uso de tipografías tipo cartoon.
- Reescritura total de las 31 pantallas en una sola entrega.
- Instalar una librería UI nueva salvo necesidad demostrada y aprobada.

## Dirección visual propuesta

**Educational clarity, operational precision.**

- Fondo general claro, blanco frío o gris muy tenue.
- Superficies blancas con bordes sutiles.
- Azul eléctrico actual como acción primaria y selección.
- Verde, ámbar y rojo/gris con texto o icono; nunca solo color.
- Más separación vertical y menos contenedores anidados.
- Cards con radio moderado de 12–16 px.
- Sombras mínimas; jerarquía principalmente por espacio, borde y fondo.
- Ilustración o recurso educativo solo cuando explique una tarea o estado.
- Paneles operativos más compactos que la experiencia del apoderado.

## Criterios de éxito

- Las tres pantallas piloto son aprobadas visualmente antes de ampliar alcance.
- Las 31 rutas tienen captura representativa o limitación explícita.
- Resumen y Confirmación pueden probarse con datos reproducibles.
- La ruta dinámica de menú no produce 404.
- Ningún texto esencial incumple WCAG AA.
- No hay colores visuales hardcodeados fuera del sistema autorizado.
- Las acciones táctiles principales cumplen 44 × 44 px.
- Los estados vacíos relevantes explican situación y siguiente acción.
- Build, lint, typecheck y pruebas críticas pasan.
- El inventario visual se regenera y permite comparación antes/después.

## Riesgos

- El cambio contradice el Plan Maestro v1.0, que exige dark-first.
- Un cambio global de tokens puede producir regresiones en 31 pantallas.
- Reducir contraste oscuro no garantiza automáticamente buen contraste claro.
- Las superficies operativas pueden perder densidad si se aplica demasiado aire.
- Resumen y Confirmación dependen de datos y estado transaccional.
- El despliegue masivo sin piloto dificultaría aislar errores.

## Estrategia de mitigación

- Bump documentado del Plan Maestro antes de modificar componentes.
- Piloto de tres pantallas con aprobación explícita.
- Tokens semánticos en vez de reemplazos masivos de clases.
- Migración por familias de rutas.
- Capturas desktop/mobile y pruebas de regresión por bloque.
- Feature flag o mecanismo temporal de tema solo si el cambio global no puede
  aislarse de forma segura.

