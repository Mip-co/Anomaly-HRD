/* ============================================
   SCRIPTS/POLISH.JS — Phase 5
   Fullscreen, preloader, cinematic transitions,
   CV slide animation, performance optimizations
   ============================================ */

const Polish = (() => {

  // ══════════════════════════════════════════
  // PRELOADER
  // ══════════════════════════════════════════
  const preload = () => {
    return new Promise((resolve) => {
      const bar     = document.getElementById('loading-bar');
      const text    = document.getElementById('loading-text');
      const overlay = document.getElementById('loading-overlay');

      const steps = [
        'Memuat sistem...',
        'Menginisialisasi HRD v2.1...',
        'Memeriksa daftar pelamar...',
        'Mempersiapkan shift malam...',
        'Siap.',
      ];

      // Animate loading bar through steps
      let stepIdx = 0;
      const stepInterval = setInterval(() => {
        if (stepIdx < steps.length) {
          const pct = Math.round(((stepIdx + 1) / steps.length) * 100);
          if (bar)  bar.style.width = pct + '%';
          if (text) text.textContent = steps[stepIdx];
          stepIdx++;
        } else {
          clearInterval(stepInterval);
          // Done — hide loader
          _hideLoader(overlay, resolve);
        }
      }, 300);

      // Hard fallback — never stuck longer than 2s
      setTimeout(() => {
        clearInterval(stepInterval);
        _hideLoader(overlay, resolve);
      }, 2000);
    });
  };

  const _hideLoader = (overlay, cb) => {
    if (!overlay || overlay.classList.contains('done')) return;
    overlay.classList.add('done');
    overlay.style.transition = 'opacity 0.8s ease';
    overlay.style.opacity    = '0';
    setTimeout(() => {
      overlay.style.display = 'none';
      if (cb) cb();
    }, 850);
  };

  // ══════════════════════════════════════════
  // FULLSCREEN
  // ══════════════════════════════════════════
  const initFullscreen = () => {
    const btn = document.getElementById('btn-fullscreen');
    if (btn) {
      btn.addEventListener('click', toggleFullscreen);
    }

    // F key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'f' || e.key === 'F') {
        // Only if not typing in an input
        if (document.activeElement.tagName !== 'INPUT') {
          toggleFullscreen();
        }
      }
    });

    // Update button icon on change
    document.addEventListener('fullscreenchange', _updateFSButton);
    document.addEventListener('webkitfullscreenchange', _updateFSButton);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      const el = document.documentElement;
      if (el.requestFullscreen) el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
  };

  const _updateFSButton = () => {
    const btn = document.getElementById('btn-fullscreen');
    if (!btn) return;
    const isFS = !!(document.fullscreenElement || document.webkitFullscreenElement);
    btn.textContent = isFS ? '⛶' : '⛶';
    btn.title = isFS ? 'Exit Fullscreen [F]' : 'Fullscreen [F]';
  };

  // ══════════════════════════════════════════
  // CV SLIDE-IN ANIMATION
  // ══════════════════════════════════════════
  const animateCVIn = () => {
    AudioManager.play('paperSlide');
  };

  const _openCV = () => {
    const cv = Utils.el('cv-panel');
    if (!cv) return;
    cv.classList.remove('hidden');
  };

  const _closeCV = () => {
    const cv = Utils.el('cv-panel');
    if (!cv) return;
    cv.classList.add('hidden');
  };

  window.CVController = {
    open: _openCV,
    close: _closeCV,
  };

  const animateCVOut = () => {
    _closeCV();
  };

  // ══════════════════════════════════════════
  // APPLICANT ENTER / EXIT TRANSITIONS
  // ══════════════════════════════════════════
  const animateApplicantIn = () => {
    const fig = document.getElementById('applicant-figure');
    if (!fig) return;
    fig.style.transition = 'none';
    fig.style.opacity    = '0';
    fig.style.transform  = 'translateY(24px) scale(0.94)';

    requestAnimationFrame(() => {
      fig.style.transition = 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.22,1,0.36,1)';
      fig.style.opacity    = '1';
      fig.style.transform  = 'translateY(0) scale(1)';
    });
  };

  // ══════════════════════════════════════════
  // SCREEN TRANSITION — cinematic with flash
  // ══════════════════════════════════════════
  const cinematicTransition = async (fromId, toId, style = 'fade') => {
    const from = document.getElementById(fromId);
    const to   = document.getElementById(toId);
    if (!from || !to) return Utils.switchScreen(fromId, toId);

    if (style === 'flash') {
      // Brief white flash between screens
      const flash = document.createElement('div');
      flash.style.cssText = `
        position:fixed; inset:0; background:#fff; z-index:9998;
        opacity:0; pointer-events:none; transition: opacity 0.12s ease;
      `;
      document.body.appendChild(flash);
      requestAnimationFrame(() => flash.style.opacity = '0.7');
      await Utils.sleep(150);

      from.classList.remove('active');
      from.style.display = 'none';
      to.style.display   = 'flex';
      requestAnimationFrame(() => to.classList.add('active'));

      flash.style.opacity = '0';
      setTimeout(() => flash.remove(), 300);
    } else {
      await Utils.switchScreen(fromId, toId);
    }
  };

  // ══════════════════════════════════════════
  // PERFORMANCE: debounced resize
  // ══════════════════════════════════════════
  const debounce = (fn, ms) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  };

  // ══════════════════════════════════════════
  // HUD CLOCK PULSE — when time advances
  // ══════════════════════════════════════════
  const pulseClockUpdate = (timeStr) => {
    const clock = document.getElementById('hud-shift-time');
    if (!clock) return;
    clock.textContent = timeStr;
    clock.style.transition = 'none';
    clock.style.color = 'var(--col-white-dim)';
    requestAnimationFrame(() => {
      clock.style.transition = 'color 1.5s ease';
      clock.style.color      = 'var(--col-amber)';
    });
  };

  // ══════════════════════════════════════════
  // HEART LOSS ANIMATION
  // ══════════════════════════════════════════
  const animateHeartLoss = (heartIndex) => {
    const hearts = document.querySelectorAll('.heart');
    const target = hearts[heartIndex];
    if (!target) return;

    target.style.transition = 'none';
    target.style.transform  = 'scale(1.5)';
    target.style.color      = '#ff0000';
    target.style.filter     = 'drop-shadow(0 0 8px red)';

    setTimeout(() => {
      target.style.transition = 'all 0.4s ease';
      target.style.transform  = 'scale(1)';
      target.style.color      = '';
      target.style.filter     = 'grayscale(1) opacity(0.25)';
      target.classList.add('lost');
    }, 180);
  };

  // ══════════════════════════════════════════
  // TITLE SCREEN ENHANCEMENTS
  // ══════════════════════════════════════════
  const enhanceTitleScreen = () => {
    // Stagger-in the title text elements
    const logo    = document.querySelector('.title-logo');
    const info    = document.querySelector('.title-info');
    const content = document.querySelector('.title-content');

    if (logo)    logo.style.cssText    = 'opacity:0; transform:translateY(20px); transition: all 0.8s ease 0.2s';
    if (info)    info.style.cssText    = 'opacity:0; transform:translateY(12px); transition: all 0.8s ease 0.6s';
    if (content) content.style.opacity = '1';

    requestAnimationFrame(() => {
      setTimeout(() => {
        if (logo) { logo.style.opacity = '1'; logo.style.transform = 'translateY(0)'; }
        if (info) { info.style.opacity = '1'; info.style.transform = 'translateY(0)'; }
      }, 100);
    });
  };

  // ══════════════════════════════════════════
  // PUBLIC
  // ══════════════════════════════════════════
  return {
    preload,
    initFullscreen,
    animateCVIn,
    animateCVOut,
    animateApplicantIn,
    cinematicTransition,
    pulseClockUpdate,
    animateHeartLoss,
    enhanceTitleScreen,
    debounce,
  };

})();

window.Polish = Polish;