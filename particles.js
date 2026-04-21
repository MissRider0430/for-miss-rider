/* ═══════════════════════════════════════════════════════════════
   particles.js — Cinematic Particle System for Miss Rider
   
   Features:
   - Lily petals (realistic SVG-shaped, canvas-drawn)
   - Glowing dust particles
   - Light orbs (breathing, floating)
   - Touch burst — particles explode from finger
   - Ambient drift — always running, full screen
   - Section-aware — intensifies during poem/gift/ending
   - Mobile optimized
═══════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  /* ── CONFIG ── */
  const CFG = {
    isMobile: /Android|iPhone|iPad|iPod/i.test(navigator.userAgent),
    colors: {
      petal:  ['#8b0000','#c41e3a','#e06070','#b01030','#d43050'],
      dust:   ['#c9a84c','#e8d080','#f0ddc8','#c41e3a','#ff8899'],
      orb:    ['rgba(196,30,58,', 'rgba(201,168,76,', 'rgba(224,96,112,']
    },
    ambient: {
      petals:  55,   // base ambient petal count (desktop)
      dust:    120,
      orbs:    18
    },
    touch: {
      petals:  22,
      dust:    35,
      orbs:    6
    }
  };

  const M = CFG.isMobile;

  /* ── CANVAS SETUP ── */
  const canvas = document.createElement('canvas');
  canvas.id = 'particle-canvas';
  canvas.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 18;
    pointer-events: none;
    opacity: 0;
    transition: opacity 1.8s ease;
  `;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  /* ── PARTICLE POOLS ── */
  const petals = [];
  const dusts  = [];
  const orbs   = [];

  /* ══════════════════════════════════════════
     PETAL PARTICLE
  ══════════════════════════════════════════ */
  function makePetal(x, y, burst) {
    const size  = burst
      ? 8 + Math.random() * 20
      : 6 + Math.random() * 18;
    const speed = burst
      ? 1.8 + Math.random() * 4.5
      : 0.25 + Math.random() * 0.7;
    const angle = burst
      ? Math.random() * Math.PI * 2
      : (-Math.PI * 0.5) + (Math.random() - 0.5) * 1.2;

    return {
      x:     x ?? Math.random() * canvas.width,
      y:     y ?? -size,
      vx:    Math.cos(angle) * speed * (burst ? 1 : 0.5),
      vy:    Math.sin(angle) * speed + (burst ? -1.5 : 0.3 + Math.random() * 0.5),
      size,
      rot:   Math.random() * Math.PI * 2,
      rotV:  (Math.random() - 0.5) * 0.055,
      alpha: burst ? 0.9 : 0.15 + Math.random() * 0.55,
      alphaDecay: burst ? 0.008 + Math.random() * 0.006 : 0.0012,
      color: CFG.colors.petal[Math.floor(Math.random() * CFG.colors.petal.length)],
      wave:  Math.random() * Math.PI * 2,
      waveSpeed: 0.008 + Math.random() * 0.014,
      waveAmp:   0.3 + Math.random() * 0.5,
      gravity:   burst ? 0.06 + Math.random() * 0.04 : 0.006,
      drag:      burst ? 0.97 : 0.999,
      burst
    };
  }

  function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = Math.max(0, p.alpha);

    // Petal shape — elongated ellipse with slight curve
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size * 0.38, p.size, 0, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();

    // Vein — subtle center line
    ctx.beginPath();
    ctx.moveTo(0, -p.size * 0.85);
    ctx.lineTo(0, p.size * 0.85);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // Soft glow on petal
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 0.6);
    grad.addColorStop(0, 'rgba(255,180,180,0.08)');
    grad.addColorStop(1, 'rgba(255,180,180,0)');
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size * 0.38, p.size, 0, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.restore();
  }

  function updatePetal(p) {
    p.wave += p.waveSpeed;
    p.x   += p.vx + Math.sin(p.wave) * p.waveAmp;
    p.y   += p.vy;
    p.vy  += p.gravity;
    p.vx  *= p.drag;
    p.vy  *= p.drag;
    p.rot += p.rotV;
    if (p.burst) p.alpha -= p.alphaDecay;
    else p.alpha -= p.alphaDecay * (p.y / canvas.height + 0.3);
    return p.alpha > 0.005 && p.y < canvas.height + 60;
  }

  /* ══════════════════════════════════════════
     DUST PARTICLE
  ══════════════════════════════════════════ */
  function makeDust(x, y, burst) {
    const speed = burst
      ? 1.2 + Math.random() * 3.5
      : 0.15 + Math.random() * 0.4;
    const angle = burst
      ? Math.random() * Math.PI * 2
      : Math.random() * Math.PI * 2;

    return {
      x:    x ?? Math.random() * canvas.width,
      y:    y ?? Math.random() * canvas.height,
      vx:   Math.cos(angle) * speed,
      vy:   Math.sin(angle) * speed - (burst ? 1 : 0.1 + Math.random() * 0.2),
      size: burst ? 1.5 + Math.random() * 3 : 0.8 + Math.random() * 2.2,
      alpha: burst ? 0.95 : 0.08 + Math.random() * 0.35,
      alphaDecay: burst ? 0.012 : 0.0006 + Math.random() * 0.0008,
      color: CFG.colors.dust[Math.floor(Math.random() * CFG.colors.dust.length)],
      glow:  Math.random() > 0.6,
      wave:  Math.random() * Math.PI * 2,
      waveSpeed: 0.012 + Math.random() * 0.02,
      burst
    };
  }

  function drawDust(p) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.alpha);

    if (p.glow) {
      // Glowing dust orb
      const grad = ctx.createRadialGradient(
        p.x, p.y, 0, p.x, p.y, p.size * 3
      );
      grad.addColorStop(0, p.color.replace('rgba(', 'rgba(').replace(/,[^,]*\)/, `,${p.alpha})`));
      grad.addColorStop(0.4, p.color + '55');
      grad.addColorStop(1, p.color + '00');
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();

    ctx.restore();
  }

  function updateDust(p) {
    p.wave += p.waveSpeed;
    p.x += p.vx + Math.sin(p.wave * 0.7) * 0.25;
    p.y += p.vy;
    p.vx *= 0.995;
    p.vy *= 0.993;
    if (p.burst) p.alpha -= p.alphaDecay;
    else {
      // Ambient dust wraps around screen
      if (p.x < -10) p.x = canvas.width + 10;
      if (p.x > canvas.width + 10) p.x = -10;
      if (p.y < -10) p.y = canvas.height + 10;
      if (p.y > canvas.height + 10) p.y = -10;
    }
    return p.alpha > 0.004;
  }

  /* ══════════════════════════════════════════
     ORB PARTICLE
  ══════════════════════════════════════════ */
  function makeOrb(x, y, burst) {
    const size = burst
      ? 12 + Math.random() * 28
      : 18 + Math.random() * 55;
    const colorBase = CFG.colors.orb[
      Math.floor(Math.random() * CFG.colors.orb.length)
    ];

    return {
      x:    x ?? Math.random() * canvas.width,
      y:    y ?? Math.random() * canvas.height,
      vx:   (Math.random() - 0.5) * (burst ? 2.5 : 0.18),
      vy:   (Math.random() - 0.5) * (burst ? 2.5 : 0.14) - (burst ? 1.5 : 0),
      size,
      alpha: burst ? 0.7 : 0.04 + Math.random() * 0.12,
      alphaDecay: burst ? 0.008 : 0.0003,
      colorBase,
      breathe: Math.random() * Math.PI * 2,
      breatheSpeed: 0.008 + Math.random() * 0.012,
      breatheAmp: 0.015 + Math.random() * 0.025,
      burst
    };
  }

  function drawOrb(p) {
    ctx.save();
    const a = Math.max(0, p.alpha);
    const grad = ctx.createRadialGradient(
      p.x, p.y, 0,
      p.x, p.y, p.size
    );
    grad.addColorStop(0,   p.colorBase + (a * 0.7).toFixed(2) + ')');
    grad.addColorStop(0.5, p.colorBase + (a * 0.3).toFixed(2) + ')');
    grad.addColorStop(1,   p.colorBase + '0)');
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();
  }

  function updateOrb(p) {
    p.breathe += p.breatheSpeed;
    p.alpha += Math.sin(p.breathe) * p.breatheAmp * 0.01;
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.99;
    p.vy *= 0.99;
    if (p.burst) {
      p.alpha -= p.alphaDecay;
      return p.alpha > 0.01;
    }
    // Wrap
    if (p.x < -p.size) p.x = canvas.width + p.size;
    if (p.x > canvas.width + p.size) p.x = -p.size;
    if (p.y < -p.size) p.y = canvas.height + p.size;
    if (p.y > canvas.height + p.size) p.y = -p.size;
    return true;
  }

  /* ══════════════════════════════════════════
     SPAWN AMBIENT PARTICLES
  ══════════════════════════════════════════ */
  const SCALE = M ? 0.5 : 1;

  function spawnAmbient() {
    const maxP = Math.floor(CFG.ambient.petals * SCALE);
    const maxD = Math.floor(CFG.ambient.dust * SCALE);
    const maxO = Math.floor(CFG.ambient.orbs * SCALE);

    // Initial fill
    for (let i = 0; i < maxP; i++) {
      const p = makePetal(null, null, false);
      p.y = Math.random() * canvas.height; // start scattered
      petals.push(p);
    }
    for (let i = 0; i < maxD; i++) dusts.push(makeDust(null, null, false));
    for (let i = 0; i < maxO; i++) orbs.push(makeOrb(null, null, false));

    // Continuous spawn
    setInterval(() => {
      if (petals.filter(p => !p.burst).length < maxP) {
        petals.push(makePetal(null, -20, false));
      }
      if (dusts.filter(p => !p.burst).length < maxD) {
        dusts.push(makeDust(null, null, false));
      }
      if (orbs.filter(p => !p.burst).length < maxO) {
        orbs.push(makeOrb(null, null, false));
      }
    }, M ? 400 : 220);
  }

  /* ══════════════════════════════════════════
     TOUCH BURST
  ══════════════════════════════════════════ */
  function touchBurst(x, y) {
    const np = Math.floor(CFG.touch.petals * SCALE);
    const nd = Math.floor(CFG.touch.dust * SCALE);
    const no = Math.floor(CFG.touch.orbs * SCALE);

    for (let i = 0; i < np; i++) petals.push(makePetal(x, y, true));
    for (let i = 0; i < nd; i++) dusts.push(makeDust(x, y, true));
    for (let i = 0; i < no; i++) orbs.push(makeOrb(x, y, true));
  }

  /* ══════════════════════════════════════════
     SECTION INTENSITY
     Increase particle density in key sections
  ══════════════════════════════════════════ */
  let intensityTimer = null;
  let intensity = 1;

  function setIntensity(level, duration) {
    intensity = level;
    if (intensityTimer) clearTimeout(intensityTimer);
    if (duration) {
      intensityTimer = setTimeout(() => { intensity = 1; }, duration);
    }
  }

  // Watch for section changes
  const observer = new MutationObserver(() => {
    const poem     = document.getElementById('poem-overlay');
    const gift     = document.getElementById('gift-overlay');
    const portrait = document.getElementById('portrait-overlay');
    const cake     = document.getElementById('cake-overlay');
    const ending   = document.getElementById('ending-overlay');

    if (poem?.classList.contains('active'))     setIntensity(1.8);
    if (gift?.classList.contains('active'))     setIntensity(1.5);
    if (portrait?.classList.contains('active')) setIntensity(1.3);
    if (cake?.classList.contains('active'))     setIntensity(2.2);
    if (ending?.classList.contains('active'))   setIntensity(0.6);
  });
  observer.observe(document.body, {
    attributes: true, subtree: true, attributeFilter: ['class']
  });

  /* ══════════════════════════════════════════
     RENDER LOOP
  ══════════════════════════════════════════ */
  let running = false;
  let frameCount = 0;

  function render() {
    requestAnimationFrame(render);
    frameCount++;

    // Skip frames on mobile for performance
    if (M && frameCount % 2 !== 0) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw orbs first (background layer)
    for (let i = orbs.length - 1; i >= 0; i--) {
      drawOrb(orbs[i]);
      if (!updateOrb(orbs[i])) orbs.splice(i, 1);
    }

    // Draw dust (mid layer)
    for (let i = dusts.length - 1; i >= 0; i--) {
      drawDust(dusts[i]);
      if (!updateDust(dusts[i])) dusts.splice(i, 1);
    }

    // Draw petals (top layer)
    for (let i = petals.length - 1; i >= 0; i--) {
      drawPetal(petals[i]);
      if (!updatePetal(petals[i])) petals.splice(i, 1);
    }
  }

  /* ══════════════════════════════════════════
     PUBLIC API
  ══════════════════════════════════════════ */
  window.ParticleSystem = {

    // Call this after unlock to start the system
    start() {
      canvas.style.opacity = '1';
      if (!running) {
        running = true;
        spawnAmbient();
        render();
      }
    },

    // Burst from a point (call on touch)
    burst(x, y) {
      touchBurst(x, y);
    },

    // Intensify for a section
    intensify(level, ms) {
      setIntensity(level, ms);
    },

    // Stop (fade out)
    stop() {
      canvas.style.opacity = '0';
    }
  };

  /* ══════════════════════════════════════════
     TOUCH INTEGRATION
     Auto-connects to touch events
  ══════════════════════════════════════════ */
  function onTouch(e) {
    const t = e.touches ? e.touches[0] : e;
    if (!t || !running) return;
    touchBurst(t.clientX, t.clientY);
  }

  window.addEventListener('touchstart', onTouch, { passive: true });
  window.addEventListener('click', e => {
    if (running) touchBurst(e.clientX, e.clientY);
  });

  /* ══════════════════════════════════════════
     SPECIAL MOMENTS
     Auto-triggers on key events
  ══════════════════════════════════════════ */

  // Massive burst when gift opens
  document.addEventListener('giftOpened', () => {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        touchBurst(
          window.innerWidth  * (0.2 + Math.random() * 0.6),
          window.innerHeight * (0.2 + Math.random() * 0.6)
        );
      }, i * 120);
    }
    setIntensity(3, 4000);
  });

  // Gentle drift when poem starts
  document.addEventListener('poemStarted', () => {
    setIntensity(2, 60000);
  });

  // Calm ending
  document.addEventListener('endingStarted', () => {
    setIntensity(0.4);
  });

})();
