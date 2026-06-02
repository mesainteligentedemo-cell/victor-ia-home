/* ════════════════════════════════════════════════════════════════
   VICTOR IA · BLOG PREMIUM ENGINE — Web 4.0 + 21st.dev
   · Reading progress · scroll reveals · counters animados
   · CHARTS SVG ANIMADOS: líneas que se dibujan, barras que crecen,
     puntos que aparecen — al entrar en viewport · parallax sutil
   Sin dependencias. 60fps. Respeta prefers-reduced-motion.
════════════════════════════════════════════════════════════════ */
(function(){
'use strict';
var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;

/* ════ Reading progress bar ════════════════════════════════════ */
function initProgress(){
  var bar=document.getElementById('vp-pbar'); if(!bar) return;
  function upd(){var sc=document.documentElement;var max=sc.scrollHeight-sc.clientHeight;
    bar.style.transform='scaleX('+(max>0?Math.min(scrollY/max,1):0)+')';}
  addEventListener('scroll',upd,{passive:true}); upd();
}

/* ════ Header scrolled state ═══════════════════════════════════ */
function initHeader(){var h=document.getElementById('hdr');if(!h)return;
  addEventListener('scroll',function(){h.classList.toggle('scrolled',scrollY>30);},{passive:true});}

/* ════ Scroll reveals ══════════════════════════════════════════ */
function initReveals(){
  var els=document.querySelectorAll('.vp-rv,.rv');
  if(RM||!('IntersectionObserver'in window)){els.forEach(function(e){e.classList.add('on');});return;}
  var io=new IntersectionObserver(function(en){en.forEach(function(e){if(e.isIntersecting){e.target.classList.add('on');io.unobserve(e.target);}});},{threshold:.12,rootMargin:'0px 0px -8% 0px'});
  els.forEach(function(e){io.observe(e);});
}

/* ════ Counters animados (.metric / .num) ══════════════════════ */
function initCounters(){
  document.querySelectorAll('.data-card .metric,.data-card .num').forEach(function(el){
    var raw=el.textContent.trim();var num=parseFloat(raw.replace(/[^0-9.]/g,''));
    if(!num||isNaN(num))return;
    var pre=(raw.match(/^[^0-9-]*/)||[''])[0];var suf=raw.replace(/^[^0-9-]*/,'').replace(/[0-9.,]/g,'');
    var dec=raw.indexOf('.')>-1;
    if(RM)return;
    el.textContent=pre+'0'+suf;
    new IntersectionObserver(function(en,ob){if(!en[0].isIntersecting)return;ob.disconnect();
      var s=null;(function a(ts){if(!s)s=ts;var p=Math.min((ts-s)/1300,1);var e=1-Math.pow(1-p,3);
        el.textContent=pre+(dec?(e*num).toFixed(1):Math.round(e*num))+suf;if(p<1)requestAnimationFrame(a);})(performance.now());
    },{threshold:.6}).observe(el);
  });
}

/* ════ CHARTS SVG ANIMADOS ═════════════════════════════════════
   Para cada SVG dentro de .article-visual, al entrar en viewport:
   · <path>/<line>/<polyline> con stroke → se DIBUJAN (stroke draw)
   · <rect> (barras/cards) → CRECEN o aparecen con stagger
   · <circle> (puntos de dato) → POP-IN
   · <text> → fade-in escalonado
   Cero cambios en el SVG: se anima por convención.            */
function prepSVG(svg){
  // paths con trazo
  var strokes=svg.querySelectorAll('path[stroke],line[stroke],polyline[stroke]');
  strokes.forEach(function(p){
    if(p.getAttribute('stroke')==='none')return;
    var len;
    try{len=p.getTotalLength?p.getTotalLength():0;}catch(e){len=0;}
    if(!len||len>6000){return;} // saltar grids enormes / patterns
    p.style.strokeDasharray=len;p.style.strokeDashoffset=len;
    p.dataset.vpDraw=len;
  });
  // rects que NO son fondo (alto y ancho razonables, no el rect base)
  var rects=svg.querySelectorAll('rect');
  rects.forEach(function(r){
    var w=+r.getAttribute('width')||0,h=+r.getAttribute('height')||0;
    if(w>700&&h>360){return;} // rect de fondo completo → no animar
    if(r.getAttribute('fill')&&r.getAttribute('fill').indexOf('url(')===0&&w>700){return;}
    r.style.opacity=0;r.dataset.vpRect=1;
  });
  // circles (puntos)
  svg.querySelectorAll('circle').forEach(function(c){c.style.opacity=0;c.dataset.vpDot=1;
    c.style.transformBox='fill-box';c.style.transformOrigin='center';c.style.transform='scale(.2)';});
  // textos
  svg.querySelectorAll('text').forEach(function(tx){tx.style.opacity=0;tx.dataset.vpTxt=1;});
}
function playSVG(svg){
  var strokes=svg.querySelectorAll('[data-vp-draw]');
  strokes.forEach(function(p,i){
    p.style.transition='stroke-dashoffset 1.6s cubic-bezier(.16,1,.3,1) '+(i*.12)+'s';
    requestAnimationFrame(function(){p.style.strokeDashoffset='0';});
  });
  var rects=svg.querySelectorAll('[data-vp-rect]');
  rects.forEach(function(r,i){
    r.style.transition='opacity .7s ease '+(0.2+i*.08)+'s,transform .8s cubic-bezier(.16,1,.3,1) '+(0.2+i*.08)+'s';
    r.style.transformBox='fill-box';r.style.transformOrigin='center bottom';r.style.transform='scaleY(.4)';
    requestAnimationFrame(function(){r.style.opacity=1;r.style.transform='scaleY(1)';});
  });
  var dots=svg.querySelectorAll('[data-vp-dot]');
  dots.forEach(function(c,i){
    c.style.transition='opacity .5s ease '+(0.8+i*.1)+'s,transform .6s cubic-bezier(.34,1.56,.64,1) '+(0.8+i*.1)+'s';
    requestAnimationFrame(function(){c.style.opacity=1;c.style.transform='scale(1)';});
  });
  var txts=svg.querySelectorAll('[data-vp-txt]');
  txts.forEach(function(tx,i){
    tx.style.transition='opacity .6s ease '+(0.5+i*.04)+'s';
    requestAnimationFrame(function(){tx.style.opacity=1;});
  });
}
function initCharts(){
  var vis=[].slice.call(document.querySelectorAll('.article-visual svg'));
  if(!vis.length)return;
  if(RM){return;} // sin motion: SVG queda estático y completo
  vis.forEach(prepSVG);
  var io=new IntersectionObserver(function(en){en.forEach(function(e){
    if(e.isIntersecting){playSVG(e.target);io.unobserve(e.target);}
  });},{threshold:.25});
  vis.forEach(function(s){io.observe(s);});
}

/* ════ Parallax sutil en visuales del cuerpo ═══════════════════ */
function initParallax(){
  if(RM)return;
  var els=[].slice.call(document.querySelectorAll('.article-visual'));
  if(!els.length)return;
  var tick=false;
  addEventListener('scroll',function(){if(tick)return;tick=true;requestAnimationFrame(function(){
    var vh=innerHeight;els.forEach(function(el){var r=el.getBoundingClientRect();
      if(r.bottom<0||r.top>vh)return;var prog=(r.top+r.height/2-vh/2)/vh;
      el.style.transform='translateY('+(prog*-14).toFixed(1)+'px)';});tick=false;});},{passive:true});
}

/* ════ AGENTE LECTOR — lee el artículo y resalta palabra por palabra
   Web Speech API (gratis, sin coste). Resalta cada palabra mientras
   la pronuncia y auto-scrollea. Botón flotante luxury.            */
function initReader(){
  var synth=window.speechSynthesis;
  if(!synth||typeof SpeechSynthesisUtterance==='undefined')return;
  var article=document.querySelector('article.prose')||document.querySelector('main'); if(!article)return;

  /* ── DICCIONARIO DE PRONUNCIACIÓN ──────────────────────────────
     Convierte abreviaturas/siglas a su forma hablada en español.
     Solo afecta lo que se PRONUNCIA, no el texto visible.        */
  var DICT=[
    // monedas / dinero
    [/\bMXN\b/g,'pesos mexicanos'],[/\bUSD\b/g,'dólares'],[/\bEUR\b/g,'euros'],
    [/\bMXP\b/g,'pesos mexicanos'],[/\$\s?(\d)/g,'$1 pesos '],
    // IA y tecnología
    [/\bIA\b/g,'inteligencia artificial'],[/\bA\.?I\.?\b/g,'inteligencia artificial'],
    [/\bAPI\b/g,'a pe i'],[/\bAPIs\b/g,'a pe is'],[/\bSaaS\b/g,'sas'],
    [/\bCRM\b/g,'ce erre eme'],[/\bERP\b/g,'e erre pe'],[/\bPOS\b/g,'punto de venta'],
    [/\bKPIs?\b/g,'indicadores clave'],[/\bROI\b/g,'retorno de inversión'],
    [/\bLLM\b/g,'modelo de lenguaje'],[/\bLLMs\b/g,'modelos de lenguaje'],
    [/\bIoT\b/g,'internet de las cosas'],[/\bSEO\b/g,'se o'],[/\bGEO\b/g,'ge o'],
    [/\bB2B\b/g,'be a be'],[/\bB2C\b/g,'be a ce'],[/\bUX\b/g,'u equis'],[/\bUI\b/g,'u i'],
    [/\bIT\b/g,'tecnología de la información'],[/\bTI\b/g,'tecnología de la información'],
    [/\bRH\b/g,'recursos humanos'],[/\bRRHH\b/g,'recursos humanos'],
    [/\bPyMEs?\b/gi,'pequeñas y medianas empresas'],
    [/\bCFDI\b/g,'ce efe de i'],[/\bSAT\b/g,'sat'],[/\bIVA\b/g,'i va'],
    [/\bWhatsApp\b/gi,'guatsap'],[/\bChatGPT\b/gi,'chat ge pe te'],
    // unidades y símbolos
    [/(\d)\s?%/g,'$1 por ciento'],[/\b24\/7\b/g,'veinticuatro siete'],
    [/(\d)\s?x\b/gi,'$1 veces'],[/\b#\s?(\d)/g,'número $1'],
    [/\bm²/g,'metros cuadrados'],[/&/g,' y '],
    // LATAM / lugares
    [/\bLATAM\b/gi,'latinoamérica'],[/\bLatAm\b/g,'latinoamérica'],
    [/\bCDMX\b/g,'ciudad de méxico'],[/\bMX\b/g,'méxico'],
    [/\bEE\.?\s?UU\.?\b/g,'estados unidos'],[/\bUSA\b/g,'estados unidos']
  ];
  function speakable(text){
    var t=' '+text+' ';
    DICT.forEach(function(p){t=t.replace(p[0],p[1]);});
    // separar miles para que diga "39 mil 600" natural en números largos
    return t.replace(/\s+/g,' ').trim();
  }

  // Raíz de lectura: <main> (incluye el TÍTULO/H1 que va fuera del <article>)
  var root=document.querySelector('main')||article;
  // elementos legibles, EN ORDEN DE DOCUMENTO, desde el H1 hasta el final (incluye gráficos)
  var sel='h1,h2,h3,h4,p,li,blockquote,.faq-q,.faq-a,.key-takeaways li,figure,.article-visual,table';
  var blocks=[].slice.call(root.querySelectorAll(sel)).filter(function(el){
    if(el.closest('.vp-reader-bar'))return false;          // no leer el propio botón
    if(el.closest('header')||el.closest('footer'))return false; // ni nav ni footer
    if(el.closest('.viai-linkbuild')||el.closest('.lb-grid')||el.closest('.related-articles'))return false; // ni "sigue leyendo"
    return true;
  });
  if(!blocks.length)return;

  /* describe un gráfico/figura para que el lector lo narre */
  function describeVisual(el){
    // figura con imagen de portada
    var img=el.querySelector&&el.querySelector('img');
    if(img&&img.alt&&img.closest('.vp-cover'))return null; // portada: no narrar, es decorativa
    // SVG chart: usar título/textos internos
    var svg=el.querySelector&&el.querySelector('svg');
    if(svg){
      var texts=[].slice.call(svg.querySelectorAll('text')).map(function(t){return t.textContent.trim();}).filter(Boolean);
      if(texts.length){
        return 'Gráfico: '+texts.slice(0,8).join(', ')+'.';
      }
      return 'Gráfico ilustrativo de datos del artículo.';
    }
    if(img&&img.alt&&!img.closest('.vp-cover'))return 'Imagen: '+img.alt+'.';
    return null;
  }

  // texto a leer + tipo, por bloque
  blocks=blocks.map(function(el){
    var tag=el.tagName?el.tagName.toLowerCase():'';
    var type='p';
    if(tag==='h1')type='h1'; else if(tag==='h2')type='h2'; else if(tag==='h3'||tag==='h4')type='h3';
    else if(tag==='blockquote')type='quote';
    else if(tag==='figure'||el.classList.contains('article-visual'))type='visual';
    else if(tag==='table')type='table';
    var text;
    if(type==='visual'){text=describeVisual(el);}
    else if(type==='table'){text='Tabla: '+el.textContent.replace(/\s+/g,' ').trim();}
    else{text=el.textContent;}
    return {el:el,type:type,text:text};
  }).filter(function(b){return b.text&&b.text.trim().length>0;});

  // GARANTIZAR que el TÍTULO (h1) sea el primer bloque que se lee
  var h1idx=-1;
  for(var hi=0;hi<blocks.length;hi++){if(blocks[hi].type==='h1'){h1idx=hi;break;}}
  if(h1idx>0){var h1b=blocks.splice(h1idx,1)[0];blocks.unshift(h1b);}

  // envolver cada palabra en span SOLO en bloques de texto (no visual/table)
  blocks.forEach(function(b){
    if(b.type==='visual'||b.type==='table')return;
    var el=b.el;
    if(el.dataset.vpWrapped)return; el.dataset.vpWrapped='1';
    var html=[],parts=el.innerHTML.split(/(<[^>]+>)/);
    parts.forEach(function(tok){
      if(tok.charAt(0)==='<'){html.push(tok);}
      else{html.push(tok.replace(/(\S+)/g,'<span class="vp-w">$1</span>'));}
    });
    el.innerHTML=html.join('');
  });

  // UI flotante
  var bar=document.createElement('div');
  bar.className='vp-reader-bar';
  bar.innerHTML='<button class="vp-read-btn" aria-label="Escuchar el artículo">'+
    '<svg class="vp-ic-play" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 3l9 5-9 5V3z" fill="currentColor"/></svg>'+
    '<svg class="vp-ic-pause" width="16" height="16" viewBox="0 0 16 16" fill="none" style="display:none"><rect x="3.5" y="3" width="3" height="10" rx="1" fill="currentColor"/><rect x="9.5" y="3" width="3" height="10" rx="1" fill="currentColor"/></svg>'+
    '<span class="vp-read-label">Escuchar artículo</span></button>'+
    '<button class="vp-read-stop" aria-label="Detener" style="display:none"><svg width="13" height="13" viewBox="0 0 13 13"><rect x="2" y="2" width="9" height="9" rx="1.5" fill="currentColor"/></svg></button>';
  document.body.appendChild(bar);
  var btn=bar.querySelector('.vp-read-btn'),stopBtn=bar.querySelector('.vp-read-stop'),
      label=bar.querySelector('.vp-read-label'),
      icPlay=bar.querySelector('.vp-ic-play'),icPause=bar.querySelector('.vp-ic-pause');

  var voice=null;
  function pickVoice(){var vs=synth.getVoices();
    voice=vs.filter(function(v){return /es(-|_)?(MX|419|US|ES)?/i.test(v.lang);})
      .sort(function(a,b){return (/MX|419/i.test(b.lang)?1:0)-(/MX|419/i.test(a.lang)?1:0);})[0]||
      vs.filter(function(v){return /^es/i.test(v.lang);})[0]||null;}
  pickVoice(); if(synth.onvoiceschanged!==undefined)synth.onvoiceschanged=pickVoice;

  var bi=0,playing=false,paused=false,words=[],curEl=null;
  function setUI(state){ // 'play'|'pause'|'idle'
    if(state==='idle'){icPlay.style.display='';icPause.style.display='none';label.textContent='Escuchar artículo';stopBtn.style.display='none';bar.classList.remove('active');}
    else if(state==='play'){icPlay.style.display='none';icPause.style.display='';label.textContent='Pausar';stopBtn.style.display='';bar.classList.add('active');}
    else{icPlay.style.display='';icPause.style.display='none';label.textContent='Reanudar';stopBtn.style.display='';}
  }
  function clearHi(){if(curEl&&curEl.querySelectorAll)curEl.querySelectorAll('.vp-w.on').forEach(function(w){w.classList.remove('on');});}
  /* expresividad por tipo de bloque (sin tokens, solo rate/pitch/pausa) */
  function prosody(type){
    switch(type){
      case 'h1':   return {rate:.86,pitch:1.06,pause:520};  // título: solemne, pausado
      case 'h2':   return {rate:.90,pitch:1.05,pause:420};  // sección: marca entrada
      case 'h3':   return {rate:.94,pitch:1.03,pause:300};
      case 'quote':return {rate:.90,pitch:.96,pause:360};   // cita: más grave, reflexivo
      case 'visual':return{rate:.96,pitch:1.02,pause:320};  // gráfico: tono informativo
      case 'table':return {rate:.98,pitch:1.0,pause:320};
      default:     return {rate:1.0,pitch:1.0,pause:180};   // párrafo normal
    }
  }
  function speakBlock(){
    if(bi>=blocks.length){stop();return;}
    var b=blocks[bi]; curEl=b.el;
    words=(curEl.querySelectorAll)?[].slice.call(curEl.querySelectorAll('.vp-w')):[];
    var pr=prosody(b.type);
    var u=new SpeechSynthesisUtterance(speakable(b.text));
    if(voice){u.voice=voice;u.lang=voice.lang;}else{u.lang='es-MX';}
    u.rate=pr.rate;u.pitch=pr.pitch;
    // resaltar el bloque visual completo mientras se narra (no hay palabras envueltas)
    if(b.type==='visual'||b.type==='table'){curEl.classList&&curEl.classList.add('vp-narrating');}
    u.onboundary=function(e){
      if(e.name&&e.name!=='word')return;
      if(!words.length)return;
      var txt=curEl.textContent,idx=e.charIndex,count=0;
      for(var k=0;k<idx&&k<txt.length;k++){if(/\s/.test(txt[k])&&/\S/.test(txt[k-1]||' '))count++;}
      var wi=count;
      words.forEach(function(w,j){w.classList.toggle('on',j===wi);});
      if(words[wi]){var r=words[wi].getBoundingClientRect();
        if(r.top<90||r.bottom>innerHeight-120)words[wi].scrollIntoView({behavior:'smooth',block:'center'});}
    };
    u.onend=function(){
      if(!playing)return;
      clearHi(); if(curEl.classList)curEl.classList.remove('vp-narrating');
      bi++;
      // micro-pausa expresiva entre bloques
      setTimeout(function(){if(playing)speakBlock();},paused?0:pr.pause);
    };
    synth.speak(u);
  }
  // keep-alive: Chrome corta la lectura a los ~15s; resume() periódico lo evita
  var keepAlive=null;
  function startKeepAlive(){stopKeepAlive();keepAlive=setInterval(function(){
    if(playing&&!paused){try{synth.resume();}catch(e){}}
  },9000);}
  function stopKeepAlive(){if(keepAlive){clearInterval(keepAlive);keepAlive=null;}}

  function start(){
    synth.cancel();                 // limpiar cualquier estado colgado (fix arranque Chrome)
    bi=0;playing=true;paused=false;setUI('play');
    curEl=blocks[0].el;
    curEl.scrollIntoView({behavior:'smooth',block:'center'});
    startKeepAlive();
    // pequeño respiro para que cancel() asiente antes de speak (fix Chrome)
    setTimeout(function(){if(playing)speakBlock();},60);
  }
  function stop(){playing=false;paused=false;stopKeepAlive();synth.cancel();clearHi();
    if(curEl&&curEl.classList)curEl.classList.remove('vp-narrating');
    document.querySelectorAll('.vp-narrating').forEach(function(e){e.classList.remove('vp-narrating');});
    bi=0;setUI('idle');}

  btn.addEventListener('click',function(){
    if(!playing){start();}
    else if(paused){synth.resume();paused=false;setUI('play');startKeepAlive();}
    else{synth.pause();paused=true;setUI('pause');stopKeepAlive();}
  });
  stopBtn.addEventListener('click',stop);
  addEventListener('beforeunload',function(){synth.cancel();});
}

function boot(){initProgress();initHeader();initReveals();initCounters();initCharts();initParallax();initReader();}
if(document.readyState!=='loading')boot();else document.addEventListener('DOMContentLoaded',boot);
})();
