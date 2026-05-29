/* ============================================
   DATA/APPLICANTS-DATA.JS — Phase 3
   Raw data pools untuk procedural generation.
   Tidak lagi berisi fixed applicant objects —
   semua di-generate oleh ApplicantGenerator.
   ============================================ */

const APPLICANT_POOLS = {

  // ── Nama depan ──
  firstName: {
    male:   ['Dimbud','Budi','Reza','Hendra','Agus','Doni','Fajar','Irwan','Joko',
              'Kevin','Lutfi','Marco','Nanda','Oscar','Pandu','Rizky',
              'Surya','Taufik','Umar','Vino','Wahyu','Yusuf','Zaki'],
    female: ['Siti','Dewi','Ayu','Bella','Clara','Diana','Eva','Fitri',
              'Gita','Hana','Intan','Jessi','Kartika','Lina','Maya',
              'Nita','Ocha','Putri','Rina','Sari','Tari','Ulfa','Vivi','Wulan']
  },

  // ── Nama belakang ──
  lastName: ['Santoso','Rahayu','Firmansyah','Anggraini','Kusuma','Wijaya',
             'Pratama','Susanto','Handoko','Nugroho','Setiawan','Purnomo',
             'Hidayat','Ramadan','Saputra','Wibowo','Hartono','Gunawan',
             'Lestari','Purwanto','Yulianto','Mahendra','Adiputra','Basuki'],

  // ── Posisi yang dilamar ──
  position: ['Manager','Customer Service','Analis Keuangan',
             'Marketing Digital','Kepala Gudang','Staff IT','Data Entry',
             'Resepsionis','Staf HRD','Asisten Manajer','Operator Produksi',
             'Koordinator Logistik','Teknisi Komputer','Staff Akuntansi'],

  // ── Kota asal ──
  origin: ['Jakarta','Surabaya','Bandung','Yogyakarta','Semarang','Medan',
           'Makassar','Palembang','Depok','Tangerang','Bekasi','Bogor',
           'Malang','Solo','Denpasar','Balikpapan','Pekanbaru','Padang'],

  // ── Nama universitas ──
  university: ['Universitas Indonesia','Universitas Gadjah Mada',
               'Universitas Airlangga','Universitas Diponegoro',
               'Universitas Padjadjaran','Institut Teknologi Bandung',
               'Universitas Brawijaya','Universitas Hasanuddin',
               'Politeknik Negeri Jakarta','Universitas Trisakti',
               'Universitas Bina Nusantara','Universitas Mercu Buana'],

  // ── Jurusan ──
  major: ['Manajemen','Akuntansi','Teknik Informatika','Ilmu Komunikasi',
          'Ekonomi','Teknik Industri','Sistem Informasi','Administrasi Bisnis',
          'Psikologi','Teknik Elektro','Sastra Inggris','Ilmu Komputer'],

  // ── Jenjang ──
  degree: ['S1','D3','D4','S2'],

  // ── Tahun lulus (range) ──
  gradYearRange: [2010, 2024],

  // ── Nama perusahaan lama ──
  company: ['PT. Surya Abadi','PT. Maju Bersama','CV. Karya Mandiri',
            'PT. Indo Jaya','PT. Global Teknindo','PT. Nusa Persada',
            'PT. Sinar Gemilang','CV. Duta Niaga','PT. Mega Sentosa',
            'PT. Arga Karya','PT. Bintang Timur','PT. Citra Prima',
            'PT. Delta Utama','PT. Elang Perkasa'],

  // ── Template pengalaman ──
  experienceTemplate: [
    (yr, co, pos) => `${yr} tahun sebagai ${pos} di ${co}`,
    (yr, co, pos) => `Bekerja di ${co} selama ${yr} tahun, posisi ${pos}`,
    (yr, co, pos) => `${yr} tahun pengalaman di bidang ${pos}, terakhir di ${co}`,
  ],

  // ── Catatan CV ──
  notes: ['Siap bekerja lembur','Bisa mulai segera','Memiliki kendaraan pribadi',
          'Terbiasa kerja di bawah tekanan','Aktif berorganisasi',
          'Bersedia ditempatkan di mana saja','Mempunyai SIM A dan C',
          'Pengalaman remote working','Terbiasa multitasking',
          'Bersertifikat profesi terkait'],

  // ── Emoji wajah (normal) ──
  face: {
    male:   ['👨','🧑','👦','🧔','👨‍💼'],
    female: ['👩','🧑','👧','👩‍💼','🧕'],
  },

  // ── Template dialog normal ──
  dialogue: {
    greeting: [
      (name, pos) => `Selamat malam. Saya ${name}, saya melamar untuk posisi ${pos}.`,
      (name, pos) => `Malam. Nama saya ${name}. Saya tertarik dengan posisi ${pos} di sini.`,
      (name, pos) => `Selamat malam. ${name}. Saya sudah menunggu cukup lama di luar. Posisi ${pos}, benar?`,
      (name, pos) => `Halo, selamat malam. Saya ${name}. Sedikit gugup, tapi siap diwawancara untuk posisi ${pos}.`,
    ],
    pengalaman: [
      (yr, co) => `Saya bekerja ${yr} tahun di ${co}. Banyak yang saya pelajari di sana.`,
      (yr, co) => `Pengalaman saya sebagian besar di ${co}, selama ${yr} tahun. Cukup solid menurut saya.`,
      (yr, co) => `${yr} tahun di ${co}. Pernah tangani proyek besar, tapi saya lebih suka kerja detail.`,
      (yr, co) => `Terakhir di ${co}, ${yr} tahun. Sebelumnya sempat freelance sebentar.`,
    ],
    motivasi: [
      () => `Saya ingin berkembang. Perusahaan ini punya reputasi yang... menarik.`,
      () => `Jujur, saya butuh lingkungan baru. Di sini kelihatannya berbeda dari tempat biasa.`,
      () => `Saya dengar banyak hal tentang tempat ini. Penasaran dan ingin membuktikan sendiri.`,
      () => `Lokasi strategis, dan kata orang-orang yang pernah kerja di sini... pengalamannya tak terlupakan.`,
    ],
    gaji: [
      (base) => `Sekitar ${base} juta per bulan. Bisa negosiasi.`,
      (base) => `Ekspektasi saya ${base} hingga ${base + 1} juta. Tergantung tunjangan.`,
      (base) => `Sesuai standar UMR, ${base} juta sudah cukup untuk saya saat ini.`,
      (base) => `Kalau bisa ${base} juta, saya sangat bersyukur. Tapi yang terpenting lingkungan kerjanya.`,
    ],
    diri: [
      () => `Saya orangnya detail dan teliti. Kadang terlalu perfeksionis, tapi itu justru nilai plus.`,
      () => `Saya bisa bekerja mandiri maupun tim. Fleksibel dan tidak suka drama kantor.`,
      () => `Jujur, saya introvert. Tapi waktu kerja, saya fokus dan tidak banyak bicara yang tidak perlu.`,
      () => `Saya tipe orang yang langsung bicara apa adanya. Tidak suka basa-basi berlebihan.`,
    ],
  },
};

