'use strict';
// Independent bootstrap: failures in optional audio never keep the loader open.
(() => {
  const loader = document.getElementById('siteLoader');
  if (!loader) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const started = performance.now();
  const audio = document.getElementById('brandAudio');
  const storageKey = 'cpay-sound';
  let enabled = true;
  try { enabled = localStorage.getItem(storageKey) !== 'off'; } catch { /* Storage is optional. */ }
  let attempted = false;
  let finished = false;
  let dismissed = false;
  let maximum;
  let delay;
  const english = () => document.documentElement.lang === 'en';
  const label = (es, en) => english() ? en : es;

  const stopSound = () => {
    if (!audio) return;
    audio.pause();
    try { audio.currentTime = 0; } catch { /* Metadata may not have loaded yet. */ }

  };
  const playSound = () => {
    if (!audio || !enabled || document.hidden || attempted) return;
    attempted = true;

    const fail = error => {
      if (!enabled || document.hidden || error?.name === 'AbortError') return;
      audio.dataset.playback = error?.name === 'NotAllowedError' ? 'blocked' : 'unavailable';
    };
    try {
      audio.volume = 0.28;
      Promise.resolve(audio.play()).then(() => { audio.dataset.playback = 'playing'; }).catch(fail);
    } catch (error) { fail(error); }
  };
  if (audio) {
    audio.loop = false;
    audio.volume = 0.28;
    if (enabled) { audio.preload = 'auto'; audio.load(); }
    audio.addEventListener('play', () => { if (!enabled) stopSound(); });
    audio.addEventListener('error', () => { audio.dataset.playback = 'unavailable'; });
  }
  const updateLabels = () => {
    const el = loader.querySelector('.loader-status-text');
    if (el) el.textContent = label('Preparando tu experiencia', 'Preparing your experience');
    const tagline = loader.querySelector('.loader-tagline');
    if (tagline) tagline.textContent = label('Pagos simples. Negocios que crecen.', 'Simple payments. Growing businesses.');
  };
  new MutationObserver(updateLabels).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  updateLabels();
  const arcs = typeof loader.querySelectorAll === 'function' ? [...loader.querySelectorAll('.lg-arc')] : [];
  if (arcs.length && typeof requestAnimationFrame === 'function' && !reduced.matches) {
    // Medir todos los arcos antes de escribir estilos evita intercalar
    // lectura/escritura (layout thrashing) en el primer frame.
    const lengths = arcs.map(arc => arc.getTotalLength());
    arcs.forEach((arc, index) => {
      arc.style.strokeDasharray = String(lengths[index]);
      arc.style.strokeDashoffset = String(lengths[index]);
    });
    requestAnimationFrame(() => requestAnimationFrame(() => {
      arcs.forEach(arc => { arc.style.strokeDashoffset = '0'; });
      loader.classList.add('lg-dot-in');
    }));
  }
  const guardKeyboard = event => {
    if (event.key === 'Escape') { dismissed = true; finish(false); }
  };
  const finish = (withSound = true) => {
    if (finished) return;
    finished = true;
    clearTimeout(maximum);
    clearTimeout(delay);
    document.removeEventListener('keydown', guardKeyboard, true);
    if (withSound) playSound();
    loader.classList.add('is-leaving');
    setTimeout(() => {
      loader.hidden = true;
      document.documentElement.classList.remove('is-loading');
      document.documentElement.dataset.pageReady = 'true';
      document.dispatchEvent(new Event('catapulta:ready'));
      if (dismissed) document.querySelector('#hero .btn-primary')?.focus({ preventScroll: true });
    }, reduced.matches ? 0 : 600);
  };
  // Shows the brand loader for a fixed ~2s on every load (skippable with
  // Escape): long enough for the icon-draw + brand-reveal sequence in
  // page-state.css to finish (~1.9s) before the page is revealed.
  const MIN_DISPLAY_MS = 2000;
  loader.hidden = false;
  document.documentElement.classList.add('is-loading');
  document.addEventListener('keydown', guardKeyboard, true);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopSound(); });
  maximum = setTimeout(finish, MIN_DISPLAY_MS + 1500);
  document.addEventListener('DOMContentLoaded', async () => {
    await Promise.race([document.fonts.ready, new Promise(resolve => setTimeout(resolve, 1000))]);
    delay = setTimeout(finish, Math.max(0, (reduced.matches ? 0 : MIN_DISPLAY_MS) - (performance.now() - started)));
  }, { once: true });
})();
