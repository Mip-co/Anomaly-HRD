/* ============================================
   DATA/ANOMALIES-DATA.JS — Phase 3
   7 anomaly types, richer dialogue variations,
   randomized schedule generator
   ============================================ */

const ANOMALY_TYPES = {

  // ─────────────────────────────────────────
  // EASY — Visual, player should catch quickly
  // ─────────────────────────────────────────

  WRONG_FACE: {
    id: 'WRONG_FACE',
    name: 'Wajah Berbeda',
    difficulty: 'easy',
    description: 'Foto di CV tidak cocok dengan wajah pelamar yang datang.',
    apply: (applicant) => {
      const gender = applicant._gender || 'male';
      const cvAnomalyPool = ASSETS.cvPhotos.anomaly[gender] || ASSETS.cvPhotos.anomaly.male;
      const anomalyPhoto = Utils.random(cvAnomalyPool);
      return {
        ...applicant,
        isAnomaly: true,
        anomalyType: 'WRONG_FACE',
        cvPhoto: anomalyPhoto,
        // Keep actual applicant sprite the same, so mismatch is only in CV photo
      };
    }
  },

  WRONG_AGE: {
    id: 'WRONG_AGE',
    name: 'Usia Tidak Konsisten',
    difficulty: 'easy',
    description: 'Usia di CV tidak cocok dengan yang disebutkan saat wawancara.',
    apply: (applicant) => {
      const realAge  = applicant.age;
      const fakeAge  = realAge + Utils.randomInt(15, 40); // impossibly old
      return {
        ...applicant,
        isAnomaly: true,
        anomalyType: 'WRONG_AGE',
        dialogues: {
          ...applicant.dialogues,
          diri: `Saya ${fakeAge} tahun. Sudah lama sekali bekerja di bidang ini. Sangat lama.`,
        }
      };
    }
  },

  // ─────────────────────────────────────────
  // MEDIUM — Requires cross-referencing
  // ─────────────────────────────────────────

  WRONG_NAME: {
    id: 'WRONG_NAME',
    name: 'Nama Berbeda',
    difficulty: 'medium',
    description: 'Pelamar menyebut nama berbeda dari yang ada di CV.',
    apply: (applicant) => {
      const pool = ['Ahmad Sulaiman','Nur Fadillah','Teguh Prasetyo','Wulan Sari',
                    'Andi Wijaya','Fitri Handayani','Bambang Irawan','Ratna Dewi',
                    'Hendri Kusno','Lastri Wulandari','Eko Prasetyo','Yuni Astuti'];
      const fakeName = Utils.random(pool.filter(n => n !== applicant.name));
      return {
        ...applicant,
        isAnomaly: true,
        anomalyType: 'WRONG_NAME',
        dialogues: {
          ...applicant.dialogues,
          greeting: `Selamat malam. Saya ${fakeName}. Saya datang untuk posisi ${applicant.position}.`,
        }
      };
    }
  },

  WRONG_COMPANY: {
    id: 'WRONG_COMPANY',
    name: 'Perusahaan Tidak Cocok',
    difficulty: 'medium',
    description: 'Pelamar menyebut nama perusahaan berbeda dari yang tertulis di CV.',
    apply: (applicant) => {
      const fakeCompanies = ['PT. Kegelapan Abadi','CV. Tanpa Nama','PT. [DATA EXPUNGED]',
                              'PT. Nusantara Jaya Mandiri','tempat yang tidak bisa saya sebutkan'];
      const fake = Utils.random(fakeCompanies);
      return {
        ...applicant,
        isAnomaly: true,
        anomalyType: 'WRONG_COMPANY',
        dialogues: {
          ...applicant.dialogues,
          pengalaman: `Saya bekerja di ${fake}. Selama... entah berapa lama. Waktu terasa berbeda di sana.`,
        }
      };
    }
  },

  CV_CHANGES: {
    id: 'CV_CHANGES',
    name: 'CV Berubah Sendiri',
    difficulty: 'medium',
    description: 'Isi CV berubah setelah dibuka kembali oleh player.',
    apply: (applicant) => {
      const altNotes = [
        'Tidak pernah tidur.',
        'Selalu ada. Kapan saja.',
        'Tidak memerlukan istirahat.',
        'Referensi: Anda sendiri.',
        'Pengalaman: lebih dari yang Anda bayangkan.',
      ];
      return {
        ...applicant,
        isAnomaly: true,
        anomalyType: 'CV_CHANGES',
        cvNotesAlt: Utils.random(altNotes), // Second read will show this
        _cvRead: 0,  // counter for how many times CV was "opened"
      };
    }
  },

  // ─────────────────────────────────────────
  // HARD — Subtle, atmospheric, easy to miss
  // ─────────────────────────────────────────

  UNNATURAL_BEHAVIOR: {
    id: 'UNNATURAL_BEHAVIOR',
    name: 'Perilaku Tidak Wajar',
    difficulty: 'hard',
    description: 'Semua jawaban terasa off — tidak natural, tidak manusiawi.',
    apply: (applicant) => {
      const variants = [
        {
          greeting:    `Selamat malam. ${applicant.name}. Saya sudah lama menunggu di sini.`,
          pengalaman:  `Pengalaman saya... banyak. Lebih dari yang Anda kira mungkin bisa dipahami.`,
          motivasi:    `Saya ingin ada di sini. Saya selalu ingin berada di tempat seperti ini.`,
          gaji:        `Gaji tidak relevan. Saya hanya ingin... tetap di sini.`,
          diri:        `Saya tidak pernah lelah. Tidak lapar. Tidak takut gelap.`,
        },
        {
          greeting:    `Malam. Anda... HRD-nya ya? Saya tunggu sudah lama. Sangat lama.`,
          pengalaman:  `Saya pernah bekerja di banyak tempat. Banyak sekali. Tapi semuanya... pergi.`,
          motivasi:    `Saya tidak punya pilihan selain datang ke sini. Anda mengerti, kan?`,
          gaji:        `Bayar saya dengan apapun yang Anda anggap pantas. Saya tidak butuh uang.`,
          diri:        `Saya sudah ada sebelum kantor ini dibangun. Saya akan ada setelah Anda pergi.`,
        },
        {
          greeting:    `...${applicant.name}. Posisi ${applicant.position}. Saya sudah tahu semua pertanyaannya.`,
          pengalaman:  `Pengalaman saya tidak bisa ditulis di kertas. Tapi saya bisa tunjukkan kalau perlu.`,
          motivasi:    `Saya dengar tempat ini menerima semua jenis pelamar. Termasuk yang seperti saya.`,
          gaji:        `Tolong jangan tanyakan itu lagi.`,
          diri:        `Saya tidak ingat kapan terakhir kali saya tidur. Atau apakah saya pernah tidur.`,
        },
      ];
      const v = Utils.random(variants);
      return {
        ...applicant,
        isAnomaly: true,
        anomalyType: 'UNNATURAL_BEHAVIOR',
        cssClass: 'no-blink',
        dialogues: v,
      };
    }
  },

  SHADOW_WRONG: {
    id: 'SHADOW_WRONG',
    name: 'Bayangan Tidak Sesuai',
    difficulty: 'hard',
    description: 'Bayangan pelamar bergerak berbeda dari tubuhnya.',
    apply: (applicant) => {
      return {
        ...applicant,
        isAnomaly: true,
        anomalyType: 'SHADOW_WRONG',
        cssClass: 'wrong-shadow',
        // Dialogue sounds completely normal — that's the horror
        dialogues: {
          ...applicant.dialogues,
          // Sneak one odd line in
          diri: applicant.dialogues.diri + ` Oh, saya perhatikan bayangan saya tadi bergerak sendiri. Mungkin lampu kantornya berkedip.`,
        }
      };
    }
  },

};

