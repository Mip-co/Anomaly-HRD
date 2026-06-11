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

    // Image sprite instead of emoji
    if (head) {
      head.innerHTML = '';
      head.style.cssText = 'background:transparent; border:none; width:auto; height:auto;';

      const img = document.createElement('img');
      img.className  = 'applicant-sprite';
      img.alt        = applicant.name;
      img.draggable  = false;

      // Fallback emoji if image fails to load
      const emojiMale = '👨‍💼';
      const emojiFemale = '👩‍💼';
      const emojiAnomaly = '👽';
      
      img.onerror = function() {
        if (applicant.isAnomaly) {
          this.style.display = 'none';
          const span = document.createElement('span');
          span.textContent = emojiAnomaly;
          span.style.fontSize = '80px';
          head.appendChild(span);
        } else {
          this.style.display = 'none';
          const span = document.createElement('span');
          span.textContent = applicant._gender === 'female' ? emojiFemale : emojiMale;
          span.style.fontSize = '80px';
          head.appendChild(span);
        }
      };

      if (applicant.sprite) {
        img.src = applicant.sprite;
      } else {
        const gender = applicant._gender || 'male';
        const pool   = ASSETS.applicants[gender] || ASSETS.applicants.male;
        const idx    = parseInt(applicant.id.replace('A', ''), 10) % pool.length;
        img.src = pool[idx];
      }

      head.appendChild(img);
    }

    if (nameTag) nameTag.textContent = applicant.name;

    const body = figure.querySelector('.applicant-body');
    if (body) {
      body.className = 'applicant-body';
      if (applicant.cssClass) body.classList.add(applicant.cssClass);
      if (applicant.anomalyType === 'SHADOW_WRONG') _attachWrongShadow(body);
    }

    Effects.animateApplicantEnter();
  };

  // ── Wrong shadow element ──
  const _attachWrongShadow = (bodyEl) => {
    const shadow = document.createElement('div');
    shadow.className = 'wrong-shadow-el';
    shadow.style.cssText = `
      position:absolute; bottom:-8px; left:50%;
      transform:translateX(-50%) scaleX(1.4);
      width:80px; height:20px;
      background:rgba(0,0,0,0.7); border-radius:50%;
      filter:blur(4px);
      animation:shadow-drift 2.5s ease-in-out infinite;
      pointer-events:none; z-index:-1;
    `;
    bodyEl.style.position = 'relative';
    bodyEl.appendChild(shadow);
  };
  const _renderCV = (applicant) => {
    const panel = Utils.el('cv-panel');
    if (!panel) return;

    panel.scrollTop = 0;

    Utils.el('cv-name').textContent       = applicant.name;
    Utils.el('cv-age').textContent        = applicant.age + ' tahun';
    Utils.el('cv-position').textContent   = applicant.position;
    Utils.el('cv-origin').textContent     = applicant.origin;
    Utils.el('cv-experience').textContent = applicant.experience;
    Utils.el('cv-education').textContent  = applicant.education;

    const notesEl = Utils.el('cv-notes');
    if (notesEl) { notesEl.textContent = applicant.notes || '—'; notesEl.style.color = ''; }

    // CV photo — image asset
    const photo = Utils.el('cv-photo');
    if (photo) {
      photo.innerHTML = '';
      const img = document.createElement('img');
      img.className = 'cv-photo-img';
      img.alt       = applicant.name;
      img.draggable = false;

      // Fallback emoji if image fails to load
      const emojiMale = '👨';
      const emojiFemale = '👩';
      const emojiAnomaly = '👽';
      
      img.onerror = function() {
        this.style.display = 'none';
        const span = document.createElement('span');
        if (applicant.anomalyType === 'WRONG_FACE') {
          span.textContent = emojiAnomaly;
        } else {
          span.textContent = applicant._gender === 'female' ? emojiFemale : emojiMale;
        }
        span.style.fontSize = '48px';
        span.style.display = 'flex';
        span.style.alignItems = 'center';
        span.style.justifyContent = 'center';
        span.style.height = '100%';
        photo.appendChild(span);
      };

      if (applicant.cvPhoto) {
        img.src = applicant.cvPhoto;
      } else {
        const gender = applicant._gender || 'male';
        const pool   = ASSETS.cvPhotos[gender] || ASSETS.cvPhotos.male;
        const idx    = parseInt(applicant.id.replace('A', ''), 10) % pool.length;
        img.src = pool[idx];
      }

      photo.appendChild(img);
    }

    const stamp = Utils.el('cv-stamp');
    if (stamp) { stamp.className = 'cv-stamp hidden'; stamp.textContent = ''; }

    // Keep CV hidden until the player opens it with Tab
    AudioManager.play('paperRustle');

    // Small chance to trigger a micro-horror when CV is first rendered
    try {
      if (window.Effects && Math.random() < 0.06) {
        Effects.triggerMicroHorror('cv');
        panel.classList.add('cv-micro-glitch');
        setTimeout(() => panel.classList.remove('cv-micro-glitch'), Utils.randomInt(300, 600));
      }
    } catch (e) { /* non-fatal */ }
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

  // Attach a safe micro-horror click hook to CV panel (only once)
  (function _bindCVMicroClick() {
    const panel = Utils.el('cv-panel');
    if (!panel) return;
    if (panel.dataset.microHorrorBound === '1') return;
    panel.addEventListener('click', () => {
      try {
        if (window.Effects && Math.random() < 0.07) {
          Effects.triggerMicroHorror('cv');
          panel.classList.add('cv-micro-glitch');
          setTimeout(() => panel.classList.remove('cv-micro-glitch'), Utils.randomInt(300, 600));
        }
      } catch (e) { /* ignore */ }
    });
    panel.dataset.microHorrorBound = '1';
  })();

  // ── Stamp CV ──
  const stampCV = (decision) => {
    const stamp = Utils.el('cv-stamp');
    if (!stamp) return;
    stamp.classList.remove('hidden');
    stamp.style.display = 'block';
    if (decision === 'hire') {
      stamp.textContent = 'DITERIMA';
      stamp.className = 'cv-stamp hired';
    } else {
      stamp.textContent = 'DITOLAK';
      stamp.className = 'cv-stamp rejected';
    }
    AudioManager.play('stamp');
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
        const ws = figure.querySelector('.wrong-shadow-el');
        if (ws) ws.remove();
        const body = figure.querySelector('.applicant-body');
        if (body) body.className = 'applicant-body';
      }, 500);
    }

    const cvPanel = Utils.el('cv-panel');
    if (cvPanel) cvPanel.onclick = null;

    currentApplicant = null;
  };

  const getCurrent = () => currentApplicant;

  return { buildQueue, loadApplicant, stampCV, removeApplicant, getCurrent };

})();

window.ApplicantSystem = ApplicantSystem;