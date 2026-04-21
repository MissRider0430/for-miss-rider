/* ═══════════════════════════════════════
   sections/gift.js — Gift Opening Moment
═══════════════════════════════════════ */

(function() {

  function showGift() {
        const overlay = document.getElementById('gift-overlay');
        const giftBox = document.getElementById('gift-box');
        const giftHint = document.getElementById('gift-hint');
        const giftReveal = document.getElementById('gift-reveal');
        const giftLabel = overlay.querySelector('.gift-label');
        const continueBtn = document.getElementById('gift-continue');
        const whiteFlash = document.getElementById('white-flash');
        let opened = false;

        overlay.classList.add('active');
        gsap.to(overlay, { opacity: 1, duration: 1.2,
          ease: 'power2.out' });
        gsap.to(giftLabel, { opacity: 1, duration: 1,
          delay: 0.5 });

        function openGift() {
          if (opened) return;
          opened = true;
          giftHint.style.display = 'none';

          // Shake
          const shk = gsap.timeline();
          shk
            .to(giftBox, { x:-10, rotation:-3, duration:.06 })
            .to(giftBox, { x: 10, rotation: 3,  duration:.06 })
            .to(giftBox, { x: -7, rotation:-2,  duration:.06 })
            .to(giftBox, { x:  7, rotation: 2,  duration:.06 })
            .to(giftBox, { x:  0, rotation: 0,  duration:.08 })
            .call(() => {
              // Flash
              gsap.to(whiteFlash, { opacity: 0.7,
                duration: 0.07, onComplete: () =>
                gsap.to(whiteFlash, { opacity: 0,
                  duration: 0.5 })
              });
              // Open lid
              giftBox.classList.add('opening');
            document.dispatchEvent(new Event('giftOpened'));
              // Shake page
              gsap.to(document.body,
                { x: 8, y:-3, duration:.05 });
              gsap.to(document.body,
                { x:-10, y: 4, duration:.05, delay:.05 });
              gsap.to(document.body,
                { x:  6, y:-2, duration:.05, delay:.10 });
              gsap.to(document.body,
                { x:  0, y: 0, duration:.08, delay:.15 });

              setTimeout(() => {
                gsap.to(giftBox.parentElement,
                  { opacity: 0, y: -20, duration: 0.8,
                    ease: 'power2.in',
                    onComplete: () => {
                      giftBox.parentElement.style
                        .display = 'none';
                      giftReveal.style.display = 'block';
                      // Animate reveal words
                      const words = giftReveal
                        .querySelectorAll('.gift-word');
                      words.forEach((w, i) => {
                        gsap.to(w, {
                          opacity: 1, y: 0,
                          duration: 1,
                          delay: i * 1.4,
                          ease: 'power2.out'
                        });
                      });
                      // Show continue
                      gsap.to(continueBtn, {
                        opacity: 1, duration: 1,
                        delay: words.length * 1.4 + 1.5
                      });
                    }
                  });
              }, 900);
            });
        }

        giftBox.addEventListener('click', openGift);
        giftBox.addEventListener('touchend', e => {
          e.preventDefault(); openGift();
        });

        continueBtn.addEventListener('click', () => {
          gsap.to(overlay, { opacity: 0, duration: 1.2,
            ease: 'power2.inOut',
            onComplete: () => {
              overlay.style.display = 'none';
              setTimeout(showPortrait, 600);
            }
          });
        });
      }

  window.showGift = showGift;

})();
