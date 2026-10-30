'use strict';

// ══════════════════════════════════════════
// CatapultaPayment — script.js
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

  initCounters();
  initTabs();
  initCatalogTabs();
  initThemeToggle();
  initScrollTopBtn();
  initFAQ();
  // Diferir lo que no afecta el primer render
  initContactForm();
  initSavingsCalculator();
  initTerminalAccessibility();
  initHeroModel();
});

/* ────────────────────────────────────────────
   0. VISOR 3D DEL HERO (carga diferida)
   El bundle de <model-viewer> pesa ~935 KB; se importa
   dinámicamente tras el evento load (y en tiempo ocioso si
   el navegador lo soporta) para no competir con fuentes,
   CSS e imágenes durante la carga inicial.
──────────────────────────────────────────── */
function initHeroModel() {
  if (!document.querySelector('model-viewer')) return;
  const mount = () => { import('./assets/js/model-viewer.min.js?v=46').catch(() => {}); };
  const schedule = () => {
    if ('requestIdleCallback' in window) requestIdleCallback(mount, { timeout: 2000 });
    else setTimeout(mount, 300);
  };
  if (document.readyState === 'complete') schedule();
  else window.addEventListener('load', schedule, { once: true });
}

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
  const btn      = document.getElementById('navHamburger');
  const menu     = document.getElementById('mobileMenu');
  const backdrop = document.getElementById('mobileMenuBackdrop');

  if (!btn || !menu) return;

  let isOpen = false;

  function toggleMenu(forceClose = false) {
    if (forceClose && !isOpen) return;
    isOpen = forceClose ? false : !isOpen;

    menu.classList.toggle('open', isOpen);
    backdrop?.classList.toggle('open', isOpen);
    btn.classList.toggle('is-open', isOpen);
    btn.setAttribute('aria-expanded', String(isOpen));
    menu.setAttribute('aria-hidden', String(!isOpen));
    if (isOpen) CP.lockScroll('menu'); else CP.unlockScroll('menu');
    menu.inert = !isOpen;
  }

  // Cerrar al tocar el fondo oscuro
  backdrop?.addEventListener('click', () => toggleMenu(true));

  menu.inert = true;
  document.addEventListener('keydown', event => {
    if (!isOpen) return;
    if (event.key === 'Escape') { toggleMenu(true); btn.focus(); }
    if (event.key === 'Tab') {
      const items = [btn, ...menu.querySelectorAll('a,button')].filter(el => el.offsetParent !== null);
      const position = items.indexOf(document.activeElement);
      if ((!event.shiftKey && position === items.length - 1) || (event.shiftKey && position <= 0)) { event.preventDefault(); items[event.shiftKey ? items.length - 1 : 0].focus(); }
    }
  });
  // Abrir/cerrar con el botón
  btn.addEventListener('click', () => toggleMenu());

  // Cerrar al hacer clic en links internos
  menu.querySelectorAll('.mobile-link, .mobile-cta').forEach(link => {
    link.addEventListener('click', () => toggleMenu(true));
  });

  // Cerrar al agrandar la ventana (fix bug resize)
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && isOpen) toggleMenu(true);
  }, { passive: true });
}


function initCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;

  const DURATION = 1800; // ms

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    if (!Number.isFinite(target)) return;
    if (CP.reducedMotion()) { el.textContent = (el.dataset.prefix || '') + target + (el.dataset.suffix || ''); return; }
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
function initTabGroup(buttonSelector, panelFor) {
  const tabs = [...document.querySelectorAll(buttonSelector)];
  if (!tabs.length) return;
  const activate = selected => {
    const target = panelFor(selected);
    if (!target) return;
    tabs.forEach(tab => {
      const active = tab === selected;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      const panel = panelFor(tab);
      if (!panel) return;
      if (!tab.id) tab.id = 'tab-' + panel.id;
      tab.setAttribute('aria-controls', panel.id);
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tab.id);
      panel.classList.toggle('active', active);
      panel.classList.toggle('hidden', !active);
      panel.hidden = !active;
      panel.style.display = active ? 'block' : 'none';
      panel.style.opacity = '1';
      panel.style.pointerEvents = '';
    });
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab));
    tab.addEventListener('keydown', event => {
      const next = { ArrowRight: (index + 1) % tabs.length, ArrowLeft: (index + tabs.length - 1) % tabs.length, Home: 0, End: tabs.length - 1 }[event.key];
      if (next === undefined) return;
      event.preventDefault(); activate(tabs[next]); tabs[next].focus();
    });
  });
  activate(tabs.find(tab => tab.classList.contains('active')) || tabs[0]);
}
function initTabs() {
  initTabGroup('.tab-pill', tab => document.getElementById('panel' + tab.dataset.tab[0].toUpperCase() + tab.dataset.tab.slice(1)));
}

/* ────────────────────────────────────────────
   9. FORMULARIO DE CONTACTO
   Valida, envía al endpoint propio mail/send.php (PHP +
   SMTP de IONOS, sin depender de EmailJS) y muestra estado
   de carga + toast de resultado. Las plantillas de correo
   (admin y confirmación al cliente) viven en email-template.html
   y email-template-autoreply.html; el backend las rellena.
──────────────────────────────────────────── */



