# Design: Light-first UX Refresh

## 1. Decisiones

### 1.1 Light-first, dark-compatible

El tema claro pasa a ser el predeterminado. El tema oscuro podrá conservarse
como variante, pero no condicionará la composición principal.

No se hará una inversión mecánica de colores. Cada par
foreground/background se validará por contraste y función semántica.

### 1.2 Educativo sobrio

La recomendación automática de UI UX Pro Max para una app educativa fue
claymorphism, Baloo/Comic Neue y colores neón. Se rechaza porque Enbandeja no
es una aplicación infantil: es una plataforma de alimentación escolar usada
por apoderados, cocina, operadores y administradores.

Se adopta únicamente la intención útil:

- lenguaje amable;
- instrucciones claras;
- estados vacíos que enseñan;
- progresión visible;
- acciones fáciles de reconocer.

Se conserva la personalidad actual:

- Plus Jakarta Sans para títulos y cifras;
- Inter para texto e información operativa;
- azul eléctrico como marca;
- iconografía Lucide consistente.

### 1.3 Jerarquía por espacio, no por efectos

Se sustituye el glass como material universal por:

- fondo de aplicación neutro;
- superficies blancas;
- borde de 1 px;
- sombra pequeña solo cuando indique elevación;
- radio máximo habitual de 16 px.

No se permiten cards dentro de cards salvo necesidad estructural comprobable.

### 1.4 Densidad por rol

- Apoderado y onboarding: densidad cómoda, guía y lenguaje cercano.
- Operador y cocina: densidad media/alta, lectura rápida y acciones grandes.
- Owner y Super Admin: densidad media, tablas y métricas escaneables.

El sistema comparte tokens, pero no obliga a que todas las pantallas tengan
la misma densidad.

## 2. Tokens propuestos

Los valores exactos se validarán durante el piloto; la intención semántica es
obligatoria.

```text
background            gris frío muy claro
surface               blanco
surface-subtle        gris azulado tenue
foreground            navy casi negro
foreground-secondary  gris azulado con contraste AA
border                gris azulado visible
primary               #3B5BFE
primary-hover         azul ligeramente más oscuro
success               verde accesible
warning               ámbar accesible
destructive           rojo accesible
focus-ring            azul primary con separación visible
```

Reglas:

- tokens semánticos, no colores por pantalla;
- estados no dependen solo del color;
- body mínimo 16 px en móvil;
- captions menores solo para información no esencial;
- radios habituales 8/12/16 px;
- sombras con blur reducido;
- transición base 150–250 ms;
- reduced motion obligatorio.

## 3. Arquitectura de componentes

### Componentes existentes a adaptar

- `packages/ui/src/components/Button.tsx`
- `packages/ui/src/components/Input.tsx`
- `packages/ui/src/components/Card.tsx`
- `packages/ui/src/components/Badge.tsx`
- `packages/ui/src/components/BentoCardMenu.tsx`
- `packages/ui/src/components/CalendarioExpansible.tsx`
- `packages/ui/src/components/DrawerKiosko.tsx`

### Componentes propuestos

#### EmptyState

Props mínimas:

- icon;
- title;
- description;
- primaryAction opcional;
- secondaryAction opcional.

Uso: home sin menú, historial, kiosco, dashboard sin KPI, reportes.

#### StatusBadge

Combina:

- color semántico;
- icono opcional;
- texto;
- contraste validado.

Uso: pedido, menú, suscripción, tenant, invitación.

#### PlanLimit

Presenta:

- uso actual;
- límite;
- porcentaje;
- texto equivalente;
- estado warning/critical;
- acción de cambio de plan cuando corresponde.

Uso: colegios, usuarios, owner billing y Super Admin billing.

#### MetricCard

Presenta:

- nombre;
- valor;
- contexto temporal;
- estado/tendencia opcional;
- loading/empty/error.

Uso: dashboard operador y owner.

