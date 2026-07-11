#!/usr/bin/env node
/**
 * Genera los 9 templates de SVG por categoría basándose en arquitectura.svg
 * Cada SVG tiene labels específicos para su dominio.
 */
const fs = require("fs");
const path = require("path");

const svgDir = path.join(__dirname, "..", "public", "assets", "svg");
if (!fs.existsSync(svgDir)) fs.mkdirSync(svgDir, { recursive: true });

// Mapeo de categorías a textos específicos (3 agentes + contexto)
const templates = {
  ventas: {
    router: "Enrutador de leads",
    agents: ["Prospección", "Seguimiento", "Cierre"],
    context: "CRM compartido",
  },
  finanzas: {
    router: "Orquestador fiscal",
    agents: ["Análisis", "Cálculo", "Auditoría"],
    context: "Libro mayor",
  },
  operaciones: {
    router: "Coordinador OPS",
    agents: ["Planificación", "Ejecución", "Control"],
    context: "Estado actual",
  },
  seguridad: {
    router: "Vigilancia",
    agents: ["Detección", "Análisis", "Respuesta"],
    context: "Eventos registrados",
  },
  industria: {
    router: "Supervisor",
    agents: ["Monitoreo", "Ajuste", "Reporte"],
    context: "Telemetría en vivo",
  },
  automatización: {
    router: "Scheduler",
    agents: ["Trigger", "Ejecución", "Validación"],
    context: "Log de tareas",
  },
  transformación: {
    router: "Orquestador",
    agents: ["Conversión", "Mapeo", "Entrega"],
    context: "Pipeline activo",
  },
  vtc: {
    router: "Gestor de sesiones",
    agents: ["Onboarding", "Coaching", "Evaluación"],
    context: "Progreso del alumno",
  },
  analítica: {
    router: "Motor BI",
    agents: ["Extracción", "Cálculo", "Visualización"],
    context: "Warehouse",
  },
};

