/**
 * Grupo Pronoeo - Client-side scripts
 * Handles mobile navigation, scroll reveal, quote form serialization to WhatsApp,
 * fleet filtering, and contact modal.
 */

/* ==========================================================================
   1. Mobile Navigation & Drawer Menu
   ========================================================================== */

// Mobile menu toggle button and navigation drawer
const menuToggle = document.querySelector('.menu-toggle');
const navPanel = document.querySelector('.nav-panel');

if (menuToggle && navPanel) {
  // Toggle navigation drawer on click
  menuToggle.addEventListener('click', () => {
    const isOpen = navPanel.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close drawer when clicking a navigation link
  navPanel.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navPanel.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Close drawer when clicking outside
  document.addEventListener('click', (e) => {
    if (
      navPanel.classList.contains('is-open') &&
      !navPanel.contains(e.target) &&
      !menuToggle.contains(e.target)
    ) {
      navPanel.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ==========================================================================
   2. Scroll Reveal Animations (Intersection Observer)
   ========================================================================== */

// Reveal elements as they enter the viewport
const revealElements = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 }
);

revealElements.forEach((element) => observer.observe(element));

/* ==========================================================================
   3. Quote Form & Automated Quote Dispatcher
   ========================================================================== */

// Quote form elements
const quoteForm = document.getElementById('quote-form');
const btnQuoteWhatsApp = document.getElementById('btn-quote-whatsapp');
const quoteFeedback = document.getElementById('quote-feedback');

/**
 * Builds formatted text message from quote form inputs with optional tracking folio.
 *
 * @param {string} folio Optional unique tracking folio.
 * @returns {string} Formatted text message for WhatsApp.
 */
function buildQuoteMessage(folio = '') {
  const name = document.getElementById('quote-name')?.value.trim() || '';
  const phone = document.getElementById('quote-phone')?.value.trim() || '';
  const email = document.getElementById('quote-email')?.value.trim() || '';
  const service = document.getElementById('quote-service')?.value || '';
  const route = document.getElementById('quote-route')?.value.trim() || '';
  const message = document.getElementById('quote-message')?.value.trim() || '';

  let text = `🚛 *Solicitud de Cotización - Grupo Pronoeo*\n`;
  if (folio) text += `🔖 *Folio:* ${folio}\n\n`;
  else text += `\n`;

  if (name) text += `• *Nombre / Empresa:* ${name}\n`;
  if (phone) text += `• *Teléfono:* ${phone}\n`;
  if (email) text += `• *Correo:* ${email}\n`;
  if (service) text += `• *Unidad / Servicio:* ${service}\n`;
  if (route) text += `• *Ruta solicitada:* ${route}\n`;
  if (message) text += `• *Detalles:* ${message}\n`;
  text += `\n_Hola, solicito cotización y propuesta logística para el requerimiento indicado arriba._`;

  return text;
}

if (quoteForm) {
  // Handle form submission: supports both automated email endpoint and WhatsApp fast-track
  quoteForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('quote-name')?.value.trim() || '';
    const phone = document.getElementById('quote-phone')?.value.trim() || '';
    const email = document.getElementById('quote-email')?.value.trim() || '';
    const service = document.getElementById('quote-service')?.value || '';
    const route = document.getElementById('quote-route')?.value.trim() || '';
    const message = document.getElementById('quote-message')?.value.trim() || '';

    // Generate executive tracking folio
    const folio = window.PronoeoUtils?.generateFolio('GPN') || `#GPN-26-${Math.floor(1000 + Math.random() * 9000)}`;
    const msg = buildQuoteMessage(folio);
    const waUrl = window.PronoeoUtils?.buildWhatsAppUrl('commercial', msg) || `https://wa.me/?text=${encodeURIComponent(msg)}`;

    const leadData = {
      folio,
      name,
      phone,
      email: email || 'No especificado',
      service,
      route,
      message: message || 'Sin detalles adicionales'
    };

    // Save lead in localStorage so zero data is ever lost
    window.PronoeoUtils?.saveLeadLocally('pronoeo_quote_leads', leadData);

    // Track conversion event in Google Analytics 4 (if configured)
    window.PronoeoUtils?.trackEvent('generate_lead', {
      event_category: 'Cotizacion',
      service,
      route,
      folio
    });

    const submitBtn = quoteForm.querySelector('.btn-submit');
    const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Procesando solicitud...</span>`;
    }

    const endpoint = window.PRONOEO_CONFIG?.quoteEmailEndpoint;

    if (endpoint && endpoint.startsWith('http')) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(leadData)
        });

        if (response.ok) {
          if (quoteFeedback) {
            quoteFeedback.className = 'quote-feedback is-success';
            quoteFeedback.style.display = 'block';
            quoteFeedback.innerHTML = `
              <div class="feedback-badge">✅ Folio de Cotización: <strong>${folio}</strong></div>
              <h4 style="margin: 4px 0 6px; color: #166534; font-size: 0.98rem;">¡Solicitud enviada a Operaciones con éxito!</h4>
              <p style="margin: 0 0 10px; color: #1e3a2b; font-size: 0.88rem;">
                Hemos recibido tu requerimiento de carga (<em>${route}</em>) en el buzón comercial. Tiempo de respuesta estimado: <strong>${window.PRONOEO_CONFIG?.responseSLA || 'menos de 2 horas hábiles'}</strong>.
              </p>
              <div style="margin-top: 10px; padding-top: 8px; border-top: 1px dashed rgba(22, 101, 52, 0.25);">
                <span style="display: block; font-size: 0.82rem; margin-bottom: 8px; color: #1e3a2b;">¿Deseas atención y despacho prioritario en tiempo real?</span>
                <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp-direct" style="padding: 0.65rem 1.3rem; font-size: 0.88rem; text-decoration: none; display: inline-flex;">
                  Reenviar datos por WhatsApp a Ventas
                </a>
              </div>
            `;
            quoteFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
          quoteForm.reset();
        } else {
          throw new Error('Servidor retornó código ' + response.status);
        }
      } catch (err) {
        console.warn('[Pronoeo Quote Form]', err);
        if (quoteFeedback) {
          quoteFeedback.className = 'quote-feedback is-warning';
          quoteFeedback.style.display = 'block';
          quoteFeedback.innerHTML = `
            <div class="feedback-badge" style="background: rgba(245, 158, 11, 0.2); color: #b45309;">📋 Folio Registrado: <strong>${folio}</strong></div>
            <h4 style="margin: 4px 0 6px; color: #854d0e; font-size: 0.98rem;">Solicitud registrada localmente</h4>
            <p style="margin: 0 0 10px; color: #713f12; font-size: 0.88rem;">
              Tus datos han sido validados y respaldados. Para recibir tu cotización inmediata sin depender del servidor de correo, envía los datos directamente por WhatsApp:
            </p>
            <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp-direct" style="padding: 0.65rem 1.3rem; font-size: 0.88rem; text-decoration: none; display: inline-flex;">
              Continuar cotización por WhatsApp
            </a>
          `;
          quoteFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
      }
    } else {
      // Modo espera de datos de administración: sin endpoint de correo aún
      setTimeout(() => {
        if (quoteFeedback) {
          quoteFeedback.className = 'quote-feedback is-success';
          quoteFeedback.style.display = 'block';
          quoteFeedback.innerHTML = `
            <div class="feedback-badge">📋 Folio de Cotización: <strong>${folio}</strong></div>
            <h4 style="margin: 4px 0 6px; color: #166534; font-size: 0.98rem;">¡Solicitud validada y preparada!</h4>
            <p style="margin: 0 0 10px; color: #1e3a2b; font-size: 0.88rem;">
              Tus datos de ruta (<em>${route}</em>) y unidad solicitada han sido registrados con éxito. Presiona el botón para abrir la conversación oficial en WhatsApp y recibir tarifas inmediatas:
            </p>
            <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp-direct" style="padding: 0.72rem 1.4rem; font-size: 0.90rem; text-decoration: none; display: inline-flex;">
              Enviar cotización por WhatsApp con datos listos
            </a>
          `;
          quoteFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
      }, 350);
    }
  });
}

if (btnQuoteWhatsApp) {
  // Direct WhatsApp click for quotes
  btnQuoteWhatsApp.addEventListener('click', () => {
    const folio = window.PronoeoUtils?.generateFolio('GPN') || '';
    const msg = buildQuoteMessage(folio);
    const waUrl = window.PronoeoUtils?.buildWhatsAppUrl('commercial', msg) || `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.PronoeoUtils?.trackEvent('contact_whatsapp_commercial', {
      event_category: 'WhatsApp',
      folio
    });
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  });
}

/* ==========================================================================
   4. Header Scroll State
   ========================================================================== */

// Add shadow to header when page is scrolled
const siteHeader = document.querySelector('.site-header');
if (siteHeader) {
  const handleScroll = () => {
    if (window.scrollY > 20) {
      siteHeader.classList.add('is-scrolled');
    } else {
      siteHeader.classList.remove('is-scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* ==========================================================================
   5. Clipboard Copy Utility
   ========================================================================== */

// Copy text to clipboard with fallback for older browsers
const copyButtons = document.querySelectorAll('.btn-copy');
copyButtons.forEach((btn) => {
  btn.addEventListener('click', async () => {
    const textToCopy = btn.getAttribute('data-copy');
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      const originalText = btn.textContent;
      btn.textContent = '¡Copiado!';
      btn.classList.add('is-copied');

      setTimeout(() => {
        btn.textContent = originalText;
        btn.classList.remove('is-copied');
      }, 2000);
    } catch (err) {
      // Fallback for browsers without Clipboard API support
      const tempInput = document.createElement('input');
      tempInput.value = textToCopy;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);

      const originalText = btn.textContent;
      btn.textContent = '¡Copiado!';
      btn.classList.add('is-copied');

      setTimeout(() => {
        btn.textContent = originalText;
        btn.classList.remove('is-copied');
      }, 2000);
    }
  });
});

/* ==========================================================================
   6. Fleet Category Filters
   ========================================================================== */

// Filter fleet cards by category
const fleetFilterBtns = document.querySelectorAll('.fleet-filter-btn');
const fleetCards = document.querySelectorAll('.fleet-card[data-category]');

if (fleetFilterBtns.length && fleetCards.length) {
  fleetFilterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      fleetFilterBtns.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      const filterVal = btn.getAttribute('data-filter');
      fleetCards.forEach((card) => {
        const cardCat = card.getAttribute('data-category');
        if (filterVal === 'all' || cardCat === filterVal) {
          card.style.display = 'flex';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   7. Fleet Card Quick-Quote Link
   ========================================================================== */

// Pre-select unit in quote form when clicking 'Cotizar este equipo'
const quoteUnitBtns = document.querySelectorAll('.btn-card-quote');
const quoteServiceSelect = document.getElementById('quote-service');

if (quoteUnitBtns.length && quoteServiceSelect) {
  quoteUnitBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const unit = btn.getAttribute('data-unit');
      if (unit) {
        for (let i = 0; i < quoteServiceSelect.options.length; i++) {
          const opt = quoteServiceSelect.options[i];
          if (opt.value === unit || opt.value.includes(unit) || opt.text.includes(unit)) {
            quoteServiceSelect.selectedIndex = i;
            break;
          }
        }
      }
    });
  });
}

/* ==========================================================================
   8. Direct Contact Modal
   ========================================================================== */

// Modal DOM elements
const btnNavContact = document.getElementById('btn-nav-contact');
const btnNavQuote = document.getElementById('btn-nav-quote');
const contactModal = document.getElementById('contact-modal');
const modalClose = document.getElementById('modal-close');
const modalGotoQuote = document.getElementById('modal-goto-quote');
const quoteNameInput = document.getElementById('quote-name');

// Open modal dialog
function openContactModal() {
  if (!contactModal) return;
  contactModal.classList.add('is-open');
  contactModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  modalClose?.focus();
}

// Close modal dialog
function closeContactModal() {
  if (!contactModal) return;
  contactModal.classList.remove('is-open');
  contactModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  btnNavContact?.focus();
}

// Open modal when clicking navbar 'Contacto'
if (btnNavContact) {
  btnNavContact.addEventListener('click', (e) => {
    e.preventDefault();
    openContactModal();
  });
}

// Close modal when clicking close button
if (modalClose) {
  modalClose.addEventListener('click', () => {
    closeContactModal();
  });
}

// Close modal when clicking backdrop
if (contactModal) {
  contactModal.addEventListener('click', (e) => {
    if (e.target === contactModal) {
      closeContactModal();
    }
  });
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && contactModal?.classList.contains('is-open')) {
    closeContactModal();
  }
});

// Jump from modal to quote form
if (modalGotoQuote) {
  modalGotoQuote.addEventListener('click', (e) => {
    e.preventDefault();
    closeContactModal();
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        quoteNameInput?.focus();
      }, 600);
    }
  });
}

