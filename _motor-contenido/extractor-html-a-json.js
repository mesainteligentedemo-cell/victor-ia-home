#!/usr/bin/env node
/**
 * Extractor: HTML → JSON para el motor de contenido v2.0
 * Lee todos los HTMLs en blog/, extrae slug, title, desc, keywords, cover, readTime,
 * category, resumen, faqs, body y genera JSONs en _motor-contenido/
 */
const fs = require("fs");
const path = require("path");

const BLOG_DIR = path.join(__dirname, "..", "blog");
const MOTOR_DIR = __dirname;
const HOME = path.join(__dirname, "..");

// Catálogos de categorías por slug pattern
const CATEGORY_PATTERNS = {
  arquitectura: ["arquitectura", "multiagente", "orquestacion", "sistemas-", "devops", "pipeline"],
  ventas: ["venta", "prospectos", "lead", "b2b", "comercial", "cliente-24"],
  finanzas: ["financiero", "roi", "costo", "presupuesto", "impuesto", "fiscal", "factura", "contable"],
  operaciones: ["operacion", "automatizar", "proceso", "flujo", "workflow", "tarea"],
  seguridad: ["seguridad", "riesgo", "cumplimiento", "privacidad", "proteccion"],
  industria: ["hotel", "retail", "manufactur", "industria", "supply", "inventario"],
  automatización: ["automatizar", "rpa", "scheduler", "workflow", "n8n"],
  transformación: ["transformacion", "digital", "cambio", "migracion", "upgrade"],
  vtc: ["timeshare", "capacitacion", "entrenamiento", "vtc"],
  analítica: ["analitic", "dashboard", "kpi", "metrica", "reporte", "bi"],
};

function guessCategory(slug) {
  for (const [cat, patterns] of Object.entries(CATEGORY_PATTERNS)) {
    if (patterns.some(p => slug.includes(p))) return cat;
  }
  return "arquitectura"; // default
}

function extractFromHtml(filename, content) {
  const slug = filename.replace(/\.html$/, "");

  // Extract title from <title>
  const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
  const fullTitle = titleMatch ? titleMatch[1] : slug;
  const title = fullTitle.split("|")[0].trim(); // remove " | Victor IA Blog" etc

  // Extract description from meta name="description"
  const descMatch = content.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
  const desc = descMatch ? descMatch[1] : title;

  // Extract keywords
  const keywordsMatch = content.match(/<meta\s+name="keywords"\s+content="([^"]+)"/i);
  const keywords = keywordsMatch ? keywordsMatch[1] : slug.replace(/-/g, ", ");

  // Extract cover image
  let cover = null;
  const ogImageMatch = content.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
  if (ogImageMatch) {
    cover = ogImageMatch[1];
    if (cover.includes("/img/blog-covers/")) {
      // keep it as is
    } else if (cover.startsWith("http")) {
      // extract path
      cover = cover.split(".com").slice(1).join(".com") || `/img/blog-covers/${slug}.png`;
    }
  }
  if (!cover) cover = `/img/blog-covers/${slug}.png`;

  // Extract readTime if present in text
  let readTime = "8 min";
  const rtMatch = content.match(/(\d+)\s*min(?:uto)?s?[\s<]/i);
  if (rtMatch) readTime = rtMatch[1] + " min";

  // Extract category
  const category = guessCategory(slug);

  // Extract FAQPage schema
  const faqs = [];
  const faqMatch = content.match(/"@type"\s*:\s*"FAQPage"[^}]*?"mainEntity"\s*:\s*\[([\s\S]*?)\]/i);
  if (faqMatch) {
    const faqJson = '[' + faqMatch[1] + ']';
    try {
      const faqArray = JSON.parse(faqJson);
      faqArray.forEach(f => {
        if (f.name && f.acceptedAnswer && f.acceptedAnswer.text) {
          faqs.push({ q: f.name, a: f.acceptedAnswer.text });
        }
      });
    } catch (e) {
      // silently fail
    }
  }

  // Extract body: everything between <main> and </main>
  const mainMatch = content.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  let bodyHtml = mainMatch ? mainMatch[1] : content;

  // Clean up: remove header, footer, navigation
  bodyHtml = bodyHtml
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");

  // Extract key-takeaways if present (presionar / key-takeaways block)
  const resumoMatch = bodyHtml.match(/<div[^>]*class="[^"]*key-takeaways[^"]*"[^>]*>[\s\S]*?<ul>([\s\S]*?)<\/ul>/i);
  let resumen = [];
  if (resumoMatch) {
    const liMatches = resumoMatch[1].match(/<li[^>]*>([^<]+)<\/li>/gi);
    if (liMatches) {
      resumen = liMatches.map(li => li.replace(/<\/?li[^>]*>/gi, "").trim());
    }
  }

  // Trim body
  bodyHtml = bodyHtml.trim();

  // Auto-strip extremely long bodies (keep first ~15k chars of sensible HTML)
  if (bodyHtml.length > 20000) {
    bodyHtml = bodyHtml.substring(0, 15000) + "...";
  }

  return {
    slug,
    title,
    desc,
    keywords,
    cover,
    readTime,
    category,
    resumen: resumen.length > 0 ? resumen : [],
    faqs,
    body: bodyHtml,
  };
}

// ── Main ──────────────────────────────────────────────────────────────────

const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith(".html"));
console.log(`\n📄 Encontrados ${files.length} HTMLs en blog/\n`);

let success = 0, skip = 0, error = 0;

files.forEach((file, idx) => {
  // Skip files that already have a JSON or are special
  if (file === "index.html" || file === "article.html" || file === "blog-monitor.html") {
    skip++;
    return;
  }

  const slug = file.replace(/\.html$/, "");
  const jsonPath = path.join(MOTOR_DIR, slug + ".json");

  // Skip if JSON already exists
  if (fs.existsSync(jsonPath)) {
    skip++;
    return;
  }

  try {
    const content = fs.readFileSync(path.join(BLOG_DIR, file), "utf8");
    const data = extractFromHtml(file, content);

    // Write JSON
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), "utf8");
    success++;

    if ((success + error) % 20 === 0) {
      process.stdout.write(`  [${success + error}/${files.length - skip}]\n`);
    }
  } catch (e) {
    console.error(`✗ ERROR en ${file}: ${e.message.slice(0, 60)}`);
    error++;
  }
});

console.log(`
✓ EXTRACCIÓN COMPLETADA
  • Creados: ${success} JSONs nuevos
  • Saltados: ${skip} (sin cambios)
  • Errores: ${error}
  • Total en _motor-contenido/: ${fs.readdirSync(MOTOR_DIR).filter(f => f.endsWith(".json")).length} JSONs

Próximo paso: FASE 4 — Stage + Diff
  node generar-v2.js articulo archivo.json > blog-staging/
  Comparar samples antes de deploy.
`);