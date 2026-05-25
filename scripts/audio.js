/* ============================================
   SCRIPTS/AUDIO.JS — Web Audio API (Phase 2)
   Ambience layers, whispers, breathing,
   heartbeat, tension-aware audio
   Anomaly HRD
   ============================================ */

const AudioManager = (() => {

  let ctx = null;
  let masterGain = null;
  let ambienceGain = null;
  let tensionGain = null;
  let initialized = false;
  let tensionLevel = 0;

  // Active nodes
  let nodes = {
    rain: null,
    buzz: null,
    heartbeat: null,
    breathing: null,
    tension: null,
  };

  // ── Init ──
  const init = () => {
    if (initialized) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();

      masterGain = ctx.createGain();
      masterGain.gain.value = 0.7;
      masterGain.connect(ctx.destination);

      ambienceGain = ctx.createGain();
      ambienceGain.gain.value = 1.0;
      ambienceGain.connect(masterGain);

      tensionGain = ctx.createGain();
      tensionGain.gain.value = 0;
      tensionGain.connect(masterGain);

      initialized = true;
    } catch (e) {
      console.warn('AudioContext not available:', e);
    }
  };

  const _resume = () => {
    if (!initialized) init();
    if (ctx && ctx.state === 'suspended') ctx.resume();
  };

  // ═══════════════════════════════════════════
  // NOISE UTILITIES
  // ═══════════════════════════════════════════
  const _noiseBuffer = (dur = 2, color = 'white') => {
    if (!ctx) return null;
    const sr  = ctx.sampleRate;
    const buf = ctx.createBuffer(1, sr * dur, sr);
    const data = buf.getChannelData(0);
    let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
    for (let i = 0; i < data.length; i++) {
      const w = Math.random() * 2 - 1;
      if (color === 'pink') {
        // Pink noise (Paul Kellet's filter)
        b0=0.99886*b0+w*0.0555179; b1=0.99332*b1+w*0.0750759;
        b2=0.96900*b2+w*0.1538520; b3=0.86650*b3+w*0.3104856;
        b4=0.55000*b4+w*0.5329522; b5=-0.7616*b5-w*0.0168980;
        data[i] = (b0+b1+b2+b3+b4+b5+b6+w*0.5362) * 0.11;
        b6 = w * 0.115926;
      } else {
        data[i] = w;
      }
    }
    return buf;
  };

  const _playBuf = (buf, gain = 0.3, dest = masterGain, loop = false) => {
    if (!ctx || !buf) return null;
    const src = ctx.createBufferSource();
    const g   = ctx.createGain();
    src.buffer = buf;
    src.loop   = loop;
    g.gain.value = gain;
    src.connect(g);
    g.connect(dest);
    src.start();
    return { src, gain: g };
  };

  const _tone = (freq, type='sine', dur=0.2, gain=0.3, delay=0, dest=masterGain) => {
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const t = ctx.currentTime + delay;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(g); g.connect(dest);
    osc.start(t); osc.stop(t + dur);
  };

  const _static = (dur=0.3, gain=0.4, dest=masterGain) => {
    if (!ctx) return;
    const buf = _noiseBuffer(Math.max(0.1, dur));
    if (!buf) return;
    const src = ctx.createBufferSource();
    const g   = ctx.createGain();
    src.buffer = buf;
    g.gain.setValueAtTime(gain, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    src.connect(g); g.connect(dest);
    src.start(); src.stop(ctx.currentTime + dur);
  };

  // ═══════════════════════════════════════════
  // AMBIENCE LAYERS
  // ═══════════════════════════════════════════
  const _startRain = () => {
    if (nodes.rain) return;
    try {
      const buf = _noiseBuffer(3, 'pink');
      if (!buf) return;

      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;

      // Band-pass for rain character
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 600;
      bp.Q.value = 0.4;

      // Low-pass to cut hiss
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 3000;

      const g = ctx.createGain();
      g.gain.value = 0.3;

      src.connect(bp); bp.connect(lp); lp.connect(g); g.connect(ambienceGain);
      src.start();
      nodes.rain = { src, gain: g };
    } catch (e) { console.warn('Rain audio:', e); }
  };

  const _startBuzz = () => {
    if (nodes.buzz) return;
    try {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = 120;

      // Add slight wobble to the buzz
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.5;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 3;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();

      const g = ctx.createGain();
      g.gain.value = 0.012;
      osc.connect(g); g.connect(ambienceGain);
      osc.start();
      nodes.buzz = { src: osc, gain: g, lfo };
    } catch (e) { console.warn('Buzz audio:', e); }
  };

  // Subtle distant breathing (for tension >= 2)
  const _startBreathing = () => {
    if (nodes.breathing) return;
    try {
      const breathe = () => {
        if (!nodes.breathing || tensionLevel < 2) return;

        // Inhale
        const buf = _noiseBuffer(1.5, 'pink');
        if (!buf) return;
        const src = ctx.createBufferSource();
        src.buffer = buf;

        const env = ctx.createGain();
        const now = ctx.currentTime;
        env.gain.setValueAtTime(0, now);
        env.gain.linearRampToValueAtTime(0.04, now + 0.8);
        env.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass'; lp.frequency.value = 400;

        src.connect(lp); lp.connect(env); env.connect(tensionGain);
        src.start();

        setTimeout(breathe, 2800 + Math.random() * 2000);
      };

      nodes.breathing = { active: true };
      setTimeout(breathe, 3000);
    } catch (e) {}
  };

  // Low heartbeat thump (tension >= 3)
  const _startHeartbeat = () => {
    if (nodes.heartbeat) return;

    const beat = () => {
      if (!nodes.heartbeat || tensionLevel < 3) return;

      const bpm   = 60 + tensionLevel * 10;
      const interval = (60 / bpm) * 1000;

      // Two-thump heartbeat
      _tone(55, 'sine', 0.06, 0.25 * (tensionLevel / 5), 0, tensionGain);
      _tone(50, 'sine', 0.1,  0.20 * (tensionLevel / 5), 0.08, tensionGain);

      nodes.heartbeat._timeout = setTimeout(beat, interval);
    };

    nodes.heartbeat = { active: true };
    beat();
  };

  // ═══════════════════════════════════════════
  // TENSION MANAGEMENT
  // ═══════════════════════════════════════════
  const setTension = (level) => {
    tensionLevel = Math.max(0, Math.min(5, level));
    if (!ctx) return;

    const t = ctx.currentTime;
    const targetVol = tensionLevel * 0.12;
    tensionGain.gain.cancelScheduledValues(t);
    tensionGain.gain.linearRampToValueAtTime(targetVol, t + 1.5);

    if (tensionLevel >= 2) _startBreathing();
    if (tensionLevel >= 3) _startHeartbeat();

    // Slow down the buzz wobble for extra unease
    if (nodes.buzz && nodes.buzz.lfo) {
      nodes.buzz.lfo.frequency.value = 0.3 + tensionLevel * 0.3;
    }
  };

  // ═══════════════════════════════════════════
  // DISTORTED WHISPER
  // ═══════════════════════════════════════════
  const _whisper = () => {
    if (!ctx) return;
    try {
      // Layered formant tones imitating hushed vowel sounds
      const formants = [
        { freq: 270, bw: 80 },
        { freq: 2300, bw: 250 },
        { freq: 3000, bw: 300 },
      ];

      const dur = 0.6 + Math.random() * 0.8;
      const buf = _noiseBuffer(dur + 0.2, 'pink');
      if (!buf) return;

      formants.forEach(f => {
        const src = ctx.createBufferSource();
        src.buffer = buf;

        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = f.freq;
        bp.Q.value = f.freq / f.bw;

        const g = ctx.createGain();
        const now = ctx.currentTime;
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.06, now + dur * 0.3);
        g.gain.exponentialRampToValueAtTime(0.001, now + dur);

        src.connect(bp); bp.connect(g); g.connect(tensionGain);
        src.start();
        src.stop(now + dur + 0.1);
      });
    } catch(e) {}
  };

  // ═══════════════════════════════════════════
  // NAMED SOUND EFFECTS
  // ═══════════════════════════════════════════
  const sounds = {
    bell: () => {
      _tone(880, 'sine', 1.0, 0.4);
      _tone(1320, 'sine', 0.7, 0.2, 0.1);
      _tone(660,  'sine', 0.5, 0.15, 0.25);
    },

    flicker: () => {
      _static(0.07, 0.25);
      setTimeout(() => _static(0.05, 0.15), 85);
      setTimeout(() => _static(0.03, 0.1), 160);
    },

    creak: () => {
      const osc = ctx.createOscillator();
      const g   = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.6);
      g.gain.setValueAtTime(0.18, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.connect(g); g.connect(masterGain);
      osc.start(); osc.stop(ctx.currentTime + 0.6);
    },

    static: () => _static(0.5, 0.45),

    click: () => _tone(900, 'square', 0.04, 0.18),

    hire: () => {
      _tone(523, 'sine', 0.35, 0.3);
      _tone(659, 'sine', 0.30, 0.2, 0.12);
      _tone(784, 'sine', 0.25, 0.12, 0.24);
    },

    reject: () => {
      _tone(220, 'sawtooth', 0.25, 0.3);
      _tone(165, 'sawtooth', 0.30, 0.25, 0.12);
    },

    heartLoss: () => {
      _static(0.2, 0.7);
      _tone(55, 'sawtooth', 0.6, 0.55, 0.15);
      _tone(40, 'sine',     0.9, 0.3,  0.4);
    },

    thunder: () => {
      _static(0.9, 0.6);
      _tone(38, 'sawtooth', 1.2, 0.35, 0.1);
      _tone(30, 'sine',     1.5, 0.2,  0.3);
    },

    jumpscare: () => {
      _static(0.5, 1.0);
      _tone(80,  'sawtooth', 0.7, 0.9);
      _tone(120, 'square',   0.5, 0.6, 0.05);
      _tone(55,  'sawtooth', 0.9, 0.7, 0.1);
    },

    type: () => {
      _tone(500 + Math.random() * 300, 'square', 0.025, 0.12);
    },

    paperRustle: () => _static(0.14, 0.18),

    footstep: () => {
      _tone(65 + Math.random() * 35, 'sine', 0.12, 0.28);
      _static(0.05, 0.08);
    },

    whisper: () => _whisper(),

    // Distant door knock (tension event)
    knock: () => {
      _tone(90,  'sine', 0.08, 0.4);
      _tone(85,  'sine', 0.06, 0.3, 0.08);
      _static(0.04, 0.1);
      setTimeout(() => {
        _tone(90, 'sine', 0.08, 0.35);
        _tone(85, 'sine', 0.06, 0.25, 0.08);
      }, 400);
    },

    // TV static swell (anomaly detected)
    anomalyPresence: () => {
      _static(1.5, 0.15);
      _tone(60, 'sawtooth', 1.5, 0.08);
    },

    // Good ending — morning ambience
    morning: () => {
      _tone(523, 'sine', 2.0, 0.15);
      _tone(659, 'sine', 2.5, 0.1, 0.5);
      _tone(784, 'sine', 3.0, 0.08, 1.0);
    }
  };

  // ═══════════════════════════════════════════
  // PUBLIC API
  // ═══════════════════════════════════════════
  const play = (name) => {
    _resume();
    if (sounds[name]) sounds[name]();
  };

  const startAmbience = () => {
    _resume();
    _startRain();
    _startBuzz();
  };

  const stopAll = () => {
    Object.values(nodes).forEach(n => {
      if (!n) return;
      try { if (n.src) n.src.stop(); } catch(e) {}
      try { if (n.lfo) n.lfo.stop(); } catch(e) {}
      if (n._timeout) clearTimeout(n._timeout);
    });
    nodes = { rain: null, buzz: null, heartbeat: null, breathing: null, tension: null };
  };

  return { init, play, startAmbience, stopAll, setTension };

})();

window.AudioManager = AudioManager;