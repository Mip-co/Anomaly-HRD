/* ============================================
   SCRIPTS/APPLICANTS.JS — Applicant System
   Load applicant, render CV, show figure
   Anomaly HRD
   ============================================ */

const ApplicantSystem = (() => {

  let currentApplicant = null;

  // ── Build applicant queue from schedule ──
  const buildQueue = () => {
    return ANOMALY_SCHEDULE.map(({ index, anomaly }) => {
      let applicant = Utils.clone(APPLICANTS_DATA[index]);
      if (anomaly && ANOMALY_TYPES[anomaly]) {
        applicant = ANOMALY_TYPES[anomaly].apply(applicant);
      }
      return applicant;
    });
  };

  // ── Load applicant into scene ──
  const loadApplicant = (applicant) => {
    currentApplicant = applicant;

    // Show figure
    _renderFigure(applicant);

    // Show CV
    _renderCV(applicant);

    // Update laptop counter
    const counter = Utils.el('applicant-counter');
    if (counter) {
      counter.textContent = `ID: ${applicant.id}`;
    }
  };

  // ── Render applicant figure in interview room ──
  const _renderFigure = (applicant) => {
    const figure   = Utils.el('applicant-figure');
    const head     = Utils.el('applicant-head');
    const nameTag  = Utils.el('applicant-name-tag');

    if (!figure) return;

    figure.classList.remove('hidden');

    // Set emoji face
    if (head) {
      head.textContent = applicant.appearance || '👤';
    }

    // Name tag
    if (nameTag) {
      nameTag.textContent = applicant.name;
    }

    // Remove previous anomaly classes
    figure.className = '';
    if (applicant.cssClass) {
      figure.classList.add(applicant.cssClass);
    }

    Effects.animateApplicantEnter();
  };

  // ── Render CV document ──
  const _renderCV = (applicant) => {
    Utils.show('cv-panel');

    Utils.el('cv-name').textContent      = applicant.name;
    Utils.el('cv-age').textContent       = applicant.age + ' tahun';
    Utils.el('cv-position').textContent  = applicant.position;
    Utils.el('cv-origin').textContent    = applicant.origin;
    Utils.el('cv-experience').textContent = applicant.experience;
    Utils.el('cv-education').textContent = applicant.education;
    Utils.el('cv-notes').textContent     = applicant.notes || '—';

    const photo = Utils.el('cv-photo');
    if (photo) photo.textContent = applicant.cvPhoto || '👤';

    // Clear stamp
    const stamp = Utils.el('cv-stamp');
    if (stamp) {
      stamp.className = 'cv-stamp hidden';
      stamp.textContent = '';
    }

    AudioManager.play('paperRustle');
  };

  // ── Stamp CV ──
  const stampCV = (decision) => {
    const stamp = Utils.el('cv-stamp');
    if (!stamp) return;
    stamp.classList.remove('hidden');
    if (decision === 'hire') {
      stamp.textContent = 'DITERIMA';
      stamp.classList.add('hired');
      stamp.classList.remove('rejected');
    } else {
      stamp.textContent = 'DITOLAK';
      stamp.classList.add('rejected');
      stamp.classList.remove('hired');
    }
  };

  // ── Remove applicant from scene ──
  const removeApplicant = () => {
    const figure = Utils.el('applicant-figure');
    if (figure) {
      figure.style.opacity = '0';
      figure.style.transform = 'translateY(20px)';
      figure.style.transition = 'all 0.5s ease';
      setTimeout(() => {
        figure.classList.add('hidden');
        figure.style.opacity   = '';
        figure.style.transform = '';
        figure.style.transition = '';
      }, 500);
    }
    currentApplicant = null;
  };

  // ── Get current ──
  const getCurrent = () => currentApplicant;

  return {
    buildQueue,
    loadApplicant,
    stampCV,
    removeApplicant,
    getCurrent
  };

})();

window.ApplicantSystem = ApplicantSystem;