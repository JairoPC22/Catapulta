// Keep localized metadata and catalog feature lists consistent in static HTML.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {protectTranslations} = require('./protect-translations.cjs');
const root = path.resolve(__dirname, '..');
const context = vm.createContext({document:{documentElement:{lang:'es'},readyState:'loading',addEventListener(){}}});
vm.runInContext(fs.readFileSync(path.join(root,'i18n.js'),'utf8'),context);
const {I18N,TRANSLATIONS,ATTRIBUTE_TRANSLATIONS} = vm.runInContext('({I18N,TRANSLATIONS,ATTRIBUTE_TRANSLATIONS})',context);
const source = fs.readFileSync(path.join(root,'index.html'),'utf8');
const brands = ['dejavoo','clover','sunmi','pax','landi'];
const specKeys = new Map([
  ['Dejavoo P1','dj.p1'],['Dejavoo QD2','dj.qd2'],['Dejavoo D1','dj.d1'],
  ['Clover Flex','cl.flex'],['Clover Mini','cl.mini'],['Clover Station Duo','cl.duo'],
  ['Sunmi P2 Pro','su.p2pro'],['Sunmi T2S','su.t2s'],['Sunmi P2 Mini','su.p2mini'],['Sunmi D3 PRO','su.d3pro'],
  ['PAX A920 Pro','px.a920'],['PAX A920Pro Duo','px.a920duo'],['PAX A77','px.a77'],['PAX A80','px.a80'],['PAX A35','px.a35'],
  ['PAX Elyse','px.elyse'],['PAX Elyse Sistema','px.sistema'],['PAX E700','px.e700'],['PAX Kiosk','px.kiosk'],
  ['Landi M20','la.m20'],['Landi C20 Pro','la.c20pro']
]);
function panelRange(html, brand) {
  const open = new RegExp('<div\\b[^>]*id="brand-'+brand+'"[^>]*>').exec(html);
  if(!open) throw Error('Missing catalog brand: '+brand);
  const tags=/<\/?div\b[^>]*>/g;tags.lastIndex=open.index;
  let depth=0,tag;
  while((tag=tags.exec(html))) {
    depth+=tag[0].startsWith('</')?-1:1;
    if(!depth)return {start:open.index,end:tags.lastIndex};
  }
  throw Error('Unclosed catalog brand: '+brand);
}
function localizedPanel(html,lang) {
  return html.replace(/<article\b[^>]*class="[^"]*catalog-card[^\"]*"[^>]*>[\s\S]*?<\/article>/g,card=>{
    const name=card.match(/<h3\b[^>]*>(.*?)<\/h3>/)?.[1];
    const key='cat.spec.'+specKeys.get(name);
    if(!TRANSLATIONS.es[key]||!TRANSLATIONS.en[key])throw Error('Missing product translation: '+name);
    card=card.replace(/(<p class="catalog-specs"[^>]*>)[\s\S]*?<\/p>/,(_,open)=>open.replace(/ data-spec-key="[^"]*"/g,'').replace(/>$/,' data-spec-key="'+key+'">')+TRANSLATIONS[lang][key]+'</p>');
    card=card.replace(/(<ul class="catalog-features">)([\s\S]*?)(<\/ul>)/g,(_,open,body,close)=>open+(lang==='en'?I18N._replaceFeatureLabels(body,'es','en'):body)+close);
    if(lang==='en') {
      for(const key of Object.keys(TRANSLATIONS.es).filter(key=>key.startsWith('cat.badge.')||key.startsWith('cat.price.')))card=card.split(TRANSLATIONS.es[key]).join(TRANSLATIONS.en[key]);
      card=card.replace(/\b(src|srcset)="(assets\/)/g,'$1="/$2');
    }
    return card;
  });
}
const outputs=[];
for(const [file,lang] of [['index.html','es'],['en/index.html','en']]) {
  const target=path.join(root,file);
  let html=fs.readFileSync(target,'utf8');
  html=html.replace(/(<h1\b[^>]*>)[\s\S]*?<\/h1>/,(_,open)=>open+'\n          '+TRANSLATIONS[lang]['hero.h1']+'</h1>');
  for(const brand of brands) {
    const original=panelRange(source,brand),current=panelRange(html,brand);
    html=html.slice(0,current.start)+localizedPanel(source.slice(original.start,original.end),lang)+html.slice(current.end);
  }
  html=html.replace(/\b(aria-label|title|alt)="([^"]*)"/g,(whole,attr,value)=>{
    const pair=ATTRIBUTE_TRANSLATIONS.find(row=>row.includes(value));
    return pair ? attr+'="'+pair[lang==='en'?1:0]+'"' : whole;
  });
  if(lang==='en') {
    html=html.replace('>Saltar al contenido principal</a>','>Skip to main content</a>')
      .replace('href="/privacy.html">Privacidad</a>','href="/privacy.html">Privacy</a>')
      .replace('href="/cookies.html">Cookies y almacenamiento</a>','href="/cookies.html">Cookies and storage</a>');
  }
  html=html.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/,(_,open,json,close)=>open+'\n'+JSON.stringify(I18N._localizedGraph(JSON.parse(json),lang,TRANSLATIONS[lang]),null,2)+'\n'+close);
  outputs.push([target,protectTranslations(html)]);
}
// Validate both languages before writing either one.
for(const [target,html] of outputs)fs.writeFileSync(target,html);
console.log('Localized catalog and structured data synchronized.');
