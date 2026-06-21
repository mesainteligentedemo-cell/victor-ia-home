// ─────────────────────────────────────────────────────────────────────────────
// Victor IA — Confirmación de preparación de diagnóstico
// Path:   /api/agenda-confirm   (POST)
// Body:   { email, nombre?, empresa?, fecha?, hora?, checked_items[], confirmado:true }
// Notifica al equipo (Resend, CC fijo) que el prospecto leyó/completó su checklist.
// Responde: { success:true, mensaje:"Gracias, confirmamos tu preparación" }
// ─────────────────────────────────────────────────────────────────────────────

const CC_ALWAYS = ['mesainteligentedemo@gmail.com', 'chrisoria16@gmail.com'];
const FROM_PRIMARY  = 'Victor IA <info@victor-ia.xyz>';
const FROM_FALLBACK = 'Victor IA <onboarding@resend.dev>';
const TO_TEAM   = 'info@victor-ia.xyz';

// Etiquetas legibles de cada punto de la checklist
const ITEM_LABELS = {
  procesos: 'Procesos que más tiempo consumen (3–5)',
  costo:    'Costo mensual aproximado (horas × personas)',
  dolor:    'Principales puntos de dolor',
  decisor:  'Acceso a quien decide tecnología/presupuesto',
  intentos: 'Intentos previos de automatización',
};

async function send(apiKey, { to, cc, subject, html, replyTo }) {
  const post = (from) =>
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: Array.isArray(to) ? to : [to],
        cc: [...CC_ALWAYS, ...(cc || [])],
        ...(replyTo ? { reply_to: replyTo } : {}),
        subject,
        html,
      }),
    });
  let r = await post(FROM_PRIMARY);
  if (!r.ok) { r = await post(FROM_FALLBACK); }
  return r;
}

