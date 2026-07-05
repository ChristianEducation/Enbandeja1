# REPORTE PRE-ENTREGA - Gate D y cierre sprint pre-demo

## Estado

Gate D implementado en la rama `fix/pre-demo-sprint`.

No se incluyo el cambio local pendiente en `apps/web/src/app/(auth)/login/page.tsx`,
porque viene de la prueba movil previa y no pertenece al cierre del sprint.

## 1. Codigo corre

- [x] `PATH="$PWD/.local-bin:$PATH" pnpm --filter=@enbandeja/database type-check`: pasa.
- [x] `PATH="$PWD/.local-bin:$PATH" pnpm --filter=@enbandeja/database db:seed:demo`: pasa.
- [x] Segunda ejecucion de `db:seed:demo`: pasa, idempotente.
- [x] `PATH="$PWD/.local-bin:$PATH" pnpm type-check`: pasa.
- [x] `PATH="$PWD/.local-bin:$PATH" pnpm lint`: pasa con 2 warnings
      preexistentes por `<img>` en `PerfilClient.tsx`.
- [x] `PATH="$PWD/.local-bin:$PATH" pnpm build --filter=@enbandeja/web`:
      pasa; Next compila 49 rutas.
- [!] `PORT=3000 PATH="$PWD/.local-bin:$PATH" pnpm test:e2e:critical`:
      pendiente por entorno. El runner arranca, pero falta el binario
      Chromium de Playwright en `/data/.cache/ms-playwright/...`.

## 2. Flujo principal

- [x] Se agrego `packages/database/prisma/seed-demo-menu.ts`.
- [x] Se agrego script `db:seed:demo` en `@enbandeja/database`.
- [x] El seed crea/publica menus para lunes a viernes de la proxima semana.
- [x] El seed usa 2-3 opciones por dia, cocina chilena y precios demo.
- [x] El seed repara/crea el colegio demo `DEMO1` y categoria default si faltan.
- [x] El seed es idempotente: correrlo dos veces no duplica.

## 3. Estados de UI

- [x] Gate C ya agrego skeletons para las rutas clave de demo.
- [ ] Validacion visual de Home apoderado mostrando los menus demo:
      pendiente manual en navegador con sesion real.
- [ ] Calendario operador mostrando los 5 menus demo:
      pendiente manual en navegador con sesion real.

## 4. No rompiste nada

- [x] No se tocaron flujos de pago ni APIs fuera de Gate D.
- [x] No se introdujeron secretos.
- [x] No se agregaron dependencias nuevas.
- [x] No se incluyeron carpetas locales `.local-bin/` ni `.local-tools/`.
- [x] El cambio local de login queda fuera del commit de Gate D.

## 5. Otro humano lo entiende

- [x] El seed demo esta separado del seed base.
- [x] Los datos del menu estan declarados arriba del archivo.
- [x] La fecha de inicio se calcula como lunes de la proxima semana
      considerando el timezone del tenant.
- [x] El `ledger.md` registra cierre T01-T12 y pendientes reales.

## 6. Evidencia concreta

- `db:seed:demo` corrio dos veces sin error.
- Verificacion directa en DB:
  - menus publicados: 5
  - fechas: 2026-07-06 a 2026-07-10
  - opciones por dia: 2, 2, 3, 2, 3
  - precios creados/asociados: 12
- Verificacion tecnica:
  - `pnpm type-check`: OK.
  - `pnpm lint`: OK con warnings preexistentes.
  - `pnpm build --filter=@enbandeja/web`: OK.
- `pnpm test:e2e:critical`: no validable en este entorno sin instalar
  browsers de Playwright. Error exacto: `Executable doesn't exist at
  /data/.cache/ms-playwright/chromium_headless_shell-1223/...`.

## Pendiente

- Instalar browsers de Playwright y reejecutar `PORT=3000 pnpm test:e2e:critical`.
- Probar Home apoderado y calendario operador con sesion real.
- Rotar password de Supabase expuesta durante la configuracion previa.
- Ensayo manual de demo y flujo Webpay real.

## Estado real

Gate D terminado a nivel de codigo, datos demo y build. Sprint T01-T12
cerrado salvo validaciones manuales/E2E bloqueado por entorno Playwright.