// ─────────────────────────────────────────
// ANOMALY SCHEDULE GENERATOR (Phase 3)
// Replaces fixed ANOMALY_SCHEDULE
// ─────────────────────────────────────────
const AnomalyScheduler = {

  // Difficulty weights per position in queue
  // Earlier = easier, later = harder
  _difficultyByIndex: {
    0: null,       // always normal (tutorial slot)
    1: 'easy',
    2: null,       // 40% chance anomaly
    3: 'medium',
    4: null,       // 40% chance anomaly
    5: 'easy',
    6: 'medium',
    7: null,       // 50% chance anomaly
    8: 'hard',
    9: 'hard',
  },

  _anomalyByDifficulty: {
    easy:   ['WRONG_FACE', 'WRONG_AGE'],
    medium: ['WRONG_NAME', 'WRONG_COMPANY', 'CV_CHANGES'],
    hard:   ['UNNATURAL_BEHAVIOR', 'SHADOW_WRONG'],
  },

  // Generate a schedule for N applicants
  generate: (count = 5) => {
    const schedule = [];
    const usedAnomalies = new Set();

    for (let i = 0; i < count; i++) {
      const diff = AnomalyScheduler._difficultyByIndex[i] ?? null;

      // 40% chance for null slots
      let anomalyType = null;
      if (diff === null) {
        anomalyType = Utils.chance(0.40)
          ? Utils.random(AnomalyScheduler._anomalyByDifficulty.easy)
          : null;
      } else {
        const pool = AnomalyScheduler._anomalyByDifficulty[diff];
        // Prefer not reusing anomalies, but allow if pool exhausted
        const fresh = pool.filter(a => !usedAnomalies.has(a));
        anomalyType = Utils.random(fresh.length ? fresh : pool);
        usedAnomalies.add(anomalyType);
      }

      schedule.push({ index: i, anomaly: anomalyType });
    }

    return schedule;
  },
};

// Legacy fixed schedule (fallback / Phase 1 testing)
const ANOMALY_SCHEDULE = [
  { index: 0, anomaly: null },
  { index: 1, anomaly: 'WRONG_FACE' },
  { index: 2, anomaly: null },
  { index: 3, anomaly: 'WRONG_NAME' },
  { index: 4, anomaly: 'UNNATURAL_BEHAVIOR' },
];