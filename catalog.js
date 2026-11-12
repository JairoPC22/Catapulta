'use strict';
document.addEventListener('DOMContentLoaded', () => {
  const FILES = { es: 'assets/files/CatalogoSpanish.pdf', en: 'assets/files/CatalogoEnglish.pdf' };
  const frame = document.getElementById('catalogFrame');
  const loading = document.getElementById('catalogLoading');
  let revealed = false;
  let revealTimer;

  function reveal() {
    if (revealed) return;
    revealed = true;
    clearTimeout(revealTimer);
    frame.classList.add('is-ready');
    loading?.classList.add('is-hidden');
  }

  function applyCatalogFile(lang) {
    const file = FILES[lang] || FILES.es;
    if (frame) frame.title = lang === 'en' ? 'CatapultaPayment equipment catalog' : 'Catálogo de equipos CatapultaPayment';
    document.querySelector('.catalog-viewer')?.setAttribute('aria-label', lang === 'en' ? 'PDF catalog viewer' : 'Visor del catálogo en PDF');
    document.querySelectorAll('.catalog-pdf-link').forEach(a => a.setAttribute('href', file));
    const nameEl = document.getElementById('catalogFileName');
    if (nameEl) nameEl.textContent = file.split('/').pop();
    if (frame && frame.getAttribute('src') !== file) {
      revealed = false;
      frame.classList.remove('is-ready');
      loading?.classList.remove('is-hidden');
      frame.src = file;
      // El iframe puede terminar de cargar antes de que el evento 'load'
      // llegue a dispararse (o el navegador no lo dispare para un PDF);
      // este timeout de seguridad evita que el spinner quede visible para siempre.
      clearTimeout(revealTimer);
      revealTimer = setTimeout(reveal, 1200);
    }
  }

  if (frame) {
    frame.addEventListener('load', reveal);
    try { if (frame.contentDocument?.readyState === 'complete') reveal(); } catch { /* cross-origin, improbable aquí */ }
    revealTimer = setTimeout(reveal, 1200);
  }

  document.addEventListener('cpay:languagechange', event => applyCatalogFile(event.detail.lang));
  applyCatalogFile(document.documentElement.lang);
});
