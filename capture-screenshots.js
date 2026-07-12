const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
const BASE_URL = 'https://victor-ia.xyz';

// Configuración de breakpoints
const breakpoints = {
  mobile: { width: 390, height: 844, name: 'mobile' },
  tablet: { width: 768, height: 1024, name: 'tablet' },
  desktop: { width: 1440, height: 900, name: 'desktop' }
};

// URLs a capturar
const urls = [
  { slug: 'home', path: '/' },
  { slug: 'blog', path: '/blog' },
  { slug: 'como-funciona', path: '/como-funciona' },
  { slug: 'agentes', path: '/agentes' },
  { slug: 'precios', path: '/precios' },
  { slug: 'telemetria', path: '/telemetria' },
  { slug: 'agendar-videollamada', path: '/agendar-videollamada' },
  { slug: 'guia-definitiva', path: '/guia-definitiva' },
  // Artículos de blog aleatorios
  { slug: 'blog-ia-para-manufacturing', path: '/blog/ia-para-manufacturing' },
  { slug: 'blog-ia-para-retail', path: '/blog/ia-para-retail' },
  { slug: 'blog-ia-para-financiero', path: '/blog/ia-para-financiero' },
  { slug: 'blog-ia-para-ecommerce', path: '/blog/ia-para-ecommerce' },
  { slug: 'blog-ia-para-hospitality', path: '/blog/ia-para-hospitality' }
];

async function captureScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  const errors = [];

  try {
    for (const url of urls) {
      console.log(`\nCapturando: ${url.slug}...`);

      for (const [bpKey, bpConfig] of Object.entries(breakpoints)) {
        try {
          const context = await browser.newContext({
            viewport: { width: bpConfig.width, height: bpConfig.height }
          });

          const page = await context.newPage();
          const fullUrl = BASE_URL + url.path;

          console.log(`  → ${bpKey} (${bpConfig.width}x${bpConfig.height}): ${fullUrl}`);

          // Navegar con timeout y esperar a que la red esté inactiva
          await page.goto(fullUrl, {
            waitUntil: 'networkidle',
            timeout: 60000
          });

          // Esperar un poco más para animaciones
          await page.waitForTimeout(2000);

          // Crear directorio para slug si no existe
          const slugDir = path.join(SCREENSHOTS_DIR, url.slug);
          if (!fs.existsSync(slugDir)) {
            fs.mkdirSync(slugDir, { recursive: true });
          }

          // Capturar screenshot de toda la página
          const screenshotPath = path.join(slugDir, `${bpConfig.name}.png`);
          await page.screenshot({
            path: screenshotPath,
            fullPage: true
          });

          results.push({
            slug: url.slug,
            breakpoint: bpKey,
            path: screenshotPath,
            size: fs.statSync(screenshotPath).size,
            url: fullUrl
          });

          console.log(`    ✓ Guardado: ${screenshotPath}`);

          await context.close();
        } catch (error) {
          const errorMsg = `${url.slug} (${bpKey}): ${error.message}`;
          errors.push(errorMsg);
          console.error(`    ✗ Error: ${errorMsg}`);
        }
      }
    }
  } finally {
    await browser.close();
  }

  return { results, errors };
}

