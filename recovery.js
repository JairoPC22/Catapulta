'use strict';
document.addEventListener('DOMContentLoaded', () => {
  let language = 'es';
  try {
    document.documentElement.dataset.theme = localStorage.getItem('cpay-theme') === 'light' ? 'light' : 'dark';
    language = localStorage.getItem('cpay-lang') === 'en' ? 'en' : 'es';
  } catch { /* Recovery screens also work with storage disabled. */ }
  document.documentElement.lang = language;
  const kind = document.body.dataset.errorKind;
  if (language === 'en') {
    const copy = {
      '404': ['Page not found', 'This path leads nowhere.', 'The page you are looking for has moved or is no longer available. Start fresh from our homepage.', 'LINK UNAVAILABLE'],
      '500': ['Something went wrong', 'An unexpected pause.', 'We could not load this page. Please try again in a moment or head back to our homepage.', 'PLEASE TRY AGAIN'],
      'offline': ['You are offline', 'Back when you reconnect.', 'Check your WiFi or mobile data and try again. Pages you have already visited may still be available.', 'NO CONNECTION']
    }[kind];
    if (copy) {
      document.title = `${copy[0]} — CatapultaPayment`;
      document.querySelector('h1').textContent = copy[1];
      document.querySelector('.recovery-copy p').textContent = copy[2];
      document.querySelector('.recovery-ticket-label').textContent = copy[3];
      document.querySelector('.recovery-primary').firstChild.textContent = kind === 'offline' ? 'Try again ' : 'Back to home ';
      document.querySelector('.recovery-help').textContent = 'Talk to us';
    }
  }
  if (kind === 'offline') {
    const primary = document.querySelector('.recovery-primary');
    // For an offline fallback, retry the originally requested URL.
    primary.href = location.pathname === '/offline.html' ? '/' : location.href;
    primary.addEventListener('click', event => {
      if (location.pathname !== '/offline.html') { event.preventDefault(); location.reload(); }
    });
  }
});
