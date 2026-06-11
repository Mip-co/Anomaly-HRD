# Anomaly HRD

**Anomaly HRD** adalah game web psychological horror berbasis HTML, CSS, dan JavaScript vanilla. Pemain berperan sebagai staf HRD shift malam yang harus mewawancarai pelamar, membaca CV, menemukan kejanggalan, dan memutuskan siapa yang layak diterima atau ditolak.

> **Catatan konten:** game ini mengandung efek horror, flashing lights, glitch/VHS, jumpscare, dan suasana disturbing.

## Fitur Utama

- **Gameplay interview HRD**: baca CV, tanya pelamar, lalu pilih `TERIMA` atau `TOLAK`.
- **Sistem anomaly**: pelamar bisa memiliki kejanggalan visual, dialog, data CV, atau perilaku.
- **Applicant procedural generator**: kandidat dibuat dari pool nama, posisi, asal, pendidikan, pengalaman, dan dialog.
- **Difficulty mode**: `NORMAL` berisi 10 applicant, sedangkan `HARD` berisi 20 applicant.
- **Atmosfer horror progresif**: ruangan berubah semakin buruk ketika pemain melakukan kesalahan.
- **Escape mechanic**: setelah kondisi tertentu, pemain bisa mencoba pergi lewat pintu atau tombol `Escape`.
- **Multiple endings**: hasil akhir dipengaruhi oleh akurasi keputusan, nyawa, secret applicant, dan pilihan escape.
- **Local save**: progress dan ending archive disimpan di `localStorage` browser.

## Cara Menjalankan

Project ini adalah static web game, jadi tidak membutuhkan proses build.

### Opsi 1 — Buka langsung

Buka file berikut di browser:

```text
index.html
```

### Opsi 2 — Jalankan lewat static server

Disarankan memakai static server agar perilaku asset/audio lebih konsisten.

Contoh dengan Python:

```bash
python3 -m http.server 8000
```

Lalu buka:

```text
http://localhost:8000
```

## Kontrol Dasar

| Aksi | Kontrol |
| --- | --- |
| Mulai dari title screen | Tekan tombol apa pun atau klik layar |
| Pilih pertanyaan | Klik tombol pertanyaan |
| Ambil keputusan | Klik `TERIMA` atau `TOLAK` |
| Coba pergi setelah escape terbuka | Tekan `Escape` atau klik area pintu |
| Fullscreen | Tombol fullscreen di HUD atau shortcut yang disediakan game |

## Struktur Project

```text
.
├── assets/
│   ├── backgrounds/      # Background kantor berdasarkan kondisi ruangan
│   ├── characters/       # Sprite applicant, anomaly, dan jumpscare
│   ├── custscene/        # Gambar cinematic intro/cutscene
│   ├── sounds/           # Audio ambience dan efek suara
│   └── ui/               # Asset UI seperti thumbnail CV
├── data/
│   ├── anomalies-data.js # Definisi tipe anomaly dan scheduler anomaly
│   ├── applicants-data.js # Pool data kandidat dan secret applicant
│   ├── assets-data.js    # Manifest path asset image/sprite
│   └── dialogue-data.js  # Teks sistem, email boss, pertanyaan, horror event
├── scripts/
│   ├── anomalies.js      # Evaluasi keputusan terhadap anomaly
│   ├── applicants.js     # Render applicant dan CV
│   ├── audio.js          # Audio manager dan sound effect
│   ├── dialogue.js       # Sistem dialog/typewriter
│   ├── effects.js        # Efek visual, glitch, horror sequence
│   ├── endings.js        # Rendering dan unlock ending
│   ├── game.js           # State utama dan gameplay loop
│   ├── generator.js      # Generator procedural applicant queue
│   ├── intro.js          # Cinematic intro
│   ├── polish.js         # Animasi polish UI kecil
│   ├── room.js           # State ruangan, rain, lightning, door hotspot
│   ├── save-system.js    # Save/load berbasis localStorage
│   └── utils.js          # Helper DOM, random, time, sleep, screen switch
├── styles/
│   ├── base.css          # Variable, reset, dan screen system
│   ├── dialogue.css      # Styling dialog dan question panel
│   ├── effects.css       # Styling efek horror/CRT/glitch
│   ├── office.css        # Layout kantor dan environment
│   └── ui.css            # Styling title, HUD, CV, laptop, tombol
└── index.html            # Entry point utama game
```

