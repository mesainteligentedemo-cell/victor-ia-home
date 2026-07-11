#!/usr/bin/env node
/*
 * MOTOR DE CONTENIDO DIARIO — Victor IA Blog v3.0 (editorial bone/ink/ultra)
 * Genera artículos y noticias con SEO + AEO + schema + link building + SVG por categoría + FAQs visibles.
 *
 * USO:
 *   node generar-v2.js articulo  <archivo-contenido.json>  [--date=YYYY-MM-DD]
 *   node generar-v2.js noticia   <archivo-contenido.json>  [--date=YYYY-MM-DD]
 *   node generar-v2.js all                                  (regenera todos los JSON de _motor-contenido)
 *
 * El JSON de contenido define: slug, title, desc, keywords, cover/coverReal, readTime,
 * category, displayCat, dateDisplay, tags, excerpt, resumen, faqs, body.
 *
 * v3.0:
 *  - Template editorial (paleta bone #efece3 / ink #191b1f / ultra #0066ff) vía /assets/blog-styles.css
 *  - Numeración automática 01/02/03 en h2 (CSS counter en blog-styles.css: .prose h2::before)
 *  - SVG temático REAL inline por categoría (public/assets/svg/), recoloreado a la paleta editorial
 *  - FAQs visibles en el body (además del schema FAQPage)
 *  - Artículos relacionados REALES por categoría (lee el índice de JSONs)
 */
const fs = require("fs");
const path = require("path");

const HOME = path.join(__dirname, "..");
const BLOG = path.join(HOME, "blog");
const SVGDIR = path.join(HOME, "public", "assets", "svg");
const BASE = "https://victor-ia.xyz";

function today() { return new Date().toISOString().slice(0, 10); }
const DATE = (process.argv.find(a => a.startsWith("--date=")) || "").replace("--date=", "") || today();

