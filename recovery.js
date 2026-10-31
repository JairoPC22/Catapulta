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
      '404': ['Page not found', 'This path leads nowhere.', 'The page you are looking for has moved or is no longer available. Start fresh from our homepage.', 'LINK UNAVAILABLE', 'NOT FOUND', '/UNKNOWN'],
      '500': ['Something went wrong', 'An unexpected pause.', 'We could not load this page. Please try again in a moment or head back to our homepage.', 'PLEASE TRY AGAIN', 'UNDER REVIEW', '/SERVER'],
      'offline': ['You are offline', 'Back when you reconnect.', 'Check your WiFi or mobile data and try again. Pages you have already visited may still be available.', 'NO CONNECTION', 'DISCONNECTED', '/NO-SIGNAL']
    }[kind];
    if (copy) {
      document.title = `${copy[0]} — CatapultaPayment`;
      document.querySelector('h1').textContent = copy[1];
      document.querySelector('.recovery-copy p').textContent = copy[2];
      document.querySelector('.receipt-stamp').textContent = copy[3];
      document.querySelector('.receipt-status-value').textContent = copy[4];
      document.querySelector('.receipt-label-path').textContent = 'PATH';
      document.querySelector('.receipt-label-status').textContent = 'STATUS';
      document.querySelector('.receipt-label-code').textContent = 'CODE';
      document.querySelector('.recovery-primary').firstChild.textContent = kind === 'offline' ? 'Try again ' : 'Back to home ';
      document.querySelector('.recovery-help').textContent = 'Talk to us';
      document.querySelector('.receipt-foot').textContent = 'THANK YOU FOR VISITING';
      document.documentElement.dataset.fallbackPath = copy[5];
    }
  }
  const pathEl = document.querySelector('.receipt-path-value');
  if (pathEl) {
    // Apache's ErrorDocument keeps the original broken URL in the address
    // bar, so this is usually the real path a visitor tried. Opening this
    // file directly (e.g. for preview) is the one case where it is not.
    const real = location.pathname;
    const isSelf = /\/(404|error|offline)\.html$/.test(real);
    if (!isSelf) pathEl.textContent = (real + location.search).toUpperCase();
    else if (document.documentElement.dataset.fallbackPath) pathEl.textContent = document.documentElement.dataset.fallbackPath;
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
