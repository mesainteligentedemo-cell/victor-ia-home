// /api/lead — descarga de la Guía: guarda en CRM + ENVÍA la guía por correo (Resend) + avisa al equipo
const CC_ALWAYS = ['mesainteligentedemo@gmail.com', 'chrisoria16@gmail.com'];
const FROM      = 'Victor IA <info@victor-ia.com.mx>';
const TO_TEAM   = 'info@victor-ia.com.mx';
const GUIA_PDF  = 'https://victor-ia.xyz/guia-ia-empresas-2026.pdf';
const GUIA_WEB  = 'https://victor-ia.xyz/blog/inteligencia-artificial-para-empresas-mexico.html';

const send = (apiKey, { to, cc, bcc, subject, html, replyTo }) =>
  fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM,
      to: Array.isArray(to) ? to : [to],
      cc: cc ? (Array.isArray(cc) ? cc : [cc]) : undefined,
      bcc: bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : undefined,
      ...(replyTo ? { reply_to: replyTo } : {}),
      subject, html,
    }),
  });

const shell = (content) => `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="color-scheme" content="dark"></head>
<body style="margin:0;background:#070708;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#070708"><tr><td align="center" style="padding:48px 16px">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#0c0b10;border-radius:14px;overflow:hidden;border:1px solid rgba(255,255,255,.07)">
<tr><td style="background:#070708;padding:26px 40px;border-bottom:1px solid rgba(184,154,106,.18)">
<span style="font-family:Georgia,serif;font-size:20px;color:#EAE6DF">Victor <span style="color:#B89A6A">IA</span></span></td></tr>
${content}
<tr><td style="background:#070708;padding:22px 40px;border-top:1px solid rgba(255,255,255,.05)">
<p style="margin:0;font-size:11px;line-height:1.7;color:rgba(112,108,102,.4)">© 2026 INFLUENCE IA S.A. DE C.V. · Playa del Carmen, México · <a href="https://victor-ia.xyz" style="color:rgba(184,154,106,.4);text-decoration:none">victor-ia.xyz</a></p>
</td></tr></table></td></tr></table></body></html>`;

const userEmail = (nombre) => shell(`
  <!-- HERO con mockup del libro -->
  <tr><td style="padding:0">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:radial-gradient(120% 90% at 78% 20%,rgba(184,154,106,.16),transparent 55%)">
      <tr>
        <td style="padding:40px 0 30px 40px;vertical-align:middle;width:62%">
          <span style="display:inline-block;background:rgba(184,154,106,.1);border:1px solid rgba(184,154,106,.3);border-radius:100px;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#CDB28C;padding:5px 13px">Guía Gratuita · PDF</span>
          <h1 style="margin:18px 0 10px;font-family:Georgia,serif;font-size:30px;font-weight:400;color:#EAE6DF;line-height:1.18">${nombre ? '¡Gracias, ' + nombre + '!' : '¡Gracias!'}</h1>
          <p style="margin:0;font-size:14.5px;line-height:1.7;color:#9a958d">Tu <strong style="color:#EAE6DF">Guía Definitiva de IA 2026</strong> está lista.</p>
        </td>
        <td style="padding:30px 36px 30px 0;text-align:center;width:38%">
          <!-- mockup libro (email-safe) -->
          <table cellpadding="0" cellspacing="0" align="center" style="width:118px;height:160px;background:linear-gradient(135deg,#1a1a20,#0b0b0e);border:1px solid rgba(184,154,106,.4);border-left:5px solid #B89A6A;border-radius:3px 8px 8px 3px">
            <tr><td style="padding:18px 12px;text-align:center;vertical-align:middle">
              <div style="font-size:8px;letter-spacing:.24em;color:#B89A6A;margin-bottom:14px">VICTOR IA</div>
              <div style="font-family:Georgia,serif;font-size:15px;color:#EAE6DF;line-height:1.25;margin-bottom:12px">La Guía<br>Definitiva<br>de IA</div>
              <div style="font-family:Georgia,serif;font-size:30px;color:#B89A6A">2026</div>
            </td></tr>
          </table>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- BOTÓN DESCARGA -->
  <tr><td style="padding:8px 40px 6px;text-align:center">
    <a href="${GUIA_PDF}" style="display:block;background:linear-gradient(135deg,#CDB28C,#B89A6A);color:#070708;font-size:13px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:17px;border-radius:10px;text-decoration:none">⬇  Descargar la guía en PDF</a>
    <p style="margin:12px 0 0;font-size:12.5px;color:#706C66">¿Prefieres leerla en tu navegador? <a href="${GUIA_WEB}" style="color:#B89A6A;text-decoration:none">Ábrela en línea →</a></p>
  </td></tr>

  <!-- QUÉ INCLUYE -->
  <tr><td style="padding:26px 40px 6px">
    <p style="margin:0 0 12px;font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:rgba(112,108,102,.5)">Lo que vas a encontrar dentro</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${['Marco de adopción de IA paso a paso','Calculadora de retorno de inversión','+30 casos de uso reales por industria','Hoja de ruta de implementación de 90 días']
        .map(t=>`<tr><td style="padding:7px 0;font-size:14px;color:rgba(234,230,223,.78)"><span style="color:#B89A6A;margin-right:10px">✦</span>${t}</td></tr>`).join('')}
    </table>
  </td></tr>

  <!-- NEWSLETTER + ARTÍCULOS -->
  <tr><td style="padding:26px 40px 10px">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,rgba(184,154,106,.1),rgba(184,154,106,.02));border:1px solid rgba(184,154,106,.25);border-radius:12px">
      <tr><td style="padding:22px 24px">
        <p style="margin:0 0 6px;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#B89A6A">Newsletter semanal</p>
        <p style="margin:0 0 14px;font-family:Georgia,serif;font-size:19px;color:#EAE6DF;line-height:1.3">Recibe las mejores ideas de IA, cada semana</p>
        <p style="margin:0 0 16px;font-size:13.5px;line-height:1.6;color:#9a958d">Únete a los líderes que reciben nuestro resumen semanal de inteligencia artificial para empresas en México. Gratis, sin relleno.</p>
        <a href="https://victor-ia.xyz/blog/?suscribir=1" style="display:inline-block;background:#0f0e15;border:1px solid rgba(184,154,106,.4);color:#CDB28C;font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;padding:12px 24px;border-radius:8px;text-decoration:none">Suscribirme gratis</a>
      </td></tr>
    </table>
  </td></tr>

  <tr><td style="padding:8px 40px 38px">
    <div style="border-left:2px solid rgba(184,154,106,.5);padding:4px 0 4px 18px">
      <p style="margin:0;font-size:13.5px;line-height:1.7;color:#bdb9b2">¿Quieres mantenerte al día? Cada día publicamos las <a href="https://victor-ia.xyz/blog/" style="color:#B89A6A;text-decoration:none">noticias de IA más relevantes</a> y guías por industria en nuestro blog.</p>
    </div>
    <p style="margin:22px 0 0;font-size:13px;color:#706C66;line-height:1.6">Si tienes dudas, solo responde a este correo — te leemos. Y si quieres ver qué agentes de IA pueden trabajar para tu empresa, agenda un <a href="https://victor-ia.xyz/agenda" style="color:#B89A6A;text-decoration:none">diagnóstico gratuito de 30 min</a>.</p>
  </td></tr>`);

