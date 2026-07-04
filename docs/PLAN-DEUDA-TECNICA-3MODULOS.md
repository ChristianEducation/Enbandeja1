═══════════════════════════════════════════════════════════════════
ENBANDEJA — PLAN DE DEUDA TÉCNICA (3 MÓDULOS)
═══════════════════════════════════════════════════════════════════

> MÓDULO 1 = bloqueante (sin esto la demo no corre limpia).
> MÓDULO 2 = mejoras (no bloquea, opcional).
> MÓDULO 3 = configuración externa (tú, manual, al deployar).
> Ejecutar de a uno, verificar entre cada uno, igual que siempre.

───────────────────────────────────────────────────────────────────
GRAFO
───────────────────────────────────────────────────────────────────
 MÓDULO 1 (Bloqueante) → AHORA, antes de la demo
 ├──→ DEMO MANUAL
 MÓDULO 2 (Mejoras) → solo si la demo lo pide
 MÓDULO 3 (Config externa) → al deployar a Vercel
Solo el MÓDULO 1 es crítico.

═══════════════════════════════════════════════════════════════════
MÓDULO 1 — BLOQUEANTE (bugs + sincronización segura)
═══════════════════════════════════════════════════════════════════

PROMPT PARA OPENCLAW:
───────────────────────────────────────────────────────────────────
Vamos a cerrar la deuda técnica bloqueante de Enbandeja antes de
la demo. Trabaja secuencial, una tarea a la vez.

LECTURA OBLIGATORIA (en orden):
1. ledger.md
2. CLAUDE.md
3. docs/agentes/database.md
4. docs/agentes/backend.md

Confirma con el mensaje exacto del CLAUDE.md antes de empezar.

─── TAREA 1: Bug query muerta en cancelar-item ───
En apps/web/src/app/api/pedidos/cancelar-item/route.ts hay una query
sin sentido:
 where: { id: item.Pedido.tenantId ? undefined : undefined }
Siempre evalúa a undefined y trae un colegio que no se usa.
- Eliminar esa query muerta por completo.
- Verificar que el colegio correcto se obtiene vía comensalConColegio
 (ya existe más abajo en el mismo archivo).

─── TAREA 2: Bug colegioId en cierre-dia ───
En apps/web/src/app/api/menu/cerrar-dia/route.ts el endpoint exige
colegioId como UUID (Zod), pero el frontend puede no enviarlo.
- Si el tenant tiene UN solo colegio: usarlo automáticamente.
- Si tiene varios: responder error claro pidiendo seleccionar colegio.

─── TAREA 3: Reemplazar hack de tokenPago ───
El downgrade pendiente guarda el plan en tokenPago como
"PENDING_PLAN:<id>:<tipo>". Es un hack.
- Agregar a modelo Suscripcion en schema.prisma:
 pendingPlanId String?
 pendingPlanTipo String?
- Migrar la lógica de downgrade en: cron vencimientos-suscripcion,
 cambiar-plan de super-admin, cambiar-plan de owner (si existe).
- Limpiar todo uso de tokenPago como almacén de plan pendiente.

─── TAREA 4: Diagnóstico Supabase (SOLO LECTURA, no aplicar) ───
La base Supabase YA EXISTE con datos. NO hagas db push a ciegas.
Primero diagnostica qué falta:

 pnpm prisma migrate diff \
 --from-schema-datasource packages/database/prisma/schema.prisma \
 --to-schema-datamodel packages/database/prisma/schema.prisma \
 --script

Reporta exactamente:
- Qué tablas faltan en Supabase (si alguna)
- Qué columnas faltan (esperado: pendingPlanId, pendingPlanTipo,
 posibles cambios de ReporteExportacion)
- Qué índices/constraints faltan
- El SQL exacto que se aplicaría

DETENTE AQUÍ y muéstrame el diagnóstico. NO apliques nada.
Yo reviso el SQL y te autorizo a aplicar solo lo que falte.

