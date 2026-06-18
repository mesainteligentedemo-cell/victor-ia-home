/* ════════════════════════════════════════════════════════════════
   VICTOR IA · BUILD BLOG PREMIUM
   Para cada post del blog:
   1. Genera imagen única "escena completa" por slug (OpenRouter Gemini) → webp 1600x900
   2. Transforma el HTML: link CSS premium · portada vp-cover · og→webp ·
      reemplaza scripts viejos por blog-premium.js
   Idempotente (re-ejecutable) · reanudable (no regenera webp ya hechos)
   Uso:  KEY=sk-or-... node scripts/build-blog-premium.js [--only=slug] [--no-img]
════════════════════════════════════════════════════════════════ */
const fs   = require('fs');
const path = require('path');
const https= require('https');
const sharp= require('sharp');

const ROOT   = path.resolve(__dirname,'..');
const BLOG   = path.join(ROOT,'blog');
const COVERS = path.join(ROOT,'img','blog-covers');
const KEY    = process.env.KEY || '';
const ARGS   = process.argv.slice(2);
const ONLY   = (ARGS.find(a=>a.startsWith('--only='))||'').split('=')[1];
const NOIMG  = ARGS.includes('--no-img');

if(!fs.existsSync(COVERS)) fs.mkdirSync(COVERS,{recursive:true});

const sleep=ms=>new Promise(r=>setTimeout(r,ms));

/* ── genera 1 imagen vía OpenRouter ───────────────────────────── */
function genImage(title){
  const prompt =
    'Wide cinematic establishing editorial photograph representing the concept: "'+title+'". '+
    'A complete, rich, fully-composed scene of the relevant Mexican business/industry setting, '+
    'with subtle elegant floating AI data dashboards, holographic charts and analytics overlays '+
    'integrated tastefully into the environment. Warm champagne gold (#B89A6A) accent lighting over '+
    'deep charcoal black (#070708) tones, layered depth from foreground to background, sophisticated '+
    'and innovative, premium quiet-luxury aesthetic, the composition fills the entire frame. '+
    'Awwwards quality. No people, no text, no words, no letters, no logos. 16:9 cinematic wide angle.';
  const body=JSON.stringify({model:'google/gemini-2.5-flash-image',
    messages:[{role:'user',content:prompt}],modalities:['image','text']});
  return new Promise((resolve,reject)=>{
    const req=https.request('https://openrouter.ai/api/v1/chat/completions',{method:'POST',
      headers:{'Authorization':'Bearer '+KEY,'Content-Type':'application/json',
        'HTTP-Referer':'https://victor-ia.xyz','X-Title':'Victor IA'}},res=>{
      let d='';res.on('data',c=>d+=c);res.on('end',()=>{
        try{const j=JSON.parse(d);
          const u=j.choices[0].message.images[0].image_url.url;
          resolve(Buffer.from(u.replace(/^data:image\/[a-z]+;base64,/,''),'base64'));
        }catch(e){reject(new Error('parse: '+e.message+' | '+d.slice(0,160)));}
      });
    });
    req.on('error',reject);req.setTimeout(120000,()=>req.destroy(new Error('timeout')));
    req.write(body);req.end();
  });
}

