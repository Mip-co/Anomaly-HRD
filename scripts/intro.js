/* ============================================
   SCRIPTS/INTRO.JS — Intro cinematic slideshow system
   Anomaly HRD
   ============================================ */

const INTRO_SCENES = [
  {
    image: 'assets/custscene/phk_office.png',
    text: [
      'Nilai rupiah terus melemah.',
      'Akhirnya kantor tempatku bekerja mulai melakukan pengurangan karyawan.',
      'Namaku ada di daftar itu.'
    ],
    duration: 5000
  },
  {
    image: 'assets/custscene/kos_room.png',
    text: [
      'Sudah tiga bulan aku menganggur.',
      'Tabungan mulai habis.',
      'Aku terpaksa pindah ke pinggiran kota yang lebih murah.'
    ],
    duration: 5000
  },
  {
    image: 'assets/custscene/job_posting.png',
    text: [
      'Malam itu aku menemukan lowongan aneh.',
      'HRD malam.',
      'Gajinya jauh lebih besar dari pekerjaan sebelumnya.'
    ],
    duration: 5000
  },
  {
    image: 'assets/custscene/night_bus.png',
    text: [
      'Aku berangkat malam itu juga.',
      'Kota tujuan terasa asing.',
      'Aku bahkan belum pernah mendengar nama perusahaannya sebelumnya.'
    ],
    duration: 5000
  },
  {
    image: 'assets/custscene/company_building.png',
    text: [
      'Gedungnya berdiri sendirian di tengah hujan.',
      'Hanya beberapa lantai yang masih menyala.',
      'Tapi mereka bilang wawancara dimulai jam 11 malam.'
    ],
    duration: 5000
  },
  {
    image: 'assets/custscene/director_email.png',
    text: [
      'Begitu masuk ruang HRD...',
      '...aku menemukan email ini.'
    ],
    duration: 4000
  },
  {
    image: 'assets/custscene/director_email.png',
    text: [
      '“JANGAN BIARKAN ORANG ANEH MASUK.”'
    ],
    duration: 4500
  },
  {
    image: '',
    text: [
      'Malam pertamaku dimulai.'
    ],
    duration: 3000
  }
];

const IntroSystem = (() => {
  let callbackOnFinish = null;
  let currentIndex = 0;
  let timeoutId = null;
  let active = false;
  let skipHandler = null;
  let currentTypingCancel = null;
  let currentTypingResolve = null;
  let imageCache = {};

  const preload = () => {
    const loads = INTRO_SCENES.map(scene => new Promise(resolve => {
      if (!scene.image) {
        resolve();
        return;
      }
      const img = new Image();
      img.src = scene.image;
      img.onload = () => {
        imageCache[scene.image] = img;
        resolve();
      };
      img.onerror = () => {
        console.warn('Intro image preload failed:', scene.image);
        resolve();
      };
    }));
    return Promise.all(loads);
  };

  const init = () => {
    const skipLabel = Utils.el('intro-skip');
    if (skipLabel) {
      skipLabel.textContent = '[ SPACE / ENTER ] Lewati intro';
    }
  };

  const start = (onFinish) => {
    callbackOnFinish = onFinish;
    currentIndex = 0;
    active = true;
    bindSkip();
    renderScene(currentIndex);
    AudioManager.startAmbience();
  };

  const bindSkip = () => {
    if (skipHandler) return;
    skipHandler = (e) => {
      if (!active) return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        skip();
      }
    };
    document.addEventListener('keydown', skipHandler);

    const skipButton = Utils.el('intro-skip');
    if (skipButton) {
      skipButton.addEventListener('click', skip);
    }
  };

  const unbindSkip = () => {
    if (skipHandler) {
      document.removeEventListener('keydown', skipHandler);
      skipHandler = null;
    }
  };

  const skip = async () => {
    if (!active) return;
    active = false;
    clearTimeout(timeoutId);
    if (currentTypingCancel) {
      currentTypingCancel();
      currentTypingCancel = null;
    }
    if (currentTypingResolve) {
      currentTypingResolve();
      currentTypingResolve = null;
    }
    await end();
  };

  const renderScene = async (index) => {
    const scene = INTRO_SCENES[index];
    if (!scene) {
      await end();
      return;
    }

    const screen = Utils.el('screen-cinematic');
    const image = Utils.el('intro-image');
    const lines = Utils.el('intro-lines');
    const caption = Utils.el('intro-caption');

    if (!screen || !image || !lines || !caption) {
      await end();
      return;
    }

    screen.style.display = 'flex';
    requestAnimationFrame(() => screen.classList.add('active'));

    if (scene.image) {
      image.style.backgroundImage = `url('${scene.image}')`;
      image.style.backgroundColor = '';
    } else {
      image.style.backgroundImage = 'none';
      image.style.backgroundColor = '#000';
    }
    image.classList.remove('scene-fade-out');
    image.classList.add('scene-fade-in');

    caption.classList.remove('text-fade-out');
    caption.classList.add('text-fade-in');

    lines.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'intro-text-lines';
    lines.appendChild(wrapper);

    for (const line of scene.text) {
      if (!active) return;
      const p = document.createElement('p');
      p.className = 'scene-text-line';
      wrapper.appendChild(p);
      await new Promise(resolve => {
        currentTypingResolve = resolve;
        currentTypingCancel = Utils.typewrite(p, line, 30, () => {
          currentTypingCancel = null;
          currentTypingResolve = null;
          resolve();
        });
      });
      if (!active) return;
      await Utils.sleep(140);
    }

    if (!active) return;
    timeoutId = window.setTimeout(() => {
      if (!active) return;
      fadeCurrentScene(() => nextScene());
    }, scene.duration);
  };

  const fadeCurrentScene = (callback) => {
    const image = Utils.el('intro-image');
    const caption = Utils.el('intro-caption');
    if (image) {
      image.classList.remove('scene-fade-in');
      image.classList.add('scene-fade-out');
    }
    if (caption) {
      caption.classList.remove('text-fade-in');
      caption.classList.add('text-fade-out');
    }
    setTimeout(callback, 700);
  };

  const nextScene = () => {
    currentIndex += 1;
    if (currentIndex >= INTRO_SCENES.length) {
      end();
      return;
    }
    renderScene(currentIndex);
  };

  const end = async () => {
    active = false;
    unbindSkip();
    clearTimeout(timeoutId);
    if (currentTypingCancel) {
      currentTypingCancel();
      currentTypingCancel = null;
    }
    if (currentTypingResolve) {
      currentTypingResolve();
      currentTypingResolve = null;
    }

    const screen = Utils.el('screen-cinematic');
    if (screen) {
      screen.classList.remove('active');
      screen.classList.add('fade-out');
      setTimeout(() => {
        screen.style.display = 'none';
        screen.classList.remove('fade-out');
      }, 400);
    }

    if (callbackOnFinish) {
      const cb = callbackOnFinish;
      callbackOnFinish = null;
      cb();
    }
  };

  return {
    preload,
    init,
    start,
    skip
  };
})();

window.IntroSystem = IntroSystem;
