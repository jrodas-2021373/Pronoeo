const menuToggle = document.querySelector('.menu-toggle');
const navPanel = document.querySelector('.nav-panel');

if (menuToggle && navPanel) {
  menuToggle.addEventListener('click', () => {
    const isOpen = navPanel.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navPanel.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navPanel.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', (e) => {
    if (navPanel.classList.contains('is-open') && !navPanel.contains(e.target) && !menuToggle.contains(e.target)) {
      navPanel.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

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

// Manejo del formulario interactivo de cotización
const quoteForm = document.getElementById('quote-form');
const btnQuoteWhatsApp = document.getElementById('btn-quote-whatsapp');
const quoteFeedback = document.getElementById('quote-feedback');

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
  btnQuoteWhatsApp.addEventListener('click', () => {
    const msg = buildQuoteMessage();
    const waUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  });
}

// Sombra y estilo dinámico para la cabecera al hacer scroll
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

// Botones interactivos para copiar NIT y dirección al portapapeles
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
      // Fallback para entornos donde clipboard API requiera permisos adicionales
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


