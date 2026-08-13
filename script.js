'use strict';

// ══════════════════════════════════════════
// CatapultaPay — script.js
// Vanilla JS — sin dependencias externas
// ══════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {

  // ── Inicializar íconos Lucide ──
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Ejecutar todas las funciones de inicialización
  initNavSticky();
  initMobileMenu();
  initParticleCanvas();
  initScrollReveal();
  initCounters();
  initTabs();
  initCatalogTabs();
  initThemeToggle();
  initScrollTopBtn();
  initFAQ();
  initTermsModal();
  // Diferir lo que no afecta el primer render
  const idle = window.requestIdleCallback || (cb => setTimeout(cb, 200));
  idle(() => {
    initTiltCards();
    initBarAnimations();
    initContactForm();
    initSavingsCalculator();
  });
});

/* ────────────────────────────────────────────
   1. NAVBAR STICKY
   Añade la clase .stuck al hacer scroll > 60px
──────────────────────────────────────────── */
function initNavSticky() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  function onScroll() {
    if (window.scrollY > 60) {
      nav.classList.add('stuck');
    } else {
      nav.classList.remove('stuck');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Ejecutar al inicio por si la página carga scrolleada
}

/* ────────────────────────────────────────────
   2. MENÚ HAMBURGUESA (móvil)
   Alterna la visibilidad del menú móvil
──────────────────────────────────────────── */
function initMobileMenu() {
  const btn  = document.getElementById('navHamburger');
  const menu = document.getElementById('mobileMenu');

  if (!btn || !menu) return;

  let isOpen = false;

  function toggleMenu(forceClose = false) {
    if (forceClose && !isOpen) return;
    isOpen = forceClose ? false : !isOpen;

    menu.classList.toggle('open', isOpen);
    btn.classList.toggle('is-open', isOpen);
    btn.setAttribute('aria-expanded', String(isOpen));
    menu.setAttribute('aria-hidden', String(!isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  // Abrir/cerrar con el botón
  btn.addEventListener('click', () => toggleMenu());

  // Cerrar al hacer clic en links internos
  menu.querySelectorAll('.mobile-link, .mobile-cta').forEach(link => {
    link.addEventListener('click', () => toggleMenu(true));
  });

  // Cerrar al agrandar la ventana (fix bug resize)
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && isOpen) toggleMenu(true);
  }, { passive: true });
}

/* ────────────────────────────────────────────
   3. PARTÍCULAS EN CANVAS (hero)
   65 partículas con líneas de conexión
──────────────────────────────────────────── */
function initParticleCanvas() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;

  const isMobile = window.innerWidth < 768;
  if (isMobile) { canvas.style.display = 'none'; return; }

  const ctx = canvas.getContext('2d');
  const PARTICLE_COUNT = 40;
  const MAX_DIST        = 100;
  const TEAL            = 'rgba(14, 207, 173,';
  let   particles       = [];
  let   animationId;

  // Redimensionar el canvas al tamaño de la sección hero
  function resizeCanvas() {
    const parent = canvas.parentElement;
    canvas.width  = parent.offsetWidth;
    canvas.height = parent.offsetHeight;
  }

  // Crear una partícula con posición y velocidad aleatorias
  function createParticle() {
    return {
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      r:  Math.random() * 1.5 + 0.5,
    };
  }

  // Inicializar partículas
  function initParticles() {
    particles = Array.from({ length: PARTICLE_COUNT }, createParticle);
  }

  // Dibujar cada frame
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Actualizar posición y rebotar en bordes
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      // Dibujar partícula
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = TEAL + ' 0.4)';
      ctx.fill();
    });

    // Dibujar líneas de conexión entre partículas cercanas
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const distSq = dx * dx + dy * dy;

        if (distSq < MAX_DIST * MAX_DIST) {
          const alpha = 1 - Math.sqrt(distSq) / MAX_DIST;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = TEAL + (alpha * 0.25) + ')';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    animationId = requestAnimationFrame(draw);
  }

  // Manejar cambio de tamaño de ventana
  function handleResize() {
    cancelAnimationFrame(animationId);
    resizeCanvas();
    initParticles();
    draw();
  }

  resizeCanvas();
  initParticles();
  draw();

  window.addEventListener('resize', handleResize, { passive: true });

  // Pausar animación cuando el hero no está visible
  const heroSection = canvas.parentElement;
  const visibilityObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!animationId) draw();
      } else {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    });
  }, { threshold: 0.1 });
  visibilityObserver.observe(heroSection);
}

/* ────────────────────────────────────────────
   4. SCROLL REVEAL
   Animación de aparición con IntersectionObserver
──────────────────────────────────────────── */
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Pequeño delay via rAF para no bloquear el hilo principal
        requestAnimationFrame(() => {
          entry.target.classList.add('visible');
        });
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -20px 0px',
  });

  // Aplicar delay escalonado a grupos de tarjetas
  const cardGroups = document.querySelectorAll('.solutions-grid, .testimonials-grid, .feature-cards, .contact-cards, .steps-grid');

  cardGroups.forEach(group => {
    const cards = group.querySelectorAll('.reveal, .testi-card, .sol-card, .feature-card, .contact-card, .step-card');
    cards.forEach((card, index) => {
      card.style.transitionDelay = `${index * 80}ms`;
    });
  });

  elements.forEach(el => observer.observe(el));
}

/* ────────────────────────────────────────────
   5. CONTADORES ANIMADOS
   Animación numérica con easing cúbico
──────────────────────────────────────────── */
function initCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;

  const DURATION = 1800; // ms

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const start  = performance.now();

    function update(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / DURATION, 1);
      // Easing cúbico ease-out
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = Math.round(eased * target);

      el.textContent = prefix + current + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = prefix + target + suffix;
      }
    }

    requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target); // Solo una vez
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

