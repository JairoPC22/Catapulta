const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function setup(lang='en') {
  const selections=new Map(), callbacks={}, timers=[];
  const classes=new Set();
  const page={textContent:JSON.stringify({'@graph':[{'@type':'WebPage',hasPart:{'@id':'old'}},{'@type':'Service',hasOfferCatalog:{itemListElement:[{itemOffered:{}},{itemOffered:{}}]}},{'@type':'FAQPage',mainEntity:[{name:'old',acceptedAnswer:{text:'old'}}]}]})};
  const metadata=()=>({attributes:{},setAttribute(k,v){this.attributes[k]=v;}});
  for(const sel of ['link[rel="canonical"]','meta[property="og:url"]','meta[property="og:locale"]','meta[property="og:locale:alternate"]']) selections.set(sel,[metadata()]);
  selections.set('script[type="application/ld+json"]',[page]);
  const document={documentElement:{lang,classList:{add:k=>classes.add(k),remove:k=>classes.delete(k)}},readyState:'loading',addEventListener(){},querySelector:s=>(selections.get(s)||[])[0]||null,querySelectorAll:s=>selections.get(s)||[],getElementById:()=>({addEventListener:(event,fn)=>callbacks[event]=fn})};
  const context=vm.createContext({document,location:{pathname:'/',search:'',hash:''},matchMedia:()=>({matches:false}),requestAnimationFrame:fn=>fn(),window:{setTimeout:fn=>timers.push(fn)}});
  vm.runInContext(fs.readFileSync(path.join(root,'i18n.js'),'utf8'),context);
  return {...vm.runInContext('({I18N,TRANSLATIONS})',context),document,selections,page,classes,callbacks,timers,context};
}
test('catalog features restore Spanish when the initial page was English',()=>{
  const {I18N,selections}=setup('en');
  const feature={innerHTML:'With inventory: <strong>$30/month</strong>'};
  selections.set('.catalog-features li',[feature]);
  I18N._cacheIfNeeded();
  assert.equal(I18N._featuresCache[0],'Con inventario: <strong>$30/mes</strong>');
});
test('catalog feature translation preserves markup and round-trips from Spanish',()=>{
  const {I18N}=setup();
  const original='Software básico: <strong>$15/mes</strong> · Con inventario:';
  assert.equal(I18N._replaceFeatureLabels(I18N._replaceFeatureLabels(original,'es','en'),'en','es'),original);
});
test('canonical, social URL and JSON-LD match the selected language',()=>{
  const {I18N,TRANSLATIONS,selections,page}=setup();
  for(const lang of ['en','es','en']) {
    I18N._syncMetadata(lang,TRANSLATIONS[lang]);
    const expected='https://catapultapay.com/'+(lang==='en'?'en/':'');
    assert.equal(selections.get('link[rel="canonical"]')[0].attributes.href,expected);
    assert.equal(selections.get('meta[property="og:url"]')[0].attributes.content,expected);
    const graph=JSON.parse(page.textContent)['@graph'];
    assert.equal(graph[0].url,expected);assert.equal(graph[0].hasPart['@id'],expected+'#faq');
    assert.equal(graph[2].mainEntity[0].name,TRANSLATIONS[lang]['faq.q1']);
    assert.equal(graph[2]['@id'],expected+'#faq');
  }
});
test('language swap still waits for the fade transition and applies once',()=>{
  const {I18N,classes,callbacks,timers}=setup();
  const applied=[];I18N.currentLang='es';I18N.apply=lang=>{I18N.currentLang=lang;applied.push(lang);};
  I18N.switchTo('en');
  assert.equal(classes.has('lang-fade'),true);assert.equal(applied.length,0);
  callbacks.transitionend();timers.forEach(fn=>fn());
  assert.deepEqual(applied,['en']);assert.equal(classes.has('lang-fade'),false);
});

test('rapid language clicks honor the last choice without dropping the fade',()=>{
  const {I18N,classes,callbacks,timers}=setup();const applied=[];
  I18N.currentLang='es';I18N.apply=lang=>{I18N.currentLang=lang;applied.push(lang);};
  for(const lang of ['en','es','en','es'])I18N.switchTo(lang);
  assert.equal(classes.has('lang-fade'),true);assert.equal(timers.length,1);
  callbacks.transitionend();timers.forEach(fn=>fn());
  assert.deepEqual(applied,['es']);assert.equal(classes.has('lang-fade'),false);
});

