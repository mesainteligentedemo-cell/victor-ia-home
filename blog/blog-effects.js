/* Victor IA Blog â€” Shared Interactive Effects v2.0
   Canvas particles Â· Parallax Â· 3D hover Â· Magnetic CTAs Â· Stagger reveal */

(function(){
'use strict';

// â”€â”€â”€ 1. CANVAS PARTICLE CONSTELLATION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function initParticles(){
  var existing = document.getElementById('blog-canvas');
  if(existing) return;
  var c = document.createElement('canvas');
  c.id = 'blog-canvas';
  c.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;opacity:0.22';
  document.body.insertBefore(c, document.body.firstChild);
  var ctx = c.getContext('2d');
  var pts = [];
  var W, H;

  function resize(){
    W = c.width  = window.innerWidth;
    H = c.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, {passive:true});

  var N = Math.min(55, Math.floor(window.innerWidth / 20));
  for(var i=0; i<N; i++){
    pts.push({
      x: Math.random()*W, y: Math.random()*H,
      vx:(Math.random()-.5)*.3, vy:(Math.random()-.5)*.3,
      r: Math.random()*1.5+.5
    });
  }

  var mx=W/2, my=H/2;
  window.addEventListener('mousemove', function(e){ mx=e.clientX; my=e.clientY; }, {passive:true});

  function draw(){
    ctx.clearRect(0,0,W,H);
    for(var i=0; i<pts.length; i++){
      var p=pts[i];
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0||p.x>W) p.vx*=-1;
      if(p.y<0||p.y>H) p.vy*=-1;
      // connect nearby particles
      for(var j=i+1; j<pts.length; j++){
        var q=pts[j];
        var dx=p.x-q.x, dy=p.y-q.y, d=Math.sqrt(dx*dx+dy*dy);
        if(d<120){
          ctx.beginPath();
          ctx.strokeStyle='rgba(0,102,255,'+(1-d/120)*.18+')';
          ctx.lineWidth=.6;
          ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.stroke();
        }
      }
      // connect to mouse
      var dm=Math.sqrt((p.x-mx)*(p.x-mx)+(p.y-my)*(p.y-my));
      if(dm<160){
        ctx.beginPath();
        ctx.strokeStyle='rgba(0,102,255,'+(1-dm/160)*.35+')';
        ctx.lineWidth=.8;
        ctx.moveTo(p.x,p.y); ctx.lineTo(mx,my); ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle='rgba(0,102,255,.55)';
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
}

// â”€â”€â”€ 2. PARALLAX SCROLL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function initParallax(){
  var els = document.querySelectorAll('[data-parallax], .article-visual, .rv-hero');
  if(!els.length) return;
  function update(){
    var sy = window.scrollY;
    els.forEach(function(el){
      var speed = parseFloat(el.dataset.parallax || '0.12');
      var rect  = el.getBoundingClientRect();
      if(rect.bottom > -200 && rect.top < window.innerHeight + 200){
        var offset = (sy - (el.offsetTop - window.innerHeight/2)) * speed;
        el.style.transform = 'translateY(' + offset.toFixed(1) + 'px)';
      }
    });
  }
  window.addEventListener('scroll', update, {passive:true});
  update();
}

// â”€â”€â”€ 3. 3D TILT ON DATA-CARDS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function initTiltCards(){
  document.querySelectorAll('.data-card, .step-card').forEach(function(card){
    card.addEventListener('mousemove', function(e){
      var r   = card.getBoundingClientRect();
      var cx  = r.left + r.width/2;
      var cy  = r.top  + r.height/2;
      var rx  = ((e.clientY - cy) / (r.height/2)) * -10;
      var ry  = ((e.clientX - cx) / (r.width/2))  *  10;
      card.style.transform = 'perspective(600px) rotateX('+rx+'deg) rotateY('+ry+'deg) translateZ(6px)';
      card.style.transition = 'none';
    });
    card.addEventListener('mouseleave', function(){
      card.style.transform = '';
      card.style.transition = 'transform .5s cubic-bezier(.16,1,.3,1)';
    });
  });
}

// â”€â”€â”€ 4. MAGNETIC CTAs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function initMagnetic(){
  document.querySelectorAll('.btn-p, a[href*="empezar"], a[href*="gratis"]').forEach(function(btn){
    btn.addEventListener('mousemove', function(e){
      var r  = btn.getBoundingClientRect();
      var cx = r.left + r.width/2;
      var cy = r.top  + r.height/2;
      var dx = (e.clientX - cx) * .25;
      var dy = (e.clientY - cy) * .25;
      btn.style.transform = 'translate('+dx+'px,'+dy+'px) translateY(-2px)';
      btn.style.transition = 'none';
    });
    btn.addEventListener('mouseleave', function(){
      btn.style.transform = '';
      btn.style.transition = 'transform .6s cubic-bezier(.16,1,.3,1), background .25s';
    });
  });
}

