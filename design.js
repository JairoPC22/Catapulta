'use strict';

// A Web Animation using fill:'backwards'/'both' locks its target at the
// invisible first frame until the animation finishes. None of the elements
// animated below have a CSS rule hiding them — the animation is the only
// thing making them invisible — so if it ever stalls (a slow device, the
// tab losing focus mid-animation, a browser quirk) cancelling it after a
// safe margin reveals the element at its normal, already-visible default
// instead of leaving real content hidden forever.
function animateIn(el, keyframes, options) {
  const animation = el.animate(keyframes, options);
  const timer = setTimeout(() => animation.cancel(), (options.delay || 0) + options.duration + 1200);
  const clear = () => clearTimeout(timer);
  animation.finished.then(clear).catch(clear);
  return animation;
}

// Bounded entrance sequences; no continuously running decorative canvas.
document.addEventListener('DOMContentLoaded', () => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const progress = document.createElement('div');
  progress.className = 'reading-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.append(progress);
  let scheduled = false;
  const updateProgress = () => {
    const range = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${range > 0 ? Math.min(1, Math.max(0, scrollY / range)) : 0})`;
    scheduled = false;
  };
  addEventListener('scroll', () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(updateProgress); }
  }, { passive: true });
  addEventListener('resize', updateProgress);
  updateProgress();

  const active = new Set();
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      if (reduced.matches) return;
      const animation = animateIn(entry.target, [
        { clipPath: 'inset(0 0 10% 0)', opacity: .35, transform: 'translateY(18px)' },
        { clipPath: 'inset(0 0 0 0)', opacity: 1, transform: 'none' }
      ], { duration: 650, easing: 'cubic-bezier(.16,1,.3,1)' });
      active.add(animation);
      animation.finished.then(() => active.delete(animation)).catch(() => active.delete(animation));
    });
  }, { threshold: .12 });
  document.querySelectorAll('.about-image-wrap, .catalog-grid, .calc-wrapper, .steps-grid').forEach(el => observer.observe(el));
  reduced.addEventListener('change', () => { if (reduced.matches) active.forEach(animation => animation.cancel()); });

  initPhotoCarousel(reduced);
  initTestimonialCarousel();
  initTestimonialReveal(reduced);
  const animateCopy = () => initTitleMotion(reduced);
  if (document.documentElement.dataset.pageReady === 'true' || document.querySelector('#siteLoader')?.hidden) animateCopy();
  else document.addEventListener('catapulta:ready', animateCopy, { once: true });
});

function initTitleMotion(reduced) {
  if (reduced.matches) return;
  const running = new Set();
  // The hero heading used to split into words and animate each one in with
  // a blur/rise (and section titles got the same treatment on every scroll
  // into view). Read on a phone as the text "appearing and then resettling
  // itself" rather than a deliberate effect — removed. Every heading now
  // just renders normally; only the hero block gets a single plain fade,
  // once, the same treatment already used for the paragraph and buttons
  // below it.
  document.querySelectorAll('.hero-copy h1, .hero-desc, .hero-actions, .trust-bar').forEach((el, i) => {
    const animation = animateIn(el, [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }],
      { duration: 600, delay: 100 + i * 110, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
    running.add(animation);
    animation.finished.then(() => running.delete(animation)).catch(() => running.delete(animation));
  });
  reduced.addEventListener('change', () => {
    if (reduced.matches) running.forEach(animation => animation.cancel());
  });
}

function initPhotoCarousel(reduced) {
  const track = document.querySelector('.gallery-grid');
  if (!track) return;
  const slides = [...track.querySelectorAll('.gallery-item')];
  if (!slides.length) return;
  let selected = 0;
  let enlarged = 0;
  let opener;
  let scrollTimer;
  let captionIndex = -1;

  const english = () => document.documentElement.lang === 'en';
  const label = (es, en) => english() ? en : es;
  const icons = {
    prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="m14 6-6 6 6 6"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="m10 6 6 6-6 6"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6"/></svg>',
    zoom: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/></svg>'
  };
  const button = (icon, className) => {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = className;
    el.innerHTML = icons[icon];
    return el;
  };
  track.id = 'installationPhotos';
  track.tabIndex = 0;
  track.setAttribute('role', 'region');
  track.setAttribute('aria-roledescription', 'carousel');
  track.style.scrollSnapType = 'x mandatory';
  const showcase = document.createElement('div');
  showcase.className = 'gallery-showcase';
  const sidebar = document.createElement('div');
  sidebar.className = 'gallery-sidebar';
  const caption = document.createElement('div');
  caption.className = 'gallery-caption';
  const deviceName = document.createElement('p');
  deviceName.className = 'gallery-caption-device';
  const clientName = document.createElement('h3');
  const captionHint = document.createElement('p');
  captionHint.className = 'gallery-caption-hint';
  caption.append(clientName, deviceName, captionHint);
  track.before(showcase);
  showcase.append(track, sidebar);

  const controls = document.createElement('div');
  controls.className = 'gallery-controls';
  const status = document.createElement('span');
  status.className = 'gallery-status';
  status.setAttribute('aria-live', 'polite');
  status.setAttribute('aria-atomic', 'true');
  const dots = document.createElement('div');
  dots.className = 'gallery-dots';
  const prev = button('prev', 'gallery-arrow');
  const next = button('next', 'gallery-arrow');
  prev.setAttribute('aria-controls', track.id);
  next.setAttribute('aria-controls', track.id);
  controls.append(status, prev, next);
  sidebar.append(caption, dots, controls);

  const dialog = document.createElement('dialog');
  dialog.className = 'photo-viewer';
  dialog.setAttribute('aria-labelledby', 'photoViewerTitle');
  const header = document.createElement('div');
  header.className = 'photo-viewer-header';
  const title = document.createElement('h3');
  title.className = 'photo-viewer-title';
  title.id = 'photoViewerTitle';
  const close = button('close', 'gallery-arrow');
  header.append(title, close);
  const image = document.createElement('img');
  image.className = 'photo-viewer-image';
  const footer = document.createElement('div');
  footer.className = 'photo-viewer-footer';
  const photoPrev = button('prev', 'gallery-arrow');
  const photoNext = button('next', 'gallery-arrow');
  const photoCount = document.createElement('span');
  photoCount.className = 'photo-viewer-count';
  photoCount.setAttribute('aria-live', 'polite');
  footer.append(photoPrev, photoCount, photoNext);
  dialog.append(header, image, footer);
  document.body.append(dialog);

  const showPhoto = index => {
    enlarged = Math.max(0, Math.min(slides.length - 1, index));
    const original = slides[enlarged].querySelector('img');
    image.src = original.src;
    image.alt = original.alt;
    title.textContent = slides[enlarged].querySelector('.gallery-client').textContent + ' · ' + slides[enlarged].querySelector('.gallery-device').textContent;
    photoCount.textContent = `${enlarged + 1} / ${slides.length}`;
    photoPrev.disabled = enlarged === 0;
    photoNext.disabled = enlarged === slides.length - 1;
    if (photoPrev.disabled && document.activeElement === photoPrev) photoNext.focus();
    if (photoNext.disabled && document.activeElement === photoNext) photoPrev.focus();
  };
  const zoomButtons = slides.map((slide, index) => {
    const zoom = button('zoom', 'gallery-zoom');
    zoom.innerHTML = `<span>${icons.zoom}</span>`;
    zoom.addEventListener('click', () => {
      opener = zoom;
      showPhoto(index);
      CP.lockScroll('photo');
      document.body.classList.add('photo-viewer-open');
      dialog.showModal();
      close.focus();
    });
    slide.append(zoom);
    return zoom;
  });
  const update = () => {
    status.textContent = `${String(selected + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    [...dots.children].forEach((dot, i) => dot.setAttribute('aria-current', String(i === selected)));
    slides.forEach((slide, i) => {
      zoomButtons[i].tabIndex = i === selected ? 0 : -1;
      slide.setAttribute('aria-hidden', String(i !== selected));
    });
    prev.disabled = selected === 0;
    next.disabled = selected === slides.length - 1;
    if (prev.disabled && document.activeElement === prev) next.focus();
    if (next.disabled && document.activeElement === next) prev.focus();
    deviceName.textContent = slides[selected].querySelector('.gallery-device').textContent;
    clientName.textContent = slides[selected].querySelector('.gallery-client').textContent;
    if (captionIndex !== selected && !reduced.matches) caption.animate([{opacity:.4,transform:'translateY(5px)'},{opacity:1,transform:'none'}],{duration:220,easing:'ease-out'});
    captionIndex = selected;
  };
  const goTo = (index, instant = false) => {
    selected = Math.max(0, Math.min(slides.length - 1, index));
    const range = Math.max(0, track.scrollWidth - track.clientWidth);
    track.scrollTo({ left: selected * range / Math.max(1, slides.length - 1), behavior: instant || reduced.matches ? 'instant' : 'smooth' });
    update();
  };
  slides.forEach((slide, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'gallery-thumb';
    const thumbnail = document.createElement('img');
    thumbnail.src = slide.querySelector('img').getAttribute('src');
    thumbnail.alt = '';
    thumbnail.width = 140; thumbnail.height = 94; thumbnail.loading = 'lazy'; thumbnail.decoding = 'async';
    dot.append(thumbnail);
    slide.querySelector('img').decoding = 'async';
    dot.setAttribute('aria-controls', track.id);
    dot.addEventListener('click', () => goTo(index));
    dots.append(dot);
  });
  const step = direction => {
    goTo(selected + direction);
  };
  prev.addEventListener('click', () => step(-1));
  next.addEventListener('click', () => step(1));
  track.addEventListener('keydown', event => {
    if (event.target !== track) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      step(event.key === 'ArrowRight' ? 1 : -1);
      return;
    }
    const destination = { Home: 0, End: slides.length - 1 }[event.key];
    if (destination === undefined) return;
    event.preventDefault();
    goTo(destination);
  });
  track.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      const range = track.scrollWidth - track.clientWidth;
      selected = range > 0 ? Math.min(slides.length - 1, Math.max(0, Math.round(track.scrollLeft / range * (slides.length - 1)))) : 0;
      update();
    }, 100);
  }, { passive: true });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    CP.unlockScroll('photo');
    document.body.classList.remove('photo-viewer-open');
    goTo(enlarged, true);
    (zoomButtons[enlarged] || opener)?.focus({ preventScroll: true });
  });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showPhoto(enlarged + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  let touchStart;
  image.addEventListener('pointerdown', event => { touchStart = event.pointerType === 'touch' && event.isPrimary ? {x:event.clientX,y:event.clientY} : null; });
  image.addEventListener('pointercancel', () => { touchStart = null; });
  image.addEventListener('pointerup', event => {
    if (!touchStart) return;
    const x = event.clientX - touchStart.x; const y = event.clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(x) > 60 && Math.abs(x) > Math.abs(y) * 1.5) showPhoto(enlarged + (x < 0 ? 1 : -1));
  });
  photoPrev.addEventListener('click', () => showPhoto(enlarged - 1));
  photoNext.addEventListener('click', () => showPhoto(enlarged + 1));
  const translate = () => {
    captionHint.textContent = label('Cada negocio, una solución en acción. Selecciona una vista o amplía la fotografía.', 'A payment solution in action. Choose a view or enlarge the photo.');
    dots.setAttribute('role', 'group');
    dots.setAttribute('aria-label', label('Seleccionar fotografía', 'Choose a photograph'));
    track.setAttribute('aria-roledescription', label('carrusel', 'carousel'));
    track.setAttribute('aria-label', label('Fotos de instalaciones reales. Usa las flechas para navegar.', 'Real installation photos. Use arrow keys to navigate.'));
    prev.setAttribute('aria-label', label('Foto anterior', 'Previous photo'));
    next.setAttribute('aria-label', label('Foto siguiente', 'Next photo'));
    photoPrev.setAttribute('aria-label', prev.getAttribute('aria-label'));
    photoNext.setAttribute('aria-label', next.getAttribute('aria-label'));
    close.setAttribute('aria-label', label('Cerrar fotografía', 'Close photo'));
    slides.forEach((slide, i) => {
      const name = slide.querySelector('.gallery-client').textContent;
      zoomButtons[i].setAttribute('aria-label', label(`Ampliar foto ${i + 1}: ${name}`, `Enlarge photo ${i + 1}: ${name}`));
      dots.children[i].setAttribute('aria-label', label(`Ir a foto ${i + 1}`, `Go to photo ${i + 1}`));
    });
  };
  new MutationObserver(translate).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  new ResizeObserver(() => goTo(selected, true)).observe(track);
  translate();
  update();
}