function initContactForm() {
  const form = document.getElementById('contactForm');
  const toast = document.getElementById('toast');
  if (!form) return;
  const submit = form.querySelector('[type="submit"]');
  let sending = false;
  let lastSuccess = 0;
  let toastTimer;
  const text = (es, en) => document.documentElement.lang === 'en' ? en : es;
  function notify(message, error = false) {
    const status = document.getElementById('contactStatus');
    if (status) status.textContent = message;
    if (!toast) return;
    toast.querySelector('span').textContent = message;
    toast.classList.toggle('toast-error', error);
    const oldIcon = toast.querySelector('svg, i');
    if (oldIcon) {
      const icon = document.createElement('i');
      icon.setAttribute('data-lucide', error ? 'alert-circle' : 'check-circle');
      icon.setAttribute('aria-hidden', 'true');
      oldIcon.replaceWith(icon);
      window.lucide?.createIcons();
    }
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 6000);
  }
  for (const field of form.querySelectorAll('input:not([type="hidden"]),textarea,select')) {
    const clear = () => { field.closest('.form-group')?.classList.remove('invalid'); field.removeAttribute('aria-invalid'); };
    field.addEventListener('input', clear); field.addEventListener('change', clear);
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending) return;
    if (Date.now() - lastSuccess < 10000) { notify(text('Tu mensaje ya fue enviado. Espera unos segundos antes de enviar otro.', 'Your message was already sent. Please wait a few seconds.')); return; }
    if (form.elements.honeypot?.value.trim()) { notify(text('Solicitud recibida.', 'Request received.')); return; }
    let invalid;
    for (const field of form.querySelectorAll('input:not(.form-honeypot),textarea,select')) {
      const tooLong = field.maxLength > 0 && field.value.length > field.maxLength;
      const bad = (field.required && !field.value.trim()) || !field.checkValidity() || tooLong;
      field.closest('.form-group')?.classList.toggle('invalid', bad);
      field.setAttribute('aria-invalid', String(bad));
      if (bad && !invalid) invalid = field;
    }
    if (invalid) {
      notify(text('Revisa los campos marcados antes de enviar.', 'Check the highlighted fields before sending.'), true);
      const focusTarget = invalid.classList.contains('custom-select-native')
        ? invalid.closest('.custom-select')?.querySelector('.custom-select-trigger') || invalid
        : invalid;
      focusTarget.focus();
      return;
    }
    if (!navigator.onLine) { notify(text('No hay conexión. Conservamos tu mensaje; vuelve a intentarlo al conectarte.', 'You are offline. Your message is still here; reconnect and try again.'), true); return; }
    const snapshot = new FormData(form);
    const controls = [...form.querySelectorAll('input,textarea,select,button')];
    const disabledBefore = controls.map(control => control.disabled);
    sending = true;
    form.setAttribute('aria-busy', 'true');
    controls.forEach(control => { control.disabled = true; });
    submit.textContent = text('Enviando…', 'Sending…');
    try {
      await sendContactForm(snapshot);
      lastSuccess = Date.now();
      form.reset();
      notify(text('Mensaje enviado. Te contactaremos pronto.', 'Message sent. We will be in touch soon.'));
    } catch (error) {
      const message = error.name === 'AbortError'
        ? text('No pudimos confirmar el envío a tiempo. Evita reenviarlo de inmediato; puedes contactarnos por correo.', 'We could not confirm delivery in time. Avoid resending immediately; you can contact us by email.')
        : text('No se pudo enviar. Tus datos siguen aquí; intenta más tarde o escribe a info@catapultapay.com.', 'Could not send. Your details are still here; try later or email info@catapultapay.com.');
      notify(message, true);
    } finally {
      controls.forEach((control, index) => { control.disabled = disabledBefore[index]; });
      sending = false;
      form.removeAttribute('aria-busy');
      submit.textContent = text('Enviar mensaje', 'Send message');
    }
  });
  submit.disabled = false;
}

async function sendContactForm(data) {
  const read = name => String(data.get(name) || '').trim();
  const payload = {
    firstName: read('firstName'), lastName: read('lastName'), email: read('email'),
    company: read('company'), phone: read('phone'), subject: read('subject'),
    message: read('message'), honeypot: read('honeypot')
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch('/mail/send.php', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      signal: controller.signal, body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.ok) throw new Error('Email service rejected request');
    return true;
  } finally { clearTimeout(timeout); }
}



