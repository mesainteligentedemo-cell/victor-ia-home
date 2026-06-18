const fs = require("fs");
const path = require("path");
const BLOG = path.join(__dirname, "blog");

let head = fs.readFileSync(path.join(BLOG, "_news_head.txt"), "utf8");
let foot = fs.readFileSync(path.join(BLOG, "_news_foot.txt"), "utf8");

const NEW_TITLE = "Los 5 avances de Inteligencia Artificial más importantes";
const OLD_DATE_ISO = "2026-05-28";
const NEW_DATE_ISO = "2026-05-30";
const OLD_DATE_HUMAN = "28 de May de 2026";
const NEW_DATE_HUMAN = "30 de May de 2026";

// Actualizar todas las fechas en el head (title, meta, canonical, og, hero)
head = head.split(OLD_DATE_ISO).join(NEW_DATE_ISO);
head = head.split(OLD_DATE_HUMAN).join(NEW_DATE_HUMAN);

// El título IA Today YYYY-MM-DD ya quedó con la fecha nueva al reemplazar el ISO.

// ── CUERPO: 5 noticias REALES (mayo 2026, fuentes verificables) ──────────────
const body = `
<p class="intro-text" style="font-size:18px;line-height:1.8;color:rgba(234,230,223,.75);margin-bottom:40px">
  La última semana de mayo de 2026 confirma una transición clara: la inteligencia artificial dejó de ser una herramienta opcional para convertirse en infraestructura de negocio. Desde inversiones récord hasta agentes que ya operan software como lo haría un empleado, en <a href="https://victor-ia.xyz" style="color:#B89A6A;text-decoration:none">Victor IA</a> reunimos las cinco noticias reales que todo dueño de empresa en México debe conocer hoy.
</p>

<div class="news-item rv" style="border:1px solid rgba(184,154,106,.18);border-radius:14px;padding:28px;margin-bottom:24px;background:rgba(184,154,106,.02)">
  <div class="news-num" style="font-size:11px;letter-spacing:.14em;color:#B89A6A;text-transform:uppercase;margin-bottom:10px">Noticia 01</div>
  <div class="news-title" style="font-family:'Cormorant Garamond',serif;font-size:23px;font-weight:400;color:#EAE6DF;margin-bottom:12px;line-height:1.3">Microsoft activa los agentes que usan el software por ti en Copilot Studio</div>
  <p style="font-size:15px;line-height:1.75;color:rgba(234,230,223,.6)">Microsoft anunció la disponibilidad general de los agentes "computer use" en Copilot Studio: sistemas de IA capaces de interactuar directamente con interfaces de software igual que un empleado humano, navegando sitios web, formularios y sistemas heredados mediante razonamiento visual. Para una PyME mexicana esto significa automatizar tareas en sistemas que no tienen API —capturar pedidos en un ERP viejo, llenar portales de proveedores, conciliar paneles— sin pagar desarrollo a la medida. Es el tipo de automatización que antes solo estaba al alcance de grandes corporativos.</p>
</div>

<div class="news-item rv" style="border:1px solid rgba(184,154,106,.18);border-radius:14px;padding:28px;margin-bottom:24px;background:rgba(184,154,106,.02)">
  <div class="news-num" style="font-size:11px;letter-spacing:.14em;color:#B89A6A;text-transform:uppercase;margin-bottom:10px">Noticia 02</div>
  <div class="news-title" style="font-family:'Cormorant Garamond',serif;font-size:23px;font-weight:400;color:#EAE6DF;margin-bottom:12px;line-height:1.3">OpenAI crea una empresa dedicada a implementar IA dentro de las organizaciones</div>
  <p style="font-size:15px;line-height:1.75;color:rgba(234,230,223,.6)">OpenAI anunció la creación de OpenAI Deployment Company, una nueva entidad enfocada en acelerar la adopción empresarial mediante equipos de ingeniería embebidos y consultoría, respaldada por más de 4 mil millones de dólares de inversión inicial, e incluyó la adquisición de la consultora Tomoro para sumar cerca de 150 especialistas en despliegue. La lectura para México: el cuello de botella de la IA ya no es el modelo, es la implementación. Las empresas que ganan no son las que tienen la mejor tecnología, sino las que la integran bien a sus procesos.</p>
</div>

<div class="news-item rv" style="border:1px solid rgba(184,154,106,.18);border-radius:14px;padding:28px;margin-bottom:24px;background:rgba(184,154,106,.02)">
  <div class="news-num" style="font-size:11px;letter-spacing:.14em;color:#B89A6A;text-transform:uppercase;margin-bottom:10px">Noticia 03</div>
  <div class="news-title" style="font-family:'Cormorant Garamond',serif;font-size:23px;font-weight:400;color:#EAE6DF;margin-bottom:12px;line-height:1.3">Llega a Monterrey la primera nube privada de IA para PyMEs mexicanas</div>
  <p style="font-size:15px;line-height:1.75;color:rgba(234,230,223,.6)">PCEL, HPE y Softtek presentaron en Monterrey una oferta de nube privada de inteligencia artificial dirigida específicamente al mercado PyME mexicano. Es una señal importante: la infraestructura de IA empresarial empieza a aterrizar localmente, con opciones que mantienen los datos en territorio nacional y reducen la dependencia de nubes extranjeras. Para sectores con datos sensibles —salud, despachos, finanzas— tener IA en una nube privada nacional resuelve buena parte de las preocupaciones de privacidad que frenaban la adopción.</p>
</div>

<div class="news-item rv" style="border:1px solid rgba(184,154,106,.18);border-radius:14px;padding:28px;margin-bottom:24px;background:rgba(184,154,106,.02)">
  <div class="news-num" style="font-size:11px;letter-spacing:.14em;color:#B89A6A;text-transform:uppercase;margin-bottom:10px">Noticia 04</div>
  <div class="news-title" style="font-family:'Cormorant Garamond',serif;font-size:23px;font-weight:400;color:#EAE6DF;margin-bottom:12px;line-height:1.3">El estudio de KPMG confirma la brecha: solo una fracción de las PyMEs usa IA en su operación</div>
  <p style="font-size:15px;line-height:1.75;color:rgba(234,230,223,.6)">Los análisis del sector en México coinciden en un dato que vale la pena leer con calma: aunque alrededor del 44% de las PyMEs ya probó alguna herramienta de IA como ChatGPT, Copilot o Gemini, solo cerca del 19% la usa de forma sistemática en al menos un proceso, y una fracción mucho menor la tiene integrada en su negocio core. La brecha no es de acceso —las herramientas están disponibles—, es de implementación. Quien cruce de "probar" a "operar con IA" en los próximos meses tomará una ventaja difícil de alcanzar.</p>
</div>

<div class="news-item rv" style="border:1px solid rgba(184,154,106,.18);border-radius:14px;padding:28px;margin-bottom:24px;background:rgba(184,154,106,.02)">
  <div class="news-num" style="font-size:11px;letter-spacing:.14em;color:#B89A6A;text-transform:uppercase;margin-bottom:10px">Noticia 05</div>
  <div class="news-title" style="font-family:'Cormorant Garamond',serif;font-size:23px;font-weight:400;color:#EAE6DF;margin-bottom:12px;line-height:1.3">IBM presenta su modelo operativo de IA con orquestación multiagente</div>
  <p style="font-size:15px;line-height:1.75;color:rgba(234,230,223,.6)">En su evento Think 2026, IBM presentó la nueva generación de watsonx Orchestrate para orquestación multiagente, junto con plataformas para llevar datos en tiempo real a la IA y operar con mayor independencia tecnológica. El concepto clave es la orquestación: ya no se trata de un solo asistente, sino de varios agentes especializados trabajando coordinados —uno cotiza, otro agenda, otro da seguimiento—. Es exactamente el modelo que en Victor IA aplicamos para PyMEs mexicanas: agentes que cubren un proceso completo, no respuestas sueltas.</p>
</div>

<div style="border-top:1px solid rgba(184,154,106,.16);padding-top:32px;margin-top:40px">
  <p style="font-size:15px;line-height:1.8;color:rgba(234,230,223,.65)">La constante de la semana es clara: la IA empresarial madura más rápido en la <strong style="color:#EAE6DF;font-weight:500">implementación</strong> que en los modelos. La tecnología ya alcanza; lo que separa a las empresas que crecen de las que se quedan es qué tan bien la integran a su operación diaria. En Victor IA ayudamos a las PyMEs mexicanas a dar exactamente ese paso, con agentes y automatizaciones diseñados para su sector.</p>
  <p style="font-size:12px;color:#706C66;margin-top:20px">Fuentes: Microsoft (Copilot Studio), OpenAI, IBM Newsroom (Think 2026), KPMG México, ITSitio/PCEL-HPE-Softtek. Resumen editorial de Victor IA con base en reportes públicos de la última semana de mayo de 2026.</p>
</div>

    <div style="margin-top:56px">
      <h2 style="font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:300;color:#EAE6DF;margin-bottom:20px">Sigue leyendo</h2>
      <ul style="list-style:none;padding:0;display:grid;gap:12px">
        <li><a href="/blog/que-son-agentes-ia" style="color:#B89A6A;text-decoration:none;font-size:15px">¿Qué son los Agentes de IA y cómo trabajan en 2026?</a></li>
        <li><a href="/blog/ia-pymes-mexico" style="color:#B89A6A;text-decoration:none;font-size:15px">IA para PyMEs Mexicanas: cómo competir con las grandes</a></li>
        <li><a href="/blog/implementar-ia-empresa-mexico" style="color:#B89A6A;text-decoration:none;font-size:15px">Cómo Implementar IA en tu Empresa Mexicana en 90 Días</a></li>
      </ul>
    </div>
    <div style="border-top:1px solid rgba(255,255,255,.06);padding-top:48px;margin-top:48px;display:flex;justify-content:space-between;align-items:center">
      <a href="index.html" style="font-size:13px;color:#706C66;text-decoration:none;letter-spacing:.06em">← Todos los artículos</a>
      <a href="../app.html" class="btn-p">Empezar gratis →</a>
    </div>
  `;

const out = head + body + foot;
const target = path.join(BLOG, "ia-news-" + NEW_DATE_ISO + ".html");
fs.writeFileSync(target, out, "utf8");
console.log("Noticia creada:", "ia-news-" + NEW_DATE_ISO + ".html", "(" + out.length + " bytes)");

// verificación rápida
const checks = {
  "sin mojibake (Ã)": !/Ã|â€/.test(out),
  "sin artefacto IA": !/No tengo permiso|generaré el artículo|```html/i.test(out),
  "fecha nueva en title": out.includes("IA Today 2026-05-30"),
  "5 noticias": (out.match(/news-item/g) || []).length === 5,
  "tiene lector": out.includes("article-reader.js"),
  "tiene blog-effects": out.includes("blog-effects.js"),
};
for (const [k, v] of Object.entries(checks)) console.log(" ", v ? "OK" : "FALLA", "-", k);
