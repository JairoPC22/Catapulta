const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const runtime = fs.readFileSync(path.join(root, 'runtime.js'), 'utf8');
const script = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
const classes = () => ({ add() {}, remove() {}, toggle() {} });
function environment() {
  const timers = new Map();
  let sequence = 0;
  const context = {
    console, AbortController, FormData, performance: { now: () => 0 },
    navigator: { onLine: true }, matchMedia: () => ({ matches: false }),
    setTimeout: (fn, delay) => { const id = ++sequence; timers.set(id, { fn, delay }); return id; },
    setInterval: (fn, delay) => { const id = ++sequence; timers.set(id, { fn, delay }); return id; },
    clearTimeout: id => timers.delete(id), clearInterval: id => timers.delete(id),
    requestAnimationFrame: () => 0, cancelAnimationFrame() {},
    localStorage: { getItem() { throw new Error('Blocked'); }, setItem() { throw new Error('Blocked'); }, removeItem() { throw new Error('Blocked'); } },
    document: {
      hidden: false, documentElement: { lang: 'es' }, body: { style: { overflow: 'auto' } },
      addEventListener() {}, querySelectorAll: () => [], querySelector: () => null, getElementById: () => null
    }
  };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(runtime, context);
  vm.runInContext(script, context);
  return { context, timers };
}
test('storage failure does not break startup and scroll locks compose', () => {
  const { context } = environment();
  assert.equal(context.CP.storage.get('cpay-lang', 'es'), 'es');
  assert.doesNotThrow(() => { context.CP.storage.set('x', 'y'); context.CP.storage.remove('x'); });
  context.CP.lockScroll('menu'); context.CP.lockScroll('photo');
  context.CP.unlockScroll('photo'); assert.equal(context.document.body.style.overflow, 'hidden');
  context.CP.unlockScroll('menu'); assert.equal(context.document.body.style.overflow, 'auto');
});
test('invalid terminal input cannot poison amounts and reset cancels a pending charge', () => {
  const { context, timers } = environment();
  vm.runInContext('padPress("not-a-digit"); padPress("1"); padPress("0"); padPress("0");', context);
  assert.equal(vm.runInContext('rawCents', context), 100);
  vm.runInContext('terminalPending = true; terminalLater(() => { rawCents = 999; }, 1100); resetTerminal();', context);
  for (const timer of [...timers.values()]) if (timer.delay === 1100) timer.fn();
  assert.equal(vm.runInContext('rawCents', context), 0);
  assert.equal(vm.runInContext('terminalPending || busy', context), false);
});
test('IONOS contact submission uses an explicit POST and rejects HTTP errors', async () => {
  const { context } = environment();
  const data = new FormData();
  data.set('firstName', 'Prueba'); data.set('lastName', 'Código');
  data.set('email', 'test@example.invalid'); data.set('subject', 'general'); data.set('message', 'Prueba local sin envío real');
  let request;
  context.fetch = async (url, options) => { request = { url, options }; return { ok: true, status: 202, json: async () => ({ok:true}) }; };
  await context.sendContactForm(data);
  assert.equal(request.url, '/mail/send.php');
  assert.equal(request.options.method, 'POST');
  assert.equal(JSON.parse(request.options.body).email, 'test@example.invalid');
  context.fetch = async () => ({ ok: false, status: 503, json: async () => ({ok:false}) });
  await assert.rejects(context.sendContactForm(data));
});
test('contact timeout aborts the request instead of leaving the UI waiting forever', async () => {
  const { context, timers } = environment();
  context.fetch = (url, options) => new Promise((resolve, reject) => options.signal.addEventListener('abort', () => reject(new DOMException('Timeout', 'AbortError'))));
  const pending = context.sendContactForm(new FormData());
  const assertion = assert.rejects(pending, { name: 'AbortError' });
  const timer = [...timers.values()].findLast(timer => timer.delay === 20000);
  timer.fn();
  await assertion;
});