/* ── transforma el HTML de un post ────────────────────────────── */
function transform(html, slug){
  let h=html, changed=false;
  const webp='/img/blog-covers/'+slug+'.webp';
  const webpAbs='https://victor-ia.xyz'+webp;

  // 1 · link CSS premium (después del <link ...&display=swap...>)
  if(!h.includes('blog-premium.css')){
    h=h.replace(/(<link[^>]*fonts\.googleapis\.com[^>]*display=swap[^>]*>)/,
      '$1\n<link rel="stylesheet" href="/blog/blog-premium.css"/>');
    changed=true;
  }

  // 2 · og:image / twitter:image / JSON-LD image → webp
  h=h.replace(/(property="og:image"\s+content=")[^"]+(")/g,'$1'+webpAbs+'$2');
  h=h.replace(/(name="twitter:image"\s+content=")[^"]+(")/g,'$1'+webpAbs+'$2');
  h=h.replace(/("image":\s*")https:\/\/victor-ia\.xyz\/blog\/og-[^"]+(")/g,'$1'+webpAbs+'$2');

  // 3 · portada: <img ... article-cover ...> → figure vp-cover
  const figure='<figure class="vp-cover vp-rv">'+
    '<img src="'+webp+'" width="1600" height="900" loading="eager" fetchpriority="high" '+
    'alt="'+slug.replace(/-/g,' ')+' — Victor IA"/>'+
    '<span class="vp-cover-grain" aria-hidden="true"></span></figure>';
  if(/<img[^>]*class="article-cover"[^>]*>/.test(h)){
    h=h.replace(/<img[^>]*class="article-cover"[^>]*>/,figure);
    changed=true;
  } else if(!h.includes('vp-cover')){
    // sin portada previa → insertar al inicio del <article ... class="prose">
    h=h.replace(/(<article[^>]*class="prose"[^>]*>)/,'$1\n'+figure);
    changed=true;
  }

  // 4 · scripts finales → blog-premium.js  (quita inline viejo, blog-effects, article-reader)
  if(!h.includes('blog-premium.js')){
    // quitar los dos <script src> viejos del blog
    h=h.replace(/<script src="\/blog\/blog-effects\.js"[^>]*><\/script>\s*/g,'');
    h=h.replace(/<script src="\/blog\/article-reader\.js"[^>]*><\/script>\s*/g,'');
    // inyectar el motor antes de </body>
    h=h.replace(/<\/body>/,'<script src="/blog/blog-premium.js" defer></script>\n</body>');
    changed=true;
  }

  return {html:h, changed};
}

/* ── main ─────────────────────────────────────────────────────── */
(async()=>{
  let files=fs.readdirSync(BLOG).filter(f=>f.endsWith('.html')&&f!=='index.html'&&f!=='article.html');
  if(ONLY) files=files.filter(f=>f===ONLY+'.html'||f===ONLY);
  const log=[]; let ok=0, imgGen=0, imgSkip=0, errs=0;

  for(const file of files){
    const slug=file.replace('.html','');
    const fp=path.join(BLOG,file);
    const webpPath=path.join(COVERS,slug+'.webp');
    try{
      // imagen
      if(!NOIMG && !fs.existsSync(webpPath)){
        const html=fs.readFileSync(fp,'utf8');
        const tm=html.match(/<meta property="og:title" content="([^"]+)"/)||html.match(/<title>([^<|]+)/);
        const title=(tm?tm[1]:slug.replace(/-/g,' ')).trim();
        let buf=null;
        for(let attempt=1;attempt<=3 && !buf;attempt++){
          try{ buf=await genImage(title); }
          catch(e){ if(attempt===3) throw e; await sleep(2500*attempt); }
        }
        await sharp(buf).resize(1600,900,{fit:'cover',position:'attention'}).webp({quality:78}).toFile(webpPath);
        imgGen++; log.push('IMG  '+slug+'  '+Math.round(fs.statSync(webpPath).size/1024)+'KB');
        await sleep(800);
      } else if(fs.existsSync(webpPath)){ imgSkip++; }

      // html
      const raw=fs.readFileSync(fp,'utf8');
      const {html:out,changed}=transform(raw,slug);
      if(changed){ fs.writeFileSync(fp,out); ok++; log.push('HTML '+slug+'  transformado'); }
      else log.push('HTML '+slug+'  (ya estaba)');
    }catch(e){ errs++; log.push('ERR  '+slug+'  '+e.message); }
  }

  const summary='\n══ RESUMEN ══\nposts:'+files.length+'  html-transformados:'+ok+
    '  img-generadas:'+imgGen+'  img-skip:'+imgSkip+'  errores:'+errs+'\n';
  fs.writeFileSync(path.join(ROOT,'scripts','_build-log.txt'),log.join('\n')+summary);
  console.log(summary+(errs?('errores:\n'+log.filter(l=>l.startsWith('ERR')).join('\n')):'sin errores'));
})();
