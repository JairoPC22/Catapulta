// Keep localized metadata and catalog feature lists consistent in static HTML.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const context = vm.createContext({document:{documentElement:{lang:'es'},readyState:'loading',addEventListener(){}}});
vm.runInContext(fs.readFileSync(path.join(root,'i18n.js'),'utf8'),context);
const {I18N,TRANSLATIONS,ATTRIBUTE_TRANSLATIONS} = vm.runInContext('({I18N,TRANSLATIONS,ATTRIBUTE_TRANSLATIONS})',context);
const source = fs.readFileSync(path.join(root,'index.html'),'utf8');
const featurePattern = /(<ul class="catalog-features">)([\s\S]*?)(<\/ul>)/g;
const features = [...source.matchAll(featurePattern)].map(match=>match[2]);
for(const [file,lang] of [['index.html','es'],['en/index.html','en']]) {
  const target=path.join(root,file);
  let html=fs.readFileSync(target,'utf8');
  html=html.replace(/\b(aria-label|title|alt)="([^"]*)"/g,(whole,attr,value)=>{
    const pair=ATTRIBUTE_TRANSLATIONS.find(row=>row.includes(value));
    return pair ? attr+'="'+pair[lang==='en'?1:0]+'"' : whole;
  });
  if(lang==='en') {
    html=html.replace('>Saltar al contenido principal</a>','>Skip to main content</a>')
      .replace('href="/privacy.html">Privacidad</a>','href="/privacy.html">Privacy</a>')
      .replace('href="/cookies.html">Cookies y almacenamiento</a>','href="/cookies.html">Cookies and storage</a>');
  }
  let index=0;
  html=html.replace(featurePattern,(whole,open,body,close)=>{
    const original=features[index++];
    if(original===undefined)throw Error('Catalog structure differs by language');
    return open+(lang==='en'?I18N._replaceFeatureLabels(original,'es','en'):original)+close;
  });
  if(index!==features.length)throw Error('Catalog feature count differs by language');
  html=html.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/,(_,open,json,close)=>open+'\n'+JSON.stringify(I18N._localizedGraph(JSON.parse(json),lang,TRANSLATIONS[lang]),null,2)+'\n'+close);
  fs.writeFileSync(target,html);
}
console.log('Localized catalog and structured data synchronized.');