/* ────────────────────────────────────────────
   10. SMOOTH SCROLL para links de ancla
   Funciona con el scroll-behavior: smooth de CSS
   pero aquí se añade offset por la navbar fija
──────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    let id;
    try { id = decodeURIComponent(anchor.getAttribute('href').slice(1)); } catch { return; }
    const target = id ? document.getElementById(id) : null;
    if (!target) return;

    e.preventDefault();

    const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 76;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;

    window.scrollTo({
      top: targetTop,
      behavior: CP.reducedMotion() ? 'instant' : 'smooth',
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
    if (fillEl) fillEl.style.width = pct + '%';
    const wrap = slider.closest('.calc-slider-wrap');
    if (wrap) wrap.style.setProperty('--thumb-pos', pct + '%');
  }

  const valueFrames = new WeakMap();
  function animateValue(el, newVal, prefix = '$') {
    if (!el) return;
    cancelAnimationFrame(valueFrames.get(el));
    const current = Number(el.dataset.raw || 0);
    if (CP.reducedMotion()) { el.dataset.raw = newVal; el.textContent = prefix + Math.round(newVal).toLocaleString('en-US'); return; }
    const start = performance.now();
    const tick = now => {
      const progress = Math.min(1, (now - start) / 250);
      const display = current + (newVal - current) * (1 - Math.pow(1 - progress, 3));
      el.dataset.raw = display;
      el.textContent = prefix + Math.round(display).toLocaleString('en-US');
      if (progress < 1) valueFrames.set(el, requestAnimationFrame(tick));
    };
    valueFrames.set(el, requestAnimationFrame(tick));
  }

  const CATAPULTA_RATE = 1.89 / 100; // tasa fija CatapultaPayment

  function calculate() {
    const sales       = parseFloat(sliderSales.value);
    const currentRate = parseFloat(sliderRate.value) / 100 / 100;

    const costCurrent   = sales * currentRate;
    const costCatapulta = sales * CATAPULTA_RATE;
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

/* ────────────────────────────────────────────
   12. SCROLL TO TOP BUTTON
──────────────────────────────────────────── */
function initScrollTopBtn() {
  const btn = document.querySelector('.scroll-top-btn');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: CP.reducedMotion() ? 'instant' : 'smooth' });
  });
}

/* ────────────────────────────────────────────
   13. THEME TOGGLE — dark / light
──────────────────────────────────────────── */
function initThemeToggle() {
  const btn  = document.getElementById('themeToggle');
  const html = document.documentElement;
  if (!btn) return;

  // Recuperar preferencia guardada
  const saved = CP.storage.get('cpay-theme', 'light') === 'dark' ? 'dark' : 'light';
  html.setAttribute('data-theme', saved);
  CP.syncThemeLabels();

  function applyTheme(next) {
    html.setAttribute('data-theme', next);
    CP.storage.set('cpay-theme', next);
    CP.syncThemeLabels();
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
   14. CATALOG TABS
──────────────────────────────────────────── */
function initCatalogTabs() {
  initTabGroup('.catalog-tab', tab => document.getElementById('brand-' + tab.dataset.brand));
}

function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer   = item.querySelector('.faq-answer');
    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isOpen = question.getAttribute('aria-expanded') === 'true';

      // Cerrar todas las demás
      items.forEach(other => {
        if (other === item) return;
        const q = other.querySelector('.faq-question');
        const a = other.querySelector('.faq-answer');
        if (q) q.setAttribute('aria-expanded', 'false');
        if (a) a.classList.remove('open');
      });

      question.setAttribute('aria-expanded', String(!isOpen));
      answer.classList.toggle('open', !isOpen);
    });
  });
}


window.TERM = {
  screenLabel:     'Ingresa monto',
  processing:      'Procesando',
  approved:        'APROBADO',
  thanks:          'Gracias por su compra',
  chipLabel:       'Chip · CatapultaPayment ••4521',
  nfcLabel:        'NFC · Apple/Google Pay',
  swipeLabel:      'Banda · CatapultaPayment ••8834',
  ticketDate:      'Fecha',
  ticketTime:      'Hora',
  ticketTxn:       'TXN',
  ticketMethod:    'Método',
  ticketSubtotal:  'Subtotal',
  ticketNet:       'Neto recibido',
  ticketApproved:  'PAGO APROBADO',
  ticketThanks:    'Gracias por usar CatapultaPayment',
  ticketLocale:    'es-MX',
  approachCard:    'Acerca tu tarjeta',
  approachSub:     'o toca el lector',
  approachHint:    'NFC · CHIP · SWIPE',
  cancelBtn:       '✕ Cancelar',
  noAmountTitle:   'Ingresa el monto',
  noAmountSub:     'antes de acercar\nla tarjeta',
  resetBtn:        'Reiniciar terminal',
  dragHint:        'Arrastra la tarjeta sobre el terminal',
};

let rawCents = 0;
let busy = false;
let terminalPending = false;
const terminalTimers = new Set();
function terminalLater(fn, delay) { const id = setTimeout(() => { terminalTimers.delete(id); fn(); }, delay); terminalTimers.add(id); return id; }
function terminalEvery(fn, delay) { const id = setInterval(fn, delay); terminalTimers.add(id); return id; }
function clearTerminalInterval(id) { clearInterval(id); terminalTimers.delete(id); }
function clearTerminalTimers() { terminalTimers.forEach(id => { clearTimeout(id); clearInterval(id); }); terminalTimers.clear(); }

