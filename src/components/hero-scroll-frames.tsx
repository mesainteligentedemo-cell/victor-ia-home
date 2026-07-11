'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export const HERO_FRAME_COUNT = 400

const framePath = (i: number) =>
  `/assets/frames/hero/f${String(i + 1).padStart(3, '0')}.jpg`

const FIRST_FRAME = framePath(0)
const LAST_FRAME = framePath(HERO_FRAME_COUNT - 1)

// Fases del scroll
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

function drawCover(canvas: HTMLCanvasElement, img: HTMLImageElement) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const cw = canvas.width
  const ch = canvas.height
  const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight)
  const w = img.naturalWidth * scale
  const h = img.naturalHeight * scale
  ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h)
}

export function HeroScrollFrames() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const phaseRef = useRef<HTMLSpanElement>(null)
  const barRef = useRef<HTMLSpanElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return

    // Registrar ScrollTrigger
    gsap.registerPlugin(ScrollTrigger)

    const frames: (HTMLImageElement | null)[] = new Array(HERO_FRAME_COUNT).fill(null)
    let current = 0
    let killed = false

    const size = () => {
      canvas.width = canvas.clientWidth * Math.min(window.devicePixelRatio, 2)
      canvas.height = canvas.clientHeight * Math.min(window.devicePixelRatio, 2)
      const img = nearestLoaded(current)
      if (img) drawCover(canvas, img)
    }

    const nearestLoaded = (target: number): HTMLImageElement | null => {
      for (let d = 0; d < HERO_FRAME_COUNT; d++) {
        const before = frames[target - d]
        if (before?.complete && before.naturalWidth) return before
        const after = frames[target + d]
        if (after?.complete && after.naturalWidth) return after
      }
      return null
    }

    const paint = (index: number) => {
      current = index
      const img = nearestLoaded(index)
      if (img) drawCover(canvas, img)
    }

    // Cargar primer frame inmediatamente
    const first = new Image()
    first.src = FIRST_FRAME
    frames[0] = first
    first.onload = () => {
      if (!killed) {
        size()
        paint(0)
      }
    }

    // Stream frames en paralelo (4 conexiones)
    let loadIndex = 1
    const streamNext = () => {
      if (killed || loadIndex >= HERO_FRAME_COUNT) return
      const i = loadIndex++
      const img = new Image()
      img.src = framePath(i)
      frames[i] = img
      img.onload = () => {
        if (!killed && i === current) paint(i)
        streamNext()
      }
      img.onerror = streamNext
    }

    streamNext()
    streamNext()
    streamNext()
    streamNext()

    // ScrollTrigger: vincular scroll al progreso de frames
    const st = ScrollTrigger.create({
      trigger: wrap,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.75,
      onUpdate: (self) => {
        paint(Math.round(self.progress * (HERO_FRAME_COUNT - 1)))

        if (phaseRef.current) {
          let label = PHASES[0].label
          for (const p of PHASES) if (self.progress >= p.at) label = p.label
          if (phaseRef.current.textContent !== label) phaseRef.current.textContent = label
        }

        if (barRef.current) {
          barRef.current.style.transform = `scaleX(${self.progress})`
        }

        if (overlayRef.current) {
          const t = Math.min(
            1,
            Math.max(0, (self.progress - OVERLAY_EXIT_START) / (OVERLAY_EXIT_END - OVERLAY_EXIT_START))
          )
          overlayRef.current.style.transform = `translateY(${-t * 130}%)`
        }
      },
    })

    window.addEventListener('resize', size)
    size()

    return () => {
      killed = true
      st.kill()
      window.removeEventListener('resize', size)
    }
  }, [])

  const overlay = (
    <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-14 sm:px-10 lg:px-16">
      <h1 className="max-w-[13ch] font-display text-5xl font-semibold leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl drop-shadow-lg">
        Victor IA
      </h1>
      <p className="mt-6 max-w-[42ch] text-base leading-relaxed text-white/80 sm:text-lg drop-shadow">
        Inteligencia que transforma tu empresa en minutos, no meses.
      </p>
      <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
        <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-white transition-colors drop-shadow">
          Comenzar
        </button>
        <button className="px-8 py-3 border-2 border-white/60 hover:border-white rounded-lg font-semibold text-white transition-colors drop-shadow">
          Conocer más
        </button>
      </div>
    </div>
  )

  return (
    <section id="hero" aria-label="Victor IA Hero">
      <div
        ref={wrapRef}
        className="relative h-[420vh] md:h-[640vh]"
        style={{
          backgroundImage: `url(${LAST_FRAME})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="sticky top-0 h-dvh overflow-hidden bg-black">
          <img
            src={FIRST_FRAME}
            alt="Victor IA - Sistema de Inteligencia Artificial"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />

          <div ref={overlayRef} className="absolute inset-0 z-10 will-change-transform">
            {overlay}
          </div>

          {/* Indicadores de fase y progreso */}
          <div className="pointer-events-none absolute bottom-14 right-6 z-10 hidden w-64 flex-col gap-3 lg:flex">
            <span
              ref={phaseRef}
              className="text-right font-tech text-[10px] uppercase tracking-[0.2em] text-white/70"
            >
              Sistema dormido
            </span>
            <span className="block h-px w-full bg-white/20">
              <span
                ref={barRef}
                className="block h-px w-full origin-left bg-blue-500"
                style={{ transform: 'scaleX(0)' }}
              />
            </span>
            <span className="text-right font-tech text-[10px] uppercase tracking-[0.2em] text-white/50">
              Progreso del recorrido
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}