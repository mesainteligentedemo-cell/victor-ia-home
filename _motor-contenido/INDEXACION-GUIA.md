# 📍 Guía de Indexación — victor-ia.xyz

## ✅ Lo que YA está hecho (técnico, automático)
- sitemap.xml con 164 URLs (HTTP 200) en la raíz.
- robots.txt abierto a Google, Bing y todos los bots de IA (GPTBot, ClaudeBot, PerplexityBot, etc.).
- IndexNow implementado → todas las URLs ya notificadas a Bing/Yandex (indexación instantánea).
- Sitio ya verificado en Google Search Console (archivo googleede... + meta tag).
- Schema completo (Article, FAQ, Breadcrumb, Service, Organization) en todo el sitio.

## 🔑 TUS 15 MINUTOS en Google Search Console (lo más importante que falta)
Google indexa más rápido cuando le pides directamente. Entra a https://search.google.com/search-console

### Paso 1 — Reenviar el sitemap (2 min)
1. Selecciona la propiedad **victor-ia.xyz**
2. Menú izquierdo → **Sitemaps**
3. En "Agregar un sitemap nuevo" escribe: `sitemap.xml` → **Enviar**
4. (Si ya estaba, vuelve a enviarlo para que reindexe las 164 URLs nuevas)

### Paso 2 — Pedir indexación de las landings prioritarias (10 min)
Arriba, en "Inspección de URL", pega cada una de estas y haz clic en **"Solicitar indexación"**:
```
https://victor-ia.xyz/agencia-ia-mexico
https://victor-ia.xyz/automatizacion-procesos-empresas
https://victor-ia.xyz/onboarding-ia-empresas
https://victor-ia.xyz/desarrollo-software-ia
https://victor-ia.xyz/ia-para-empresas-cancun-riviera-maya-yucatan
https://victor-ia.xyz/ia-para-empresas-cancun
https://victor-ia.xyz/ia-para-empresas-tulum
https://victor-ia.xyz/ia-para-empresas-playa-del-carmen
https://victor-ia.xyz/ia-para-empresas-merida
https://victor-ia.xyz/software-ia-timeshare-salas-de-ventas
https://victor-ia.xyz/eficiencia-energetica-iot-hoteles-resorts
https://victor-ia.xyz/ia-para-inmobiliarias-riviera-maya
https://victor-ia.xyz/ia-para-agencias-tours-experiencias
https://victor-ia.xyz/ia-para-renta-de-autos
https://victor-ia.xyz/ia-para-restaurantes-riviera-maya
https://victor-ia.xyz/ia-para-retail-comercio-tiendas
https://victor-ia.xyz/ia-para-wellness-yoga-holistico
https://victor-ia.xyz/ia-para-educacion-escuelas-capacitacion
https://victor-ia.xyz/ia-para-parques-diversiones-atracciones
```
(Google limita ~10-20 solicitudes manuales al día; el resto se indexa solo vía sitemap.)

### Paso 3 (opcional, 5 min) — Bing Webmaster Tools
1. Entra a https://www.bing.com/webmasters
2. Agrega victor-ia.xyz (puedes importar desde Google Search Console con 1 clic)
3. Envía el sitemap: `https://victor-ia.xyz/sitemap.xml`
(Bing ya recibe las URLs por IndexNow, esto es complementario.)

## 🔁 Rutina diaria de indexación (después de publicar)
Tras generar contenido nuevo y hacer deploy, ejecuta:
```
cd C:\Users\inbou\victor-ia-home
node _motor-contenido/indexnow.js https://victor-ia.xyz/blog/{nuevo-slug}
```
Y en Search Console → Inspección de URL → Solicitar indexación de la URL nueva.

## 📊 Cómo medir el avance (revisar cada semana en GSC)
- **Cobertura/Páginas:** cuántas URLs ha indexado Google (debe subir hacia 164+).
- **Rendimiento:** impresiones y clics por consulta — aquí ves por qué keywords empiezas a aparecer.
- **Para LLMs:** prueba preguntar en Perplexity/ChatGPT "¿qué agencia de IA hay en Cancún?" cada 2-3 semanas y ve si te cita.