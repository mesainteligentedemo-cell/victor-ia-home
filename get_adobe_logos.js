// Downloads missing Adobe CC logos from Simple Icons CDN and converts to PNG
const https = require('https');
const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const LOGOS_DIR = path.join(__dirname, 'logos');

const ADOBE = [
  { file: 'adobe-audition.png',   slug: 'adobeaudition',       color: '9999FF' },
  { file: 'adobe-acrobat.png',    slug: 'adobeacrobatreader',  color: 'FF0000' },
  { file: 'adobe-animate.png',    slug: 'adobeanimate',        color: 'FF7200' },
  { file: 'adobe-express.png',    slug: 'adobeexpress',        color: 'FF3366' },
  { file: 'adobe-stock.png',      slug: 'adobestock',          color: 'EA0000' },
  { file: 'adobe-substance3d.png',slug: 'adobesubstance3d',    color: 'F75A00' },
  { file: 'adobe-fresco.png',     slug: 'adobefresco',         color: 'FF7F52' },
];

function fetchSvg(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetchSvg(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

function svgToPng(svgStr) {
  const resvg = new Resvg(svgStr, {
    fitTo: { mode: 'width', value: 512 },
    background: 'transparent',
  });
  return resvg.render().asPng();
}

async function main() {
  for (const item of ADOBE) {
    const outPath = path.join(LOGOS_DIR, item.file);
    if (fs.existsSync(outPath)) {
      console.log(`  skip (exists): ${item.file}`);
      continue;
    }
    const url = `https://cdn.simpleicons.org/${item.slug}/${item.color}`;
    console.log(`  fetch: ${item.slug} -> ${item.file}`);
    try {
      const { status, body } = await fetchSvg(url);
      if (status !== 200 || !body.includes('<svg')) {
        console.log(`    WARN: got status ${status}, skipping`);
        continue;
      }
      // Force 512x512 viewBox
      let svg = body.replace(/width="[^"]*"/, 'width="512"').replace(/height="[^"]*"/, 'height="512"');
      if (!svg.includes('viewBox')) svg = svg.replace('<svg', '<svg viewBox="0 0 24 24"');
      const png = svgToPng(svg);
      fs.writeFileSync(outPath, png);
      console.log(`    saved: ${item.file} (${png.length} bytes)`);
    } catch (e) {
      console.log(`    ERROR: ${e.message}`);
    }
    await new Promise(r => setTimeout(r, 120));
  }
  console.log('Done.');
}

main();
