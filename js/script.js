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
   3. Quote Form & WhatsApp Serializer
   ========================================================================== */

// Quote form elements
const quoteForm = document.getElementById('quote-form');
const btnQuoteWhatsApp = document.getElementById('btn-quote-whatsapp');
const quoteFeedback = document.getElementById('quote-feedback');

/**
 * Builds formatted text message from quote form inputs.
 *
 * @returns {string} Formatted text message for WhatsApp.
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
  // Handle form submission and prepare WhatsApp message
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
  // Open WhatsApp with form data on direct button click
  btnQuoteWhatsApp.addEventListener('click', () => {
    const msg = buildQuoteMessage();
    const waUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;
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
