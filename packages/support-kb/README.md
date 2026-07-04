# @enbandeja/support-kb

Base de conocimientos para el bot de soporte WhatsApp con IA (Fase 5).

## Estructura

```
support-kb/
├── onboarding/          → Guías de registro y primer uso
├── operacion/           → Preguntas del operador y cocina
├── apoderados/          → Preguntas frecuentes de apoderados
├── billing/             → Planes, pagos, suscripciones
└── problemas-comunes/   → Troubleshooting general
```

## Uso

Los archivos `.md` de cada carpeta alimentan al bot de soporte
vía `@anthropic-ai/sdk`. El bot busca en estos documentos para
responder consultas de apoderados y operadores.

## Cuándo se llena

Esta estructura se completa en la **Fase 5** del proyecto.
Hasta entonces, las carpetas contienen solo placeholders.
