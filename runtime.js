'use strict';
// Shared browser utilities. Storage failure must never prevent a page from working.
window.CP = (() => {
  const locks = new Set();
  let previousOverflow = '';
  const storage = {
    get(key, fallback = '') { try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch { /* Private/blocked storage. */ } },
    remove(key) { try { localStorage.removeItem(key); } catch { /* Private/blocked storage. */ } }
  };
  return {
    storage,
    reducedMotion: () => matchMedia('(prefers-reduced-motion: reduce)').matches,
    syncThemeLabels() {
      const light = document.documentElement.dataset.theme !== 'light';
      const en = document.documentElement.lang === 'en';
      const label = en ? (light ? 'Light mode' : 'Dark mode') : (light ? 'Modo claro' : 'Modo oscuro');
      document.querySelectorAll('.mobile-theme-label').forEach(element => { element.textContent = label; });
      document.querySelectorAll('.theme-toggle').forEach(button => { button.setAttribute('aria-label', en ? 'Switch to ' + label.toLowerCase() : 'Cambiar a ' + label.toLowerCase()); });
    },
    syncThemeLabels() {
      const light = document.documentElement.dataset.theme !== 'light';
      const en = document.documentElement.lang === 'en';
      const label = en ? (light ? 'Light mode' : 'Dark mode') : (light ? 'Modo claro' : 'Modo oscuro');
      document.querySelectorAll('.mobile-theme-label').forEach(element => { element.textContent = label; });
      document.querySelectorAll('.theme-toggle').forEach(button => { button.setAttribute('aria-label', en ? 'Switch to ' + label.toLowerCase() : 'Cambiar a ' + label.toLowerCase()); });
    },
    lockScroll(owner) {
      if (!locks.size) previousOverflow = document.body.style.overflow;
      locks.add(owner);
      document.body.style.overflow = 'hidden';
    },
    unlockScroll(owner) {
      locks.delete(owner);
      if (!locks.size) document.body.style.overflow = previousOverflow;
    }
  };
})();
