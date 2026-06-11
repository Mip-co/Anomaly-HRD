/* ============================================
   SCRIPTS/DIALOGUE.JS — Phase 3
   Voice styling per anomaly type,
   working skip, typewriter speed variation
   ============================================ */

const DialogueSystem = (() => {

  let onDialogueComplete = null;
  let isTyping           = false;
  let currentTypeTimer   = null;
  let fullText           = '';
  let currentEl          = null;

  // ── Anomaly type → voice style + speed ──
  const _getVoiceStyle = (applicant) => {
    if (!applicant.isAnomaly) return { cls: 'normal-voice', speed: 30 };

    switch (applicant.anomalyType) {
      case 'UNNATURAL_BEHAVIOR':
        return { cls: 'anomaly-voice', speed: 45 }; // slower, unnerving
      case 'WRONG_NAME':
      case 'WRONG_COMPANY':
        return { cls: 'normal-voice', speed: 28 };  // sounds normal on purpose
      case 'CV_CHANGES':
        return { cls: 'normal-voice', speed: 32 };
      case 'SHADOW_WRONG':
        return { cls: 'normal-voice', speed: 26 };  // too smooth
      case 'WRONG_FACE':
      case 'WRONG_AGE':
        return { cls: 'normal-voice', speed: 30 };
      default:
        return { cls: 'normal-voice', speed: 30 };
    }
  };

  // ── Typewriter with real skip support ──
  const _typewrite = (element, text, speed, callback) => {
    // Cancel any in-progress
    if (currentTypeTimer) clearTimeout(currentTypeTimer);

    element.textContent = '';
    fullText   = text;
    currentEl  = element;
    isTyping   = true;

    let i = 0;
    const cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';
    element.appendChild(cursor);

    const tick = () => {
      if (i < text.length) {
        element.insertBefore(document.createTextNode(text[i]), cursor);
        i++;
        // Slight speed variation — more natural
        const variance = speed + (Math.random() * 14 - 7);
        // Pause slightly on punctuation
        const pause = [',', '.', '!', '?', '—', '...'].some(p => text[i - 1] === p)
          ? variance + Utils.randomInt(80, 200)
          : variance;
        currentTypeTimer = setTimeout(tick, Math.max(8, pause));
      } else {
        cursor.remove();
        isTyping = false;
        currentTypeTimer = null;
        if (callback) callback();
      }
    };
    tick();
  };

  // ── Skip: instantly show full text ──
  const _skipTypewriter = () => {
    if (!isTyping || !currentEl) return;
    if (currentTypeTimer) { clearTimeout(currentTypeTimer); currentTypeTimer = null; }

    // Remove cursor
    const cursor = currentEl.querySelector('.typewriter-cursor');
    if (cursor) cursor.remove();

    currentEl.textContent = fullText;
    isTyping = false;

    // Fire completion callback
    if (onDialogueComplete) {
      const cb = onDialogueComplete;
      onDialogueComplete = null;
      Utils.hide('dialogue-next');
      cb();
    }
  };

  // ── Play intro email ──
  const playIntroEmail = (callback) => {
    const emailBody = Utils.el('email-body');
    if (!emailBody) { if (callback) callback(); return; }
    emailBody.innerHTML = '';

    // Use the randomized bossEmail getter from dialogue-data
    const lines = DIALOGUE_DATA.bossEmail;

    Utils.typeLines(emailBody, lines, 26, 480, () => {
      setTimeout(() => {
        Utils.show('btn-start-shift');
        if (callback) callback();
      }, 900);
    });
  };

  // ── Show applicant greeting ──
  const showGreeting = (applicant, callback) => {
    const subtitle = Utils.el('applicant-subtitle');
    const text     = Utils.el('dialogue-text');
    const next     = Utils.el('dialogue-next');

    if (!subtitle || !text) { if (callback) callback(); return; }

    Utils.show('action-panel');
    Utils.show(subtitle);
    Utils.show('question-panel');
    Utils.hide('decision-panel');
    Utils.hide(next);

    text.textContent = '';

    const { cls, speed } = _getVoiceStyle(applicant);
    text.className = `dialogue-text ${cls}`;

    onDialogueComplete = callback;

    _typewrite(text, applicant.dialogues.greeting, speed, () => {
      if (onDialogueComplete) {
        const cb = onDialogueComplete;
        onDialogueComplete = null;
        cb();
      }
    });
  };

  // ── Show answer ──
  const showAnswer = (applicant, questionId, callback) => {
    const subtitle = Utils.el('applicant-subtitle');
    const text     = Utils.el('dialogue-text');
    const next     = Utils.el('dialogue-next');

    if (!subtitle || !text) { if (callback) callback(); return; }

    Utils.show(subtitle);
    Utils.show('question-panel');
    Utils.hide(next);

    const answer = applicant.dialogues[questionId] || '...';
    text.textContent = '';

    const { cls, speed } = _getVoiceStyle(applicant);
    text.className = `dialogue-text ${cls}`;

    // SHADOW_WRONG: add glitch mid-answer occasionally
    const doGlitch = applicant.anomalyType === 'SHADOW_WRONG' && Utils.chance(0.35);
    if (doGlitch) {
      setTimeout(() => Effects.glitchScreen(150), Utils.randomInt(600, 1400));
    }

    onDialogueComplete = callback;

    _typewrite(text, answer, speed, () => {
      Utils.show(next);
      if (onDialogueComplete) {
        const cb = onDialogueComplete;
        onDialogueComplete = null;
        cb();
      }
    });
  };

  // ── System message → laptop log ──
  const showSystemMessage = (msg, type = 'sys') => {
    Utils.addLog(msg, type);
  };

  // ── Result overlay ──
  const showResult = (type) => {
    const overlay = Utils.el('result-overlay');
    const msg     = Utils.el('result-message');
    const data    = DIALOGUE_DATA.result[type];
    if (!overlay || !data) return;

    msg.textContent = data.text;
    msg.style.color = data.color;

    Utils.show(overlay);
    setTimeout(() => Utils.hide(overlay), 1600);
  };

  // ── Click / key to advance ──
  const handleAdvance = () => {
    if (isTyping) {
      _skipTypewriter();
      return;
    }
    if (onDialogueComplete) {
      const cb = onDialogueComplete;
      onDialogueComplete = null;
      Utils.hide('dialogue-next');
      cb();
    }
  };

  const bindAdvance = () => {
    const next = Utils.el('dialogue-next');
    if (next) next.addEventListener('click', handleAdvance);

    const subtitle = Utils.el('applicant-subtitle');
    if (subtitle) subtitle.addEventListener('click', handleAdvance);

    // Space bar also advances
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && Utils.el('screen-game').classList.contains('active')) {
        e.preventDefault();
        handleAdvance();
      }
    });
  };

  return {
    playIntroEmail,
    showGreeting,
    showAnswer,
    showSystemMessage,
    showResult,
    bindAdvance,
  };

})();

window.DialogueSystem = DialogueSystem;