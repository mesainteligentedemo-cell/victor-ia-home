// Genera el HTML de impresión premium de la Guía → se convierte a PDF con Edge headless
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

// Cuerpo real del artículo (ya extraído, limpio de figuras/scripts)
let body = fs.readFileSync(path.join(ROOT, 'scripts/_guiabody.html'), 'utf8');
// quitar el <article ...> wrapper y dejar el contenido
body = body.replace(/<article[^>]*>/, '').replace(/<\/article>/, '');
// quitar key-takeaways duplicado del inicio si existe (lo recolocamos), data-attrs de lectura
body = body.replace(/\sclass="vp-w"/g, '').replace(/<span>/g, '').replace(/<\/span>/g, '');

const HTML = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">
<style>
@page{size:A4;margin:0}
*{margin:0;padding:0;box-sizing:border-box}
:root{--gold:#B89A6A;--gold2:#CDB28C;--ink:#0a0a0d;--cream:#EAE6DF}
body{font-family:Georgia,'Times New Roman',serif;color:#1a1a1a;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{width:210mm;min-height:297mm;padding:26mm 24mm;position:relative;page-break-after:always;overflow:hidden}
.page:last-child{page-break-after:auto}

/* ── PORTADA ── */
.cover{background:radial-gradient(120% 80% at 75% 18%,rgba(184,154,106,.16),transparent 55%),linear-gradient(160deg,#0d0d12 0%,#070708 70%);
  color:var(--cream);display:flex;flex-direction:column;padding:34mm 26mm}
.cover-top{font-size:12px;letter-spacing:.34em;text-transform:uppercase;color:var(--gold)}
.cover-rule{width:46px;height:1px;background:var(--gold);margin:14px 0 auto}
.cover h1{font-size:58px;font-weight:300;line-height:1.05;letter-spacing:-.01em;margin-bottom:18px}
.cover h1 em{font-style:italic;color:var(--gold)}
.cover .sub{font-size:16px;line-height:1.7;color:rgba(234,230,223,.62);max-width:130mm;font-family:'Helvetica Neue',Arial,sans-serif;font-weight:300}
.cover-foot{margin-top:auto;display:flex;justify-content:space-between;align-items:flex-end;
  border-top:1px solid rgba(184,154,106,.3);padding-top:18px}
.cover-brand{font-size:26px}.cover-brand b{color:var(--gold);font-weight:400}
.cover-meta{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:rgba(234,230,223,.45);text-align:right;font-family:'Helvetica Neue',Arial,sans-serif}
.cover-badges{display:flex;gap:10px;margin:26px 0 0}
.cover-badge{font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;letter-spacing:.12em;text-transform:uppercase;
  color:var(--gold2);border:1px solid rgba(184,154,106,.4);border-radius:100px;padding:6px 14px}

/* ── ÍNDICE ── */
.toc h2{font-size:13px;letter-spacing:.22em;text-transform:uppercase;color:var(--gold);font-family:'Helvetica Neue',Arial,sans-serif;margin-bottom:30px;font-weight:600}
.toc-item{display:flex;align-items:baseline;gap:14px;padding:15px 0;border-bottom:1px solid #eee}
.toc-n{font-size:22px;color:var(--gold);width:36px;flex-shrink:0}
.toc-t{font-size:18px;color:#1a1a1a;font-weight:400}

/* ── CONTENIDO ── */
.content h2{font-size:30px;font-weight:400;color:#111;line-height:1.15;margin:34px 0 14px;padding-top:8px;border-top:2px solid var(--gold)}
.content h2:first-child{margin-top:0}
.content h3{font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--gold);margin:24px 0 10px}
.content p{font-size:13.5px;line-height:1.85;color:#333;margin-bottom:14px;font-family:'Helvetica Neue',Arial,sans-serif;font-weight:300}
.content ul{margin:0 0 16px 20px}.content li{font-size:13px;line-height:1.7;color:#444;margin-bottom:7px;font-family:'Helvetica Neue',Arial,sans-serif;font-weight:300}
.content blockquote{border-left:3px solid var(--gold);padding:6px 0 6px 20px;margin:20px 0;font-size:17px;font-style:italic;color:#555;line-height:1.5}
.content strong{color:#111;font-weight:600}
.content .key-takeaways{background:linear-gradient(135deg,rgba(184,154,106,.1),rgba(184,154,106,.03));border:1px solid rgba(184,154,106,.3);border-radius:10px;padding:22px 26px;margin:22px 0}
.content .key-takeaways h4{font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);margin-bottom:12px;font-weight:700}
.content .key-takeaways ul{list-style:none;margin:0}.content .key-takeaways li{padding-left:18px;position:relative}
.content .key-takeaways li:before{content:'—';position:absolute;left:0;color:var(--gold)}
.content .data-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:18px 0}
.content .data-card{border:1px solid rgba(184,154,106,.25);border-radius:8px;padding:16px 18px;background:#fafafa}
.content .data-card .metric{font-size:30px;color:var(--gold);line-height:1;margin-bottom:5px}
.content .data-card .metric-label{font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:#888;margin-bottom:6px}
.content .data-card .metric-desc{font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;color:#666;line-height:1.5}
.content table{width:100%;border-collapse:collapse;margin:18px 0;font-family:'Helvetica Neue',Arial,sans-serif}
.content th{font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--gold);text-align:left;padding:8px 12px;border-bottom:2px solid rgba(184,154,106,.3)}
.content td{font-size:11.5px;color:#444;padding:9px 12px;border-bottom:1px solid #eee}
.pagefoot{position:absolute;bottom:14mm;left:24mm;right:24mm;display:flex;justify-content:space-between;
  font-family:'Helvetica Neue',Arial,sans-serif;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:#bbb;border-top:1px solid #eee;padding-top:8px}

/* ── CONTRAPORTADA ── */
.back{background:linear-gradient(160deg,#0d0d12,#070708);color:var(--cream);display:flex;flex-direction:column;justify-content:center;padding:34mm 26mm;text-align:center}
.back h2{font-size:40px;font-weight:300;line-height:1.15;margin-bottom:18px}
.back h2 em{font-style:italic;color:var(--gold)}
.back p{font-size:15px;line-height:1.7;color:rgba(234,230,223,.6);max-width:120mm;margin:0 auto 30px;font-family:'Helvetica Neue',Arial,sans-serif;font-weight:300}
.back .cta{display:inline-block;background:var(--gold);color:#070708;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;padding:16px 36px;border-radius:8px;text-decoration:none}
.back .url{margin-top:auto;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;letter-spacing:.16em;color:var(--gold)}
</style></head><body>

<!-- PORTADA -->
<div class="page cover">
  <div class="cover-top">Victor IA · Guía Ejecutiva</div>
  <div class="cover-rule"></div>
  <h1>La Guía Definitiva de <em>Inteligencia Artificial</em> para Empresas</h1>
  <div class="sub">Todo lo que un líder en México necesita para implementar IA con resultados medibles: qué es, cuánto cuesta, qué retorno esperar y cómo dar el primer paso sin riesgo.</div>
  <div class="cover-badges">
    <span class="cover-badge">Edición 2026</span>
    <span class="cover-badge">Casos reales</span>
    <span class="cover-badge">Calculadora de ROI</span>
  </div>
  <div class="cover-foot">
    <div class="cover-brand">Victor <b>IA</b></div>
    <div class="cover-meta">El primer supercerebro<br>de IA en LATAM<br>victor-ia.xyz</div>
  </div>
</div>

<!-- ÍNDICE -->
<div class="page toc">
  <h2>Contenido</h2>
  <div class="toc-item"><span class="toc-n">01</span><span class="toc-t">Para qué sirve la IA en una empresa</span></div>
  <div class="toc-item"><span class="toc-n">02</span><span class="toc-t">La diferencia entre IA, agentes y automatización</span></div>
  <div class="toc-item"><span class="toc-n">03</span><span class="toc-t">Cuánto cuesta implementar IA en una empresa mexicana</span></div>
  <div class="toc-item"><span class="toc-n">04</span><span class="toc-t">Cómo elegir el primer proceso para automatizar</span></div>
  <div class="toc-item"><span class="toc-n">05</span><span class="toc-t">ROI: cómo medir el retorno de la IA</span></div>
  <div class="toc-item"><span class="toc-n">06</span><span class="toc-t">Errores comunes al implementar IA (y cómo evitarlos)</span></div>
  <div class="toc-item"><span class="toc-n">07</span><span class="toc-t">Preguntas frecuentes</span></div>
  <div class="toc-item"><span class="toc-n">08</span><span class="toc-t">El siguiente paso: tu diagnóstico gratuito</span></div>
  <div class="pagefoot"><span>Victor IA · Guía Definitiva de IA 2026</span><span>2</span></div>
</div>

<!-- CONTENIDO -->
<div class="page content">
  ${body}
  <div class="pagefoot"><span>Victor IA · Guía Definitiva de IA 2026</span><span>victor-ia.xyz</span></div>
</div>

<!-- CONTRAPORTADA -->
<div class="page back">
  <div class="cover-top" style="color:var(--gold)">El siguiente paso</div>
  <div class="cover-rule" style="margin:14px auto 40px"></div>
  <h2>¿Listo para poner la <em>IA a trabajar</em> en tu empresa?</h2>
  <p>Agenda un diagnóstico gratuito de 30 minutos. Sin presentación de ventas — una sesión de trabajo real donde verás qué agentes pueden trabajar para ti y qué resultado esperar.</p>
  <a class="cta" href="https://victor-ia.xyz/agenda">Agendar diagnóstico gratuito</a>
  <div class="url">victor-ia.xyz</div>
</div>

</body></html>`;

fs.writeFileSync(path.join(ROOT, 'scripts/_guia-print.html'), HTML);
console.log('HTML de impresión generado:', HTML.length, 'bytes');