/* ────────────────────────────────────────────
   6. TABS DE SOLUCIONES
   Alterna entre paneles con efecto fade
──────────────────────────────────────────── */
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-pill');
  if (!tabBtns.length) return;

  function switchTab(tabId) {
    const panels = document.querySelectorAll('.solutions-panel');
    const buttons = document.querySelectorAll('.tab-pill');

    // Desactivar todos los paneles y botones
    panels.forEach(panel => {
      panel.style.opacity = '0';
      panel.style.pointerEvents = 'none';
    });

    buttons.forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
    });

    // Activar panel y botón seleccionados
    const activePanel = document.getElementById('panel' + capitalize(tabId));
    const activeBtn   = document.querySelector(`[data-tab="${tabId}"]`);

    if (activePanel) {
      // Quitar clase hidden antes de hacer fade in
      panels.forEach(p => p.classList.add('hidden'));
      activePanel.classList.remove('hidden');

      setTimeout(() => {
        activePanel.style.opacity = '1';
        activePanel.style.pointerEvents = '';
      }, 50);
    }

    if (activeBtn) {
      activeBtn.classList.add('active');
      activeBtn.setAttribute('aria-selected', 'true');
    }
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      switchTab(tabId);
    });
  });

  // Estado inicial: todos los paneles con transición
  const panels = document.querySelectorAll('.solutions-panel');
  panels.forEach(panel => {
    panel.style.transition = 'opacity 0.4s ease';
  });

  // Asegurarse de que el primer panel está visible
  const firstPanel = document.getElementById('panelPhysical');
  if (firstPanel) {
    firstPanel.style.opacity = '1';
  }
}

// Utility: capitalizar primera letra
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* ────────────────────────────────────────────
   7. EFECTO TILT 3D EN CARDS
   mousemove calcula el offset para rotateX/Y
──────────────────────────────────────────── */
function initTiltCards() {
  const cards = document.querySelectorAll('.tilt-card');
  if (!cards.length) return;

  const INTENSITY = 20; // Dividir entre este número — menor = más sutil

  cards.forEach(card => {
    let tiltFrame;
    card.addEventListener('mousemove', (e) => {
      if (tiltFrame) return;
      tiltFrame = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const cx   = rect.left + rect.width  / 2;
        const cy   = rect.top  + rect.height / 2;
        const dx   = (e.clientX - cx) / INTENSITY;
        const dy   = (e.clientY - cy) / INTENSITY;
        card.style.transform = `perspective(600px) rotateX(${-dy}deg) rotateY(${dx}deg) translateY(-4px)`;
        tiltFrame = null;
      });
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.45s ease';
      card.style.transform  = '';

      // Limpiar la transición después para no interferir con otros efectos
      setTimeout(() => {
        card.style.transition = '';
      }, 450);
    });
  });
}

