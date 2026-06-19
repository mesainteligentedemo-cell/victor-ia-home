// water-trail.js — marble reveal on mousemove/touch
// D_BASE=30 D_HOLD=1400 D_FADE=1200
(function () {
  'use strict';
  const D_BASE = 30, D_HOLD = 1400, D_FADE = 1200;

  function initReveal(canvas) {
    const ctx = canvas.getContext('2d');
    let W, H;

    function resize() {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      ctx.fillStyle = 'rgba(248,247,245,1)';
      ctx.fillRect(0, 0, W, H);
    }
    resize();
    window.addEventListener('resize', resize);

    const drops = [];

    function addDrop(x, y) {
      drops.push({ x, y, r: D_BASE, born: Date.now() });
    }

    function loop() {
      requestAnimationFrame(loop);
      // redraw light overlay
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(248,247,245,0.04)';
      ctx.fillRect(0, 0, W, H);

      ctx.globalCompositeOperation = 'destination-out';
      const now = Date.now();
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        const age = now - d.born;
        if (age > D_HOLD + D_FADE) { drops.splice(i, 1); continue; }
        let alpha = 1;
        if (age > D_HOLD) alpha = 1 - (age - D_HOLD) / D_FADE;
        const grad = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r);
        grad.addColorStop(0, `rgba(0,0,0,${alpha})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    }
    loop();

    function onMove(e) {
      const rect = canvas.getBoundingClientRect();
      const src = e.touches ? e.touches[0] : e;
      addDrop(src.clientX - rect.left, src.clientY - rect.top);
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: true });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('canvas.reveal-canvas').forEach(initReveal);
  });
})();
