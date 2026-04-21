/* ═══════════════════════════════════════
   sections/cake.js — Birthday Cake
═══════════════════════════════════════ */

(function() {

  // ── CONFETTI for cake ──
      function spawnConfetti(x, y, n) {
        const canvas = document.getElementById('cracker-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const pal = ['#c41e3a','#8b0000','#e06070',
          '#c9a84c','#f0ddc8','#fff','#ff3355','#ffcc00'];
        const parts = [];
        for (let i = 0; i < n; i++) {
          const a = Math.random() * Math.PI * 2;
          const spd = 2.5 + Math.random() * 9;
          parts.push({
            x, y,
            vx: Math.cos(a) * spd,
            vy: Math.sin(a) * spd - Math.random() * 4,
            col: pal[Math.floor(Math.random() * pal.length)],
            sz: 2.5 + Math.random() * 5,
            alpha: 1,
            grav: 0.09 + Math.random() * 0.09,
            rot: Math.random() * 360,
            rs: (Math.random() - 0.5) * 11,
            tp: Math.random() < 0.35 ? 'r' : Math.random() < 0.65 ? 'c' : 'e'
          });
        }
        function loop() {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          let alive = false;
          parts.forEach(p => {
            if (p.alpha <= 0.02) return;
            alive = true;
            p.x += p.vx; p.y += p.vy;
            p.vy += p.grav; p.vx *= 0.988;
            p.alpha -= 0.013; p.rot += p.rs;
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot * Math.PI / 180);
            ctx.fillStyle = p.col;
            if (p.tp === 'r')
              ctx.fillRect(-p.sz/2, -p.sz/4, p.sz, p.sz/2);
            else if (p.tp === 'c') {
              ctx.beginPath();
              ctx.arc(0, 0, p.sz/2, 0, Math.PI*2);
              ctx.fill();
            } else {
              ctx.beginPath();
              ctx.ellipse(0, 0, p.sz/2, p.sz, 0, 0, Math.PI*2);
              ctx.fill();
            }
            ctx.restore();
          });
          if (alive) requestAnimationFrame(loop);
          else ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        loop();
      }

  function showCake() {
        const overlay  = document.getElementById('cake-overlay');
        const label    = overlay.querySelector('.cake-label');
        const bday     = overlay.querySelector('.cake-bday');
        const name     = overlay.querySelector('.cake-name');
        const wrap     = document.getElementById('cake-wrap');
        const wish     = overlay.querySelector('.cake-wish');
        const contBtn  = document.getElementById('cake-continue');

        overlay.classList.add('active');
        gsap.to(overlay, { opacity:1, duration:1.4, ease:'power2.out' });
        gsap.to(label,   { opacity:1, duration:1,   delay:0.4 });
        gsap.to(bday,    { opacity:1, duration:1.1, delay:0.8 });
        gsap.to(name,    { opacity:1, duration:1.2, delay:1.1,
          ease:'power2.out' });
        gsap.to(wrap,    { opacity:1, duration:1,   delay:1.6 });

        // Confetti burst when cake appears
        setTimeout(() => {
          spawnConfetti(window.innerWidth * 0.15,
            window.innerHeight * 0.35, 55);
          spawnConfetti(window.innerWidth * 0.85,
            window.innerHeight * 0.35, 55);
          setTimeout(() => spawnConfetti(
            window.innerWidth / 2,
            window.innerHeight * 0.2, 75), 350);
        }, 1800);

        gsap.to(wish,    { opacity:1, duration:1.4, delay:2.4 });
        gsap.to(contBtn, { opacity:1, duration:1,   delay:4.2 });

        contBtn.addEventListener('click', () => {
          gsap.to(overlay, {
            opacity:0, duration:1.2, ease:'power2.inOut',
            onComplete: () => {
              overlay.style.display = 'none';
              setTimeout(showEnding, 600);
            }
          });
        });
      }

  window.showCake = showCake;

})();
