/* ============================================
   DATA/ANOMALIES-DATA.JS
   Anomaly definitions for Phase 1
   ============================================ */

const ANOMALY_TYPES = {

  // ── Type 1: Wrong Face (visual) ──
  WRONG_FACE: {
    id: 'WRONG_FACE',
    name: 'Wajah Berbeda',
    description: 'Foto di CV tidak sesuai dengan pelamar yang datang',
    difficulty: 'easy',
    hint: 'Bandingkan foto di CV dengan wajah pelamar.',
    apply: (applicant) => {
      const otherFaces = ['👽', '🤖', '💀', '👁️', '🎭'];
      return {
        ...applicant,
        isAnomaly: true,
        anomalyType: 'WRONG_FACE',
        // appearance stays normal emoji but cvPhoto becomes different
        cvPhoto: otherFaces[Math.floor(Math.random() * otherFaces.length)],
        anomalyDialogueOverride: null // No change in dialogue
      };
    }
  },

  // ── Type 2: Wrong Name ──
  WRONG_NAME: {
    id: 'WRONG_NAME',
    name: 'Nama Berbeda',
    description: 'Pelamar menyebut nama berbeda dari yang tertulis di CV',
    difficulty: 'medium',
    hint: 'Dengarkan nama yang disebutkan saat perkenalan.',
    apply: (applicant) => {
      const wrongNames = [
        'Ahmad Sulaiman', 'Nur Fadillah', 'Teguh Prasetyo',
        'Wulan Sari', 'Andi Wijaya', 'Fitri Handayani'
      ];
      const fakeName = wrongNames[Math.floor(Math.random() * wrongNames.length)];
      return {
        ...applicant,
        isAnomaly: true,
        anomalyType: 'WRONG_NAME',
        dialogues: {
          ...applicant.dialogues,
          greeting: `Selamat malam. Saya ${fakeName}, saya melamar untuk posisi ${applicant.position}.`
        }
      };
    }
  },

  // ── Type 3: No Blinking / Uncanny ──
  UNNATURAL_BEHAVIOR: {
    id: 'UNNATURAL_BEHAVIOR',
    name: 'Perilaku Tidak Wajar',
    description: 'Pelamar berperilaku tidak natural — tidak berkedip, senyum tidak hilang, dll.',
    difficulty: 'hard',
    hint: 'Perhatikan cara pelamar merespon.',
    apply: (applicant) => {
      return {
        ...applicant,
        isAnomaly: true,
        anomalyType: 'UNNATURAL_BEHAVIOR',
        cssClass: 'no-blink',
        dialogues: {
          greeting: `Selamat malam. ${applicant.name}. Saya sudah lama menunggu.`,
          pengalaman: `Pengalaman saya... banyak. Lebih banyak dari yang Anda kira.`,
          motivasi: `Saya ingin ada di sini. Saya selalu ingin ada di sini.`,
          gaji: `Gaji tidak penting. Saya hanya ingin... tetap di sini.`,
          diri: `Saya tidak pernah lelah. Tidak pernah lapar. Tidak pernah pergi.`
        }
      };
    }
  }

};

// ── Anomaly Applicants (Phase 1 — 3 of 5 may be anomaly) ──
// Applied on top of base applicants at runtime by anomalies.js

const ANOMALY_SCHEDULE = [
  // [applicantIndex, anomalyType or null]
  // null = normal
  { index: 0, anomaly: null },
  { index: 1, anomaly: 'WRONG_FACE' },
  { index: 2, anomaly: null },
  { index: 3, anomaly: 'WRONG_NAME' },
  { index: 4, anomaly: 'UNNATURAL_BEHAVIOR' },
];