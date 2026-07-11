/**
 * Hero Frame Scrubber — Cloudinary CDN
 * Scrolls through frame sequence on hero section
 * Canvas: #reveal-canvas (fixed, z-0)
 * Trigger: .marble-section (hero)
 * Source: /assets/frames-manifest.json (URLs list)
 */

(function () {
  'use strict';

  const canvas = document.querySelector('#reveal-canvas');
  if (!canvas) {
    console.warn('[hero-frame-scrub] Canvas #reveal-canvas not found');
    return;
  }

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) {
    console.warn('[hero-frame-scrub] Could not get 2D context');
    return;
  }

  const hero = document.querySelector('.marble-section');
  if (!hero) {
    console.warn('[hero-frame-scrub] Hero section .marble-section not found');
    return;
  }

  /* ---------- Configuration ---------- */
  const MANIFEST_URL = '/assets/frames-manifest.json';
  const PRELOAD_RADIUS = 50; /* frames to keep loaded before/after current */
  const READY_THRESHOLD = 0.30; /* show frames at 30% loaded */

  /* ---------- Mobile fallback ---------- */
  const isMobile =
    window.matchMedia('(pointer: coarse)').matches ||
    window.matchMedia('(max-width: 900px)').matches;

  /* ---------- State ---------- */
  let frameUrls = [];
  let totalFrames = 0;
  let preloadedFrames = new Map(); /* cached Image objects */
  let currentFrameIndex = -1;
  let lastDrawnIndex = -1;
  let isReady = false;
  let loadedCount = 0;

  /* ---------- Canvas sizing ---------- */
  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resizeCanvas();
      drawCurrent();
    }, 100);
  });

  /* ---------- Frame loading ---------- */
  function loadFrame(index) {
    return new Promise((resolve) => {
      if (preloadedFrames.has(index)) {
        resolve(preloadedFrames.get(index));
        return;
      }

      if (index < 0 || index >= totalFrames) {
        resolve(null);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        preloadedFrames.set(index, img);
        loadedCount++;

        if (!isReady && loadedCount / totalFrames >= READY_THRESHOLD) {
          isReady = true;
        }

        resolve(img);
      };
      img.onerror = () => {
        console.warn(`Frame ${index} failed to load`);
        resolve(null);
      };

      img.src = frameUrls[index];
    });
  }

  async function preloadFramesAround(centerIndex, radius) {
    const start = Math.max(0, centerIndex - radius);
    const end = Math.min(totalFrames - 1, centerIndex + radius);

    const promises = [];
    for (let i = start; i <= end; i++) {
      if (!preloadedFrames.has(i)) {
        promises.push(loadFrame(i));
      }
    }

    /* Don't await — load in background */
    Promise.all(promises).catch(() => {});
  }

  /* ---------- Frame rendering ---------- */
  function drawCover(img) {
    if (!img || !img.naturalWidth) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = canvas.width / dpr;
    const ch = canvas.height / dpr;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    /* Aspect-fill */
    const ratio = Math.max(cw / iw, ch / ih);
    const w = iw * ratio;
    const h = ih * ratio;
    const x = (cw - w) / 2;
    const y = (ch - h) / 2;

    ctx.fillStyle = '#0A0E12';
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, x, y, w, h);
  }

  function drawCurrent() {
    if (!isReady || currentFrameIndex < 0) return;

    const img = preloadedFrames.get(currentFrameIndex);
    if (img && img.complete && lastDrawnIndex !== currentFrameIndex) {
      drawCover(img);
      lastDrawnIndex = currentFrameIndex;
    } else if (!img && lastDrawnIndex !== currentFrameIndex) {
      /* Try nearest frame within ±10 */
      let near = currentFrameIndex;
      for (let d = 1; d <= 10; d++) {
        const before = currentFrameIndex - d;
        const after = currentFrameIndex + d;

        if (before >= 0) {
          const imgBefore = preloadedFrames.get(before);
          if (imgBefore && imgBefore.complete) {
            near = before;
            break;
          }
        }

        if (after < totalFrames) {
          const imgAfter = preloadedFrames.get(after);
          if (imgAfter && imgAfter.complete) {
            near = after;
            break;
          }
        }
      }

      const nearImg = preloadedFrames.get(near);
      if (nearImg && nearImg.complete && lastDrawnIndex !== near) {
        drawCover(nearImg);
        lastDrawnIndex = near;
      }
    }
  }

  /* ---------- Scroll trigger ---------- */
  function getHeroProgress() {
    const rect = hero.getBoundingClientRect();
    const heroHeight = rect.height;
    const viewportHeight = window.innerHeight;

    /* Progress from top of hero to 80% of hero visible */
    const start = -viewportHeight;
    const end = heroHeight * 0.8;
    const distance = end - start;

    const current = rect.top - viewportHeight;
    const progress = Math.max(0, Math.min(1, (current - start) / distance));

    return progress;
  }

  let lastProgress = -1;

  function updateFrameIndex() {
    const progress = getHeroProgress();

    if (progress !== lastProgress) {
      lastProgress = progress;

      const newIndex = Math.floor(progress * (totalFrames - 1));
      if (newIndex !== currentFrameIndex) {
        currentFrameIndex = newIndex;
        drawCurrent();
        preloadFramesAround(currentFrameIndex, PRELOAD_RADIUS);
      }
    }
  }

  window.addEventListener('scroll', updateFrameIndex, { passive: true });

  /* ---------- Init ---------- */
  async function init() {
    resizeCanvas();

    /* Fetch manifest */
    try {
      const response = await fetch(MANIFEST_URL);
      if (!response.ok) {
        console.warn(
          `[hero-frame-scrub] Failed to fetch manifest: HTTP ${response.status}`
        );
        return;
      }

      const manifest = await response.json();
      frameUrls = manifest.frames || [];
      totalFrames = frameUrls.length;

      if (totalFrames === 0) {
        console.warn('[hero-frame-scrub] Manifest is empty');
        return;
      }

      console.log(
        `[hero-frame-scrub] Loaded manifest: ${totalFrames} frames`
      );

      /* Mobile: just load first frame statically */
      if (isMobile) {
        console.log('[hero-frame-scrub] Mobile detected, loading first frame only');
        const img = await loadFrame(0);
        if (img) {
          isReady = true;
          drawCover(img);
        }
        return;
      }

      /* Desktop: preload first batch */
      await preloadFramesAround(0, PRELOAD_RADIUS);
      isReady = true;

      /* Trigger first frame draw */
      updateFrameIndex();

      /* Start animation loop */
      function tick() {
        updateFrameIndex();
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    } catch (e) {
      console.error('[hero-frame-scrub] Init error:', e);
    }
  }

  /* Wait for DOM ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();