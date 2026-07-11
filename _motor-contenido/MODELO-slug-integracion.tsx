/**
 * MODELO de integración para app/blog/[slug]/page.tsx (Next.js App Router).
 * Muestra: metadata SEO + JSON-LD (Article + FAQPage), el SVG animado con GSAP/ScrollTrigger,
 * y el bloque de artículos relacionados por categoría.
 *
 * NOTA: el blog en producción se genera con _motor-contenido/generar.js (JSON -> HTML).
 * Este archivo es el equivalente React/Next para quien migre el blog a componentes.
 * El contenido vive en un objeto tipo `Article` (ver orquestacion-agentes.json).
 */
"use client";

import { useEffect, useRef } from "react";
import type { Metadata } from "next";

// ── Tipos ─────────────────────────────────────────────────────────────────────
type Faq = { q: string; a: string };
type Article = {
  slug: string;
  title: string;
  desc: string;
  keywords: string;
  cover: string;
  readTime: string;
  category: string;         // p.ej. "Arquitectura"
  resumen: string[];
  faqs: Faq[];
  bodyHtml: string;         // HTML del cuerpo (secciones h2, tabla, links)
};

const BASE = "https://victor-ia.xyz";

// ── 1) METADATA SEO (App Router) ──────────────────────────────────────────────
export function buildMetadata(a: Article): Metadata {
  const url = `${BASE}/blog/${a.slug}`;
  return {
    title: `${a.title} | Victor IA Blog`,           // <= 60 chars con keyword
    description: a.desc,                              // ~155 chars con CTA
    keywords: a.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: a.title,
      description: a.desc,
      siteName: "Victor IA",
      locale: "es_MX",
      images: [{ url: `${BASE}${a.cover}`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: a.title,
      description: a.desc,
      creator: "@victoria_mx",
      images: [`${BASE}${a.cover}`],
    },
  };
}

// ── 2) JSON-LD Article + FAQPage ──────────────────────────────────────────────
export function ArticleJsonLd({ a, date }: { a: Article; date: string }) {
  const url = `${BASE}/blog/${a.slug}`;
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.desc,
    image: `${BASE}${a.cover}`,
    author: { "@type": "Organization", name: "Victor IA", url: BASE },
    publisher: { "@type": "Organization", name: "Victor IA", logo: { "@type": "ImageObject", url: `${BASE}/logo.png` } },
    datePublished: date,
    dateModified: date,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    inLanguage: "es-MX",
    isAccessibleForFree: true,
  };
  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: a.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }} />
    </>
  );
}

// ── 3) SVG animado con GSAP + ScrollTrigger ───────────────────────────────────
// (import dinámico para no romper SSR; requiere `npm i gsap`)
export function OrchestrationDiagram() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    let ctx: any;
    (async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      const root = ref.current!;
      ctx = gsap.context(() => {
        gsap.set(".agent", { opacity: 0.55, transformOrigin: "center" });
        const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8, paused: true, defaults: { ease: "power1.inOut" } });
        tl.to(".flow-in", { strokeDashoffset: 0, duration: 0.7 })
          .to(".router", { scale: 1.14, duration: 0.35, yoyo: true, repeat: 1 }, "-=0.1")
          .to(".conn-agent", { strokeDashoffset: 0, duration: 0.6, stagger: 0.12 }, "-=0.2")
          .to(".agent", { opacity: 1, duration: 0.4, stagger: 0.14 }, "-=0.4")
          .to(".agent", { scale: 1.05, duration: 0.3, yoyo: true, repeat: 1, stagger: 0.1 }, "-=0.5")
          .to(".context", { scale: 1.1, duration: 0.4, yoyo: true, repeat: 1 }, "-=0.4")
          .to(".conn-qa", { strokeDashoffset: 0, duration: 0.6, stagger: 0.1 })
          .to(".qa", { scale: 1.16, duration: 0.35, yoyo: true, repeat: 1 })
          .to(".flow-out", { strokeDashoffset: 0, duration: 0.6 }, "-=0.2");
        ScrollTrigger.create({ trigger: root, start: "top 82%", onEnter: () => tl.play(), onLeaveBack: () => tl.pause() });
      }, root);
    })();
    return () => ctx?.revert();
  }, []);

  // El markup del <svg> es idéntico a MODELO-svg-arquitectura.svg (pégalo aquí).
  return (
    <aside ref={ref} id="orq-diagram" aria-label="Arquitectura de orquestación">
      {/* <svg viewBox="0 0 900 440" ...> ...ver MODELO-svg-arquitectura.svg... </svg> */}
    </aside>
  );
}

// ── 4) Artículos relacionados por categoría ───────────────────────────────────
export function RelatedArticles({ all, current, count = 3 }: { all: Article[]; current: Article; count?: number }) {
  const related = all
    .filter((x) => x.category === current.category && x.slug !== current.slug)
    .slice(0, count);
  return (
    <section className="viai-related">
      <h2>Artículos relacionados</h2>
      <div className="related-grid">
        {related.map((r) => (
          <a key={r.slug} href={`/blog/${r.slug}`} className="related-card">
            <span className="cat">{r.category}</span>
            <span className="ttl">{r.title}</span>
          </a>
        ))}
      </div>
    </section>
  );
}

// ── 5) Página ($slug) ─────────────────────────────────────────────────────────
export default function BlogArticlePage({ a, all, date }: { a: Article; all: Article[]; date: string }) {
  return (
    <article className="prose">
      <ArticleJsonLd a={a} date={date} />
      <h1>{a.title}</h1>
      <OrchestrationDiagram />
      {/* TOC + cuerpo (secciones h2, tabla, links internos/externos) */}
      <div dangerouslySetInnerHTML={{ __html: a.bodyHtml }} />
      <RelatedArticles all={all} current={a} count={3} />
    </article>
  );
}

/* export const metadata = buildMetadata(article);  // en el server component del route */