function esc(s) { return (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function jq(s) { return (s || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, " ").replace(/\s+/g, " ").trim(); }

// ── Categorías → SVG ────────────────────────────────────────────────────────
const CATEGORY_TO_SVG = {
  arquitectura: "svg-arquitectura.svg",
  ventas: "svg-ventas.svg",
  finanzas: "svg-finanzas.svg",
  operaciones: "svg-operaciones.svg",
  seguridad: "svg-seguridad.svg",
  industria: "svg-industria.svg",
  "automatización": "svg-automatización.svg",
  "transformación": "svg-transformación.svg",
  vtc: "svg-vtc.svg",
  "analítica": "svg-analítica.svg",
  noticias: "svg-arquitectura.svg",
};

// Recolorea el SVG (tema oscuro original) a la paleta editorial bone/ink/ultra
function recolorSvg(svg) {
  return svg
    .replace(/#EAE6DF/gi, "#191b1f")
    .replace(/#D8BC86/gi, "#3385ff")
    .replace(/#B89A6A/gi, "#0066ff")
    .replace(/#9A968F/gi, "#6d6f76")
    .replace(/rgba\(184,154,106,(\.?\d+)\)/g, "rgba(0,102,255,$1)")
    .replace(/--gold:#[0-9a-fA-F]{6}/g, "--gold:#0066ff")
    .replace(/--ink:#[0-9a-fA-F]{6}/g, "--ink:#191b1f")
    .replace(/--muted:#[0-9a-fA-F]{6}/g, "--muted:#6d6f76");
}

function svgForCategory(category) {
  const file = CATEGORY_TO_SVG[(category || "").toLowerCase()] || CATEGORY_TO_SVG.arquitectura;
  const p = path.join(SVGDIR, file);
  if (!fs.existsSync(p)) return "";
  const svg = recolorSvg(fs.readFileSync(p, "utf8"));
  return `\n<figure class="rv article-visual blog-svg" style="margin:2.5rem 0;padding:18px" role="group" aria-label="Diagrama de ${esc(category || "arquitectura")}">\n${svg}\n</figure>\n`;
}

// Si el body no trae ningún <svg>, inyecta el SVG de la categoría tras el primer párrafo
function ensureSvg(body, category) {
  if (/<svg[\s>]/i.test(body)) return body;
  const block = svgForCategory(category);
  if (!block) return body;
  const i = body.indexOf("</p>");
  if (i >= 0) return body.slice(0, i + 4) + block + body.slice(i + 4);
  return block + body;
}

// ── Pillars + fuentes para link building ────────────────────────────────────
const PILLARS = [
  ["/blog/que-son-agentes-ia", "¿Qué son los Agentes de IA y cómo trabajan en 2026?"],
  ["/blog/ia-pymes-mexico", "IA para PyMEs Mexicanas: cómo competir con las grandes"],
  ["/blog/implementar-ia-empresa-mexico", "Cómo Implementar IA en tu Empresa Mexicana en 90 Días"],
  ["/blog/roi-inteligencia-artificial", "ROI de la Inteligencia Artificial: cómo medir el retorno"],
  ["/agencia-ia-mexico", "Agencia de IA en México: servicios para tu empresa"],
];
const SOURCES = [
  ["INEGI — Indicadores económicos de México", "https://www.inegi.org.mx/"],
  ["CANIETI — Industria de Electrónica y TI", "https://www.canieti.org/"],
  ["McKinsey — The State of AI", "https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai"],
];

// ── Índice de artículos (para relacionados reales) ──────────────────────────
let _index = null;
function loadIndex() {
  if (_index) return _index;
  _index = [];
  for (const f of fs.readdirSync(__dirname)) {
    if (!f.endsWith(".json")) continue;
    try {
      const d = JSON.parse(fs.readFileSync(path.join(__dirname, f), "utf8"));
      if (d && d.slug && d.title) _index.push({ slug: d.slug, title: d.title, category: d.category || "", displayCat: d.displayCat || "" });
    } catch (e) { /* skip */ }
  }
  return _index;
}

function relatedArticles(slug, category) {
  const all = loadIndex().filter(a => a.slug !== slug && a.category === category);
  // orden estable pero variado: hash simple del slug
  const h = s => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  const picks = all.sort((a, b) => h(slug + a.slug) - h(slug + b.slug)).slice(0, 4);
  if (!picks.length) return "";
  const cards = picks.map(a => `      <a class="related-card" href="/blog/${a.slug}"><span class="cat">${esc(a.displayCat || a.category)}</span><span class="ttl">${esc(a.title)}</span></a>`).join("\n");
  return `
  <section class="viai-related rv">
    <h2>Artículos relacionados</h2>
    <div class="related-grid">
${cards}
    </div>
  </section>`;
}

// ── Key takeaways ───────────────────────────────────────────────────────────
function generateKeyTakeaways(body) {
  const paras = [...body.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)]
    .map(m => m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim())
    .filter(p => p.length > 80);
  return paras.slice(0, 5).map(p => {
    const first = p.split(/(?<=[.!?])\s/)[0] || p;
    return first.length > 170 ? first.slice(0, 167) + "..." : first;
  });
}

// ── Fecha ───────────────────────────────────────────────────────────────────
const MESES = { ENE: "01", FEB: "02", MAR: "03", ABR: "04", MAY: "05", JUN: "06", JUL: "07", AGO: "08", SEP: "09", SEPT: "09", OCT: "10", NOV: "11", DIC: "12" };
function isoFromDisplay(disp) {
  const m = /^(\d{1,2}) ([A-ZÁÉÍÓÚ]{3,4}) (\d{4})$/.exec((disp || "").trim());
  if (!m || !MESES[m[2]]) return null;
  return `${m[3]}-${MESES[m[2]]}-${m[1].padStart(2, "0")}`;
}
function displayFromIso(iso) {
  const inv = { "01": "ENE", "02": "FEB", "03": "MAR", "04": "ABR", "05": "MAY", "06": "JUN", "07": "JUL", "08": "AGO", "09": "SEP", "10": "OCT", "11": "NOV", "12": "DIC" };
  const [y, mo, d] = iso.split("-");
  return `${parseInt(d, 10)} ${inv[mo]} ${y}`;
}

function coverFor(c) {
  if (c.coverReal) return c.coverReal;
  if (fs.existsSync(path.join(BLOG, "covers", c.slug + ".webp"))) return `/blog/covers/${c.slug}.webp`;
  if (fs.existsSync(path.join(HOME, "img", "blog-covers", c.slug + ".png"))) return `/img/blog-covers/${c.slug}.png`;
  return c.cover || `/img/blog-covers/${c.slug}.png`;
}

// ── Head (meta + schema) ────────────────────────────────────────────────────
function metaHead(c, type) {
  const cover = coverFor(c);
  const img = cover.startsWith("http") ? cover : BASE + cover;
  const url = `${BASE}/blog/${c.slug}`;
  const published = c.datePublished || isoFromDisplay(c.dateDisplay) || DATE;
  const faqSchema = c.faqs && c.faqs.length ? `<script type="application/ld+json">{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
${c.faqs.map(f => `    {"@type": "Question", "name": "${jq(f.q)}", "acceptedAnswer": {"@type": "Answer", "text": "${jq(f.a)}"}}`).join(",\n")}
  ]
}</script>` : "";

  return `<!DOCTYPE html><html lang="es"><head>
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/><link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"/>
<meta charset="utf-8"/><meta content="width=device-width,initial-scale=1.0" name="viewport"/>
<title>${esc(c.title)} | Victor IA${type === "noticia" ? "" : " Blog"}</title>
<meta name="description" content="${esc(c.desc)}"/>
<link rel="canonical" href="${url}"/>
<meta name="robots" content="index, follow"/>
<meta http-equiv="content-language" content="es-MX"/>
<meta name="geo.region" content="MX"/>
<meta name="keywords" content="${esc(c.keywords || "")}"/>
<meta property="og:type" content="article"/>
<meta property="og:url" content="${url}"/>
<meta property="og:title" content="${esc(c.title)}"/>
<meta property="og:description" content="${esc(c.desc)}"/>
<meta property="og:image" content="${img}"/>
<meta property="og:locale" content="es_MX"/>
<meta property="og:site_name" content="Victor IA"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${esc(c.title)}"/>
<meta name="twitter:description" content="${esc(c.desc)}"/>
<meta name="twitter:image" content="${img}"/>
<script type="application/ld+json">{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "${jq(c.title)}",
  "description": "${jq(c.desc)}",
  "image": "${img}",
  "author": {"@type": "Organization", "name": "Victor IA", "url": "${BASE}"},
  "publisher": {"@type": "Organization", "name": "Victor IA", "logo": {"@type": "ImageObject", "url": "${BASE}/logo.png"}},
  "datePublished": "${published}",
  "dateModified": "${DATE}",
  "mainEntityOfPage": {"@type": "WebPage", "@id": "${url}"},
  "inLanguage": "es-MX",
  "isAccessibleForFree": true
}</script>
<script type="application/ld+json">{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "Inicio", "item": "${BASE}/"},
    {"@type": "ListItem", "position": 2, "name": "${type === "noticia" ? "Noticias de IA" : "Blog"}", "item": "${BASE}/blog"},
    {"@type": "ListItem", "position": 3, "name": "${jq(c.title)}", "item": "${url}"}
  ]
}</script>
${faqSchema}
<link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&family=Inter:wght@200;300;400;500&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/blog/blog-premium.css"/>
<link rel="stylesheet" href="/assets/blog-styles.css"/>
</head>
<body>
<header id="hdr"><div style="display:flex;justify-content:space-between;align-items:center;max-width:1100px;margin:0 auto;padding:0 24px;height:68px">
  <a href="/" style="font-family:'Cormorant Garamond',serif;font-size:21px;color:#191b1f;text-decoration:none">Victor <span style="color:#0066ff">IA</span></a>
  <nav style="display:flex;gap:28px;align-items:center"><a class="nav-a" href="/agentes">Agentes</a><a class="nav-a" href="/blog/">Blog</a><a class="btn-p" href="/agendar-videollamada">Empezar gratis</a></nav>
</div></header>
<main style="padding-top:110px;max-width:800px;margin:0 auto;padding-left:24px;padding-right:24px">`;
}

function linkBuilding() {
  const rel = PILLARS.slice(0, 4).map(([s, t]) => `        <li><a href="${s}">${esc(t)}</a></li>`).join("\n");
  const src = SOURCES.map(([l, u]) => `        <li><a href="${u}" target="_blank" rel="noopener noreferrer">${esc(l)} ↗</a></li>`).join("\n");
  return `
  <section class="viai-linkbuild rv">
    <div class="lb-grid">
      <div><h2>Sigue leyendo</h2><ul>\n${rel}\n      </ul></div>
      <div><h2>Fuentes y referencias</h2><ul>\n${src}\n      </ul></div>
    </div>
  </section>`;
}

function faqSection(faqs) {
  if (!faqs || !faqs.length) return "";
  const items = faqs.map(f => `    <h3>${esc(f.q)}</h3>\n    <p>${esc(f.a)}</p>`).join("\n");
  return `\n<section class="blog-section viai-faq">\n<h2>Preguntas frecuentes</h2>\n${items}\n</section>`;
}

function footer() {
  return `
  <section class="art-cta rv"><h2>¿Listo para llevar la IA a tu empresa?</h2><p>Agenda un diagnóstico gratuito.</p><a class="btn-p" href="/agendar-videollamada">Agendar diagnóstico →</a></section>
</main>
<footer class="site-foot">
  <p>© 2026 INFLUENCE IA S.A. DE C.V. — Todos los derechos reservados.</p>
</footer>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="/blog/blog-premium.js" defer></script>
<script src="/blog/blog-effects.js" defer></script>
<script src="/blog/article-reader.js" defer></script>
<script>(()=>{const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('on');io.unobserve(e.target)}}),{threshold:.08});document.querySelectorAll('.rv').forEach(el=>io.observe(el));const hdr=document.getElementById('hdr');addEventListener('scroll',()=>hdr.classList.toggle('scrolled',scrollY>40));})();</script>
</body></html>`;
}

// ── Artículo ────────────────────────────────────────────────────────────────
function buildArticulo(c) {
  const published = c.datePublished || isoFromDisplay(c.dateDisplay) || DATE;
  const dateDisp = c.dateDisplay || displayFromIso(published);
  const cat = c.displayCat || c.category || "IA para Empresas";
  const cover = coverFor(c);
  const body = ensureSvg(c.body, c.category);
  const resumen = (c.resumen && c.resumen.length ? c.resumen : generateKeyTakeaways(body)).slice(0, 5);
  const tags = (c.tags || []).slice(0, 5);

  const head = `
<header class="art-head rv">
<p class="art-meta"><span class="art-cat">${esc(cat)}</span><span class="art-dot">·</span><span>${String(c.readTime || 8).replace(/\D+$/, "").trim() || "8"} min lectura</span><span class="art-dot">·</span><span>${esc(dateDisp)}</span></p>
<h1 class="art-title">${esc(c.title)}</h1>
<p class="art-excerpt">${esc(c.excerpt || c.desc)}</p>
${tags.length ? `<div class="rv" style="display:flex;gap:10px;margin:18px 0 4px;flex-wrap:wrap">${tags.map(t => `<span class="tag">${esc(t)}</span>`).join("")}</div>` : ""}
</header>
<div class="art-cover rv"><img src="${cover}" alt="${esc(c.title)}" loading="eager"/></div>`;

  const resumoBloque = resumen.length ? `\n<div class="key-takeaways rv"><h4>Lo más importante</h4><ul>\n${resumen.map(p => `<li>${esc(p)}</li>`).join("\n")}\n</ul></div>` : "";
  const art = `\n<article class="prose">\n${body}${faqSection(c.faqs)}\n</article>`;

  return metaHead(c, "articulo") + head + resumoBloque + art + relatedArticles(c.slug, c.category) + linkBuilding() + footer();
}

// ── Noticia (JSON con {intro, news[], fuentes}) ─────────────────────────────
function buildNoticia(c) {
  const published = c.datePublished || isoFromDisplay(c.dateDisplay) || DATE;
  const dateDisp = c.dateDisplay || displayFromIso(published);
  const cover = coverFor(c);
  const head = `
<header class="art-head rv">
<p class="art-meta"><span class="art-cat">Noticias IA</span><span class="art-dot">·</span><span>${esc(dateDisp)}</span></p>
<h1 class="art-title">${esc(c.title)}</h1>
<p class="art-excerpt">${esc(c.intro || c.desc)}</p>
</header>
<div class="art-cover rv"><img src="${cover}" alt="${esc(c.title)}" loading="eager"/></div>`;
  const items = (c.news || []).map((n, i) => `<section class="blog-section"><h2>${esc(n.title)}</h2><p>${esc(n.text)}</p></section>`).join("\n");
  const fuentes = c.fuentes ? `<p style="font-size:12px;color:#6d6f76;margin-top:24px">Fuentes: ${esc(c.fuentes)}. Resumen editorial de Victor IA.</p>` : "";
  return metaHead(c, "noticia") + head + `\n<article class="prose">\n${items}\n${fuentes}\n</article>` + linkBuilding() + footer();
}

// ── Registro en sitemap + índice del blog ───────────────────────────────────
function registrar(c, type) {
  const sm = path.join(HOME, "sitemap.xml");
  let s = fs.readFileSync(sm, "utf8");
  if (!s.includes(`/blog/${c.slug}<`)) {
    const pri = type === "noticia" ? "0.8" : "0.7";
    const freq = type === "noticia" ? "daily" : "monthly";
    const e = `  <url>\n    <loc>${BASE}/blog/${c.slug}</loc>\n    <lastmod>${DATE}</lastmod>\n    <changefreq>${freq}</changefreq>\n    <priority>${pri}</priority>\n  </url>\n`;
    s = s.replace("</urlset>", e + "</urlset>");
    fs.writeFileSync(sm, s);
  }

  const idxP = path.join(BLOG, "index.html");
  let idx = fs.readFileSync(idxP, "utf8");
  if (!idx.includes(`href="${c.slug}.html"`) && !idx.includes(`href="/blog/${c.slug}"`)) {
    const tag = type === "noticia" ? "Noticias" : (c.displayCat || c.category || "Estrategia");
    const card = `      <div class="post-card rv"><a class="pc-link" href="/blog/${c.slug}">
        <p class="pc-meta"><span class="pc-cat">${esc(tag)}</span><span class="d">·</span><span>${DATE}</span></p>
        <h3 class="pc-title">${esc(c.title)}</h3>
        <p class="pc-desc">${esc(c.desc)}</p>
        <span class="pc-more">Leer artículo <svg width="14" height="10" viewBox="0 0 14 10" fill="none"><path d="M9 1l4 4-4 4M13 5H1" stroke="currentColor" stroke-width="1.4"/></svg></span>
      </a></div>`;
    const anchor = "\n    </div>\n  </section>\n\n  <!-- CTA FINAL -->";
    const ai = idx.indexOf(anchor);
    if (ai >= 0) { idx = idx.slice(0, ai) + "\n" + card + idx.slice(ai); fs.writeFileSync(idxP, idx); }
  }
}

// ── Build de un archivo ─────────────────────────────────────────────────────
function buildOne(mode, file) {
  const c = JSON.parse(fs.readFileSync(file, "utf8"));
  const html = mode === "noticia" || c.news ? buildNoticia(c) : buildArticulo(c);

  // Validar JSON-LD
  const re = /<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi;
  let m, bad = 0, n = 0;
  while ((m = re.exec(html))) { n++; try { JSON.parse(m[1].trim()); } catch (e) { bad++; console.error(`JSON-LD ROTO (${c.slug}):`, e.message.slice(0, 80)); } }
  if (bad) { console.error(`ABORTADO ${c.slug}: JSON-LD roto.`); return false; }

  fs.writeFileSync(path.join(BLOG, c.slug + ".html"), html, "utf8");
  registrar(c, c.news ? "noticia" : mode);
  console.log(`✓ ${c.slug}.html (${(html.length / 1024).toFixed(0)}kb, ${n} bloques JSON-LD OK, cat=${c.category || "?"})`);
  return true;
}

// ── Main ────────────────────────────────────────────────────────────────────
const mode = process.argv[2];
if (mode === "all") {
  let ok = 0, fail = 0;
  for (const f of fs.readdirSync(__dirname).filter(f => f.endsWith(".json")).sort()) {
    try {
      const d = JSON.parse(fs.readFileSync(path.join(__dirname, f), "utf8"));
      if (!d || !d.slug || !d.body && !d.news) continue;
      buildOne("articulo", path.join(__dirname, f)) ? ok++ : fail++;
    } catch (e) { console.error(`ERROR ${f}:`, e.message.slice(0, 100)); fail++; }
  }
  console.log(`\nRESUMEN: ${ok} generados, ${fail} fallidos.`);
  process.exit(fail ? 1 : 0);
}

const file = process.argv[3];
if (!mode || !file) { console.error("USO: node generar-v2.js [articulo|noticia|all] [contenido.json] [--date=YYYY-MM-DD]"); process.exit(1); }
process.exit(buildOne(mode, file) ? 0 : 1);
