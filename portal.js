/* ═══════════════════════════════════════
   sections/portal.js — Portal & Hero Entrance
═══════════════════════════════════════ */

(function() {

  const MR  = window.MR;
  const els = MR.els;

  let cinematicHasPlayed = false;
  let idleWhisperTimer   = null;

  function resetWhisperTimer() {
        if (!isUnlocked) return;
        whisper.classList.remove('show');
        if (idleWhisperTimer) clearTimeout(idleWhisperTimer);
        idleWhisperTimer = setTimeout(() => {
          if (isUnlocked) whisper.classList.add('show');
        }, 8200);
      }

      function hideWhisperAndReset() {
        whisper.classList.remove('show');
        resetWhisperTimer();
      }

      function playCinematicTextSequence() {
        if (cinematicHasPlayed) return;
        cinematicHasPlayed = true;

        const sequence = [
          "The garden remembers your name.",
          "Tonight, every petal wakes for you.",
          "Step gently. Let wonder answer."
        ];

        const timeline = gsap.timeline({
          defaults: { ease: "power2.out" },
          onComplete: () => {
            gsap.to(cinematicOverlay, {
              opacity: 0,
              duration: 1.15,
              ease: "power1.out"
            });
            setTimeout(showPoem, 1800);
          }
        });

        timeline.to(cinematicOverlay, { opacity: 1, duration: 0.95 });

        const addCinematicBeat = (text, options = {}) => {
          const fadeInDuration = options.fadeInDuration ?? 1.25;
          const holdDuration = options.holdDuration ?? 0.9;
          const fadeOutDuration = options.fadeOutDuration ?? 1.1;
          const gapBefore = options.gapBefore ?? 0;

          if (gapBefore > 0) {
            timeline.to({}, { duration: gapBefore });
          }

          timeline.call(() => {
            cinematicLine.textContent = text;
          });
          timeline.fromTo(
            cinematicLine,
            { opacity: 0, y: 24, scale: 0.97 },
            { opacity: 1, y: 0, scale: 1, duration: fadeInDuration, ease: "power2.out" }
          );
          timeline.to(cinematicLine, {
            opacity: 0,
            y: -12,
            duration: fadeOutDuration,
            delay: holdDuration,
            ease: "power1.inOut"
          });
        };

        addCinematicBeat("I was waiting for you, Miss Rider.", {
          fadeInDuration: 1.25,
          holdDuration: 2.9,
          fadeOutDuration: 1.1
        });
        addCinematicBeat("Happy Birthday.", {
          gapBefore: 2.6,
          fadeInDuration: 1.65,
          holdDuration: 3.3,
          fadeOutDuration: 1.1
        });
        addCinematicBeat("You make time feel… softer.", {
          gapBefore: 0.9,
          fadeInDuration: 1.25,
          holdDuration: 4.3,
          fadeOutDuration: 1.1
        });

        sequence.forEach((text, index) => {
          timeline.call(() => {
            cinematicLine.textContent = text;
          });
          timeline.fromTo(
            cinematicLine,
            { opacity: 0, y: 24, scale: 0.97 },
            { opacity: 1, y: 0, scale: 1, duration: 1.25 }
          );
          timeline.to(cinematicLine, {
            opacity: 0,
            y: -12,
            duration: 1.1,
            delay: index === sequence.length - 1 ? 1.2 : 0.9,
            ease: "power1.inOut"
          });
        });
      }

  function unlockGarden() {
        if (isUnlocked) return;
        isUnlocked = true;

        const portalCircle = document.getElementById('portal-circle');
        const whiteFlash = document.getElementById('white-flash');
        const heroOverlay = document.getElementById('hero-overlay');
        const heroNameEl = document.getElementById('hero-name');
        const heroRule = document.getElementById('hero-rule');
        const heroDate = document.getElementById('hero-date');
        const musicToggle = document.getElementById('music-toggle');
        const mp3Toggle = document.getElementById('mp3-toggle');

        // Wrap each character of "Miss Rider" in a span for letter-by-letter animation
        const nameText = heroNameEl.textContent;
        heroNameEl.innerHTML = nameText.split('').map(ch =>
          ch === ' ' ? '<span class="letter" style="display:inline-block;width:0.28em;">&nbsp;</span>'
                     : `<span class="letter">${ch}</span>`
        ).join('');
        const letters = heroNameEl.querySelectorAll('.letter');

        // --- Step 1: Fade out lockscreen (existing behaviour) ---
        gsap.to([lockscreen, holdRingContainer], {
          opacity: 0,
          duration: 1.25,
          ease: "power2.inOut",
          onComplete: () => {
            lockscreen.style.display = "none";
            holdRingContainer.style.display = "none";
          }
        });

        // --- Step 2: Portal circle expands from centre ---
        const portalTl = gsap.timeline();

        portalTl.set(portalCircle, { width: 0, height: 0, opacity: 0 });
        portalTl.to(portalCircle, {
          opacity: 1,
          width: '18vmax',
          height: '18vmax',
          duration: 0.65,
          ease: "power3.out"
        });

        // Pulsing glow on the circle
        portalTl.to(portalCircle, {
          boxShadow: '0 0 100px 40px rgba(196,30,58,0.75), 0 0 200px 70px rgba(140,0,20,0.4), inset 0 0 60px rgba(255,40,60,0.25)',
          duration: 0.48,
          ease: "power2.inOut",
          yoyo: true,
          repeat: 1
        });

        // Expand to fill screen
        portalTl.to(portalCircle, {
          width: '260vmax',
          height: '260vmax',
          duration: 0.8,
          ease: "power3.in"
        });

        // --- Step 3: Screen shake (brief, 3-4 frames worth) ---
        portalTl.to(document.body, {
          x: -6,
          y: 3,
          duration: 0.05,
          ease: "none"
        });
        portalTl.to(document.body, {
          x: 5,
          y: -4,
          duration: 0.05,
          ease: "none"
        });
        portalTl.to(document.body, {
          x: -3,
          y: 2,
          duration: 0.05,
          ease: "none"
        });
        portalTl.to(document.body, {
          x: 0,
          y: 0,
          duration: 0.05,
          ease: "none"
        });

        // --- Step 4: White flash 0→1→0 over ~400ms ---
        portalTl.to(whiteFlash, {
          opacity: 1,
          duration: 0.22,
          ease: "power2.in"
        });

        portalTl.call(() => {
          // Reveal the 3D canvas at peak of flash
          container.classList.add("unlocked");
          if (window.ParticleSystem) window.ParticleSystem.start();
          startSoundscape();
          if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume().catch(() => {});
          }
          initAudio();
          startMusic();
        });

        portalTl.to(whiteFlash, {
          opacity: 0,
          duration: 0.28,
          ease: "power2.out"
        });

        portalTl.to(portalCircle, {
          opacity: 0,
          duration: 0.42,
          ease: "power1.out"
        }, "<");

        // --- Step 5: Hero overlay fades in ---
        portalTl.to(heroOverlay, {
          opacity: 1,
          duration: 0.72,
          ease: "power2.out"
        });

        // Line grows outward
        portalTl.to(heroRule, {
          width: 'clamp(120px, 28vw, 320px)',
          duration: 0.82,
          ease: "power2.out"
        }, "<0.15");

        // Date fades in
        portalTl.to(heroDate, {
          opacity: 1,
          duration: 0.62,
          ease: "power1.out"
        }, "<0.2");

        // Letters animate in one by one
        portalTl.to(letters, {
          opacity: 1,
          y: 0,
          duration: 0.44,
          ease: "power3.out",
          stagger: 0.062
        }, "<-0.3");

        // Both music toggles fade in after hero settles
        portalTl.to([musicToggle, mp3Toggle], {
          opacity: 1,
          duration: 0.8,
          ease: "power1.out"
        }, ">0.9");
        portalTl.call(() => {
          musicToggle.classList.add('visible');
          mp3Toggle.classList.add('visible');
        });

        // Hero stays visible for a moment then fades
        portalTl.to(heroOverlay, {
          opacity: 0,
          duration: 1.35,
          ease: "power2.inOut",
          delay: 3.4,
          onComplete: () => {
            heroOverlay.style.display = "none";
            playCinematicTextSequence();
            hideWhisperAndReset();
            resetWhisperTimer();
          }
        });
      }

  // expose so lockscreen can call it
  window.unlockGarden = unlockGarden;

})();
