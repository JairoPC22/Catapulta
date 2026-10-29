'use strict';
document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.dataset.theme = CP.storage.get('cpay-theme') === 'light' ? 'light' : 'dark';
  function language(next) {
    const lang = next === 'en' ? 'en' : 'es';
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-language]').forEach(element => { element.hidden = element.dataset.language !== lang; });
    document.querySelectorAll('.lang-btn').forEach(button => { const active = button.dataset.lang === lang; button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active)); });
    document.title = document.body.dataset[lang === 'en' ? 'titleEn' : 'titleEs'] + ' | CatapultaPayment';
    CP.storage.set('cpay-lang', lang);
  }
  document.querySelectorAll('.lang-btn').forEach(button => button.addEventListener('click', () => language(button.dataset.lang)));
  language(CP.storage.get('cpay-lang', 'es'));
  document.getElementById('clearPreferences')?.addEventListener('click', () => {
    CP.storage.remove('cpay-theme'); CP.storage.remove('cpay-lang'); CP.storage.remove('cpay-sound');
    document.getElementById('preferenceStatus').textContent = document.documentElement.lang === 'en' ? 'Theme, language and sound preferences cleared. Previously sent messages were not deleted.' : 'Preferencias de tema, idioma y sonido borradas. Esto no elimina mensajes enviados anteriormente.';
  });
});
