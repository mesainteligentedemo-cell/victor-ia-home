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
    // Create and trigger download of guide PDF/HTML
    // This can be:
    // 1. A pre-generated PDF in /guides/{slug}.pdf
    // 2. A server-generated PDF via API
    // 3. A redirect to external link

    const guideUrl = `/blog/guides/${this.guideName}.pdf`;

    // Create hidden link and click it
    const link = document.createElement('a');
    link.href = guideUrl;
    link.download = `${this.guideName}.pdf`;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Track download in analytics (if needed)
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

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Get converter options from data attributes on converter modal
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
