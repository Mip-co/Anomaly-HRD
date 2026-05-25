/* ============================================
   SCRIPTS/GAME.JS — Phase 3
   Full randomized run, escape mechanic,
   CV_CHANGES support, dynamic queue size
   ============================================ */

const Game = (() => {

  // ── Config ──
  const QUEUE_SIZE = 5; // Phase 3: 5 applicants/run. Phase 4+ expand to 10+

  // ── State ──
  const state = {
    phase:          'title',
    hearts:         5,
    maxHearts:      5,
    applicantQueue: [],
    currentIndex:   -1,
    processed:      0,
    hired:          0,
    rejected:       0,
    anomaliesFound: 0,
    anomaliesHired: 0,
    questionsAsked: new Set(),
    time:           { hour: 22, minute: 0 },
    ended:          false,
    escapeAvailable: false,  // unlocks after first horror event
  };

  // ── Init ──
  const init = () => {
    _bindTitle();
    _renderHearts();
    DialogueSystem.bindAdvance();
    _bindEscapeKey();
  };

  // ═══════════════════════════════════════════
  // TITLE
  // ═══════════════════════════════════════════
  const _bindTitle = () => {
    document.addEventListener('keydown', _titleAnyKey, { once: true });
    document.addEventListener('click',   _titleAnyKey, { once: true });
  };

  const _titleAnyKey = async () => {
    AudioManager.init();
    await Utils.switchScreen('screen-title', 'screen-intro');
    _startIntro();
  };

  // ═══════════════════════════════════════════
  // INTRO
  // ═══════════════════════════════════════════
  const _startIntro = () => {
    state.phase = 'intro';
    DialogueSystem.playIntroEmail();

    const startBtn = Utils.el('btn-start-shift');
    if (startBtn) startBtn.addEventListener('click', _startGame, { once: true });
  };

  // ═══════════════════════════════════════════
  // GAME START
  // ═══════════════════════════════════════════
  const _startGame = async () => {
    AudioManager.startAmbience();
    await Utils.switchScreen('screen-intro', 'screen-game');

    state.phase          = 'playing';
    state.applicantQueue = ApplicantSystem.buildQueue(QUEUE_SIZE);

    Effects.init();
    _renderHearts();
    _updateHUD();

    DialogueSystem.showSystemMessage(DIALOGUE_DATA.system.welcome, 'sys');
    DialogueSystem.showSystemMessage(
      `Pelamar terdaftar malam ini: ${QUEUE_SIZE}`, 'sys'
    );

    AudioManager.play('bell');
    Effects.triggerFlicker();

    await Utils.sleep(1400);
    _nextApplicant();
  };

  // ═══════════════════════════════════════════
  // GAMEPLAY LOOP
  // ═══════════════════════════════════════════
  const _nextApplicant = async () => {
    if (state.ended) return;

    state.currentIndex++;

    if (state.currentIndex >= state.applicantQueue.length) {
      await _triggerEnding('good');
      return;
    }

    const applicant = state.applicantQueue[state.currentIndex];
    state.questionsAsked.clear();

    await Utils.sleep(700);

    DialogueSystem.showSystemMessage(
      DIALOGUE_DATA.system.applicantIn(applicant.name), 'sys'
    );

    // Advance clock
    const newTime = Utils.advanceTime(state.time);
    Effects.updateClock(newTime);
    _updateHUD();

    // Load into scene
    ApplicantSystem.loadApplicant(applicant);

    await Utils.sleep(900);

    // Anomaly subtle cues (player won't know why it feels off)
    if (applicant.isAnomaly) {
      const cueDelay = Utils.randomInt(800, 1800);
      setTimeout(() => AudioManager.play('anomalyPresence'), cueDelay);
      setTimeout(() => Effects.triggerVHSError(), cueDelay + 300);
    }

    // Show greeting
    DialogueSystem.showGreeting(applicant, () => {
      _showQuestions(applicant);
    });
  };

  // ── Question phase ──
  const _showQuestions = (applicant) => {
    const panel   = Utils.el('question-panel');
    const buttons = Utils.el('question-buttons');
    const next    = Utils.el('dialogue-next');

    if (!panel || !buttons) return;

    Utils.hide(next);
    Utils.hide('decision-panel');
    buttons.innerHTML = '';

    DIALOGUE_DATA.questions.forEach(q => {
      const btn = document.createElement('button');
      btn.className   = 'btn-question';
      btn.textContent = q.label;
      btn.dataset.qid = q.id;
      if (state.questionsAsked.has(q.id)) btn.disabled = true;

      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        state.questionsAsked.add(q.id);
        btn.disabled = true;
        AudioManager.play('click');

        // Anomaly: delayed response for UNNATURAL_BEHAVIOR
        const answerDelay = (applicant.anomalyType === 'UNNATURAL_BEHAVIOR' && Utils.chance(0.4))
          ? Utils.randomInt(1200, 2500)
          : 0;

        if (answerDelay > 0) {
          // Uncomfortable silence
          const text = Utils.el('dialogue-text');
          if (text) {
            text.textContent = '...';
            text.className = 'dialogue-text anomaly-voice';
          }
        }

        setTimeout(() => {
          DialogueSystem.showAnswer(applicant, q.id, () => {
            Utils.show(panel);
            _checkShowDecision();
          });
        }, answerDelay);
      });

      buttons.appendChild(btn);
    });

    Utils.show(panel);
    _checkShowDecision();
  };

  const _checkShowDecision = () => {
    if (state.questionsAsked.size >= 1) Utils.show('decision-panel');
    else Utils.hide('decision-panel');
  };

  // ── Decision buttons ──
  const _bindDecisions = () => {
    const hireBtn   = Utils.el('btn-hire');
    const rejectBtn = Utils.el('btn-reject');
    if (hireBtn)   hireBtn.addEventListener('click',   () => _makeDecision('hire'));
    if (rejectBtn) rejectBtn.addEventListener('click', () => _makeDecision('reject'));
  };

  const _makeDecision = async (decision) => {
    if (state.ended) return;

    const applicant = ApplicantSystem.getCurrent();
    if (!applicant) return;

    // Lock UI
    Utils.el('btn-hire').disabled   = true;
    Utils.el('btn-reject').disabled = true;

    ApplicantSystem.stampCV(decision);

    const result = AnomalySystem.evaluate(applicant, decision);
    AudioManager.play(decision === 'hire' ? 'hire' : 'reject');

    // Stats
    state.processed++;
    if (decision === 'hire')   state.hired++;
    else                       state.rejected++;
    if (applicant.isAnomaly && decision === 'reject') state.anomaliesFound++;
    if (applicant.isAnomaly && decision === 'hire')   state.anomaliesHired++;

    DialogueSystem.showSystemMessage(result.message, result.logType);
    DialogueSystem.showResult(decision === 'hire' ? 'hired' : 'rejected');

    if (result.penalty) {
      await _triggerPenalty();
    } else {
      await Utils.sleep(500);
    }

    _updateHUD();

    if (state.hearts <= 0) {
      await Utils.sleep(600);
      await _triggerEnding('bad');
      return;
    }

    ApplicantSystem.removeApplicant();
    Utils.hide('action-panel');

    await Utils.sleep(900);

    Utils.el('btn-hire').disabled   = false;
    Utils.el('btn-reject').disabled = false;

    _nextApplicant();
  };

  // ── Penalty ──
  const _triggerPenalty = async () => {
    state.hearts--;
    _renderHearts();

    const tension = state.maxHearts - state.hearts;
    Effects.setTension(tension);

    AudioManager.play('heartLoss');
    Utils.flashScreen('red', 650);
    Effects.shake(420, 1 + tension * 0.35);

    setTimeout(() => Effects.triggerVHSError(), 180);
    setTimeout(() => Effects.triggerVHSError(), 420);

    DialogueSystem.showSystemMessage(DIALOGUE_DATA.system.heartLost, 'warn');
    DialogueSystem.showResult('heartLost');

    // Unlock escape after first penalty
    state.escapeAvailable = true;

    await Utils.sleep(500);

    const horrorEvent = AnomalySystem.randomHorrorEvent();
    await Effects.triggerHorrorEvent(horrorEvent);

    if (tension >= 3) {
      await Utils.sleep(350);
      AudioManager.play('whisper');
    }
  };

  // ═══════════════════════════════════════════
  // ESCAPE MECHANIC (secret ending)
  // Press Escape key after first horror event
  // ═══════════════════════════════════════════
  const _bindEscapeKey = () => {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.escapeAvailable && state.phase === 'playing') {
        _triggerEnding('escape');
      }
    });
  };

  // ═══════════════════════════════════════════
  // HUD
  // ═══════════════════════════════════════════
  const _renderHearts = () => {
    const display = Utils.el('heart-display');
    if (!display) return;
    display.innerHTML = '';
    for (let i = 0; i < state.maxHearts; i++) {
      const heart = document.createElement('span');
      heart.className  = 'heart' + (i >= state.hearts ? ' lost' : '');
      heart.textContent = '♥';
      display.appendChild(heart);
    }
  };

  const _updateHUD = () => {
    const total   = state.applicantQueue.length;
    const target  = Utils.el('hud-target');
    const timeEl  = Utils.el('hud-shift-time');
    const counter = Utils.el('applicant-counter');

    if (target)  target.textContent  = `${state.processed} / ${total}`;
    if (timeEl)  timeEl.textContent  = Utils.formatTime(state.time.hour, state.time.minute);
    if (counter) counter.textContent = `Pelamar: ${state.processed} / ${total}`;
  };

  // ═══════════════════════════════════════════
  // ENDINGS
  // ═══════════════════════════════════════════
  const _triggerEnding = async (type) => {
    if (state.ended) return;
    state.ended = true;
    state.phase = 'ending';

    if (type === 'bad') {
      await Effects.triggerBadEndingSequence();
      await Utils.sleep(700);
    } else if (type === 'good') {
      AudioManager.play('morning');
      Effects.setTension(0);
      await Utils.sleep(1200);
    } else if (type === 'escape') {
      Effects.glitchScreen(400);
      AudioManager.play('static');
      await Utils.sleep(600);
    }

    EndingSystem.trigger(type, {
      processed:      state.processed,
      hired:          state.hired,
      rejected:       state.rejected,
      anomaliesFound: state.anomaliesFound,
      anomaliesHired: state.anomaliesHired,
      hearts:         state.hearts,
    });
  };

  // ── Boot ──
  const boot = () => {
    init();
    _bindDecisions();
  };

  return { boot };

})();

document.addEventListener('DOMContentLoaded', () => Game.boot());