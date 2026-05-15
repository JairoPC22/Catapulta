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
  initTiltCards();
  initBarAnimations();
  initContactForm();
  initSavingsCalculator();
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
  const btn       = document.getElementById('navHamburger');
  const menu      = document.getElementById('mobileMenu');
  const iconMenu  = document.getElementById('iconMenu');
  const iconClose = document.getElementById('iconClose');

  if (!btn || !menu) return;

  let isOpen = false;

  function toggleMenu() {
    isOpen = !isOpen;
    menu.classList.toggle('open', isOpen);
    btn.setAttribute('aria-expanded', String(isOpen));
    menu.setAttribute('aria-hidden', String(!isOpen));

    if (iconMenu && iconClose) {
      iconMenu.style.display  = isOpen ? 'none'  : '';
      iconClose.style.display = isOpen ? ''      : 'none';
    }
  }

  btn.addEventListener('click', toggleMenu);

  // Cerrar menú al hacer clic en un link del menú móvil
  const mobileLinks = menu.querySelectorAll('.mobile-link, .mobile-cta');
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (isOpen) toggleMenu();
    });
  });
}

/* ────────────────────────────────────────────
   3. PARTÍCULAS EN CANVAS (hero)
   65 partículas con líneas de conexión
──────────────────────────────────────────── */
function initParticleCanvas() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const PARTICLE_COUNT = 65;
  const MAX_DIST       = 110;
  const TEAL           = 'rgba(14, 207, 173,';
  let   particles      = [];
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
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MAX_DIST) {
          const alpha = 1 - dist / MAX_DIST;
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
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Solo animar una vez
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px',
  });

  // Aplicar delay escalonado a grupos de tarjetas
  const cardGroups = document.querySelectorAll('.solutions-grid, .testimonials-grid, .feature-cards, .contact-cards');

  cardGroups.forEach(group => {
    const cards = group.querySelectorAll('.reveal, .testi-card, .sol-card, .feature-card, .contact-card');
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
    card.addEventListener('mousemove', (e) => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / INTENSITY;
      const dy     = (e.clientY - cy) / INTENSITY;

      card.style.transform = `perspective(600px) rotateX(${-dy}deg) rotateY(${dx}deg) translateY(-4px)`;
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
   Previene default y muestra toast de éxito
──────────────────────────────────────────── */
function initContactForm() {
  const form  = document.getElementById('contactForm');
  const toast = document.getElementById('toast');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Validación básica
    const required = form.querySelectorAll('[required]');
    let valid = true;

    required.forEach(field => {
      if (!field.value.trim()) {
        valid = false;
        field.style.borderColor = 'rgba(255, 100, 100, 0.5)';
        setTimeout(() => {
          field.style.borderColor = '';
        }, 2500);
      }
    });

    if (!valid) return;

    // Mostrar toast de confirmación
    showToast();

    // Opcional: resetear el formulario
    form.reset();
  });

  function showToast() {
    if (!toast) return;

    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }
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

  const CATAPULTA_RATE = 1.89; // %

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

  function calculate() {
    const sales       = parseFloat(sliderSales.value);
    const currentRate = parseFloat(sliderRate.value) / 100 / 100; // slider va en basis points *100
    const catRate     = CATAPULTA_RATE / 100;

    const costCurrent   = sales * currentRate;
    const costCatapulta = sales * catRate;
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