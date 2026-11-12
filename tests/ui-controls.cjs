const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
function element(extra={}) {
  const attrs={},events={},classes=new Set();
  return Object.assign({dataset:{},hidden:false,textContent:'',attrs,events,
    classList:{add:k=>classes.add(k),remove:k=>classes.delete(k),contains:k=>classes.has(k),toggle(k,v){if(v)classes.add(k);else classes.delete(k);}},
    setAttribute(k,v){attrs[k]=String(v);},getAttribute:k=>attrs[k]??null,removeAttribute:k=>delete attrs[k],
    addEventListener(k,fn){(events[k]??=[]).push(fn);},dispatchEvent(e){for(const fn of events[e.type]||[])fn(e);},focus(){},scrollIntoView(){}
  },extra);
}
function key(el,value) {const event={type:'keydown',key:value,preventDefault(){this.prevented=true;}};el.dispatchEvent(event);return event;}
function selectFixture() {
  const native=element({value:''}),trigger=element(),list=element({id:'subjects',hidden:true}),value=element({dataset:{placeholder:'Selecciona una opción'}}),form=element();
  const options=['pos','virtual','support','general'].map(v=>element({dataset:{value:v},textContent:v}));
  trigger.querySelector=()=>value;list.querySelectorAll=()=>options;native.closest=()=>form;
  const children={'.custom-select-native':native,'.custom-select-trigger':trigger,'.custom-select-list':list};
  const container=element({querySelector:s=>children[s],contains:el=>[native,trigger,list,value,...options].includes(el)});
  const document=element({readyState:'loading',querySelectorAll:()=>[container]});
  const context=vm.createContext({document,Event,setTimeout:fn=>fn()});
  vm.runInContext(fs.readFileSync(path.join(root,'assets/js/custom-select.js'),'utf8'),context);
  document.dispatchEvent({type:'DOMContentLoaded'});return {native,trigger,list,options,value,document};
}
test('keyboard select can choose the first option with Enter and closes on Tab or focus exit',()=>{
  const {native,trigger,list,document}=selectFixture();
  key(trigger,'Enter');assert.equal(list.hidden,false);key(trigger,'Enter');assert.equal(native.value,'pos');assert.equal(list.hidden,true);
  key(trigger,'ArrowDown');assert.equal(trigger.getAttribute('aria-activedescendant'),'subjects-opt-0');
  assert.equal(key(trigger,'Tab').prevented,undefined);assert.equal(list.hidden,true);
  key(trigger,'Enter');document.dispatchEvent({type:'focusin',target:element()});assert.equal(list.hidden,true);
});
test('keyboard select supports first/last options, arrows and Escape without premature selection',()=>{
  const {native,trigger,list}=selectFixture();
  key(trigger,'ArrowDown');assert.equal(trigger.getAttribute('aria-activedescendant'),'subjects-opt-0');
  key(trigger,'End');assert.equal(trigger.getAttribute('aria-activedescendant'),'subjects-opt-3');
  key(trigger,'Home');assert.equal(trigger.getAttribute('aria-activedescendant'),'subjects-opt-0');
  key(trigger,'ArrowDown');assert.equal(trigger.getAttribute('aria-activedescendant'),'subjects-opt-1');assert.equal(native.value,'');
  key(trigger,'Escape');assert.equal(list.hidden,true);assert.equal(trigger.getAttribute('aria-activedescendant'),null);assert.equal(native.value,'');
});
function catalogFixture(saved='es') {
  const rootEl=element({lang:'es',dataset:{}}),main=element(),frame=element(),loading=element(),name=element(),home=element(),link=element();home.setAttribute('href','/');
  Object.defineProperty(frame,'src',{get(){return this.getAttribute('src');},set(v){this.setAttribute('src',v);}});
  const buttons=['es','en'].map(lang=>element({dataset:{lang}}));
  const blocks=['es','en'].map(language=>element({dataset:{language}}));
  const document=element({documentElement:rootEl,body:element({dataset:{titleEs:'Catálogo',titleEn:'Catalog'}}),
    getElementById:id=>({main,catalogFrame:frame,catalogLoading:loading,catalogFileName:name})[id]||null,
    querySelector:()=>null,querySelectorAll:s=>s==='.lang-btn'?buttons:s==='[data-language]'?blocks:s==='.catalog-pdf-link'?[link]:s.startsWith('a[href=')?[home]:[]});
  const prefs={'cpay-lang':saved},timers=[];
  const context=vm.createContext({document,window:{setTimeout:fn=>timers.push(fn)},setTimeout:fn=>timers.push(fn),clearTimeout(){},
    CP:{storage:{get:(k,f)=>prefs[k]??f,set:(k,v)=>prefs[k]=v}},matchMedia:()=>({matches:false}),requestAnimationFrame:fn=>fn(),
    CustomEvent:class{constructor(type,opts){this.type=type;this.detail=opts.detail;}}});
  for(const file of ['legal.js','catalog.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context);
  document.dispatchEvent({type:'DOMContentLoaded'});
  return {document,buttons,blocks,rootEl,main,frame,home,timers};
}
test('invalid saved language leaves catalog content visible with a matching PDF',()=>{
  const {rootEl,blocks,frame}=catalogFixture('fr');
  assert.equal(rootEl.lang,'es');assert.equal(blocks[0].hidden,false);assert.equal(blocks[1].hidden,true);assert.match(frame.src,/Spanish\.pdf$/);
});
test('rapid catalog language choices keep PDF, content and home link in the same language',()=>{
  const f=catalogFixture();
  f.buttons[1].dispatchEvent({type:'click'});f.buttons[0].dispatchEvent({type:'click'});
  f.main.dispatchEvent({type:'transitionend'});f.timers.forEach(fn=>fn());
  assert.equal(f.rootEl.lang,'es');assert.match(f.frame.src,/Spanish\.pdf$/);
  f.buttons[1].dispatchEvent({type:'click'});f.main.dispatchEvent({type:'transitionend'});f.timers.forEach(fn=>fn());
  assert.equal(f.rootEl.lang,'en');assert.match(f.frame.src,/English\.pdf$/);assert.equal(f.home.getAttribute('href'),'/en/');
  assert.equal(f.frame.title,'CatapultaPayment equipment catalog');
});

test('English recovery keeps email help available and offline retry points to the requested page',()=>{
  for(const kind of ['404','500','offline']) {
    const primary=element({firstChild:{textContent:''}}),help=element({href:'mailto:info@catapultapay.com'}),rootEl=element({dataset:{}});
    const nodes=new Map([['.recovery-primary',primary],['.recovery-help',help]]);
    const document=element({documentElement:rootEl,body:{dataset:{errorKind:kind}},querySelector:s=>{
      if(!nodes.has(s))nodes.set(s,element());return nodes.get(s);
    }});
    const location={pathname:'/requested-page',search:'',href:'https://catapultapay.com/requested-page'};
    vm.runInNewContext(fs.readFileSync(path.join(root,'recovery.js'),'utf8'),{document,location,localStorage:{getItem:k=>k==='cpay-lang'?'en':null}});
    document.dispatchEvent({type:'DOMContentLoaded'});
    assert.equal(rootEl.dataset.theme,'light');assert.equal(rootEl.lang,'en');
    assert.equal(primary.href,kind==='offline'?location.href:'/en/');assert.equal(help.href,'mailto:info@catapultapay.com');
  }
});

test('testimonial dots track the nearest visible card independently of offset parent and respect reduced motion',()=>{
  const slides=[700,450,200].map(left=>element({offsetLeft:0,offsetWidth:100,getBoundingClientRect:()=>({left,width:100}),scrollIntoView(options){this.scrolled=options;}}));
  const track=element({clientWidth:200,querySelectorAll:()=>slides,getBoundingClientRect:()=>({left:150})});
  const dots=slides.map(()=>element()),status=element(),prev=element(),next=element();
  const nodes={testiTrack:track,testiControls:element(),testiDots:{children:dots},testiStatus:status,testiPrev:prev,testiNext:next};
  const document=element({querySelector:()=>null,getElementById:id=>nodes[id]});
  const ctx=vm.createContext({document,CP:{reducedMotion:()=>true},requestAnimationFrame:fn=>fn()});
  vm.runInContext(fs.readFileSync(path.join(root,'design.js'),'utf8'),ctx);
  vm.runInContext('initTestimonialCarousel()',ctx);
  track.dispatchEvent({type:'scroll'});assert.equal(status.textContent,'3 / 3');assert.equal(next.disabled,true);
  prev.dispatchEvent({type:'click'});assert.equal(status.textContent,'2 / 3');assert.equal(slides[1].scrolled.behavior,'instant');
});
