/* ============================================
   SCRIPTS/ENDINGS.JS — Phase 4
   4 endings + 2 escape sub-outcomes.
   Full cinematic sequences per type.
   ============================================ */

const EndingSystem = (() => {

  const trigger = async (type, stats) => {
    AudioManager.stopAll();

    // Route to correct sequence
    switch (type) {
      case 'bad':    await _badEnding(stats);    break;
      case 'good':   await _goodEnding(stats);   break;
      case 'secret': await _secretEnding(stats); break;
      case 'escape': await _escapeEnding(stats); break;
      default:       await _goodEnding(stats);
    }
  };

  // ══════════════════════════════════════════
  // BAD ENDING
  // ══════════════════════════════════════════
  const _badEnding = async (stats) => {
    // triggerBadEndingSequence already called by game.js
    await Utils.sleep(400);
    await Utils.switchScreen('screen-game', 'screen-ending', 800);
    _buildEndingScreen('bad', DIALOGUE_DATA.endings.bad, stats, {
      bgColor:   '#000',
      titleGlow: 'rgba(204,34,34,0.6)',
      showStats: true,
    });
  };

  // ══════════════════════════════════════════
  // GOOD ENDING
  // ══════════════════════════════════════════
  const _goodEnding = async (stats) => {
    // triggerGoodEndingSequence already called by game.js
    await Utils.sleep(600);

    // Soft transition — no glitch
    const game = document.getElementById('screen-game');
    if (game) {
      game.style.transition = 'opacity 2s ease';
      game.style.opacity = '0';
    }
    await Utils.sleep(2000);

    // Switch and fade in
    const ending = document.getElementById('screen-ending');
    if (ending) {
      ending.style.background = 'linear-gradient(180deg, #0a0a08 0%, #080806 100%)';
      ending.style.display = 'flex';
      ending.style.opacity = '0';
      requestAnimationFrame(() => {
        ending.style.transition = 'opacity 2.5s ease';
        ending.style.opacity = '1';
        ending.classList.add('active');
      });
    }
    if (game) game.classList.remove('active');

    await Utils.sleep(1000);
    _buildEndingScreen('good', DIALOGUE_DATA.endings.good, stats, {
      bgColor:   'transparent',
      titleGlow: 'rgba(200,134,10,0.4)',
      showStats: true,
    });
  };

  // ══════════════════════════════════════════
  // ESCAPE ENDING — interactive phone choice
  // ══════════════════════════════════════════
  const _escapeEnding = async (stats) => {
    Effects.glitchScreen(300);
    AudioManager.play('static');
    await Utils.sleep(500);

    await Utils.switchScreen('screen-game', 'screen-ending', 700);

    const container = Utils.el('ending-content');
    if (!container) return;
    container.innerHTML = '';
    document.getElementById('screen-ending').style.background = '#050505';

    // Walk sequence
    const walkDesc = document.createElement('div');
    walkDesc.className = 'ending-desc';
    container.appendChild(walkDesc);

    await _typewriteLines(walkDesc, DIALOGUE_DATA.endings.escape.lines, 40, 700);
    await Utils.sleep(500);

    // Phone sound
    AudioManager.play('phoneRing');
    await Utils.sleep(400);
    AudioManager.play('phoneRing');
    await Utils.sleep(600);

    // Phone choice prompt
    const choiceBox = document.createElement('div');
    choiceBox.className = 'escape-choice-box';
    choiceBox.innerHTML = `<p class="escape-choice-label">Telepon berdering.</p>`;
    container.appendChild(choiceBox);

    await Utils.sleep(400);

    // Two buttons
    const btnRow = document.createElement('div');
    btnRow.className = 'escape-btn-row';

    const btnAnswer = document.createElement('button');
    btnAnswer.className = 'escape-btn escape-btn-answer';
    btnAnswer.textContent = '[ ANGKAT ]';

    const btnIgnore = document.createElement('button');
    btnIgnore.className = 'escape-btn escape-btn-ignore';
    btnIgnore.textContent = '[ ABAIKAN ]';

    btnRow.appendChild(btnAnswer);
    btnRow.appendChild(btnIgnore);
    choiceBox.appendChild(btnRow);

    // Fade in choice
    choiceBox.style.opacity = '0';
    choiceBox.style.transition = 'opacity 0.8s ease';
    setTimeout(() => choiceBox.style.opacity = '1', 100);

    // Handle choices
    btnAnswer.addEventListener('click', async () => {
      choiceBox.remove();
      AudioManager.play('click');
      await Utils.sleep(300);
      _buildEndingScreen('escape_answer', DIALOGUE_DATA.endings.escape_answer, stats, {
        bgColor:   'transparent',
        titleGlow: 'rgba(100,100,180,0.5)',
        showStats: false,
      });
    }, { once: true });

    btnIgnore.addEventListener('click', async () => {
      choiceBox.remove();
      AudioManager.play('footstep');
      await Utils.sleep(200);
      AudioManager.play('footstep');
      await Utils.sleep(300);
      _buildEndingScreen('escape_ignore', DIALOGUE_DATA.endings.escape_ignore, stats, {
        bgColor:   'transparent',
        titleGlow: 'rgba(80,80,80,0.4)',
        showStats: false,
      });
    }, { once: true });
  };

  // ══════════════════════════════════════════
  // SECRET ENDING — perfect run
  // ══════════════════════════════════════════
  const _secretEnding = async (stats) => {
    // Start with deceptive "good ending" feeling
    AudioManager.play('morning');
    await Utils.sleep(1500);

    // Then something is wrong — screen flicker
    Effects.triggerFlicker(2);
    AudioManager.play('static');
    await Utils.sleep(400);
    Effects.glitchScreen(300);
    await Utils.sleep(300);

    await Utils.switchScreen('screen-game', 'screen-ending', 600);

    const ending = document.getElementById('screen-ending');
    if (ending) ending.style.background = '#010101';

    // Email popup effect — laptop style
    const container = Utils.el('ending-content');
    if (!container) return;
    container.innerHTML = '';

    const emailWrap = document.createElement('div');
    emailWrap.className = 'secret-email-wrap';
    emailWrap.innerHTML = `
      <div class="secret-email-header">
        <span>DARI: pak.direktur@nusantarajaya.co.id</span>
        <span>SUBJEK: Penilaian Shift Malam — RAHASIA</span>
      </div>
      <div class="secret-email-body" id="secret-email-body"></div>
    `;
    container.appendChild(emailWrap);

    await Utils.sleep(600);

    const body = document.getElementById('secret-email-body');
    await _typewriteLines(body, DIALOGUE_DATA.endings.secret.lines, 42, 750);

    await Utils.sleep(1200);

    // Stats in different style — classification report
    if (stats) {
      const report = document.createElement('div');
      report.className = 'ending-stats secret-report';
      report.style.opacity = '0';
      report.innerHTML = `<pre>
── LAPORAN KLASIFIKASI ──────────
  STATUS        : NON-HUMAN
  ENTITAS NO.   : 007
  SHIFT         : 1 / ∞
  AKURASI       : 100%
  REKOMENDASI   : PERTAHANKAN
─────────────────────────────────</pre>`;
      container.appendChild(report);
      setTimeout(() => {
        report.style.transition = 'opacity 2s ease';
        report.style.opacity = '1';
      }, 800);
    }

    // Restart button
    await Utils.sleep(2500);
    const btn = document.createElement('button');
    btn.id = 'btn-restart';
    btn.textContent = '[ LANJUTKAN SHIFT ]';
    btn.style.cssText = 'opacity:0; transition: opacity 1s ease;';
    btn.addEventListener('click', () => location.reload());
    container.appendChild(btn);
    setTimeout(() => btn.style.opacity = '1', 400);
  };

  // ══════════════════════════════════════════
  // SHARED BUILDER
  // ══════════════════════════════════════════
  const _buildEndingScreen = (type, data, stats, opts = {}) => {
    const container = Utils.el('ending-content');
    if (!container || !data) return;

    // Don't clear if we already have walk text (escape)
    const isEscapeSub = type === 'escape_answer' || type === 'escape_ignore';
    if (!isEscapeSub) container.innerHTML = '';

    const endingScreen = document.getElementById('screen-ending');
    if (endingScreen && opts.bgColor && opts.bgColor !== 'transparent') {
      endingScreen.style.background = opts.bgColor;
    }

    // Title
    const title = document.createElement('div');
    title.className = `ending-title ${type.split('_')[0]}`;
    title.textContent = data.title;
    if (opts.titleGlow) {
      title.style.textShadow = `0 0 30px ${opts.titleGlow}`;
    }
    container.appendChild(title);

    // Description
    const desc = document.createElement('div');
    desc.className = 'ending-desc';
    container.appendChild(desc);

    // Stats
    if (opts.showStats && stats) {
      const statsEl = _buildStats(stats);
      container.appendChild(statsEl);

      const lineCount = data.lines.filter(l => l !== '').length;
      setTimeout(() => {
        statsEl.style.transition = 'opacity 1.5s ease';
        statsEl.style.opacity = '1';
      }, lineCount * 740 + 1200);
    }

    // Restart button
    const totalDelay = data.lines.length * 720 + (opts.showStats ? 3000 : 1800);
    const btn = document.createElement('button');
    btn.id = 'btn-restart';
    btn.textContent = '[ SHIFT BARU ]';
    btn.style.cssText = 'opacity:0; transition: opacity 1s ease;';
    btn.addEventListener('click', () => location.reload());
    container.appendChild(btn);
    setTimeout(() => btn.style.opacity = '1', totalDelay);

    // Typewrite
    Utils.typeLines(desc, data.lines, 40, 720);
  };

  const _buildStats = (stats) => {
    const el = document.createElement('div');
    el.className = 'ending-stats';
    el.style.opacity = '0';

    const accuracy = stats.processed > 0
      ? Math.round(((stats.processed - (stats.anomaliesHired || 0)) / stats.processed) * 100)
      : 100;
    const grade = accuracy >= 100 ? 'S+' : accuracy >= 90 ? 'S' : accuracy >= 75 ? 'A'
      : accuracy >= 60 ? 'B' : accuracy >= 40 ? 'C' : 'D';

    el.innerHTML = `<pre>──────────────────────────────
  LAPORAN SHIFT MALAM
──────────────────────────────
  Pelamar diproses  : ${String(stats.processed).padStart(3)}
  Diterima          : ${String(stats.hired).padStart(3)}
  Ditolak           : ${String(stats.rejected).padStart(3)}
  Anomali tertolak  : ${String(stats.anomaliesFound || 0).padStart(3)}
  Anomali lolos     : ${String(stats.anomaliesHired || 0).padStart(3)}
  Nyawa tersisa     : ${String(stats.hearts).padStart(3)} / 5
──────────────────────────────
  AKURASI           : ${accuracy}%
  PENILAIAN         : ${grade}
──────────────────────────────</pre>`;
    return el;
  };

  // Helper: promise-based typeLines
  const _typewriteLines = (el, lines, speed, lineDelay) => {
    return new Promise(resolve => {
      Utils.typeLines(el, lines, speed, lineDelay, resolve);
    });
  };

  return { trigger };

})();

window.EndingSystem = EndingSystem;