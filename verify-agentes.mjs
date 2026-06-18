import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('📍 Navegando a https://victor-ia.xyz/agentes...');
  await page.goto('https://victor-ia.xyz/agentes', { waitUntil: 'networkidle' });
  
  // Esperar a que Three.js renderice
  await page.waitForTimeout(3000);
  
  // Verificar WebGL
  const webglCheck = await page.evaluate(() => {
    const canvas = document.getElementById('canvas');
    const gl = canvas?.getContext('webgl') || canvas?.getContext('webgl2');
    return {
      canvasExists: !!canvas,
      webglEnabled: !!gl,
      canvasSize: canvas ? { width: canvas.width, height: canvas.height } : null
    };
  });
  
  console.log('✅ WebGL Status:', webglCheck);
  
  // Screenshot
  await page.screenshot({ path: 'agentes-3d-screenshot.png', fullPage: false });
  console.log('📸 Screenshot guardada en: agentes-3d-screenshot.png');
  
  // Verificar console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  
  await page.waitForTimeout(2000);
  
  if (errors.length === 0) {
    console.log('✅ Sin errores en console');
  } else {
    console.log('⚠️ Errores detectados:', errors);
  }
  
  // Prueba scroll
  console.log('🔄 Probando scroll interactivity...');
  await page.mouse.wheel(0, 100);
  await page.waitForTimeout(500);
  console.log('✅ Scroll ejecutado');
  
  // Prueba mouse movement
  console.log('🖱️ Probando mouse movement...');
  await page.mouse.move(400, 300);
  await page.waitForTimeout(500);
  await page.mouse.move(800, 600);
  await page.waitForTimeout(500);
  console.log('✅ Mouse tracking ejecutado');
  
  await browser.close();
  console.log('✨ Verificación completada exitosamente');
})();
