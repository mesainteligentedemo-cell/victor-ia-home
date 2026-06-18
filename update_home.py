"""
update_home.py
Applies all pending changes to victor-ia-home/index.html:
1. Fix spelling: Diseno->Diseño, Comunicacion->Comunicación
2. Add Adobe CC filter pill
3. Add Adobe CC tools to tools array
4. Add can/cannot sections to modal HTML
5. Add CSS for can/cannot
6. Replace window._openIM with full can/cannot version
"""
import sys, re, os
sys.stdout.reconfigure(encoding='utf-8')

PATH = r'C:/Users/inbou/victor-ia-home/index.html'
with open(PATH, 'r', encoding='utf-8') as f:
    html = f.read()

original_len = len(html)
changes = []

# ─────────────────────────────────────────────
# 1. SPELLING FIXES
# ─────────────────────────────────────────────
if '>Diseno<' in html:
    html = html.replace('>Diseno<', '>Diseño<')
    changes.append('fixed: Diseno -> Diseño')

if '>Comunicacion<' in html:
    html = html.replace('>Comunicacion<', '>Comunicación<')
    changes.append('fixed: Comunicacion -> Comunicación')

# ─────────────────────────────────────────────
# 2. ADD ADOBE CC FILTER PILL
# ─────────────────────────────────────────────
old_sec_pill = '<button class="int-pill" data-cat="sec">Seguridad</button>'
new_sec_pill = '''<button class="int-pill" data-cat="sec">Seguridad</button>
        <button class="int-pill" data-cat="adobe">Adobe CC</button>'''
if old_sec_pill in html and 'data-cat="adobe"' not in html:
    html = html.replace(old_sec_pill, new_sec_pill)
    changes.append('added: Adobe CC filter pill')

# ─────────────────────────────────────────────
# 3. ADD ADOBE CC TOOLS TO ARRAY
# ─────────────────────────────────────────────
adobe_tools_block = """    // Adobe CC
    {l:'logos/adobe-lightroom.png',n:'Lightroom',c:'adobe',d:'Edición fotográfica inteligente con organización, retoque y catalogación IA'},
    {t:'Ac',s:'background:#1a0005;color:#FF2BC2',n:'Acrobat / Sign',c:'adobe',d:'Firmas electrónicas, PDFs y flujos de aprobación de documentos'},
    {t:'Au',s:'background:#0f0f1c;color:#9999FF',n:'Audition',c:'adobe',d:'Edición, restauración y mezcla de audio profesional con IA'},
    {t:'An',s:'background:#1a0e00;color:#FF7200',n:'Animate',c:'adobe',d:'Animación vectorial interactiva para web, apps y multimedia'},
    {t:'Xp',s:'background:#1a0005;color:#FF3366',n:'Adobe Express',c:'adobe',d:'Creación de contenido de marca a escala con plantillas y IA'},
    {t:'St',s:'background:#140000;color:#EA0000',n:'Adobe Stock',c:'adobe',d:'Millones de assets visuales con licencias comerciales incluidas'},
    {t:'3D',s:'background:#1a0e00;color:#F75A00',n:'Substance 3D',c:'adobe',d:'Materiales, texturas y escenas 3D fotorrealistas para branding'},
    {t:'Fw',s:'background:#0a0f1a;color:#2F8ACC',n:'Bridge',c:'adobe',d:'Gestor centralizado de assets creativos y flujos de producción'},"""

# Insert before the Security section marker
sec_marker = '    // Security'
if sec_marker in html and 'adobe' not in html.split(sec_marker)[0].split('// Agents')[-1]:
    html = html.replace(sec_marker, adobe_tools_block + '\n    ' + sec_marker)
    changes.append('added: Adobe CC tools (8 entries)')

# ─────────────────────────────────────────────
# 4. UPDATE MODAL HTML - ADD CAN/CANNOT SECTIONS
# ─────────────────────────────────────────────
old_modal_body = '''    <div class="int-modal-benefits">
      <div class="int-modal-section-label">Lo que esto significa para ti</div>
      <ul class="int-modal-list" id="imList"></ul>
    </div>
    <div class="int-modal-footer">'''