// â”€â”€â”€ 5. STAGGERED REVEAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function initStagger(){
  // Group .rv elements in visible viewport into staggered batches
  var observer = new IntersectionObserver(function(entries){
    var visible = entries.filter(function(e){ return e.isIntersecting; });
    visible.forEach(function(entry, i){
      var el = entry.target;
      setTimeout(function(){
        el.classList.add('on');
        observer.unobserve(el);
      }, i * 80);
    });
  }, {threshold:.08, rootMargin:'0px 0px -40px 0px'});

  document.querySelectorAll('.rv').forEach(function(el){
    if(!el.classList.contains('on')) observer.observe(el);
  });
}

// â”€â”€â”€ 6. ANIMATED COUNTERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function initCounters(){
  document.querySelectorAll('.data-card .num').forEach(function(el){
    var raw    = el.textContent.trim();
    var num    = parseFloat(raw.replace(/[^0-9.]/g,''));
    if(!num || isNaN(num)) return;
    var suffix = raw.replace(/^[^0-9]*/,'').replace(/[0-9.]/g,'');
    var prefix = raw.match(/^[^0-9]*/)[0];
    el.textContent = prefix+'0'+suffix;
    new IntersectionObserver(function(entries){
      if(!entries[0].isIntersecting) return;
      var start = null;
      (function anim(ts){
        if(!start) start=ts;
        var p = Math.min((ts-start)/1200, 1);
        var e = 1 - Math.pow(1-p, 3);
        el.textContent = prefix+(num%1===0?Math.round(e*num):(e*num).toFixed(1))+suffix;
        if(p<1) requestAnimationFrame(anim);
      })(performance.now());
    },{threshold:.5}).observe(el);
  });
}

// â”€â”€â”€ 7. PROGRESS RING (replaces bar) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function initProgressRing(){
  var bar = document.getElementById('pbar');
  if(!bar) return;
  // Replace with ring in corner
  var ring = document.createElement('div');
  ring.id = 'prog-ring';
  ring.innerHTML = '<svg width="44" height="44" viewBox="0 0 44 44"><circle cx="22" cy="22" r="18" fill="none" stroke="rgba(0,102,255,.12)" stroke-width="2"/><circle id="prog-arc" cx="22" cy="22" r="18" fill="none" stroke="#B89A6A" stroke-width="2" stroke-linecap="round" stroke-dasharray="113" stroke-dashoffset="113" transform="rotate(-90 22 22)"/></svg>';
  ring.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;opacity:0;transition:opacity .3s;cursor:pointer';
  document.body.appendChild(ring);
  var arc = document.getElementById('prog-arc');
  ring.addEventListener('click', function(){ window.scrollTo({top:0,behavior:'smooth'}); });
  window.addEventListener('scroll', function(){
    var h = document.documentElement;
    var pct = h.scrollTop / (h.scrollHeight - h.clientHeight);
    if(arc) arc.style.strokeDashoffset = 113 - 113*pct;
    bar.style.width = (pct*100)+'%';
    ring.style.opacity = h.scrollTop > 200 ? '1' : '0';
  },{passive:true});
}

