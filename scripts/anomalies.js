/* ============================================
   SCRIPTS/ANOMALIES.JS — Phase 3
   Handles all 7 anomaly types in evaluation,
   escape hint reveal, horror event picker
   ============================================ */

const AnomalySystem = (() => {

  // ── Evaluate decision ──
  const evaluate = (applicant, decision) => {
    const isAnomaly = applicant.isAnomaly;

    if (isAnomaly && decision === 'hire') {
      return {
        correct:  false,
        penalty:  true,
        logType:  'warn',
        message:  DIALOGUE_DATA.system.anomalyHired,
      };
    }

    if (!isAnomaly && decision === 'reject') {
      return {
        correct:  false,
        penalty:  false,
        logType:  'warn',
        message:  DIALOGUE_DATA.system.normalRejected,
      };
    }

    if (isAnomaly && decision === 'reject') {
      const typeLabel = ANOMALY_TYPES[applicant.anomalyType]?.name || 'Anomali';
      return {
        correct:  true,
        penalty:  false,
        logType:  'sys',
        message:  `BENAR: [${typeLabel}] berhasil diidentifikasi dan ditolak.`,
      };
    }

    // Normal + hired ✅
    return {
      correct:  true,
      penalty:  false,
      logType:  'hired',
      message:  DIALOGUE_DATA.system.hired(applicant.name),
    };
  };

  // ── Random horror event ──
  const randomHorrorEvent = () => {
    return Utils.random(DIALOGUE_DATA.horrorEvents);
  };

  // ── Reveal escape hint in HUD ──
  const revealEscapeHint = () => {
    const el = Utils.el('hud-escape');
    if (el) {
      Utils.show(el);
      setTimeout(() => Utils.hide(el), 8000); // disappears after 8s — blink and miss it
    }
  };

  return { evaluate, randomHorrorEvent, revealEscapeHint };

})();

window.AnomalySystem = AnomalySystem;