/* ────────────────────────────────────────────
   8. ANIMACIÓN DE BARRAS (dashboard hero)
   Animación de ancho con stagger de 150ms
──────────────────────────────────────────── */
function initBarAnimations() {
  const bars = document.querySelectorAll('.bar-fill');
  if (!bars.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        bars.forEach((bar, index) => {
          setTimeout(() => {
            bar.style.width = bar.dataset.width + '%';
          }, index * 150);
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.5 });

  const card = document.getElementById('dashCard');
  if (card) observer.observe(card);
}

/* ────────────────────────────────────────────
   9. FORMULARIO DE CONTACTO
   Valida, envía por EmailJS (sin backend propio, con
   plantilla de correo personalizada — ver email-template.html)
   y muestra estado de carga + toast de resultado.
──────────────────────────────────────────── */

// Credenciales de la cuenta de EmailJS conectada a jairo.pena@catapultapay.com.
// La plantilla con el diseño de marca vive en email-template.html — si se edita ahí,
// hay que volver a pegar el contenido en EmailJS → Email Templates para que aplique.
const EMAILJS_PUBLIC_KEY  = 'BYaob6ikAz-qfrkG3';
const EMAILJS_SERVICE_ID  = 'service_jqy7taq';
const EMAILJS_TEMPLATE_ID = 'template_fb9mt5c';
const EMAILJS_READY = Boolean(EMAILJS_PUBLIC_KEY && EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID);

if (EMAILJS_READY && typeof emailjs !== 'undefined') {
  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
}

function initContactForm() {
  const form  = document.getElementById('contactForm');
  const toast = document.getElementById('toast');
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  const submitDefaultHTML = submitBtn ? submitBtn.innerHTML : '';

  // Limpiar el estado de error de un campo en cuanto el usuario lo corrige
  form.querySelectorAll('[required]').forEach(field => {
    field.addEventListener('input', () => {
      if (field.value.trim()) field.closest('.form-group')?.classList.remove('invalid');
    });
    field.addEventListener('change', () => {
      if (field.value.trim()) field.closest('.form-group')?.classList.remove('invalid');
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Honeypot: si un bot llenó este campo invisible, fingimos éxito sin enviar nada
    const honeypot = form.querySelector('#honeypot');
    if (honeypot && honeypot.value.trim()) {
      showToast('Mensaje enviado con éxito. Te contactaremos pronto.', 'success');
      form.reset();
      return;
    }

    // Validación básica con mensaje de error visible por campo
    const required = form.querySelectorAll('[required]');
    let valid = true;
    let firstInvalid = null;

    required.forEach(field => {
      const group = field.closest('.form-group');
      const isEmail = field.type === 'email';
      const isInvalid = !field.value.trim() || (isEmail && !field.checkValidity());
      group?.classList.toggle('invalid', isInvalid);
      if (isInvalid) {
        valid = false;
        if (!firstInvalid) firstInvalid = field;
      }
    });

    if (!valid) {
      firstInvalid?.focus();
      return;
    }

    if (!EMAILJS_READY) {
      console.warn('CatapultaPay: falta configurar EMAILJS_PUBLIC_KEY / EMAILJS_SERVICE_ID / EMAILJS_TEMPLATE_ID en script.js — el formulario no puede enviar correos todavía.');
      showToast('Formulario en configuración. Escríbenos directo a info@catapultapay.com mientras tanto.', 'error');
      return;
    }

    setLoading(true);

    try {
      const ok = await sendContactForm(form);
      if (ok) {
        showToast('Mensaje enviado con éxito. Te contactaremos pronto.', 'success');
        form.reset();
      } else {
        showToast('No se pudo enviar. Intenta de nuevo o escríbenos a info@catapultapay.com', 'error');
      }
    } catch (err) {
      console.error('CatapultaPay contact form error:', err);
      showToast('No se pudo enviar. Intenta de nuevo o escríbenos a info@catapultapay.com', 'error');
    } finally {
      setLoading(false);
    }
  });

  function setLoading(isLoading) {
    if (!submitBtn) return;
    submitBtn.disabled = isLoading;
    if (isLoading) {
      submitBtn.textContent = 'Enviando...';
    } else {
      submitBtn.innerHTML = submitDefaultHTML;
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  }

  function showToast(message, type) {
    if (!toast) return;
    const span = toast.querySelector('span');
    const icon = toast.querySelector('i');
    if (span && message) span.textContent = message;
    if (icon) {
      icon.setAttribute('data-lucide', type === 'error' ? 'alert-circle' : 'check-circle');
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
    toast.classList.toggle('toast-error', type === 'error');
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  }
}

// Envía el formulario con EmailJS (https://emailjs.com) — sin backend propio.
// Usa la plantilla con logo y marca definida en email-template.html.
async function sendContactForm(form) {
  const subjectLabels = {
    pos: 'Terminal POS físico',
    virtual: 'Procesamiento virtual',
    support: 'Soporte técnico',
    general: 'Consulta general',
  };

  const firstName = form.firstName.value.trim();
  const lastName  = form.lastName.value.trim();
  const company   = form.company.value.trim();
  const email     = form.email.value.trim();
  const phone     = form.phone.value.trim();
  const subjectKey = form.subject.value;
  const message   = form.message.value.trim();

  // Estos nombres de variable deben coincidir con los {{...}} de la plantilla en EmailJS
  const templateParams = {
    Nombre: `${firstName} ${lastName}`,
    Negocio: company || 'No proporcionado',
    Correo: email,
    Telefono: phone || 'No proporcionado',
    Interes: subjectLabels[subjectKey] || subjectKey,
    Mensaje: message,
  };

  const response = await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
  return response.status === 200;
}

/* ────────────────────────────────────────────
   10. SMOOTH SCROLL para links de ancla
   Funciona con el scroll-behavior: smooth de CSS
   pero aquí se añade offset por la navbar fija
──────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;

    e.preventDefault();

    const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 76;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;

    window.scrollTo({
      top: targetTop,
      behavior: 'smooth',
    });
  });
});

/* ────────────────────────────────────────────
   11. CALCULADORA DE AHORRO
──────────────────────────────────────────── */
function initSavingsCalculator() {
  const sliderSales = document.getElementById('sliderSales');
  const sliderRate  = document.getElementById('sliderRate');
  if (!sliderSales || !sliderRate) return;


  function fmt(n) {
    return '$' + Math.round(n).toLocaleString('en-US');
  }

  function getSliderPct(slider) {
    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    const val = parseFloat(slider.value);
    return ((val - min) / (max - min)) * 100;
  }

  function updateThumb(slider, fillEl, wrapId) {
    const pct = getSliderPct(slider);
    fillEl.style.width = pct + '%';
    const wrap = slider.closest('.calc-slider-wrap');
    if (wrap) wrap.style.setProperty('--thumb-pos', pct + '%');
  }

  function animateValue(el, newVal, prefix) {
    const current = parseFloat(el.dataset.raw || '0');
    const diff    = newVal - current;
    const steps   = 18;
    let   step    = 0;

    el.dataset.raw = newVal;

    const tick = () => {
      step++;
      const progress = step / steps;
      const eased    = 1 - Math.pow(1 - progress, 3);
      const display  = current + diff * eased;

      el.textContent = (prefix || '$') + Math.round(display).toLocaleString('en-US');
      if (step < steps) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }

  const CATAPULTA_RATE = 1.89 / 100; // tasa fija CatapultaPay

  function calculate() {
    const sales       = parseFloat(sliderSales.value);
    const currentRate = parseFloat(sliderRate.value) / 100 / 100;

    const costCurrent   = sales * currentRate;
    const costCatapulta = sales * CATAPULTA_RATE;
    const savingMonth   = Math.max(0, costCurrent - costCatapulta);
    const savingYear    = savingMonth * 12;

    // Actualizar labels
    const salesVal = parseFloat(sliderSales.value);
    const rateVal  = parseFloat(sliderRate.value) / 100;
    document.getElementById('valSales').textContent =
      '$' + salesVal.toLocaleString('en-US');
    document.getElementById('valRate').textContent  =
      rateVal.toFixed(2) + '%';

    // Animar resultados
    animateValue(document.getElementById('resCurrent'),    costCurrent);
    animateValue(document.getElementById('resCatapulta'),  costCatapulta);
    animateValue(document.getElementById('resSavingMonth'),savingMonth);
    animateValue(document.getElementById('resSavingYear'), savingYear);

    // Actualizar tracks
    updateThumb(sliderSales, document.getElementById('fillSales'));
    updateThumb(sliderRate,  document.getElementById('fillRate'));
  }

  // Inicializar posición de thumbs
  updateThumb(sliderSales, document.getElementById('fillSales'));
  updateThumb(sliderRate,  document.getElementById('fillRate'));

  sliderSales.addEventListener('input', calculate);
  sliderRate.addEventListener('input',  calculate);

  // Correr cálculo inicial
  calculate();
}

/* ────────────────────────────────────────────
   12. SCROLL TO TOP BUTTON
──────────────────────────────────────────── */
function initScrollTopBtn() {
  const btn = document.querySelector('.scroll-top-btn');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ────────────────────────────────────────────
   13. THEME TOGGLE — dark / light
──────────────────────────────────────────── */
function initThemeToggle() {
  const btn  = document.getElementById('themeToggle');
  const html = document.documentElement;
  if (!btn) return;

  // Recuperar preferencia guardada
  const saved = localStorage.getItem('cpay-theme') || 'dark';
  html.setAttribute('data-theme', saved);

  function applyTheme(next) {
    html.setAttribute('data-theme', next);
    localStorage.setItem('cpay-theme', next);
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  btn.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });

  // Sincronizar botón de tema en menú móvil
  const btnMobile = document.getElementById('themeToggleMobile');
  if (btnMobile) {
    btnMobile.addEventListener('click', () => {
      const current = html.getAttribute('data-theme');
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }
}

/* ────────────────────────────────────────────
   14. CATALOG TABS
──────────────────────────────────────────── */
function initCatalogTabs() {
  const tabs = document.querySelectorAll('.catalog-tab');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const brand = tab.dataset.brand;

      // Actualizar tabs
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Actualizar paneles
      document.querySelectorAll('.catalog-panel').forEach(p => {
        p.classList.remove('active');
        p.style.display = 'none';
      });

      const panel = document.getElementById('brand-' + brand);
      if (panel) {
        panel.style.display = 'block';
        // Pequeño delay para que el reveal animation funcione
        setTimeout(() => panel.classList.add('active'), 10);
      }
    });
  });

  // Asegurar que el primer panel esté visible
  const firstPanel = document.getElementById('brand-dejavoo');
  if (firstPanel) firstPanel.style.display = 'block';
}

/* ────────────────────────────────────────────
   15. FAQ — acordeón (una respuesta a la vez)
──────────────────────────────────────────── */
function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer   = item.querySelector('.faq-answer');
    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isOpen = question.getAttribute('aria-expanded') === 'true';

      // Cerrar todas las demás
      items.forEach(other => {
        if (other === item) return;
        const q = other.querySelector('.faq-question');
        const a = other.querySelector('.faq-answer');
        if (q) q.setAttribute('aria-expanded', 'false');
        if (a) a.classList.remove('open');
      });

      question.setAttribute('aria-expanded', String(!isOpen));
      answer.classList.toggle('open', !isOpen);
    });
  });
}