// Testimonials: cards fade and settle into place in sequence as the section
// scrolls into view, instead of appearing all at once.
function initTestimonialReveal(reduced) {
  if (reduced.matches) return;
  const cards = [...document.querySelectorAll('.testi-card')];
  if (!cards.length) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      const index = cards.indexOf(entry.target);
      animateIn(entry.target, [
        { opacity: 0, transform: 'translateY(26px) scale(.97)' },
        { opacity: 1, transform: 'none' }
      ], { duration: 600, delay: index * 90, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' });
    });
  }, { threshold: .2 });
  cards.forEach(card => observer.observe(card));
}

// Testimonials: the grid becomes a swipeable scroll-snap carousel on mobile
// (see the .testimonials-grid mobile rules in styles.css); this just drives
// the dots/arrows/status that sit below it. Harmless no-op on desktop, where
// the grid doesn't scroll because every card is already visible.
function initTestimonialCarousel() {
  const track = document.getElementById('testiTrack');
  const controls = document.getElementById('testiControls');
  if (!track || !controls) return;
  const slides = [...track.querySelectorAll('.testi-card')];
  if (slides.length < 2) return;
  const dots = [...document.getElementById('testiDots').children];
  const status = document.getElementById('testiStatus');
  const prev = document.getElementById('testiPrev');
  const next = document.getElementById('testiNext');
  let current = 0;

  const update = () => {
    dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === current)));
    status.textContent = `${current + 1} / ${slides.length}`;
    prev.disabled = current === 0;
    next.disabled = current === slides.length - 1;
  };

  const goTo = index => {
    current = Math.max(0, Math.min(slides.length - 1, index));
    slides[current].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    update();
  };

  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));
  prev.addEventListener('click', () => goTo(current - 1));
  next.addEventListener('click', () => goTo(current + 1));

  let scheduled = false;
  track.addEventListener('scroll', () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      const trackCenter = track.scrollLeft + track.clientWidth / 2;
      let closest = 0, closestDistance = Infinity;
      slides.forEach((slide, i) => {
        const distance = Math.abs((slide.offsetLeft + slide.offsetWidth / 2) - trackCenter);
        if (distance < closestDistance) { closestDistance = distance; closest = i; }
      });
      if (closest !== current) { current = closest; update(); }
    });
  }, { passive: true });

  update();
}
