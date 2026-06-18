#!/usr/bin/env node
/*
 * MOTOR DE CONTENIDO DIARIO — Victor IA Blog
 * Genera artículos y noticias con SEO + AEO + schema + link building incorporados.
 *
 * USO:
 *   node generar.js articulo  <archivo-contenido.json>
 *   node generar.js noticia   <archivo-contenido.json>
 *
 * El JSON de contenido define título, slug, descripción y los bloques de texto.
 * El motor se encarga de: meta tags, Article+FAQPage+Breadcrumb schema,
 * bloque "En resumen", link building (Sigue leyendo + Fuentes), lector de voz,
 * y registrarlo en sitemap + índice del blog.
 */
const fs = require("fs");
const path = require("path");

const HOME = path.join(__dirname, "..");
const BLOG = path.join(HOME, "blog");
const BASE = "https://victor-ia.xyz";

// fecha del sistema pasada por arg --date=YYYY-MM-DD (para reproducibilidad), o hoy
function today() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}
const DATE = (process.argv.find(a => a.startsWith("--date=")) || "").replace("--date=", "") || today();

function esc(s) { return (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function jq(s) { return (s || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, " ").replace(/\s+/g, " ").trim(); }

// ── Pillars para link building ───────────────────────────────────────────────
const PILLARS = [
  ["que-son-agentes-ia", "¿Qué son los Agentes de IA y cómo trabajan en 2026?"],
  ["ia-pymes-mexico", "IA para PyMEs Mexicanas: cómo competir con las grandes"],
  ["implementar-ia-empresa-mexico", "Cómo Implementar IA en tu Empresa Mexicana en 90 Días"],
  ["roi-inteligencia-artificial", "ROI de la Inteligencia Artificial: cómo medir el retorno"],
  ["agencia-ia-mexico", "Agencia de IA en México: servicios para tu empresa"],
];
const SOURCES = [
  ["INEGI — Indicadores económicos de México", "https://www.inegi.org.mx/"],
  ["CANIETI — Industria de Electrónica y TI", "https://www.canieti.org/"],
  ["McKinsey — The State of AI", "https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai"],
];

function metaHead(c, type) {
  const img = c.cover || `${BASE}/img/blog-covers/${c.slug}.png`;
  const url = `${BASE}/blog/${c.slug}`;
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
  "datePublished": "${DATE}",
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
<link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500&family=Inter:wght@200;300;400;500&display=swap" rel="stylesheet"/>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:#070708;color:#EAE6DF;font-family:'Inter',sans-serif;font-weight:300;overflow-x:hidden}
@media(pointer:fine){*{cursor:auto!important}}
header{position:fixed;top:0;left:0;right:0;z-index:500;height:68px;border-bottom:1px solid transparent;transition:background .5s}
header.scrolled{background:rgba(7,7,8,.92);border-bottom-color:rgba(255,255,255,.06);backdrop-filter:blur(18px)}
.nav-a{color:#706C66;font-size:13px;letter-spacing:.07em;text-decoration:none;transition:color .3s}.nav-a:hover{color:#EAE6DF}
.btn-p{display:inline-flex;border-radius:5px;font-size:13px;letter-spacing:.09em;font-weight:500;background:#EAE6DF;color:#070708;padding:11px 26px;text-decoration:none}
.prose h2{font-family:'Cormorant Garamond',serif;font-size:30px;font-weight:300;color:#EAE6DF;margin:40px 0 16px}
.prose p,.prose li{font-size:16px;line-height:1.8;color:rgba(234,230,223,.78);margin-bottom:16px}
.prose ul,.prose ol{margin:0 0 20px 24px}
.prose a{color:#B89A6A}
.rv{opacity:0;transform:translateY(24px);transition:.7s cubic-bezier(.16,1,.3,1)}.rv.on{opacity:1;transform:none}
.key-takeaways{background:linear-gradient(135deg,rgba(184,154,106,.07),rgba(59,130,246,.03));border:1px solid rgba(184,154,106,.2);border-radius:12px;padding:26px 30px;margin:34px 0}
.key-takeaways h4{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#B89A6A;margin-bottom:14px}
.key-takeaways ul{list-style:none;margin:0}.key-takeaways li{padding:7px 0 7px 18px;position:relative;font-size:15px;line-height:1.6;color:rgba(234,230,223,.82)}
.key-takeaways li::before{content:'';position:absolute;left:0;top:14px;width:6px;height:6px;background:#B89A6A;border-radius:50%}
.news-item{border:1px solid rgba(184,154,106,.18);border-radius:14px;padding:26px;margin-bottom:22px;background:rgba(184,154,106,.02)}
.news-item .num{font-size:11px;letter-spacing:.14em;color:#B89A6A;text-transform:uppercase;margin-bottom:10px}
.news-item h3{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:400;color:#EAE6DF;margin-bottom:10px}
.news-item p{font-size:15px;line-height:1.75;color:rgba(234,230,223,.62)}
.lb-grid{display:grid;grid-template-columns:1fr 1fr;gap:40px;border-top:1px solid rgba(184,154,106,.16);padding-top:36px;margin-top:40px}
.lb-grid h2{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:300;color:#EAE6DF;margin-bottom:16px}
.lb-grid a{color:#B89A6A;text-decoration:none;font-size:14.5px;line-height:1.5}
@media(max-width:640px){.lb-grid{grid-template-columns:1fr;gap:26px}}
</style>
</head>
<body>
<header id="hdr"><div style="display:flex;justify-content:space-between;align-items:center;max-width:1100px;margin:0 auto;padding:0 24px;height:68px">
  <a href="/index.html" style="font-family:'Cormorant Garamond',serif;font-size:21px;color:#EAE6DF;text-decoration:none">Victor <span style="color:#B89A6A">IA</span></a>
  <nav style="display:flex;gap:28px;align-items:center"><a class="nav-a" href="/agentes.html">Agentes</a><a class="nav-a" href="/blog/index.html">Blog</a><a class="btn-p" href="/app.html">Empezar gratis</a></nav>
</div></header>
<main style="padding-top:110px;max-width:800px;margin:0 auto;padding-left:24px;padding-right:24px">`;
}

function linkBuilding() {
  const rel = PILLARS.slice(0, 4).map(([s, t]) => `        <li style="margin-bottom:10px"><a href="/blog/${s}">${esc(t)}</a></li>`).join("\n");
  const src = SOURCES.map(([l, u]) => `        <li style="margin-bottom:10px"><a href="${u}" target="_blank" rel="noopener noreferrer">${esc(l)} ↗</a></li>`).join("\n");
  return `
  <section class="viai-linkbuild rv">
    <div class="lb-grid">
      <div><h2>Sigue leyendo</h2><ul style="list-style:none;padding:0">\n${rel}\n      </ul></div>
      <div><h2>Fuentes y referencias</h2><ul style="list-style:none;padding:0">\n${src}\n      </ul></div>
    </div>
  </section>`;
}

function footer() {
  return `
  <section class="rv" style="text-align:center;padding:70px 0 40px;margin-top:40px;border-top:1px solid rgba(255,255,255,.06)">
    <h2 style="font-family:'Cormorant Garamond',serif;font-size:32px;font-weight:300;color:#EAE6DF;margin-bottom:14px">¿Listo para llevar la IA a tu empresa?</h2>
    <p style="color:rgba(234,230,223,.6);margin-bottom:24px">Agenda un diagnóstico gratuito.</p>
    <a class="btn-p" href="/app.html">Empezar gratis →</a>
  </section>
</main>
<footer style="background:#040406;border-top:1px solid rgba(255,255,255,.05);padding:48px 24px;text-align:center">
  <p style="font-size:10.5px;letter-spacing:.09em;color:rgba(112,108,102,.4)">© 2026 INFLUENCE IA S.A. DE C.V. — Todos los derechos reservados.</p>
</footer>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script>(()=>{const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('on');io.unobserve(e.target)}}),{threshold:.1});document.querySelectorAll('.rv').forEach(el=>io.observe(el));const hdr=document.getElementById('hdr');addEventListener('scroll',()=>hdr.classList.toggle('scrolled',scrollY>40));})();</script>
<script src="/blog/blog-effects.js" defer></script>
<script src="/blog/article-reader.js" defer></script>
</body></html>`;
}

function buildArticulo(c) {
  const img = `<img src="${c.cover || `/img/blog-covers/${c.slug}.png`}" alt="${esc(c.title)}" loading="lazy" style="width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:12px;margin-bottom:36px" class="rv"/>`;
  const resumen = c.resumen && c.resumen.length ? `<div class="key-takeaways rv"><h4>Lo más importante</h4><ul>\n${c.resumen.map(p => `<li>${esc(p)}</li>`).join("\n")}\n</ul></div>` : "";
  const meta = `<div class="rv" style="display:flex;gap:10px;font-size:12px;color:#706C66;margin-bottom:22px"><span>${DATE}</span><span>·</span><span>Victor IA</span><span>·</span><span>${c.readTime || "8 min"}</span></div>`;
  const h1 = `<h1 class="rv" style="font-family:'Cormorant Garamond',serif;font-size:clamp(32px,5vw,50px);font-weight:300;line-height:1.15;color:#EAE6DF;margin-bottom:24px">${esc(c.title)}</h1>`;
  const body = `<div class="prose rv">\n${c.body}\n</div>`;
  return metaHead(c, "articulo") + img + meta + h1 + resumen + body + linkBuilding() + footer();
}

function buildNoticia(c) {
  const img = `<img src="${c.cover || `/img/blog-covers/${c.slug}.png`}" alt="${esc(c.title)}" loading="lazy" style="width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:12px;margin-bottom:36px" class="rv"/>`;
  const meta = `<div class="rv" style="display:flex;gap:10px;font-size:12px;color:#706C66;margin-bottom:22px"><span style="color:#B89A6A">NOTICIAS IA</span><span>·</span><span>${DATE}</span></div>`;
  const h1 = `<h1 class="rv" style="font-family:'Cormorant Garamond',serif;font-size:clamp(30px,4.5vw,46px);font-weight:300;line-height:1.15;color:#EAE6DF;margin-bottom:20px">${esc(c.title)}</h1>`;
  const intro = `<p class="rv" style="font-size:18px;line-height:1.8;color:rgba(234,230,223,.75);margin-bottom:36px">${esc(c.intro)}</p>`;
  const items = c.news.map((n, i) => `<div class="news-item rv"><div class="num">Noticia 0${i + 1}</div><h3>${esc(n.title)}</h3><p>${esc(n.text)}</p></div>`).join("\n");
  const fuentes = c.fuentes ? `<p class="rv" style="font-size:12px;color:#706C66;margin-top:24px">Fuentes: ${esc(c.fuentes)}. Resumen editorial de Victor IA.</p>` : "";
  return metaHead(c, "noticia") + img + meta + h1 + intro + `<div class="prose">${items}${fuentes}</div>` + linkBuilding() + footer();
}

// ── Registrar en sitemap + índice ────────────────────────────────────────────
function registrar(c, type) {
  // sitemap
  const sm = path.join(HOME, "sitemap.xml");
  let s = fs.readFileSync(sm, "utf8");
  if (!s.includes(`/blog/${c.slug}<`)) {
    const pri = type === "noticia" ? "0.8" : "0.7";
    const freq = type === "noticia" ? "daily" : "monthly";
    const e = `  <url>\n    <loc>${BASE}/blog/${c.slug}</loc>\n    <lastmod>${DATE}</lastmod>\n    <changefreq>${freq}</changefreq>\n    <priority>${pri}</priority>\n  </url>\n`;
    s = s.replace("</urlset>", e + "</urlset>");
    fs.writeFileSync(sm, s);
  }
  // índice del blog
  const idxP = path.join(BLOG, "index.html");
  let idx = fs.readFileSync(idxP, "utf8");
  if (!idx.includes(`href="${c.slug}.html"`)) {
    const tag = type === "noticia" ? "Noticias" : "Estrategia";
    const card = `      <a href="${c.slug}.html" class="blog-card rv" style="text-decoration:none;display:block">
        <img src="/img/blog-covers/${c.slug}.png" alt="${esc(c.title)}" loading="lazy" style="width:100%;height:auto;aspect-ratio:16/9;object-fit:cover;border-radius:8px;display:block;margin-bottom:20px;">
        <h3 style="font-family:'Cormorant Garamond',serif;font-size:19px;font-weight:300;line-height:1.3;color:#EAE6DF;margin-bottom:10px;padding:0 4px">${esc(c.title)}</h3>
        <p style="font-size:13px;line-height:1.65;color:rgba(234,230,223,.45);margin-bottom:16px;padding:0 4px">${esc(c.desc)}</p>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:0 4px 4px"><span style="font-size:11px;color:#706C66">${DATE} &middot; ${tag}</span><span style="font-size:12px;color:#B89A6A">Leer &#8594;</span></div>
      </a>`;
    const anchor = "\n    </div>\n  </section>\n\n  <!-- CTA FINAL -->";
    const ai = idx.indexOf(anchor);
    if (ai >= 0) { idx = idx.slice(0, ai) + "\n" + card + idx.slice(ai); fs.writeFileSync(idxP, idx); }
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────
const mode = process.argv[2];
const file = process.argv[3];
if (!mode || !file) { console.error("USO: node generar.js [articulo|noticia] contenido.json [--date=YYYY-MM-DD]"); process.exit(1); }
const c = JSON.parse(fs.readFileSync(file, "utf8"));

let html;
if (mode === "articulo") html = buildArticulo(c);
else if (mode === "noticia") html = buildNoticia(c);
else { console.error("modo inválido:", mode); process.exit(1); }

// validar JSON-LD
const re = /<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi;
let m, bad = 0, n = 0;
while ((m = re.exec(html))) { n++; try { JSON.parse(m[1].trim()); } catch (e) { bad++; console.error("JSON-LD ROTO:", e.message.slice(0, 60)); } }
if (bad) { console.error("ABORTADO: hay JSON-LD roto. No se escribió el archivo."); process.exit(1); }

const out = path.join(BLOG, c.slug + ".html");
fs.writeFileSync(out, html, "utf8");
registrar(c, mode);
console.log(`✓ ${mode} creado: blog/${c.slug}.html (${html.length}b, JSON-LD ${n} bloques OK)`);
console.log(`  → registrado en sitemap + índice del blog`);
console.log(`  → FALTA: generar portada en victor-ia-website/img/blog-covers/${c.slug}.png y deploy`);