async function generateIndexHTML(results) {
  // Agrupar por slug
  const grouped = {};
  results.forEach(result => {
    if (!grouped[result.slug]) {
      grouped[result.slug] = {};
    }
    grouped[result.slug][result.breakpoint] = result;
  });

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Victor IA - Screenshots Comparison</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: #0a0e27;
            color: #e0e0e0;
            padding: 20px;
        }

        .container {
            max-width: 1600px;
            margin: 0 auto;
        }

        h1 {
            text-align: center;
            margin-bottom: 10px;
            color: #00d4ff;
            font-size: 2.5em;
        }

        .stats {
            text-align: center;
            margin-bottom: 30px;
            color: #888;
            font-size: 0.95em;
        }

        .page-section {
            margin-bottom: 60px;
            background: #1a1f3a;
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid #2a2f4a;
        }

        .page-title {
            background: #242d4a;
            padding: 20px;
            border-bottom: 1px solid #2a2f4a;
        }

        .page-title h2 {
            color: #00d4ff;
            margin-bottom: 5px;
            font-size: 1.5em;
        }

        .page-title p {
            color: #888;
            font-size: 0.9em;
            margin: 5px 0;
        }

        .breakpoints {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 20px;
            padding: 20px;
        }

        .breakpoint {
            background: #0f1428;
            border: 1px solid #2a2f4a;
            border-radius: 8px;
            overflow: hidden;
            transition: all 0.3s ease;
        }

        .breakpoint:hover {
            border-color: #00d4ff;
            box-shadow: 0 0 20px rgba(0, 212, 255, 0.1);
        }

        .bp-label {
            background: #1a2847;
            padding: 12px 16px;
            font-weight: 600;
            color: #00d4ff;
            border-bottom: 1px solid #2a2f4a;
            font-size: 0.95em;
        }

        .bp-image-container {
            position: relative;
            background: #000;
            overflow: auto;
            max-height: 600px;
        }

        .bp-image {
            display: block;
            width: 100%;
            height: auto;
        }

        .bp-info {
            padding: 12px 16px;
            background: #141a2f;
            border-top: 1px solid #2a2f4a;
            font-size: 0.85em;
            color: #888;
        }

        .error-box {
            background: #2a1a1a;
            border: 1px solid #6a2a2a;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }

        .error-box h3 {
            color: #ff6b6b;
            margin-bottom: 10px;
        }

        .error-list {
            color: #d89898;
            list-style: none;
            padding-left: 20px;
        }

        .error-list li {
            margin: 5px 0;
        }

        .error-list li:before {
            content: "✗ ";
            margin-right: 8px;
        }

        .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 0.9em;
            border-top: 1px solid #2a2f4a;
            margin-top: 40px;
        }

        @media (max-width: 768px) {
            h1 {
                font-size: 1.8em;
            }

            .breakpoints {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📸 Victor IA - Screenshots Comparison</h1>
        <div class="stats">
            <p>Total de páginas capturadas: <strong>${Object.keys(grouped).length}</strong> | Breakpoints: <strong>3</strong> (Mobile, Tablet, Desktop) | Total de imágenes: <strong>${results.length}</strong></p>
            <p style="margin-top: 10px; font-size: 0.85em;">Generado: ${new Date().toLocaleString('es-ES')}</p>
        </div>

        ${results.length === 0 ? '<div class="error-box"><h3>No se capturaron screenshots</h3><p>Verifica que el servidor esté activo en ' + BASE_URL + '</p></div>' : ''}

        ${Object.entries(grouped).map(([slug, breakpoints]) => `
            <div class="page-section">
                <div class="page-title">
                    <h2>${slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h2>
                    <p>URL: <code>${BASE_URL}${urls.find(u => u.slug === slug)?.path || '/'}</code></p>
                </div>
                <div class="breakpoints">
                    ${Object.entries(breakpoints).map(([bp, data]) => `
                        <div class="breakpoint">
                            <div class="bp-label">${bp.charAt(0).toUpperCase() + bp.slice(1)} ${bp === 'mobile' ? '(390×844)' : bp === 'tablet' ? '(768×1024)' : '(1440×900)'}</div>
                            <div class="bp-image-container">
                                <img src="${path.relative(SCREENSHOTS_DIR, data.path).replace(/\\\\/g, '/')}" alt="${slug} ${bp}" class="bp-image" />
                            </div>
                            <div class="bp-info">
                                <strong>Tamaño:</strong> ${(data.size / 1024).toFixed(1)} KB<br />
                                <strong>URL:</strong> ${data.url}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('')}

        <div class="footer">
            <p>Victor IA - Sitio Web Actual</p>
            <p style="margin-top: 10px; font-size: 0.8em;">Todas las imágenes son capturadas automáticamente con Playwright</p>
        </div>
    </div>
</body>
</html>`;

  const indexPath = path.join(SCREENSHOTS_DIR, 'index.html');
  fs.writeFileSync(indexPath, html);
  console.log(`\n✓ Índice HTML generado: ${indexPath}`);
}

// Ejecutar
(async () => {
  console.log('╔════════════════════════════════════════╗');
  console.log('║  Victor IA Screenshot Capture          ║');
  console.log('╚════════════════════════════════════════╝');
  console.log(`\nBase URL: ${BASE_URL}`);
  console.log(`Output Dir: ${SCREENSHOTS_DIR}\n`);

  const { results, errors } = await captureScreenshots();

  console.log('\n╔════════════════════════════════════════╗');
  console.log('║  Resumen                               ║');
  console.log('╚════════════════════════════════════════╝');
  console.log(`✓ Screenshots capturados: ${results.length}`);
  console.log(`✗ Errores: ${errors.length}`);

  if (errors.length > 0) {
    console.log('\nErrores encontrados:');
    errors.forEach(err => console.log(`  - ${err}`));
  }

  if (results.length > 0) {
    await generateIndexHTML(results);
  }

  console.log('\n✓ Proceso completado\n');
  process.exit(results.length > 0 ? 0 : 1);
})();
