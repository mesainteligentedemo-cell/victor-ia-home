// CONVERTER SYSTEM - Handles lead magnets, pop-ups, and conversion tracking
// v2 — Trigger inteligente: scroll 70% OR exit-intent · Estilo Victor IA (Fraunces + Inter, marble light)
class ConverterManager {
  constructor(options = {}) {
    this.articleSlug = options.articleSlug || this.extractSlugFromURL();
    this.guideTitle = options.guideTitle || 'Guía Exclusiva';
    this.guideName = options.guideName || this.articleSlug;
    this.n8nWebhook = options.n8nWebhook || 'https://hook.n8n.cloud/webhook/victor-ia-blog-conversions';
    this.telegramChatId = options.telegramChatId || null; // Will be set by user
    this.hasTriggered = false; // Se muestra UNA sola vez por sesión de lectura
    this.init();
  }

  extractSlugFromURL() {
    const path = window.location.pathname;
    return path.split('/').pop().replace('.html', '');
  }

  init() {
    this.modal = document.getElementById('converter-modal');
    this.form = document.getElementById('converter-form');
    this.closeBtn = document.querySelector('.converter-close');
    this.overlay = document.querySelector('.converter-overlay');

    if (!this.modal || !this.form) {
      console.warn('Converter modal not found in DOM');
      return;
    }

    // Event listeners
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    this.closeBtn.addEventListener('click', () => this.closeModal());
    this.overlay.addEventListener('click', () => this.closeModal());
    // Cerrar con tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.modal.classList.contains('hidden')) {
        this.closeModal();
      }
    });

    // Triggers inteligentes (reemplazan el timer de 15s)
    this.setupScrollTrigger();
    this.setupExitIntent();
  }

  // Muestra el modal cuando el usuario llega al 70% del scroll
  setupScrollTrigger() {
    const onScroll = () => {
      if (this.hasTriggered) return;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const scrollPercent = (window.scrollY / scrollable) * 100;
      if (scrollPercent >= 70) {
        this.triggerModal();
        window.removeEventListener('scroll', onScroll);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Muestra el modal cuando el usuario intenta salir (mouse hacia arriba del viewport)
  setupExitIntent() {
    document.addEventListener('mouseleave', (e) => {
      if (e.clientY <= 0 && !this.hasTriggered) {
        this.triggerModal();
      }
    });
  }

  // Dispara el modal una única vez
  triggerModal() {
    if (this.hasTriggered) return;
    this.hasTriggered = true;
    this.openModal();
  }

  openModal() {
    if (this.modal) {
      this.modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  }

  closeModal() {
    if (this.modal) {
      this.modal.classList.add('hidden');
      document.body.style.overflow = 'auto';
    }
  }

  async handleSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('converter-name').value.trim();
    const email = document.getElementById('converter-email').value.trim();
    const phone = document.getElementById('converter-phone').value.trim();

    if (!name || !email) {
      this.showError('Por favor completa nombre y email');
      return;
    }

    // Disable button during submission
    const submitBtn = this.form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    try {
      // Send conversion data to n8n
      await this.sendConversion({
        name,
        email,
        phone,
        article: this.articleSlug,
        guide: this.guideName,
        timestamp: new Date().toISOString(),
        source: 'blog-converter',
        userAgent: navigator.userAgent,
      });

      // Trigger download (simulate or use actual guide file)
      this.triggerDownload();

      // Show success message
      this.showSuccess('¡Guía enviada! Revisa tu email.');

      // Reset form and close modal after 2 seconds
      setTimeout(() => {
        this.form.reset();
        this.closeModal();
        submitBtn.disabled = false;
        submitBtn.textContent = 'Descargar Guía Ahora';
      }, 2000);
    } catch (error) {
      console.error('Conversion submission failed:', error);
      this.showError('Error al enviar. Intenta de nuevo.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Descargar Guía Ahora';
    }
  }

  async sendConversion(data) {
    // Send to n8n webhook (email + Telegram)
    const response = await fetch(this.n8nWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  }

  triggerDownload() {
    // Download guide (HTML that can be printed to PDF)
    const guideUrl = `/blog/guides/${this.guideName}.html`;

    // Open in new tab so user can save as PDF
    const link = document.createElement('a');
    link.href = guideUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Track download in analytics
    this.trackEvent('guide_download', {
      article: this.articleSlug,
      guide: this.guideName,
    });
  }

  showSuccess(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'converter-success';
    messageDiv.textContent = message;

    const formContainer = this.form.parentElement;
    formContainer.appendChild(messageDiv);

    // Remove after 3 seconds
    setTimeout(() => {
      messageDiv.remove();
    }, 3000);
  }

  showError(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'converter-error';
    messageDiv.textContent = message;

    const formContainer = this.form.parentElement;
    formContainer.appendChild(messageDiv);

    // Remove after 3 seconds
    setTimeout(() => {
      messageDiv.remove();
    }, 3000);
  }

  trackEvent(eventName, eventData = {}) {
    // Send to analytics (Google Analytics, Mixpanel, etc.)
    if (window.gtag) {
      gtag('event', eventName, eventData);
    }

    // Log to console in development
    console.log(`[Converter Event] ${eventName}`, eventData);
  }
}

// Inyecta las fonts Victor IA (Fraunces + Inter) si aún no están cargadas
function injectConverterFonts() {
  if (document.getElementById('converter-fonts')) return;
  const link = document.createElement('link');
  link.id = 'converter-fonts';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400&family=Inter:wght@300;400;500&display=swap';
  document.head.appendChild(link);
}

// Inyecta el estilo Victor IA (marble light) que sobrescribe cualquier CSS previo del converter
function injectConverterStyles() {
  if (document.getElementById('converter-victoria-styles')) return;
  const style = document.createElement('style');
  style.id = 'converter-victoria-styles';
  style.textContent = `
    /* ===== Victor IA Lead Popup — marble light ===== */
    #converter-modal.converter-modal {
      position: fixed; inset: 0; z-index: 9999;
      display: flex; align-items: center; justify-content: center;
      padding: 20px;
      opacity: 1; visibility: visible;
      transition: opacity .35s ease, visibility .35s ease;
    }
    #converter-modal.converter-modal.hidden {
      opacity: 0; visibility: hidden; pointer-events: none;
    }
    #converter-modal .converter-overlay {
      position: absolute; inset: 0;
      background: rgba(0,0,0,.4);
      -webkit-backdrop-filter: blur(4px);
      backdrop-filter: blur(4px);
    }
    #converter-modal .converter-container {
      position: relative;
      background: #FFFFFF;
      border: 1px solid rgba(26,26,26,.12);
      border-radius: 12px;
      padding: 40px;
      max-width: 480px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(26,26,26,.15);
      transform: translateY(16px) scale(.98);
      transition: transform .4s cubic-bezier(.16,1,.3,1);
      max-height: 92vh; overflow-y: auto;
    }
    #converter-modal:not(.hidden) .converter-container {
      transform: translateY(0) scale(1);
    }
    #converter-modal .converter-close {
      position: absolute; top: 16px; right: 16px;
      background: none; border: none;
      font-size: 24px; line-height: 1; color: #666666;
      cursor: pointer; padding: 0;
      width: 32px; height: 32px;
      display: flex; align-items: center; justify-content: center;
      border-radius: 50%;
      transition: color .2s ease, background .2s ease;
    }
    #converter-modal .converter-close:hover {
      color: #000000; background: rgba(26,26,26,.06);
    }
    /* Ebook 3D mockup — reestilizado sutil para light theme */
    #converter-modal .converter-ebook {
      display: flex; justify-content: center; margin-bottom: 24px;
      perspective: 900px;
    }
    #converter-modal .converter-book {
      width: 120px; height: 160px; position: relative;
      transform: rotateY(-22deg); transform-style: preserve-3d;
      transition: transform .5s ease;
    }
    #converter-modal .converter-ebook:hover .converter-book { transform: rotateY(-12deg); }
    #converter-modal .converter-book-front {
      position: absolute; inset: 0;
      background: linear-gradient(135deg, #1A1A1A 0%, #333333 100%);
      color: #FFFFFF;
      font-family: 'Fraunces', serif; font-weight: 300; font-size: 13px;
      line-height: 1.3; padding: 16px 14px;
      border-radius: 3px 6px 6px 3px;
      display: flex; align-items: flex-end;
      box-shadow: 0 10px 30px rgba(26,26,26,.25);
    }
    #converter-modal .converter-book-front::before { display: none; }
    #converter-modal .converter-book-spine,
    #converter-modal .converter-book-back { display: none; }
    #converter-modal .converter-content { text-align: left; }
    #converter-modal .converter-label {
      font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 500;
      letter-spacing: .14em; text-transform: uppercase;
      color: rgba(0,0,0,.45); margin-bottom: 12px;
    }
    #converter-modal .converter-title {
      font-family: 'Fraunces', serif; font-size: 32px; font-weight: 300;
      line-height: 1.15; color: #000000; margin: 0 0 16px;
    }
    #converter-modal .converter-subtitle {
      font-family: 'Inter', sans-serif; font-size: 16px; font-weight: 300;
      line-height: 1.6; color: rgba(0,0,0,.75); margin: 0 0 24px;
    }
    #converter-modal .converter-form {
      display: flex; flex-direction: column; gap: 12px;
    }
    #converter-modal .converter-form input,
    #converter-modal .converter-form textarea {
      width: 100%; box-sizing: border-box;
      padding: 12px 16px;
      background: #FFFFFF;
      border: 1px solid rgba(26,26,26,.2);
      border-radius: 5px;
      font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 300;
      color: #1A1A1A;
      transition: border-color .2s ease, box-shadow .2s ease;
    }
    #converter-modal .converter-form input::placeholder,
    #converter-modal .converter-form textarea::placeholder {
      color: rgba(0,0,0,.4);
    }
    #converter-modal .converter-form input:focus,
    #converter-modal .converter-form textarea:focus {
      outline: none;
      border-color: rgba(26,26,26,.5);
      box-shadow: 0 0 0 3px rgba(26,26,26,.06);
    }
    #converter-modal .converter-form button[type="submit"] {
      width: 100%;
      margin-top: 4px;
      background: #1A1A1A; color: #FFFFFF;
      border: none; border-radius: 5px;
      padding: 13px 24px;
      font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 500;
      letter-spacing: .07em; text-transform: uppercase;
      cursor: pointer;
      transition: background .25s ease, transform .1s ease;
    }
    #converter-modal .converter-form button[type="submit"]:hover { background: #333333; }
    #converter-modal .converter-form button[type="submit"]:active { transform: translateY(1px); }
    #converter-modal .converter-form button[type="submit"]:disabled {
      opacity: .6; cursor: default;
    }
    #converter-modal .converter-privacy {
      font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 300;
      color: rgba(0,0,0,.5); margin-top: 16px; text-align: center;
    }
    #converter-modal .converter-privacy a { color: rgba(0,0,0,.7); text-decoration: underline; }
    #converter-modal .converter-privacy a:hover { color: #000000; }
    #converter-modal .converter-success,
    #converter-modal .converter-error {
      margin-top: 14px; padding: 10px 14px; border-radius: 5px;
      font-family: 'Inter', sans-serif; font-size: 13px; text-align: center;
    }
    #converter-modal .converter-success { background: rgba(20,120,60,.1); color: #147a3c; }
    #converter-modal .converter-error { background: rgba(180,30,30,.08); color: #b41e1e; }
    /* Responsive mobile */
    @media (max-width: 520px) {
      #converter-modal .converter-container { padding: 28px 22px; border-radius: 10px; }
      #converter-modal .converter-title { font-size: 26px; }
      #converter-modal .converter-subtitle { font-size: 15px; }
      #converter-modal .converter-book { width: 96px; height: 128px; }
    }
  `;
  document.head.appendChild(style);
}

// Genera el HTML del modal dinámicamente si no existe
function injectConverterModal(options = {}) {
  if (document.getElementById('converter-modal')) return; // Ya existe

  const articleSlug = options.articleSlug ||
    window.location.pathname.split('/').pop().replace('.html', '');
  const guideTitle = options.guideTitle || 'Guía Exclusiva';
  const guideName = options.guideName || articleSlug;

  const modalHTML = `
    <div id="converter-modal" class="converter-modal hidden"
         data-article-slug="${articleSlug}"
         data-guide-title="${guideTitle}"
         data-guide-name="${guideName}">
      <div class="converter-overlay"></div>
      <div class="converter-container">
        <button class="converter-close" type="button" aria-label="Cerrar">×</button>

        <!-- 3D EBOOK MOCKUP -->
        <div class="converter-ebook">
          <div class="converter-book">
            <div class="converter-book-front">
              ${guideTitle}
            </div>
            <div class="converter-book-spine"></div>
            <div class="converter-book-back"></div>
          </div>
        </div>

        <!-- FORM CONTENT -->
        <div class="converter-content">
          <div class="converter-label">Acceso Gratuito</div>
          <h2 class="converter-title">${guideTitle}</h2>
          <p class="converter-subtitle">Descárgala ahora — casos de éxito, roadmap y mejores prácticas. Sin spam, sin compromisos.</p>

          <form id="converter-form" class="converter-form">
            <input
              type="text"
              id="converter-name"
              name="name"
              placeholder="Tu nombre"
              required />

            <input
              type="email"
              id="converter-email"
              name="email"
              placeholder="tu@email.com"
              required />

            <input
              type="tel"
              id="converter-phone"
              name="phone"
              placeholder="Teléfono (opcional)" />

            <button type="submit">Descargar Guía Ahora</button>
          </form>

          <div class="converter-privacy">
            Protegemos tu privacidad. <a href="/privacidad">Ver política de privacidad</a>
          </div>
        </div>
      </div>
    </div>
  `;

  // Inyectar en el body
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Cargar fonts + estilo Victor IA antes de mostrar el modal
  injectConverterFonts();
  injectConverterStyles();

  // Inyectar modal si no existe
  const articleSlug = window.location.pathname.split('/').pop().replace('.html', '');
  injectConverterModal({
    articleSlug: articleSlug,
    guideTitle: document.querySelector('.converter-title')?.textContent || 'Guía Exclusiva',
    guideName: articleSlug,
  });

  // Obtener opciones del modal
  const modal = document.getElementById('converter-modal');
  if (modal) {
    const options = {
      articleSlug: modal.dataset.articleSlug,
      guideTitle: modal.dataset.guideTitle,
      guideName: modal.dataset.guideName,
    };

    window.converterManager = new ConverterManager(options);
  }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ConverterManager;
}
