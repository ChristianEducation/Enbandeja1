const fs = require("fs");
const path = require("path");
const capture = require("./capture-results.json");

const labels = {
  inicio: ["Inicio", "apps/web/src/app/page.tsx"],
  login: ["Inicio de sesión", "apps/web/src/app/(auth)/login/page.tsx"],
  registro: ["Registro", "apps/web/src/app/(auth)/registro/page.tsx"],
  "onboarding-codigo": ["Vinculación por código", "apps/web/src/app/(onboarding)/onboarding/codigo/page.tsx"],
  "onboarding-comensal": ["Selección de comensal", "apps/web/src/app/(onboarding)/onboarding/comensal/page.tsx"],
  "apoderado-home": ["Inicio del apoderado", "apps/web/src/app/(apoderado)/home/page.tsx"],
  "apoderado-resumen": ["Resumen del pedido", "apps/web/src/app/(apoderado)/resumen/page.tsx"],
  "apoderado-confirmacion": ["Confirmación del pedido", "apps/web/src/app/(apoderado)/confirmacion/page.tsx"],
  "apoderado-historial": ["Historial de pedidos", "apps/web/src/app/(apoderado)/historial/page.tsx"],
  "apoderado-perfil": ["Perfil del apoderado", "apps/web/src/app/(apoderado)/perfil/page.tsx"],
  "apoderado-credito": ["Crédito disponible", "apps/web/src/app/(apoderado)/perfil/credito/page.tsx"],
  "operador-dia": ["Dashboard del día", "apps/web/src/app/(operador)/dia/page.tsx"],
  "operador-kiosco": ["Gestión de kiosco", "apps/web/src/app/(operador)/kiosco/page.tsx"],
  "operador-menu": ["Calendario de menús", "apps/web/src/app/(operador)/menu/page.tsx"],
  "operador-menu-nuevo": ["Crear menú", "apps/web/src/app/(operador)/menu/nuevo/page.tsx"],
  "operador-menu-fecha": ["Detalle de menú por fecha", "apps/web/src/app/(operador)/menu/[fecha]/page.tsx"],
  cocina: ["Panel de cocina", "apps/web/src/app/(cocina)/cocina/page.tsx"],
  "owner-dashboard": ["Dashboard del owner", "apps/web/src/app/(owner)/dashboard/page.tsx"],
  "owner-empresa": ["Datos de empresa", "apps/web/src/app/(owner)/empresa/page.tsx"],
  "owner-colegios": ["Gestión de colegios", "apps/web/src/app/(owner)/colegios/page.tsx"],
  "owner-usuarios": ["Gestión de usuarios", "apps/web/src/app/(owner)/usuarios/page.tsx"],
  "owner-reportes": ["Reportes", "apps/web/src/app/(owner)/reportes/page.tsx"],
  "owner-billing": ["Suscripción y facturación", "apps/web/src/app/(owner)/billing/page.tsx"],
  "setup-empresa": ["Configuración: empresa", "apps/web/src/app/(setup)/setup/empresa/page.tsx"],
  "setup-colegio": ["Configuración: colegio", "apps/web/src/app/(setup)/setup/colegio/page.tsx"],
  "setup-pasarela": ["Configuración: pasarela", "apps/web/src/app/(setup)/setup/pasarela/page.tsx"],
  "setup-comensales": ["Configuración: comensales", "apps/web/src/app/(setup)/setup/comensales/page.tsx"],
  "setup-categorias": ["Configuración: categorías", "apps/web/src/app/(setup)/setup/categorias/page.tsx"],
  "setup-menu": ["Configuración: primer menú", "apps/web/src/app/(setup)/setup/menu/page.tsx"],
  "super-admin-tenants": ["Super Admin: tenants", "apps/web/src/app/(super-admin)/super-admin/tenants/page.tsx"],
  "super-admin-billing": ["Super Admin: facturación", "apps/web/src/app/(super-admin)/super-admin/tenants/[id]/billing/page.tsx"],
};

