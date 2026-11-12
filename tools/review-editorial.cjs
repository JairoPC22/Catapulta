// Apply editorial cleanup to the dictionary and static landing pages.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
let source=fs.readFileSync(path.join(root,'i18n.js'),'utf8');
const context=vm.createContext({document:{documentElement:{lang:'es'},readyState:'loading',addEventListener(){}}});
vm.runInContext(source,context);const original=vm.runInContext('TRANSLATIONS',context);
const changes={es:{
  'calc.desc':'Ajusta los controles para obtener una estimación de ahorro para tu negocio.',
  'sol.tab.physical':'Equipos físicos','sol.tab.virtual':'Procesamiento virtual',
  'sol.p1.title':'Cajas registradoras y terminales','sol.p1.desc':'Cajas registradoras y terminales para ventas en mostrador y comercios minoristas.',
  'sol.p3.desc':'Aplicaciones y lectores para ferias, mercados y servicios a domicilio.',
  'sol.p5.desc':'Gestión de inventario, clientes y ventas con cobros integrados.',
  'sol.v1.title':'Pasarelas de comercio electrónico','sol.v1.desc':'Conexión segura entre tu tienda en línea y el procesador de pagos.',
  'sol.v2.desc':'Pagos recurrentes, códigos QR y enlaces por correo electrónico o SMS.',
  'sol.v3.desc':'Panel en la nube para ingresar pagos sin una terminal física.',
  'sol.v4.title':'Aplicaciones POS móviles','sol.v4.desc':'Procesa pagos desde una tableta o un teléfono con funciones de punto de venta.',
  'sol.v6.desc':'Panel de ventas, contracargos y rendimiento desde cualquier dispositivo.',
  'testi.desc':'Conoce la experiencia de algunos de nuestros clientes.',
  'steps.s1.title':'Cuéntanos sobre tu negocio',
  'steps.s1.desc':'Completa el formulario o llámanos para conocer tu volumen de ventas, tu sector y tus necesidades.',
  'steps.s3.desc':'Configuramos tus terminales o tu pasarela de pagos y capacitamos a tu equipo para utilizarlas.',
  'steps.s4.desc':'Acepta pagos con chip, sin contacto, con banda magnética y en línea desde el primer día, con soporte bilingüe.',
  'contact.support':'Soporte técnico','form.opt.pos':'Terminal y sistema POS',
  'form.err.email':'Ingresa un correo electrónico válido.',
  'form.consent':'Al enviar, solicitas que te contactemos conforme a nuestro','form.terms':'Términos de uso',
  'footer.sol.physical':'Equipos POS','footer.sol.virtual':'Procesamiento virtual','footer.sol.gateway':'Pasarelas de pago','footer.sol.catalog':'Catálogo de equipos','footer.success':'Casos de éxito',
  'cat.feat.host':'Internet y alojamiento:','cat.feat.app.client':'Aplicación para clientes:',
  'cat.feat.su.usb':'USB tipo C · GPS y A-GPS','cat.feat.su.temp':'Funcionamiento de -10 °C a 50 °C · 430 g',
  'cat.feat.su.drop':'Resistente a caídas de 1.2 m','cat.feat.su.weight':'200 g · 15 mm de grosor',
  'cat.feat.px.cam':'Cámara de 5 MP con enfoque automático · BT 5.0','cat.feat.px.fp':'Lector de huellas en el botón de encendido',
  'cat.feat.px.usb':'USB tipo C · POGO PIN','cat.feat.px.scanner':'Escáner con función de walkie-talkie',
  'cat.feat.px.a77use':'Ideal para cobros móviles sin necesidad de imprimir recibos',
  'cat.feat.px.a35printer':'Impresora de recibos por separado','cat.feat.la.sd':'Compatible con tarjetas SD 3.0'
},en:{
  'calc.desc':'Adjust the sliders to estimate potential savings for your business.',
  'sol.tab.physical':'POS equipment','sol.tab.virtual':'Online payments',
  'sol.p1.title':'Cash registers and terminals','sol.p1.desc':'Cash registers and payment terminals for countertop sales and retail businesses.',
  'sol.p2.desc':'Touchscreens with integrated readers for cafés and self-service kiosks.',
  'sol.p3.desc':'Apps and readers for fairs, markets, and mobile businesses.',
  'sol.p5.desc':'Inventory, customer, and sales management with integrated payments.',
  'sol.v3.desc':'An online dashboard for entering payments without a physical terminal.',
  'sol.v4.desc':'Accept payments from a tablet or smartphone with point-of-sale features.',
  'testi.desc':'See what some of our customers say about working with us.',
  'steps.s1.desc':'Fill out the form or call us so we can learn about your sales volume, industry, and needs.',
  'steps.s3.desc':'We set up your terminals or payment gateway and train your team to use them.',
  'steps.s4.desc':'Accept chip, contactless, magnetic-stripe, and online payments from day one, with bilingual support.',
  'form.opt.pos':'POS terminal and system','form.err.email':'Enter a valid email address.',
  'form.consent':'By submitting, you ask us to contact you in accordance with our','form.terms':'Terms of use',
  'term.summary.net':'Net amount received'
}};
const escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const quote=s=>"'"+s.replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,'\\n')+"'";
for(const lang of ['es','en']) {
  const start=source.indexOf('  '+lang+': {');
  const end=lang==='es'?source.indexOf('  en: {'):source.indexOf('// MÓDULO I18N');
  let block=source.slice(start,end);
  let html=fs.readFileSync(path.join(root,lang==='es'?'index.html':'en/index.html'),'utf8');
  for(const [key,value] of Object.entries(changes[lang])) {
    const old=original[lang][key];if(typeof old!=='string')throw Error('Unknown copy: '+key);
    const literal=new RegExp("('"+escape(key)+"':\\s*)(?:'(?:\\\\.|[^'\\\\])*'|\"(?:\\\\.|[^\"\\\\])*\")");
    if(!literal.test(block))throw Error('Missing dictionary key: '+key);
    block=block.replace(literal,(_,prefix)=>prefix+quote(value));
    if(old!==value)html=html.replace(new RegExp(escape(old).replace(/\s+/g,'\\s+'),'g'),()=>value);
  }
  source=source.slice(0,start)+block+source.slice(end);
  fs.writeFileSync(path.join(root,lang==='es'?'index.html':'en/index.html'),html);
}
fs.writeFileSync(path.join(root,'i18n.js'),source);
console.log('Editorial copy updated without changing customer quotations or business terms.');