window.activeMethod = { method:'chip', icon:'ti-credit-card', label: window.TERM.chipLabel };

function clock() {
  const n = new Date();
  const el = document.getElementById('posClk');
  if (el) el.textContent = String(n.getHours()).padStart(2,'0') + ':' + String(n.getMinutes()).padStart(2,'0');
}
clock();
setInterval(() => { if (!document.hidden) clock(); }, 20000);

function fmtMoney(cents) {
  const d = (cents / 100).toFixed(2);
  const parts = d.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return '$' + parts.join('.');
}

function updateDisplay() {
  const el = document.getElementById('screenAmt');
  if (!el) return;
  el.innerHTML = (rawCents > 0 ? fmtMoney(rawCents) : '$0.00') + '<span class="screen-entry-cursor"></span>';
  el.className = 'screen-entry-value' + (rawCents > 0 ? ' has-value' : '');
  const charge = document.getElementById('chargeBtn');
  if (charge) charge.disabled = busy || terminalPending || rawCents < 100;
  const amt = rawCents / 100;
  const fee = amt * 0.0189;
  document.getElementById('sumAmt').textContent = fmtMoney(rawCents);
  document.getElementById('sumFee').textContent = '$' + fee.toFixed(2);
  document.getElementById('sumNet').textContent = '$' + (amt - fee).toFixed(2);

  /* Indicador visual: hint de "OK" cuando hay monto válido */
  const okKey = document.querySelector('.skey-ok');
  if (okKey) {
    if (rawCents >= 100 && !busy && !CP.reducedMotion()) {
      okKey.style.animation = 'dotGlow 1.2s ease-in-out infinite';
      okKey.style.boxShadow = '0 0 8px rgba(10,171,144,0.6)';
    } else {
      okKey.style.animation = '';
      okKey.style.boxShadow = '';
    }
  }
}

function padPress(key) {
  if (busy || terminalPending) return;
  if (key === 'DEL') {
    rawCents = Math.floor(rawCents / 10);
    updateDisplay();
  } else if (key === 'OK') {
    if (rawCents >= 100) {
      /* Solo muestra el prompt — no procesa hasta que arrastren la tarjeta */
      const sb = document.getElementById('screenBody');
      if (!sb) return;
      sb.innerHTML = `
        <div class="screen-processing-wrap">
          <div style="font-size:24px;color:#45C0E8;animation:floatUp 1.5s ease-in-out infinite;">
            <i class="ti ti-credit-card"></i>
          </div>
          <div style="font-size:11px;font-weight:700;color:#D8E8F5;margin-top:4px;">
            ${fmtMoney(rawCents)}
          </div>
         <div style="font-size:9px;color:#45C0E8;margin-top:6px;text-align:center;line-height:1.6;">
        ${window.TERM.approachCard}<br/>${window.TERM.approachSub}
      </div>
      <div style="margin-top:8px;display:flex;align-items:center;gap:5px;">
        <div style="width:28px;height:2px;background:rgba(69,192,232,0.2);border-radius:2px;overflow:hidden;position:relative;">
          <div style="position:absolute;top:0;left:-100%;width:100%;height:100%;background:#45C0E8;animation:readerSwipe 1.4s ease-in-out infinite;"></div>
        </div>
        <span style="font-size:7px;color:#2a3560;letter-spacing:0.5px;">${window.TERM.approachHint}</span>
        <div style="width:28px;height:2px;background:rgba(69,192,232,0.2);border-radius:2px;overflow:hidden;position:relative;">
          <div style="position:absolute;top:0;left:-100%;width:100%;height:100%;background:#45C0E8;animation:readerSwipe 1.4s ease-in-out infinite 0.7s;"></div>
        </div>
      </div>
      <div style="margin-top:8px;">
        <button type="button" class="skey skey-del" onclick="cancelWait()" style="font-size:8px;padding:3px 10px;width:auto;display:inline-block;">${window.TERM.cancelBtn}</button>
      </div>
        </div>`;
      window._waitingForCard = true;
    }
  } else {
    if (!/^[0-9]$/.test(String(key)) || rawCents > 9999999) return;
    rawCents = Math.min(99999999, rawCents * 10 + Number(key));
    updateDisplay();
  }
}

function cancelWait() {
  window._waitingForCard = false;
  const sb = document.getElementById('screenBody');
  if (sb) sb.innerHTML = getIdleScreen();
  updateDisplay();
}

function pickMethod(el) {
  if (busy || terminalPending || !el?.dataset.method) return;
  document.querySelectorAll('.mcard').forEach(c => { c.classList.remove('active'); c.setAttribute('aria-pressed', String(c === el)); });
  el.classList.add('active');
  window.activeMethod = { method: el.dataset.method, icon: el.dataset.icon, label: el.dataset.label };
  const mt = document.getElementById('screenMethodTxt');
  if (mt) mt.textContent = window.activeMethod.label;
  const mi = document.querySelector('#screenMethod i');
  if (mi) { mi.className = 'ti ' + window.activeMethod.icon; mi.style.fontSize = '9px'; }
}