AL TERMINAR tareas 1-3 + diagnóstico de la 4:
- Actualiza ledger.md (tareas 1-3 resueltas, tarea 4 diagnosticada)
- pnpm type-check + lint + build
- Reporta resultado + el diagnóstico de Supabase
- DETENTE. Espera autorización para aplicar el SQL.

═══════════════════════════════════════════════════════════════════
MÓDULO 2 — MEJORAS (no bloquea, opcional)
═══════════════════════════════════════════════════════════════════
Solo si la demo manual reveló que hacen falta.

PROMPT PARA OPENCLAW:
───────────────────────────────────────────────────────────────────
Mejoras de calidad en Enbandeja. Ninguna es crítica.

LECTURA OBLIGATORIA:
1. ledger.md
2. CLAUDE.md
3. docs/agentes/backend.md
Confirma con el mensaje exacto del CLAUDE.md.

─── TAREA 1: Email Resend para invitaciones ───
RESEND_API_KEY ya disponible. El token ya se genera, falta enviar
el email. Plantilla simple: comercio, link con token, expiración.

─── TAREA 2: Selector de colegio en cierre manual ───
Si el tenant tiene varios colegios, el operador elige cuál cerrar.
Agregar selector en la UI del dashboard operador.

─── TAREA 3: Validar fallback colegioId en cancelar-item ───
Hoy usa comensalConColegio?.Colegio?.id y cae a tenantId.
Decidir: si comensal no tiene colegio, ¿usar tenantId o fallar?
Dejar consistente y documentado.

─── TAREA 4: horaCorte real en historial ───
Hoy usa default "09:00" sin lookup. Mejorar con query batch
colegioId→horaCorte por pedido.

AL TERMINAR:
- Actualiza ledger.md
- pnpm type-check + lint + build
- Reporta resultado. DETENTE.

═══════════════════════════════════════════════════════════════════
MÓDULO 3 — CONFIGURACIÓN EXTERNA (tú, manual, al deployar)
═══════════════════════════════════════════════════════════════════
NO es código. Checklist para el deploy a Vercel.

Vercel → Environment Variables:
 [ ] DATABASE_URL + DIRECT_URL (Supabase)
 [ ] SUPABASE_SERVICE_ROLE_KEY (Storage)
 [ ] CRON_SECRET (string aleatorio, mismo en los 3 crons)
 [ ] PAYMENT_ENCRYPTION_KEY (cifrar credenciales pasarela)
 [ ] AUTH_SECRET (NextAuth)
 [ ] RESEND_API_KEY (emails)
 [ ] Google OAuth (client id + secret)

Supabase:
 [ ] Crear bucket "exportaciones" (privado, NO público)
 si OpenClaw no pudo por API en Módulo 1

3 crons que usan CRON_SECRET:
 - /api/cron/transiciones-menu (cada hora)
 - /api/cron/kpi-snapshot (cada hora)
 - /api/cron/vencimientos-suscripcion (diario)

───────────────────────────────────────────────────────────────────
NO TOCAR (decisiones diferidas correctas)
───────────────────────────────────────────────────────────────────
- Inngest async (síncrono funciona para pocos colegios)
- Realtime en cocina (auto-refresh 30s funciona)
- PDF nativo @react-pdf (HTML imprimible funciona)
- CategoriaKiosco crear/editar (asignar existente basta)
- Kit bienvenida PDF (no bloquea vender)
- Offset configurable copiar-semana (caso borde raro)
Tocar esto ahora sería sobre-ingeniería.

───────────────────────────────────────────────────────────────────
ORDEN
───────────────────────────────────────────────────────────────────
1. Módulo 1 → revisar diagnóstico → autorizar SQL → cerrar
2. Demo manual
3. Módulo 2 → solo si la demo lo pidió
4. Módulo 3 → al deployar
Solo el Módulo 1 es crítico ahora.
═══════════════════════════════════════════════════════════════════