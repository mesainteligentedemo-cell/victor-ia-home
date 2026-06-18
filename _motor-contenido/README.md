# 🚀 Motor de Contenido Diario — Victor IA Blog

Sistema para producir los **2 artículos diarios** (1 noticia en la noche + 1 educativo en la mañana) con SEO, AEO, schema y link building **incorporados automáticamente**.

## Meta
Posicionar a Victor IA como **#1 referente de IA en México y LatAm** en buscadores (Chrome/Edge/Safari = Google/Bing) y en LLMs (ChatGPT, Gemini, Perplexity, Claude, Copilot).

## Ritmo objetivo
- **Mañana:** 1 artículo educativo (tema interesante que eduque sobre IA).
- **Noche:** 1 noticia diaria con las 5 noticias **REALES** del día (usar WebSearch — NUNCA inventar).

---

## Cómo generar un artículo o noticia

### 1. Escribir el contenido en un JSON
- Artículo: ver `ejemplo-articulo.json`
- Noticia: ver `ejemplo-noticia.json`

### 2. Generar el HTML (incorpora todo el SEO/AEO/schema/links solo)
```
cd C:\Users\inbou\victor-ia-home\_motor-contenido
node generar.js articulo  mi-articulo.json
node generar.js noticia   mi-noticia.json
```
El motor:
- ✅ Crea el HTML completo con header/footer/estilos de marca
- ✅ Mete meta tags (title, description, OG, Twitter, keywords)
- ✅ Mete schema Article + FAQPage + BreadcrumbList (valida que parsee)
- ✅ Mete bloque "En resumen" (key-takeaways) para AEO
- ✅ Mete link building (Sigue leyendo + Fuentes externas reales)
- ✅ Mete el lector de voz + animaciones
- ✅ Lo registra en sitemap.xml y en el índice del blog
- ❌ NO genera la portada (paso manual con Higgsfield) ni hace deploy

### 3. Generar la portada (1376x768, estilo marca)
Con Higgsfield `nano_banana_pro`, 16:9, 4K, estilo:
`"dark luxury tech aesthetic, gold accents #B89A6A, no text, no faces"` + prompt del tema.
Descargar y redimensionar a 1376x768 con sharp, guardar en:
`C:\Users\inbou\victor-ia-website\img\blog-covers\{slug}.png`

### 4. Deploy
```
cd C:\Users\inbou\victor-ia-website && vercel --prod --yes   # host de imágenes (si hay portada nueva)
cd C:\Users\inbou\victor-ia-home    && vercel --prod --yes   # el blog
```
(Si la API de Vercel da error 500, reintentar — es transitorio.)

---

## ✅ CHECKLIST de calidad (antes de publicar)
- [ ] **Noticias = REALES** (WebSearch). Nunca inventar hechos, empresas, cifras.
- [ ] **0 clientes inventados** en artículos. Lenguaje de sector, no nombres falsos.
- [ ] Título con la **keyword principal** al inicio (ej. "IA para [sector] en México").
- [ ] Meta description 120-155 caracteres, con keyword + beneficio.
- [ ] **3-4 puntos en "En resumen"** (citables por LLMs, autosuficientes).
- [ ] **3 FAQs reales** que la gente busca ("¿Cuánto cuesta...?", "¿Cómo...?").
- [ ] Enlaces internos a artículos del mismo sector/tema (los hace el motor).
- [ ] Slug en kebab-case, descriptivo, con keyword.
- [ ] Portada generada y subida.
- [ ] JSON-LD válido (el motor lo valida; si aborta, revisar comillas).

## ⚠️ Reglas de oro (de errores ya cometidos)
1. **Comillas:** en title/meta/JSON-LD nunca uses comillas dobles rectas dentro de un término. Usa tipográficas “ ” o el motor aborta.
2. **Encoding UTF-8:** el motor escribe UTF-8. No copiar texto con mojibake (Ã, â€).
3. **Las noticias del 28-29-30 viejas tenían artefactos de IA** ("No tengo permiso de búsqueda web") — eso NO debe pasar. Siempre WebSearch real.

---

## Estrategia de temas para dominar (rotar)
**Educativos (mañana):** qué es / cómo funciona / guías / comparativas / tendencias / casos de uso por sector / ROI / errores comunes.
**Por sector high-ticket (prioridad):** hotelería, inmobiliaria, turismo (Cancún/Riviera Maya/Yucatán), manufactura, salud privada, despachos, fintech.
**Local (prioridad alta — menos competencia):** "IA para [negocio] en Cancún/Playa/Tulum/Mérida".
**Noticias (noche):** lo más relevante del día en IA para empresas, con ángulo México/LatAm.

## Landings high-ticket ya publicadas (enlazar desde artículos relevantes)
- `/agencia-ia-mexico`
- `/automatizacion-procesos-empresas`
- `/onboarding-ia-empresas`
- `/desarrollo-software-ia`
- `/ia-para-empresas-cancun-riviera-maya-yucatan`