new_modal_body = '''    <div class="int-modal-benefits">
      <div class="int-modal-section-label">Lo que esto significa para ti</div>
      <ul class="int-modal-list" id="imList"></ul>
    </div>
    <div class="int-modal-can">
      <div class="int-modal-section-label im-label-can">Lo que <em>sí</em> puedes hacer</div>
      <ul class="int-modal-caplist" id="imCan"></ul>
    </div>
    <div class="int-modal-cannot">
      <div class="int-modal-section-label im-label-cannot">Lo que <em>no</em> incluye esta integración</div>
      <ul class="int-modal-caplist" id="imCannot"></ul>
    </div>
    <div class="int-modal-footer">'''

if old_modal_body in html:
    html = html.replace(old_modal_body, new_modal_body)
    changes.append('added: can/cannot sections to modal HTML')

# ─────────────────────────────────────────────
# 5. ADD CSS FOR CAN/CANNOT
# ─────────────────────────────────────────────
old_css_anchor = '.int-modal-secondary:hover { color:var(--warm); }'
new_css = old_css_anchor + '''
.int-modal-can { margin-bottom: 18px; }
.int-modal-cannot { margin-bottom: 28px; }
.int-modal-section-label em { font-style: normal; font-weight: 600; color: inherit; }
.im-label-can { color: rgba(52,211,153,0.6); }
.im-label-cannot { color: rgba(248,99,78,0.55); }
.int-modal-caplist { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 7px; }
.int-modal-caplist li { display: flex; gap: 10px; font-size: 0.775rem; font-weight: 300; color: rgba(248,247,245,0.58); line-height: 1.5; }
.int-modal-can .int-modal-caplist li::before { content: '✓'; color: rgba(52,211,153,0.8); flex-shrink: 0; font-size: 0.68rem; font-weight: 700; margin-top: 2px; }
.int-modal-cannot .int-modal-caplist li::before { content: '✕'; color: rgba(248,99,78,0.65); flex-shrink: 0; font-size: 0.68rem; font-weight: 700; margin-top: 2px; }'''

if old_css_anchor in html and '.int-modal-can {' not in html:
    html = html.replace(old_css_anchor, new_css)
    changes.append('added: CSS for can/cannot lists')

