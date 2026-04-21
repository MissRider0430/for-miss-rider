/* ═══════════════════════════════════════
   sections/portrait.js — Photo Portrait
═══════════════════════════════════════ */

(function() {

  function showPortrait() {
        const overlay   = document.getElementById('portrait-overlay');
        const label     = overlay.querySelector('.portrait-label');
        const frame     = document.getElementById('portrait-frame');
        const crown     = document.getElementById('portrait-crown');
        const secondary = document.getElementById('portrait-secondary');
        const caption   = overlay.querySelector('.portrait-caption');
        const continueBtn = document.getElementById('portrait-continue');
        const mainImg   = document.getElementById('portrait-main-img');

        // Set base64 photos
        mainImg.src = PHOTO1;
        const thumbImgs = overlay.querySelectorAll('.portrait-thumb img');
        thumbImgs[0].src = PHOTO2;
        thumbImgs[1].src = PHOTO3;
        overlay.querySelectorAll('.portrait-thumb')[0].dataset.src = PHOTO2;
        overlay.querySelectorAll('.portrait-thumb')[1].dataset.src = PHOTO3;

        overlay.classList.add('active');
        gsap.to(overlay,    { opacity:1, duration:1.2, ease:'power2.out' });
        gsap.to(label,      { opacity:1, duration:1, delay:0.4 });
        gsap.to(frame,      { opacity:1, scale:1, duration:1.2, delay:0.7, ease:'back.out(1.4)' });
        gsap.to(crown,      { opacity:1, duration:0.8, delay:1.4 });
        gsap.to(secondary,  { opacity:1, duration:0.9, delay:1.6 });
        gsap.to(caption,    { opacity:1, duration:0.8, delay:2.0 });
        gsap.to(continueBtn,{ opacity:1, duration:0.8, delay:2.6 });

        overlay.querySelectorAll('.portrait-thumb').forEach(thumb => {
          thumb.addEventListener('click', () => {
            const src = thumb.dataset.src;
            const rot = thumb.dataset.rotate || '0';
            gsap.to(frame, { opacity:0, scale:0.96, duration:0.3, onComplete: () => {
              mainImg.src = src;
              mainImg.style.transform = `rotate(${rot}deg)`;
              gsap.to(frame, { opacity:1, scale:1, duration:0.4 });
            }});
          });
        });

        continueBtn.addEventListener('click', () => {
          gsap.to(overlay, { opacity:0, duration:1.2, ease:'power2.inOut', onComplete: () => {
            overlay.style.display = 'none';
            setTimeout(showCake, 600);
          }});
        });
      }

  window.showPortrait = showPortrait;

})();