test('contact rejects HTML errors, false success and rate limiting', async () => {
  const { context } = environment();
  context.fetch = async () => ({ok: true, status: 200, json: async () => { throw new SyntaxError('HTML response'); }});
  await assert.rejects(context.sendContactForm(new FormData()));
  context.fetch = async () => ({ok: true, status: 200, json: async () => ({ok: 'true'})});
  await assert.rejects(context.sendContactForm(new FormData()));
  context.fetch = async () => ({ok: false, status: 429, json: async () => ({ok: false})});
  await assert.rejects(context.sendContactForm(new FormData()), {status:429});
});
test('double submit sends once and restores controls after success', async () => {
  const { context } = environment();
  const listeners = {};
  const field = name => ({ name, value: name === 'email' ? 'test@example.invalid' : 'Prueba', required: true, maxLength: 100, checkValidity: () => true, closest: () => ({ classList: classes() }), addEventListener() {}, setAttribute() {}, removeAttribute() {}, disabled: false });
  const fields = ['firstName','lastName','email','subject','message'].map(field);
  const submit = { disabled: false, textContent: '' };
  let resets = 0;
  const form = {
    elements: { honeypot: { value: '' } },
    querySelector: () => submit,
    querySelectorAll: selector => selector === 'input,textarea,select,button' ? [...fields, submit] : fields,
    addEventListener: (name, listener) => { listeners[name] = listener; },
    setAttribute() {}, removeAttribute() {}, reset: () => { resets++; }
  };
  context.FormData = class { constructor() { this.values = new Map(fields.map(field => [field.name, field.value])); } get(name) { return this.values.get(name); } };
  context.document.getElementById = id => id === 'contactForm' ? form : null;
  let requests = 0, resolve;
  context.fetch = () => { requests++; return new Promise(done => { resolve = done; }); };
  context.initContactForm();
  const event = { preventDefault() {} };
  const first = listeners.submit(event);
  await listeners.submit(event);
  assert.equal(requests, 1); assert.equal(submit.disabled, true);
  resolve({ ok: true, status: 202, json: async () => ({ok:true}) }); await first;
  assert.equal(resets, 1); assert.equal(submit.disabled, false);
});
test('all linked local HTML resources exist; error and draft legal pages are noindex', () => {
  for (const file of fs.readdirSync(root).filter(name => name.endsWith('.html'))) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
      const url = match[1];
      if (/^(?:https?:|mailto:|tel:|data:|cid:|#)/.test(url)) continue;
      const relative = url.split(/[?#]/)[0].replace(/^\//, '');
      if (relative) assert.ok(fs.existsSync(path.join(root, relative)), `${file}: ${relative}`);
    }
  }
  for (const file of ['404.html','offline.html','error.html','privacy.html','cookies.html','terms.html']) {
    assert.match(fs.readFileSync(path.join(root, file), 'utf8'), /name="robots" content="noindex/);
  }
});
test('contact form cannot fall back to leaking personal data in a GET URL', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.match(html, /<form id="contactForm" method="post"/);
  assert.match(html, /type="submit" class="btn-primary btn-full" disabled/);
});
function workerEnvironment() {
  const listeners = {};
  const context = {
    URL, Response, Headers, AbortController, setTimeout, clearTimeout,
    self: { location: { origin: 'https://example.invalid' }, addEventListener: (name, fn) => { listeners[name] = fn; }, clients: { claim: async () => {} } },
    caches: { open: async () => { throw new Error('Storage blocked'); }, match: async () => { throw new Error('Storage blocked'); } },
    fetch: async () => new Response('Network content', { status: 200 })
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(root, 'sw.js'), 'utf8'), context);
  return { context, listeners };
}
test('cache storage failure cannot turn a successful network response into an error', async () => {
  const { context } = workerEnvironment();
  const response = await context.networkFirst({ url: 'https://example.invalid/' });
  assert.equal(response.status, 200); assert.equal(await response.text(), 'Network content');
  const asset = await context.staleWhileRevalidate({ url: 'https://example.invalid/styles.css' }, { waitUntil() {} });
  assert.equal(asset.status, 200);
});
test('worker does not intercept form POST requests or partial video requests', () => {
  const { listeners } = workerEnvironment();
  let intercepted = false;
  for (const request of [
    { method: 'POST', url: 'https://example.invalid/', headers: new Headers() },
    { method: 'GET', url: 'https://example.invalid/video1.mp4', headers: new Headers({ range: 'bytes=0-100' }) }
  ]) listeners.fetch({ request, respondWith() { intercepted = true; } });
  assert.equal(intercepted, false);
});
test('cache activation deletes only obsolete CatapultaPayment caches', async () => {
  const { context, listeners } = workerEnvironment();
  const deleted = [];
  const currentCache = vm.runInContext('CACHE_NAME', context);
  context.caches.keys = async () => ['another-app', 'catapultapay-v1', currentCache];
  context.caches.delete = async key => { deleted.push(key); };
  let pending;
  listeners.activate({ waitUntil(promise) { pending = promise; } });
  await pending;
  assert.deepEqual(deleted, ['catapultapay-v1']);
});
