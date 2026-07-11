// Hero Scroll Frames - Victor IA
// Scroll-scrubbed frame animation via canvas

const HERO_FRAME_COUNT = 400
const framePath = (i) => `/assets/frames/hero/f${String(i + 1).padStart(3, '0')}.jpg`
const FIRST_FRAME = framePath(0)
const LAST_FRAME = framePath(HERO_FRAME_COUNT - 1)

const PHASES = [
  { at: 0, label: 'Sistema dormido' },
  { at: 0.14, label: 'Agentes encendiendo' },
  { at: 0.3, label: 'Orquestación en paralelo' },
  { at: 0.44, label: 'Apertura del núcleo' },
  { at: 0.58, label: 'Circuitos internos' },
  { at: 0.84, label: 'Plena capacidad' },
]

const OVERLAY_EXIT_START = 0.4
const OVERLAY_EXIT_END = 0.52

class HeroScrollFrames {
  constructor(wrapSelector, canvasSelector, phaseSelector, barSelector, overlaySelector) {
    this.wrap = document.querySelector(wrapSelector)
    this.canvas = document.querySelector(canvasSelector)
    this.phaseEl = document.querySelector(phaseSelector)
    this.barEl = document.querySelector(barSelector)
    this.overlayEl = document.querySelector(overlaySelector)

    if (!this.wrap || !this.canvas) return

    this.frames = new Array(HERO_FRAME_COUNT).fill(null)
    this.current = 0
    this.killed = false
    this.loadIndex = 1

    this.init()
  }

  init() {
    // Cargar primer frame
    const first = new Image()
    first.src = FIRST_FRAME
    this.frames[0] = first
    first.onload = () => {
      if (!this.killed) {
        this.size()
        this.paint(0)
      }
    }

    // Stream frames en paralelo
    this.streamNext()
    this.streamNext()
    this.streamNext()
    this.streamNext()

    // ScrollTrigger manual
    window.addEventListener('scroll', () => this.onScroll())
    window.addEventListener('resize', () => this.size())
    this.size()
  }

  streamNext() {
    if (this.killed || this.loadIndex >= HERO_FRAME_COUNT) return
    const i = this.loadIndex++
    const img = new Image()
    img.src = framePath(i)
    this.frames[i] = img
    img.onload = () => {
      if (!this.killed && i === this.current) this.paint(i)
      this.streamNext()
    }
    img.onerror = () => this.streamNext()
  }

  nearestLoaded(target) {
    for (let d = 0; d < HERO_FRAME_COUNT; d++) {
      const before = this.frames[target - d]
      if (before?.complete && before.naturalWidth) return before
      const after = this.frames[target + d]
      if (after?.complete && after.naturalWidth) return after
    }
    return null
  }

  drawCover(img) {
    const ctx = this.canvas.getContext('2d')
    if (!ctx) return
    const cw = this.canvas.width
    const ch = this.canvas.height
    const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight)
    const w = img.naturalWidth * scale
    const h = img.naturalHeight * scale
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h)
  }

  paint(index) {
    this.current = index
    const img = this.nearestLoaded(index)
    if (img) this.drawCover(img)
  }

  size() {
    this.canvas.width = this.canvas.clientWidth * Math.min(window.devicePixelRatio, 2)
    this.canvas.height = this.canvas.clientHeight * Math.min(window.devicePixelRatio, 2)
    const img = this.nearestLoaded(this.current)
    if (img) this.drawCover(img)
  }

  onScroll() {
    const rect = this.wrap.getBoundingClientRect()
    const scrollTop = window.scrollY || document.documentElement.scrollTop

    // Calcular progreso (0-1) basado en la posición del elemento
    const elementTop = rect.top + scrollTop
    const elementHeight = this.wrap.offsetHeight
    const windowHeight = window.innerHeight

    let progress = (scrollTop - elementTop + windowHeight) / (elementHeight + windowHeight)
    progress = Math.max(0, Math.min(1, progress))

    // Pintar frame basado en progreso
    this.paint(Math.round(progress * (HERO_FRAME_COUNT - 1)))

    // Actualizar fase
    if (this.phaseEl) {
      let label = PHASES[0].label
      for (const p of PHASES) if (progress >= p.at) label = p.label
      if (this.phaseEl.textContent !== label) this.phaseEl.textContent = label
    }

    // Actualizar barra de progreso
    if (this.barEl) {
      this.barEl.style.transform = `scaleX(${progress})`
    }

    // Animar overlay (subirlo cuando se abre la esfera)
    if (this.overlayEl) {
      const t = Math.min(
        1,
        Math.max(0, (progress - OVERLAY_EXIT_START) / (OVERLAY_EXIT_END - OVERLAY_EXIT_START))
      )
      this.overlayEl.style.transform = `translateY(${-t * 130}%)`
    }
  }

  destroy() {
    this.killed = true
    window.removeEventListener('scroll', () => this.onScroll())
    window.removeEventListener('resize', () => this.size())
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  new HeroScrollFrames(
    '[data-hero-wrap]',
    '[data-hero-canvas]',
    '[data-hero-phase]',
    '[data-hero-bar]',
    '[data-hero-overlay]'
  )
})