// Navbar 'Cotizar' button: scroll to form and focus name input
if (btnNavQuote) {
  btnNavQuote.addEventListener('click', (e) => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      e.preventDefault();
      contactSection.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        quoteNameInput?.focus();
      }, 600);
    }
  });
}

/* ==========================================================================
   8.1 Privacy & Confidentiality Modal
   ========================================================================== */

const privacyModal = document.getElementById('privacy-modal');
const btnOpenPrivacy = document.getElementById('btn-open-privacy');
const footerPrivacyBtn = document.getElementById('footer-privacy-btn');
const privacyModalClose = document.getElementById('privacy-modal-close');
const btnPrivacyAccept = document.getElementById('btn-privacy-accept');

function openPrivacyModal() {
  if (!privacyModal) return;
  privacyModal.classList.add('is-open');
  privacyModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  privacyModalClose?.focus();
}

function closePrivacyModal() {
  if (!privacyModal) return;
  privacyModal.classList.remove('is-open');
  privacyModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

if (btnOpenPrivacy) {
  btnOpenPrivacy.addEventListener('click', (e) => {
    e.preventDefault();
    openPrivacyModal();
  });
}

if (footerPrivacyBtn) {
  footerPrivacyBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openPrivacyModal();
  });
}

if (privacyModalClose) {
  privacyModalClose.addEventListener('click', closePrivacyModal);
}

if (btnPrivacyAccept) {
  btnPrivacyAccept.addEventListener('click', closePrivacyModal);
}

if (privacyModal) {
  privacyModal.addEventListener('click', (e) => {
    if (e.target === privacyModal) {
      closePrivacyModal();
    }
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && privacyModal?.classList.contains('is-open')) {
    closePrivacyModal();
  }
});

/* ==========================================================================
   9. Dedicated Recruitment Portal Reference
   ========================================================================== */

// Nota: El proceso de reclutamiento de pilotos y postulación se gestiona
// íntegramente en su propio portal cinematográfico: pilotos.html y js/pilotos.js


