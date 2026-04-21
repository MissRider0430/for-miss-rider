/* ═══════════════════════════════════════
   core/audio.js — Music & Sound System
═══════════════════════════════════════ */

(function () {
      // ── EMBEDDED PHOTOS (base64) ──


(function () {
      // ── EMBEDDED PHOTOS (base64) ──


      const bgMusic = new Audio('./music.mp3');
      bgMusic.loop = true;
      bgMusic.volume = 0;

      function startMusic() {
        bgMusic.load();
        const playPromise = bgMusic.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            let vol = 0;
            const fade = setInterval(() => {
              vol = Math.min(vol + 0.005, 0.45);
              bgMusic.volume = vol;
              if (vol >= 0.45) clearInterval(fade);
            }, 50);
          }).catch(err => {
            console.log('Audio blocked:', err);
            // retry on next touch
            document.addEventListener('touchstart', () => {
              startMusic();
            }, { once: true });
          });

function startSoundscape() {
        if (audioCtx) return;
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;

        audioCtx = new AC();
        masterGain = audioCtx.createGain();
        masterGain.gain.value = 0.03;
        masterGain.connect(audioCtx.destination);

        const bassFilter = audioCtx.createBiquadFilter();
        bassFilter.type = 'lowpass';
        bassFilter.frequency.value = 180;
        bassFilter.Q.value = 0.7;

        const bassGain = audioCtx.createGain();
        bassGain.gain.value = 0.9;

        const drone1 = audioCtx.createOscillator();
        drone1.type = 'sine';
        drone1.frequency.value = 55;

        const drone2 = audioCtx.createOscillator();
        drone2.type = 'triangle';
        drone2.frequency.value = 110;

        const shimmerFilter = audioCtx.createBiquadFilter();
        shimmerFilter.type = 'highpass';
        shimmerFilter.frequency.value = 85;

        const shimmerGain = audioCtx.createGain();
        shimmerGain.gain.value = 0.08;

        const shimmer = audioCtx.createOscillator();
        shimmer.type = 'sine';
        shimmer.frequency.value = 220;

        drone1.connect(bassFilter);
        bassFilter.connect(bassGain);
        bassGain.connect(masterGain);

        drone2.connect(shimmerFilter);
        shimmerFilter.connect(shimmerGain);
        shimmerGain.connect(masterGain);

        shimmer.connect(masterGain);

        drone1.start();
        drone2.start();
        shimmer.start();

        function playChime() {
          if (!audioCtx) return;
          const now = audioCtx.currentTime;
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          const filter = audioCtx.createBiquadFilter();

          const notes = [659.25, 783.99, 987.77, 1046.5, 1318.5];
          const freq = notes[Math.floor(Math.random() * notes.length)];

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + 1.2);

          filter.type = 'highpass';
          filter.frequency.value = 240;

          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.exponentialRampToValueAtTime(0.05, now + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(masterGain);

          osc.start(now);
          osc.stop(now + 1.45);
        }

        function scheduleChime() {
          if (!audioCtx) return;
          chimeTimer = setTimeout(() => {
            if (!audioCtx) return;
            playChime();
            scheduleChime();
          }, 6200 + Math.random() * 6200);
        }

        scheduleChime();
      }

      function initAudio() {
        if (ambientAudioCtx) return;
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;

        ambientAudioCtx = new AC();

        // Master gain — starts silent, fades to 0.35 over 6 seconds
        ambientMasterGain = ambientAudioCtx.createGain();
        ambientMasterGain.gain.setValueAtTime(0, ambientAudioCtx.currentTime);
        ambientMasterGain.gain.linearRampToValueAtTime(0.35, ambientAudioCtx.currentTime + 7.5);
        ambientMasterGain.connect(ambientAudioCtx.destination);

        // Convolver reverb with synthesized exponential-decay impulse response
        const reverb = ambientAudioCtx.createConvolver();
        const sr = ambientAudioCtx.sampleRate;
        const irLen = Math.floor(sr * 3.8);
        const irBuf = ambientAudioCtx.createBuffer(2, irLen, sr);
        for (let ch = 0; ch < 2; ch++) {
          const d = irBuf.getChannelData(ch);
          for (let i = 0; i < irLen; i++) {
            d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / irLen, 2.1);
          }
        }
        reverb.buffer = irBuf;

        const reverbGain = ambientAudioCtx.createGain();
        reverbGain.gain.value = 0.54;
        reverb.connect(reverbGain);
        reverbGain.connect(ambientMasterGain);

        const dryGain = ambientAudioCtx.createGain();
        dryGain.gain.value = 0.46;
        dryGain.connect(ambientMasterGain);

        // Bass drone — D1 (~36.71 Hz)
        const bassDrone = ambientAudioCtx.createOscillator();
        bassDrone.type = 'sine';
        bassDrone.frequency.value = 36.71;
        const bassDroneGain = ambientAudioCtx.createGain();
        bassDroneGain.gain.value = 0.62;
        bassDrone.connect(bassDroneGain);
        bassDroneGain.connect(dryGain);
        bassDroneGain.connect(reverb);
        bassDrone.start();

        // Dm chord — D3 (146.83 Hz), F3 (174.61 Hz), A3 (220.00 Hz)
        const chordDefs = [
          { freq: 146.83, type: 'sine',     peak: 0.13 },
          { freq: 174.61, type: 'triangle', peak: 0.09 },
          { freq: 220.00, type: 'triangle', peak: 0.07 }
        ];

        const chordGains = chordDefs.map(({ freq, type, peak }) => {
          const osc = ambientAudioCtx.createOscillator();
          osc.type = type;
          osc.frequency.value = freq;
          const g = ambientAudioCtx.createGain();
          g.gain.value = 0;
          osc.connect(g);
          g.connect(reverb);
          g.connect(dryGain);
          osc.start();
          return { g, peak };
        });

        // Cycle the chord softly every ~50 seconds
        function cycleChord() {
          const now = ambientAudioCtx.currentTime;
          chordGains.forEach(({ g, peak }) => {
            g.gain.cancelScheduledValues(now);
            g.gain.setValueAtTime(0, now);
            g.gain.linearRampToValueAtTime(peak, now + 12);
            g.gain.linearRampToValueAtTime(peak * 0.78, now + 31);
            g.gain.linearRampToValueAtTime(peak, now + 44);
            g.gain.linearRampToValueAtTime(0, now + 56);
          });
          setTimeout(cycleChord, 58000);
        }

        // Begin first chord cycle after 3-second delay
        setTimeout(cycleChord, 2600);

        if (ambientAudioCtx.state === 'suspended') {
          ambientAudioCtx.resume().catch(() => {});
        }