const teamEmail = (d) => shell(`
  <tr><td style="padding:36px 40px 30px">
    <span style="display:inline-block;background:rgba(184,154,106,.1);border:1px solid rgba(184,154,106,.25);border-radius:100px;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#B89A6A;padding:4px 12px">Nuevo lead · Descarga de Guía</span>
    <h1 style="margin:16px 0 18px;font-family:Georgia,serif;font-size:26px;font-weight:400;color:#EAE6DF">${d.nombre} ${d.apellido}</h1>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid rgba(255,255,255,.06);border-radius:10px;overflow:hidden">
      ${[
        ['Nombre', d.nombre + ' ' + d.apellido],
        ['Correo', d.email ? `<a href="mailto:${d.email}" style="color:#B89A6A;text-decoration:none">${d.email}</a>` : '—'],
        ['Teléfono', d.telefono ? `<a href="https://wa.me/${(d.telefono || '').replace(/\D/g, '')}" style="color:#B89A6A;text-decoration:none">${d.telefono}</a>` : '—'],
        ['Origen', d.origen || '—'],
      ].map(([k, v], i) => `<tr style="background:${i % 2 ? '#0c0b10' : '#0f0e15'}"><td style="padding:11px 16px;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#706C66;width:100px">${k}</td><td style="padding:11px 16px;font-size:14px;color:#EAE6DF">${v}</td></tr>`).join('')}
    </table>
  </td></tr>`);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let d = req.body;
  if (typeof d === 'string') { try { d = JSON.parse(d); } catch { d = {}; } }
  const { nombre, apellido, email, telefono } = d || {};
  if (!nombre || !apellido || !email || !telefono) return res.status(400).json({ error: 'Faltan datos requeridos' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Correo inválido' });

  const apiKey = process.env.RESEND_API_KEY;

  // 1) CRM (no bloqueante) — webhook del tracker
  const CRM = process.env.CRM_WEBHOOK_URL || 'https://n8n.srv1013903.hstgr.cloud/webhook/lead-guia';
  fetch(CRM, { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tipo: 'lead-descarga', ...d }) }).catch(() => {});

  // 2) Correos vía Resend
  if (apiKey) {
    send(apiKey, { to: [TO_TEAM, ...CC_ALWAYS], subject: `📥 Nuevo lead guía: ${nombre} ${apellido}`, html: teamEmail(d), replyTo: email }).catch(() => {});
    send(apiKey, { to: email, bcc: CC_ALWAYS, subject: 'Tu Guía Definitiva de IA 2026 — Victor IA', html: userEmail(nombre) }).catch(() => {});
  }

  return res.status(200).json({ ok: true });
}
