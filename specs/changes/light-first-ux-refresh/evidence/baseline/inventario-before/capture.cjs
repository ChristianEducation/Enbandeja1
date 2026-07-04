const { chromium } = require("@playwright/test");
const { PrismaClient } = require("../packages/database/node_modules/@prisma/client");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const prisma = new PrismaClient();
const output = path.join(__dirname, "capturas");
fs.mkdirSync(output, { recursive: true });

const routes = [
  ["inicio", "/", "APODERADO"],
  ["login", "/login", "PUBLIC"],
  ["registro", "/registro", "PUBLIC"],
  ["onboarding-codigo", "/onboarding/codigo", "APODERADO"],
  ["onboarding-comensal", "/onboarding/comensal", "APODERADO"],
  ["apoderado-home", "/home", "APODERADO"],
  ["apoderado-resumen", "/resumen", "APODERADO"],
  ["apoderado-confirmacion", "/confirmacion", "APODERADO"],
  ["apoderado-historial", "/historial", "APODERADO"],
  ["apoderado-perfil", "/perfil", "APODERADO"],
  ["apoderado-credito", "/perfil/credito", "APODERADO"],
  ["operador-dia", "/dia", "OPERADOR"],
  ["operador-kiosco", "/kiosco", "OPERADOR"],
  ["operador-menu", "/menu", "OPERADOR"],
  ["operador-menu-nuevo", "/menu/nuevo", "OPERADOR"],
  ["operador-menu-fecha", `/menu/${new Date().toISOString().slice(0, 10)}`, "OPERADOR"],
  ["cocina", "/cocina", "COCINA"],
  ["owner-dashboard", "/dashboard", "OWNER"],
  ["owner-empresa", "/empresa", "OWNER"],
  ["owner-colegios", "/colegios", "OWNER"],
  ["owner-usuarios", "/usuarios", "OWNER"],
  ["owner-reportes", "/reportes", "OWNER"],
  ["owner-billing", "/billing", "OWNER"],
  ["setup-empresa", "/setup/empresa", "OWNER", "empresa"],
  ["setup-colegio", "/setup/colegio", "OWNER", "colegio"],
  ["setup-pasarela", "/setup/pasarela", "OWNER", "pasarela"],
  ["setup-comensales", "/setup/comensales", "OWNER", "comensales"],
  ["setup-categorias", "/setup/categorias", "OWNER", "categorias"],
  ["setup-menu", "/setup/menu", "OWNER", "menu"],
  ["super-admin-tenants", "/super-admin/tenants", "SUPER"],
  ["super-admin-billing", "", "SUPER"],
];

async function main() {
  const tenant = await prisma.tenant.findFirst({ where: { deletedAt: null } });
  if (!tenant) throw new Error("No hay tenant disponible para la auditoría");
  const colegio = await prisma.colegio.findFirst({ where: { tenantId: tenant.id, deletedAt: null } });
  routes[routes.length - 1][1] = `/super-admin/tenants/${tenant.id}/billing`;

  const progress = await prisma.onboardingProgress.findUnique({ where: { tenantId: tenant.id } });
  const originalProgress = progress ? { ...progress } : null;
  const auditTag = `visual-audit-${Date.now()}`;
  const sessions = {};
  const createdUserIds = [];
  let superEmail = "";

  try {
    for (const role of ["APODERADO", "OPERADOR", "COCINA", "OWNER"]) {
      const email = `${auditTag}-${role.toLowerCase()}@example.invalid`;
      const user = await prisma.user.create({
        data: { email, name: `Auditoría ${role}`, emailVerified: new Date() },
      });
      createdUserIds.push(user.id);
      await prisma.userTenant.create({
        data: { userId: user.id, tenantId: tenant.id, colegioId: colegio?.id || null, role },
      });
      const token = crypto.randomBytes(32).toString("hex");
      await prisma.session.create({
        data: { sessionToken: token, userId: user.id, activeTenantId: tenant.id, expires: new Date(Date.now() + 3600000) },
      });
      sessions[role] = token;
    }

    superEmail = `${auditTag}-super@example.invalid`;
    const superUser = await prisma.user.create({
      data: { email: superEmail, name: "Auditoría Super Admin", emailVerified: new Date() },
    });
    createdUserIds.push(superUser.id);
    const superToken = crypto.randomBytes(32).toString("hex");
    await prisma.session.create({
      data: { sessionToken: superToken, userId: superUser.id, expires: new Date(Date.now() + 3600000) },
    });
    await prisma.superAdmin.create({
      data: { email: superEmail, name: "Auditoría Super Admin", passwordHash: "temporary", totpSecret: "temporary" },
    });
    sessions.SUPER = superToken;

    const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox"] });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    const results = [];

    for (const [slug, route, role, setupStep] of routes) {
      if (setupStep) await setProgress(tenant.id, setupStep);
      await context.clearCookies();
      if (role !== "PUBLIC") {
        await context.addCookies([{ name: "authjs.session-token", value: sessions[role], domain: "127.0.0.1", path: "/", httpOnly: true, sameSite: "Lax" }]);
      }
      const errors = [];
      const onConsole = (msg) => { if (msg.type() === "error") errors.push(msg.text().slice(0, 240)); };
      page.on("console", onConsole);
      let status = 0;
      try {
        const response = await page.goto(`http://127.0.0.1:3000${route}`, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.waitForTimeout(1200);
        status = response?.status() || 0;
        await page.screenshot({ path: path.join(output, `${slug}.png`), fullPage: true });
        results.push({ slug, route, role, status, finalUrl: page.url(), title: await page.title(), errors });
      } catch (error) {
        results.push({ slug, route, role, status, finalUrl: page.url(), title: "", errors: [...errors, error.message] });
      } finally {
        page.off("console", onConsole);
      }
    }
    await browser.close();
    fs.writeFileSync(path.join(__dirname, "capture-results.json"), JSON.stringify(results, null, 2));
  } finally {
    if (superEmail) await prisma.superAdmin.deleteMany({ where: { email: superEmail } });
    if (createdUserIds.length) {
      await prisma.session.deleteMany({ where: { userId: { in: createdUserIds } } });
      await prisma.userTenant.deleteMany({ where: { userId: { in: createdUserIds } } });
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    }
    if (originalProgress) {
      const { id, createdAt, updatedAt, ...data } = originalProgress;
      await prisma.onboardingProgress.upsert({ where: { tenantId: tenant.id }, update: data, create: data });
    } else {
      await prisma.onboardingProgress.deleteMany({ where: { tenantId: tenant.id } });
    }
    await prisma.$disconnect();
  }
}

async function setProgress(tenantId, step) {
  const states = {
    empresa: { datosEmpresa: false, primerColegio: false, conectoMercadoPago: false, comensalesCargados: false, categoriasPrecios: false },
    colegio: { datosEmpresa: true, primerColegio: false, conectoMercadoPago: false, comensalesCargados: false, categoriasPrecios: false },
    pasarela: { datosEmpresa: true, primerColegio: true, conectoMercadoPago: false, comensalesCargados: false, categoriasPrecios: false },
    comensales: { datosEmpresa: true, primerColegio: true, conectoMercadoPago: true, comensalesCargados: false, categoriasPrecios: false },
    categorias: { datosEmpresa: true, primerColegio: true, conectoMercadoPago: true, comensalesCargados: true, categoriasPrecios: false },
    menu: { datosEmpresa: true, primerColegio: true, conectoMercadoPago: true, comensalesCargados: true, categoriasPrecios: true },
  };
  await prisma.onboardingProgress.upsert({
    where: { tenantId },
    update: states[step],
    create: { tenantId, ...states[step] },
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
