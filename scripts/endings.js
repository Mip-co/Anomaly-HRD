/* ============================================
   SCRIPTS/ENDINGS.JS — Ending Sequences
   Anomaly HRD
   ============================================ */

const EndingSystem = (() => {

  // ── Trigger an ending ──
  const trigger = async (type, stats) => {
    AudioManager.stopAll();

    const data = DIALOGUE_DATA.endings[type];
    if (!data) return;

    // Flash + glitch before transition
    Effects.glitchScreen(600);
    AudioManager.play(type === 'bad' ? 'jumpscare' : 'static');
    await Utils.sleep(800);

    await Utils.switchScreen('screen-game', 'screen-ending', 600);

    _renderEnding(type, data, stats);
  };

  // ── Render ending screen ──
  const _renderEnding = (type, data, stats) => {
    const container = Utils.el('ending-content');
    if (!container) return;
    container.innerHTML = '';

    // Title
    const title = document.createElement('div');
    title.className = `ending-title ${type}`;
    title.textContent = data.title;
    container.appendChild(title);

    // Description lines
    const desc = document.createElement('div');
    desc.className = 'ending-desc';
    container.appendChild(desc);

    // Stats
    if (stats) {
      const statsEl = document.createElement('div');
      statsEl.className = 'ending-stats';
      statsEl.innerHTML = `
        Pelamar diproses : ${stats.processed}<br>
        Diterima         : ${stats.hired}<br>
        Ditolak          : ${stats.rejected}<br>
        Anomali terdeteksi: ${stats.anomaliesFound}<br>
        Nyawa tersisa    : ${stats.hearts}
      `;
      container.appendChild(statsEl);
    }

    // Restart button
    const btn = document.createElement('button');
    btn.id = 'btn-restart';
    btn.textContent = '[ MULAI LAGI ]';
    btn.addEventListener('click', () => location.reload());
    container.appendChild(btn);

    // Typewrite the lines
    Utils.typeLines(desc, data.lines, 35, 600);
  };

  return { trigger };

})();

window.EndingSystem = EndingSystem;