/* ============================================
   SCRIPTS/GAME.JS — Phase 3
   Full randomized run, escape mechanic,
   CV_CHANGES support, dynamic queue size
   ============================================ */

const Game = (() => {

  // ── Config ──
  const NORMAL_QUEUE_SIZE = 10;
  const HARD_QUEUE_SIZE = 20;

  // ── State ──
  const state = {
    phase:          'title',
    hearts:         5,
    maxHearts:      5,
    difficulty:     'normal',
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
    escapeAvailable:         false,
    finalOfficeEventDone:    false,
    dimbudSpawned:           false,
    perfectRun:              true,   // stays true if no hearts lost
  };

  // last time a non-penalty ambient horror event fired (ms)
  let lastAmbientEventAt = 0;

  const getQueueSize = () => state.difficulty === 'hard' ? HARD_QUEUE_SIZE : NORMAL_QUEUE_SIZE;
  const getFinalOfficeEventAt = () => state.applicantQueue.length - 1;

  // ── Init ──
  const init = () => {
    _bindTitle();
    _renderHearts();
    DialogueSystem.bindAdvance();
    _bindEscapeKey();
    // Back to title button (available during gameplay)
    const backBtn = Utils.el('btn-back-title');
    if (backBtn) {
      backBtn.addEventListener('click', async () => {
        // Stop audio and return to title screen
        try { AudioManager.stopAll(); } catch (e) {}
        state.phase = 'title';
        await Utils.switchScreen('screen-game', 'screen-title');
      });
    }
  };

  // ═══════════════════════════════════════════
  // TITLE
  // ═══════════════════════════════════════════
  const _bindTitle = () => {
    let menuShown = false;
    let audioStarted = false;

    const showTitleMenu = () => {
      if (menuShown) return;
      menuShown = true;
      const prompt = Utils.el('title-prompt');
      const menu = Utils.el('title-menu');
      const btnContinue = Utils.el('btn-continue');
      const btnEndings = Utils.el('btn-endings');
      const difficultyPanel = Utils.el('difficulty-panel');
      const diffButtons = difficultyPanel ? difficultyPanel.querySelectorAll('.difficulty-btn') : [];
      let panelOpen = false;

      if (prompt) prompt.classList.add('hidden');
      if (menu) menu.classList.remove('hidden');
      if (difficultyPanel) difficultyPanel.classList.add('hidden');

      const setDifficultySelection = (choice) => {
        state.difficulty = choice;
        diffButtons.forEach(button => {
          button.classList.toggle('active', button.dataset.difficulty === choice);
        });
      };

      const savedDifficulty = window.SaveSystem && SaveSystem.getSave ? (SaveSystem.getSave().currentSave.difficulty || 'normal') : 'normal';
      setDifficultySelection(savedDifficulty);

      const openDifficultyPanel = () => {
        if (!difficultyPanel || panelOpen) return;
        panelOpen = true;
        if (menu) menu.classList.add('hidden');
        difficultyPanel.classList.remove('hidden');
      };

      const startSelectedDifficulty = async () => {
        if (window.SaveSystem && SaveSystem.saveGame) SaveSystem.saveGame({ difficulty: state.difficulty });
        const hasEndings = window.SaveSystem && SaveSystem.hasAnyEndingUnlocked ? SaveSystem.hasAnyEndingUnlocked() : false;
        if (hasEndings) {
          await Utils.switchScreen('screen-title', 'screen-intro');
          _startIntro();
        } else {
          await Utils.switchScreen('screen-title', 'screen-cinematic');
          IntroSystem.start(async () => {
            if (window.SaveSystem && SaveSystem.setHasSeenIntro) SaveSystem.setHasSeenIntro(true);
            await Utils.switchScreen('screen-cinematic', 'screen-intro');
            _startIntro();
          });
        }
      };

      diffButtons.forEach(button => {
        button.addEventListener('click', async () => {
          setDifficultySelection(button.dataset.difficulty);
          await startSelectedDifficulty();
        });
      });

      // Show/hide continue & endings depending on save
      try {
        const hasAny = window.SaveSystem && SaveSystem.hasAnyEndingUnlocked && SaveSystem.hasAnyEndingUnlocked();
        if (btnContinue) btnContinue.classList.toggle('hidden', !hasAny);
        if (btnEndings) btnEndings.classList.toggle('hidden', !hasAny);
      } catch (e) { /* ignore */ }

      // Wire buttons
      const newBtn = Utils.el('btn-new-game');
      if (newBtn) newBtn.addEventListener('click', async () => {
        AudioManager.stopLoop();
        openDifficultyPanel();
      });

      if (btnContinue) btnContinue.addEventListener('click', async () => {
        const s = window.SaveSystem && SaveSystem.loadGame ? SaveSystem.loadGame() : null;
        const payload = s && s.currentSave ? s.currentSave : null;
        state.difficulty = payload && payload.difficulty ? payload.difficulty : 'normal';

        // Reset run state (fresh shift)
        state.hearts = state.maxHearts;
        state.processed = 0;
        state.hired = 0;
        state.rejected = 0;
        state.anomaliesFound = 0;
        state.anomaliesHired = 0;
        state.questionsAsked = new Set();
        state.currentIndex = -1;
        state.applicantQueue = ApplicantSystem.buildQueue(getQueueSize());

        // Prepare systems and go directly to intro email (skip cinematic)
        await Utils.switchScreen('screen-title', 'screen-intro');
        _startIntro();
      }, { once: true });

      if (btnEndings) btnEndings.addEventListener('click', async () => {
        // Render endings archive and switch to endings screen
        if (window.SaveSystem && SaveSystem.renderEndingsArchive) SaveSystem.renderEndingsArchive();
        await Utils.switchScreen('screen-title', 'screen-ending');
      });
    };

    const handler = async (e) => {
      // Ignore modifier keys only
      if (e.type === 'keydown' && ['Shift','Control','Alt','Meta','Tab'].includes(e.key)) return;
      if (!audioStarted) {
        AudioManager.init();
        AudioManager.playLoop('assets/sounds/title_vhs.mp3', 0.35);
        audioStarted = true;
      }
      // show menu on first non-modifier input
      showTitleMenu();
    };

    document.addEventListener('keydown', handler);
    document.addEventListener('click',   handler);
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
    await Utils.switchScreen('screen-intro', 'screen-game');
    _beginGameplay();
  };

  const _beginGameplay = async () => {
    AudioManager.startAmbience();

    state.phase          = 'playing';
    state.applicantQueue = ApplicantSystem.buildQueue(getQueueSize());

    // Init room system with escape callback
    RoomSystem.init(() => {
      if (state.escapeAvailable && state.phase === 'playing') {
        _triggerEnding('escape');
      }
    });
    RoomSystem.initRain();
    RoomSystem.scheduleLightning(0);
    RoomSystem.setState('clean', true); // instant — no 3s fade on first load

    Effects.init();
    _renderHearts();
    _updateHUD();

    DialogueSystem.showSystemMessage(DIALOGUE_DATA.system.welcome, 'sys');
    DialogueSystem.showSystemMessage(
      `Pelamar terdaftar malam ini: ${state.applicantQueue.length}`, 'sys'
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
      // Check for secret ending: perfect run (no hearts lost)
      const endingType = state.perfectRun ? 'secret' : 'good';
      await _triggerEnding(endingType);
      return;
    }

    // Final office event — triggers before the last applicant
    if (state.currentIndex === getFinalOfficeEventAt() && !state.finalOfficeEventDone) {
      state.finalOfficeEventDone = true;
      await Effects.triggerFinalOfficeEvent();
      await Utils.sleep(600);
    }

    let applicant = state.applicantQueue[state.currentIndex];

    const shouldSpawnSecretDimbud =
      !state.dimbudSpawned &&
      state.currentIndex === 4 &&
      state.hearts === state.maxHearts &&
      state.anomaliesHired === 0 &&
      !state.ended;

    if (shouldSpawnSecretDimbud) {
      // Insert a deep-cloned secret applicant and ensure dialogues are isolated
      applicant = Utils.clone(SECRET_APPLICANT_DIMBUD);
      // Defensive: ensure dialogues is a deep clone so later systems don't mutate the shared object
      applicant.dialogues = Utils.clone(SECRET_APPLICANT_DIMBUD.dialogues || {});
      applicant._isSecretDimbud = true;
      state.applicantQueue[state.currentIndex] = applicant;
      state.dimbudSpawned = true;
    }

    state.questionsAsked.clear();

    await Utils.sleep(700);

    DialogueSystem.showSystemMessage(
      DIALOGUE_DATA.system.applicantIn(applicant.name), 'sys'
    );

    // Advance clock with pulse animation
    const newTime = Utils.advanceTime(state.time);
    Effects.updateClock(newTime);
    Polish.pulseClockUpdate(newTime);
    _updateHUD();

    // Load into scene
    ApplicantSystem.loadApplicant(applicant);
    Polish.animateCVIn();

    // Random ambient horror events that are NOT penalties
    try {
      const now = Date.now();
      const tension = window.Effects ? Effects.getTension() : 0;
      // small cooldown to avoid repeats
      if (now - lastAmbientEventAt > 8000) {
        if (tension >= 1 && Math.random() < 0.12) {
          if (window.Effects) Effects.triggerMicroHorror('ambient');
          lastAmbientEventAt = now;
        } else if (tension >= 2 && Math.random() < 0.08) {
          // occasional slightly larger random horror (but not always penalty)
          try {
            const ev = window.AnomalySystem ? AnomalySystem.randomHorrorEvent() : null;
            if (ev && window.Effects) {
              Effects.triggerHorrorEvent(ev);
              lastAmbientEventAt = now + 4000; // slightly longer pause
            }
          } catch (e) { /* ignore errors from optional systems */ }
        }
      }
    } catch (e) { /* ignore */ }

    // Auto-save minimal state so Continue can resume
    try {
      if (window.SaveSystem && SaveSystem.saveGame) {
        SaveSystem.saveGame({
          hearts: state.hearts,
          applicantIndex: state.currentIndex + 1,
          shift: state.currentIndex + 1,
          applicantQueue: state.applicantQueue,
          difficulty: state.difficulty
        });
      }
    } catch (e) { /* ignore save errors */ }

    // SFX: chair creak as applicant sits, paper slide for CV
    setTimeout(() => AudioManager.play('chairCreak'), 600);
    setTimeout(() => AudioManager.play('paperSlide'), 300);

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

    Utils.show('action-panel');
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
            // Small chance for micro-horror after an answer (non-blocking)
            try {
              if (!state.ended && window.Effects && Math.random() < 0.06) {
                Effects.triggerMicroHorror('question');
              }
            } catch (e) { /* ignore */ }
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

    if (decision === 'hire' && applicant.secretEnding === 'ENDING_VTUBER') {
      ApplicantSystem.removeApplicant();
      Utils.hide('action-panel');
      await _triggerEnding(applicant.secretEnding);
      return;
    }

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
    // Animate the specific heart that was lost
    Polish.animateHeartLoss(state.hearts);
    Effects.setTension(tension);
    RoomSystem.setFromHeartsLost(state.maxHearts - state.hearts);
    RoomSystem.scheduleLightning(tension);

    AudioManager.play('heartLoss');
    Utils.flashScreen('red', 650);
    Effects.shake(420, 1 + tension * 0.35);

    setTimeout(() => Effects.triggerVHSError(), 180);
    setTimeout(() => Effects.triggerVHSError(), 420);

    DialogueSystem.showSystemMessage(DIALOGUE_DATA.system.heartLost, 'warn');
    DialogueSystem.showResult('heartLost');

    // Unlock escape after first penalty
    state.escapeAvailable = true;
    state.perfectRun = false;
    AnomalySystem.revealEscapeHint();
    RoomSystem.unlockEscape();

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
      await Effects.triggerGoodEndingSequence();
    } else if (type === 'secret') {
      // Secret ending: deceptive good start, then twist
      await Effects.triggerGoodEndingSequence();
      await Utils.sleep(1000);
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
  const boot = async () => {
    // Phase 5: preload assets first
    await Polish.preload();
    await IntroSystem.preload();
    IntroSystem.init();

    init();
    _bindDecisions();
    Polish.initFullscreen();
    Polish.enhanceTitleScreen();
  };

  return { boot };

})();

document.addEventListener('DOMContentLoaded', () => Game.boot());