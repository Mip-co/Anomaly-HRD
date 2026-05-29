/* ============================================
   SCRIPTS/GENERATOR.JS — Phase 3
   Procedural applicant & queue generator.
   Replaces fixed APPLICANTS_DATA + ANOMALY_SCHEDULE
   with fully randomized, replayable content.
   ============================================ */

const ApplicantGenerator = (() => {

  let _usedNames = new Set();

  // ── Generate one random applicant ──
  const generateApplicant = (index) => {
    const pool = APPLICANT_POOLS;

    // Gender
    const isMale  = Utils.chance(0.5);
    const genders = isMale ? 'male' : 'female';

    // Name (unique per run)
    let name;
    let attempts = 0;
    do {
      const first = Utils.random(pool.firstName[genders]);
      const last  = Utils.random(pool.lastName);
      name = `${first} ${last}`;
      attempts++;
    } while (_usedNames.has(name) && attempts < 20);
    _usedNames.add(name);

    // Core stats
    const age       = Utils.randomInt(21, 45);
    const position  = Utils.random(pool.position);
    const origin    = Utils.random(pool.origin);
    const company   = Utils.random(pool.company);
    const years     = Utils.randomInt(1, 12);
    const degree    = Utils.random(pool.degree);
    const major     = Utils.random(pool.major);
    const uni       = Utils.random(pool.university);
    const gradYear  = Utils.randomInt(...pool.gradYearRange);
    const salaryBase = Utils.randomInt(4, 15);
    const note      = Utils.random(pool.notes);
    const face      = Utils.random(pool.face[genders]);

    // Build experience string
    const expTemplate = Utils.random(pool.experienceTemplate);
    const experience  = expTemplate(years, company, position.toLowerCase());

    // Build dialogues from templates
    const D = pool.dialogue;
    const dialogues = {
      greeting:    Utils.random(D.greeting)(name, position),
      pengalaman:  Utils.random(D.pengalaman)(years, company),
      motivasi:    Utils.random(D.motivasi)(),
      gaji:        Utils.random(D.gaji)(salaryBase),
      diri:        Utils.random(D.diri)(),
    };

    const spriteIndex = index % ASSETS.applicants[genders].length;
    const sprite = ASSETS.applicants[genders][spriteIndex];
    const cvPhoto = ASSETS.cvPhotos[genders][spriteIndex];

    return {
      id:         `A${String(index + 1).padStart(3, '0')}`,
      name,
      age,
      position,
      origin,
      education:  `${degree} ${major}, ${uni} (${gradYear})`,
      experience,
      notes:      note,
      sprite,
      cvPhoto,
      appearance: sprite,
      isAnomaly:  false,
      _gender:    isMale ? 'male' : 'female',
      dialogues,
      _salary:    salaryBase,
    };
  };

  // ── Generate full queue ──
  // count: total applicants in run
  // Returns array of applicants, some with anomalies applied
  const generateQueue = (count = 5) => {
    _usedNames.clear();

    // Generate base applicants
    const applicants = Array.from({ length: count }, (_, i) =>
      generateApplicant(i)
    );

    // Generate anomaly schedule
    const schedule = AnomalyScheduler.generate(count);

    // Apply anomalies
    return applicants.map((applicant, i) => {
      const slot = schedule.find(s => s.index === i);
      if (slot && slot.anomaly && ANOMALY_TYPES[slot.anomaly]) {
        return ANOMALY_TYPES[slot.anomaly].apply(Utils.clone(applicant));
      }
      return applicant;
    });
  };

  // ── CV_CHANGES: update notes on second read ──
  const handleCVReread = (applicant) => {
    if (applicant.anomalyType !== 'CV_CHANGES') return false;
    applicant._cvRead = (applicant._cvRead || 0) + 1;
    if (applicant._cvRead >= 2) {
      // Change a field — subtle
      const el = document.getElementById('cv-notes');
      if (el && applicant.cvNotesAlt) {
        el.textContent = applicant.cvNotesAlt;
        el.style.color = '#8b3a3a';
        Effects.triggerVHSError();
        AudioManager.play('anomalyPresence');
        DialogueSystem.showSystemMessage(DIALOGUE_DATA.system.cvReread, 'warn');
        return true;
      }
    }
    return false;
  };

  // ── Reset for new run ──
  const reset = () => { _usedNames.clear(); };

  return { generateQueue, handleCVReread, reset };

})();

window.ApplicantGenerator = ApplicantGenerator;