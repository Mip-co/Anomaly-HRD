/* ============================================
   SCRIPTS/DIALOGUE.JS — Dialogue System
   Typewriter, email intro, question flow
   Anomaly HRD
   ============================================ */

const DialogueSystem = (() => {

  let onDialogueComplete = null;
  let isTyping = false;
  let skipRequested = false;

  // ── Play intro email (title screen → game) ──
  const playIntroEmail = (callback) => {
    const emailBody = Utils.el('email-body');
    if (!emailBody) { if (callback) callback(); return; }

    emailBody.innerHTML = '';

    // Add click handler to skip email
    const handleEmailClick = (e) => {
      e.stopPropagation();
      // Mark all paragraphs to skip
      emailBody.querySelectorAll('p').forEach(p => {
        p._skipTypewrite = true;
      });
      // Skip email completion
      emailBody.removeEventListener('click', handleEmailClick);
      setTimeout(() => {
        Utils.show('btn-start-shift');
        if (callback) callback();
      }, 300);
    };

    emailBody.addEventListener('click', handleEmailClick);

    Utils.typeLines(
      emailBody,
      DIALOGUE_DATA.bossEmail,
      28,
      500,
      () => {
        emailBody.removeEventListener('click', handleEmailClick);
        // Show start button after email finishes
        setTimeout(() => {
          Utils.show('btn-start-shift');
          if (callback) callback();
        }, 800);
      }
    );
  };

  // ── Show applicant greeting ──
  const showGreeting = (applicant, callback) => {
    const box     = Utils.el('dialogue-box');
    const speaker = Utils.el('dialogue-speaker');
    const text    = Utils.el('dialogue-text');
    const next    = Utils.el('dialogue-next');

    if (!box) { if (callback) callback(); return; }

    Utils.show('action-panel');
    Utils.show(box);
    Utils.hide('question-panel');
    Utils.hide('decision-panel');

    speaker.textContent = applicant.name;
    text.textContent    = '';

    // Apply anomaly voice styling
    text.className = 'dialogue-text';
    if (applicant.isAnomaly && applicant.anomalyType === 'UNNATURAL_BEHAVIOR') {
      text.classList.add('anomaly-voice');
    } else {
      text.classList.add('normal-voice');
    }

    isTyping = true;
    skipRequested = false;

    Utils.typewrite(text, applicant.dialogues.greeting, 30, () => {
      isTyping = false;
      Utils.show(next);
      onDialogueComplete = callback;
    });
  };

  // ── Show answer to a question ──
  const showAnswer = (applicant, questionId, callback) => {
    const speaker = Utils.el('dialogue-speaker');
    const text    = Utils.el('dialogue-text');
    const next    = Utils.el('dialogue-next');

    if (!text) { if (callback) callback(); return; }

    Utils.hide('question-panel');
    Utils.hide('dialogue-next');

    const answer = applicant.dialogues[questionId] || '...';

    speaker.textContent = applicant.name;
    text.textContent    = '';

    // Anomaly voice check
    text.className = 'dialogue-text';
    if (applicant.isAnomaly && applicant.anomalyType === 'UNNATURAL_BEHAVIOR') {
      text.classList.add('anomaly-voice');
    } else {
      text.classList.add('normal-voice');
    }

    AudioManager.play('click');
    isTyping = true;

    Utils.typewrite(text, answer, 30, () => {
      isTyping = false;
      Utils.show(next);
      onDialogueComplete = callback;
    });
  };

  // ── Show system/boss message on laptop ──
  const showSystemMessage = (msg, type = 'sys') => {
    Utils.addLog(msg, type);
  };

  // ── Show result overlay (DITERIMA / DITOLAK) ──
  const showResult = (type) => {
    const overlay = Utils.el('result-overlay');
    const msg     = Utils.el('result-message');
    const data    = DIALOGUE_DATA.result[type];
    if (!overlay || !data) return;

    msg.textContent  = data.text;
    msg.style.color  = data.color;

    Utils.show(overlay);
    setTimeout(() => Utils.hide(overlay), 1500);
  };

  // ── Click to advance dialogue ──
  const handleAdvance = () => {
    if (isTyping) {
      // Mark current dialogue to skip animation
      const text = Utils.el('dialogue-text');
      if (text) text._skipTypewrite = true;
      return;
    }
    if (onDialogueComplete) {
      const cb = onDialogueComplete;
      onDialogueComplete = null;
      Utils.hide('dialogue-next');
      cb();
    }
  };

  // ── Bind click-to-advance ──
  const bindAdvance = () => {
    const next = Utils.el('dialogue-next');
    if (next) {
      next.addEventListener('click', handleAdvance);
    }
    const box = Utils.el('dialogue-box');
    if (box) {
      box.addEventListener('click', handleAdvance);
    }
  };

  return {
    playIntroEmail,
    showGreeting,
    showAnswer,
    showSystemMessage,
    showResult,
    bindAdvance
  };

})();

window.DialogueSystem = DialogueSystem;