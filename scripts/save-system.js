/* ============================================
   SCRIPTS/SAVE-SYSTEM.JS
   Minimal localStorage-based progression system.
   Exposes: saveGame, loadGame, deleteSave, unlockEnding,
   hasAnyEndingUnlocked, getSave, setHasSeenIntro, renderEndingsArchive
   ============================================ */

(function(){
  const KEY = 'anomaly_hrd_save_v1';

  const _default = () => ({
    hasSeenIntro: false,
    endingsUnlocked: {},
    currentSave: { shift: 0, hearts: 5, applicantIndex: 0, applicantQueue: null, difficulty: 'normal' }
  });

  const _read = () => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return _default();
      return JSON.parse(raw);
    } catch (e) {
      console.warn('SaveSystem: failed to read save', e);
      return _default();
    }
  };

  const _write = (obj) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(obj));
    } catch (e) {
      console.warn('SaveSystem: failed to write save', e);
    }
  };

  const saveGame = (payload = {}) => {
    const s = _read();
    s.currentSave = Object.assign({}, s.currentSave, payload);
    _write(s);
    return s;
  };

  const loadGame = () => {
    return _read();
  };

  const deleteSave = () => {
    localStorage.removeItem(KEY);
  };

  const unlockEnding = (id) => {
    if (!id) return;
    const s = _read();
    s.endingsUnlocked = s.endingsUnlocked || {};
    s.endingsUnlocked[id] = true;
    // unlocking an ending also marks that player has seen intro at least once
    s.hasSeenIntro = true;
    _write(s);
    return s;
  };

  const hasAnyEndingUnlocked = () => {
    const s = _read();
    const e = s.endingsUnlocked || {};
    return Object.values(e).some(v => v === true);
  };

  const getSave = () => _read();

  const setHasSeenIntro = (val = true) => {
    const s = _read(); s.hasSeenIntro = !!val; _write(s); return s;
  };

  const renderEndingsArchive = () => {
    const container = document.getElementById('ending-content');
    if (!container) return;
    const s = _read();
    const unlocked = s.endingsUnlocked || {};
    container.innerHTML = '';

    const title = document.createElement('div');
    title.className = 'ending-archive-title';
    title.textContent = 'ENDINGS ARCHIVE';
    container.appendChild(title);

    const list = document.createElement('div');
    list.className = 'ending-archive-list';
    container.appendChild(list);

    // Example known endings — keep in sync with EndingSystem types
    const known = [
      { id: 'good', label: 'SHIFT SELESAI' },
      { id: 'bad', label: 'SHIFT BERAKHIR' },
      { id: 'secret', label: 'ENTITAS NOMOR 7' },
      { id: 'ENDING_VTUBER', label: 'VTUBER ENDING' },
      { id: 'escape', label: 'ESCAPE' }
    ];

    known.forEach(k => {
      const el = document.createElement('div');
      el.className = 'ending-archive-item';
      if (unlocked[k.id]) {
        el.textContent = `[ ${k.label} ]`;
        el.classList.add('unlocked');
      } else {
        el.textContent = '[ ???? ]';
        el.classList.add('locked');
      }
      list.appendChild(el);
    });

    const back = document.createElement('button');
    back.className = 'btn-back';
    back.textContent = '[ KEMBALI ]';
    back.addEventListener('click', () => {
      // return to title
      Utils.switchScreen('screen-ending', 'screen-title');
    });
    container.appendChild(back);
  };

  window.SaveSystem = {
    saveGame,
    loadGame,
    deleteSave,
    unlockEnding,
    hasAnyEndingUnlocked,
    getSave,
    setHasSeenIntro,
    renderEndingsArchive
  };

})();
