/* ============================================
   DATA/DIALOGUE-DATA.JS
   Boss messages, system texts, UI strings
   ============================================ */

const DIALOGUE_DATA = {

  // ── Boss Intro Email ──
  bossEmail: [
    'Selamat datang di Pt Dimbud Mencari Cinta Sejati Tbk.',
    'Kamu ditugaskan untuk shift malam ini.',
    'Target Anda: proses minimal 5 pelamar malam ini.',
    'Ikuti prosedur dengan ketat.',
    'Periksa CV, lakukan wawancara singkat, lalu ambil keputusan.',
    '.',
    '.',
    'Oh ya, satu hal lagi...',
    'Jangan masukkan orang yang aneh.',
    'Kamu tahu maksud saya.',
    '— Dimbud'
  ],

  // ── System / HRD UI Texts ──
  system: {
    welcome:        'Sistem HRD v2.1 siap. Shift malam dimulai.',
    applicantIn:    (name) => `${name} masuk ruang wawancara.`,
    hired:          (name) => `DITERIMA: ${name}`,
    rejected:       (name) => `DITOLAK: ${name}`,
    heartLost:      'PERINGATAN: Keputusan salah terdeteksi.',
    shiftEnd:       'Shift selesai. Memproses laporan...',
    anomalyHired:   'ERROR: Entitas tidak teridentifikasi telah diloloskan.',
    normalRejected: 'CATATAN: Pelamar normal telah ditolak. Performa menurun.',
  },

  // ── Question Labels (player chooses to ask) ──
  questions: [
    { id: 'pengalaman', label: '💼 Ceritakan pengalaman kerja Anda' },
    { id: 'motivasi',   label: '🎯 Apa motivasi Anda melamar di sini?' },
    { id: 'gaji',       label: '💰 Ekspektasi gaji Anda?' },
    { id: 'diri',       label: '🪞 Ceritakan tentang diri Anda' },
  ],

  // ── Horror Event Messages (on heart loss) ──
  horrorEvents: [
    {
      text: 'LAMPU MATI SEJENAK',
      image: '💡',
      duration: 1500,
      sound: 'flicker'
    },
    {
      text: 'SESUATU BERGERAK DI LUAR JENDELA',
      image: '👁️',
      duration: 2000,
      sound: 'creak'
    },
    {
      text: 'LAYAR MONITOR BERUBAH SENDIRI',
      image: '📺',
      duration: 1800,
      sound: 'static'
    }
  ],

  // ── Result Messages ──
  result: {
    hired:          { text: 'DITERIMA', color: '#4a7c4e' },
    rejected:       { text: 'DITOLAK',  color: '#8b1a1a' },
    heartLost:      { text: '− NYAWA',  color: '#cc2222' },
    wrongRejection: { text: 'SALAH!',   color: '#cc6622' },
  },

  // ── Ending texts ──
  endings: {
    bad: {
      title: 'SHIFT BERAKHIR',
      lines: [
        'Lampu padam.',
        'Ruang tunggu tidak lagi kosong.',
        'Pintu kantor bergerak perlahan.',
        'Sesuatu mendekat.',
        '',
        'Anda seharusnya lebih berhati-hati.',
      ]
    },
    good: {
      title: 'SHIFT SELESAI',
      lines: [
        'Pukul 06.00. Shift malam berakhir.',
        'Anda berhasil melewati malam ini.',
        'Sinar matahari mulai masuk dari jendela.',
        '',
        'Tapi kenapa...',
        '...foto di CV Anda sendiri tampak sedikit berbeda?',
      ]
    },
    escape: {
      title: 'ANDA PERGI',
      lines: [
        'Anda mengambil tas dan berjalan keluar.',
        'Hujan masih deras.',
        'Lorong kantor terasa lebih panjang dari biasanya.',
        '',
        'Saat Anda hampir sampai pintu keluar...',
        '...telepon di meja resepsionis berdering.',
        '...dan berhenti tepat saat Anda menyentuh pintu.',
      ]
    }
  }

};