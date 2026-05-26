/* ============================================
   SCRIPTS/ROOM.JS — Phase 4
   Image-based environment system.
   4 room states: clean → uneasy → corrupted → horror
   Manages background crossfade, overlays,
   door hotspot, and escape trigger.
   ============================================ */

const RoomSystem = (() => {

  // ── State definitions ──
  const STATES = ['clean', 'uneasy', 'corrupted', 'horror'];

  let currentState = 'clean';
  let escapeCallback = null;
  let escapeUnlocked = false;

  // ── Element references (lazy) ──
  const _el = (id) => document.getElementById(id);

  // ══════════════════════════════════════════
  // INIT
  // ══════════════════════════════════════════
  const init = (onEscapeClick) => {
    escapeCallback = onEscapeClick;
    _initDoorHotspot();
    // Start clean
    setState('clean', true);
  };

  // ══════════════════════════════════════════
  // SET STATE — crossfade backgrounds + overlays
  // ══════════════════════════════════════════
  const setState = (newState, instant = false) => {
    if (!STATES.includes(newState)) return;
    currentState = newState;

    STATES.forEach(s => {
      const el = _el(`bg-${s}`);
      if (!el) return;

      if (instant) {
        el.style.transition = 'none';
        el.classList.toggle('active', s === newState);
        // Force reflow then re-enable transition
        el.getBoundingClientRect();
        requestAnimationFrame(() => { el.style.transition = ''; });
      } else {
        el.classList.toggle('active', s === newState);
      }
    });

    // Update overlay classes
    const overlays = ['overlay-darkness', 'overlay-fog', 'overlay-corruption'];
    overlays.forEach(id => {
      const el = _el(id);
      if (!el) return;
      // Remove all state classes
      el.classList.remove('state-uneasy', 'state-corrupted', 'state-horror');
      if (newState !== 'clean') el.classList.add(`state-${newState}`);
    });
  };

  // ── Map tension level (0-5) to room state ──
  const setFromTension = (tension) => {
    if      (tension === 0) setState('clean');
    else if (tension <= 1)  setState('uneasy');
    else if (tension <= 3)  setState('corrupted');
    else                    setState('horror');
  };

  // ── Map hearts lost to state ──
  const setFromHeartsLost = (heartsLost) => {
    if      (heartsLost === 0) setState('clean');
    else if (heartsLost === 1) setState('uneasy');
    else if (heartsLost <= 3) setState('corrupted');
    else                       setState('horror');
  };

  // ══════════════════════════════════════════
  // DOOR HOTSPOT
  // ══════════════════════════════════════════
  const _initDoorHotspot = () => {
    const door = _el('door-hotspot');
    if (!door) return;

    door.addEventListener('click', () => {
      if (!escapeUnlocked) {
        // Door is "locked" — play rattle and shake
        AudioManager.play('doorRattle');
        _shakeDoor();
        return;
      }
      // Escape!
      if (escapeCallback) escapeCallback();
    });
  };

  const unlockEscape = () => {
    escapeUnlocked = true;
    const door = _el('door-hotspot');
    if (door) door.classList.add('escape-available');
  };

  const _shakeDoor = () => {
    const door = _el('door-hotspot');
    if (!door) return;
    door.style.transition = 'transform 0.08s ease';
    door.style.transform  = 'translateX(-3px)';
    setTimeout(() => { door.style.transform = 'translateX(3px)'; }, 80);
    setTimeout(() => { door.style.transform = 'translateX(-2px)'; }, 160);
    setTimeout(() => { door.style.transform = 'translateX(0)'; }, 240);
  };

  // ══════════════════════════════════════════
  // RAIN CANVAS (for rain-overlay over window)
  // ══════════════════════════════════════════
  let rainDrops = [];
  let animFrame;
  let rainCtx, rainCanvasEl;

  const initRain = () => {
    rainCanvasEl = _el('rain-canvas');
    if (!rainCanvasEl) return;
    rainCtx = rainCanvasEl.getContext('2d');

    const resize = () => {
      rainCanvasEl.width  = rainCanvasEl.offsetWidth  || 200;
      rainCanvasEl.height = rainCanvasEl.offsetHeight || 400;
      _buildDrops();
    };

    resize();
    window.addEventListener('resize', resize);
    _animateRain();
  };

  const _buildDrops = () => {
    rainDrops = [];
    const cols = Math.floor((rainCanvasEl.width || 200) / 5);
    for (let i = 0; i < cols; i++) {
      rainDrops.push(_newDrop());
    }
  };

  const _newDrop = () => ({
    x:     Math.random() * (rainCanvasEl ? rainCanvasEl.width : 200),
    y:     Math.random() * (rainCanvasEl ? rainCanvasEl.height : 400) * -1,
    speed: 3.5 + Math.random() * 4,
    len:   10 + Math.random() * 18,
    alpha: 0.08 + Math.random() * 0.22,
  });

  const _animateRain = () => {
    if (!rainCtx) return;
    rainCtx.clearRect(0, 0, rainCanvasEl.width, rainCanvasEl.height);
    rainCtx.strokeStyle = 'rgba(160, 190, 230, 1)';
    rainCtx.lineWidth   = 1;

    rainDrops.forEach(drop => {
      rainCtx.globalAlpha = drop.alpha;
      rainCtx.beginPath();
      rainCtx.moveTo(drop.x, drop.y);
      rainCtx.lineTo(drop.x - drop.len * 0.12, drop.y + drop.len);
      rainCtx.stroke();
      drop.y += drop.speed;
      if (drop.y > rainCanvasEl.height + drop.len) {
        Object.assign(drop, _newDrop());
        drop.y = -drop.len;
      }
    });

    rainCtx.globalAlpha = 1;
    animFrame = requestAnimationFrame(_animateRain);
  };

  // ══════════════════════════════════════════
  // LIGHTNING (overrides Effects.triggerLightning)
  // Uses full-screen flash on #lightning-flash
  // ══════════════════════════════════════════
  const triggerLightning = () => {
    const flash = _el('lightning-flash');
    if (!flash) return;
    AudioManager.play('thunder');
    flash.classList.add('active');
    setTimeout(() => {
      flash.classList.remove('active');
      setTimeout(() => {
        flash.classList.add('active');
        setTimeout(() => flash.classList.remove('active'), 70);
      }, 100);
    }, 90);
  };

  let lightningTimer;
  const scheduleLightning = (tension = 0) => {
    clearTimeout(lightningTimer);
    const base  = Math.max(5000, 18000 - tension * 2000);
    const delay = Utils.randomInt(base * 0.6, base);
    lightningTimer = setTimeout(() => {
      triggerLightning();
      scheduleLightning(tension);
    }, delay);
  };

  // ══════════════════════════════════════════
  // PUBLIC
  // ══════════════════════════════════════════
  return {
    init,
    setState,
    setFromTension,
    setFromHeartsLost,
    unlockEscape,
    initRain,
    scheduleLightning,
    triggerLightning,
    getState: () => currentState,
  };

})();

window.RoomSystem = RoomSystem;