// ── Fixed applicants (masih ada untuk garanteed content di awal game) ──
const SECRET_APPLICANT_DIMBUD = {
  id: 'SECRET_DIMBUD',
  name: 'Dimbud',
  age: 24,
  position: 'Talent Manager',
  company: 'Black Company',
  origin: 'Bekasi',
  notes: 'Pernah tidak digaji.',
  isAnomaly: false,
  secretEnding: 'ENDING_VTUBER',
  _gender: 'male',
  education: 'S1 Manajemen, Universitas Fiktif (2023)',
  experience: 'Pernah mengelola talenta online, event, dan kontrak sponsor.',
  sprite: 'assets/characters/applicants/dimbud.png',
  cvPhoto: 'assets/characters/applicants/dimbud.png',
  appearance: 'assets/characters/applicants/dimbud.png',
  _salary: 8,
  cssClass: 'dimbud-applicant',
  dialogues: {
    greeting: 'Selamat malam. Posisi saya biasanya Talent Manager... walau sekarang lebih mirip pawang pokemon.',
    pengalaman: 'Saya pernah kerja sampai stroke. pagi, siang, malam semua masuk.',
    motivasi: 'Motivasi? Apa itu motivasi... mending jadi VTuber.',
    diri: 'Saya terbiasa multitasking. Ngurus talent, sponsor, drama, sampe jadi tempat curhat.',
    gaji: 'Ekspektasi gaji? Yang penting dibayar, ga kayak yang sebelumnya. OI BEM BAYAR UTANG LU.',
  },
};

const APPLICANTS_DATA = [];  // Kosong — semua dari generator di Phase 3