function doCharge() {
  if (busy || rawCents < 100) return;
  window._waitingForCard = false;
  busy = true;
  document.getElementById('chargeBtn').disabled = true;
  document.getElementById('ticketArea').classList.remove('open');
  const sb  = document.getElementById('screenBody');
  const rg  = document.getElementById('readerGlow');
  const led = document.getElementById('printerLed');

  /* ── PASO 1: Pide pasar la tarjeta ── */
  sb.innerHTML = `
    <div class="screen-processing-wrap">
      <div style="font-size:22px;color:#45C0E8;margin-bottom:4px;animation:floatUp 1.5s ease-in-out infinite;">
        <i class="ti ti-credit-card"></i>
      </div>
      <div style="font-size:10px;font-weight:700;color:#D8E8F5;letter-spacing:0.5px;">
        ${fmtMoney(rawCents)}
      </div>
      <div style="font-size:9px;color:#45C0E8;margin-top:6px;text-align:center;line-height:1.5;">
        ${window.TERM.approachCard}<br/>${window.TERM.approachSub}
      </div>
      <div style="margin-top:8px;display:flex;align-items:center;gap:5px;">
        <div style="width:28px;height:2px;background:rgba(69,192,232,0.2);border-radius:2px;overflow:hidden;position:relative;">
          <div style="position:absolute;top:0;left:-100%;width:100%;height:100%;background:#45C0E8;animation:readerSwipe 1.4s ease-in-out infinite;"></div>
        </div>
        <span style="font-size:7px;color:#2a3560;">${window.TERM.approachHint}</span>
        <div style="width:28px;height:2px;background:rgba(69,192,232,0.2);border-radius:2px;overflow:hidden;position:relative;">
          <div style="position:absolute;top:0;left:-100%;width:100%;height:100%;background:#45C0E8;animation:readerSwipe 1.4s ease-in-out infinite 0.7s;"></div>
        </div>
      </div>
    </div>`;

  /* ── PASO 2: Simula el deslizamiento a los 2s ── */
  terminalLater(() => {
    /* animación del lector físico */
    rg.classList.remove('active'); void rg.offsetWidth; rg.classList.add('active');
    led.classList.add('blink');

    sb.innerHTML = `
      <div class="screen-processing-wrap">
        <div class="spin-ring"></div>
        <div class="proc-label">${window.TERM.processing}<span class="proc-dots"></span></div>
        <div style="font-size:8px;color:#2a3560;margin-top:3px;">${window.activeMethod.label}</div>
      </div>`;
  }, 2200);

  /* ── PASO 3: Aprobado + ticket ── */
  terminalLater(() => {
    led.classList.remove('blink');
    const auth = 'AUTH' + (Math.floor(Math.random()*900000)+100000);
    sb.innerHTML = `
      <div class="screen-success-wrap">
        <div class="ok-ring"><i class="ti ti-check" style="font-size:18px;"></i></div>
        <div class="ok-label">${window.TERM.approved}</div>
        <div class="ok-amount">${fmtMoney(rawCents)}</div>
        <div class="ok-auth">${auth}</div>
        <div class="ok-thanks">${window.TERM.thanks}</div>
      </div>`;
    renderTicket(auth);

    /* parpadeo del LED de impresora simulando impresión */
    let blinks = 0;
    const blinkInterval = terminalEvery(() => {
      led.classList.toggle('blink');
      blinks++;
      if (blinks >= 6) { clearTerminalInterval(blinkInterval); led.classList.remove('blink'); }
    }, 300);

    terminalLater(() => {
      busy = false; rawCents = 0;
      sb.innerHTML = getIdleScreen(); updateDisplay();
    }, 7000);
  }, 5200);
}

function getIdleScreen() {
  return `
    <div class="screen-amount-display">
      <span class="screen-entry-label">${window.TERM.screenLabel}</span>
      <span class="screen-entry-value" id="screenAmt">$0.00<span class="screen-entry-cursor"></span></span>
    </div>
    <div class="screen-method-row" id="screenMethod">
      <i class="ti ${window.activeMethod.icon}" style="font-size:9px;"></i>
      <span id="screenMethodTxt">${window.activeMethod.label}</span>
    </div>
    <div class="screen-numpad">
      <button type="button" class="skey" onclick="padPress('1')">1</button>
      <button type="button" class="skey" onclick="padPress('2')">2</button>
      <button type="button" class="skey" onclick="padPress('3')">3</button>
      <button type="button" class="skey" onclick="padPress('4')">4</button>
      <button type="button" class="skey" onclick="padPress('5')">5</button>
      <button type="button" class="skey" onclick="padPress('6')">6</button>
      <button type="button" class="skey" onclick="padPress('7')">7</button>
      <button type="button" class="skey" onclick="padPress('8')">8</button>
      <button type="button" class="skey" onclick="padPress('9')">9</button>
      <button type="button" class="skey skey-del" onclick="padPress('DEL')">⌫ CLR</button>
      <button type="button" class="skey" onclick="padPress('0')">0</button>
      <button type="button" class="skey skey-ok" onclick="padPress('OK')">✓ OK</button>
    </div>`;
}

