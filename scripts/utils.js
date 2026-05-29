/* ============================================
   SCRIPTS/UTILS.JS — Helper Functions
   Anomaly HRD
   ============================================ */

const Utils = {

  // ── DOM shortcuts ──
  el: (id) => document.getElementById(id),
  qs: (sel) => document.querySelector(sel),
  qsa: (sel) => document.querySelectorAll(sel),

  // ── Show / hide ──
  show: (id) => {
    const el = typeof id === 'string' ? Utils.el(id) : id;
    if (el) el.classList.remove('hidden');
  },
  hide: (id) => {
    const el = typeof id === 'string' ? Utils.el(id) : id;
    if (el) el.classList.add('hidden');
  },
  toggle: (id, force) => {
    const el = typeof id === 'string' ? Utils.el(id) : id;
    if (el) el.classList.toggle('hidden', force);
  },

  // ── Screen transitions ──
  switchScreen: (fromId, toId, delay = 600) => {
    return new Promise(resolve => {
      const from = Utils.el(fromId);
      const to   = Utils.el(toId);

      // game screen uses block, others use flex
      const displayType = (id) => id === 'screen-game' ? 'block' : 'flex';

      if (from) {
        from.classList.add('fade-out');
        setTimeout(() => {
          from.classList.remove('active', 'fade-out');
          from.style.display = 'none';
          if (to) {
            to.style.display = displayType(toId);
            requestAnimationFrame(() => {
              to.classList.add('active');
              resolve();
            });
          }
        }, delay);
      } else if (to) {
        to.style.display = displayType(toId);
        requestAnimationFrame(() => {
          to.classList.add('active');
          resolve();
        });
      }
    });
  },

  // ── Typewriter ──
  typewrite: (element, text, speed = 35, callback) => {
    element.textContent = '';
    let i = 0;
    let timerId = null;
    let cancelled = false;
    const cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';
    element.appendChild(cursor);

    const finish = () => {
      if (cancelled) return;
      cursor.remove();
      if (callback) callback();
    };

    const tick = () => {
      if (cancelled) return;
      if (i < text.length) {
        element.insertBefore(document.createTextNode(text[i]), cursor);
        i++;
        timerId = setTimeout(tick, speed + (Math.random() * 20 - 10));
      } else {
        finish();
      }
    };

    tick();

    return () => {
      if (cancelled) return;
      cancelled = true;
      if (timerId) clearTimeout(timerId);
      if (cursor.parentElement) cursor.remove();
    };
  },

  // ── Type lines sequentially ──
  typeLines: (element, lines, speed = 30, lineDelay = 400, callback) => {
    let lineIdx = 0;

    const nextLine = () => {
      if (lineIdx >= lines.length) {
        if (callback) callback();
        return;
      }
      const line = lines[lineIdx++];
      const p = document.createElement('p');
      element.appendChild(p);

      if (line === '' || line === '.') {
        setTimeout(nextLine, line === '.' ? 600 : 200);
        return;
      }

      Utils.typewrite(p, line, speed, () => {
        setTimeout(nextLine, lineDelay);
      });
    };

    nextLine();
  },

  // ── Random helpers ──
  random: (arr) => arr[Math.floor(Math.random() * arr.length)],
  randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
  chance: (probability) => Math.random() < probability,

  // ── Deep clone ──
  clone: (obj) => JSON.parse(JSON.stringify(obj)),

  // ── Delay / sleep ──
  sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // ── Format game time ──
  formatTime: (hour, minute) => {
    const h = String(hour).padStart(2, '0');
    const m = String(minute).padStart(2, '0');
    return `${h}:${m}`;
  },

  // ── Flash overlay ──
  flashScreen: (type = 'red', duration = 500) => {
    const el = document.createElement('div');
    el.className = `flash-overlay flash-${type}`;
    document.getElementById('screen-game').appendChild(el);
    setTimeout(() => el.remove(), duration);
  },

  // ── Add CSS class temporarily ──
  tempClass: (el, className, duration = 500) => {
    el.classList.add(className);
    setTimeout(() => el.classList.remove(className), duration);
  },

  // ── Log to laptop screen ──
  addLog: (text, type = 'sys') => {
    const content = Utils.el('laptop-content');
    if (!content) return;

    // Remove idle message if present
    const idle = content.querySelector('.system-idle');
    if (idle) idle.remove();

    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;
    entry.textContent = text;
    content.appendChild(entry);
    content.scrollTop = content.scrollHeight;
  },

  // ── Clock tick ──
  advanceTime: (state) => {
    state.minute += Utils.randomInt(3, 8);
    if (state.minute >= 60) {
      state.minute -= 60;
      state.hour += 1;
      if (state.hour >= 24) state.hour = 0;
    }
    return Utils.formatTime(state.hour, state.minute);
  }

};

// Make globally accessible
window.Utils = Utils;