// â”€â”€â”€ 8. SMOOTH SECTION HIGHLIGHTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function initSectionHighlight(){
  var h2s = document.querySelectorAll('.prose h2');
  if(h2s.length < 2) return;
  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        e.target.style.backgroundImage = 'linear-gradient(90deg,rgba(0,102,255,.06),transparent)';
        e.target.style.paddingLeft = '12px';
        e.target.style.marginLeft = '-12px';
        e.target.style.borderLeft = '2px solid rgba(0,102,255,.4)';
        e.target.style.transition = 'all .4s';
      }
    });
  },{threshold:.8});
  h2s.forEach(function(h){ obs.observe(h); });
}

// â”€â”€â”€ 9. HOVER GLOW ON SVG VISUALS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function initSvgGlow(){
  document.querySelectorAll('.article-visual').forEach(function(el){
    el.addEventListener('mouseenter', function(){
      el.style.filter = 'drop-shadow(0 0 24px rgba(0,102,255,.15))';
      el.style.transition = 'filter .4s';
    });
    el.addEventListener('mouseleave', function(){
      el.style.filter = '';
    });
  });
}

// â”€â”€â”€ 10. STICKY TOC â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function initTOC(){
  var h2s = Array.from(document.querySelectorAll('.prose h2'));
  if(h2s.length < 3) return;
  // Only on wide screens
  if(window.innerWidth < 1300) return;
  var toc = document.createElement('nav');
  toc.id = 'blog-toc';
  toc.style.cssText = 'position:fixed;top:120px;right:24px;width:200px;z-index:100;opacity:0;transition:opacity .3s';
  var list = document.createElement('ul');
  list.style.cssText = 'list-style:none;margin:0;padding:0;border-left:1px solid rgba(0,102,255,.15)';
  h2s.forEach(function(h, i){
    h.id = h.id || 'section-'+i;
    var li = document.createElement('li');
    var a = document.createElement('a');
    a.href = '#'+h.id;
    a.textContent = h.textContent.substring(0,35)+(h.textContent.length>35?'â€¦':'');
    a.style.cssText = 'display:block;padding:6px 12px;font-size:11px;color:rgba(234,230,223,.35);text-decoration:none;transition:color .2s,border-left .2s;letter-spacing:.04em;line-height:1.4';
    a.addEventListener('click', function(e){
      e.preventDefault();
      document.getElementById(h.id).scrollIntoView({behavior:'smooth'});
    });
    li.appendChild(a);
    list.appendChild(li);
  });
  toc.appendChild(list);
  document.body.appendChild(toc);

  var tocLinks = toc.querySelectorAll('a');
  function updateTOC(){
    var sy = window.scrollY;
    toc.style.opacity = sy > 300 ? '1' : '0';
    var active = -1;
    h2s.forEach(function(h, i){
      if(h.getBoundingClientRect().top < 180) active = i;
    });
    tocLinks.forEach(function(a, i){
      if(i === active){
        a.style.color = '#B89A6A';
        a.style.borderLeft = '2px solid #B89A6A';
        a.style.paddingLeft = '10px';
        a.style.marginLeft = '-1px';
      } else {
        a.style.color = 'rgba(234,230,223,.35)';
        a.style.borderLeft = 'none';
        a.style.paddingLeft = '12px';
        a.style.marginLeft = '0';
      }
    });
  }
  window.addEventListener('scroll', updateTOC, {passive:true});
  updateTOC();
}

// â”€â”€â”€ INIT ALL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function init(){
  initParticles();
  initParallax();
  initTiltCards();
  initMagnetic();
  initStagger();
  initCounters();
  initProgressRing();
  initSectionHighlight();
  initSvgGlow();
  initTOC();
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();
