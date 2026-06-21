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
  const rows = (labels.length ? labels : ['(ninguno marcado todavía)'])
    .map((t) => `<tr><td style="padding:7px 0;font-size:14px;color:#222;border-bottom:1px solid #eee">✓ ${t}</td></tr>`)
    .join('');
  return `<div style="font-family:Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#222">
    <h2 style="font-family:Georgia,serif;font-weight:400;color:#070708;font-size:22px;margin:0 0 6px">Preparación confirmada</h2>
    <p style="color:#666;font-size:14px;margin:0 0 18px">El prospecto revisó su lista de preparación antes del diagnóstico.</p>
    <table cellpadding="0" cellspacing="0" style="font-size:14px;margin-bottom:18px">
      <tr><td style="color:#888;padding:3px 16px 3px 0">Nombre</td><td>${nombre || '—'}</td></tr>
      <tr><td style="color:#888;padding:3px 16px 3px 0">Empresa</td><td>${empresa || '—'}</td></tr>
      <tr><td style="color:#888;padding:3px 16px 3px 0">Email</td><td>${email || '—'}</td></tr>
      <tr><td style="color:#888;padding:3px 16px 3px 0">Cita</td><td>${fecha || '—'} · ${hora || '—'}</td></tr>
    </table>
    <p style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#999;margin:0 0 6px">Puntos marcados (${labels.length}/5)</p>
    <table width="100%" cellpadding="0" cellspacing="0">${rows}</table>
  </div>`;
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

  // Notificación al equipo (no bloquea la confirmación al usuario)
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    send(apiKey, {
      to: TO_TEAM,
      subject: `✅ Preparación lista: ${empresa || email || 'prospecto'} — ${labels.length}/5 puntos`,
      html: confirmEmail({ nombre, empresa, email, fecha, hora, labels }),
      replyTo: email && isEmail(email) ? email : undefined,
    }).catch((e) => console.error('confirm team email failed:', e));
  }

  console.log('[agenda-confirm]', { email: email || '—', empresa: empresa || '—', items: checkedItems.length, ts: new Date().toISOString() });

  return res.status(200).json({
    success: true,
    mensaje: 'Gracias, confirmamos tu preparación',
    items_confirmados: checkedItems.length,
  });
};