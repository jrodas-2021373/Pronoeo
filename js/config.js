/**
 * Grupo Pronoeo, S.A. - Configuración de Canales y Destinos Oficiales
 * Document: js/config.js
 * 
 * ============================================================================
 * GUÍA DE CONFIGURACIÓN RÁPIDA:
 * Cuando la administración o el cliente proporcione los datos oficiales,
 * únicamente edita los valores entre comillas en este archivo.
 * Todo el sitio (index.html y pilotos.html) se adaptará automáticamente.
 * ============================================================================
 */

window.PRONOEO_CONFIG = {
  /**
   * 1. WHATSAPP COMERCIAL (Cotizaciones y clientes B2B de carga)
   * Formato: Código de país seguido del número, sin '+' ni guiones.
   * Ejemplo para Guatemala (+502): '502XXXXXXXX'
   * Deja vacío '' mientras la administración no entregue el número oficial.
   */
  whatsappCommercial: '',

  /**
   * 2. WHATSAPP RECURSOS HUMANOS (Convocatoria y reclutamiento de pilotos)
   * Ejemplo: '502XXXXXXXX' (puede ser el mismo comercial o uno exclusivo de RRHH).
   * Deja vacío '' mientras no se entregue el número oficial.
   */
  whatsappRecruitment: '',

  /**
   * 3. RECEPCIÓN DE COTIZACIONES POR CORREO (Endpoint de servicio)
   * Recomendado: Formspree (https://formspree.io/f/TU_ID) o webhook propio.
   * Si está vacío '', el sistema opera en modo respaldo: valida y guarda
   * la cotización localmente y genera el envío inmediato por WhatsApp.
   */
  quoteEmailEndpoint: '',

  /**
   * 4. RECEPCIÓN DE POSTULACIONES DE PILOTOS Y MECÁNICOS POR CORREO (Endpoint opcional)
   * Ejemplo: 'https://formspree.io/f/TU_ID_RECLUTAMIENTO'
   * Si está vacío '', la postulación se canaliza directo por WhatsApp de RRHH.
   */
  recruitmentEmailEndpoint: '',

  /**
   * 5. DATOS DE CONTACTO CORPORATIVO VISIBLES
   */
  publicEmail: 'cotizaciones@grupopronoeo.com',
  publicPhone: '+502 2400-0000',
  publicAddress: 'Guatemala, C.A.',
  operationsHub: 'Guatemala (Operaciones y Despacho Regional)',

  /**
   * 6. ACUERDO DE TIEMPO DE RESPUESTA (SLA)
   */
  responseSLA: 'Menos de 2 horas hábiles en horario laboral',

  /**
   * 7. ANALÍTICA WEB OFICIAL (Google Analytics 4 / GA4)
   * Formato: 'G-XXXXXXXXXX'
   * Deja vacío '' mientras no se tenga el ID de medición.
   * En cuanto pegues el ID aquí, se activará el rastreo de visitas,
   * procedencia por país y eventos de cotización en ambas páginas.
   */
  googleAnalyticsId: ''
};

/**
 * ============================================================================
 * UTILIDADES COMPARTIDAS DE INTEGRACIÓN Y RESPALDO
 * ============================================================================
 */
window.PronoeoUtils = {
  /**
   * Genera un folio institucional único de seguimiento.
   * Ejemplo: #GPN-26-4891 o #PIL-26-7214
   */
  generateFolio(prefix = 'GPN') {
    const yearSuffix = new Date().getFullYear().toString().slice(-2);
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    return `#${prefix}-${yearSuffix}-${randomCode}`;
  },

  /**
   * Construye el enlace seguro de WhatsApp con el número asignado o fallback.
   */
  buildWhatsAppUrl(type = 'commercial', message = '') {
    const cfg = window.PRONOEO_CONFIG || {};
    const phone = type === 'recruitment' 
      ? (cfg.whatsappRecruitment || '').trim() 
      : (cfg.whatsappCommercial || '').trim();
    const encoded = encodeURIComponent(message);
    return phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
  },

  /**
   * Guarda solicitudes localmente en localStorage para garantizar CERO pérdida
   * de información ante fallas de red o demoras en la respuesta por correo.
   */
  saveLeadLocally(storageKey, leadData) {
    try {
      const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
      existing.unshift({
        ...leadData,
        savedAt: new Date().toISOString()
      });
      // Mantiene el historial de las últimas 60 solicitudes
      localStorage.setItem(storageKey, JSON.stringify(existing.slice(0, 60)));
    } catch (err) {
      console.warn('[Pronoeo Storage Warning]', err);
    }
  },

  /**
   * Actualiza los enlaces estáticos de WhatsApp en la página con el número oficial.
   */
  syncStaticWhatsAppLinks() {
    const cfg = window.PRONOEO_CONFIG || {};
    document.querySelectorAll('a[data-wa-type]').forEach(link => {
      const type = link.getAttribute('data-wa-type');
      const phone = type === 'recruitment' ? cfg.whatsappRecruitment : cfg.whatsappCommercial;
      if (phone) {
        try {
          const url = new URL(link.href);
          const currentText = url.searchParams.get('text') || '';
          link.href = `https://wa.me/${phone}?text=${encodeURIComponent(currentText)}`;
        } catch (_) {}
      }
    });
  },

  /**
   * Inicializa dinámicamente Google Analytics 4 (GA4) solo cuando hay un ID configurado.
   */
  initGoogleAnalytics() {
    const cfg = window.PRONOEO_CONFIG || {};
    const gaId = (cfg.googleAnalyticsId || '').trim();

    if (!gaId || !gaId.startsWith('G-')) {
      return;
    }

    if (document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${gaId}"]`)) {
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', gaId, {
      send_page_view: true,
      anonymize_ip: true
    });

    console.log(`[Pronoeo Analytics] GA4 activo: ${gaId}`);
  },

  /**
   * Registra eventos personalizados en GA4 de forma segura.
   */
  trackEvent(eventName, eventParams = {}) {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, eventParams);
    }
  }
};

/**
 * ============================================================================
 * PANEL DE CONSULTA DE LEADS EN CONSOLA (PronoeoAdmin)
 * Permite al administrador o equipo técnico auditar cotizaciones y postulaciones.
 * Uso en consola del navegador:
 *   PronoeoAdmin.getQuotes()   -> Muestra todas las cotizaciones guardadas
 *   PronoeoAdmin.getPilots()   -> Muestra postulaciones de pilotos
 * ============================================================================
 */
window.PronoeoAdmin = {
  getQuotes() {
    const data = JSON.parse(localStorage.getItem('pronoeo_quote_leads') || '[]');
    console.table(data);
    return data;
  },
  getPilots() {
    const data = JSON.parse(localStorage.getItem('pronoeo_pilot_applications') || '[]');
    console.table(data);
    return data;
  },
  clearQuotes() {
    localStorage.removeItem('pronoeo_quote_leads');
    console.log('[PronoeoAdmin] Historial de cotizaciones vaciado.');
  },
  clearPilots() {
    localStorage.removeItem('pronoeo_pilot_applications');
    console.log('[PronoeoAdmin] Historial de pilotos vaciado.');
  }
};

// Sincroniza enlaces de WhatsApp e inicializa analítica en cuanto el DOM esté listo
function startupPronoeoConfig() {
  window.PronoeoUtils.syncStaticWhatsAppLinks();
  window.PronoeoUtils.initGoogleAnalytics();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startupPronoeoConfig);
} else {
  startupPronoeoConfig();
}
