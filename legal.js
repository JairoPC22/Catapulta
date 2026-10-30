'use strict';
document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.dataset.theme = CP.storage.get('cpay-theme') === 'dark' ? 'dark' : 'light';
  window.lucide?.createIcons();
  function applyLanguage(lang) {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-language]').forEach(element => { element.hidden = element.dataset.language !== lang; });
    document.querySelectorAll('.lang-btn').forEach(button => { const active = button.dataset.lang === lang; button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active)); });
    document.title = document.body.dataset[lang === 'en' ? 'titleEn' : 'titleEs'] + ' | CatapultaPayment';
    CP.storage.set('cpay-lang', lang);
  }
  // Mismo efecto de desvanecido que el sitio principal (CP.i18n.switchTo):
  // se atenúa el contenido, se cambia el texto ya atenuado y se vuelve a
  // aclarar, en vez de reemplazar el texto de golpe.
  function switchLanguage(next) {
    const lang = next === 'en' ? 'en' : 'es';
    if (lang === document.documentElement.lang) return;
    const root = document.documentElement;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { applyLanguage(lang); return; }
    let swapped = false;
    const swap = () => {
      if (swapped) return;
      swapped = true;
      applyLanguage(lang);
      requestAnimationFrame(() => root.classList.remove('lang-fade'));
    };
    (document.querySelector('.legal-main') || document.body).addEventListener('transitionend', swap, { once: true });
    window.setTimeout(swap, 300);
    root.classList.add('lang-fade');
  }
  document.querySelectorAll('.lang-btn').forEach(button => button.addEventListener('click', () => switchLanguage(button.dataset.lang)));
  applyLanguage(CP.storage.get('cpay-lang', 'es'));
  document.getElementById('clearPreferences')?.addEventListener('click', () => {
    CP.storage.remove('cpay-theme'); CP.storage.remove('cpay-lang'); CP.storage.remove('cpay-sound');
    document.getElementById('preferenceStatus').textContent = document.documentElement.lang === 'en' ? 'Theme, language and sound preferences cleared. Previously sent messages were not deleted.' : 'Preferencias de tema, idioma y sonido borradas. Esto no elimina mensajes enviados anteriormente.';
  });
});
