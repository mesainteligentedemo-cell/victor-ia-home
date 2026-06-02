// CONVERTER SYSTEM - Handles lead magnets, pop-ups, and conversion tracking
class ConverterManager {
  constructor(options = {}) {
    this.articleSlug = options.articleSlug || this.extractSlugFromURL();
    this.guideTitle = options.guideTitle || 'Guía Exclusiva';
    this.guideName = options.guideName || this.articleSlug;
    this.n8nWebhook = options.n8nWebhook || 'https://hook.n8n.cloud/webhook/victor-ia-blog-conversions';
    this.telegramChatId = options.telegramChatId || null; // Will be set by user
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

    // Open modal on page load (after delay to avoid annoying user)
    this.scheduleModalOpen();

    // Also open modal on scroll (exit intent)
    this.setupExitIntent();
  }

  scheduleModalOpen() {
    // Show modal after 15 seconds of reading the article
    setTimeout(() => {
      this.openModal();
    }, 15000);
  }

  setupExitIntent() {
    // Show modal when user tries to leave (mouse leaves viewport at top)
    document.addEventListener('mouseleave', (e) => {
      if (e.clientY <= 0 && !this.modal.classList.contains('hidden')) {
        // Optional: re-show if already closed
      }
    });
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

// Genera el HTML del modal 3D dinámicamente si no existe
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
        <button class="converter-close" type="button">×</button>

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
          <p class="converter-subtitle">Descárgala ahora — sin spam, sin compromisos</p>

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