function renderTicket(auth) {
  const now    = new Date();
  const locale = window.TERM.ticketLocale;
  const ds     = now.toLocaleDateString(locale, {day:'2-digit', month:'2-digit', year:'numeric'});
  const ts     = now.toLocaleTimeString(locale, {hour:'2-digit', minute:'2-digit', second:'2-digit'});
  const txn    = 'TXN-' + (Math.floor(Math.random()*9000000)+1000000);
  const amtVal = rawCents / 100;
  const fee    = (amtVal * 0.0189).toFixed(2);
  const netFmt = (amtVal - parseFloat(fee)).toLocaleString('en-US', {minimumFractionDigits:2});
  const methodSym = window.activeMethod.method==='nfc'?'((NFC))':window.activeMethod.method==='swipe'?'[SWIPE]':'[CHIP]';
  document.getElementById('ticketContent').innerHTML = `
    <div class="ticket-stripe"></div>
    <div class="t-center" style="padding-top:4px;">
      <div class="t-brand">CATAPULTAPAYMENT</div>
      <div class="t-sub">catapultapay.com · PCI DSS v4</div>
    </div>
    <hr class="t-hr">
    <div class="t-row"><span class="t-key">${window.TERM.ticketDate}</span><span class="t-val">${ds}</span></div>
    <div class="t-row"><span class="t-key">${window.TERM.ticketTime}</span><span class="t-val">${ts}</span></div>
    <div class="t-row"><span class="t-key">${window.TERM.ticketTxn}</span><span class="t-val">${txn}</span></div>
    <div class="t-row"><span class="t-key">${window.TERM.ticketMethod}</span><span class="t-val">${methodSym} ${window.activeMethod.label}</span></div>
    <hr class="t-hr">
    <div class="t-row"><span class="t-key">${window.TERM.ticketSubtotal}</span><span class="t-val">${fmtMoney(rawCents)}</span></div>
    <div class="t-row"><span class="t-key">${window.TERM.ticketNet}</span><span class="t-val t-total">$${netFmt}</span></div>
    <hr class="t-hr">
    <div class="t-center">
      <div style="font-size:20px;color:#0aab90;"><i class="ti ti-circle-check"></i></div>
      <div class="t-ok">${window.TERM.ticketApproved}</div>
      <div class="t-auth">${auth}</div>
    </div>
    <hr class="t-hr">
    <div class="t-center t-footer">+1 (310) 948-6153 · info@catapultapay.com<br>${window.TERM.ticketThanks}</div>`;
  document.getElementById('ticketArea').classList.add('open');
}

function resetTerminal() {
  clearTerminalTimers();
  window.cancelTerminalDrag?.();
  busy = false;
  terminalPending = false;
  document.getElementById('printerLed')?.classList.remove('blink');
  document.getElementById('readerGlow')?.classList.remove('active');
  rawCents = 0;
  window._waitingForCard = false;
  window.activeMethod = { method:'chip', icon:'ti-credit-card', label: window.TERM.chipLabel };

  /* Resetear método activo en el panel */
  document.querySelectorAll('.mcard').forEach(c => { c.classList.remove('active'); c.setAttribute('aria-pressed', 'false'); });
  const chipCard = document.querySelector('.mcard[data-method="chip"]');
  if (chipCard) { chipCard.classList.add('active'); chipCard.setAttribute('aria-pressed', 'true'); }

  /* Resetear pantalla */
  const sb = document.getElementById('screenBody');
  if (sb) sb.innerHTML = getIdleScreen();

  /* Cerrar ticket */
  const ta = document.getElementById('ticketArea');
  if (ta) ta.classList.remove('open');

  /* Flash visual de reinicio en el device */
  const device = document.querySelector('.pos-device');
  if (device) {
    device.style.transition = 'opacity 0.15s ease';
    device.style.opacity = '0.3';
    terminalLater(() => { device.style.opacity = '1'; }, 180);
  }

  /* LED parpadeo rápido */
  const led = document.getElementById('printerLed');
  if (led) {
    led.classList.add('blink');
    terminalLater(() => led.classList.remove('blink'), 600);
  }

  updateDisplay();
}

updateDisplay();

function initTerminalAccessibility() {
  document.querySelectorAll('.mcard, .drag-card').forEach(control => {
    control.tabIndex = 0;
    control.setAttribute('role', 'button');
    if (control.classList.contains('mcard')) control.setAttribute('aria-pressed', String(control.classList.contains('active')));
    control.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      if (busy || terminalPending) return;
      const method = document.querySelector('.mcard[data-method="' + control.dataset.method + '"]');
      if (method) pickMethod(method);
      if (control.classList.contains('drag-card')) doCharge();
    });
  });
}

