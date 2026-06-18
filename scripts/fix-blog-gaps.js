/* Arregla gaps tras el build:
   1. cualquier /img/blog-covers/SLUG.png → .webp  (JSON-LD u otros)
   2. posts sin og:image/twitter:image → insertar apuntando al webp
   3. reporta posts sin vp-cover (para revisión manual)
*/
const fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'..'),BLOG=path.join(ROOT,'blog');
const posts=fs.readdirSync(BLOG).filter(f=>f.endsWith('.html')&&f!=='index.html'&&f!=='article.html');
let fixedPng=0,addedOg=0,noCover=[];

posts.forEach(f=>{
  const slug=f.replace('.html','');
  const fp=path.join(BLOG,f);
  let h=fs.readFileSync(fp,'utf8'),before=h;
  const webpAbs='https://victor-ia.xyz/img/blog-covers/'+slug+'.webp';

  // 1 · png de blog-covers → webp (en cualquier atributo: JSON-LD image, etc.)
  h=h.replace(new RegExp('https://victor-ia\\.xyz/img/blog-covers/'+slug.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\.png','g'),webpAbs);
  h=h.replace(new RegExp('/img/blog-covers/'+slug.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\.png','g'),'/img/blog-covers/'+slug+'.webp');
  if(h!==before)fixedPng++;

  // 2 · si no hay og:image, insertarlo + twitter:image tras el canonical o el title
  if(!/property="og:image"/.test(h)){
    const tag='\n<meta property="og:image" content="'+webpAbs+'"/>\n<meta name="twitter:image" content="'+webpAbs+'"/>\n<meta name="twitter:card" content="summary_large_image"/>';
    if(/<link rel="canonical"[^>]*>/.test(h)) h=h.replace(/(<link rel="canonical"[^>]*>)/,'$1'+tag);
    else h=h.replace(/(<\/title>)/,'$1'+tag);
    addedOg++;
  }

  if(!h.includes('vp-cover'))noCover.push(f);
  if(h!==before||!before.includes(webpAbs)) fs.writeFileSync(fp,h);
});

console.log('png→webp arreglados: '+fixedPng+'  | og:image agregados: '+addedOg);
console.log('sin vp-cover ('+noCover.length+'): '+noCover.join(', '));
