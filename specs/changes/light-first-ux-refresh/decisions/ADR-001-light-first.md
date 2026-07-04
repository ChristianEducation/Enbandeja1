# ADR-001: Proponer light-first como nueva dirección visual

- Estado: Accepted
- Fecha: 2026-06-22
- Decisores: Christian Wevar, Cody
- Supersedes: Plan Maestro de Diseño v1.0 al ser aceptado

## Contexto

La auditoría de 31 pantallas mostró una interfaz consistente pero oscura,
densa y con textos secundarios de contraste justo. Christian solicitó
explorar una base blanca, más aireada y con tono educativo moderado.

## Decisión

Proponer un sistema light-first que conserve azul eléctrico, Plus Jakarta
Sans, Inter, escala de 8 px y eficiencia operativa. El estilo educativo será
claro y amable, no infantil.

## Alternativas consideradas

- Mantener dark-first y ajustar solo espaciado.
- Adoptar claymorphism educativo completo.
- Soportar light/dark con igual prioridad desde el primer bloque.

## Consecuencias positivas

- Mayor legibilidad y claridad.
- Mejor adaptación a apoderados y onboarding.
- Reducción de glass, sombras y anidación visual.

## Consecuencias negativas y riesgos

- Requiere bump formal del Plan Maestro.
- Puede introducir regresiones globales.
- Debe conservar densidad en superficies operativas.

## Evidencia

- Inventario visual en `inventario-visual/`.
- Spec `light-first-ux-refresh`.
