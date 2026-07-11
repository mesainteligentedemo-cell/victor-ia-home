'use client'

import { useEffect, useRef, useState } from 'react'

export function HeroScrollSphere() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sphereRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight

      // Calcular progreso del scroll (0 = no visible, 1 = totalmente scrolleado)
      let progress = 1 - (rect.top / windowHeight)
      progress = Math.max(0, Math.min(1, progress))

      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div ref={containerRef} className="relative w-full h-screen overflow-hidden bg-black">
      {/* Video de fondo */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/assets/home-hero/hf_20260710_095554_2d7f347e-2dcd-465d-92d3-9219ea69877f.mp4" type="video/mp4" />
      </video>

      {/* Overlay oscuro gradual */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />

      {/* Esfera blanca animada por scroll */}
      <div
        ref={sphereRef}
        className="absolute inset-0 flex items-center justify-center"
        style={{
          opacity: Math.max(0, 1 - scrollProgress * 1.5),
          transform: `scale(${1 + scrollProgress * 0.3}) translateY(${scrollProgress * 100}px)`,
        }}
      >
        {/* Esfera blanca con glow */}
        <div className="relative w-80 h-80">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white via-white/80 to-white/40 blur-3xl" />
          <div className="absolute inset-8 rounded-full bg-white/90 backdrop-blur-sm" />

          {/* Anillos orbitales */}
          <div className="absolute -inset-4 rounded-full border-2 border-white/30 animate-spin" style={{ animationDuration: '8s' }} />
          <div className="absolute -inset-8 rounded-full border border-white/20 animate-spin" style={{ animationDuration: '-12s' }} />
        </div>
      </div>

      {/* Contenido texto */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-6 z-10">
        <h1 className="text-5xl md:text-7xl font-bold text-center mb-6 opacity-0 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
          Victor IA
        </h1>
        <p className="text-xl md:text-2xl text-center max-w-2xl opacity-0 animate-fadeIn" style={{ animationDelay: '0.6s' }}>
          Inteligencia Artificial que Transforma tu Empresa
        </p>
        <button className="mt-12 px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors opacity-0 animate-fadeIn" style={{ animationDelay: '0.9s' }}>
          Comenzar
        </button>
      </div>

      {/* Indicador de scroll */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </div>
  )
}

export function ServicesGrid() {
  const services = [
    {
      icon: '▶️',
      title: 'Vídeos',
      desc: 'Creamos, editamos y optimizamos contenido audiovisual que conecta y convierte.',
      image: '/assets/home-hero/hf_20260709_023658_2ca0137a-1f80-4999-a50c-776e8e8518c1.png'
    },
    {
      icon: '📄',
      title: 'Artículos',
      desc: 'Contenido estratégico que informa, posiciona y genera autoridad.',
      image: '/assets/home-hero/hf_20260709_023658_2ca0137a-1f80-4999-a50c-776e8e8518c1.png'
    },
    {
      icon: '✉️',
      title: 'Email',
      desc: 'Campañas que llegan, interesan y generan resultados medibles.',
      image: '/assets/home-hero/hf_20260709_023658_2ca0137a-1f80-4999-a50c-776e8e8518c1.png'
    },
    {
      icon: '📊',
      title: 'Análisis',
      desc: 'Convertimos datos en información clara para decisiones mejores.',
      image: '/assets/home-hero/hf_20260709_023658_2ca0137a-1f80-4999-a50c-776e8e8518c1.png'
    },
    {
      icon: '⚙️',
      title: 'Automatización',
      desc: 'Sistemas que trabajan por ti y hacen crecer tu negocio.',
      image: '/assets/home-hero/hf_20260709_023658_2ca0137a-1f80-4999-a50c-776e8e8518c1.png'
    },
    {
      icon: '🎧',
      title: 'Soporte',
      desc: 'Acompañamiento real de un equipo que resuelve y está contigo.',
      image: '/assets/home-hero/hf_20260709_023658_2ca0137a-1f80-4999-a50c-776e8e8518c1.png'
    }
  ]

  return (
    <section className="py-20 px-6 bg-bone">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-ink">
          Una empresa completa.<br />
          Dentro de un solo sistema.
        </h2>

        <div className="grid md:grid-cols-3 gap-px bg-ink/10">
          {services.map((service, i) => (
            <div key={i} className="bg-bone p-8 hover:bg-white/50 transition-colors">
              <div className="text-4xl mb-4">{service.icon}</div>
              <h3 className="text-2xl font-bold text-ink mb-3">{service.title}</h3>
              <p className="text-ink/70">{service.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}