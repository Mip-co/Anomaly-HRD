/* ============================================
   SCRIPTS/APPLICANTS.JS — Phase 3
   Uses ApplicantGenerator for procedural queue.
   CV_CHANGES anomaly: reread detection.
   ============================================ */

const ApplicantSystem = (() => {

  let currentApplicant = null;
  let cvClickCount = 0;

  // ── Build queue via generator (Phase 3) ──
  const buildQueue = (count = 5) => {
    return ApplicantGenerator.generateQueue(count);
  };

  // ── Load applicant into scene ──
  const loadApplicant = (applicant) => {
    currentApplicant = applicant;
    cvClickCount = 0;

    _renderFigure(applicant);
    _renderCV(applicant);

    const counter = Utils.el('applicant-counter');
    if (counter) counter.textContent = `ID: ${applicant.id}`;

    // Bind CV re-read detection for CV_CHANGES anomaly
    _bindCVReread(applicant);
  };

  // ── Render figure ──
  const _renderFigure = (applicant) => {
    const figure  = Utils.el('applicant-figure');
    const head    = Utils.el('applicant-head');
    const nameTag = Utils.el('applicant-name-tag');

    if (!figure) return;

    figure.classList.remove('hidden');

    if (head) head.textContent = applicant.appearance || '👤';
    if (nameTag) nameTag.textContent = applicant.name;

    // Reset classes
    const body = figure.querySelector('.applicant-body');
    if (body) {
      body.className = 'applicant-body';
      if (applicant.cssClass) body.classList.add(applicant.cssClass);

      // wrong-shadow: add dynamic shadow element
      if (applicant.anomalyType === 'SHADOW_WRONG') {
        _attachWrongShadow(body);
      }
    }

    Effects.animateApplicantEnter();
  };

  // ── Wrong shadow element ──
  const _attachWrongShadow = (bodyEl) => {
    const shadow = document.createElement('div');
    shadow.className = 'wrong-shadow-el';
    shadow.style.cssText = `
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%) scaleX(1.4);
      width: 80px;
      height: 20px;
      background: rgba(0,0,0,0.7);
      border-radius: 50%;
      filter: blur(4px);
      animation: shadow-drift 2.5s ease-in-out infinite;
      pointer-events: none;
      z-index: -1;
    `;
    bodyEl.style.position = 'relative';
    bodyEl.appendChild(shadow);
  };

  // ── Render CV ──
  const _renderCV = (applicant) => {
    Utils.show('cv-panel');

    Utils.el('cv-name').textContent       = applicant.name;
    Utils.el('cv-age').textContent        = applicant.age + ' tahun';
    Utils.el('cv-position').textContent   = applicant.position;
    Utils.el('cv-origin').textContent     = applicant.origin;
    Utils.el('cv-experience').textContent = applicant.experience;
    Utils.el('cv-education').textContent  = applicant.education;

    // Notes — reset to original each first load
    const notesEl = Utils.el('cv-notes');
    if (notesEl) {
      notesEl.textContent = applicant.notes || '—';
      notesEl.style.color = '';
    }

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

  // ── CV_CHANGES: detect re-reads via click on cv-panel ──
  const _bindCVReread = (applicant) => {
    const cvPanel = Utils.el('cv-panel');
    if (!cvPanel) return;

    // Remove previous listener
    cvPanel.onclick = null;

    if (applicant.anomalyType !== 'CV_CHANGES') return;

    cvPanel.onclick = () => {
      cvClickCount++;
      if (cvClickCount >= 2) {
        ApplicantGenerator.handleCVReread(applicant);
        cvPanel.onclick = null; // trigger once
      }
    };
  };

  // ── Stamp CV ──
  const stampCV = (decision) => {
    const stamp = Utils.el('cv-stamp');
    if (!stamp) return;
    stamp.classList.remove('hidden');
    if (decision === 'hire') {
      stamp.textContent = 'DITERIMA';
      stamp.className = 'cv-stamp hired';
    } else {
      stamp.textContent = 'DITOLAK';
      stamp.className = 'cv-stamp rejected';
    }
  };

  // ── Remove applicant from scene ──
  const removeApplicant = () => {
    const figure = Utils.el('applicant-figure');
    if (figure) {
      figure.style.opacity    = '0';
      figure.style.transform  = 'translateY(20px)';
      figure.style.transition = 'all 0.5s ease';
      setTimeout(() => {
        figure.classList.add('hidden');
        figure.style.opacity    = '';
        figure.style.transform  = '';
        figure.style.transition = '';
        // Clean up wrong-shadow el
        const ws = figure.querySelector('.wrong-shadow-el');
        if (ws) ws.remove();
        // Reset body classes
        const body = figure.querySelector('.applicant-body');
        if (body) body.className = 'applicant-body';
      }, 500);
    }

    // Remove CV reread listener
    const cvPanel = Utils.el('cv-panel');
    if (cvPanel) cvPanel.onclick = null;

    currentApplicant = null;
  };

  const getCurrent = () => currentApplicant;

  return { buildQueue, loadApplicant, stampCV, removeApplicant, getCurrent };

})();

window.ApplicantSystem = ApplicantSystem;