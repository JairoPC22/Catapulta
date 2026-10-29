'use strict';
// Accessible custom <select> replacement: the native <select> stays in the DOM
// (hidden from sighted users and assistive tech) as the real form control, so
// FormData/validation/reset keep working untouched. The button+listbox pair is
// the only focusable, screen-reader-visible interface for this field.
(() => {
  function initCustomSelect(root) {
    const nativeSelect = root.querySelector('.custom-select-native');
    const trigger = root.querySelector('.custom-select-trigger');
    const list = root.querySelector('.custom-select-list');
    if (!nativeSelect || !trigger || !list) return;
    const valueSpan = trigger.querySelector('.custom-select-value');
    const options = Array.from(list.querySelectorAll('[role="option"]'));
    let activeIndex = -1;

    const syncFromNative = () => {
      const value = nativeSelect.value;
      const match = options.find(opt => opt.dataset.value === value);
      options.forEach(opt => opt.setAttribute('aria-selected', String(opt === match)));
      if (match) {
        valueSpan.textContent = match.textContent;
        valueSpan.classList.remove('is-placeholder');
        activeIndex = options.indexOf(match);
      } else {
        valueSpan.textContent = valueSpan.dataset.placeholder || '';
        valueSpan.classList.add('is-placeholder');
        activeIndex = -1;
      }
    };

    const close = ({ returnFocus = false } = {}) => {
      if (list.hidden) return;
      list.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      root.classList.remove('is-open');
      if (returnFocus) trigger.focus();
    };

    const open = () => {
      if (!list.hidden) return;
      list.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      root.classList.add('is-open');
      const current = options[activeIndex] || options[0];
      options.forEach(opt => opt.tabIndex = -1);
      current?.scrollIntoView({ block: 'nearest' });
      current?.classList.add('is-focused');
      list.setAttribute('aria-activedescendant', current?.id || '');
    };

    const focusOption = index => {
      options.forEach(opt => opt.classList.remove('is-focused'));
      activeIndex = Math.max(0, Math.min(options.length - 1, index));
      const opt = options[activeIndex];
      opt.classList.add('is-focused');
      opt.scrollIntoView({ block: 'nearest' });
      list.setAttribute('aria-activedescendant', opt.id || '');
    };

    const choose = option => {
      if (!option) return;
      nativeSelect.value = option.dataset.value;
      nativeSelect.dispatchEvent(new Event('change', { bubbles: true }));
      syncFromNative();
      close({ returnFocus: true });
    };

    options.forEach((opt, i) => {
      if (!opt.id) opt.id = `${list.id}-opt-${i}`;
      opt.addEventListener('click', () => choose(opt));
      opt.addEventListener('mouseenter', () => { options.forEach(o => o.classList.remove('is-focused')); opt.classList.add('is-focused'); activeIndex = i; });
    });

    trigger.addEventListener('click', () => { list.hidden ? open() : close(); });

    trigger.addEventListener('keydown', event => {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        if (list.hidden) open(); else if (event.key === 'Enter' || event.key === ' ') choose(options[activeIndex]);
        if (event.key === 'ArrowDown') focusOption((activeIndex < 0 ? -1 : activeIndex) + 1);
        if (event.key === 'ArrowUp') focusOption((activeIndex < 0 ? options.length : activeIndex) - 1);
      } else if (event.key === 'Escape' && !list.hidden) {
        event.preventDefault(); close();
      }
    });

    list.addEventListener('keydown', event => {
      switch (event.key) {
        case 'ArrowDown': event.preventDefault(); focusOption(activeIndex + 1); break;
        case 'ArrowUp': event.preventDefault(); focusOption(activeIndex - 1); break;
        case 'Home': event.preventDefault(); focusOption(0); break;
        case 'End': event.preventDefault(); focusOption(options.length - 1); break;
        case 'Enter': case ' ': event.preventDefault(); choose(options[activeIndex]); break;
        case 'Escape': event.preventDefault(); close({ returnFocus: true }); break;
        case 'Tab': close(); break;
      }
    });

    document.addEventListener('click', event => {
      if (!root.contains(event.target)) close();
    });

    // Keep the visible UI correct if the value ever changes by any other means
    // (our own choose() included — this is idempotent).
    nativeSelect.addEventListener('change', syncFromNative);
    nativeSelect.closest('form')?.addEventListener('reset', () => {
      setTimeout(syncFromNative, 0);
    });

    syncFromNative();
  }

  function init() {
    document.querySelectorAll('[data-custom-select]').forEach(initCustomSelect);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
