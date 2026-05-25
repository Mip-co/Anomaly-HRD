/* ============================================
   SCRIPTS/ANOMALIES.JS — Anomaly Detection Logic
   Anomaly HRD
   ============================================ */

const AnomalySystem = (() => {

  // ── Evaluate player decision ──
  // Returns: { correct: bool, penalty: bool, message: string }
  const evaluate = (applicant, decision) => {
    const isAnomaly = applicant.isAnomaly;

    if (isAnomaly && decision === 'hire') {
      // ❌ Hired an anomaly = WRONG
      return {
        correct: false,
        penalty: true,
        logType: 'warn',
        message: DIALOGUE_DATA.system.anomalyHired
      };
    }

    if (!isAnomaly && decision === 'reject') {
      // ❌ Rejected a normal person = mild warning, no heart loss
      return {
        correct: false,
        penalty: false,
        logType: 'warn',
        message: DIALOGUE_DATA.system.normalRejected
      };
    }

    if (isAnomaly && decision === 'reject') {
      // ✅ Correctly rejected anomaly
      return {
        correct: true,
        penalty: false,
        logType: 'sys',
        message: `BENAR: Entitas mencurigakan berhasil ditolak.`
      };
    }

    // ✅ Normal + hired
    return {
      correct: true,
      penalty: false,
      logType: 'hired',
      message: DIALOGUE_DATA.system.hired(applicant.name)
    };
  };

  // ── Pick random horror event ──
  const randomHorrorEvent = () => {
    return Utils.random(DIALOGUE_DATA.horrorEvents);
  };

  return {
    evaluate,
    randomHorrorEvent
  };

})();

window.AnomalySystem = AnomalySystem;