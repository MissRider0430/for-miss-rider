/* ═══════════════════════════════════════
   sections/lockscreen.js — Countdown & Hold-to-unlock
═══════════════════════════════════════ */

(function() {

  const MR  = window.MR;
  const els = MR.els;

  // ── Gyroscope ──
  function handleOrientation(event) {
        if (event.gamma == null || event.beta == null) return;
        gyroTargetX = Math.max(-30, Math.min(30, event.gamma * 0.5));
        gyroTargetY = Math.max(-30, Math.min(30, (event.beta - 45) * 0.5));
      }

      function requestGyroPermission() {
        if (gyroAttached) return;
        const D = window.DeviceOrientationEvent;
        if (D && typeof D.requestPermission === 'function') {
          D.requestPermission()
            .then(state => {
              if (state === 'granted' && !gyroAttached) {
                window.addEventListener('deviceorientation', handleOrientation, true);
                gyroAttached = true;
              }
            })
            .catch(() => {});
        } else {
          window.addEventListener('deviceorientation', handleOrientation, true);
          gyroAttached = true;
        }
      }

      window.addEventListener('click', requestGyroPermission, { once: true });
      window.addEventListener('touchstart', requestGyroPermission, { once: true, passive: true });

      const targetDate = new Date("2026-04-30T00:00:00").getTime();

  window.addEventListener('click',      requestGyroPermission, { once: true });
  window.addEventListener('touchstart', requestGyroPermission, { once: true, passive: true });

  // ── Countdown Clock ──
  function updateClock() {
        const now = Date.now();
        const distance = targetDate - now;

        if (distance <= 0) {
          lkD.innerText = "00";
          lkH.innerText = "00";
          lkM.innerText = "00";
          return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

        lkD.innerText = String(days).padStart(2, "0");
        lkH.innerText = String(hours).padStart(2, "0");
        lkM.innerText = String(minutes).padStart(2, "0");
      }

      updateClock();
      setInterval(updateClock, 1000);

  updateClock();
  setInterval(updateClock, 1000);

  // ── Hold-to-unlock ──
  let isHolding = false;
  let unlockTween = null;

  function startHold(e) {
        if (isUnlocked) return;
        if (e && e.cancelable) e.preventDefault();
        if (isHolding) return;

        isHolding = true;
        holdRingContainer.style.opacity = 1;

        gsap.killTweensOf(progressCircle);
        if (unlockTween) unlockTween.kill();

        unlockTween = gsap.to(progressCircle, {
          strokeDashoffset: 0,
          duration: 1.7,
          ease: "none",
          onComplete: unlockGarden
        });
      }

      function stopHold() {
        if (isUnlocked || !isHolding) return;
        isHolding = false;

        if (unlockTween) unlockTween.kill();
        gsap.killTweensOf(progressCircle);

        gsap.to(progressCircle, {
          strokeDashoffset: 283,
          duration: 0.36,
          ease: "power2.out"
        });

        holdRingContainer.style.opacity = 0;
      }

      lockscreen.addEventListener('pointerdown', startHold);
      window.addEventListener('pointerup', stopHold);
      window.addEventListener('pointercancel', stopHold);

      lockscreen.addEventListener('touchstart', startHold, { passive: false });
      lockscreen.addEventListener('touchend', stopHold);
      lockscreen.addEventListener('touchcancel', stopHold);
      lockscreen.addEventListener('mousedown', startHold);
      lockscreen.addEventListener('mouseup', stopHold);
      lockscreen.addEventListener('mouseleave', stopHold);

  els.lockscreen.addEventListener('pointerdown', startHold);
  window.addEventListener('pointerup',    stopHold);
  window.addEventListener('pointercancel',stopHold);
  els.lockscreen.addEventListener('touchstart', startHold, { passive: false });
  els.lockscreen.addEventListener('touchend',   stopHold);
  els.lockscreen.addEventListener('touchcancel',stopHold);
  els.lockscreen.addEventListener('mousedown',  startHold);
  els.lockscreen.addEventListener('mouseup',    stopHold);
  els.lockscreen.addEventListener('mouseleave', stopHold);

})();
