/* ============================================
   SCRIPTS/EFFECTS.JS — Visual Effects (Phase 2)
   Rain, lightning, CRT, tension system,
   jumpscare, window fog, ambient horror
   Anomaly HRD
   ============================================ */

const Effects = (() => {

  // ── State ──
  let tensionLevel = 0; // 0–5, increases as hearts drop / anomalies appear
  let rainCanvas, rainCtx, rainDrops = [];
  let lightningTimeout, flickerInterval, tensionInterval;
  let fogCanvas, fogCtx, fogParticles = [];

  // ═══════════════════════════════════════════
  // RAIN CANVAS
  // ═══════════════════════════════════════════
  const initRain = () => {
    rainCanvas = document.getElementById('rain-canvas');
    if (!rainCanvas) return;
    rainCtx = rainCanvas.getContext('2d');

    const resize = () => {
      rainCanvas.width  = rainCanvas.offsetWidth  || 300;
      rainCanvas.height = rainCanvas.offsetHeight || 400;
      _buildRainDrops();
    };

    resize();
    window.addEventListener('resize', resize);
    _animateRain();
  };

  const _buildRainDrops = () => {
    rainDrops = [];
    const cols = Math.floor(rainCanvas.width / 5);
    for (let i = 0; i < cols; i++) {
      rainDrops.push(_newDrop());
    }
  };

  const _newDrop = () => ({
    x:     Math.random() * (rainCanvas ? rainCanvas.width : 300),
    y:     Math.random() * (rainCanvas ? rainCanvas.height : 400) * -1,
    speed: 3 + Math.random() * 4,
    len:   10 + Math.random() * 20,
    alpha: 0.08 + Math.random() * 0.25,
    width: Math.random() < 0.1 ? 2 : 1
  });

  const _animateRain = () => {
    if (!rainCtx) return;
    rainCtx.clearRect(0, 0, rainCanvas.width, rainCanvas.height);

    // Subtle window glow from city below
    const grd = rainCtx.createLinearGradient(0, rainCanvas.height * 0.6, 0, rainCanvas.height);
    grd.addColorStop(0, 'rgba(20,25,40,0)');
    grd.addColorStop(1, 'rgba(20,25,40,0.3)');
    rainCtx.fillStyle = grd;
    rainCtx.fillRect(0, 0, rainCanvas.width, rainCanvas.height);

    const tensionBoost = 1 + tensionLevel * 0.3;

    rainDrops.forEach(drop => {
      rainCtx.globalAlpha = drop.alpha;
      rainCtx.strokeStyle = `rgba(160, 190, 230, 1)`;
      rainCtx.lineWidth   = drop.width;
      rainCtx.beginPath();
      rainCtx.moveTo(drop.x, drop.y);
      rainCtx.lineTo(drop.x - drop.len * 0.12, drop.y + drop.len * tensionBoost);
      rainCtx.stroke();

      drop.y += drop.speed * tensionBoost;
      if (drop.y > rainCanvas.height + drop.len) {
        Object.assign(drop, _newDrop());
        drop.y = -drop.len;
      }
    });

    rainCtx.globalAlpha = 1;
    requestAnimationFrame(_animateRain);
  };

  // ═══════════════════════════════════════════
  // WINDOW FOG / CONDENSATION
  // ═══════════════════════════════════════════
  const initFog = () => {
    // Overlay canvas on the window for fog effect
    const winEl = document.getElementById('office-window');
    if (!winEl) return;

    fogCanvas = document.createElement('canvas');
    fogCanvas.style.cssText = `
      position: absolute; inset: 0; width: 100%; height: 100%;
      z-index: 8; pointer-events: none; opacity: 0.35;
    `;
    winEl.appendChild(fogCanvas);
    fogCtx = fogCanvas.getContext('2d');

    const resize = () => {
      fogCanvas.width  = winEl.offsetWidth  || 200;
      fogCanvas.height = winEl.offsetHeight || 400;
    };
    resize();
    window.addEventListener('resize', resize);
    _animateFog();
  };

  const _animateFog = () => {
    if (!fogCtx) return;
    const w = fogCanvas.width, h = fogCanvas.height;

    fogCtx.clearRect(0, 0, w, h);

    // Moving fog patches
    const t = Date.now() / 4000;
    for (let i = 0; i < 4; i++) {
      const x = w * (0.2 + 0.6 * ((Math.sin(t + i * 1.3) + 1) / 2));
      const y = h * (0.3 + 0.5 * ((Math.cos(t * 0.7 + i * 0.9) + 1) / 2));
      const r = 40 + 30 * Math.sin(t * 0.5 + i);
      const grd = fogCtx.createRadialGradient(x, y, 0, x, y, r);
      grd.addColorStop(0, 'rgba(180,200,220,0.12)');
      grd.addColorStop(1, 'rgba(180,200,220,0)');
      fogCtx.fillStyle = grd;
      fogCtx.fillRect(0, 0, w, h);
    }

    // Subtle condensation streaks
    fogCtx.strokeStyle = 'rgba(160,180,210,0.04)';
    fogCtx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const sx = (w * (i * 0.22 + 0.05 * Math.sin(t + i)));
      fogCtx.beginPath();
      fogCtx.moveTo(sx, 0);
      fogCtx.bezierCurveTo(
        sx + 4 * Math.sin(t + i), h * 0.3,
        sx - 3 * Math.cos(t + i), h * 0.7,
        sx + 2 * Math.sin(t * 0.5 + i), h
      );
      fogCtx.stroke();
    }

    requestAnimationFrame(_animateFog);
  };

  // ═══════════════════════════════════════════
  // LIGHTNING
  // ═══════════════════════════════════════════
  const scheduleLightning = () => {
    const baseDelay = Math.max(4000, 16000 - tensionLevel * 2000);
    const delay = Utils.randomInt(baseDelay * 0.5, baseDelay);
    lightningTimeout = setTimeout(() => {
      triggerLightning();
      scheduleLightning();
    }, delay);
  };

  const triggerLightning = () => {
    const flash = document.getElementById('lightning-flash');
    if (!flash) return;

    AudioManager.play('thunder');

    const strikes = tensionLevel >= 3 ? 3 : 2;
    let delay = 0;
    for (let i = 0; i < strikes; i++) {
      setTimeout(() => {
        flash.classList.add('active');
        setTimeout(() => flash.classList.remove('active'), 60 + Math.random() * 80);
      }, delay);
      delay += 100 + Math.random() * 150;
    }
  };

  // ═══════════════════════════════════════════
  // LIGHT FLICKER
  // ═══════════════════════════════════════════
  const triggerFlicker = (intensity = 1) => {
    const light = document.getElementById('ceiling-light');
    if (!light) return;

    AudioManager.play('flicker');

    const sequence = intensity >= 2
      ? [0, 80, 0, 60, 30, 0, 80, 0, 60]  // intense
      : [0, 80, 0, 80];                     // mild

    let t = 0;
    sequence.forEach((val, i) => {
      setTimeout(() => {
        light.style.opacity = val === 0 ? '0' : (val / 100).toString();
        if (i === sequence.length - 1) light.style.opacity = '1';
      }, t);
      t += 60 + Math.random() * 40;
    });
  };

  // Periodic ambient flicker based on tension
  const _startAmbientFlicker = () => {
    clearInterval(flickerInterval);
    const interval = Math.max(4000, 15000 - tensionLevel * 2500);
    flickerInterval = setInterval(() => {
      if (Math.random() < 0.4 + tensionLevel * 0.1) {
        triggerFlicker(tensionLevel >= 3 ? 2 : 1);
      }
    }, interval);
  };

  // ═══════════════════════════════════════════
  // TENSION SYSTEM
  // ═══════════════════════════════════════════
  const setTension = (level) => {
    tensionLevel = Math.max(0, Math.min(5, level));
    AudioManager.setTension(tensionLevel);
    _applyTensionVisuals();
    _startAmbientFlicker();
  };

  const raiseTension = (amount = 1) => setTension(tensionLevel + amount);

  const _applyTensionVisuals = () => {
    const game = document.getElementById('screen-game');
    if (!game) return;

    // Remove all tension classes
    game.classList.remove('tension-1','tension-2','tension-3','tension-4','tension-5');
    if (tensionLevel > 0) game.classList.add(`tension-${tensionLevel}`);

    // VHS noise intensity
    const vhs = document.getElementById('vhs-noise');
    if (vhs) vhs.style.opacity = (0.02 + tensionLevel * 0.025).toString();

    // Dim the ceiling light slightly
    const light = document.getElementById('ceiling-light');
    if (light) {
      const brightness = Math.max(0.4, 1 - tensionLevel * 0.12);
      light.style.filter = `brightness(${brightness})`;
    }
  };

  // Periodic tension ambient events
  const _startTensionEvents = () => {
    clearInterval(tensionInterval);
    tensionInterval = setInterval(() => {
      if (tensionLevel < 1) return;
      const roll = Math.random();
      if (roll < 0.15 * tensionLevel) {
        _ambientShadow();
      } else if (roll < 0.08 * tensionLevel) {
        Effects.glitchScreen(200);
      }
    }, 8000);
  };

  // Shadow flicker — something briefly in the window
  const _ambientShadow = () => {
    const win = document.getElementById('office-window');
    if (!win) return;
    const shadow = document.createElement('div');
    shadow.style.cssText = `
      position:absolute; inset:0; z-index:12; pointer-events:none;
      background: radial-gradient(ellipse 40% 60% at ${30 + Math.random()*40}% ${40 + Math.random()*30}%,
        rgba(0,0,0,0.7) 0%, transparent 100%);
      animation: shadow-appear 1.2s ease forwards;
    `;
    win.appendChild(shadow);
    AudioManager.play('creak');
    setTimeout(() => shadow.remove(), 1200);
  };

  // ═══════════════════════════════════════════
  // JUMPSCARE SYSTEM
  // ═══════════════════════════════════════════
  const triggerJumpscare = (type = 'standard') => {
    return new Promise(async (resolve) => {
      const overlay = document.getElementById('horror-overlay');
      const img     = document.getElementById('horror-image');
      const txt     = document.getElementById('horror-text');
      if (!overlay) { resolve(); return; }

      AudioManager.play('jumpscare');
      Utils.flashScreen('white', 80);

      await Utils.sleep(80);

      const jumpscares = {
        standard: { emoji: '👁️',  text: '' },
        face:     { emoji: '😱',  text: 'DIA TAHU' },
        shadow:   { emoji: '🌑',  text: 'ADA SESEORANG DI BELAKANG ANDA' },
        static:   { emoji: '📺',  text: '' },
      };

      const data = jumpscares[type] || jumpscares.standard;
      img.textContent = data.emoji;
      txt.textContent = data.text;
      txt.style.fontSize = type === 'face' ? '28px' : '36px';

      overlay.classList.remove('hidden');
      overlay.style.animation = 'none';
      overlay.offsetHeight; // reflow
      overlay.style.animation = '';

      // Chromatic aberration on body
      document.body.style.filter = 'hue-rotate(180deg) contrast(2)';
      setTimeout(() => {
        document.body.style.filter = 'hue-rotate(90deg) contrast(1.5)';
        setTimeout(() => {
          document.body.style.filter = '';
        }, 100);
      }, 100);

      await Utils.sleep(600 + tensionLevel * 80);

      overlay.classList.add('hidden');
      img.textContent = '';
      txt.textContent = '';
      resolve();
    });
  };

  // ═══════════════════════════════════════════
  // HORROR EVENT (heart loss)
  // ═══════════════════════════════════════════
  const triggerHorrorEvent = (event) => {
    return new Promise(async (resolve) => {
      const overlay = document.getElementById('horror-overlay');
      const img     = document.getElementById('horror-image');
      const txt     = document.getElementById('horror-text');
      if (!overlay) { resolve(); return; }

      // Build the scene based on tension level
      const isJumpscare = tensionLevel >= 3 && Math.random() < 0.4;

      if (isJumpscare) {
        await triggerJumpscare('face');
        resolve();
        return;
      }

      img.textContent = event.image || '👁️';
      txt.textContent = event.text  || '';

      AudioManager.play(event.sound || 'static');
      Utils.flashScreen('white', 150);
      Effects.shake(350);

      overlay.classList.remove('hidden');

      // Glitch lines
      for (let i = 0; i < 3; i++) {
        setTimeout(() => Effects.glitchScreen(100), i * 150);
      }

      await Utils.sleep(event.duration || 1500);

      overlay.classList.add('hidden');
      img.textContent = '';
      txt.textContent = '';
      resolve();
    });
  };

  // ═══════════════════════════════════════════
  // SCREEN FX
  // ═══════════════════════════════════════════
  const glitchScreen = (duration = 400) => {
    const game = document.getElementById('screen-game');
    if (!game) return;
    Utils.tempClass(game, 'glitch', duration);
    AudioManager.play('static');
  };

  const shake = (duration = 300, intensity = 1) => {
    const game = document.getElementById('screen-game');
    if (!game) return;
    game.style.setProperty('--shake-intensity', `${3 * intensity}px`);
    Utils.tempClass(game, 'tension-shake', duration);
  };

  // ── VHS tracking error (horizontal shift bands) ──
  const triggerVHSError = () => {
    const vhs = document.getElementById('vhs-noise');
    if (!vhs) return;
    const savedOp = vhs.style.opacity;
    vhs.style.opacity = '0.15';
    vhs.style.transform = `translateX(${Utils.randomInt(-4, 4)}px)`;
    setTimeout(() => {
      vhs.style.opacity   = savedOp;
      vhs.style.transform = '';
    }, 150);
  };

  // ── Clock update ──
  const updateClock = (timeString) => {
    ['clock-display', 'hud-shift-time', 'intro-time'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = timeString;
    });
  };

  // ── Scan line ──
  let scanLineEl = null;
  const startScanLine = () => {
    if (scanLineEl) return;
    const game = document.getElementById('screen-game');
    if (!game) return;
    scanLineEl = document.createElement('div');
    scanLineEl.className = 'static-line';
    game.appendChild(scanLineEl);
  };

  // ── Applicant enter ──
  const animateApplicantEnter = () => {
    AudioManager.play('footstep');
    setTimeout(() => AudioManager.play('footstep'), 280);
    setTimeout(() => AudioManager.play('footstep'), 520);
  };

  // ── Bad ending sequence ──
  const triggerBadEndingSequence = async () => {
    // Lights out
    triggerFlicker(3);
    await Utils.sleep(400);
    const light = document.getElementById('ceiling-light');
    if (light) light.style.opacity = '0';

    // Everything goes dark
    const game = document.getElementById('screen-game');
    if (game) {
      game.style.transition = 'filter 2s ease';
      game.style.filter = 'brightness(0.1) saturate(0)';
    }

    await Utils.sleep(1000);
    await triggerJumpscare('shadow');
    await Utils.sleep(500);
    await triggerJumpscare('face');
  };

  // ═══════════════════════════════════════════
  // INIT
  // ═══════════════════════════════════════════
  const init = () => {
    initRain();
    initFog();
    scheduleLightning();
    startScanLine();
    _startAmbientFlicker();
    _startTensionEvents();
  };

  return {
    init,
    triggerLightning,
    triggerFlicker,
    triggerHorrorEvent,
    triggerJumpscare,
    triggerVHSError,
    triggerBadEndingSequence,
    glitchScreen,
    shake,
    updateClock,
    animateApplicantEnter,
    setTension,
    raiseTension,
    getTension: () => tensionLevel,
  };

})();

window.Effects = Effects;