const findings = {
  inicio: ["Revisar", "La ruta raíz no tiene vista propia y redirige a /home. La captura representa el destino final.", "La redirección es coherente, pero conviene documentar la ruta raíz como router de entrada, no como pantalla."],
  login: ["Aprobada", "Sin mejoras necesarias por ahora.", "Sin mejoras necesarias por ahora."],
  registro: ["Aprobada", "Sin mejoras necesarias por ahora.", "Sin mejoras necesarias por ahora."],
  "onboarding-codigo": ["Aprobada", "Flujo enfocado, jerarquía clara y una única acción principal.", "Sin mejoras necesarias por ahora."],
  "onboarding-comensal": ["Revisar", "La pantalla queda demasiado vacía cuando no hay coincidencias. Añadir una explicación y siguiente acción visible.", "Consolidar el estado vacío en un componente reutilizable compartido con otras listas."],
  "apoderado-home": ["Mejorar", "El estado sin menú ocupa poco espacio útil y no orienta sobre cuándo volver o qué hacer. Añadir fecha próxima y ayuda contextual.", "Extraer el estado vacío repetido y evitar que inicio, resumen y confirmación terminen mostrando prácticamente la misma salida."],
  "apoderado-resumen": ["Revisar", "Sin un pedido activo redirige a /home, por lo que no fue posible validar visualmente el resumen real.", "Agregar un fixture E2E o estado de demostración para revisar este flujo sin depender del carrito del navegador."],
  "apoderado-confirmacion": ["Revisar", "Sin una transacción activa redirige a /home. La captura no representa la pantalla de confirmación real.", "Agregar prueba visual con pedido confirmado y parámetros válidos."],
  "apoderado-historial": ["Aprobada", "El estado vacío es claro y la navegación se mantiene consistente.", "Sin mejoras necesarias por ahora."],
  "apoderado-perfil": ["Aprobada", "Información agrupada de forma comprensible y acciones localizables.", "Sin mejoras necesarias por ahora."],
  "apoderado-credito": ["Aprobada", "Saldo y movimientos tienen jerarquía suficiente.", "Sin mejoras necesarias por ahora."],
  "operador-dia": ["Mejorar", "Las métricas y pestañas usan texto pequeño y contraste bajo. Priorizar indicadores principales y reforzar etiquetas.", "Separar métricas, filtros y estado vacío en componentes; revisar tamaños táctiles y semántica de pestañas."],
  "operador-kiosco": ["Revisar", "El estado vacío es correcto, pero la acción para comenzar no destaca lo suficiente.", "Reutilizar el patrón de empty state del resto de módulos administrativos."],
  "operador-menu": ["Mejorar", "El calendario tiene baja densidad informativa: no se distinguen con claridad días disponibles, publicados o sin menú.", "Modelar estados del calendario con un componente y tokens semánticos en lugar de estilos aislados."],
  "operador-menu-nuevo": ["Aprobada", "Formulario ordenado y acción principal clara.", "Vigilar el tamaño del componente; dividir por secciones si sigue creciendo."],
  "operador-menu-fecha": ["Mejorar", "La ruta termina en una página 404 al redirigir a /operador/menu/nuevo, ruta que no existe en este App Router.", "Corregir la redirección a /menu/nuevo?fecha=… y añadir una prueba E2E de la ruta dinámica."],
  cocina: ["Aprobada", "Vista simple y enfocada en el trabajo operativo.", "Sin mejoras necesarias por ahora."],
  "owner-dashboard": ["Revisar", "El dashboard vacío no explica cómo generar o cuándo aparecerán los datos.", "Crear un estado vacío con acción o explicación sobre snapshots KPI."],
  "owner-empresa": ["Aprobada", "Formulario legible, compacto y consistente.", "Sin mejoras necesarias por ahora."],
  "owner-colegios": ["Mejorar", "El aviso de límite compite visualmente con la lista. Diferenciar advertencia, estado y acción de upgrade.", "Extraer el aviso de límites de plan y compartirlo con usuarios y billing."],
  "owner-usuarios": ["Aprobada", "Listado escaneable y estados visibles.", "Sin mejoras necesarias por ahora."],
  "owner-reportes": ["Revisar", "El generador está claro, pero el estado vacío de reportes podría explicar tiempos y formatos disponibles.", "Separar formulario, historial y descarga en componentes con estados explícitos."],
  "owner-billing": ["Mejorar", "Las barras de límites dependen demasiado del color y muestran poca explicación contextual.", "Centralizar cálculo y presentación de límites para evitar duplicación con colegios y usuarios; añadir etiquetas accesibles."],
  "setup-empresa": ["Aprobada", "Paso claro, progresión visible y formulario enfocado.", "Sin mejoras necesarias por ahora."],
  "setup-colegio": ["Aprobada", "La jerarquía del primer colegio es clara.", "Sin mejoras necesarias por ahora."],
  "setup-pasarela": ["Revisar", "El bloque informativo es denso y el contraste del texto secundario es justo.", "Separar explicación, requisitos y acción de conexión en componentes semánticos."],
  "setup-comensales": ["Aprobada", "Importación bien enfocada y con acción principal reconocible.", "Sin mejoras necesarias por ahora."],
  "setup-categorias": ["Aprobada", "Selección compacta y progresión clara.", "Sin mejoras necesarias por ahora."],
  "setup-menu": ["Aprobada", "Paso final simple y comprensible.", "Sin mejoras necesarias por ahora."],
  "super-admin-tenants": ["Aprobada", "Tabla breve, estados visibles y navegación directa.", "Sin mejoras necesarias por ahora."],
  "super-admin-billing": ["Mejorar", "La información está bien agrupada, pero límites y acciones usan color como señal principal.", "Compartir componentes de billing con owner y reforzar permisos/pruebas de acciones administrativas."],
};