# ─────────────────────────────────────────────
# 6. REPLACE window._openIM WITH FULL CAN/CANNOT VERSION
# ─────────────────────────────────────────────
NEW_OPEN_IM = r"""window._openIM = (function() {
  var CC = {
    llm: { tag:'IA Generativa', col:'#a78bfa',
      intro:'Modelo de lenguaje que VICTOR IA integra para potenciar tus agentes, automatizaciones y flujos de trabajo con inteligencia real.',
      b:['Razonamiento y análisis avanzado dentro de tus procesos automatizados','Generación autónoma de contenido, reportes y documentación de tu empresa','Toma de decisiones inteligente integrada en cada workflow que construimos'],
      can:['Generar texto, código y análisis a través de API directa en tiempo real','Procesar imágenes y documentos con modelos vision (GPT-4o, Claude 3, Gemini)','Function calling: activar funciones de tus sistemas desde el modelo de IA','Streaming de respuestas instantáneas integrado en cualquier interfaz web o app'],
      cannot:['Acceder a internet en tiempo real sin herramientas o MCP configurados','Conservar memoria entre sesiones sin base de datos conectada','Ejecutar acciones externas de forma autónoma sin un agente configurado'] },
    media: { tag:'Contenido & Creación', col:'#f472b6',
      intro:'Herramienta creativa que usamos para producir materiales visuales y auditivos de alta calidad para tu marca, sin productoras ni agencias externas.',
      b:['Producción de contenido profesional a fracción del costo tradicional','Generación automática de activos para campañas, redes y publicidad','Iteración rápida de formatos integrada directamente en tu flujo de trabajo'],
      can:['Generar imágenes vía API (Runway, Stability AI, fal.ai, Firefly, Replicate)','Sintetizar y clonar voces con la API oficial de ElevenLabs','Generar video con Runway Gen-4, Kling y LTX Studio vía API directa','Transcribir audio automáticamente con Whisper API de OpenAI'],
      cannot:['Midjourney: NO tiene API oficial — solo opera vía Discord de forma manual','Controlar el 100% del resultado creativo — la IA tiene variabilidad inherente','Garantizar uso comercial sin verificar licencia vigente por plataforma'] },
    agents: { tag:'Automatización', col:'#34d399',
      intro:'Plataforma que usamos para diseñar y ejecutar los workflows de automatización de tu empresa — conectando todos tus sistemas sin intervención manual.',
      b:['Elimina tareas repetitivas que tu equipo hace hoy de forma manual','Conecta tus herramientas actuales sin código, cada automatización visible en tu tracker','Trazabilidad total: sabes qué se ejecutó, cuándo y con qué resultado exacto'],
      can:['Crear y ejecutar workflows complejos con +500 conectores en n8n, Make y Zapier','Activar automatizaciones por webhooks, horarios o eventos de cualquier sistema','Conectar cualquier API con autenticación OAuth, API Key o bearer token','Transformar, enrutar y procesar datos entre todas tus herramientas activas'],
      cannot:['Operar interfaces de escritorio gráficas sin Computer Use configurado','Garantizar disponibilidad de APIs de terceros al 100% del tiempo','Ejecutar acciones en sistemas sin credenciales válidas configuradas'] },
    social: { tag:'Redes Sociales', col:'#60a5fa',
      intro:'Red social que integramos en tu ecosistema para automatizar publicaciones, programar contenido y mantener tu presencia activa sin esfuerzo manual del equipo.',
      b:['Publicación programada y automatizada en múltiples canales simultáneos','Métricas de rendimiento integradas en tu dashboard de proyecto en tiempo real','Respuestas y gestión de comunidad con IA activada automáticamente'],
      can:['Publicar y programar en YouTube, Facebook, Pinterest y X/Twitter vía API oficial','Leer analytics, estadísticas e insights con los permisos correctos configurados','Responder y moderar comentarios en Facebook y YouTube automáticamente','Monitorear menciones y palabras clave para activar respuestas con IA'],
      cannot:['Instagram: los DMs iniciados por la marca están restringidos por política de Meta','TikTok: API de publicación muy limitada, sin acceso a mensajes directos vía API','LinkedIn: automatizar mensajes directos viola los Términos de Servicio activos','Garantizar alcance o engagement — los algoritmos de plataformas no son controlables'] },
    crm: { tag:'CRM & Marketing', col:'#fb923c',
      intro:'Herramienta de CRM y marketing que conectamos a tu ecosistema para centralizar contactos, automatizar campañas y seguir el ciclo de ventas completo.',
      b:['Pipeline de ventas automatizado y completamente visible en tiempo real','Campañas activadas por comportamiento del usuario — sin envíos manuales','Integración con tus agentes IA para seguimiento inteligente de cada prospecto'],
      can:['Crear, actualizar y segmentar contactos y pipelines vía API en tiempo real','Activar secuencias de email y campañas automáticas por comportamiento del usuario','Procesar pagos y suscripciones recurrentes con Stripe API sin intervención manual','Sincronizar datos entre CRM, redes de ads y el resto de herramientas automáticamente'],
      cannot:['Acceder a datos de prospectos sin consentimiento — aplica LFPDPPP en México','Garantizar entregabilidad de email — depende de reputación y proveedor','Evadir filtros de spam de plataformas externas de envío'] },
    design: { tag:'Diseño & Producción', col:'#e879f9',
      intro:'Herramienta de diseño y producción creativa que usamos para todos los entregables visuales — desde identidad de marca hasta multimedia y motion.',
      b:['Entregables de diseño profesional descargables directamente desde tu panel','Flujo de revisión y aprobación visible en el tracker en tiempo real','Producción acelerada con IA generativa integrada en el proceso creativo'],
      can:['Leer diseños y exportar assets de Figma vía API oficial en tiempo real','Automatizar acciones en Photoshop e Illustrator con scripts UXP/ExtendScript','Ejecutar scripts en After Effects y Premiere Pro para flujos de producción','Acceder y gestionar archivos en la nube de Adobe CC vía Adobe API'],
      cannot:['Crear diseños creativos de cero de forma autónoma sin revisión humana','Garantizar consistencia de marca sin un sistema de diseño configurado','Automatizar Figma para generar nuevos frames de diseño vía API pública'] },
    prod: { tag:'Productividad', col:'#facc15',
      intro:'Herramienta de gestión que integramos para centralizar información, tareas y documentación de tu equipo — todo sincronizado con tu ecosistema digital.',
      b:['Sincronización automática con el resto de herramientas de tu empresa','Automatizaciones que eliminan la captura manual de datos y status','Visibilidad total del avance de proyectos sin reuniones de seguimiento innecesarias'],
      can:['Crear, leer y actualizar páginas y bases de datos en Notion via API','Leer y escribir archivos, carpetas y hojas en Google Drive y Google Sheets','Crear eventos, invitaciones y recordatorios automáticos en Google Calendar','Sincronizar tareas y proyectos entre Asana, ClickUp, Linear y Jira sin intervención'],
      cannot:['Realizar llamadas o videoconferencias en nombre del equipo','Borrar archivos o proyectos sin confirmación explícita del sistema','Garantizar sincronización en tiempo real sin webhooks o triggers configurados'] },
    comms: { tag:'Comunicación', col:'#38bdf8',
      intro:'Canal de comunicación que automatizamos para que tu empresa llegue a clientes, equipos y prospectos en el momento correcto con el mensaje correcto.',
      b:['Chatbots y respuestas automáticas con IA directamente en tu canal preferido','Notificaciones y seguimientos activados por eventos de tu CRM automáticamente','Escalado inteligente a humanos cuando la IA no puede resolver el caso'],
      can:['Enviar notificaciones y mensajes template aprobados por WhatsApp Business API','Crear bots de Telegram con flujos de conversación automatizados completos','Postear mensajes y alertas en canales de Slack y Discord programáticamente','Enviar emails transaccionales con Gmail API, SendGrid y Twilio a escala'],
      cannot:['WhatsApp: no se puede iniciar conversación sin opt-in previo del destinatario','WhatsApp: los templates de mensaje requieren aprobación de Meta (24–72 h)','Acceder a mensajes cifrados E2E de cuentas personales de usuarios'] },
    dev: { tag:'Desarrollo & Cloud', col:'#4ade80',
      intro:'Herramienta de desarrollo y nube que usamos para construir, desplegar y escalar tu ecosistema digital con infraestructura confiable y costos trazables.',
      b:['Deployments automatizados con CI/CD — cada cambio registrado en tu panel','Infraestructura escalable que crece con tu negocio sin fricciones técnicas','Costos de nube transparentes y detallados en tu tracker de proyecto'],
      can:['Crear repositorios, gestionar PRs y disparar Actions con GitHub/GitLab API','Activar deployments y rollbacks instantáneos en Vercel, Firebase o AWS','Provisionar y gestionar recursos de nube (EC2, S3, Lambda) con SDK oficial','Construir y desplegar contenedores Docker en cualquier nube o servidor propio'],
      cannot:['Debuggear errores de runtime sin acceso a logs correctamente configurado','Garantizar seguridad del código desplegado sin auditoría de seguridad previa','Escalar infraestructura sin límites de presupuesto configurados en la nube'] },
    db: { tag:'Base de Datos', col:'#a3e635',
      intro:'Sistema de base de datos que configuramos como parte de tu ecosistema para almacenar, consultar y conectar tu información de forma segura y eficiente.',
      b:['Tus datos almacenados en infraestructura bajo tu control total','Consultas en tiempo real para agentes IA, dashboards y reportes automatizados','Backup cifrado diario — recuperación garantizada en menos de 4 horas'],
      can:['Ejecutar queries, inserciones y actualizaciones en cualquier base de datos','Configurar suscripciones realtime con Supabase y Firebase para apps en vivo','Búsqueda vectorial semántica con Pinecone, Qdrant o Weaviate para RAG','Gestionar backups automáticos y restauración de snapshots programados'],
      cannot:['Recuperar datos borrados sin backup previo configurado y activo','Garantizar rendimiento de queries sin índices y estructura correctamente diseñados','Acceder a bases de datos sin credenciales o conectividad de red configurada'] },
    mcp: { tag:'MCP Server', col:'#c4b5fd',
      intro:'MCP Server (Model Context Protocol) que conectamos a tus modelos de IA para darles capacidades reales: leer datos, ejecutar acciones y operar herramientas externas.',
      b:['Tu IA puede leer, escribir y ejecutar acciones en herramientas del mundo real','Extiende las capacidades de tus agentes sin necesidad de código adicional','Cada acción del MCP es completamente trazable en tu panel de proyecto'],
      can:['Dar a la IA acceso a navegadores web completos con Playwright MCP','Buscar en internet en tiempo real con Brave Search y Exa MCP integrados','Leer y modificar bases de datos directamente desde el agente con MCP','Acceder a documentación técnica y código de repos con Context7 y Greptile MCP'],
      cannot:['Ejecutar acciones irreversibles sin confirmación explícita del usuario','Acceder a sistemas sin credenciales válidas configuradas en el servidor MCP','Garantizar exactitud absoluta de búsquedas — los resultados tienen variabilidad'] },
    sec: { tag:'Seguridad', col:'#34d399',
      intro:'Herramienta de seguridad que implementamos para proteger tu ecosistema digital, detectar amenazas y garantizar que tus datos estén siempre resguardados.',
      b:['Monitoreo 24/7 con alertas automáticas ante cualquier anomalía detectada','Protección de credenciales, accesos y datos sensibles de tu empresa','Cumplimiento de políticas de seguridad documentado y visible en tu historial'],
      can:['Monitorear disponibilidad 24/7 y alertas instantáneas con Uptime Robot','Detectar vulnerabilidades en código y dependencias automáticamente con Snyk','Bloquear tráfico malicioso y ataques DDoS con Cloudflare WAF activo','Centralizar y rotar credenciales y secretos con Bitwarden Secrets API'],
      cannot:['Prevenir el 100% de los ataques — la seguridad es probabilística, no absoluta','Recuperar datos cifrados si las claves maestras se pierden sin backup de llaves','Garantizar cumplimiento normativo específico sin auditoría legal formal previa'] },
    adobe: { tag:'Adobe Creative Cloud', col:'#FF2BC2',
      intro:'Suite completa de herramientas creativas de Adobe que integramos para automatizar producción de contenido, gestión de assets y flujos de aprobación en tu empresa.',
      b:['Producción creativa profesional 100% integrada en tu ecosistema digital','Automatización de flujos de edición, conversión y gestión de archivos creativos','Assets y documentos sincronizados con toda tu cadena de trabajo sin fricciones'],
      can:['Automatizar flujos de Photoshop e Illustrator con UXP y ExtendScript via API','Procesar y firmar documentos PDF automáticamente con Adobe Sign REST API','Buscar y licenciar assets de Adobe Stock desde tus flujos de trabajo','Sincronizar bibliotecas de assets y archivos con Adobe Creative Cloud API'],
      cannot:['Audition y Animate: sin API web — solo scripting local, no automatizable remotamente','Fresco y Aero: sin integración de API pública disponible actualmente','Generar contenido creativo sin revisión humana — la IA asiste, no reemplaza'] }
  };

  var OVERRIDES = {
    'Midjourney': {
      cannot: ['Sin API oficial — Midjourney solo funciona manualmente vía Discord','No es posible automatizar ni integrar generación de imágenes en flujos de trabajo','Los prompts, resultados y variaciones no son programables de forma externa']
    },
    'Instagram': {
      cannot: ['Los DMs no pueden ser iniciados por la marca — restricción activa de Meta','La publicación de Reels en cuentas personales requiere confirmación manual','No se puede automatizar interacción (likes, seguidos, engagement) bajo ningún método']
    },
    'TikTok': {
      cannot: ['API de publicación muy limitada — exclusiva para cuentas Business verificadas','Sin acceso a DMs vía API — automatizar mensajes directos viola sus políticas','Analytics y datos de audiencia muy restringidos comparado con otras plataformas']
    },
    'LinkedIn': {
      cannot: ['Automatizar mensajes directos viola explícitamente los Términos de Servicio','Rate limits muy estrictos — la plataforma detecta y bloquea automatización agresiva','Scraping de perfiles o datos masivos no está permitido bajo ninguna circunstancia']
    }
  };

  function hexAlpha(hex, a) {
    var r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
    return 'rgba('+r+','+g+','+b+','+a+')';
  }

  return function open(t) {
    var ctx = CC[t.c] || { tag: t.c, col: '#ffaa17', intro: t.d, b: [], can: [], cannot: [] };
    var ov = OVERRIDES[t.n] || {};
    var logoEl = document.getElementById('imLogo');
    logoEl.innerHTML = t.l
      ? '<img src="'+t.l+'" alt="'+t.n+'">'
      : '<span class="int-modal-logo-abbr" style="'+t.s+'">'+t.t+'</span>';
    var tagEl = document.getElementById('imTag');
    tagEl.textContent = ctx.tag;
    tagEl.style.cssText = 'color:'+ctx.col+';border-color:'+hexAlpha(ctx.col,0.25)+';background:'+hexAlpha(ctx.col,0.07)+';';
    document.getElementById('imName').textContent = t.n;
    document.getElementById('imIntro').textContent = ctx.intro;
    document.getElementById('imList').innerHTML = ctx.b.map(function(b){
      return '<li><span class="int-modal-check">&#x2192;</span>'+b+'</li>';
    }).join('');
    var canItems = ov.can || ctx.can || [];
    document.getElementById('imCan').innerHTML = canItems.map(function(b){
      return '<li>'+b+'</li>';
    }).join('');
    var cannotItems = ov.cannot || ctx.cannot || [];
    document.getElementById('imCannot').innerHTML = cannotItems.map(function(b){
      return '<li>'+b+'</li>';
    }).join('');
    document.getElementById('intModalOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  };
})();"""

# Find the old _openIM block (from 'window._openIM = (function()' to the closing '})();')
old_start = 'window._openIM = (function() {'
old_end = '})();\n\nfunction closeIntModal()'

if old_start in html:
    start_idx = html.index(old_start)
    end_marker = '})();\n\nfunction closeIntModal()'
    if end_marker in html:
        end_idx = html.index(end_marker) + len('})();')
        old_block = html[start_idx:end_idx]
        html = html[:start_idx] + NEW_OPEN_IM + html[end_idx:]
        changes.append('replaced: window._openIM with can/cannot version')
    else:
        # Try alternative ending
        end_marker2 = '})();\nfunction closeIntModal()'
        if end_marker2 in html:
            end_idx = html.index(end_marker2) + len('})();')
            html = html[:start_idx] + NEW_OPEN_IM + html[end_idx:]
            changes.append('replaced: window._openIM with can/cannot version (alt end)')
        else:
            print('WARNING: could not find end of _openIM block')

# ─────────────────────────────────────────────
# WRITE OUTPUT
# ─────────────────────────────────────────────
with open(PATH, 'w', encoding='utf-8') as f:
    f.write(html)

print(f'Done. {len(html)} chars (was {original_len})')
for c in changes:
    print(f'  {c}')