const isEmail = (v) => typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function confirmEmail({ nombre, empresa, email, fecha, hora, labels }) {
  const shell = (content) => `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta name="color-scheme" content="dark">
</head>
<body style="margin:0;padding:0;background:#070708;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#070708">
<tr><td align="center" style="padding:48px 16px">
<table width="620" cellpadding="0" cellspacing="0" role="presentation" style="max-width:620px;width:100%;background:#0c0b10;border-radius:14px;overflow:hidden;border:1px solid rgba(255,255,255,.07)">
  <tr><td style="background:#070708;padding:28px 40px;border-bottom:1px solid rgba(184,154,106,.18)">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><span style="font-family:Georgia,'Times New Roman',serif;font-size:20px;color:#EAE6DF;letter-spacing:.05em">Victor <span style="color:#B89A6A">IA</span></span></td>
    </tr></table>
  </td></tr>
  ${content}
  <tr><td style="background:#070708;padding:24px 40px;border-top:1px solid rgba(255,255,255,.05)">
    <p style="margin:0;font-size:11px;line-height:1.7;color:rgba(112,108,102,.4)">
      © 2026 INFLUENCE IA S.A. DE C.V. · Playa del Carmen, Quintana Roo, México
    </p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;

  const rows = (labels.length ? labels : [])
    .map((t, i) => `<tr style="background:${i % 2 === 0 ? '#0f0e15' : '#0c0b10'}">
      <td style="padding:12px 18px;font-size:14px;color:#EAE6DF;border-bottom:1px solid rgba(255,255,255,.04)">✓ ${t}</td>
    </tr>`)
    .join('');

  const content = `
  <tr><td style="padding:36px 40px 28px">
    <h1 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:30px;font-weight:400;color:#EAE6DF;line-height:1.15">✅ Preparación confirmada</h1>
    <p style="margin:0;font-size:15px;color:#706C66">El prospecto revisó y confirmó su lista de preparación.</p>
  </td></tr>

  <tr><td style="padding:0 40px 32px">
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid rgba(255,255,255,.06);border-radius:10px;overflow:hidden">
      <tr style="background:#0f0e15">
        <td style="padding:12px 18px;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#706C66;width:110px;white-space:nowrap;border-right:1px solid rgba(255,255,255,.04)">Nombre</td>
        <td style="padding:12px 18px;font-size:14px;color:#EAE6DF">${nombre || '—'}</td>
      </tr>
      <tr style="background:#0c0b10">
        <td style="padding:12px 18px;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#706C66;width:110px;white-space:nowrap;border-right:1px solid rgba(255,255,255,.04)">Empresa</td>
        <td style="padding:12px 18px;font-size:14px;color:#EAE6DF">${empresa || '—'}</td>
      </tr>
      <tr style="background:#0f0e15">
        <td style="padding:12px 18px;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#706C66;width:110px;white-space:nowrap;border-right:1px solid rgba(255,255,255,.04)">Email</td>
        <td style="padding:12px 18px;font-size:14px;color:#EAE6DF"><a href="mailto:${email}" style="color:#B89A6A;text-decoration:none">${email || '—'}</a></td>
      </tr>
      <tr style="background:#0c0b10">
        <td style="padding:12px 18px;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#706C66;width:110px;white-space:nowrap;border-right:1px solid rgba(255,255,255,.04)">Cita</td>
        <td style="padding:12px 18px;font-size:14px;color:#EAE6DF">${fecha || '—'} · <strong style="color:#B89A6A">${hora || '—'} hrs</strong></td>
      </tr>
    </table>
  </td></tr>

  <tr><td style="padding:0 40px 32px">
    <p style="margin:0 0 14px;font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:rgba(112,108,102,.45)">Puntos de preparación confirmados (${labels.length}/5)</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${rows.length ? rows : '<tr><td style="padding:12px 18px;font-size:14px;color:rgba(234,230,223,.5)">Ninguno marcado aún</td></tr>'}
    </table>
  </td></tr>

  <tr><td style="padding:0 40px 40px">
    <div style="background:#0f0e15;border-left:2px solid #B89A6A;border-radius:0 8px 8px 0;padding:18px 22px">
      <p style="margin:0;font-size:13px;color:#EAE6DF;line-height:1.6">El prospecto está listo para el diagnóstico. Recuerda revisar sus datos y preparar los casos de uso relevantes para su industria.</p>
    </div>
  </td></tr>
  `;

  return shell(content);
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  const data = req.body || {};
  const { nombre = '', empresa = '', email = '', fecha = '', hora = '', confirmado = false } = data;
  const checkedItems = Array.isArray(data.checked_items) ? data.checked_items : [];

  if (!confirmado && checkedItems.length === 0) {
    return res.status(422).json({ success: false, error: 'Nada que confirmar' });
  }
  if (email && !isEmail(email)) {
    return res.status(422).json({ success: false, error: 'Email inválido' });
  }

  const labels = checkedItems.map((k) => ITEM_LABELS[k] || k).filter(Boolean);

  // Notificación al equipo. DEBE ser awaited: en Vercel serverless la ejecución se
  // congela al devolver la respuesta, así que un fetch fire-and-forget (sin await)
  // se mata antes de llegar a Resend y el correo NUNCA se envía. (bug 2026-06-21)
  const apiKey = process.env.RESEND_API_KEY;
  let emailed = false;
  if (apiKey) {
    try {
      const r = await send(apiKey, {
        to: TO_TEAM,
        subject: `✅ Preparación lista: ${empresa || email || 'prospecto'} — ${labels.length}/5 puntos`,
        html: confirmEmail({ nombre, empresa, email, fecha, hora, labels }),
        replyTo: email && isEmail(email) ? email : undefined,
      });
      emailed = r.ok;
      if (!r.ok) console.error('confirm team email failed:', r.status, await r.text().catch(() => ''));
    } catch (e) {
      console.error('confirm team email error:', e);
    }
  } else {
    console.error('[agenda-confirm] RESEND_API_KEY missing');
  }

  console.log('[agenda-confirm]', { email: email || '—', empresa: empresa || '—', items: checkedItems.length, ts: new Date().toISOString() });

  return res.status(200).json({
    success: true,
    mensaje: 'Gracias, confirmamos tu preparación',
    items_confirmados: checkedItems.length,
    emailed,
  });
};