/* ── Drag & Drop cards → terminal ── */
(function initDragCards() {
  const cards   = document.querySelectorAll('.drag-card');
  const device  = document.querySelector('.pos-device');
  if (!cards.length || !device) return;

  /* ── Ghost visual que sigue al cursor ── */
  const ghost = document.createElement('div');
  ghost.id = 'dragGhost';
  ghost.style.cssText = `
    position: fixed; pointer-events: none !important; z-index: 99998;
    width: 118px; height: 72px; border-radius: 8px;
    display: none; flex-direction: column; justify-content: space-between;
    padding: 9px 11px 8px;
    font-size: 11px; font-weight: 600; letter-spacing: 0.5px;
    color: #fff; opacity: 0;
    transition: opacity 0.15s ease, transform 0.15s ease;
    box-shadow: 0 16px 40px rgba(0,0,0,0.6), 0 0 0 1.5px rgba(10,171,144,0.5);
    user-select: none; -webkit-user-select: none;
    touch-action: none;
  `;
  ghost.setAttribute('aria-hidden', 'true');
  ghost.setAttribute('inert', '');
  document.body.appendChild(ghost);

  let activeCard = null;
  let dragMethod = null;
  let offsetX = 0, offsetY = 0;
  let overDevice = false;

  function moveGhost(e) {
    if (!e.touches && e.type === 'mousemove' && e.buttons === 0) { cancelDrag(); return; }
    if (e.cancelable) e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    ghost.style.left = (clientX - offsetX) + 'px';
    ghost.style.top  = (clientY - offsetY) + 'px';

    // Detectar si está sobre el device
    const dr = device.getBoundingClientRect();
    const inside = clientX >= dr.left && clientX <= dr.right &&
                   clientY >= dr.top  && clientY <= dr.bottom;

    if (inside !== overDevice) {
      overDevice = inside;
      device.classList.toggle('drop-active', inside);
      ghost.style.transform = inside
        ? 'scale(1.08) rotate(-4deg)'
        : 'scale(1) rotate(-6deg)';
      ghost.style.boxShadow = inside
        ? '0 20px 50px rgba(0,0,0,0.7), 0 0 0 2px rgba(10,171,144,0.9)'
        : '0 16px 40px rgba(0,0,0,0.6), 0 0 0 1.5px rgba(10,171,144,0.5)';
    }
  }

  function startDrag(card, e) {
    if (e.type === 'mousedown' && e.button !== 0) return;
    if (busy || terminalPending || activeCard) return;
    const rect = card.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    offsetX = clientX - rect.left;
    offsetY = clientY - rect.top;

    activeCard = card;
    dragMethod = {
      method: card.dataset.method,
      icon:   card.dataset.icon,
      label:  card.dataset.label,
    };

    // Clonar apariencia en el ghost
    ghost.style.background = card.style.background ||
      getComputedStyle(card).background;
    ghost.innerHTML = card.innerHTML;
    ghost.style.left = (clientX - offsetX) + 'px';
    ghost.style.top  = (clientY - offsetY) + 'px';
    ghost.style.display = 'flex';
    ghost.style.flexDirection = 'column';
    ghost.style.justifyContent = 'space-between';
    ghost.style.padding = '9px 11px 8px';

    // Copiar background exacto
    ghost.style.background = card.classList.contains('drag-card--dark')
      ? 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1e 100%)'
      : 'linear-gradient(135deg, #0ecfad 0%, #0aab90 38%, #0d2247 100%)';

    requestAnimationFrame(() => {
      ghost.style.opacity = '1';
      ghost.style.transform = 'scale(1) rotate(-6deg)';
    });

    card.style.opacity = '0.4';
    card.style.transform = 'scale(0.95)';

    document.addEventListener('mousemove', moveGhost);
    document.addEventListener('touchmove', moveGhost, { passive: false });
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
  }

  function endDrag(e) {
    document.removeEventListener('mousemove', moveGhost);
    document.removeEventListener('touchmove', moveGhost);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchend', endDrag);

    if (!activeCard) return;

    const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
    const dr = device.getBoundingClientRect();
    const dropped = clientX >= dr.left && clientX <= dr.right &&
                    clientY >= dr.top  && clientY <= dr.bottom;

    if (dropped && dragMethod) {
      /* ── Animar ghost hacia el lector ── */
      const readerRect = document.querySelector('.pos-reader-strip').getBoundingClientRect();
      ghost.style.transition = 'left 0.35s cubic-bezier(0.23,1,0.32,1), top 0.35s cubic-bezier(0.23,1,0.32,1), transform 0.35s ease, opacity 0.35s ease';
      ghost.style.left    = (readerRect.left + readerRect.width/2  - 59) + 'px';
      ghost.style.top     = (readerRect.top  + readerRect.height/2 - 36) + 'px';
      ghost.style.transform = 'scale(0.7) rotate(0deg)';

      /* ── Parpadeo en el lector ── */
      const rg = document.getElementById('readerGlow');
      const led = document.getElementById('printerLed');
      terminalLater(() => {
        if (rg) { rg.classList.remove('active'); void rg.offsetWidth; rg.classList.add('active'); }
        if (led) led.classList.add('blink');
      }, 320);

      /* ── Ghost se queda 1.2s, luego desaparece ── */
      terminalLater(() => {
        ghost.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        ghost.style.opacity   = '0';
        ghost.style.transform = 'scale(0.5) rotate(0deg)';
        if (led) led.classList.remove('blink');
      }, 1050);

      terminalLater(() => {
        ghost.style.display = 'none';
        ghost.style.transition = '';
      }, 1380);

      /* ── Seleccionar método y procesar ── */
      const targetCard = document.querySelector(`.mcard[data-method="${dragMethod.method}"]`);
      if (targetCard) {
        document.querySelectorAll('.mcard').forEach(c => c.classList.remove('active'));
        targetCard.classList.add('active'); targetCard.setAttribute('aria-pressed', 'true');
        window.activeMethod = { ...dragMethod };

        const mt = document.getElementById('screenMethodTxt');
        if (mt) mt.textContent = dragMethod.label;
        const mi = document.querySelector('#screenMethod i');
        if (mi) { mi.className = 'ti ' + dragMethod.icon; mi.style.fontSize = '9px'; }
      }

      if (rawCents >= 100 && !busy) {
        terminalPending = true;
        terminalLater(() => { terminalPending = false; doCharge(); }, 1100);
      } else if (rawCents < 100 && !busy) {
        /* Sin monto: la pantalla pide que ingresen el monto primero */
        const sb = document.getElementById('screenBody');
        if (sb) {
          const orig = sb.innerHTML;
          sb.innerHTML = `
            <div class="screen-processing-wrap">
              <div style="font-size:20px;color:#E8C97A;">
                <i class="ti ti-alert-triangle"></i>
              </div>
              <div style="font-size:9px;color:#E8C97A;margin-top:6px;text-align:center;line-height:1.6;">
                ${window.TERM.noAmountTitle}<br/>${window.TERM.noAmountSub.replace('\n','<br/>')}
              </div>
            </div>`;
          terminalLater(() => { sb.innerHTML = getIdleScreen(); }, 2000);
        }
      }

    } else {
      /* ── Drop fuera: regresar ── */
      ghost.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      ghost.style.opacity   = '0';
      ghost.style.transform = 'scale(0.8) rotate(0deg)';
      terminalLater(() => {
        ghost.style.display = 'none';
        ghost.style.transition = '';
      }, 260);
    }

    device.classList.remove('drop-active');
    activeCard.style.opacity  = '';
    activeCard.style.transform = '';
    activeCard = null;
    dragMethod = null;
    overDevice = false;
  }


  function cancelDrag() {
    document.removeEventListener('mousemove', moveGhost);
    document.removeEventListener('touchmove', moveGhost);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchend', endDrag);
    if (activeCard) { activeCard.style.opacity = ''; activeCard.style.transform = ''; }
    activeCard = null; dragMethod = null; overDevice = false;
    device.classList.remove('drop-active'); ghost.style.display = 'none'; ghost.style.opacity = '0';
  }
  window.cancelTerminalDrag = cancelDrag;
  document.addEventListener('touchcancel', cancelDrag);
  window.addEventListener('blur', cancelDrag);
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && activeCard) { event.preventDefault(); cancelDrag(); } });

  cards.forEach(card => {
    card.addEventListener('mousedown',  e => { e.preventDefault(); startDrag(card, e); });
    card.addEventListener('touchstart', e => { e.preventDefault(); startDrag(card, e); }, { passive: false });
    card.setAttribute('draggable', 'false'); // usar nuestro propio drag
  });
})();

