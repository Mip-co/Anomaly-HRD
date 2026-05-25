/* ============================================
   DATA/APPLICANTS-DATA.JS
   5 base applicants for Phase 1
   ============================================ */

const APPLICANTS_DATA = [
  {
    id: 'A001',
    name: 'Budi Santoso',
    age: 28,
    position: 'Staff Administrasi',
    origin: 'Yogyakarta',
    education: 'S1 Manajemen, Universitas Gadjah Mada (2018)',
    experience: '3 tahun sebagai admin di PT. Surya Abadi',
    notes: 'Aktif berorganisasi, dapat bekerja lembur',
    cvPhoto: '👨',
    appearance: '👨',
    isAnomaly: false,
    dialogues: {
      greeting: 'Selamat malam. Saya Budi Santoso, saya melamar untuk posisi Staff Administrasi.',
      pengalaman: 'Saya bekerja 3 tahun di PT. Surya Abadi sebagai admin. Mengelola dokumen dan laporan bulanan.',
      motivasi: 'Saya ingin berkembang di perusahaan yang lebih besar. Nusantara Jaya sudah dikenal baik.',
      gaji: 'Ekspektasi saya sekitar 5 juta per bulan. Namun bisa didiskusikan.',
      diri: 'Saya orangnya teliti dan disiplin. Saya jarang terlambat.',
    }
  },

  {
    id: 'A002',
    name: 'Siti Rahayu',
    age: 24,
    position: 'Customer Service',
    origin: 'Surabaya',
    education: 'D3 Komunikasi, Politeknik Negeri Surabaya (2020)',
    experience: '1 tahun di call center perbankan',
    notes: 'Ramah, komunikatif, terbiasa kerja shift',
    cvPhoto: '👩',
    appearance: '👩',
    isAnomaly: false,
    dialogues: {
      greeting: 'Halo, selamat malam! Saya Siti. Senang bisa wawancara malam ini.',
      pengalaman: 'Saya pernah kerja di call center BCA selama setahun. Terbiasa menghadapi pelanggan yang susah.',
      motivasi: 'Saya ingin pengalaman di bidang HRD, dan lowongan ini cocok dengan latar belakang saya.',
      gaji: 'Kalau bisa 4.5 juta sudah cukup untuk saya.',
      diri: 'Saya suka bertemu orang baru dan senang membantu. Tapi kalau sudah marah ya bisa juga hehe.',
    }
  },

  {
    id: 'A003',
    name: 'Reza Firmansyah',
    age: 31,
    position: 'Analis Keuangan',
    origin: 'Jakarta',
    education: 'S1 Akuntansi, Universitas Indonesia (2015)',
    experience: '6 tahun sebagai akuntan di firma konsultan',
    notes: 'Pengalaman audit, bersertifikat CPA',
    cvPhoto: '🧑',
    appearance: '🧑',
    isAnomaly: false,
    dialogues: {
      greeting: 'Selamat malam. Reza Firmansyah. Saya sudah membaca job description dengan detail.',
      pengalaman: 'Enam tahun di dunia audit dan konsultansi keuangan. Saya pernah menangani klien Fortune 500.',
      motivasi: 'Saya ingin tantangan baru. Nusantara Jaya menarik karena reputasinya yang... unik.',
      gaji: 'Minimal 12 juta. Saya tahu nilai saya.',
      diri: 'Saya analitis dan tidak suka ambiguitas. Saya butuh angka yang jelas.',
    }
  },

  {
    id: 'A004',
    name: 'Dewi Anggraini',
    age: 26,
    position: 'Marketing Digital',
    origin: 'Bandung',
    education: 'S1 Ilmu Komunikasi, Universitas Padjadjaran (2019)',
    experience: '2 tahun sebagai social media manager di startup',
    notes: 'Portfolio tersedia di link terpisah',
    cvPhoto: '👩',
    appearance: '👩',
    isAnomaly: false,
    dialogues: {
      greeting: 'Hai! Saya Dewi. Maaf kalau saya keliatan sedikit gugup, ini wawancara malam pertama saya.',
      pengalaman: 'Saya manage akun Instagram dan TikTok brand lokal. Berhasil naikkan follower 300 persen.',
      motivasi: 'Saya pengen coba industri yang lebih traditional biar bisa lihat dua sisi dunia marketing.',
      gaji: 'Sekitar 6 sampai 7 juta kalau boleh.',
      diri: 'Kreatif, cepat adaptasi. Tapi kadang terlalu banyak ide sampai bingung sendiri haha.',
    }
  },

  {
    id: 'A005',
    name: 'Hendra Kusuma',
    age: 35,
    position: 'Kepala Gudang',
    origin: 'Semarang',
    education: 'SMA Negeri 2 Semarang (2007)',
    experience: '10 tahun di logistik dan manajemen gudang',
    notes: 'Terbiasa memimpin tim 15-20 orang',
    cvPhoto: '👨',
    appearance: '👨',
    isAnomaly: false,
    dialogues: {
      greeting: 'Malam Pak/Bu. Hendra. Langsung saja ya, saya tidak suka basa basi.',
      pengalaman: 'Sepuluh tahun di gudang. Saya tahu sistem FIFO, LIFO, barcode, semua. Tidak ada yang saya tidak tahu soal logistik.',
      motivasi: 'Tempat lama saya tutup. Saya butuh kerja. Sederhana.',
      gaji: 'Sesuai UMK Semarang sudah cukup. Tapi kalau lebih syukur.',
      diri: 'Keras tapi fair. Anak buah saya respek karena saya tidak pernah minta yang bukan hak saya.',
    }
  },
  {
  id: 'A011',
  name: 'Yoga Saputra',
  age: 30,
  position: 'Operator Produksi',
  origin: 'Cikarang',
  education: 'SMK Teknik Mesin (2013)',
  experience: '5 tahun di pabrik otomotif',
  notes: 'Terbiasa kerja shift malam',
  cvPhoto: '👨',
  appearance: '👨',
  isAnomaly: false,
  dialogues: {
    greeting: 'Selamat malam Pak/Bu. Saya Yoga.',
    pengalaman: 'Saya pernah kerja di pabrik sparepart mobil selama lima tahun.',
    motivasi: 'Saya cari tempat kerja yang lebih stabil.',
    gaji: 'Ikut standar perusahaan saja.',
    diri: 'Saya cukup tahan kerja lama dan terbiasa lembur.'
  }
},

{
  id: 'A012',
  name: 'Nadia Permata',
  age: 22,
  position: 'Admin Online Shop',
  origin: 'Bekasi',
  education: 'SMK Multimedia (2022)',
  experience: '1 tahun admin marketplace',
  notes: 'Aktif menggunakan Excel dan Canva',
  cvPhoto: '👩',
  appearance: '👩',
  isAnomaly: false,
  dialogues: {
    greeting: 'Halo kak, saya Nadia.',
    pengalaman: 'Saya biasa urus pesanan Shopee dan Tokopedia.',
    motivasi: 'Saya ingin pengalaman kerja kantor langsung.',
    gaji: 'Yang penting lingkungan kerjanya nyaman.',
    diri: 'Saya cepat belajar walaupun kadang agak gugup.'
  }
},

{
  id: 'A013',
  name: 'Robby Kurniawan',
  age: 37,
  position: 'Supervisor Gudang',
  origin: 'Solo',
  education: 'D3 Logistik (2008)',
  experience: '12 tahun di distribusi barang retail',
  notes: 'Berpengalaman mengatur stok skala besar',
  cvPhoto: '🧑',
  appearance: '🧑',
  isAnomaly: false,
  dialogues: {
    greeting: 'Malam. Saya Robby.',
    pengalaman: 'Saya biasa handle gudang distribusi dan pengiriman antar kota.',
    motivasi: 'Saya ingin tempat kerja yang ritmenya lebih tenang.',
    gaji: 'Menyesuaikan tanggung jawab pekerjaannya.',
    diri: 'Saya lebih suka kerja teratur dan disiplin.'
  }
},

{
  id: 'A014',
  name: 'Tiara Anindita',
  age: 26,
  position: 'Desainer Grafis',
  origin: 'Bandung',
  education: 'S1 Desain Komunikasi Visual (2020)',
  experience: 'Freelance desain brand dan media sosial',
  notes: 'Menguasai Photoshop dan Illustrator',
  cvPhoto: '👩',
  appearance: '👩',
  isAnomaly: false,
  dialogues: {
    greeting: 'Selamat malam, saya Tiara.',
    pengalaman: 'Saya biasa bikin branding dan desain konten sosial media.',
    motivasi: 'Saya ingin kerja tim dibanding freelance terus.',
    gaji: 'Sekitar 6 jutaan mungkin.',
    diri: 'Saya suka detail kecil dan warna-warna gelap sebenarnya.'
  }
},

{
  id: 'A015',
  name: 'Farhan Akbar',
  age: 28,
  position: 'Teknisi CCTV',
  origin: 'Bogor',
  education: 'SMK Teknik Elektro (2015)',
  experience: '4 tahun instalasi CCTV dan jaringan',
  notes: 'Bersedia standby malam',
  cvPhoto: '👨',
  appearance: '👨',
  isAnomaly: false,
  dialogues: {
    greeting: 'Malam Pak/Bu. Saya Farhan.',
    pengalaman: 'Saya biasa pasang CCTV kantor dan maintenance jaringan kecil.',
    motivasi: 'Saya dengar perusahaan ini sering buka lowongan malam.',
    gaji: 'Standar teknisi lapangan saja.',
    diri: 'Saya lumayan terbiasa kerja sendirian di tempat sepi.'
  }
},

{
  id: 'A016',
  name: 'Lukman Hakim',
  age: 41,
  position: 'Office Boy',
  origin: 'Tasikmalaya',
  education: 'SMP Negeri 3 Tasikmalaya',
  experience: '15 tahun cleaning service gedung',
  notes: 'Rajin dan disiplin',
  cvPhoto: '👨',
  appearance: '👨',
  isAnomaly: false,
  dialogues: {
    greeting: 'Permisi Pak/Bu. Saya Lukman.',
    pengalaman: 'Saya biasa bersih-bersih kantor dan urus kebutuhan pegawai.',
    motivasi: 'Saya cuma ingin kerja yang tenang sampai tua.',
    gaji: 'Ikut aturan perusahaan saja.',
    diri: 'Saya biasa datang paling pagi dan pulang paling akhir.'
  }
},

{
  id: 'A017',
  name: 'Aurel Maharani',
  age: 24,
  position: 'Content Writer',
  origin: 'Depok',
  education: 'S1 Sastra Indonesia (2022)',
  experience: 'Freelance artikel dan copywriting',
  notes: 'Aktif menulis blog pribadi',
  cvPhoto: '👩',
  appearance: '👩',
  isAnomaly: false,
  dialogues: {
    greeting: 'Halo, saya Aurel.',
    pengalaman: 'Saya biasa menulis artikel SEO dan caption sosial media.',
    motivasi: 'Saya ingin kerja dengan jadwal lebih teratur.',
    gaji: 'Sekitar UMR juga tidak masalah.',
    diri: 'Saya suka suasana malam karena lebih tenang untuk berpikir.'
  }
},

{
  id: 'A018',
  name: 'Dimas Prabowo',
  age: 32,
  position: 'Driver Operasional',
  origin: 'Tangerang',
  education: 'SMA Negeri 8 Tangerang (2010)',
  experience: '8 tahun driver perusahaan',
  notes: 'Memiliki SIM B1 aktif',
  cvPhoto: '👨',
  appearance: '👨',
  isAnomaly: false,
  dialogues: {
    greeting: 'Selamat malam. Saya Dimas.',
    pengalaman: 'Saya biasa antar barang dan pegawai antar cabang.',
    motivasi: 'Jam kerja di tempat lama terlalu tidak jelas.',
    gaji: 'Yang penting cukup untuk keluarga.',
    diri: 'Saya hafal jalan Jakarta bahkan malam-malam.'
  }
}
];

// Will be extended in Phase 3 with random generation