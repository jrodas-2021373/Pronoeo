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

  // Smooth initial entry: activate videoA as soon as it begins rendering frames,
  // creating a graceful fade-in from the corporate navy canvas with zero image pop.
  if (videoA) {
    const activateInitial = () => {
      if (!videoA.classList.contains('is-active')) {
        videoA.classList.add('is-active');
      }
    };

    if (videoA.readyState >= 3 && !videoA.paused) {
      activateInitial();
    } else {
      videoA.addEventListener('playing', activateInitial, { once: true });
      videoA.addEventListener('loadeddata', activateInitial, { once: true });
      setTimeout(activateInitial, 300);
    }

    const initialPlay = videoA.play();
    if (initialPlay !== undefined) {
      initialPlay.catch(() => {
        activateInitial();
      });
    }
  }

  // Start timer for the initial video
  scheduleNextSwitch();

  /* ==========================================================================
     2. Dual Role Selection (Pilotos de Cabezal & Mecánicos Diésel)
     ========================================================================== */

  const roleTabBtns = document.querySelectorAll('[data-role-tab]');
  const panelPilot = document.getElementById('panel-role-pilot');
  const panelMechanic = document.getElementById('panel-role-mechanic');
  const heroRoleBtns = document.querySelectorAll('[data-hero-role]');

  const positionRadios = document.querySelectorAll('input[name="applied_position"]');
  const fieldsPilot = document.getElementById('fields-pilot');
  const fieldsMechanic = document.getElementById('fields-mechanic');
  const btnPortalWaText = document.getElementById('btn-portal-wa-text');

  // Input elements for toggling required attributes
  const pilotRequiredInputs = [
    document.getElementById('portal-license'),
    document.getElementById('portal-experience'),
    document.getElementById('portal-borders')
  ];

  const mechanicRequiredInputs = [
    document.getElementById('portal-mechanic-specialty'),
    document.getElementById('portal-mechanic-exp'),
    document.getElementById('portal-mechanic-tools')
  ];

  function getActiveRole() {
    const checked = document.querySelector('input[name="applied_position"]:checked');
    return checked ? checked.value : 'pilot';
  }

  function syncRoleTabs(role) {
    roleTabBtns.forEach((btn) => {
      const isTarget = btn.getAttribute('data-role-tab') === role;
      btn.classList.toggle('is-active', isTarget);
      btn.setAttribute('aria-selected', isTarget ? 'true' : 'false');
    });

    if (panelPilot && panelMechanic) {
      if (role === 'pilot') {
        panelPilot.classList.add('is-active');
        panelMechanic.classList.remove('is-active');
      } else {
        panelPilot.classList.remove('is-active');
        panelMechanic.classList.add('is-active');
      }
    }
  }

  function setRole(role) {
    // 1. Sync radio buttons
    positionRadios.forEach((radio) => {
      radio.checked = radio.value === role;
    });

    // 2. Toggle form field containers & required validations
    if (role === 'pilot') {
      if (fieldsPilot) fieldsPilot.style.display = 'flex';
      if (fieldsMechanic) fieldsMechanic.style.display = 'none';

      pilotRequiredInputs.forEach((input) => {
        if (input) input.required = true;
      });
      mechanicRequiredInputs.forEach((input) => {
        if (input) input.required = false;
      });

      if (btnPortalWaText) {
        btnPortalWaText.textContent = 'Aplicar directo como Piloto por WhatsApp';
      }
    } else {
      if (fieldsPilot) fieldsPilot.style.display = 'none';
      if (fieldsMechanic) fieldsMechanic.style.display = 'flex';

      pilotRequiredInputs.forEach((input) => {
        if (input) input.required = false;
      });
      mechanicRequiredInputs.forEach((input) => {
        if (input) input.required = true;
      });

      if (btnPortalWaText) {
        btnPortalWaText.textContent = 'Aplicar directo como Mecánico por WhatsApp';
      }
    }

    // 3. Keep section 3.2 tabs in sync
    syncRoleTabs(role);
  }

  // Event listener for Requirements/Perks tab switcher
  roleTabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const role = btn.getAttribute('data-role-tab') || 'pilot';
      setRole(role);
    });
  });

  // Event listener for Form radio buttons
  positionRadios.forEach((radio) => {
    radio.addEventListener('change', (e) => {
      if (e.target.checked) {
        setRole(e.target.value);
      }
    });
  });

  // Event listener for Hero CTAs (Scroll & Switch)
  heroRoleBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const role = btn.getAttribute('data-hero-role') || 'pilot';
      setRole(role);
    });
  });

  // Initialize initial role state
  setRole('pilot');

  /* ==========================================================================
     3. Recruitment Form Dispatcher & WhatsApp Generator
     ========================================================================== */

  const pilotForm = document.getElementById('pilot-portal-form');
  const btnDirectWA = document.getElementById('btn-pilot-direct-wa');
  const pilotFeedback = document.getElementById('pilot-portal-feedback');

  function buildPilotMessage(folio = '') {
    const name = document.getElementById('portal-name')?.value.trim() || '';
    const phone = document.getElementById('portal-phone')?.value.trim() || '';
    const license = document.getElementById('portal-license')?.value || '';
    const experience = document.getElementById('portal-experience')?.value || '';
    const borders = document.getElementById('portal-borders')?.value || '';
    const city = document.getElementById('portal-city')?.value.trim() || '';

    let text = `👨‍✈️ *Postulación: Piloto de Cabezal - Grupo Pronoeo*\n`;
    if (folio) text += `🔖 *Folio:* ${folio}\n\n`;
    else text += `\n`;

    if (name) text += `• *Nombre:* ${name}\n`;
    if (phone) text += `• *Teléfono/WhatsApp:* ${phone}\n`;
    if (license) text += `• *Licencia:* ${license}\n`;
    if (experience) text += `• *Experiencia en cabezal:* ${experience}\n`;
    if (borders) text += `• *Fronteras/Aduanas:* ${borders}\n`;
    if (city) text += `• *Residencia:* ${city}\n`;
    text += `\n_Hola, deseo aplicar a la convocatoria de pilotos de transporte pesado internacional en Grupo Pronoeo._`;

    return text;
  }

  function buildMechanicMessage(folio = '') {
    const name = document.getElementById('portal-name')?.value.trim() || '';
    const phone = document.getElementById('portal-phone')?.value.trim() || '';
    const specialty = document.getElementById('portal-mechanic-specialty')?.value || '';
    const experience = document.getElementById('portal-mechanic-exp')?.value || '';
    const tools = document.getElementById('portal-mechanic-tools')?.value || '';
    const city = document.getElementById('portal-city')?.value.trim() || '';

    let text = `🔧 *Postulación: Mecánico Diésel de Flota - Grupo Pronoeo*\n`;
    if (folio) text += `🔖 *Folio:* ${folio}\n\n`;
    else text += `\n`;

    if (name) text += `• *Nombre:* ${name}\n`;
    if (phone) text += `• *Teléfono/WhatsApp:* ${phone}\n`;
    if (specialty) text += `• *Especialidad técnica:* ${specialty}\n`;
    if (experience) text += `• *Experiencia en taller pesado:* ${experience}\n`;
    if (tools) text += `• *Herramienta propia:* ${tools}\n`;
    if (city) text += `• *Residencia:* ${city}\n`;
    text += `\n_Hola, deseo aplicar a la convocatoria para mecánico diésel de flota pesada en Grupo Pronoeo._`;

    return text;
  }

  function buildRecruitmentMessage(role, folio = '') {
    return role === 'mechanic' ? buildMechanicMessage(folio) : buildPilotMessage(folio);
  }

  if (pilotForm) {
    pilotForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const role = getActiveRole();
      const isMechanic = role === 'mechanic';
      const name = document.getElementById('portal-name')?.value.trim() || '';
      const phone = document.getElementById('portal-phone')?.value.trim() || '';
      const city = document.getElementById('portal-city')?.value.trim() || '';

      const folioPrefix = isMechanic ? 'MEC' : 'PIL';
      const folio = window.PronoeoUtils?.generateFolio(folioPrefix) || `#${folioPrefix}-26-${Math.floor(1000 + Math.random() * 9000)}`;
      const msg = buildRecruitmentMessage(role, folio);
      const waUrl = window.PronoeoUtils?.buildWhatsAppUrl('recruitment', msg) || `https://wa.me/?text=${encodeURIComponent(msg)}`;

      let leadData = {
        folio,
        role: isMechanic ? 'Mecánico Diésel de Flota' : 'Piloto de Cabezal',
        applied_position: role,
        name,
        phone,
        city
      };

      if (isMechanic) {
        const specialty = document.getElementById('portal-mechanic-specialty')?.value || '';
        const experience = document.getElementById('portal-mechanic-exp')?.value || '';
        const tools = document.getElementById('portal-mechanic-tools')?.value || '';
        leadData = {
          ...leadData,
          specialty,
          experience,
          tools
        };
      } else {
        const license = document.getElementById('portal-license')?.value || '';
        const experience = document.getElementById('portal-experience')?.value || '';
        const borders = document.getElementById('portal-borders')?.value || '';
        leadData = {
          ...leadData,
          license,
          experience,
          borders
        };
      }

      // Guardado local de protección
      window.PronoeoUtils?.saveLeadLocally('pronoeo_recruitment_applications', leadData);
      if (!isMechanic) {
        window.PronoeoUtils?.saveLeadLocally('pronoeo_pilot_applications', leadData);
      }

      // Track conversion event in Google Analytics 4 (if configured)
      const eventName = isMechanic ? 'mechanic_application' : 'pilot_application';
      window.PronoeoUtils?.trackEvent(eventName, {
        event_category: 'Reclutamiento',
        role,
        folio
      });

      const submitBtn = pilotForm.querySelector('.btn-portal-submit');
      const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Registrando postulación...</span>`;
      }

      const endpoint = window.PRONOEO_CONFIG?.recruitmentEmailEndpoint;
      const roleTitle = isMechanic ? 'Mecánico Diésel' : 'Piloto de Cabezal';

      if (endpoint && endpoint.startsWith('http')) {
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(leadData)
          });

          if (res.ok) {
            if (pilotFeedback) {
              pilotFeedback.className = 'quote-feedback is-success';
              pilotFeedback.style.display = 'block';
              pilotFeedback.innerHTML = `
                <div class="feedback-badge">✅ Folio de Postulación (${roleTitle}): <strong>${folio}</strong></div>
                <h4 style="margin: 4px 0 6px; color: #a7f3d0; font-size: 0.98rem;">¡Expediente enviado a Recursos Humanos!</h4>
                <p style="margin: 0 0 10px; color: #e2e8f0; font-size: 0.88rem;">
                  Tus datos han sido registrados en nuestro sistema de selección. Para coordinar tu entrevista técnica de inmediato, envía tu confirmación por WhatsApp a RRHH:
                </p>
                <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn-portal-wa" style="padding: 0.72rem 1.4rem; font-size: 0.90rem; text-decoration: none; display: inline-flex;">
                  Contactar a Selección por WhatsApp
                </a>
              `;
              pilotFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
            pilotForm.reset();
            setRole(role);
          } else {
            throw new Error('Servidor retornó código ' + res.status);
          }
        } catch (err) {
          console.warn('[Pronoeo Recruitment Form]', err);
          if (pilotFeedback) {
            pilotFeedback.className = 'quote-feedback is-warning';
            pilotFeedback.style.display = 'block';
            pilotFeedback.innerHTML = `
              <div class="feedback-badge" style="background: rgba(245, 158, 11, 0.25); color: #fef08a;">📋 Folio Registrado (${roleTitle}): <strong>${folio}</strong></div>
              <h4 style="margin: 4px 0 6px; color: #fef08a; font-size: 0.98rem;">Postulación guardada localmente</h4>
              <p style="margin: 0 0 10px; color: #e2e8f0; font-size: 0.88rem;">
                Tus datos fueron verificados. Envía tu postulación directamente a Recursos Humanos por WhatsApp para agilizar tu ingreso:
              </p>
              <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn-portal-wa" style="padding: 0.72rem 1.4rem; font-size: 0.90rem; text-decoration: none; display: inline-flex;">
                Enviar postulación por WhatsApp
              </a>
            `;
            pilotFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHtml;
          }
        }
      } else {
        setTimeout(() => {
          if (pilotFeedback) {
            pilotFeedback.className = 'quote-feedback is-success';
            pilotFeedback.style.display = 'block';
            pilotFeedback.innerHTML = `
              <div class="feedback-badge">📋 Folio de Postulación (${roleTitle}): <strong>${folio}</strong></div>
              <h4 style="margin: 4px 0 6px; color: #a7f3d0; font-size: 0.98rem;">¡Postulación registrada con éxito!</h4>
              <p style="margin: 0 0 10px; color: #e2e8f0; font-size: 0.88rem;">
                Tus datos para la vacante de <em>${roleTitle}</em> han sido guardados. Presiona el botón para enviarlos directamente por WhatsApp a Recursos Humanos:
              </p>
              <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn-portal-wa" style="padding: 0.75rem 1.4rem; font-size: 0.92rem; text-decoration: none; display: inline-flex;">
                Enviar postulación por WhatsApp a RRHH
              </a>
            `;
            pilotFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHtml;
          }
        }, 350);
      }
    });
  }

  if (btnDirectWA) {
    btnDirectWA.addEventListener('click', () => {
      const role = getActiveRole();
      const isMechanic = role === 'mechanic';
      const folioPrefix = isMechanic ? 'MEC' : 'PIL';
      const folio = window.PronoeoUtils?.generateFolio(folioPrefix) || '';
      const msg = buildRecruitmentMessage(role, folio);
      const waUrl = window.PronoeoUtils?.buildWhatsAppUrl('recruitment', msg) || `https://wa.me/?text=${encodeURIComponent(msg)}`;
      window.PronoeoUtils?.trackEvent('contact_whatsapp_recruitment', {
        event_category: 'WhatsApp_RRHH',
        role,
        folio
      });
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    });
  }

  /* ==========================================================================
     3. Pilot Portal Privacy Modal Handlers
     ========================================================================== */

  const portalPrivacyModal = document.getElementById('portal-privacy-modal');
  const btnPortalOpenPrivacy = document.getElementById('btn-portal-open-privacy');
  const footerPortalPrivacyBtn = document.getElementById('footer-portal-privacy-btn');
  const portalPrivacyClose = document.getElementById('portal-privacy-close');
  const btnPortalPrivacyAccept = document.getElementById('btn-portal-privacy-accept');

  function openPortalPrivacy() {
    if (!portalPrivacyModal) return;
    portalPrivacyModal.classList.add('is-open');
    portalPrivacyModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    portalPrivacyClose?.focus();
  }

  function closePortalPrivacy() {
    if (!portalPrivacyModal) return;
    portalPrivacyModal.classList.remove('is-open');
    portalPrivacyModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (btnPortalOpenPrivacy) {
    btnPortalOpenPrivacy.addEventListener('click', (e) => {
      e.preventDefault();
      openPortalPrivacy();
    });
  }

  if (footerPortalPrivacyBtn) {
    footerPortalPrivacyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openPortalPrivacy();
    });
  }

  if (portalPrivacyClose) {
    portalPrivacyClose.addEventListener('click', closePortalPrivacy);
  }

  if (btnPortalPrivacyAccept) {
    btnPortalPrivacyAccept.addEventListener('click', closePortalPrivacy);
  }

  if (portalPrivacyModal) {
    portalPrivacyModal.addEventListener('click', (e) => {
      if (e.target === portalPrivacyModal) {
        closePortalPrivacy();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && portalPrivacyModal?.classList.contains('is-open')) {
      closePortalPrivacy();
    }
  });
});
