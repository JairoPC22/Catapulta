'use strict';
// ══════════════════════════════════════════
// CatapultaPay — improvements.js
// ══════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  initScrollTopBtn();
  initFormLoadingState();
  initThemeToggle();
  initCatalogTabs();
});

/* ────────────────────────────────────────────
   SCROLL TO TOP BUTTON
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
   FORM — loading state
──────────────────────────────────────────── */
function initFormLoadingState() {
  const form   = document.getElementById('contactForm');
  const submit = form ? form.querySelector('button[type="submit"]') : null;
  if (!form || !submit) return;

  form.addEventListener('submit', () => {
    submit.textContent = 'Enviando...';
    submit.disabled = true;

    setTimeout(() => {
      submit.disabled = false;
      submit.innerHTML = 'Enviar mensaje <i data-lucide="arrow-right" aria-hidden="true"></i>';
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 4000);
  });
}

/* ────────────────────────────────────────────
   THEME TOGGLE — dark / light
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
   CATALOG TABS
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