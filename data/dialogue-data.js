/* ============================================
   DATA/DIALOGUE-DATA.JS — Phase 3
   Boss email variants, system texts,
   question labels, horror event pool expanded
   ============================================ */

const DIALOGUE_DATA = {

  // ── Boss Intro Email (dipilih random tiap run) ──
  bossEmailVariants: [
    [
      'Selamat datang di Nusantara Jaya Mandiri.',
      'Anda ditugaskan untuk shift malam ini.',
      'Target Anda: proses semua pelamar yang datang.',
      'Ikuti prosedur dengan ketat.',
      '.',
      'Satu pesan dariku:',
      'Jangan masukkan orang yang aneh.',
      'Anda tahu apa yang aku maksud.',
      '— Pak Direktur',
    ],
    [
      'Pegawai baru.',
      'Shift Anda dimulai malam ini.',
      'Saya tidak akan banyak bicara.',
      '.',
      'Periksa CV. Tanya pertanyaan. Ambil keputusan.',
      'Jangan terlalu lama berpikir.',
      '.',
      'Dan satu hal...',
      'Kalau ada yang terasa tidak beres — tolak saja.',
      'Percayai instingmu.',
      '— B.D.',
    ],
    [
      'Anda sudah tanda tangan kontrak.',
      'Shift malam dimulai pukul 22.00.',
      'Ruangan sudah disiapkan.',
      '.',
      'Prosedur standar berlaku.',
      'Namun ada addendum penting dalam kontrak halaman 47:',
      '"Karyawan wajib menolak pelamar yang tidak memenuhi kriteria standar manusia."',
      '.',
      'Definisi "standar manusia" ada di lampiran.',
      'Lampiran tidak tersedia.',
      '— Manajemen',
    ],
  ],

  // ── System / HRD UI Texts ──
  system: {
    welcome:        'Sistem HRD v2.1 siap. Shift malam dimulai.',
    applicantIn:    (name) => `${name} memasuki ruang wawancara.`,
    hired:          (name) => `DITERIMA: ${name}`,
    rejected:       (name) => `DITOLAK: ${name}`,
    heartLost:      'PERINGATAN: Kesalahan kritis terdeteksi.',
    shiftEnd:       'Shift selesai. Memproses laporan...',
    anomalyHired:   'ERROR: Entitas tidak teridentifikasi telah diloloskan.',
    normalRejected: 'CATATAN: Pelamar normal ditolak. Tingkat akurasi menurun.',
    cvReread:       'PERHATIAN: Data CV menunjukkan inkonsistensi.',
  },

  // ── Question Labels ──
  questions: [
    { id: 'pengalaman', label: '💼 Ceritakan pengalaman kerja Anda' },
    { id: 'motivasi',   label: '🎯 Apa motivasi Anda melamar?' },
    { id: 'gaji',       label: '💰 Ekspektasi gaji Anda?' },
    { id: 'diri',       label: '🪞 Ceritakan tentang diri Anda' },
  ],

  // ── Horror Events Pool (Phase 3: expanded) ──
  horrorEvents: [
    {
      text:     'LAMPU MATI SEJENAK',
      image:    'assets\characters\jumpscares\Jumpscare6.png',
      duration: 1400,
      sound:    'jumpscare',
    },
    {
      text:     'SESUATU BERGERAK DI LUAR JENDELA',
      image:    'assets\characters\jumpscares\Jumpscare2.png',
      duration: 2000,
      sound:    'creak',
    },
    {
      text:     'LAYAR BERUBAH SEBENTAR',
      image:    'assets\characters\jumpscares\Jumpscare7.png',
      duration: 1600,
      sound:    'jumpscare',
    },
    {
      text:     'ADA SUARA DARI KOLONG MEJA',
      image:    'assets/characters/jumpscares/Jumpscare4.png',
      duration: 1800,
      sound:    'jumpscare',
    },
    {
      text:     '',
      image:    '🚪',
      duration: 2200,
      sound:    'knock',
    },
    {
      text:     'TELEPON BERDERING TANPA SUARA',
      image:    '📞',
      duration: 1500,
      sound:    'static',
    },
    {
      text:     'DATA HILANG SEBENTAR',
      image:    'assets\characters\jumpscares\Jumpscare1.png',
      duration: 1200,
      sound:    'static',
    },
    {
      text:     '',
      image:    'assets/characters/jumpscares/Jumpscare6.png',
      duration: 2500,
      sound:    'jumpscare',
    },
  ],

  // ── Result display ──
  result: {
    hired:          { text: 'DITERIMA',  color: '#4a7c4e' },
    rejected:       { text: 'DITOLAK',   color: '#8b1a1a' },
    heartLost:      { text: '− NYAWA',   color: '#cc2222' },
    wrongRejection: { text: 'SALAH!',    color: '#cc6622' },
  },

  // ── Endings ──
  endings: {
    bad: {
      title: 'SHIFT BERAKHIR',
      lines: [
        'Lampu padam satu per satu.',
        'Ruang tunggu tidak lagi kosong.',
        'Mereka yang Anda loloskan — masih ada di sana.',
        '',
        'Pintu kantor bergerak perlahan.',
        'Tidak ada yang membukanya.',
        '',
        'Anda seharusnya lebih berhati-hati.',
      ]
    },
    good: {
      title: 'SHIFT SELESAI',
      lines: [
        'Pukul 06.00. Langit mulai terang.',
        'Semua pelamar sudah diproses.',
        '',
        'Anda meraih tas, bersiap pulang.',
        '',
        'Di meja ada satu amplop yang tidak ada sebelumnya.',
        'Di dalamnya: CV dengan foto dan nama Anda.',
        '',
        'Di bagian status tertulis:',
        '"MENUNGGU PROSES WAWANCARA"',
        '',
        '...Anda belum pernah diterima bekerja di sini.',
      ]
    },
    ENDING_VTUBER: {
      title: 'VTUBER ENDING',
      lines: [
        'Office lights shut down.',
        'EMPLOYEE STATUS: RESIGNED',
        'Rain ambience slowly fades.',
        'CRT distortion weakens.',
        'Beberapa minggu kemudian...',
        'Kamu tidak pernah kembali ke gedung itu.',
        'Sekarang kamu menjadi VTuber indie kecil.',
        'Penontonmu tidak banyak.',
        'Tapi setidaknya...',
        'Kamu akhirnya keluar dari kota aneh itu.',
        'NEW CAREER PATH DETECTED:',
        'STREAMER',
        'Ting.',
      ]
    },
    escape: {
      title: 'ANDA PERGI',
      lines: [
        'Anda meninggalkan meja.',
        'Lorong menuju pintu keluar lebih panjang dari yang Anda ingat.',
        '',
        'Lampu lorong berkedip.',
        'Satu per satu.',
        '',
        'Di ujung lorong, telepon resepsionis berdering.',
        '',
        '...',
      ]
    },
    escape_answer: {
      title: 'HALO?',
      lines: [
        '"Anda tidak seharusnya keluar."',
        '"Shift belum selesai."',
        '',
        '"Kembalilah ke meja Anda."',
        '',
        '...',
        '',
        'Anda meletakkan telepon.',
        'Pintu keluar terkunci.',
      ]
    },
    escape_ignore: {
      title: 'ANDA PERGI',
      lines: [
        'Anda tidak mengangkat telepon.',
        '',
        'Anda mendorong pintu.',
        'Hujan deras.',
        '',
        'Di belakang Anda, telepon masih berdering.',
        'Dan terus berdering.',
        '',
        'Bahkan setelah Anda tidak bisa lagi mendengarnya.',
      ]
    },
    secret: {
      title: 'SHIFT SEMPURNA',
      lines: [
        'Tidak ada yang lolos.',
        'Tidak ada nyawa yang hilang.',
        '',
        'Anda melakukan pekerjaan dengan sempurna.',
        '',
        'Sebuah email baru muncul di laptop.',
        '',
        '"Terima kasih atas kinerja Anda malam ini."',
        '"Anda adalah yang terbaik yang pernah kami miliki."',
        '"Sampai jumpa di shift berikutnya..."',
        '',
        '"...Entitas nomor 7."',
      ]
    },
  },

  // ── get random boss email ──
  get bossEmail() {
    return Utils.random(this.bossEmailVariants);
  },
};