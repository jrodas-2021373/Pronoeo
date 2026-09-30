/**
 * ============================================================================
 * Grupo Pronoeo - Interactive Client Application Script
 * Architecture: Vanilla JavaScript (ES6+)
 * Description: Handles client-side interactivity, accessibility (ARIA),
 *              dynamic UI state transitions, responsive navigation, quote
 *              serialization, fleet filtering, and modal dialog lifecycle.
 * ============================================================================
 */

/* ==========================================================================
   1. Mobile Navigation & Accessible Drawer Controller
   ========================================================================== */

/**
 * Mobile hamburger toggle button and collapsible navigation drawer panel.
 */
const menuToggle = document.querySelector('.menu-toggle');
const navPanel = document.querySelector('.nav-panel');

if (menuToggle && navPanel) {
  /**
   * Toggles the navigation drawer's active state and synchronizes aria-expanded.
   */
  menuToggle.addEventListener('click', () => {
    const isOpen = navPanel.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  /**
   * Auto-closes the mobile drawer when clicking any internal navigation anchor.
   */
  navPanel.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navPanel.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /**
   * Closes the drawer if a user clicks anywhere outside the navigation container.
   */
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
   2. Scroll-Triggered Reveal Animations (Intersection Observer)
   ========================================================================== */

/**
 * Observes DOM elements with the `.reveal` class and reveals them sequentially
 * as they enter the viewport threshold.
 */
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
   3. Interactive Freight Quote Form & WhatsApp Serializer
   ========================================================================== */

/**
 * Form inputs and feedback containers for the freight rate quote engine.
 */
const quoteForm = document.getElementById('quote-form');
const btnQuoteWhatsApp = document.getElementById('btn-quote-whatsapp');
const quoteFeedback = document.getElementById('quote-feedback');

/**
 * Serializes values from the quotation form into a structured, readable message
 * optimized for direct dispatch to WhatsApp Business advisors.
 *
 * @returns {string} Formatted plain-text payload for messaging.
 */
function buildQuoteMessage() {
  const name = document.getElementById('quote-name')?.value.trim() || '';
  const phone = document.getElementById('quote-phone')?.value.trim() || '';
  const email = document.getElementById('quote-email')?.value.trim() || '';
  const service = document.getElementById('quote-service')?.value || '';
  const route = document.getElementById('quote-route')?.value.trim() || '';
  const message = document.getElementById('quote-message')?.value.trim() || '';

  let text = `🚛 *Solicitud de Cotización - Grupo Pronoeo*\n\n`;
  if (name) text += `• *Nombre / Empresa:* ${name}\n`;
  if (phone) text += `• *Teléfono:* ${phone}\n`;
  if (email) text += `• *Correo:* ${email}\n`;
  if (service) text += `• *Unidad / Servicio:* ${service}\n`;
  if (route) text += `• *Ruta solicitada:* ${route}\n`;
  if (message) text += `• *Detalles:* ${message}\n`;

  return text;
}

if (quoteForm) {
  /**
   * Handles quote form submission: prevents default page reload, builds
   * WhatsApp URI payload, and displays a user feedback notification card.
   */
  quoteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = buildQuoteMessage();
    const waUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;

    if (quoteFeedback) {
      quoteFeedback.className = 'quote-feedback is-success';
      quoteFeedback.style.display = 'block';
      quoteFeedback.innerHTML = `
        <strong>¡Solicitud de cotización preparada!</strong><br>
        Se han registrado los datos de tu ruta y carga. Puedes abrirlos directamente en WhatsApp para recibir atención personalizada inmediata:<br><br>
        <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp-direct" style="padding: 0.65rem 1.3rem; font-size: 0.9rem;">
          Abrir en WhatsApp con datos listos
        </a>
      `;
    }
  });
}

if (btnQuoteWhatsApp) {
  /**
   * Direct trigger button: immediately prepares the serialized quotation and
   * opens WhatsApp in a new browser tab.
   */
  btnQuoteWhatsApp.addEventListener('click', () => {
    const msg = buildQuoteMessage();
    const waUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  });
}

/* ==========================================================================
   4. Header Scroll State (Elevation & Backdrop Enhancement)
   ========================================================================== */

/**
 * Adds an elevation shadow and increased blur opacity to the sticky navbar
 * once the user scrolls beyond the top threshold (20px).
 */
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
   5. Clipboard Copy Utility with Resilient Fallback
   ========================================================================== */

/**
 * Copies the text specified in `data-copy` to the user's system clipboard.
 * Features asynchronous modern Clipboard API with legacy fallback for
 * restricted or older browser security contexts.
 */
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
      // Legacy fallback for environments where Clipboard API is restricted
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
   6. Fleet Catalog Interactive Category Filters
   ========================================================================== */

/**
 * Filter buttons and card elements for technical equipment categories
 * (Dry Vans, Flatbeds, Specialized Heavy Haul, Bulk & Intermodal).
 */
const fleetFilterBtns = document.querySelectorAll('.fleet-filter-btn');
const fleetCards = document.querySelectorAll('.fleet-card[data-category]');

if (fleetFilterBtns.length && fleetCards.length) {
  fleetFilterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      // Update active pill state
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
   7. Fleet Card Quick-Quote Synchronizer
   ========================================================================== */

/**
 * When clicking "Cotizar este equipo" on any fleet card, this automatically
 * maps the unit code to the service dropdown selector in the quote section.
 */
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
   8. Direct Contact Channels Modal Dialog & Quote Navigation Controller
   ========================================================================== */

/**
 * DOM references for modal dialog elements and navigation triggers.
 */
const btnNavContact = document.getElementById('btn-nav-contact');
const btnNavQuote = document.getElementById('btn-nav-quote');
const contactModal = document.getElementById('contact-modal');
const modalClose = document.getElementById('modal-close');
const modalGotoQuote = document.getElementById('modal-goto-quote');
const quoteNameInput = document.getElementById('quote-name');

/**
 * Opens the Direct Contact modal dialog, locks body scroll, updates ARIA
 * state, and transfers focus to the dialog close control.
 */
function openContactModal() {
  if (!contactModal) return;
  contactModal.classList.add('is-open');
  contactModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  modalClose?.focus();
}

/**
 * Dismisses the Direct Contact modal dialog, restores body scroll, updates
 * ARIA state, and returns focus to the initiating navbar trigger button.
 */
function closeContactModal() {
  if (!contactModal) return;
  contactModal.classList.remove('is-open');
  contactModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  btnNavContact?.focus();
}

// Attach modal opener to navbar "Contacto" action button
if (btnNavContact) {
  btnNavContact.addEventListener('click', (e) => {
    e.preventDefault();
    openContactModal();
  });
}

// Attach modal dismisser to close button
if (modalClose) {
  modalClose.addEventListener('click', () => {
    closeContactModal();
  });
}

// Dismiss modal when clicking on the surrounding backdrop
if (contactModal) {
  contactModal.addEventListener('click', (e) => {
    if (e.target === contactModal) {
      closeContactModal();
    }
  });
}

// Dismiss modal when pressing the Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && contactModal?.classList.contains('is-open')) {
    closeContactModal();
  }
});

// Modal footer link: smoothly jumps from modal dialog down to the quotation form
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

// Navbar "Cotizar" action button: smooth scroll to quotation form and auto-focus
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
