/* ════════════════════════════════════════════════════════════════
   VICTOR IA — animations.js  (victor-ia.xyz)
   Aditivo y defensivo: no rompe nada si un elemento no existe.
   Respeta prefers-reduced-motion. Auto-detecta markup real del sitio.
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var REDUCED = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else { fn(); }
  }

  /* ── 1 · STAT VALUE GLOW (IntersectionObserver) ──────────────── */
  function initStatGlow() {
    if (REDUCED) return;
    var stats = document.querySelectorAll(
      '.stat-value, .stat-n, [data-animatable="stat"]'
    );
    if (!stats.length || !('IntersectionObserver' in window)) {
      stats.forEach(function (s) { s.classList.add('glow'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('glow');
        } else {
          e.target.classList.remove('glow');
        }
      });
    }, { threshold: 0.4 });
    stats.forEach(function (s) { io.observe(s); });
  }

  /* ── 4 · HERO CHARACTER SPLIT ────────────────────────────────── */
  function splitChars(el) {
    if (el.dataset.charSplit === '1') return;
    el.dataset.charSplit = '1';
    var text = el.textContent;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      var span = document.createElement('span');
      if (ch === ' ') {
        span.className = 'hero-char hero-char--space';
        span.innerHTML = '&nbsp;';
      } else {
        span.className = 'hero-char';
        span.textContent = ch;
      }
      span.style.animationDelay = (i * 0.035) + 's';
      frag.appendChild(span);
    }
    el.textContent = '';
    el.appendChild(frag);
  }

  function initHeroChars() {
    // IMPORTANTE: NO tocar `.si`. El hero headline ya está animado por la
    // timeline nativa de GSAP (heroTL en index.html). Splittear `h1 .si`
    // rompía ese sistema y dejaba el título en conflicto (invisible/saltos).
    // Solo actuamos sobre targets EXPLÍCITOS que el sitio aún no anima.
    var targets = document.querySelectorAll(
      '.hero-char-target, [data-char]'
    );
    if (!targets.length) return;

    targets.forEach(function (el) {
      // Si ya viene marcado como .hero-char individual, no re-splitear
      if (el.classList.contains('hero-char')) return;
      splitChars(el);
    });

    var chars = document.querySelectorAll('.hero-char');
    if (REDUCED) {
      chars.forEach(function (c) {
        c.style.opacity = '1';
        c.style.transform = 'none';
        c.style.filter = 'none';
      });
      return;
    }
    if (!('IntersectionObserver' in window)) {
      chars.forEach(function (c) { c.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    chars.forEach(function (c) { io.observe(c); });
  }

  /* ── 5 · GOLD SHIMMER (auto-tag em/italics en headline) ──────── */
  function initGoldShimmer() {
    // NO aplicar a `h1 .si`: GSAP anima su opacity y -webkit-background-clip:text
    // dejaría el texto transparente durante la entrada (parpadeo/invisible).
    // Solo italics explícitos fuera del hero headline animado.
    var italics = document.querySelectorAll(
      '.hero-headline em, .hero-headline i, [data-gold-shimmer]'
    );
    italics.forEach(function (el) { el.classList.add('gold-shimmer'); });
  }

  /* ── 3+6+12 · HOVERS & MOBILE ACTIVE STATES ──────────────────── */
  function initInteractions() {
    var ctas = document.querySelectorAll('.cta, .btn-p, .btn-g');
    ctas.forEach(function (btn) {
      // Mobile active feedback (CSS hace el scale; aquí garantizamos
      // que el tap quite el foco persistente)
      btn.addEventListener('touchend', function () {
        var b = this;
        b.classList.add('is-tapped');
        setTimeout(function () { b.classList.remove('is-tapped'); }, 250);
      }, { passive: true });
    });

    // NO tagear `.nav-a` con `.nav-link`: `.nav-a` ya tiene su propio hover
    // nativo (color + subrayado animado). Añadir opacity:.72 lo apagaba.
    // Solo marcamos enlaces que NO tengan ya estilo de nav propio.
    document.querySelectorAll('nav a, header a').forEach(function (a) {
      if (a.classList.contains('nav-a')) return;
      a.classList.add('nav-link');
    });
  }

  /* ── 9 · WORK REEL (asegura clase de zoom) ───────────────────── */
  function initWorkReel() {
    document.querySelectorAll('[data-reel], .work-reel, .reel-item')
      .forEach(function (el) { el.classList.add('work-reel'); });
  }

  /* ── 10 · A11Y PANEL TOGGLE + SWITCHES ───────────────────────── */
  function initA11yPanel() {
    var panel = document.querySelector('.a11y-panel, [data-a11y-panel]');
    var trigger = document.querySelector('[data-a11y-toggle], .a11y-toggle');
    if (panel) panel.classList.add('a11y-panel');

    if (panel && trigger) {
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        var open = panel.classList.toggle('is-open');
        trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      // cerrar con ESC
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') panel.classList.remove('is-open');
      });
    }

    // Switches accesibles
    document.querySelectorAll('.a11y-switch').forEach(function (sw) {
      if (!sw.hasAttribute('role')) sw.setAttribute('role', 'switch');
      if (!sw.hasAttribute('aria-checked'))
        sw.setAttribute('aria-checked', 'false');
      sw.setAttribute('tabindex', '0');
      function toggle() {
        var on = sw.getAttribute('aria-checked') === 'true';
        sw.setAttribute('aria-checked', on ? 'false' : 'true');
        var key = sw.dataset.a11yKey;
        if (key) document.documentElement.classList.toggle('a11y-' + key, !on);
      }
      sw.addEventListener('click', toggle);
      sw.addEventListener('keydown', function (e) {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); }
      });
    });
  }

  /* ── 8 · AMBIENT — inyecta capa de grano si se pide ──────────── */
  function initAmbient() {
    if (REDUCED) return;
    if (document.querySelector('[data-grain]') &&
        !document.querySelector('.amb-grain')) {
      var g = document.createElement('div');
      g.className = 'amb-grain';
      g.setAttribute('aria-hidden', 'true');
      document.body.appendChild(g);
    }
  }

  /* ── 11 · VOICE WAVE (genera barras si el contenedor está vacío) ─ */
  function initVoiceWave() {
    document.querySelectorAll('.voice-wave').forEach(function (w) {
      if (w.children.length) return;
      for (var i = 0; i < 5; i++) w.appendChild(document.createElement('span'));
    });
  }

  /* ── INIT ────────────────────────────────────────────────────── */
  ready(function () {
    try { initStatGlow(); } catch (e) {}
    try { initHeroChars(); } catch (e) {}
    try { initGoldShimmer(); } catch (e) {}
    try { initInteractions(); } catch (e) {}
    try { initWorkReel(); } catch (e) {}
    try { initA11yPanel(); } catch (e) {}
    try { initAmbient(); } catch (e) {}
    try { initVoiceWave(); } catch (e) {}
  });
})();
