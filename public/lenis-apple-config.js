/**
 * LENIS — APPLE SCROLL CALIBRATION
 * Momentum scrolling with natural acceleration/deceleration
 * Duration: 1.2s (matches Apple devices)
 * Easing: Expo out (natural physics)
 */
(function initLenisApple() {
  'use strict';
  if (!window.Lenis) {
    console.error('[Lenis] Library not loaded.');
    return;
  }
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
    smoothWheel: true,
    touchMultiplier: 2,
    wheelMultiplier: 1,
  });
  (function raf(t) {
    lenis.raf(t);
    requestAnimationFrame(raf);
  })(0);
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const pbar = document.getElementById('pbar');
  if (pbar) {
    lenis.on('scroll', ({ progress }) => {
      pbar.style.width = (progress * 100) + '%';
    });
  }
  window.__lenis = lenis;
})();