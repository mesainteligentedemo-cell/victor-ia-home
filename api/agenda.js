// ─────────────────────────────────────────────────────────────────────────────
// Victor IA — Email workflow: Diagnóstico gratuito
// FROM:    info@victor-ia.com.mx
// CC siempre: mesainteligentedemo@gmail.com
// ─────────────────────────────────────────────────────────────────────────────

const CC_ALWAYS = 'mesainteligentedemo@gmail.com';
const FROM      = 'Victor IA <info@victor-ia.com.mx>';
const TO_TEAM   = 'info@victor-ia.com.mx';

const send = (apiKey, { to, cc, subject, html, replyTo }) =>
  fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM,
      to: Array.isArray(to) ? to : [to],
      cc: [CC_ALWAYS, ...(cc || [])],
      ...(replyTo ? { reply_to: replyTo } : {}),
      subject,
      html,
    }),
  });

// ─── Email shell ───────────────────────────────────────────────────────────
const shell = (content) => `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta name="color-scheme" content="dark">
</head>
<body style="margin:0;padding:0;background:#070708;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#070708">
<tr><td align="center" style="padding:48px 16px">
<table width="620" cellpadding="0" cellspacing="0" role="presentation" style="max-width:620px;width:100%;background:#0c0b10;border-radius:14px;overflow:hidden;border:1px solid rgba(255,255,255,.07)">

  <!-- HEADER BAR -->
  <tr><td style="background:#070708;padding:28px 40px;border-bottom:1px solid rgba(184,154,106,.18)">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><span style="font-family:Georgia,'Times New Roman',serif;font-size:20px;color:#EAE6DF;letter-spacing:.05em">Victor <span style="color:#B89A6A">IA</span></span></td>
      <td align="right" style="font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:rgba(112,108,102,.5)">INFLUENCE IA S.A. DE C.V.</td>
    </tr></table>
  </td></tr>

  <!-- BODY -->
  ${content}

  <!-- FOOTER -->
  <tr><td style="background:#070708;padding:24px 40px;border-top:1px solid rgba(255,255,255,.05)">
    <p style="margin:0;font-size:11px;line-height:1.7;color:rgba(112,108,102,.4)">
      © 2026 INFLUENCE IA S.A. DE C.V. &nbsp;·&nbsp; Playa del Carmen, Quintana Roo, México<br>
      <a href="https://victor-ia.xyz" style="color:rgba(184,154,106,.4);text-decoration:none">victor-ia.xyz</a>
      &nbsp;·&nbsp;
      <a href="https://victor-ia.xyz/aviso-privacidad" style="color:rgba(112,108,102,.3);text-decoration:none">Aviso de privacidad</a>
      &nbsp;·&nbsp;
      <a href="mailto:info@victor-ia.com.mx" style="color:rgba(112,108,102,.3);text-decoration:none">info@victor-ia.com.mx</a>
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`;

// ─── Pill badge ────────────────────────────────────────────────────────────
const badge = (text, color = '#B89A6A') =>
  `<span style="display:inline-block;background:rgba(184,154,106,.1);border:1px solid rgba(184,154,106,.25);border-radius:100px;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:${color};padding:4px 12px">${text}</span>`;

// ─── Info row for tables ───────────────────────────────────────────────────
const infoRow = (label, value, i) =>
  `<tr style="background:${i % 2 === 0 ? '#0f0e15' : '#0c0b10'}">
    <td style="padding:12px 18px;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#706C66;width:110px;white-space:nowrap;border-right:1px solid rgba(255,255,255,.04)">${label}</td>
    <td style="padding:12px 18px;font-size:14px;color:#EAE6DF;line-height:1.5">${value}</td>
  </tr>`;

