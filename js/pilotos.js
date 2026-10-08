/**
 * Grupo Pronoeo, S.A. - Portal de Pilotos y Reclutamiento
 * Document: js/pilotos.js
 * Description: Ambient background video crossfader and pilot form serialization.
 */

document.addEventListener('DOMContentLoaded', () => {
  /* ==========================================================================
     1. Ambient Background Video Playlist (Seamless Crossfade)
     ========================================================================== */

  // Video durations tailored to actual clip lengths so transitions occur seamlessly
  // before any video ends, avoiding loop black frames or jarring restarts:
  // - truck-valley-bridge: ~20.1s total -> display for 13.5s
  // - truck-highway-nature: ~9.17s total -> display for 7.6s (transitions before 9.17s)
  // - highway-truck-hd: ~15.0s total -> display for 12.0s
  const playlist = [
    { src: './video/truck-valley-bridge.mp4', durationMs: 13500 },
    { src: './video/truck-highway-nature.mp4', durationMs: 7600 },
    { src: './video/highway-truck-hd.mp4', durationMs: 12000 }
  ];

  let currentIndex = 0;
  let switchTimer = null;

  const videoA = document.getElementById('portal-video-a');
  const videoB = document.getElementById('portal-video-b');

  let activeVideoEl = videoA;
  let inactiveVideoEl = videoB;

  function scheduleNextSwitch() {
    if (switchTimer) clearTimeout(switchTimer);
    const currentItem = playlist[currentIndex];
    const delay = currentItem ? currentItem.durationMs : 10000;
    switchTimer = setTimeout(switchVideo, delay);
  }

  function switchVideo() {
    if (!videoA || !videoB) return;

    currentIndex = (currentIndex + 1) % playlist.length;
    const nextItem = playlist[currentIndex];

    // Prepare inactive video element with new source
    inactiveVideoEl.src = nextItem.src;
    inactiveVideoEl.load();

    const playPromise = inactiveVideoEl.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Crossfade: activate incoming video, deactivate current
          inactiveVideoEl.classList.add('is-active');
          activeVideoEl.classList.remove('is-active');

          // Pause previous video once fully faded out (after CSS 1.4s transition)
          const prevVideo = activeVideoEl;
          setTimeout(() => {
            if (!prevVideo.classList.contains('is-active')) {
              prevVideo.pause();
            }
          }, 1500);

          // Swap references
          const temp = activeVideoEl;
          activeVideoEl = inactiveVideoEl;
          inactiveVideoEl = temp;

          // Schedule next transition based on new video's duration
          scheduleNextSwitch();
        })
        .catch(() => {
          // Handle autoplay limitations silently and reschedule
          scheduleNextSwitch();
        });
    } else {
      scheduleNextSwitch();
    }
  }

  // Start timer for the initial video
  scheduleNextSwitch();

  /* ==========================================================================
     2. Pilot Application Form & WhatsApp Serialization
     ========================================================================== */

  const pilotForm = document.getElementById('pilot-portal-form');
  const btnDirectWA = document.getElementById('btn-pilot-direct-wa');
  const pilotFeedback = document.getElementById('pilot-portal-feedback');

  function buildPilotMessage() {
    const name = document.getElementById('portal-name')?.value.trim() || '';
    const phone = document.getElementById('portal-phone')?.value.trim() || '';
    const license = document.getElementById('portal-license')?.value || '';
    const experience = document.getElementById('portal-experience')?.value || '';
    const borders = document.getElementById('portal-borders')?.value || '';
    const city = document.getElementById('portal-city')?.value.trim() || '';

    let text = `👨‍✈️ *Postulación de Piloto - Grupo Pronoeo*\n\n`;
    if (name) text += `• *Nombre:* ${name}\n`;
    if (phone) text += `• *Teléfono/WhatsApp:* ${phone}\n`;
    if (license) text += `• *Licencia:* ${license}\n`;
    if (experience) text += `• *Experiencia en cabezal:* ${experience}\n`;
    if (borders) text += `• *Fronteras/Aduanas:* ${borders}\n`;
    if (city) text += `• *Residencia:* ${city}\n`;
    text += `\n_Hola, deseo aplicar a la convocatoria de pilotos de transporte pesado internacional en Grupo Pronoeo._`;

    return text;
  }

  if (pilotForm) {
    pilotForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const msg = buildPilotMessage();
      const waUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;

      if (pilotFeedback) {
        pilotFeedback.style.display = 'block';
        pilotFeedback.className = 'quote-feedback is-success';
        pilotFeedback.innerHTML = `
          <strong>¡Postulación registrada!</strong><br>
          Tus datos fueron guardados con éxito. Presiona el botón para enviarlos directamente por WhatsApp al departamento de Recursos Humanos:<br><br>
          <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn-portal-wa" style="padding: 0.75rem 1.4rem; font-size: 0.92rem; text-decoration: none;">
            Enviar postulación por WhatsApp
          </a>
        `;
        pilotFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }

  if (btnDirectWA) {
    btnDirectWA.addEventListener('click', () => {
      const msg = buildPilotMessage();
      const waUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    });
  }
});
