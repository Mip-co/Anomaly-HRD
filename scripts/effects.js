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
      // Use independent rolls for shadow & glitch so both can occur
      const rollShadow = Math.random();
      const rollGlitch = Math.random();
      if (rollShadow < 0.12 * tensionLevel) {
        _ambientShadow();
      }
      if (rollGlitch < 0.08 * tensionLevel) {
        // small randomized glitch to avoid repetition
        Effects.glitchScreen(Utils.randomInt(150, 250));
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
      Utils.flashScreen('white', 120);
      await Utils.sleep(120);

      // Map type to asset
      const assetMap = {
        standard: ASSETS.jumpscares.face,
        face:     ASSETS.jumpscares.face,
        shadow:   ASSETS.jumpscares.shadow,
        static:   ASSETS.jumpscares.static,
        eye:      ASSETS.jumpscares.eye,
      };

      const textMap = {
        face:   'DIA TAHU',
        shadow: '',
        static: '',
        eye:    '',
      };

      // Set image
      img.innerHTML = '';
      const jsImg = document.createElement('img');
      jsImg.src       = assetMap[type] || ASSETS.jumpscares.face;
      jsImg.className = 'jumpscare-img';
      jsImg.draggable = false;
      img.appendChild(jsImg);

      txt.textContent = textMap[type] || '';

      overlay.classList.remove('hidden');

      document.body.style.filter = 'hue-rotate(160deg) contrast(2.4) saturate(1.15)';
      document.body.style.transform = 'scale(1.015)';
      setTimeout(() => {
        document.body.style.filter = 'hue-rotate(90deg) contrast(1.7) saturate(1)';
        document.body.style.transform = '';
        setTimeout(() => { document.body.style.filter = ''; }, 140);
      }, 140);

      await Utils.sleep(720 + tensionLevel * 90);

      overlay.classList.add('hidden');
      img.innerHTML   = '';
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

      img.innerHTML = '';
      const isImagePath = typeof event.image === 'string' && /\.(png|jpe?g|gif|svg)(\?.*)?$/i.test((event.image || '').trim());
      // If event.image is intentionally an empty string, leave image area blank
      if (event.image === '') {
        img.textContent = '';
      } else if (isImagePath) {
        const art = document.createElement('img');
        art.src = event.image;
        art.className = 'horror-image-img';
        art.draggable = false;
        img.appendChild(art);
      } else {
        img.textContent = event.image || '👁️';
      }
      txt.textContent = event.text || '';

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

  // ── Micro-horror: subtle, short effects for reading CVs / questions ──
  const triggerMicroHorror = (type = 'generic') => {
    // lightweight, non-blocking effects
    if (!document.body) return;
    const t = type || 'generic';
    // small chance guards should be handled by callers; still keep internal randomness
    const pick = Math.random();
    if (pick < 0.25) {
      triggerVHSError();
    } else if (pick < 0.6) {
      glitchScreen(Utils.randomInt(100, 180));
    } else {
      // gentle flicker + whisper/static if available
      if (Math.random() < 0.5) triggerFlicker(1);
      if (window.AudioManager) AudioManager.play(Math.random() < 0.5 ? 'whisper' : 'static');
    }
    // very brief flash for slight emphasis (not a jumpscare)
    if (Math.random() < 0.12) Utils.flashScreen('white', 60);
  };

  // ── Clock update ──
  const updateClock = (timeString) => {
    ['hud-shift-time', 'intro-time', 'clock-display'].forEach(id => {
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
    const game  = document.getElementById('screen-game');
    const light = document.getElementById('ceiling-light');
    const win   = document.getElementById('office-window');

    // Phase 1: erratic flicker
    triggerFlicker(3);
    AudioManager.play('creak');
    await Utils.sleep(500);

    // Phase 2: silhouettes fill the waiting room
    const waitRoom = document.getElementById('waiting-room');
    if (waitRoom) {
      for (let i = 0; i < 4; i++) {
        const shade = document.createElement('div');
        const xPct  = 15 + i * 18;
        shade.style.cssText = `
          position:absolute; bottom:0; left:${xPct}%;
          width:28px; height:80px;
          background: rgba(0,0,0,0.85);
          border-radius: 50% 50% 0 0;
          filter: blur(2px);
          opacity:0; transition: opacity ${0.4 + i * 0.2}s ease;
          z-index:5;
        `;
        shade.dataset.shade = '1';
        waitRoom.appendChild(shade);
        setTimeout(() => shade.style.opacity = '0.8', 100 + i * 300);

        // Head for each shade
        const head = document.createElement('div');
        head.style.cssText = `
          position:absolute; bottom:78px; left:${xPct + 1}%;
          width:22px; height:22px;
          background: rgba(0,0,0,0.85);
          border-radius:50%; filter:blur(1.5px);
          opacity:0; transition: opacity ${0.4 + i * 0.2}s ease;
          z-index:5;
        `;
        head.dataset.shade = '1';
        waitRoom.appendChild(head);
        setTimeout(() => head.style.opacity = '0.8', 100 + i * 300);
      }
    }

    await Utils.sleep(1400);
    AudioManager.play('knock');
    await Utils.sleep(300);
    AudioManager.play('knock');

    // Phase 3: door creaks open (office-shelf simulated)
    const shelf = document.getElementById('office-shelf');
    if (shelf) {
      shelf.style.transition = 'filter 1.5s ease, transform 1.5s ease';
      shelf.style.filter = 'brightness(0.05)';
      shelf.style.transform = 'translateX(8px)';
    }

    // Phase 4: window — something presses against glass
    if (win) {
      const press = document.createElement('div');
      press.style.cssText = `
        position:absolute; inset:0; z-index:20; pointer-events:none;
        background: radial-gradient(ellipse 35% 45% at 50% 45%,
          rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 60%, transparent 100%);
        opacity:0; transition: opacity 1s ease;
      `;
      win.appendChild(press);
      setTimeout(() => press.style.opacity = '1', 100);
    }

    // Phase 5: everything goes dark
    if (game) {
      game.style.transition = 'filter 2.5s ease';
      game.style.filter = 'brightness(0.06) saturate(0)';
    }
    if (light) {
      light.style.transition = 'opacity 1s ease';
      light.style.opacity = '0';
    }

    await Utils.sleep(2000);
    AudioManager.play('heartLoss');
    shake(500, 2);
    await Utils.sleep(600);

    // Phase 6: jumpscares
    await triggerJumpscare('shadow');
    await Utils.sleep(350);
    await triggerJumpscare('face');
    await Utils.sleep(200);
    await triggerJumpscare('static');
  };

  // ── Final office event (before last applicant) ──
  const triggerFinalOfficeEvent = async () => {
    const game  = document.getElementById('screen-game');
    const light = document.getElementById('ceiling-light');
    const win   = document.getElementById('office-window');

    // Clock stops — rewind
    const clockEl = document.getElementById('clock-display');
    if (clockEl) {
      const orig = clockEl.textContent;
      clockEl.style.color = '#cc2222';
      clockEl.textContent = '00:00';
      setTimeout(() => {
        clockEl.textContent = orig;
        clockEl.style.color = '';
      }, 2500);
    }

    // Fluorescent light goes to panic flicker
    triggerFlicker(3);
    await Utils.sleep(300);
    triggerFlicker(3);
    await Utils.sleep(400);

    // Everything briefly inverts
    if (game) {
      game.style.transition = 'filter 0.1s';
      game.style.filter = 'invert(0.08) hue-rotate(180deg)';
      await Utils.sleep(150);
      game.style.filter = '';
      await Utils.sleep(100);
      game.style.filter = 'invert(0.04) hue-rotate(90deg)';
      await Utils.sleep(100);
      game.style.filter = '';
    }

    // Something at the window — full silhouette, then gone
    if (win) {
      const ghost = document.createElement('div');
      ghost.style.cssText = `
        position:absolute; bottom:15%; left:50%;
        transform:translateX(-50%);
        width:34px; height:75px;
        background: rgba(0,0,0,0.95);
        border-radius:50% 50% 0 0; filter:blur(1px);
        z-index:20; opacity:0;
        transition: opacity 0.2s ease;
        pointer-events:none;
      `;
      const ghostHead = document.createElement('div');
      ghostHead.style.cssText = `
        position:absolute; top:-26px; left:50%;
        transform:translateX(-50%);
        width:26px; height:26px;
        background:rgba(0,0,0,0.95);
        border-radius:50%; filter:blur(1px);
      `;
      ghost.appendChild(ghostHead);
      win.appendChild(ghost);

      AudioManager.play('creak');
      ghost.style.opacity = '1';
      await Utils.sleep(800);
      ghost.style.transition = 'opacity 0.05s';
      ghost.style.opacity = '0';
      await Utils.sleep(100);
      ghost.style.opacity = '1';
      await Utils.sleep(60);
      ghost.style.opacity = '0';
      ghost.remove();
    }

    // VHS burst
    triggerVHSError();
    await Utils.sleep(100);
    triggerVHSError();

    AudioManager.play('whisper');
    await Utils.sleep(600);

    // Laptop screen shows scrambled message briefly
    const laptopContent = document.getElementById('laptop-content');
    if (laptopContent) {
      const glitchMsg = document.createElement('div');
      glitchMsg.className = 'log-entry log-warn';
      glitchMsg.style.cssText = 'animation: text-glitch 0.3s steps(2) 3; letter-spacing:2px;';
      glitchMsg.textContent = '█▓▒░ D4TA C0RRUPT ░▒▓█ P3LAM4R T3R4KH1R...';
      laptopContent.appendChild(glitchMsg);
      laptopContent.scrollTop = laptopContent.scrollHeight;
      setTimeout(() => {
        glitchMsg.textContent = 'Pelamar terakhir akan segera masuk.';
        glitchMsg.className = 'log-entry log-sys';
        glitchMsg.style.cssText = '';
      }, 2000);
    }

    // Return to normal — but tension stays high
    setTension(4);
    await Utils.sleep(800);
  };

  // ── Good ending sequence (morning light) ──
  const triggerGoodEndingSequence = async () => {
    const game  = document.getElementById('screen-game');
    const light = document.getElementById('ceiling-light');
    const win   = document.getElementById('office-window');

    // Rain slows (visually — rain canvas handles internally)
    rainDrops.forEach(d => { d.speed *= 0.4; d.alpha *= 0.5; });

    // Warm light creeps in from window
    if (win) {
      const dawn = document.createElement('div');
      dawn.style.cssText = `
        position:absolute; inset:0; z-index:15; pointer-events:none;
        background: linear-gradient(180deg,
          rgba(255,200,100,0) 0%,
          rgba(255,180,60,0.18) 100%);
        opacity:0; transition: opacity 4s ease;
      `;
      win.appendChild(dawn);
      setTimeout(() => dawn.style.opacity = '1', 200);
    }

    // Fluorescent light warms up
    if (light) {
      light.style.transition = 'filter 3s ease, box-shadow 3s ease';
      light.style.filter = 'brightness(1.3) sepia(0.2)';
      light.style.boxShadow = `
        0 0 30px 15px rgba(255,220,140,0.18),
        0 0 80px 40px rgba(255,200,100,0.08)
      `;
    }

    // Very subtle screen warmth
    if (game) {
      game.style.transition = 'filter 4s ease';
      game.style.filter = 'sepia(0.08) brightness(1.04)';
    }

    // Clock moves to 06:00
    const clockEl = document.getElementById('clock-display');
    if (clockEl) {
      await Utils.sleep(1500);
      clockEl.style.transition = 'color 2s ease';
      clockEl.style.color = '#c8860a';
      clockEl.textContent = '06:00';
    }

    await Utils.sleep(2000);
  };

  // ═══════════════════════════════════════════
  // INIT — delegate rain/lightning to RoomSystem
  // ═══════════════════════════════════════════
  const init = () => {
    // Rain and lightning now handled by RoomSystem
    // (keeping fog canvas and tension events)
    initFog();
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
    triggerMicroHorror,
    triggerBadEndingSequence,
    triggerFinalOfficeEvent,
    triggerGoodEndingSequence,
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