// ─── Checklist item ────────────────────────────────────────────────────────
const checkItem = (text) =>
  `<tr><td style="padding:9px 0;border-bottom:1px solid rgba(255,255,255,.04)">
    <table cellpadding="0" cellspacing="0"><tr>
      <td style="width:24px;vertical-align:top;padding-top:1px">
        <div style="width:15px;height:15px;border-radius:4px;border:1.5px solid rgba(184,154,106,.28)"></div>
      </td>
      <td style="font-size:13px;color:rgba(234,230,223,.65);line-height:1.55;padding-left:8px">${text}</td>
    </tr></table>
  </td></tr>`;

// ─── Bullet item ───────────────────────────────────────────────────────────
const bulletItem = (text) =>
  `<tr><td style="padding:9px 0;border-bottom:1px solid rgba(255,255,255,.04)">
    <table cellpadding="0" cellspacing="0"><tr>
      <td style="width:18px;vertical-align:top"><span style="display:inline-block;width:5px;height:5px;border-radius:50%;background:#B89A6A;margin-top:6px"></span></td>
      <td style="font-size:14px;color:rgba(234,230,223,.72);line-height:1.6;padding-left:6px">${text}</td>
    </tr></table>
  </td></tr>`;

// ─── CTA button ────────────────────────────────────────────────────────────
const ctaBtn = (label, href, style = 'primary') =>
  style === 'primary'
    ? `<a href="${href}" style="display:inline-block;background:#B89A6A;color:#070708;font-size:11px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;padding:14px 28px;border-radius:7px;text-decoration:none">${label}</a>`
    : `<a href="${href}" style="display:inline-block;background:#0f0e15;border:1px solid rgba(255,255,255,.1);color:#EAE6DF;font-size:11px;letter-spacing:.12em;text-transform:uppercase;padding:14px 28px;border-radius:7px;text-decoration:none">${label}</a>`;

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE A — Team notification (interna)
// ─────────────────────────────────────────────────────────────────────────────
function teamEmail({ nombre, empresa, email, wa, industria, tema, fuente, fecha, hora }) {
  const nombreCorto = nombre.split(' ')[0];
  const waUrl = `https://wa.me/${(wa || '').replace(/\D/g, '')}`;

  const content = `
  <!-- TITLE -->
  <tr><td style="padding:36px 40px 28px">
    <p style="margin:0 0 10px">${badge('Nueva solicitud · Diagnóstico 30 min')}</p>
    <h1 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:30px;font-weight:400;color:#EAE6DF;line-height:1.15">${empresa}</h1>
    <p style="margin:0;font-size:15px;color:#706C66">${fecha} &nbsp;·&nbsp; <strong style="color:#B89A6A">${hora} hrs (CDT)</strong></p>
  </td></tr>

  <!-- PROSPECT DATA TABLE -->
  <tr><td style="padding:0 40px 32px">
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid rgba(255,255,255,.06);border-radius:10px;overflow:hidden">
      ${[
        ['Nombre',   nombre],
        ['Empresa',  empresa],
        ['Email',    `<a href="mailto:${email}" style="color:#B89A6A;text-decoration:none">${email}</a>`],
        ['WhatsApp', wa ? `<a href="${waUrl}" style="color:#B89A6A;text-decoration:none">${wa}</a>` : '—'],
        ['Industria', industria || '—'],
        ['Fuente',   fuente || '—'],
      ].map(([k, v], i) => infoRow(k, v, i)).join('')}
    </table>
  </td></tr>

  <!-- TOPIC CALLOUT -->
  <tr><td style="padding:0 40px 32px">
    <div style="border-left:2px solid #B89A6A;background:#0f0e15;border-radius:0 8px 8px 0;padding:18px 22px">
      <p style="margin:0 0 6px;font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#706C66">Tema de la llamada</p>
      <p style="margin:0;font-size:15px;line-height:1.72;color:#EAE6DF">${tema}</p>
    </div>
  </td></tr>

  <!-- PREPARATION CHECKLIST -->
  <tr><td style="padding:0 40px 32px">
    <p style="margin:0 0 14px;font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:rgba(112,108,102,.45)">Checklist de preparación del equipo</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${checkItem(`Investigar <strong style="color:#EAE6DF">${empresa}</strong> — LinkedIn, web, noticias recientes`)}
      ${checkItem(`Preparar 2-3 casos de uso concretos para la industria: <strong style="color:#EAE6DF">${industria || 'General'}</strong>`)}
      ${checkItem(`Revisar el tema: <em style="color:rgba(234,230,223,.7)">${tema.substring(0, 80)}${tema.length > 80 ? '…' : ''}</em>`)}
      ${checkItem('Enviar link de Google Meet 30 minutos antes de la llamada')}
      ${checkItem('Revisar historial y notas previas de la empresa en CRM')}
      ${checkItem('Preparar estimado de ROI para el sector ' + (industria || 'mencionado'))}
      ${checkItem('Tener deck de agentes relevantes listo para pantalla compartida')}
      ${checkItem('Confirmar recepción por WhatsApp/Email al prospecto')}
    </table>
  </td></tr>

  <!-- DOCUMENT CHECKLIST (personalizable) -->
  <tr><td style="padding:0 40px 36px">
    <p style="margin:0 0 14px;font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:rgba(112,108,102,.45)">Documentos a preparar / reenviar al prospecto</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${checkItem('One-pager Victor IA (versión sector ' + (industria || 'general') + ')')}
      ${checkItem('Propuesta de diagnóstico con análisis previo')}
      ${checkItem('Casos de éxito relevantes para ' + (industria || 'su industria'))}
      ${checkItem('Agenda y estructura de la llamada de 30 minutos')}
      ${checkItem('Formulario de NDA (si aplica para información sensible)')}
    </table>
  </td></tr>

  <!-- CTA BUTTONS -->
  <tr><td style="padding:0 40px 40px">
    <table cellpadding="0" cellspacing="0"><tr>
      <td>${ctaBtn('Responder al prospecto', `mailto:${email}?subject=Confirmación de diagnóstico Victor IA — ${nombreCorto}&body=Hola ${nombreCorto},`)}</td>
      <td style="padding-left:10px">${wa ? ctaBtn('WhatsApp →', waUrl, 'secondary') : ''}</td>
    </tr></table>
  </td></tr>
  `;

  return shell(content);
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE B — Confirmación al prospecto
// ─────────────────────────────────────────────────────────────────────────────
function prospectEmail({ nombre, empresa, email, fecha, hora, industria, tema }) {
  const nombreCorto = nombre.split(' ')[0];

  const content = `
  <!-- GREETING -->
  <tr><td style="padding:44px 40px 28px">
    <h1 style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-size:34px;font-weight:400;color:#EAE6DF;line-height:1.15">Hola, ${nombreCorto}.</h1>
    <p style="margin:0;font-size:16px;line-height:1.78;color:#706C66">Tu solicitud de diagnóstico gratuito fue recibida. Te confirmaremos el link de Google Meet en menos de <strong style="color:#EAE6DF">2 horas</strong>.</p>
  </td></tr>

  <!-- APPOINTMENT CARD -->
  <tr><td style="padding:0 40px 32px">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0e15;border:1px solid rgba(184,154,106,.2);border-radius:12px;overflow:hidden">
      <tr><td style="padding:24px 28px;border-bottom:1px solid rgba(255,255,255,.05)">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td>
            <p style="margin:0 0 5px;font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#706C66">Fecha</p>
            <p style="margin:0;font-size:16px;color:#EAE6DF">${fecha}</p>
          </td>
          <td align="right">
            <p style="margin:0 0 5px;font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#706C66">Hora</p>
            <p style="margin:0;font-family:Georgia,serif;font-size:26px;color:#B89A6A;line-height:1">${hora} <span style="font-size:12px;color:#706C66">hrs CDT</span></p>
          </td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:18px 28px;border-bottom:1px solid rgba(255,255,255,.05)">
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="padding-right:40px">
            <p style="margin:0 0 5px;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#706C66">Duración</p>
            <p style="margin:0;font-size:14px;color:#EAE6DF">30 minutos</p>
          </td>
          <td>
            <p style="margin:0 0 5px;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#706C66">Formato</p>
            <p style="margin:0;font-size:14px;color:#EAE6DF">Videollamada · Google Meet</p>
          </td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:18px 28px">
        <p style="margin:0 0 5px;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#706C66">Empresa</p>
        <p style="margin:0;font-size:14px;color:#EAE6DF">${empresa}</p>
      </td></tr>
    </table>
  </td></tr>

  <!-- QUÉ ESPERAR -->
  <tr><td style="padding:0 40px 32px">
    <p style="margin:0 0 14px;font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:rgba(112,108,102,.45)">Qué va a pasar en los próximos pasos</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${bulletItem('Recibirás una confirmación con el link de Google Meet en menos de 2 horas')}
      ${bulletItem('El día de la llamada compartiremos pantalla para mostrarte casos de uso concretos para <strong style="color:#EAE6DF">' + (industria || 'tu industria') + '</strong>')}
      ${bulletItem('No hay presentación de ventas — es una sesión de trabajo real')}
      ${bulletItem('Al final tendrás un mapa claro de qué agentes pueden trabajar para ti y qué resultado esperar')}
    </table>
  </td></tr>

  <!-- CHECKLIST PARA EL PROSPECTO -->
  <tr><td style="padding:0 40px 36px">
    <p style="margin:0 0 14px;font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:rgba(112,108,102,.45)">Para sacar el máximo de los 30 minutos</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${checkItem('Lista de los 3-5 procesos que más tiempo consumen en tu operación')}
      ${checkItem('Costo mensual aproximado de esos procesos (horas × personas)')}
      ${checkItem('Principales puntos de dolor: atención al cliente, reportes, seguimiento, etc.')}
      ${checkItem('Acceso a quien toma decisiones de tecnología o presupuesto')}
      ${checkItem('Cualquier intento previo de automatización y por qué no funcionó')}
    </table>
  </td></tr>

  <!-- CONTACT CTA -->
  <tr><td style="padding:0 40px 40px">
    <div style="background:#0f0e15;border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:22px 26px">
      <p style="margin:0 0 6px;font-size:13px;color:#706C66">¿Preguntas antes de la llamada?</p>
      <a href="mailto:info@victor-ia.com.mx?subject=Pregunta previa — Diagnóstico ${encodeURIComponent(empresa)}" style="font-size:16px;color:#B89A6A;text-decoration:none">info@victor-ia.com.mx</a>
    </div>
  </td></tr>
  `;

  return shell(content);
}

// ─────────────────────────────────────────────────────────────────────────────
// HANDLER
// ─────────────────────────────────────────────────────────────────────────────
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const data = req.body || {};
  const { nombre, empresa, email, fecha, hora } = data;

  if (!nombre || !empresa || !email || !fecha || !hora) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'RESEND_API_KEY not configured' });

  // 1. Team notification
  const r1 = await send(apiKey, {
    to: TO_TEAM,
    subject: `📅 Nueva cita: ${empresa} — ${fecha} · ${hora} hrs`,
    html: teamEmail(data),
    replyTo: email,
  });

  if (!r1.ok) {
    const err = await r1.json().catch(() => ({}));
    console.error('Team email failed:', err);
    return res.status(500).json({ error: 'Failed to send team notification' });
  }

  // 2. Prospect confirmation (non-critical)
  send(apiKey, {
    to: email,
    subject: `Tu diagnóstico gratuito está confirmado — ${fecha} · ${hora} hrs`,
    html: prospectEmail(data),
  }).catch(e => console.error('Prospect email failed:', e));

  return res.status(200).json({ success: true });
};
