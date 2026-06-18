// /api/newsletter — suscripción: guarda en CRM + ENVÍA correo de bienvenida real (Resend)
const CC_ALWAYS = ['mesainteligentedemo@gmail.com', 'chrisoria16@gmail.com'];
const FROM      = 'Victor IA <info@victor-ia.com.mx>';
const TO_TEAM   = 'info@victor-ia.com.mx';
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
<p style="margin:0;font-size:11px;line-height:1.7;color:rgba(112,108,102,.4)">© 2026 INFLUENCE IA S.A. DE C.V. · Playa del Carmen, México · <a href="https://victor-ia.xyz" style="color:rgba(184,154,106,.4);text-decoration:none">victor-ia.xyz</a><br>Recibes esto porque te suscribiste en victor-ia.xyz</p>
</td></tr></table></td></tr></table></body></html>`;

const welcomeEmail = () => shell(`
  <tr><td style="padding:40px 40px 12px">
    <span style="display:inline-block;background:rgba(184,154,106,.1);border:1px solid rgba(184,154,106,.25);border-radius:100px;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#B89A6A;padding:4px 12px">Newsletter semanal</span>
    <h1 style="margin:16px 0 12px;font-family:Georgia,serif;font-size:30px;font-weight:400;color:#EAE6DF;line-height:1.2">Estás dentro 🎉</h1>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.75;color:#9a958d">Gracias por suscribirte. Cada semana recibirás las mejores ideas, casos reales y herramientas de inteligencia artificial para empresas en México — directo a tu correo, sin relleno.</p>
    <a href="${GUIA_WEB}" style="display:inline-block;background:#B89A6A;color:#070708;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:14px 30px;border-radius:8px;text-decoration:none">Leer la Guía Definitiva de IA 2026 →</a>
  </td></tr>
  <tr><td style="padding:24px 40px 40px">
    <p style="margin:0;font-size:13px;color:#706C66;line-height:1.7">Mientras tanto, explora nuestro <a href="https://victor-ia.xyz/blog/" style="color:#B89A6A;text-decoration:none">blog</a> con +130 guías por industria.</p>
  </td></tr>`);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let d = req.body;
  if (typeof d === 'string') { try { d = JSON.parse(d); } catch { d = {}; } }
  const email = (d && d.email || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Email inválido' });

  const apiKey = process.env.RESEND_API_KEY;

  // 1) CRM (no bloqueante)
  const CRM = process.env.CRM_WEBHOOK_URL || 'https://n8n.srv1013903.hstgr.cloud/webhook/lead-guia';
  fetch(CRM, { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tipo: 'newsletter', email, origen: d.origen || 'newsletter-blog' }) }).catch(() => {});

  // 2) Correos vía Resend
  if (apiKey) {
    send(apiKey, { to: email, bcc: CC_ALWAYS, subject: 'Bienvenido a la newsletter de Victor IA', html: welcomeEmail() }).catch(() => {});
    send(apiKey, { to: TO_TEAM, cc: CC_ALWAYS, subject: `🔔 Nueva suscripción newsletter: ${email}`, html: shell(`<tr><td style="padding:36px 40px"><h1 style="margin:0 0 10px;font-family:Georgia,serif;font-size:24px;font-weight:400;color:#EAE6DF">Nueva suscripción</h1><p style="margin:0;font-size:15px;color:#B89A6A">${email}</p></td></tr>`) }).catch(() => {});
  }

  return res.status(200).json({ ok: true });
}
