/* ═══════════════════════════════════════
   sections/poem.js — Poem with Petals
═══════════════════════════════════════ */

(function() {

  function showPoem() {
        document.dispatchEvent(new Event('poemStarted'));
        const overlay = document.getElementById('poem-overlay');
        const canvas = document.getElementById('petal-canvas');
        const ctx = canvas.getContext('2d');
        const label = overlay.querySelector('.poem-label');
        const lines = overlay.querySelectorAll('.poem-line');
        const ornaments = overlay.querySelectorAll('.poem-ornament');
        const continueBtn = document.getElementById('poem-continue');

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        overlay.classList.add('active');
        gsap.to(overlay, { opacity: 1, duration: 1.2, ease: 'power2.out' });
        gsap.to(label, { opacity: 1, duration: 1, delay: 0.4 });

        // Build sequence — lines and ornaments interleaved
        const allItems = Array.from(
          overlay.querySelector('#poem-content').children
        ).filter(el =>
          el.classList.contains('poem-line') ||
          el.classList.contains('poem-ornament')
        );

        let delay = 1.2;
        allItems.forEach(item => {
          if (item.classList.contains('poem-ornament')) {
            gsap.to(item, {
              width: 120,
              opacity: 1,
              duration: 0.8,
              delay: delay,
              ease: 'power2.out'
            });
            delay += 0.6;
          } else {
            const isGlow = item.classList.contains('glow-line');
            gsap.to(item, {
              opacity: 1,
              y: 0,
              duration: isGlow ? 1.1 : 0.85,
              delay: delay,
              ease: 'power2.out',
              ...(isGlow ? { scale: 1, transformOrigin: 'center' } : {})
            });
            if (isGlow) {
              gsap.fromTo(item,
                { scale: 0.97 },
                { scale: 1, duration: 1.1, delay: delay, ease: 'power2.out' }
              );
            }
            delay += 0.7;
          }
        });

        // Show continue button after all lines
        gsap.to(continueBtn, {
          opacity: 1,
          duration: 1,
          delay: delay + 2
        });

        // Continue button tap hides poem
        continueBtn.addEventListener('click', () => {
          gsap.to(overlay, {
            opacity: 0,
            duration: 1.2,
            ease: 'power2.inOut',
            onComplete: () => {
              overlay.style.display = 'none';
              stopPetals();
              setTimeout(showGift, 600);
            }
          });
        });

        // Floating petals
        const petals = [];
        let petalTimer = null;
        const colors = ['#8b0000', '#c41e3a', '#e06070'];

        function spawnPetal() {
          petals.push({
            x: Math.random() * canvas.width,
            y: -20,
            vx: (Math.random() - 0.5) * 0.5,
            vy: 0.4 + Math.random() * 0.5,
            w: 6 + Math.random() * 10,
            h: 14 + Math.random() * 18,
            rot: Math.random() * Math.PI * 2,
            rs: (Math.random() - 0.5) * 0.018,
            alpha: 0.12 + Math.random() * 0.12,
            wave: Math.random() * Math.PI * 2,
            wspd: 0.01 + Math.random() * 0.01,
            color: colors[Math.floor(Math.random() * colors.length)]
          });
        }

        petalTimer = setInterval(() => {
          if (petals.length < 12) spawnPetal();
        }, 1100);

        function stopPetals() {
          clearInterval(petalTimer);
        }

        function drawPetals() {
          if (!overlay.classList.contains('active')) return;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          for (let i = petals.length - 1; i >= 0; i--) {
            const p = petals[i];
            p.wave += p.wspd;
            p.x += p.vx + Math.sin(p.wave) * 0.35;
            p.y += p.vy;
            p.rot += p.rs;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, p.w / 2, p.h / 2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            if (p.y > canvas.height + 30) petals.splice(i, 1);
          }
          requestAnimationFrame(drawPetals);
        }
        drawPetals();
      }

  window.showPoem = showPoem;

})();