test('product specifications follow their key even when cards change order',()=>{
  const {I18N,TRANSLATIONS,selections}=setup();
  const products=['cat.spec.px.elyse','cat.spec.px.a920duo','cat.spec.la.c20pro'].map(key=>({dataset:{specKey:key},textContent:''}));
  selections.set('.catalog-specs',products);
  for(const lang of ['en','es','en']) {
    I18N._applyCatalogItems(lang,TRANSLATIONS[lang]);
    for(const p of products)assert.equal(p.textContent,TRANSLATIONS[lang][p.dataset.specKey]);
    products.reverse();
  }
});

test('static catalogs contain identical models with correct localized specifications',()=>{
  const {TRANSLATIONS}=setup();const names=[];
  for(const [file,lang]of [['index.html','es'],['en/index.html','en']]) {
    const html=fs.readFileSync(path.join(root,file),'utf8');
    const cards=[...html.matchAll(/<article\b[^>]*class="[^"]*catalog-card[^"]*"[^>]*>[\s\S]*?<\/article>/g)].map(m=>m[0]);
    names.push(cards.map(card=>card.match(/<h3\b[^>]*>(.*?)<\/h3>/)[1]));
    assert.equal(cards.length,21);
    for(const card of cards) {
      const spec=card.match(/<p class="catalog-specs"[^>]*data-spec-key="([^"]+)"[^>]*>([\s\S]*?)<\/p>/);
      assert.ok(spec);assert.equal(spec[2],TRANSLATIONS[lang][spec[1]]);
    }
  }
  assert.deepEqual(names[0],names[1]);
});
test('static language pages expose matching canonical and alternates',()=>{
  for(const [file,lang]of [['index.html','es'],['en/index.html','en']]) {
    const html=fs.readFileSync(path.join(root,file),'utf8');
    assert.ok(html.includes(`<html lang="${lang}"`));
    assert.ok(html.includes(`rel="canonical" href="https://catapultapay.com/${lang==='en'?'en/':''}"`));
    assert.ok(html.includes('hreflang="en" href="https://catapultapay.com/en/"'));
    assert.doesNotMatch(html,/https:\/\/catapultapay\.com\/en["<]/);
  }
});

test('owned language pages opt out of browser translation before scripts run',()=>{
  for(const [file,lang] of [['index.html','es'],['en/index.html','en']]) {
    const html=fs.readFileSync(path.join(root,file),'utf8');
    assert.match(html,new RegExp(`<html\\b[^>]*lang="${lang}"[^>]*translate="no"[^>]*class="notranslate"`));
    assert.match(html,/<meta name="google" content="notranslate"\s*\/>/);
    const {TRANSLATIONS}=setup(lang);
    const heading=html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)[1];
    assert.equal(heading.trim().replace(/\s+/g,' '),TRANSLATIONS[lang]['hero.h1']);
    assert.doesNotMatch(html,/<meta name="robots"[^>]*noindex/);
  }
});

test('both language pages load the same application assets available offline',()=>{
  const worker=fs.readFileSync(path.join(root,'sw.js'),'utf8');
  const assets=file=>[...fs.readFileSync(path.join(root,file),'utf8').matchAll(/(?:src|href)="([^"]+\.(?:css|js)\?v=\d+)"/g)]
    .map(match=>new URL(match[1],'https://catapultapay.com/'+(file.startsWith('en/')?'en/':'')))
    .filter(url=>url.origin==='https://catapultapay.com').map(url=>url.pathname+url.search).sort();
  const spanish=assets('index.html');
  assert.deepEqual(assets('en/index.html'),spanish);
  for(const asset of spanish)assert.ok(worker.includes("'"+asset+"'"),asset);
});

test('direct language URLs win over a stored preference',()=>{
  for(const [pathname,expected] of [['/','es'],['/index.html','es'],['/en','en'],['/en/','en'],['/en/index.html','en']]) {
    const {I18N,context}=setup();
    context.location.pathname=pathname;
    context.CP={storage:{get:()=>expected==='es'?'en':'es'}};
    let selected;I18N.apply=lang=>{selected=lang;};I18N._bindLangButtons=()=>{};
    I18N.init();assert.equal(selected,expected,pathname);
  }
});

test('accessible labels translate both ways without changing proper names',()=>{
  const {I18N,selections}=setup();
  const make=value=>({attrs:{'aria-label':value},getAttribute(k){return this.attrs[k]??null;},setAttribute(k,v){this.attrs[k]=v;}});
  const translated=make('Volver al inicio'),proper=make('Mi Pueblito Market');
  selections.set('[aria-label], [title], img[alt]',[translated,proper]);
  I18N._applyAccessibility('en');assert.equal(translated.attrs['aria-label'],'Back to top');
  I18N._applyAccessibility('es');assert.equal(translated.attrs['aria-label'],'Volver al inicio');
  assert.equal(proper.attrs['aria-label'],'Mi Pueblito Market');
});
