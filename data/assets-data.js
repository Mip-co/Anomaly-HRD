/* ============================================
   DATA/ASSETS-DATA.JS
   Asset manifest for all image-based characters.
   Replace .svg paths with .png when ready.
   All paths relative to index.html
   ============================================ */

const ASSETS = {

  // ── Applicant sprites (full body shown in waiting room) ──
  // When replacing: PNG transparent, ~120x200px recommended
    applicants: {
    male: [
      'assets/characters/applicants/male_1.png',
      'assets/characters/applicants/male_2.png',
      'assets/characters/applicants/male_3.png',
      'assets/characters/applicants/male_4.png',
      'assets/characters/applicants/male_5.png',
    ],
    female: [
      'assets/characters/applicants/female_1.png',
      'assets/characters/applicants/female_2.png',
      'assets/characters/applicants/female_3.png',
      'assets/characters/applicants/female_4.png',
      'assets/characters/applicants/female_5.png',
    ],
  },

  // ── Anomaly sprites — per gender ──
  // Anomaly type menentukan male/female berdasarkan applicant gender
  // Path: assets/characters/anomalies/male_1.png dst
  anomalies: {
    male: [
      'assets/characters/anomalies/male_1.png',
      'assets/characters/anomalies/male_2.png',
      'assets/characters/anomalies/male_3.png',
      'assets/characters/anomalies/male_4.png',
      'assets/characters/anomalies/male_5.png',
    ],
    female: [
      'assets/characters/anomalies/female_1.png',
      'assets/characters/anomalies/female_2.png',
      'assets/characters/anomalies/female_3.png',
      'assets/characters/anomalies/female_4.png',
      'assets/characters/anomalies/female_5.png',
    ],
  },

  // ── CV photo thumbnails ──
  cvPhotos: {
    male: [
      'assets/characters/applicants/male_1.png',
      'assets/characters/applicants/male_2.png',
      'assets/characters/applicants/male_3.png',
      'assets/characters/applicants/male_4.png',
      'assets/characters/applicants/male_5.png',
    ],
    female: [
      'assets/characters/applicants/female_1.png',
      'assets/characters/applicants/female_2.png',
      'assets/characters/applicants/female_3.png',
      'assets/characters/applicants/female_4.png',
      'assets/characters/applicants/female_5.png',
    ],
    // WRONG_FACE anomaly: tampilkan sprite anomali di CV
    anomaly: {
      male: [
        'assets/characters/anomalies/male_1.png',
        'assets/characters/anomalies/male_2.png',
        'assets/characters/anomalies/male_3.png',
        'assets/characters/anomalies/male_4.png',
        'assets/characters/anomalies/male_5.png',
      ],
      female: [
        'assets/characters/anomalies/female_1.png',
        'assets/characters/anomalies/female_2.png',
        'assets/characters/anomalies/female_3.png',
        'assets/characters/anomalies/female_4.png',
        'assets/characters/anomalies/female_5.png',
      ],
    },
  },

  // ── Jumpscare images ──
  // When replacing: PNG ~400x300px, dark background or transparent
  jumpscares: {
    face:   'assets/characters/jumpscares/Jumpscare1.png',
    shadow: 'assets/characters/jumpscares/Jumpscare2.png',
    static: 'assets/characters/jumpscares/Jumpscare6.png',
    eye:    'assets/characters/jumpscares/Jumpscare6.png',
  },

};

window.ASSETS = ASSETS;