const items = capture.map((c) => {
  const [name, source] = labels[c.slug];
  const [state, ux, code] = findings[c.slug];
  const route = c.route || c.finalUrl.replace("http://127.0.0.1:3000", "");
  const observation = c.finalUrl.endsWith(route) ? "" : `Destino observado: ${c.finalUrl.replace("http://127.0.0.1:3000", "")}.`;
  return { ...c, name, source, state, ux, code, route, observation };
});

const esc = (s) => String(s || "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
const cards = items.map((x, i) => `
<article class="screen" id="${esc(x.slug)}" data-state="${esc(x.state)}" data-search="${esc(`${x.name} ${x.route} ${x.source}`.toLowerCase())}">
  <div class="screen-head"><div><span class="count">${String(i + 1).padStart(2, "0")}</span><h2>${esc(x.name)}</h2><code>${esc(x.route)}</code></div><span class="badge ${x.state.toLowerCase()}">${esc(x.state)}</span></div>
  <button class="shot" data-image="capturas/${esc(x.slug)}.png" aria-label="Ampliar captura de ${esc(x.name)}"><img src="capturas/${esc(x.slug)}.png" alt="Captura de ${esc(x.name)}" loading="lazy"></button>
  <div class="details">
    <section><h3>UI/UX</h3><p>${esc(x.ux)}</p></section>
    <section><h3>Código</h3><p>${esc(x.code)}</p></section>
    <section class="meta"><h3>Ubicación</h3><p><code>${esc(x.source)}</code></p>${x.observation ? `<p>${esc(x.observation)}</p>` : ""}</section>
  </div>
</article>`).join("");

const nav = items.map((x, i) => `<a href="#${esc(x.slug)}"><span>${String(i + 1).padStart(2, "0")}</span>${esc(x.name)}<i class="${x.state.toLowerCase()}"></i></a>`).join("");
const counts = ["Aprobada", "Revisar", "Mejorar"].map((s) => [s, items.filter((x) => x.state === s).length]);

const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Inventario visual · Enbandeja</title>
<style>
:root{color-scheme:dark;--bg:#090b12;--panel:#111521;--panel2:#171c2b;--line:#283047;--text:#eef2ff;--muted:#aeb7ce;--blue:#6785ff;--green:#44d19d;--amber:#f3b95f;--red:#ff7387}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--text);font:15px/1.55 Inter,ui-sans-serif,system-ui,sans-serif}.layout{display:grid;grid-template-columns:290px minmax(0,1fr);min-height:100vh}aside{position:sticky;top:0;height:100vh;overflow:auto;padding:24px 18px;border-right:1px solid var(--line);background:#0d1019}aside h1{font-size:18px;margin:0 8px 4px}aside>p{color:var(--muted);margin:0 8px 20px;font-size:13px}.search{width:100%;padding:11px 12px;border:1px solid var(--line);border-radius:10px;background:var(--panel);color:var(--text);margin-bottom:14px}.filters{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:18px}.filters button{border:1px solid var(--line);background:transparent;color:var(--muted);padding:6px 9px;border-radius:999px;cursor:pointer}.filters button.active{background:var(--blue);border-color:var(--blue);color:white}nav{display:grid;gap:2px}nav a{display:grid;grid-template-columns:26px 1fr 8px;gap:7px;align-items:center;padding:8px;border-radius:8px;color:var(--muted);text-decoration:none;font-size:12px}nav a:hover{background:var(--panel2);color:var(--text)}nav span{font-variant-numeric:tabular-nums;color:#667089}nav i{width:7px;height:7px;border-radius:50%}i.aprobada{background:var(--green)}i.revisar{background:var(--amber)}i.mejorar{background:var(--red)}main{padding:42px clamp(24px,5vw,72px);max-width:1500px}.hero{margin-bottom:44px}.hero h1{font-size:clamp(30px,4vw,54px);line-height:1.05;margin:0 0 12px;letter-spacing:-.035em}.hero p{max-width:70ch;color:var(--muted)}.summary{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}.summary span{padding:8px 12px;border-radius:999px;background:var(--panel);border:1px solid var(--line)}.screen{scroll-margin-top:24px;margin:0 0 42px;background:var(--panel);border:1px solid var(--line);border-radius:14px;overflow:hidden}.screen[hidden]{display:none}.screen-head{display:flex;justify-content:space-between;gap:20px;align-items:flex-start;padding:22px 24px}.screen-head>div{display:grid;grid-template-columns:auto 1fr;column-gap:12px}.count{grid-row:1/3;color:#68728a;font-size:12px;padding-top:4px}.screen h2{margin:0;font-size:21px}.screen code{color:var(--muted);font-size:12px}.badge{padding:6px 10px;border-radius:999px;font-size:12px;font-weight:700}.badge.aprobada{color:var(--green);background:#123127}.badge.revisar{color:var(--amber);background:#352916}.badge.mejorar{color:var(--red);background:#381b24}.shot{display:block;width:100%;border:0;border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:0;background:#06070b;cursor:zoom-in}.shot img{display:block;width:100%;max-height:760px;object-fit:contain}.details{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--line)}.details section{background:var(--panel);padding:20px 24px}.details .meta{grid-column:1/-1}.details h3{margin:0 0 7px;font-size:12px;color:#8995b0;text-transform:uppercase;letter-spacing:.08em}.details p{margin:0;color:#d6dcef}.details p+p{margin-top:8px;color:var(--muted)}dialog{width:min(96vw,1600px);max-width:none;padding:0;border:1px solid var(--line);background:#05060a;border-radius:12px}dialog::backdrop{background:rgba(0,0,0,.85)}dialog img{display:block;max-width:100%;max-height:94vh;margin:auto}dialog button{position:fixed;right:24px;top:20px;border:0;border-radius:999px;background:white;color:black;width:40px;height:40px;font-size:20px;cursor:pointer}@media(max-width:900px){.layout{display:block}aside{position:relative;height:auto;border-right:0;border-bottom:1px solid var(--line)}nav{display:none}main{padding:28px 16px}.details{grid-template-columns:1fr}.details .meta{grid-column:auto}.screen-head{padding:18px}.shot img{max-height:none}}
</style></head><body><div class="layout"><aside><h1>Enbandeja</h1><p>Inventario visual · 2 de junio de 2026</p><input class="search" id="search" placeholder="Buscar pantalla o ruta"><div class="filters"><button class="active" data-filter="Todas">Todas</button><button data-filter="Aprobada">Aprobadas</button><button data-filter="Revisar">Revisar</button><button data-filter="Mejorar">Mejorar</button></div><nav>${nav}</nav></aside><main><header class="hero"><h1>Inventario visual completo</h1><p>Revisión de las 31 pantallas detectadas en el App Router. Las capturas se realizaron contra la aplicación levantada localmente con perfiles temporales por rol. Las observaciones combinan comportamiento visible y lectura del código asociado.</p><div class="summary"><span><strong>${items.length}</strong> pantallas</span>${counts.map(([s,n])=>`<span><strong>${n}</strong> ${s.toLowerCase()}</span>`).join("")}</div></header>${cards}</main></div><dialog id="viewer"><button aria-label="Cerrar">×</button><img alt=""></dialog>
<script>
const screens=[...document.querySelectorAll('.screen')], search=document.querySelector('#search');let filter='Todas';
function apply(){const q=search.value.toLowerCase().trim();screens.forEach(x=>x.hidden=!((filter==='Todas'||x.dataset.state===filter)&&x.dataset.search.includes(q)))}
search.addEventListener('input',apply);document.querySelectorAll('.filters button').forEach(b=>b.onclick=()=>{document.querySelector('.filters .active').classList.remove('active');b.classList.add('active');filter=b.dataset.filter;apply()});
const dialog=document.querySelector('#viewer'), full=dialog.querySelector('img');document.querySelectorAll('.shot').forEach(b=>b.onclick=()=>{full.src=b.dataset.image;full.alt=b.querySelector('img').alt;dialog.showModal()});dialog.querySelector('button').onclick=()=>dialog.close();dialog.onclick=e=>{if(e.target===dialog)dialog.close()};
</script></body></html>`;

fs.writeFileSync(path.join(__dirname, "inventario-pantallas.html"), html);
console.log(`Reporte generado: ${items.length} pantallas`);