## Alur Loading File

Urutan script di `index.html` penting karena project ini memakai global object, bukan module bundler.

Secara garis besar:

1. File data dimuat lebih dulu dari folder `data/`.
2. Helper dan sistem pendukung dimuat dari folder `scripts/`.
3. `scripts/game.js` dimuat paling akhir sebagai orchestrator utama.

Jika menambah file baru, pastikan file tersebut dimuat sebelum file lain yang membutuhkannya.

## Cara Menambah Konten

### Menambah applicant normal

Ubah pool di:

```text
data/applicants-data.js
```

Yang bisa ditambah antara lain:

- nama depan/laki-laki/perempuan,
- nama belakang,
- posisi,
- asal kota,
- universitas,
- jurusan,
- perusahaan lama,
- template pengalaman,
- catatan CV,
- template dialog.

### Menambah anomaly baru

Tambahkan definisi anomaly di:

```text
data/anomalies-data.js
```

Minimal anomaly baru sebaiknya punya:

- `id`,
- `name`,
- `difficulty`,
- `description`,
- fungsi `apply(applicant)` yang mengubah data applicant.

Setelah itu, masukkan `id` anomaly ke pool scheduler sesuai tingkat kesulitan.

### Menambah asset karakter atau gambar

1. Simpan file ke folder yang sesuai di `assets/`.
2. Tambahkan path-nya ke manifest:

```text
data/assets-data.js
```

3. Jika asset perlu dipreload dari awal, tambahkan juga preload di `index.html`.

## Sistem Gameplay Singkat

1. Player masuk dari title screen.
2. Player memilih difficulty.
3. Game menjalankan cinematic atau intro email.
4. Applicant queue dibuat secara procedural.
5. Setiap applicant masuk dengan CV dan dialog.
6. Player harus mencari kejanggalan dari CV, visual, dan jawaban interview.
7. Keputusan benar/salah memengaruhi statistik, nyawa, room state, horror event, dan ending.

## Data Save

Game menyimpan progress menggunakan `localStorage` dengan key internal:

```text
anomaly_hrd_save_v1
```

Untuk reset progress selama development, hapus data site dari browser atau jalankan di DevTools console:

```js
localStorage.removeItem('anomaly_hrd_save_v1')
```

## Checklist Sebelum Publish

- Pastikan tidak ada error di browser console.
- Pastikan semua gambar di `assets/` muncul dengan benar.
- Pastikan audio bisa berjalan setelah interaksi pertama player.
- Test minimal satu run `NORMAL` dan satu run `HARD`.
- Test keputusan benar dan salah.
- Test save/continue/endings archive.
- Test tampilan di resolusi desktop dan mobile.
- Kompres asset besar jika loading terasa lambat.

## Catatan Development

- Project ini belum memakai bundler atau dependency manager.
- Hindari mengubah urutan script di `index.html` tanpa mengecek dependency.
- Untuk perubahan gameplay besar, mulai dari `scripts/game.js`.
- Untuk perubahan anomaly, mulai dari `data/anomalies-data.js` dan `scripts/anomalies.js`.
- Untuk perubahan tampilan kantor, mulai dari `styles/office.css` dan asset background.
- Untuk perubahan UI/HUD/CV/laptop, mulai dari `styles/ui.css` dan markup di `index.html`.

## Kredit

Developed by **AhmadYeager**.
