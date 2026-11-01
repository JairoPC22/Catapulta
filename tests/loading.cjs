const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../loading.js'), 'utf8');
function setup({ preference = null, rejection, storageBlocked = false } = {}) {
  let sequence = 0, plays = 0, loads = 0, pauses = 0, now = 0;
  const timers = new Map(), documentEvents = {}, values = new Map();
  if (preference) values.set('cpay-sound', preference);
  const element = () => {
    const listeners = {}, attributes = new Map(), classes = new Set();
    return { listeners, hidden: false, dataset: {}, textContent: '', classList: { add: key => classes.add(key), remove: key => classes.delete(key) },
      addEventListener: (name, fn) => { listeners[name] = fn; },
      setAttribute: (key, value) => attributes.set(key, value), getAttribute: key => attributes.get(key),
      toggleAttribute: (key, on) => on ? attributes.set(key, '') : attributes.delete(key),
      focus() {} };
  };
  const status = element();
  const loader = element(); loader.hidden = true; loader.querySelector = () => status;
  const audio = element(); audio.currentTime = 0; audio.load = () => { loads++; };
  audio.pause = () => { pauses++; };
  audio.play = () => { plays++; return rejection ? Promise.reject(Object.assign(new Error('Playback failed'), { name: rejection })) : Promise.resolve(); };
  const html = element(); html.lang = 'es'; html.dataset = {};
  const document = {
    documentElement: html, hidden: false, activeElement: null,
    getElementById: id => ({ siteLoader: loader, brandAudio: audio })[id],
    addEventListener: (name, fn) => { documentEvents[name] = fn; }, removeEventListener: (name, fn) => { if (documentEvents[name] === fn) delete documentEvents[name]; },
    dispatchEvent() {}, querySelector: () => null, fonts: { ready: Promise.resolve() }
  };
  const context = {
    document, matchMedia: () => ({ matches: false }), performance: { now: () => now },
    MutationObserver: class { observe() {} }, Event: class {},
    localStorage: { getItem: key => { if (storageBlocked) throw Error('Blocked'); return values.get(key) ?? null; }, setItem: (key, value) => { if (storageBlocked) throw Error('Blocked'); values.set(key, value); } },
    setTimeout: (fn, delay) => { const id = ++sequence; timers.set(id, { fn, delay }); return id; }, clearTimeout: id => timers.delete(id)
  };
  vm.runInNewContext(source, context);
  const runTimer = delay => {
    const entry = [...timers].find(([, timer]) => timer.delay === delay);
    assert.ok(entry, `Missing timer ${delay}`); timers.delete(entry[0]); entry[1].fn();
  };
  return { audio, loader, html, document, documentEvents, values, runTimer, setTime: value => { now = value; }, counts: () => ({ plays, loads, pauses }) };
}
const settle = async () => { await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); };
test('logo dismisses even if autoplay is blocked', async () => {
  const state = setup({ rejection: 'NotAllowedError' });
  state.runTimer(2600); await settle(); state.runTimer(600);
  assert.equal(state.loader.hidden, true); assert.equal(state.html.dataset.pageReady, 'true');
  assert.equal(state.counts().plays, 1); assert.equal(state.audio.dataset.playback, 'blocked');
});
test('autoplay attempt plays once on the normal timeline', async () => {
  const state = setup();
  state.runTimer(2600); await settle(); state.runTimer(600);
  assert.equal(state.counts().plays, 1);
  assert.equal(state.loader.hidden, true); assert.equal(state.audio.volume, .28); assert.equal(state.audio.loop, false);
});
test('old mute preference does not prevent requested startup sound', () => {
  const state = setup({ preference: 'off' }); state.runTimer(2600); state.runTimer(600);
  assert.equal(state.counts().loads, 1); assert.equal(state.counts().plays, 1);
  assert.equal(state.loader.hidden, true);
});
test('missing audio and unavailable storage cannot block page entry', async () => {
  const state = setup({ rejection: 'NotSupportedError', storageBlocked: true });
  state.runTimer(2600); await settle(); state.runTimer(600);
  assert.equal(state.loader.hidden, true); assert.equal(state.html.dataset.pageReady, 'true');
  assert.equal(state.audio.dataset.playback, 'unavailable');
});
test('Escape dismisses the loader immediately without sound', () => {
  const state = setup(); state.documentEvents.keydown({ key: 'Escape' }); state.runTimer(600);
  assert.equal(state.counts().plays, 0); assert.equal(state.loader.hidden, true);
});
test('hiding the tab stops the ident and does not resume it automatically', async () => {
  const state = setup(); state.runTimer(2600); await settle();
  state.document.hidden = true; state.documentEvents.visibilitychange();
  const plays = state.counts().plays; assert.ok(state.counts().pauses > 0);
  state.document.hidden = false; state.documentEvents.visibilitychange(); assert.equal(state.counts().plays, plays);
});

test('blocked startup retries once on an early trusted interaction', async () => {
  const state = setup({ rejection: 'NotAllowedError' });
  state.runTimer(2600); await settle();
  state.documentEvents.pointerdown({ isTrusted: false });
  assert.equal(state.counts().plays, 1);
  state.documentEvents.pointerdown({ isTrusted: true }); await settle();
  assert.equal(state.counts().plays, 2);
  assert.equal(state.documentEvents.pointerdown, undefined);
});

test('late interactions cannot trigger delayed startup audio', async () => {
  const state = setup({ rejection: 'NotAllowedError' });
  state.runTimer(2600); await settle(); state.setTime(11000);
  state.documentEvents.pointerdown({ isTrusted: true });
  assert.equal(state.counts().plays, 1);
});
