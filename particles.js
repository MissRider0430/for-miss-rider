/* ═══════════════════════════════════════════════════════════════
   particles.js v2 — Cinematic Particle System for Miss Rider

   UPGRADES over v1:
   ✦ Realistic petal shape — bezier curves, not just ellipses
   ✦ Wind system — slow-changing direction, petals bend naturally
   ✦ Depth layers — 3 depth levels with blur + scale
   ✦ Firefly particles — blink on/off organically
   ✦ Shooting stars — rare streaks across the sky
   ✦ Hold-to-orbit — hold finger, petals spiral around it
   ✦ Section palettes — each section its own color world
   ✦ Petal trails — burst petals leave luminous trails
   ✦ Adaptive frame skipping — smooth on any device
═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const M = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || innerWidth < 768;

  /* ── CANVAS ── */
  const canvas = document.createElement('canvas');
  canvas.id = 'particle-canvas';
  canvas.style.cssText = 'position:fixed;inset:0;z-index:18;pointer-events:none;opacity:0;transition:opacity 1.8s ease;';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  /* ── SECTION PALETTES ── */
  const PAL = {
    default: {
      petal: ['#8b0000','#c41e3a','#e06070','#b01030','#d43050','#ff6080'],
      dust:  ['#c9a84c','#e8d080','#f0ddc8','#c41e3a','#ff8899','#fff5e0'],
      orb:   ['rgba(196,30,58,','rgba(201,168,76,','rgba(224,96,112,'],
    },
    poem: {
      petal: ['#8b0000','#c41e3a','#4060a0','#6080c0','#d4c0a8'],
      dust:  ['#d4c0a8','#a8b8e0','#c8d8ff','#e0e8ff','#c9a84c'],
      orb:   ['rgba(100,140,220,','rgba(180,200,255,','rgba(196,30,58,'],
    },
    gift: {
      petal: ['#c41e3a','#e06070','#ff8899','#c9a84c','#fff5c0'],
      dust:  ['#c9a84c','#ffdd80','#ffe8a0','#fff0c0','#f0ddc8'],
      orb:   ['rgba(201,168,76,','rgba(255,220,100,','rgba(196,30,58,'],
    },
    cake: {
      petal: ['#4a0080','#8040c0','#c060e0','#c41e3a','#c9a84c'],
      dust:  ['#c9a84c','#e0a0ff','#c080e0','#a060c0','#fff0ff'],
      orb:   ['rgba(140,60,200,','rgba(201,168,76,','rgba(180,100,255,'],
    },
    ending: {
      petal: ['#8b0000','#c41e3a','#3a3060','#504080','#d4c0a8'],
      dust:  ['#d4c0a8','#c0b8f0','#a8a0e0','#c9a84c','#e8e0ff'],
      orb:   ['rgba(80,60,160,','rgba(201,168,76,','rgba(196,30,58,'],
    },
  };
  let pal = PAL.default;

  /* ── WIND SYSTEM ── */
  const wind = { x: 0, y: 0, tx: 0, ty: 0, t: 0 };
  function updateWind() {
    wind.t += 0.003;
    wind.tx = Math.sin(wind.t * 0.7) * 0.18 + Math.sin(wind.t * 1.3) * 0.09;
    wind.ty = Math.cos(wind.t * 0.5) * 0.05;
    wind.x += (wind.tx - wind.x) * 0.008;
    wind.y += (wind.ty - wind.y) * 0.008;
  }

  /* ── POOLS ── */
  const petals = [], dusts = [], orbs = [], fireflies = [], stars = [];

  /* ── PETAL — BEZIER SHAPE ── */
  function makePetal(x, y, burst, depth) {
    depth = depth !== undefined ? depth : (burst ? 1 : Math.random());
    const sz  = burst ? 9 + Math.random()*22 : (5+Math.random()*16)*(0.5+depth*0.6);
    const spd = burst ? 2+Math.random()*5 : 0.2+Math.random()*0.65;
    const ang = burst ? Math.random()*Math.PI*2 : -Math.PI*0.5+(Math.random()-0.5)*1.4;
    return {
      x: x !== null && x !== undefined ? x : Math.random()*canvas.width,
      y: y !== null && y !== undefined ? y : -sz*2,
      vx: Math.cos(ang)*spd*(burst?1:0.45),
      vy: Math.sin(ang)*spd+(burst?-2:0.28+Math.random()*0.55),
      sz, rot: Math.random()*Math.PI*2,
      rotV: (Math.random()-0.5)*0.05,
      alpha: burst?0.92:0.18+Math.random()*0.5,
      alphaDecay: burst?0.007+Math.random()*0.007:0.0009,
      color: pal.petal[Math.floor(Math.random()*pal.petal.length)],
      wave: Math.random()*Math.PI*2, waveSpd: 0.007+Math.random()*0.013,
      waveAmp: 0.25+Math.random()*0.55,
      gravity: burst?0.055+Math.random()*0.04:0.005+depth*0.004,
      drag: burst?0.968:0.999,
      depth, blur: burst?0:(1-depth)*1.6,
      trail: [], burst,
    };
  }

  function drawPetal(p) {
    ctx.save();
    if (p.blur > 0.3) ctx.filter = 'blur('+p.blur.toFixed(1)+'px)';
    ctx.translate(p.x, p.y); ctx.rotate(p.rot);
    ctx.globalAlpha = Math.max(0, p.alpha);
    if (p.burst && p.trail.length > 1) {
      ctx.globalAlpha = p.alpha*0.25;
      ctx.beginPath();
      ctx.moveTo(p.trail[0].x-p.x, p.trail[0].y-p.y);
      for (let t=1;t<p.trail.length;t++) ctx.lineTo(p.trail[t].x-p.x, p.trail[t].y-p.y);
      ctx.strokeStyle=p.color; ctx.lineWidth=p.sz*0.3; ctx.lineCap='round'; ctx.stroke();
      ctx.globalAlpha = Math.max(0, p.alpha);
    }
    const s = p.sz;
    ctx.beginPath();
    ctx.moveTo(0,-s);
    ctx.bezierCurveTo(s*0.55,-s*0.6, s*0.42,s*0.4, 0,s);
    ctx.bezierCurveTo(-s*0.42,s*0.4, -s*0.55,-s*0.6, 0,-s);
    ctx.fillStyle = p.color; ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0,-s*0.85);
    ctx.bezierCurveTo(s*0.12,-s*0.4, s*0.08,s*0.2, 0,s*0.7);
    ctx.strokeStyle='rgba(255,255,255,0.11)'; ctx.lineWidth=s*0.09; ctx.stroke();
    const g=ctx.createRadialGradient(0,0,0,0,0,s*0.9);
    g.addColorStop(0,'rgba(255,180,180,0.10)'); g.addColorStop(1,'rgba(255,180,180,0)');
    ctx.beginPath();
    ctx.moveTo(0,-s);
    ctx.bezierCurveTo(s*0.55,-s*0.6,s*0.42,s*0.4,0,s);
    ctx.bezierCurveTo(-s*0.42,s*0.4,-s*0.55,-s*0.6,0,-s);
    ctx.fillStyle=g; ctx.fill();
    ctx.filter='none'; ctx.restore();
  }

  function updatePetal(p) {
    if (p.burst) { p.trail.push({x:p.x,y:p.y}); if(p.trail.length>5) p.trail.shift(); }
    p.wave+=p.waveSpd;
    p.x += p.vx+Math.sin(p.wave)*p.waveAmp+wind.x*(0.4+p.depth*0.6);
    p.y += p.vy+wind.y;
    p.vy+=p.gravity; p.vx*=p.drag; p.vy*=p.drag;
    p.rot+=p.rotV+wind.x*0.01;
    if (p.burst) p.alpha-=p.alphaDecay;
    else p.alpha-=p.alphaDecay*(0.25+(p.y/canvas.height)*0.75);
    if (holdActive && !p.burst) {
      const dx=holdX-p.x, dy=holdY-p.y, dist=Math.sqrt(dx*dx+dy*dy)||1;
      if (dist<220) { const pull=(1-dist/220)*0.012; p.vx+=(-dy/dist)*pull*2.2; p.vy+=(dx/dist)*pull*2.2; }
    }
    return p.alpha>0.004 && p.y<canvas.height+70;
  }

  /* ── DUST ── */
  function makeDust(x,y,burst) {
    const spd=burst?1.4+Math.random()*3.8:0.12+Math.random()*0.38;
    const a=Math.random()*Math.PI*2;
    return {
      x:x!==null&&x!==undefined?x:Math.random()*canvas.width,
      y:y!==null&&y!==undefined?y:Math.random()*canvas.height,
      vx:Math.cos(a)*spd, vy:Math.sin(a)*spd-(burst?1.2:0.08+Math.random()*0.18),
      size:burst?1.5+Math.random()*3.2:0.7+Math.random()*2,
      alpha:burst?0.95:0.07+Math.random()*0.32,
      alphaDecay:burst?0.011:0.0005+Math.random()*0.0007,
      color:pal.dust[Math.floor(Math.random()*pal.dust.length)],
      glow:Math.random()>0.55,
      wave:Math.random()*Math.PI*2, waveSpd:0.01+Math.random()*0.018, burst,
    };
  }
  function drawDust(p) {
    ctx.save(); ctx.globalAlpha=Math.max(0,p.alpha);
    if(p.glow){
      const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.size*3.5);
      g.addColorStop(0,p.color+(p.alpha*0.8).toFixed(2)+')');
      g.addColorStop(0.5,p.color+(p.alpha*0.3).toFixed(2)+')');
      g.addColorStop(1,p.color+'0)');
      ctx.beginPath(); ctx.arc(p.x,p.y,p.size*3.5,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
    }
    ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fillStyle=p.color; ctx.fill();
    ctx.restore();
  }
  function updateDust(p) {
    p.wave+=p.waveSpd;
    p.x+=p.vx+Math.sin(p.wave*0.6)*0.22+wind.x*0.5;
    p.y+=p.vy+wind.y*0.3;
    p.vx*=0.996; p.vy*=0.994;
    if(p.burst){p.alpha-=p.alphaDecay;}
    else{
      if(p.x<-10)p.x=canvas.width+10; if(p.x>canvas.width+10)p.x=-10;
      if(p.y<-10)p.y=canvas.height+10; if(p.y>canvas.height+10)p.y=-10;
    }
    return p.alpha>0.003;
  }

  /* ── ORB ── */
  function makeOrb(x,y,burst) {
    const sz=burst?14+Math.random()*30:20+Math.random()*60;
    const cb=pal.orb[Math.floor(Math.random()*pal.orb.length)];
    return {
      x:x!==null&&x!==undefined?x:Math.random()*canvas.width,
      y:y!==null&&y!==undefined?y:Math.random()*canvas.height,
      vx:(Math.random()-0.5)*(burst?2.8:0.16),
      vy:(Math.random()-0.5)*(burst?2.8:0.12)-(burst?1.8:0),
      size:sz, alpha:burst?0.72:0.03+Math.random()*0.11,
      alphaDecay:burst?0.007:0.0003, colorBase:cb,
      breathe:Math.random()*Math.PI*2,
      breatheSpd:0.007+Math.random()*0.011,
      breatheAmp:0.012+Math.random()*0.022, burst,
    };
  }
  function drawOrb(p) {
    ctx.save();
    const a=Math.max(0,p.alpha);
    const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.size);
    g.addColorStop(0,p.colorBase+(a*0.72).toFixed(2)+')');
    g.addColorStop(0.5,p.colorBase+(a*0.28).toFixed(2)+')');
    g.addColorStop(1,p.colorBase+'0)');
    ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
    ctx.restore();
  }
  function updateOrb(p) {
    p.breathe+=p.breatheSpd; p.alpha+=Math.sin(p.breathe)*p.breatheAmp*0.01;
    p.x+=p.vx; p.y+=p.vy; p.vx*=0.991; p.vy*=0.991;
    if(p.burst){p.alpha-=p.alphaDecay; return p.alpha>0.01;}
    if(p.x<-p.size)p.x=canvas.width+p.size; if(p.x>canvas.width+p.size)p.x=-p.size;
    if(p.y<-p.size)p.y=canvas.height+p.size; if(p.y>canvas.height+p.size)p.y=-p.size;
    return true;
  }

  /* ── FIREFLY ── */
  function makeFirefly() {
    return {
      x:Math.random()*canvas.width, y:Math.random()*canvas.height,
      vx:(Math.random()-0.5)*0.35, vy:(Math.random()-0.5)*0.25,
      size:1.2+Math.random()*2.2, alpha:0,
      blinkPhase:Math.random()*Math.PI*2,
      blinkSpd:0.022+Math.random()*0.035,
      blinkPeak:0.25+Math.random()*0.55,
      wave:Math.random()*Math.PI*2, waveSpd:0.006+Math.random()*0.01,
      color:Math.random()>0.5?'rgba(201,168,76,':'rgba(196,30,58,',
    };
  }
  function drawFirefly(p) {
    if(p.alpha<0.01)return;
    ctx.save();
    const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.size*4);
    g.addColorStop(0,p.color+p.alpha+')');
    g.addColorStop(0.4,p.color+(p.alpha*0.4).toFixed(2)+')');
    g.addColorStop(1,p.color+'0)');
    ctx.beginPath(); ctx.arc(p.x,p.y,p.size*4,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
    ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
    ctx.globalAlpha=p.alpha; ctx.fillStyle='#fff'; ctx.fill();
    ctx.restore();
  }
  function updateFirefly(p) {
    p.blinkPhase+=p.blinkSpd;
    p.alpha=Math.max(0,Math.sin(p.blinkPhase)*p.blinkPeak);
    p.wave+=p.waveSpd;
    p.x+=p.vx+Math.sin(p.wave)*0.18; p.y+=p.vy+Math.cos(p.wave*0.7)*0.12;
    if(p.x<20)p.vx+=0.04; if(p.x>canvas.width-20)p.vx-=0.04;
    if(p.y<20)p.vy+=0.04; if(p.y>canvas.height-20)p.vy-=0.04;
    p.vx*=0.995; p.vy*=0.995;
  }

  /* ── SHOOTING STAR ── */
  function spawnShootingStar() {
    const fromL=Math.random()>0.5;
    const x=fromL?-20:canvas.width+20, y=Math.random()*canvas.height*0.55;
    const spd=12+Math.random()*10, ang=(Math.random()*0.3+0.15)*(fromL?1:-1);
    stars.push({
      x,y, vx:Math.cos(ang)*spd*(fromL?1:-1), vy:Math.sin(ang)*spd+1.5,
      len:60+Math.random()*80, alpha:0.9, size:1.2+Math.random()*1.2,
      color:Math.random()>0.6?'#c9a84c':'#ffffff',
    });
  }
  function drawStar(p) {
    ctx.save(); ctx.globalAlpha=Math.max(0,p.alpha);
    const g=ctx.createLinearGradient(p.x,p.y,p.x-p.vx*(p.len/14),p.y-p.vy*(p.len/14));
    g.addColorStop(0,p.color); g.addColorStop(1,'rgba(255,255,255,0)');
    ctx.beginPath();
    ctx.moveTo(p.x,p.y);
    ctx.lineTo(p.x-p.vx*(p.len/14),p.y-p.vy*(p.len/14));
    ctx.strokeStyle=g; ctx.lineWidth=p.size; ctx.lineCap='round'; ctx.stroke();
    ctx.restore();
  }
  function updateStar(p) {
    p.x+=p.vx; p.y+=p.vy; p.alpha-=0.022;
    return p.alpha>0 && p.x>-100 && p.x<canvas.width+100;
  }
  function scheduleShootingStar() {
    setTimeout(()=>{ if(running){spawnShootingStar();} scheduleShootingStar(); },
      8000+Math.random()*18000);
  }

  /* ── HOLD-TO-ORBIT ── */
  let holdActive=false, holdX=0, holdY=0, holdTimer=null;
  window.addEventListener('pointerdown',e=>{
    if(!running)return;
    holdTimer=setTimeout(()=>{ holdActive=true; holdX=e.clientX; holdY=e.clientY; },300);
  },{passive:true});
  window.addEventListener('pointermove',e=>{ if(holdActive){holdX=e.clientX;holdY=e.clientY;} },{passive:true});
  window.addEventListener('pointerup',()=>{ clearTimeout(holdTimer); holdActive=false; },{passive:true});
  window.addEventListener('touchstart',e=>{
    if(!running)return;
    const t=e.touches[0];
    holdTimer=setTimeout(()=>{ holdActive=true; holdX=t.clientX; holdY=t.clientY; },300);
  },{passive:true});
  window.addEventListener('touchmove',e=>{ if(holdActive){holdX=e.touches[0].clientX;holdY=e.touches[0].clientY;} },{passive:true});
  window.addEventListener('touchend',()=>{ clearTimeout(holdTimer); holdActive=false; },{passive:true});

  /* ── AMBIENT SPAWN ── */
  const SCALE=M?0.48:1;
  const C={petals:Math.floor(55*SCALE),dust:Math.floor(110*SCALE),orbs:Math.floor(16*SCALE),ff:Math.floor(14*SCALE)};

  function spawnAmbient() {
    for(let i=0;i<C.petals;i++){const p=makePetal(null,null,false,Math.random());p.y=Math.random()*canvas.height;petals.push(p);}
    for(let i=0;i<C.dust;i++)dusts.push(makeDust(null,null,false));
    for(let i=0;i<C.orbs;i++)orbs.push(makeOrb(null,null,false));
    for(let i=0;i<C.ff;i++)fireflies.push(makeFirefly());
    setInterval(()=>{
      if(petals.filter(p=>!p.burst).length<C.petals)petals.push(makePetal(null,-20,false));
      if(dusts.filter(p=>!p.burst).length<C.dust)dusts.push(makeDust(null,null,false));
      if(orbs.filter(p=>!p.burst).length<C.orbs)orbs.push(makeOrb(null,null,false));
    },M?420:200);
  }

  function touchBurst(x,y) {
    const np=Math.floor(24*SCALE),nd=Math.floor(38*SCALE),no=Math.floor(7*SCALE);
    for(let i=0;i<np;i++)petals.push(makePetal(x,y,true));
    for(let i=0;i<nd;i++)dusts.push(makeDust(x,y,true));
    for(let i=0;i<no;i++)orbs.push(makeOrb(x,y,true));
  }

  /* ── SECTION PALETTE SWITCHER ── */
  let intensityTimer=null, intensity=1;
  function setIntensity(lv,ms){intensity=lv;if(intensityTimer)clearTimeout(intensityTimer);if(ms)intensityTimer=setTimeout(()=>{intensity=1;},ms);}
  function switchPalette(name){
    pal=PAL[name]||PAL.default;
    petals.filter(p=>!p.burst).forEach(p=>{p.color=pal.petal[Math.floor(Math.random()*pal.petal.length)];});
  }

  const obs=new MutationObserver(()=>{
    const a=id=>document.getElementById(id)?.classList.contains('active');
    if(a('poem-overlay'))     {switchPalette('poem');    setIntensity(2.0);}
    else if(a('gift-overlay')){switchPalette('gift');    setIntensity(1.6);}
    else if(a('cake-overlay')){switchPalette('cake');    setIntensity(2.5);}
    else if(a('ending-overlay')){switchPalette('ending');setIntensity(0.5);}
    else                      {switchPalette('default');}
  });
  obs.observe(document.body,{attributes:true,subtree:true,attributeFilter:['class']});

  /* ── RENDER LOOP ── */
  let running=false, frame=0;
  function render() {
    requestAnimationFrame(render); frame++;
    const total=petals.length+dusts.length+orbs.length;
    const skip=M?(total>200?3:2):1;
    if(frame%skip!==0)return;
    updateWind();
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for(let i=orbs.length-1;i>=0;i--){drawOrb(orbs[i]);if(!updateOrb(orbs[i]))orbs.splice(i,1);}
    for(let i=dusts.length-1;i>=0;i--){drawDust(dusts[i]);if(!updateDust(dusts[i]))dusts.splice(i,1);}
    for(let i=fireflies.length-1;i>=0;i--){drawFirefly(fireflies[i]);updateFirefly(fireflies[i]);}
    for(let i=stars.length-1;i>=0;i--){drawStar(stars[i]);if(!updateStar(stars[i]))stars.splice(i,1);}
    petals.sort((a,b)=>a.depth-b.depth);
    for(let i=petals.length-1;i>=0;i--){drawPetal(petals[i]);if(!updatePetal(petals[i]))petals.splice(i,1);}
  }

  /* ── PUBLIC API ── */
  window.ParticleSystem={
    start(){canvas.style.opacity='1';if(!running){running=true;spawnAmbient();scheduleShootingStar();render();}},
    burst(x,y){touchBurst(x,y);},
    intensify(lv,ms){setIntensity(lv,ms);},
    palette(name){switchPalette(name);},
    stop(){canvas.style.opacity='0';},
  };

  /* ── TOUCH INTEGRATION ── */
  window.addEventListener('touchstart',e=>{if(!running)return;const t=e.touches[0];touchBurst(t.clientX,t.clientY);},{passive:true});
  window.addEventListener('click',e=>{if(running)touchBurst(e.clientX,e.clientY);});

  /* ── EVENT HOOKS ── */
  document.addEventListener('giftOpened',()=>{
    switchPalette('gift');
    for(let i=0;i<6;i++)setTimeout(()=>touchBurst(innerWidth*(0.15+Math.random()*0.7),innerHeight*(0.15+Math.random()*0.7)),i*110);
    setIntensity(3.5,5000);
  });
  document.addEventListener('poemStarted',()=>{switchPalette('poem');setIntensity(2.2,90000);});
  document.addEventListener('endingStarted',()=>{
    switchPalette('ending');setIntensity(0.4);
    setTimeout(spawnShootingStar,3500);
    setTimeout(spawnShootingStar,9000);
  });

})();