/* ────────────────────────────────────────────
   LAZY LOAD VIDEO
──────────────────────────────────────────── */
(function initLazyVideo() {
  const video = document.querySelector('video[data-src]');
  if (!video) return;

  if (CP.reducedMotion() || navigator.connection?.saveData) return;
  let loaded = false;
  let inView = false;
  const syncPlayback = () => { if (loaded && inView && !document.hidden) video.play().catch(() => {}); else video.pause(); };
  document.addEventListener('visibilitychange', syncPlayback);

  function loadVideo() {
    if (loaded) return;
    loaded = true;

    const source = document.createElement('source');
    source.src  = video.dataset.src;
    source.type = 'video/mp4';
    video.appendChild(source);
    video.load();

    video.addEventListener('canplaythrough', () => {
      syncPlayback();
    }, { once: true });

    video.addEventListener('loadeddata', () => {
      setTimeout(() => {
        if (video.paused) syncPlayback();
      }, 300);
    }, { once: true });
  }

  // Carga UNA vez cuando entra en pantalla
  const loadObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        loadVideo();
        loadObserver.unobserve(video);
      }
    });
  }, { rootMargin: '100px 0px' });

  loadObserver.observe(video);

  // Pausa/reanuda según visibilidad real — esto es lo que ahorra batería y CPU
  const playObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!loaded) return;
      inView = entry.isIntersecting;
      if (entry.isIntersecting) {
        syncPlayback();
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.15 });

  playObserver.observe(video);
})();
