/*!
 * VICTOR IA â€” Article Reader (lectura por voz del navegador)
 * Sin APIs externas Â· sin claves Â· solo Web Speech API
 * Voz masculina en espaÃ±ol Â· resalta PALABRA por PALABRA
 * Lee h1, h2, h3, pÃ¡rrafos, listas y citas de cada artÃ­culo.
 */
(function () {
  'use strict';

  var prose = document.querySelector('article.prose, article, .prose');
  var path = window.location.pathname;
  if (!prose || /\/blog\/?$/.test(path)) return;
  if (!('speechSynthesis' in window)) return;

  var GOLD = '#0066ff', CREAM = '#efece3', BG = '#191b1f', MUTED = '#8a8d94';

  // â”€â”€ Recolectar bloques legibles en orden (tÃ­tulo + cuerpo) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  function collectBlocks() {
    var blocks = [];
    var h1 = document.querySelector('h1');
    if (h1 && h1.textContent.trim()) blocks.push(h1);
    var nodes = prose.querySelectorAll('h1, h2, h3, h4, p, li, blockquote');
    nodes.forEach(function (n) {
      if (n.closest('#viar')) return;
      if (n === h1) return;
      var t = (n.textContent || '').trim();
      if (t.length < 2) return;
      blocks.push(n);
    });
    return blocks;
  }

  function clean(s) {
    return (s || '')
      .replace(/\s+/g, ' ')
      .replace(/[#*_`>]+/g, '')
      .replace(/\$\s?([0-9])/g, '$1 pesos ')
      .trim();
  }

  // â”€â”€ Word-wrap: envuelve cada palabra en <span> para resaltar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  function wrapWords(el) {
    if (el.dataset.viarWrapped) return;
    el.dataset.viarWrapped = '1';
    el.dataset.viarOrig = el.innerHTML;
    var html = el.innerHTML.replace(/(<[^>]+>)|([^<]+)/g, function (m, tag, txt) {
      if (tag) return tag;
      return txt.replace(/(\S+)/g, '<span class="viar-w">$1</span>');
    });
    el.innerHTML = html;
  }
  function unwrapWords(el) {
    if (el.dataset.viarWrapped && el.dataset.viarOrig != null) {
      el.innerHTML = el.dataset.viarOrig;
      delete el.dataset.viarWrapped;
      delete el.dataset.viarOrig;
    }
  }

  var blocks = [], idx = -1, playing = false, paused = false, curEl = null, voice = null;

  // â”€â”€ Elegir voz MASCULINA en espaÃ±ol â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  function pickVoice() {
    var vs = window.speechSynthesis.getVoices() || [];
    var es = vs.filter(function (v) { return /^es/i.test(v.lang); });
    if (!es.length) es = vs;
    // nombres tÃ­picos de voces masculinas en espaÃ±ol por SO/navegador
    var maleNames = /(jorge|juan|diego|carlos|miguel|pablo|enrique|guillermo|male|hombre|raul|Ã¡lvaro|alvaro|liam|google espaÃ±ol)/i;
    // 1) match explÃ­cito de voz masculina
    var male = es.find(function (v) { return maleNames.test(v.name); });
    if (male) return male;
    // 2) preferir es-MX, luego es-ES, y descartar nombres femeninos comunes
    var femNames = /(paulina|mÃ³nica|monica|laura|sabina|marisol|esperanza|female|mujer|helena|elvira|google espaÃ±ol de estados)/i;
    var nonFem = es.filter(function (v) { return !femNames.test(v.name); });
    var pool = nonFem.length ? nonFem : es;
    var mx = pool.find(function (v) { return /es[-_]MX/i.test(v.lang); });
    var sp = pool.find(function (v) { return /es[-_]ES/i.test(v.lang); });
    return mx || sp || pool[0] || null;
  }

  // â”€â”€ Hablar un bloque con resaltado palabra por palabra â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  function speakBlock(i) {
    if (i < 0 || i >= blocks.length) { stop(); return; }
    idx = i;
    if (curEl) unwrapWords(curEl);
    curEl = blocks[idx];

    wrapWords(curEl);
    var words = curEl.querySelectorAll('.viar-w');
    var spoken = clean(curEl.textContent);

    // map de offset de carÃ¡cter â†’ Ã­ndice de palabra resaltable
    scrollToEl(curEl);

    var u = new SpeechSynthesisUtterance(spoken.slice(0, 1200));
    u.lang = (voice && voice.lang) || 'es-MX';
    u.rate = 0.95;
    u.pitch = 0.92; // ligeramente mÃ¡s grave = mÃ¡s masculino
    if (voice) u.voice = voice;

    var wi = 0;
    u.onboundary = function (e) {
      if (e.name && e.name !== 'word') return;
      // avanzar el resaltado a la palabra correspondiente
      if (words.length) {
        if (wi > 0 && words[wi - 1]) words[wi - 1].classList.remove('viar-hl');
        if (words[wi]) {
          words[wi].classList.add('viar-hl');
          var r = words[wi].getBoundingClientRect();
          if (r.top < 90 || r.bottom > window.innerHeight - 90) scrollToEl(words[wi]);
        }
        wi++;
      }
    };
    u.onend = function () {
      if (curEl) curEl.querySelectorAll('.viar-w.viar-hl').forEach(function (w) { w.classList.remove('viar-hl'); });
      if (!playing) return;
      speakBlock(idx + 1);
    };
    u.onerror = function () { if (playing) speakBlock(idx + 1); };

    window.speechSynthesis.speak(u);
  }

  function scrollToEl(el) {
    var r = el.getBoundingClientRect();
    if (r.top < 90 || r.bottom > window.innerHeight - 90) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function play() {
    if (paused) { window.speechSynthesis.resume(); paused = false; playing = true; render(); return; }
    blocks = collectBlocks();
    if (!blocks.length) return;
    voice = pickVoice();
    window.speechSynthesis.cancel();
    playing = true; paused = false;
    speakBlock(0);
    render();
  }
  function pause() {
    if (!playing) return;
    window.speechSynthesis.pause();
    paused = true; playing = false;
    render();
  }
  function stop() {
    window.speechSynthesis.cancel();
    playing = false; paused = false; idx = -1;
    if (curEl) { curEl.querySelectorAll('.viar-w.viar-hl').forEach(function (w) { w.classList.remove('viar-hl'); }); unwrapWords(curEl); curEl = null; }
    render();
  }

  // â”€â”€ UI â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  var bar;
  function buildUI() {
    var style = document.createElement('style');
    style.textContent =
      '.viar-w{transition:background .12s,color .12s;border-radius:3px}' +
      '.viar-w.viar-hl{background:' + GOLD + ';color:#070708;padding:0 1px}' +
      '#viar{position:fixed;right:22px;bottom:22px;z-index:9000;font-family:-apple-system,Segoe UI,Roboto,sans-serif}' +
      '#viar .viar-fab{display:flex;align-items:center;gap:10px;background:' + BG + ';color:' + CREAM + ';' +
      'border:1px solid rgba(184,154,106,.32);border-radius:40px;padding:12px 20px;cursor:pointer;' +
      'box-shadow:0 8px 30px rgba(0,0,0,.45);font-size:13.5px;letter-spacing:.02em;transition:border-color .3s,transform .2s}' +
      '#viar .viar-fab:hover{border-color:rgba(184,154,106,.6);transform:translateY(-2px)}' +
      '#viar .viar-controls{display:flex;align-items:center;gap:6px;background:' + BG + ';' +
      'border:1px solid rgba(184,154,106,.32);border-radius:40px;padding:8px 10px;box-shadow:0 8px 30px rgba(0,0,0,.45)}' +
      '#viar .viar-ic{width:38px;height:38px;border-radius:50%;border:1px solid rgba(184,154,106,.25);' +
      'background:rgba(184,154,106,.06);color:' + GOLD + ';cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s}' +
      '#viar .viar-ic:hover{background:rgba(184,154,106,.18)}' +
      '#viar .viar-lbl{font-size:11px;color:' + MUTED + ';padding:0 8px;white-space:nowrap}' +
      '@media(max-width:600px){#viar{right:14px;bottom:14px}#viar .viar-fab{padding:11px 16px;font-size:12.5px}}';
    document.head.appendChild(style);
    var wrap = document.createElement('div');
    wrap.id = 'viar';
    document.body.appendChild(wrap);
    bar = wrap;
    render();
  }
  function ico(name) {
    if (name === 'speaker') return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 9v6h4l5 5V4L7 9H3z" stroke="' + GOLD + '" stroke-width="1.5" stroke-linejoin="round"/><path d="M16 8.5a5 5 0 0 1 0 7" stroke="' + GOLD + '" stroke-width="1.5" stroke-linecap="round"/></svg>';
    if (name === 'play') return '<svg width="14" height="14" viewBox="0 0 24 24" fill="' + GOLD + '"><path d="M8 5v14l11-7z"/></svg>';
    if (name === 'pause') return '<svg width="14" height="14" viewBox="0 0 24 24" fill="' + GOLD + '"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>';
    if (name === 'stop') return '<svg width="13" height="13" viewBox="0 0 24 24" fill="' + GOLD + '"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>';
    return '';
  }
  function render() {
    if (!bar) return;
    if (!playing && !paused) {
      bar.innerHTML = '<button class="viar-fab" id="viar-start">' + ico('speaker') + 'Escuchar artÃ­culo</button>';
      document.getElementById('viar-start').onclick = play;
    } else {
      var lbl = playing ? 'Leyendoâ€¦' : 'En pausa';
      bar.innerHTML =
        '<div class="viar-controls">' +
        '<button class="viar-ic" id="viar-toggle" title="' + (playing ? 'Pausar' : 'Reanudar') + '">' + ico(playing ? 'pause' : 'play') + '</button>' +
        '<span class="viar-lbl">' + lbl + '</span>' +
        '<button class="viar-ic" id="viar-stop" title="Detener">' + ico('stop') + '</button>' +
        '</div>';
      document.getElementById('viar-toggle').onclick = function () { playing ? pause() : play(); };
      document.getElementById('viar-stop').onclick = stop;
    }
  }

  window.addEventListener('beforeunload', function () { window.speechSynthesis.cancel(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden && playing) pause(); });
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = function () { voice = pickVoice(); };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', buildUI);
  else buildUI();
})();
