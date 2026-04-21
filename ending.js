/* ═══════════════════════════════════════
   sections/ending.js — Final Ending
═══════════════════════════════════════ */

(function() {

  function showEnding() {
        const overlay = document.getElementById('ending-overlay');
        const orn     = document.getElementById('e-orn');
        const line1   = document.getElementById('e-line1');
        const div     = document.getElementById('e-div');
        const line2   = document.getElementById('e-line2');
        const sig     = document.getElementById('e-sig');
        const hint    = document.getElementById('e-garden');

        overlay.classList.add('active');
        document.dispatchEvent(new Event('endingStarted'));

        gsap.to(overlay, {
          opacity:1, duration:2, ease:'power2.out',
          onComplete: () => {
            // Ornament fades in
            gsap.to(orn, { opacity:1, duration:1.5 });
            // Trigger blur→focus transitions
            setTimeout(() => {
              line1.classList.add('vis');
              div.classList.add('vis');
              line2.classList.add('vis');
              sig.classList.add('vis');
            }, 400);
            // Garden hint appears last
            setTimeout(() => {
              gsap.to(hint, { opacity:1, duration:1.5 });
            }, 6000);
          }
        });

        // "return to garden" — hides ending, shows 3D garden
        hint.addEventListener('click', () => {
          gsap.to(overlay, {
            opacity:0, duration:1.8, ease:'power2.inOut',
            onComplete: () => {
              overlay.style.display = 'none';
            }
          });
        });
      }


      // Cracker canvas resize
      const crackerCanvas = document.getElementById('cracker-canvas');
      function resizeCracker() {
        if (!crackerCanvas) return;
        crackerCanvas.width  = window.innerWidth;
        crackerCanvas.height = window.innerHeight;
      }
      if (crackerCanvas) resizeCracker();
      window.addEventListener('resize', resizeCracker, {passive:true});

  window.showEnding = showEnding;

})();