function buildSvg(category, config) {
  // Y coords para 3 agentes espaciados
  const agentYs = [104, 182, 282];
  const agentTexts = config.agents.map((a, i) => `
  <g class="agent"><rect x="470" y="${agentYs[i]}" rx="8" width="150" height="48" fill="rgba(59,130,246,.08)" stroke="url(#gBlue)" stroke-width="1.2"/><text x="545" y="${agentYs[i] + 22}" text-anchor="middle" fill="#EAE6DF" font-size="12">${a}</text><text x="545" y="${agentYs[i] + 38}" text-anchor="middle" fill="#7E96C4" font-size="9.5">${i === 0 ? "rápido" : i === 1 ? "preciso" : "validado"}</text></g>`).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 440" width="100%"
     style="--gold:#B89A6A;--blue:#3B82F6;--ink:#EAE6DF;--muted:#9A968F;max-width:900px;font-family:Inter,sans-serif"
     role="img" aria-label="Diagrama: ${category}">
  <defs>
    <linearGradient id="gGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#D8BC86"/><stop offset="1" stop-color="#B89A6A"/></linearGradient>
    <linearGradient id="gBlue" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5B8DEF"/><stop offset="1" stop-color="#3B82F6"/></linearGradient>
    <filter id="soft" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <marker id="arrow" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#B89A6A"/></marker>
  </defs>
  <g class="node-in">
    <rect x="18" y="188" rx="10" width="132" height="64" fill="rgba(184,154,106,.08)" stroke="url(#gGold)" stroke-width="1.2"/>
    <text x="84" y="214" text-anchor="middle" fill="#EAE6DF" font-size="14" font-weight="500">Entrada</text>
    <text x="84" y="233" text-anchor="middle" fill="#9A968F" font-size="10.5">iniciar</text>
  </g>
  <path class="flow-in" d="M150 220 H300" fill="none" stroke="url(#gGold)" stroke-width="2.4" stroke-dasharray="150" stroke-dashoffset="150" marker-end="url(#arrow)"/>
  <g class="router" style="transform-box:fill-box;transform-origin:center">
    <polygon points="360,175 405,220 360,265 315,220" fill="rgba(184,154,106,.12)" stroke="url(#gGold)" stroke-width="1.6"/>
    <text x="360" y="216" text-anchor="middle" fill="#EAE6DF" font-size="11" font-weight="600">${config.router}</text>
    <text x="360" y="232" text-anchor="middle" fill="#B89A6A" font-size="9.5">${category}</text>
  </g>
  <path class="conn-agent" d="M400 205 H470" fill="none" stroke="rgba(184,154,106,.55)" stroke-width="1.6" stroke-dasharray="90" stroke-dashoffset="90"/>
  <path class="conn-agent" d="M395 220 H470" fill="none" stroke="rgba(184,154,106,.55)" stroke-width="1.6" stroke-dasharray="90" stroke-dashoffset="90"/>
  <path class="conn-agent" d="M400 235 C440 250 445 300 470 305" fill="none" stroke="rgba(184,154,106,.55)" stroke-width="1.6" stroke-dasharray="120" stroke-dashoffset="120"/>
  <path class="conn-agent" d="M400 200 C440 150 445 130 470 128" fill="none" stroke="rgba(184,154,106,.55)" stroke-width="1.6" stroke-dasharray="120" stroke-dashoffset="120"/>
  ${agentTexts}
  <g class="context" style="transform-box:fill-box;transform-origin:center">
    <ellipse cx="360" cy="352" rx="52" ry="12" fill="rgba(184,154,106,.14)" stroke="url(#gGold)" stroke-width="1.2"/>
    <path d="M308 352 V392 A52 12 0 0 0 412 392 V352" fill="rgba(184,154,106,.06)" stroke="url(#gGold)" stroke-width="1.2"/>
    <text x="360" y="382" text-anchor="middle" fill="#EAE6DF" font-size="10" font-weight="500">${config.context}</text>
    <text x="360" y="398" text-anchor="middle" fill="#B89A6A" font-size="9">compartido</text>
  </g>
  <path d="M360 265 V340" fill="none" stroke="rgba(184,154,106,.3)" stroke-width="1.2" stroke-dasharray="4 4"/>
  <path d="M470 320 C420 340 400 350 412 356" fill="none" stroke="rgba(184,154,106,.25)" stroke-width="1.2" stroke-dasharray="4 4"/>
  <path class="conn-qa" d="M620 128 C670 150 690 180 700 200" fill="none" stroke="rgba(216,188,134,.5)" stroke-width="1.6" stroke-dasharray="130" stroke-dashoffset="130"/>
  <path class="conn-qa" d="M620 206 H700" fill="none" stroke="rgba(216,188,134,.5)" stroke-width="1.6" stroke-dasharray="90" stroke-dashoffset="90"/>
  <path class="conn-qa" d="M620 306 C670 290 690 240 700 216" fill="none" stroke="rgba(216,188,134,.5)" stroke-width="1.6" stroke-dasharray="130" stroke-dashoffset="130"/>
  <g class="qa" style="transform-box:fill-box;transform-origin:center">
    <path d="M745 168 L790 182 V214 C790 240 770 252 745 262 C720 252 700 240 700 214 V182 Z" fill="rgba(184,154,106,.12)" stroke="url(#gGold)" stroke-width="1.5"/>
    <text x="745" y="208" text-anchor="middle" fill="#EAE6DF" font-size="13" font-weight="600">OK</text>
    <text x="745" y="224" text-anchor="middle" fill="#B89A6A" font-size="9">salida</text>
  </g>
  <path class="flow-out" d="M790 214 H862" fill="none" stroke="url(#gGold)" stroke-width="2.4" stroke-dasharray="80" stroke-dashoffset="80" marker-end="url(#arrow)"/>
  <text x="838" y="200" text-anchor="middle" fill="#9A968F" font-size="10">resultado</text>
</svg>`;
}

// Generar cada SVG
for (const [cat, config] of Object.entries(templates)) {
  const svg = buildSvg(cat, config);
  const filename = `svg-${cat}.svg`;
  const filepath = path.join(svgDir, filename);
  fs.writeFileSync(filepath, svg, "utf8");
  console.log(`✓ ${filename} (${svg.length} bytes)`);
}

console.log(`\n✓ 9 templates SVG creados en ${svgDir}`);