/* ────────────────────────────────────────────
   16. MODAL — TÉRMINOS Y CONDICIONES
   Se abre solo al hacer clic en el link/botón
   correspondiente, nunca navega a otra página.
──────────────────────────────────────────── */
function initTermsModal() {
  const modal   = document.getElementById('termsModal');
  const openBtns = [document.getElementById('openTerms'), document.getElementById('openTermsFooter')].filter(Boolean);
  const closeBtn = document.getElementById('closeTerms');
  if (!modal || !openBtns.length) return;

  let lastFocused = null;

  function openModal(e) {
    if (e) e.preventDefault();
    lastFocused = document.activeElement;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn?.focus();
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  openBtns.forEach(btn => btn.addEventListener('click', openModal));
  closeBtn?.addEventListener('click', closeModal);

  // Cerrar al hacer clic fuera de la tarjeta
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Cerrar con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
}

/* ────────────────────────────────────────────
   17. SIMULADOR DE TERMINAL POS
   Teclado numérico, métodos de pago, ticket
   y tarjetas arrastrables sobre el terminal.
──────────────────────────────────────────── */

/* Strings traducibles — actualizados por I18N.apply() */
window.TERM = {
  screenLabel:     'Ingresa monto',
  processing:      'Procesando',
  approved:        'APROBADO',
  thanks:          'Gracias por su compra',
  chipLabel:       'Chip · CatapultaPay ••4521',
  nfcLabel:        'NFC · Apple/Google Pay',
  swipeLabel:      'Banda · CatapultaPay ••8834',
  ticketDate:      'Fecha',
  ticketTime:      'Hora',
  ticketTxn:       'TXN',
  ticketMethod:    'Método',
  ticketSubtotal:  'Subtotal',
  ticketNet:       'Neto recibido',
  ticketApproved:  'PAGO APROBADO',
  ticketThanks:    'Gracias por usar CatapultaPay',
  ticketLocale:    'es-MX',
  approachCard:    'Acerca tu tarjeta',
  approachSub:     'o toca el lector',
  approachHint:    'NFC · CHIP · SWIPE',
  cancelBtn:       '✕ Cancelar',
  noAmountTitle:   'Ingresa el monto',
  noAmountSub:     'antes de acercar\nla tarjeta',
  resetBtn:        'Reiniciar terminal',
  dragHint:        'Arrastra la tarjeta sobre el terminal',
};

/* Sincronizar TERM con el idioma guardado al cargar */
(function syncTermOnLoad() {
  const saved = localStorage.getItem('cpay-lang') || 'es';
  if (saved === 'en') {
    const enMap = {
      screenLabel:    'Enter amount',
      processing:     'Processing',
      approved:       'APPROVED',
      thanks:         'Thank you for your purchase',
      chipLabel:      'Chip · CatapultaPay ••4521',
      nfcLabel:       'NFC · Apple/Google Pay',
      swipeLabel:     'Swipe · CatapultaPay ••8834',
      ticketDate:     'Date',
      ticketTime:     'Time',
      ticketTxn:      'TXN',
      ticketMethod:   'Method',
      ticketSubtotal: 'Subtotal',
      ticketNet:      'Net received',
      ticketApproved: 'PAYMENT APPROVED',
      ticketThanks:   'Thank you for using CatapultaPay',
      ticketLocale:   'en-US',
      approachCard:   'Tap or swipe your card',
      approachSub:    'near the reader',
      approachHint:   'NFC · CHIP · SWIPE',
      cancelBtn:      '✕ Cancel',
      noAmountTitle:  'Enter amount first',
      noAmountSub:    'before tapping\nyour card',
      resetBtn:       'Reset terminal',
      dragHint:       'Drag card onto the terminal',
    };
    Object.assign(window.TERM, enMap);
  }
})();

let rawCents = 0;
let busy = false;
window.activeMethod = { method:'chip', icon:'ti-credit-card', label: window.TERM.chipLabel };

function clock() {
  const n = new Date();
  const el = document.getElementById('posClk');
  if (el) el.textContent = String(n.getHours()).padStart(2,'0') + ':' + String(n.getMinutes()).padStart(2,'0');
}
clock(); setInterval(clock, 20000);

function fmtMoney(cents) {
  const d = (cents / 100).toFixed(2);
  const parts = d.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return '$' + parts.join('.');
}

function updateDisplay() {
  const el = document.getElementById('screenAmt');
  if (!el) return;
  el.innerHTML = (rawCents > 0 ? fmtMoney(rawCents) : '$0.00') + '<span class="screen-entry-cursor"></span>';
  el.className = 'screen-entry-value' + (rawCents > 0 ? ' has-value' : '');
  const amt = rawCents / 100;
  const fee = amt * 0.0189;
  document.getElementById('sumAmt').textContent = fmtMoney(rawCents);
  document.getElementById('sumFee').textContent = '$' + fee.toFixed(2);
  document.getElementById('sumNet').textContent = '$' + (amt - fee).toFixed(2);

  /* Indicador visual: hint de "OK" cuando hay monto válido */
  const okKey = document.querySelector('.skey-ok');
  if (okKey) {
    if (rawCents >= 100 && !busy) {
      okKey.style.animation = 'dotGlow 1.2s ease-in-out infinite';
      okKey.style.boxShadow = '0 0 8px rgba(10,171,144,0.6)';
    } else {
      okKey.style.animation = '';
      okKey.style.boxShadow = '';
    }
  }
}

function padPress(key) {
  if (busy) return;
  if (key === 'DEL') {
    rawCents = Math.floor(rawCents / 10);
    updateDisplay();
  } else if (key === 'OK') {
    if (rawCents >= 100) {
      /* Solo muestra el prompt — no procesa hasta que arrastren la tarjeta */
      const sb = document.getElementById('screenBody');
      if (!sb) return;
      sb.innerHTML = `
        <div class="screen-processing-wrap">
          <div style="font-size:24px;color:#45C0E8;animation:floatUp 1.5s ease-in-out infinite;">
            <i class="ti ti-credit-card"></i>
          </div>
          <div style="font-size:11px;font-weight:700;color:#D8E8F5;margin-top:4px;">
            ${fmtMoney(rawCents)}
          </div>
         <div style="font-size:9px;color:#45C0E8;margin-top:6px;text-align:center;line-height:1.6;">
        ${window.TERM.approachCard}<br/>${window.TERM.approachSub}
      </div>
      <div style="margin-top:8px;display:flex;align-items:center;gap:5px;">
        <div style="width:28px;height:2px;background:rgba(69,192,232,0.2);border-radius:2px;overflow:hidden;position:relative;">
          <div style="position:absolute;top:0;left:-100%;width:100%;height:100%;background:#45C0E8;animation:readerSwipe 1.4s ease-in-out infinite;"></div>
        </div>
        <span style="font-size:7px;color:#2a3560;letter-spacing:0.5px;">${window.TERM.approachHint}</span>
        <div style="width:28px;height:2px;background:rgba(69,192,232,0.2);border-radius:2px;overflow:hidden;position:relative;">
          <div style="position:absolute;top:0;left:-100%;width:100%;height:100%;background:#45C0E8;animation:readerSwipe 1.4s ease-in-out infinite 0.7s;"></div>
        </div>
      </div>
      <div style="margin-top:8px;">
        <div class="skey skey-del" onclick="cancelWait()" style="font-size:8px;padding:3px 10px;width:auto;display:inline-block;">${window.TERM.cancelBtn}</div>
      </div>
        </div>`;
      window._waitingForCard = true;
    }
  } else {
    if (rawCents > 9999999) return;
    rawCents = rawCents * 10 + parseInt(key);
    updateDisplay();
  }
}

function cancelWait() {
  window._waitingForCard = false;
  const sb = document.getElementById('screenBody');
  if (sb) sb.innerHTML = getIdleScreen();
}

function pickMethod(el) {
  if (busy) return;
  document.querySelectorAll('.mcard').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  window.activeMethod = { method: el.dataset.method, icon: el.dataset.icon, label: el.dataset.label };
  const mt = document.getElementById('screenMethodTxt');
  if (mt) mt.textContent = window.activeMethod.label;
  const mi = document.querySelector('#screenMethod i');
  if (mi) { mi.className = 'ti ' + window.activeMethod.icon; mi.style.fontSize = '9px'; }
}

function doCharge() {
  if (busy || rawCents < 100) return;
  window._waitingForCard = false;
  busy = true;
  document.getElementById('chargeBtn').disabled = true;
  document.getElementById('ticketArea').classList.remove('open');
  const sb  = document.getElementById('screenBody');
  const rg  = document.getElementById('readerGlow');
  const led = document.getElementById('printerLed');

  /* ── PASO 1: Pide pasar la tarjeta ── */
  sb.innerHTML = `
    <div class="screen-processing-wrap">
      <div style="font-size:22px;color:#45C0E8;margin-bottom:4px;animation:floatUp 1.5s ease-in-out infinite;">
        <i class="ti ti-credit-card"></i>
      </div>
      <div style="font-size:10px;font-weight:700;color:#D8E8F5;letter-spacing:0.5px;">
        ${fmtMoney(rawCents)}
      </div>
      <div style="font-size:9px;color:#45C0E8;margin-top:6px;text-align:center;line-height:1.5;">
        ${window.TERM.approachCard}<br/>${window.TERM.approachSub}
      </div>
      <div style="margin-top:8px;display:flex;align-items:center;gap:5px;">
        <div style="width:28px;height:2px;background:rgba(69,192,232,0.2);border-radius:2px;overflow:hidden;position:relative;">
          <div style="position:absolute;top:0;left:-100%;width:100%;height:100%;background:#45C0E8;animation:readerSwipe 1.4s ease-in-out infinite;"></div>
        </div>
        <span style="font-size:7px;color:#2a3560;">${window.TERM.approachHint}</span>
        <div style="width:28px;height:2px;background:rgba(69,192,232,0.2);border-radius:2px;overflow:hidden;position:relative;">
          <div style="position:absolute;top:0;left:-100%;width:100%;height:100%;background:#45C0E8;animation:readerSwipe 1.4s ease-in-out infinite 0.7s;"></div>
        </div>
      </div>
    </div>`;

  /* ── PASO 2: Simula el deslizamiento a los 2s ── */
  setTimeout(() => {
    /* animación del lector físico */
    rg.classList.remove('active'); void rg.offsetWidth; rg.classList.add('active');
    led.classList.add('blink');

    sb.innerHTML = `
      <div class="screen-processing-wrap">
        <div class="spin-ring"></div>
        <div class="proc-label">${window.TERM.processing}<span class="proc-dots"></span></div>
        <div style="font-size:8px;color:#2a3560;margin-top:3px;">${window.activeMethod.label}</div>
      </div>`;
  }, 2200);

  /* ── PASO 3: Aprobado + ticket ── */
  setTimeout(() => {
    led.classList.remove('blink');
    const auth = 'AUTH' + (Math.floor(Math.random()*900000)+100000);
    sb.innerHTML = `
      <div class="screen-success-wrap">
        <div class="ok-ring"><i class="ti ti-check" style="font-size:18px;"></i></div>
        <div class="ok-label">${window.TERM.approved}</div>
        <div class="ok-amount">${fmtMoney(rawCents)}</div>
        <div class="ok-auth">${auth}</div>
        <div class="ok-thanks">${window.TERM.thanks}</div>
      </div>`;
    renderTicket(auth);

    /* parpadeo del LED de impresora simulando impresión */
    let blinks = 0;
    const blinkInterval = setInterval(() => {
      led.classList.toggle('blink');
      blinks++;
      if (blinks >= 6) { clearInterval(blinkInterval); led.classList.remove('blink'); }
    }, 300);

    setTimeout(() => {
      busy = false; rawCents = 0; updateDisplay();
      sb.innerHTML = getIdleScreen();
    }, 7000);
  }, 5200);
}

function getIdleScreen() {
  return `
    <div class="screen-amount-display">
      <span class="screen-entry-label">${window.TERM.screenLabel}</span>
      <span class="screen-entry-value" id="screenAmt">$0.00<span class="screen-entry-cursor"></span></span>
    </div>
    <div class="screen-method-row" id="screenMethod">
      <i class="ti ${window.activeMethod.icon}" style="font-size:9px;"></i>
      <span id="screenMethodTxt">${window.activeMethod.label}</span>
    </div>
    <div class="screen-numpad">
      <div class="skey" onclick="padPress('1')">1</div>
      <div class="skey" onclick="padPress('2')">2</div>
      <div class="skey" onclick="padPress('3')">3</div>
      <div class="skey" onclick="padPress('4')">4</div>
      <div class="skey" onclick="padPress('5')">5</div>
      <div class="skey" onclick="padPress('6')">6</div>
      <div class="skey" onclick="padPress('7')">7</div>
      <div class="skey" onclick="padPress('8')">8</div>
      <div class="skey" onclick="padPress('9')">9</div>
      <div class="skey skey-del" onclick="padPress('DEL')">⌫ CLR</div>
      <div class="skey" onclick="padPress('0')">0</div>
      <div class="skey skey-ok" onclick="padPress('OK')">✓ OK</div>
    </div>`;
}

function renderTicket(auth) {
  const now    = new Date();
  const locale = window.TERM.ticketLocale;
  const ds     = now.toLocaleDateString(locale, {day:'2-digit', month:'2-digit', year:'numeric'});
  const ts     = now.toLocaleTimeString(locale, {hour:'2-digit', minute:'2-digit', second:'2-digit'});
  const txn    = 'TXN-' + (Math.floor(Math.random()*9000000)+1000000);
  const amtVal = rawCents / 100;
  const fee    = (amtVal * 0.0189).toFixed(2);
  const netFmt = (amtVal - parseFloat(fee)).toLocaleString('en-US', {minimumFractionDigits:2});
  const methodSym = window.activeMethod.method==='nfc'?'((NFC))':window.activeMethod.method==='swipe'?'[SWIPE]':'[CHIP]';
  document.getElementById('ticketContent').innerHTML = `
    <div class="ticket-stripe"></div>
    <div class="t-center" style="padding-top:4px;">
      <div class="t-brand">CATAPULTAPAY</div>
      <div class="t-sub">catapultapay.com · PCI DSS v4</div>
    </div>
    <hr class="t-hr">
    <div class="t-row"><span class="t-key">${window.TERM.ticketDate}</span><span class="t-val">${ds}</span></div>
    <div class="t-row"><span class="t-key">${window.TERM.ticketTime}</span><span class="t-val">${ts}</span></div>
    <div class="t-row"><span class="t-key">${window.TERM.ticketTxn}</span><span class="t-val">${txn}</span></div>
    <div class="t-row"><span class="t-key">${window.TERM.ticketMethod}</span><span class="t-val">${methodSym} ${window.activeMethod.label}</span></div>
    <hr class="t-hr">
    <div class="t-row"><span class="t-key">${window.TERM.ticketSubtotal}</span><span class="t-val">${fmtMoney(rawCents)}</span></div>
    <div class="t-row"><span class="t-key">${window.TERM.ticketNet}</span><span class="t-val t-total">$${netFmt}</span></div>
    <hr class="t-hr">
    <div class="t-center">
      <div style="font-size:20px;color:#0aab90;"><i class="ti ti-circle-check"></i></div>
      <div class="t-ok">${window.TERM.ticketApproved}</div>
      <div class="t-auth">${auth}</div>
    </div>
    <hr class="t-hr">
    <div class="t-center t-footer">+1 (310) 948-6153 · info@catapultapay.com<br>${window.TERM.ticketThanks}</div>`;
  document.getElementById('ticketArea').classList.add('open');
}

function resetTerminal() {
  if (busy) return;
  rawCents = 0;
  window._waitingForCard = false;
  window.activeMethod = { method:'chip', icon:'ti-credit-card', label: window.TERM.chipLabel };

  /* Resetear método activo en el panel */
  document.querySelectorAll('.mcard').forEach(c => c.classList.remove('active'));
  const chipCard = document.querySelector('.mcard[data-method="chip"]');
  if (chipCard) chipCard.classList.add('active');

  /* Resetear pantalla */
  const sb = document.getElementById('screenBody');
  if (sb) sb.innerHTML = getIdleScreen();

  /* Cerrar ticket */
  const ta = document.getElementById('ticketArea');
  if (ta) ta.classList.remove('open');

  /* Flash visual de reinicio en el device */
  const device = document.querySelector('.pos-device');
  if (device) {
    device.style.transition = 'opacity 0.15s ease';
    device.style.opacity = '0.3';
    setTimeout(() => { device.style.opacity = '1'; }, 180);
  }

  /* LED parpadeo rápido */
  const led = document.getElementById('printerLed');
  if (led) {
    led.classList.add('blink');
    setTimeout(() => led.classList.remove('blink'), 600);
  }

  updateDisplay();
}

updateDisplay();

/* ── Drag & Drop cards → terminal ── */
(function initDragCards() {
  const cards   = document.querySelectorAll('.drag-card');
  const device  = document.querySelector('.pos-device');
  if (!cards.length || !device) return;

  /* ── Ghost visual que sigue al cursor ── */
  const ghost = document.createElement('div');
  ghost.id = 'dragGhost';
  ghost.style.cssText = `
    position: fixed; pointer-events: none !important; z-index: 99998;
    width: 118px; height: 72px; border-radius: 8px;
    display: none; flex-direction: column; justify-content: space-between;
    padding: 9px 11px 8px;
    font-size: 11px; font-weight: 600; letter-spacing: 0.5px;
    color: #fff; opacity: 0;
    transition: opacity 0.15s ease, transform 0.15s ease;
    box-shadow: 0 16px 40px rgba(0,0,0,0.6), 0 0 0 1.5px rgba(10,171,144,0.5);
    user-select: none; -webkit-user-select: none;
    touch-action: none;
  `;
  ghost.setAttribute('aria-hidden', 'true');
  ghost.setAttribute('inert', '');
  document.body.appendChild(ghost);

  let activeCard = null;
  let dragMethod = null;
  let offsetX = 0, offsetY = 0;
  let overDevice = false;

  function moveGhost(e) {
    if (e.cancelable) e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    ghost.style.left = (clientX - offsetX) + 'px';
    ghost.style.top  = (clientY - offsetY) + 'px';

    // Detectar si está sobre el device
    const dr = device.getBoundingClientRect();
    const inside = clientX >= dr.left && clientX <= dr.right &&
                   clientY >= dr.top  && clientY <= dr.bottom;

    if (inside !== overDevice) {
      overDevice = inside;
      device.classList.toggle('drop-active', inside);
      ghost.style.transform = inside
        ? 'scale(1.08) rotate(-4deg)'
        : 'scale(1) rotate(-6deg)';
      ghost.style.boxShadow = inside
        ? '0 20px 50px rgba(0,0,0,0.7), 0 0 0 2px rgba(10,171,144,0.9)'
        : '0 16px 40px rgba(0,0,0,0.6), 0 0 0 1.5px rgba(10,171,144,0.5)';
    }
  }

  function startDrag(card, e) {
    if (busy) return;
    const rect = card.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    offsetX = clientX - rect.left;
    offsetY = clientY - rect.top;

    activeCard = card;
    dragMethod = {
      method: card.dataset.method,
      icon:   card.dataset.icon,
      label:  card.dataset.label,
    };

    // Clonar apariencia en el ghost
    ghost.style.background = card.style.background ||
      getComputedStyle(card).background;
    ghost.innerHTML = card.innerHTML;
    ghost.style.left = (clientX - offsetX) + 'px';
    ghost.style.top  = (clientY - offsetY) + 'px';
    ghost.style.display = 'flex';
    ghost.style.flexDirection = 'column';
    ghost.style.justifyContent = 'space-between';
    ghost.style.padding = '9px 11px 8px';

    // Copiar background exacto
    ghost.style.background = card.classList.contains('drag-card--dark')
      ? 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1e 100%)'
      : 'linear-gradient(135deg, #0ecfad 0%, #0aab90 38%, #0d2247 100%)';

    requestAnimationFrame(() => {
      ghost.style.opacity = '1';
      ghost.style.transform = 'scale(1) rotate(-6deg)';
    });

    card.style.opacity = '0.4';
    card.style.transform = 'scale(0.95)';

    document.addEventListener('mousemove', moveGhost);
    document.addEventListener('touchmove', moveGhost, { passive: false });
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
  }

  function endDrag(e) {
    document.removeEventListener('mousemove', moveGhost);
    document.removeEventListener('touchmove', moveGhost);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchend', endDrag);

    if (!activeCard) return;

    const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
    const dr = device.getBoundingClientRect();
    const dropped = clientX >= dr.left && clientX <= dr.right &&
                    clientY >= dr.top  && clientY <= dr.bottom;

    if (dropped && dragMethod) {
      /* ── Animar ghost hacia el lector ── */
      const readerRect = document.querySelector('.pos-reader-strip').getBoundingClientRect();
      ghost.style.transition = 'left 0.35s cubic-bezier(0.23,1,0.32,1), top 0.35s cubic-bezier(0.23,1,0.32,1), transform 0.35s ease, opacity 0.35s ease';
      ghost.style.left    = (readerRect.left + readerRect.width/2  - 59) + 'px';
      ghost.style.top     = (readerRect.top  + readerRect.height/2 - 36) + 'px';
      ghost.style.transform = 'scale(0.7) rotate(0deg)';

      /* ── Parpadeo en el lector ── */
      const rg = document.getElementById('readerGlow');
      const led = document.getElementById('printerLed');
      setTimeout(() => {
        if (rg) { rg.classList.remove('active'); void rg.offsetWidth; rg.classList.add('active'); }
        if (led) led.classList.add('blink');
      }, 320);

      /* ── Ghost se queda 1.2s, luego desaparece ── */
      setTimeout(() => {
        ghost.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        ghost.style.opacity   = '0';
        ghost.style.transform = 'scale(0.5) rotate(0deg)';
        if (led) led.classList.remove('blink');
      }, 1050);

      setTimeout(() => {
        ghost.style.display = 'none';
        ghost.style.transition = '';
      }, 1380);

      /* ── Seleccionar método y procesar ── */
      const targetCard = document.querySelector(`.mcard[data-method="${dragMethod.method}"]`);
      if (targetCard) {
        document.querySelectorAll('.mcard').forEach(c => c.classList.remove('active'));
        targetCard.classList.add('active');
        window.activeMethod = { ...dragMethod };

        const mt = document.getElementById('screenMethodTxt');
        if (mt) mt.textContent = dragMethod.label;
        const mi = document.querySelector('#screenMethod i');
        if (mi) { mi.className = 'ti ' + dragMethod.icon; mi.style.fontSize = '9px'; }
      }

      if (rawCents >= 100 && !busy) {
        setTimeout(() => doCharge(), 1100);
      } else if (rawCents < 100 && !busy) {
        /* Sin monto: la pantalla pide que ingresen el monto primero */
        const sb = document.getElementById('screenBody');
        if (sb) {
          const orig = sb.innerHTML;
          sb.innerHTML = `
            <div class="screen-processing-wrap">
              <div style="font-size:20px;color:#E8C97A;">
                <i class="ti ti-alert-triangle"></i>
              </div>
              <div style="font-size:9px;color:#E8C97A;margin-top:6px;text-align:center;line-height:1.6;">
                ${window.TERM.noAmountTitle}<br/>${window.TERM.noAmountSub.replace('\n','<br/>')}
              </div>
            </div>`;
          setTimeout(() => { sb.innerHTML = getIdleScreen(); }, 2000);
        }
      }

    } else {
      /* ── Drop fuera: regresar ── */
      ghost.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      ghost.style.opacity   = '0';
      ghost.style.transform = 'scale(0.8) rotate(0deg)';
      setTimeout(() => {
        ghost.style.display = 'none';
        ghost.style.transition = '';
      }, 260);
    }

    device.classList.remove('drop-active');
    activeCard.style.opacity  = '';
    activeCard.style.transform = '';
    activeCard = null;
    dragMethod = null;
    overDevice = false;
  }

  cards.forEach(card => {
    card.addEventListener('mousedown',  e => { e.preventDefault(); startDrag(card, e); });
    card.addEventListener('touchstart', e => { e.preventDefault(); startDrag(card, e); }, { passive: false });
    card.setAttribute('draggable', 'false'); // usar nuestro propio drag
  });
})();

/* ────────────────────────────────────────────
   LAZY LOAD VIDEO
──────────────────────────────────────────── */
(function initLazyVideo() {
  const video = document.querySelector('video[data-src]');
  if (!video) return;

  let loaded = false;

  function loadVideo() {
    if (loaded) return;
    loaded = true;

    const source = document.createElement('source');
    source.src  = video.dataset.src;
    source.type = 'video/mp4';
    video.appendChild(source);
    video.load();

    video.addEventListener('canplaythrough', () => {
      video.play().catch(() => {});
    }, { once: true });

    video.addEventListener('loadeddata', () => {
      setTimeout(() => {
        if (video.paused) video.play().catch(() => {});
      }, 300);
    }, { once: true });
  }

  // Carga UNA vez cuando entra en pantalla
  const loadObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        loadVideo();
        loadObserver.unobserve(video);
      }
    });
  }, { rootMargin: '100px 0px' });

  loadObserver.observe(video);

  // Pausa/reanuda según visibilidad real — esto es lo que ahorra batería y CPU
  const playObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!loaded) return;
      if (entry.isIntersecting) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.15 });

  playObserver.observe(video);
})();