#### SectionHeader

Normaliza:

- título;
- descripción;
- acción primaria;
- acción secundaria;
- responsive.

#### FeedbackState

Patrón común para:

- skeleton;
- error recuperable;
- success;
- retry.

## 4. Flujo de implementación

```text
correcciones funcionales
        ↓
documentación visual v2
        ↓
tokens + componentes base
        ↓
piloto: home / día / dashboard
        ↓
aprobación visual
        ↓
migración por familias
        ↓
auditoría + inventario comparativo
```

## 5. Piloto

### 5.1 Apoderado Home

Objetivos:

- menú y fecha con jerarquía clara;
- estado sin menú que explique cuándo volver;
- navegación inferior accesible;
- comensales y acción principal visibles;
- layout mobile-first.

### 5.2 Dashboard del operador

Objetivos:

- métricas legibles sin depender del color;
- pestañas semánticas y navegables por teclado;
- filtros claros;
- estado vacío accionable;
- densidad operativa preservada.

### 5.3 Dashboard del owner

Objetivos:

- contexto del rango temporal;
- estado vacío de KPI explicativo;
- drill-down comprensible;
- tarjetas y gráficos accesibles;
- sidebar clara y compacta.

## 6. Mejoras específicas del inventario

### Corregir

- `/menu/[fecha]`: redirección inválida a `/operador/menu/nuevo`.

### Mejorar

- Apoderado Home: estado sin menú y sin comensales.
- Dashboard operador: legibilidad, métricas, tabs y contraste.
- Calendario de menús: estados distinguibles y leyenda.
- Colegios: separar límite de plan, listado y upgrade.
- Billing owner: límites con texto/icono y componente común.
- Billing Super Admin: reutilización y accesibilidad de acciones.

### Revisar con datos válidos

- Resumen del pedido.
- Confirmación del pedido.
- Dashboard owner sin/con snapshots.
- Reportes sin/con exportaciones.
- Kiosco sin/con productos.

## 7. Archivos previstos

### Documentación

- `docs/PLAN_MAESTRO_DISEÑO.md`
- `docs/agentes/design-system.md`
- `ledger.md`
- handoff nuevo en `docs/`

### Sistema visual

- `packages/ui/src/lib/design-system.ts`
- `packages/ui/src/components/index.ts`
- componentes existentes y nuevos en `packages/ui/src/components/`
- `apps/web/tailwind.config.ts`
- `apps/web/src/app/globals.css`

### Piloto y extensión

- layouts de apoderado, operador, owner, setup y super-admin;
- componentes cliente de las pantallas listadas en proposal;
- páginas afectadas solo cuando el ajuste no pueda resolverse desde layouts
  o componentes compartidos.

### Pruebas

- `tests/e2e/critical/`
- fixtures/helpers E2E nuevos si son necesarios;
- inventario visual existente como herramienta de regresión.

## 8. Límites técnicos

- No introducir `any`.
- Mantener Server Components y Client Components separados.
- No consultar Prisma desde componentes cliente.
- No duplicar tokens en Tailwind y TypeScript sin una estrategia de
  sincronización explícita.
- No usar valores hex ad hoc en páginas.
- No incorporar dependencias nuevas sin aprobación.
- No romper rutas ni permisos por rol.

## 9. Verificación

Por cada bloque:

1. typecheck;
2. lint;
3. pruebas unitarias o de componente aplicables;
4. E2E de rutas críticas;
5. capturas desktop y mobile;
6. revisión visual contra criterios de aceptación;
7. contraste y navegación por teclado;
8. revisión del diff antes de continuar.

## 10. Riesgos abiertos para aprobación

- Confirmar si dark mode se conserva desde la primera entrega o se posterga
  hasta completar light mode.
- Confirmar paleta final a partir del piloto, no de la recomendación automática
  de la skill.
- Confirmar si el cambio visual se despliega por feature flag o por familias
  de rutas.

