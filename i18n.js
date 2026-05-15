'use strict';
// ══════════════════════════════════════════
// CatapultaPay — i18n.js
// Sistema de traducción ES / EN
// ══════════════════════════════════════════

const TRANSLATIONS = {

  /* ─────────── ESPAÑOL ─────────── */
  es: {
    'page.title': 'CatapultaPay — Simplificamos tus cobros, aceleramos tus ingresos',
    // NAV
    'nav.home': 'Inicio', 'nav.about': 'Nosotros', 'nav.solutions': 'Soluciones',
    'nav.catalog': 'Catálogo', 'nav.clients': 'Clientes', 'nav.contact': 'Contacto',
    'nav.cta': 'Empieza ya',
    // HERO
    'hero.label': 'Tu próximo procesador de pagos',
    'hero.h1': 'Simplificamos tus cobros,<br />para acelerar tus<br /><em class="grad-text">ingresos.</em>',
    'hero.desc': 'Te ayudamos a elegir, configurar y optimizar las mejores plataformas de pago para tu empresa. Mejora tu conversión, reduce costos y cumple con estándares de seguridad global.',
    'hero.cta1': 'Empieza a cobrar', 'hero.cta2': 'Ver equipos',
    'hero.trust': '400+ negocios ya confían en nosotros',
    // DASHBOARD
    'dash.title': 'Rendimiento de cobros', 'dash.badge': 'Esta semana',
    'dash.bar1': 'Tarjeta Crédito', 'dash.bar2': 'Tarjeta Débito',
    'dash.bar3': 'Sin Contacto', 'dash.bar4': 'QR / Online',
    'badge.approved': 'Pago aprobado', 'badge.pci': 'PCI DSS Certificado',
    // MARQUEE (array — se duplica automáticamente)
    'marquee': ['Terminales POS','Procesamiento Virtual','Pasarelas de Pago',
      'Soporte Bilingüe','Mitigación de Contracargos','Financiación Mismo Día',
      'Múltiples Bancos','Equipos Sunmi','Equipos Dejavoo','Alto Riesgo'],
    // ABOUT
    'about.label': 'Nosotros',
    'about.title': 'El socio que tu negocio<br />necesitaba para cobrar mejor.',
    'about.desc': 'Somos una organización líder en procesamiento de pagos, con soluciones financieras avanzadas y soporte experto multilingüe para ayudarte a competir en el mercado actual.',
    'about.badge': '400+ Negocios activos',
    'about.f1.title': 'Conexión con múltiples bancos',
    'about.f1.desc': 'Acceso a bancos patrocinadores para atender diversos sectores, incluyendo negocios de alto riesgo.',
    'about.f2.title': 'Soluciones integrales',
    'about.f2.desc': 'Programas POS, precios competitivos y financiación rápida: mismo día o al día siguiente.',
    'about.f3.title': 'Mitigación de contracargos',
    'about.f3.desc': 'Tecnología avanzada para reducir disputas y proteger cada transacción de tu negocio.',
    // STATS
    'stats.years': 'Años en el negocio', 'stats.businesses': 'Negocios cobrando ahora',
    'stats.partners': 'Proveedores aliados', 'stats.support': 'Atención bilingüe',
    // CALCULATOR
    'calc.label': 'Calculadora de ahorro',
    'calc.title': 'Descubre cuánto puedes<br /><em class="grad-text">ahorrar con nosotros.</em>',
    'calc.desc': 'Mueve los controles y ve el impacto real en tu negocio.',
    'calc.sales.label': 'Ventas mensuales', 'calc.rate.label': 'Tu tasa actual de procesamiento',
    'calc.note': 'Tasa CatapultaPay desde <strong>1.89%</strong> · Sin cargos ocultos',
    'calc.current.label': 'Pagas actualmente', 'calc.current.sub': 'al mes en comisiones',
    'calc.catapulta.label': 'Con CatapultaPay', 'calc.catapulta.sub': 'al mes en comisiones',
    'calc.savings.title': 'Tu ahorro estimado',
    'calc.savings.month': 'por mes', 'calc.savings.year': 'por año',
    'calc.cta': 'Quiero ese ahorro',
    // SOLUTIONS
    'sol.label': 'Soluciones',
    'sol.title': 'Todo lo que necesitas<br />para cobrar sin límites.',
    'sol.tab.physical': 'Equipo Físico', 'sol.tab.virtual': 'Procesamiento Virtual',
    'sol.p1.title': 'Registros y terminales básicos',
    'sol.p1.desc': 'Cajas con terminales para ventas en mostrador y retail básico.',
    'sol.p2.title': 'Cajas de autoservicio',
    'sol.p2.desc': 'Pantalla táctil con lectores integrados para cafeterías y kioscos.',
    'sol.p3.title': 'Lectores móviles',
    'sol.p3.desc': 'Apps y lectores para ferias, mercados y servicios en campo.',
    'sol.p4.title': 'Terminales inteligentes',
    'sol.p4.desc': 'Dispositivos todo en uno con WiFi y conectividad móvil.',
    'sol.p5.title': 'Puntos de venta POS',
    'sol.p5.desc': 'Gestión de inventario, clientes y ventas con terminal integrado.',
    'sol.p6.title': 'Ver catálogo completo',
    'sol.p6.desc': 'Explora todos los equipos disponibles para tu negocio.',
    'sol.p6.link': 'Ir al catálogo',
    'sol.v1.title': 'Pasarelas ecommerce',
    'sol.v1.desc': 'Conexión segura entre tu tienda online y el procesador de pago.',
    'sol.v2.title': 'Portales de pago',
    'sol.v2.desc': 'Pagos recurrentes, QR y links por email o SMS.',
    'sol.v3.title': 'Terminal virtual',
    'sol.v3.desc': 'Panel cloud para ingresar pagos sin necesidad de hardware.',
    'sol.v4.title': 'Apps POS móviles',
    'sol.v4.desc': 'Procesa desde tablet o smartphone con funciones POS completas.',
    'sol.v5.title': 'Seguridad PCI DSS',
    'sol.v5.desc': 'Cifrado end-to-end y prevención de fraude en cada transacción.',
    'sol.v6.title': 'Reportes en tiempo real',
    'sol.v6.desc': 'Dashboard de ventas, contracargos y rendimiento desde cualquier dispositivo.',
    // CATALOG
    'cat.label': 'Catálogo 2025',
    'cat.title': 'Equipos para cada<br />tipo de negocio.',
    'cat.desc': 'Renta, lease o compra. Todos incluyen configuración y soporte bilingüe.',
    'cat.badge.popular': 'Más popular', 'cat.badge.advanced': 'Más avanzado',
    'cat.badge.large': 'Para grandes negocios', 'cat.badge.self': 'Autoservicio',
    'cat.badge.dual': 'Doble pantalla',
    'cat.price.available': 'Compra · Renta/Lease disponible',
    'cat.price.approval': 'Compra · Renta/Lease sujeto a aprobación',
    'cat.cta.text': '¿No encuentras lo que buscas? Tenemos más equipos disponibles.',
    'cat.cta.btn1': 'Pedir asesoría', 'cat.cta.btn2': 'Descargar catálogo PDF',
    // Catalog specs (product descriptions)
    'cat.spec.dj.p1': 'Pantalla 5.5" Touch · WiFi 2.4/5GHz · 4G · Chip · Banda · Sin contacto · Impresora',
    'cat.spec.dj.qd2': 'LCD 5.5" Touch · Impresora 58mm · WiFi · Contactless · IPOSpays · SPIn',
    'cat.spec.dj.d1': 'Para restaurantes y retail · Configuración rápida · Alta velocidad',
    'cat.spec.cl.flex': 'WiFi · 4G · Ethernet · Lector + Contactless · Impresora · App Market',
    'cat.spec.cl.mini': 'WiFi · Ethernet · Impresora · Contactless · App Market · Clover Market',
    'cat.spec.cl.duo': 'WiFi · 4G · Ethernet · Doble pantalla 10" · Touch · App Market · Impresora',
    'cat.spec.su.p2pro': 'Pantalla HD+ 5.99" · Quad-core · Escáner 1D/2D · 4G · WiFi · GPS · Impresora 58mm',
    'cat.spec.su.t2s': '15" + 10" · Android · Cámara · WiFi · Bluetooth · Handheld · SUNMI OS 3.0',
    'cat.spec.su.p2mini': 'Pantalla HD 5" · 4G LTE · WiFi Dual · BT 5.0 · NFC · QR · PCI/EMV · Android 9.0',
    'cat.spec.su.d3pro': '15.6" FHD · Qualcomm · SUNMI OS 4.0 · 4GB RAM · 64GB ROM · Aluminio',
    'cat.spec.px.a920': 'Android 8.1 · Pantalla IPS 5.5" · 4G · WiFi · Bluetooth · Cámara 5MP · Impresora',
    'cat.spec.px.elyse': 'Android 11 · FHD 14" Touch · Qualcomm Octa-Core 2.0GHz · 4GB RAM · 64GB ROM',
    'cat.spec.px.sistema': 'Modular · PCI DSS · Red Dot Award · Workstation + Tablet + Scanner + Impresora',
    'cat.spec.px.e700': 'Pantalla HD 12.5" · 4G · WiFi · Bluetooth · Impresora 3" · PCI 5.x SRED · NFC',
    'cat.spec.px.kiosk': 'Pantalla 24" · Escáner · Ethernet · Impresora · Lector de tarjetas · Self-checkout',
    'cat.spec.la.m20': 'Android 13 · Quad-core 2.0GHz · Pantalla 6.5" · Diseñado para una mano',
    'cat.spec.la.c20pro': 'Android 13 · Qualcomm Octa-Core · Doble pantalla · Compatible con SoftPOS',
    // Catalog feature list items (HTML with <strong>)
    'cat.feat.sw.basic': 'Software básico:', 'cat.feat.sw.full': 'Software completo:',
    'cat.feat.sw': 'Software:', 'cat.feat.inv.with': 'Con inventario:',
    'cat.feat.inv.without': 'Sin inventario:', 'cat.feat.internet': 'Internet:',
    'cat.feat.internet.opt': 'Internet opcional:', 'cat.feat.host': 'Internet/Hosting:',
    'cat.feat.app.client': 'App cliente:', 'cat.feat.per.month': '/mes',
    // Sunmi-specific features
    'cat.feat.su.bat': 'Batería 2580mAh de larga duración',
    'cat.feat.su.usb': 'USB Tipo C · GPS y A-GPS',
    'cat.feat.su.temp': 'Operación -10°C a 50°C · 430g',
    'cat.feat.su.chip': 'Chip, banda, NFC y QR',
    'cat.feat.su.drop': 'Resistente a caídas de 1.2m',
    'cat.feat.su.weight': '200g · 15mm de grosor',
    'cat.feat.su.perf': '60% mejor rendimiento',
    'cat.feat.su.modules': 'Módulos opcionales: pantalla cliente, NFC',
    'cat.feat.su.pnp': 'Plug &amp; Play · Personalizable con tu marca',
    // PAX-specific features
    'cat.feat.px.cam': 'Cámara 5MP Auto Focus · BT 5.0',
    'cat.feat.px.fp': 'Lector de huella en encendido',
    'cat.feat.px.usb': 'USB Tipo C · POGO PIN',
    'cat.feat.px.enc': 'Cifrado, tokenización y PCI DSS',
    'cat.feat.px.printer': 'Impresora 260mm/s ultrarrápida',
    'cat.feat.px.scanner': 'Scanner con función walkie-talkie',
    'cat.feat.px.nfc': 'NFC sin contacto',
    'cat.feat.px.pci': 'PCI 5.x SRED certificado',
    'cat.feat.px.hiprinter': 'Impresora de alta velocidad',
    // Landi-specific features
    'cat.feat.la.cert': 'Certificado CE/CB/FCC/IC/RoHS',
    'cat.feat.la.sd': 'Soporta tarjeta SD 3.0',
    'cat.feat.la.visual': 'Experiencia visual inmersiva',
    'cat.feat.la.screen': 'Pantalla independiente para cliente y operador',
    // GALLERY
    'gallery.label': 'En acción',
    'gallery.title': 'Nuestros equipos<br />operando en campo.',
    'gallery.desc': 'Instalaciones reales en negocios de nuestros clientes.',
    // TESTIMONIALS
    'testi.label': 'Casos de éxito',
    'testi.title': 'Confianza que<br />se siente.',
    'testi.q1': '"Implementar su sistema de pagos fue un acierto total. Nuestros comensales ahora pagan rápido y seguro. Hemos aumentado ventas especialmente en fines de semana. Una excelente inversión."',
    'testi.q2': '"El terminal virtual se sincronizó perfectamente con nuestro sistema. Ahora aceptamos pagos sin contacto y las transacciones son un 30% más rápidas."',
    'testi.q3': '"Grandes ahorros en comisiones y claridad total en los números. El sistema POS es confiable, fácil de usar y ha mejorado la eficiencia de cobros diarios."',
    'testi.verified': 'Cliente verificado',
    // CONTACT
    'contact.label': 'Contacto',
    'contact.title': '¿Listo para aceptar<br />pagos sin complicaciones?',
    'contact.desc': 'Soluciones de pago seguras, rápidas y adaptadas a tu negocio. Contáctanos y te ayudamos a elegir la mejor opción.',
    'contact.west': 'Zona Oeste', 'contact.east': 'Zona Este', 'contact.support': 'Soporte Técnico',
    'form.title': 'Envíanos un mensaje',
    'form.firstname': 'Nombre', 'form.firstname.ph': 'Tu nombre',
    'form.lastname': 'Apellido', 'form.lastname.ph': 'Tu apellido',
    'form.email': 'Correo electrónico', 'form.email.ph': 'tu@empresa.com',
    'form.phone': 'Teléfono', 'form.phone.ph': '+1 (555) 000-0000',
    'form.subject': '¿En qué podemos ayudarte?',
    'form.opt.default': 'Selecciona una opción', 'form.opt.pos': 'Terminal POS físico',
    'form.opt.virtual': 'Procesamiento virtual', 'form.opt.support': 'Soporte técnico',
    'form.opt.general': 'Consulta general',
    'form.message': 'Mensaje', 'form.message.ph': 'Cuéntanos sobre tu negocio...',
    'form.submit': 'Enviar mensaje', 'form.sending': 'Enviando...',
    // FOOTER
    'footer.desc': 'Soluciones de procesamiento de pagos para negocios de todos los tamaños. Conectamos tu empresa con los mejores procesadores.',
    'footer.col1': 'Soluciones', 'footer.col2': 'Empresa',
    'footer.sol.physical': 'Equipo Físico POS', 'footer.sol.virtual': 'Procesamiento Virtual',
    'footer.sol.gateway': 'Pasarelas de Pago', 'footer.sol.catalog': 'Catálogo de Equipos',
    'footer.about': 'Nosotros', 'footer.success': 'Casos de Éxito',
    'footer.contact': 'Contacto', 'footer.terms': 'Términos y Condiciones',
    'footer.download': 'Descargar Catálogo',
    'footer.rights': '© 2025 CATAPULTA PAYMENT SYSTEMS. Todos los derechos reservados.',
    'toast.msg': 'Mensaje enviado con éxito',
    'wa.href': 'https://wa.me/13109486153?text=Hola%2C+me+interesa+CatapultaPay',
    // TERMINAL SIMULADOR
    'term.label': 'Terminal en vivo',
    'term.title': 'Así de fácil cobras con CatapultaPay',
    'term.desc': 'Ingresa el monto con el teclado, elige cómo cobrar y procesa en segundos.',
    'term.screen.label': 'Ingresa monto',
    'term.method.title': 'Método de cobro',
    'term.summary.title': 'Resumen',
    'term.summary.amount': 'Monto a cobrar',
    'term.summary.rate': 'Tasa CatapultaPay',
    'term.summary.fee': 'Comisión estimada',
    'term.summary.net': 'Neto que recibes',
    'term.btn.process': 'Procesar pago',
    'term.reader.tag': 'Chip / Banda / NFC',
    'term.method.chip.name': 'Tarjeta con chip',
    'term.method.chip.sub': '•••• •••• •••• 4521 · Visa',
    'term.method.chip.label': 'Chip · Visa ••4521',
    'term.method.nfc.name': 'Sin contacto / NFC',
    'term.method.nfc.sub': 'Apple Pay · Google Pay',
    'term.method.nfc.label': 'NFC · Apple/Google Pay',
    'term.method.swipe.name': 'Banda magnética',
    'term.method.swipe.sub': '•••• •••• •••• 8834 · Amex',
    'term.method.swipe.label': 'Banda · Amex ••8834',
    'term.processing': 'Procesando',
    'term.approved': 'APROBADO',
    'term.thanks': 'Gracias por su compra',
    'term.ticket.date': 'Fecha', 'term.ticket.time': 'Hora',
    'term.ticket.txn': 'TXN', 'term.ticket.method': 'Método',
    'term.ticket.subtotal': 'Subtotal', 'term.ticket.rate': 'Tasa (1.89%)',
    'term.ticket.net': 'Neto recibido',
    'term.ticket.approved': 'PAGO APROBADO',
    'term.ticket.thanks': 'Gracias por usar CatapultaPay',
    'term.ticket.locale': 'es-MX',
  },

  /* ─────────── ENGLISH ─────────── */
  en: {
    'page.title': 'CatapultaPay — Simplify your collections, accelerate your revenue',
    // NAV
    'nav.home': 'Home', 'nav.about': 'About', 'nav.solutions': 'Solutions',
    'nav.catalog': 'Catalog', 'nav.clients': 'Clients', 'nav.contact': 'Contact',
    'nav.cta': 'Get Started',
    // HERO
    'hero.label': 'Your next payment processor',
    'hero.h1': 'We simplify your collections,<br />to accelerate your<br /><em class="grad-text">revenue.</em>',
    'hero.desc': 'We help you choose, configure, and optimize the best payment platforms for your business. Improve conversion, reduce costs, and meet global security standards.',
    'hero.cta1': 'Start collecting', 'hero.cta2': 'See equipment',
    'hero.trust': '400+ businesses already trust us',
    // DASHBOARD
    'dash.title': 'Collection Performance', 'dash.badge': 'This week',
    'dash.bar1': 'Credit Card', 'dash.bar2': 'Debit Card',
    'dash.bar3': 'Contactless', 'dash.bar4': 'QR / Online',
    'badge.approved': 'Payment approved', 'badge.pci': 'PCI DSS Certified',
    // MARQUEE
    'marquee': ['POS Terminals','Virtual Processing','Payment Gateways',
      'Bilingual Support','Chargeback Mitigation','Same-Day Funding',
      'Multiple Banks','Sunmi Equipment','Dejavoo Equipment','High Risk'],
    // ABOUT
    'about.label': 'About Us',
    'about.title': 'The partner your business<br />needed to collect better.',
    'about.desc': "We are a leading payment processing organization, with advanced financial solutions and expert multilingual support to help you compete in today's market.",
    'about.badge': '400+ Active Businesses',
    'about.f1.title': 'Multi-bank connectivity',
    'about.f1.desc': 'Access to sponsor banks to serve diverse sectors, including high-risk businesses.',
    'about.f2.title': 'Comprehensive solutions',
    'about.f2.desc': 'POS programs, competitive pricing, and fast funding: same day or next day.',
    'about.f3.title': 'Chargeback mitigation',
    'about.f3.desc': 'Advanced technology to reduce disputes and protect every transaction in your business.',
    // STATS
    'stats.years': 'Years in business', 'stats.businesses': 'Businesses collecting now',
    'stats.partners': 'Allied providers', 'stats.support': 'Bilingual support',
    // CALCULATOR
    'calc.label': 'Savings calculator',
    'calc.title': 'Discover how much you can<br /><em class="grad-text">save with us.</em>',
    'calc.desc': 'Move the sliders and see the real impact on your business.',
    'calc.sales.label': 'Monthly sales', 'calc.rate.label': 'Your current processing rate',
    'calc.note': 'CatapultaPay rate from <strong>1.89%</strong> · No hidden fees',
    'calc.current.label': 'You currently pay', 'calc.current.sub': 'per month in fees',
    'calc.catapulta.label': 'With CatapultaPay', 'calc.catapulta.sub': 'per month in fees',
    'calc.savings.title': 'Your estimated savings',
    'calc.savings.month': 'per month', 'calc.savings.year': 'per year',
    'calc.cta': 'I want those savings',
    // SOLUTIONS
    'sol.label': 'Solutions',
    'sol.title': 'Everything you need<br />to collect without limits.',
    'sol.tab.physical': 'Physical Equipment', 'sol.tab.virtual': 'Virtual Processing',
    'sol.p1.title': 'Basic registers & terminals',
    'sol.p1.desc': 'Countertop terminals for counter sales and basic retail.',
    'sol.p2.title': 'Self-service kiosks',
    'sol.p2.desc': 'Touchscreen with integrated readers for cafeterias and kiosks.',
    'sol.p3.title': 'Mobile readers',
    'sol.p3.desc': 'Apps and readers for fairs, markets, and field services.',
    'sol.p4.title': 'Smart terminals',
    'sol.p4.desc': 'All-in-one devices with WiFi and mobile connectivity.',
    'sol.p5.title': 'POS points of sale',
    'sol.p5.desc': 'Inventory, customer, and sales management with integrated terminal.',
    'sol.p6.title': 'View full catalog',
    'sol.p6.desc': 'Explore all equipment available for your business.',
    'sol.p6.link': 'Go to catalog',
    'sol.v1.title': 'E-commerce gateways',
    'sol.v1.desc': 'Secure connection between your online store and the payment processor.',
    'sol.v2.title': 'Payment portals',
    'sol.v2.desc': 'Recurring payments, QR codes, and links via email or SMS.',
    'sol.v3.title': 'Virtual terminal',
    'sol.v3.desc': 'Cloud panel to enter payments without hardware.',
    'sol.v4.title': 'Mobile POS apps',
    'sol.v4.desc': 'Process from tablet or smartphone with full POS features.',
    'sol.v5.title': 'PCI DSS security',
    'sol.v5.desc': 'End-to-end encryption and fraud prevention on every transaction.',
    'sol.v6.title': 'Real-time reports',
    'sol.v6.desc': 'Sales, chargebacks, and performance dashboard from any device.',
    // CATALOG
    'cat.label': '2025 Catalog',
    'cat.title': 'Equipment for every<br />type of business.',
    'cat.desc': 'Rent, lease, or buy. All include setup and bilingual support.',
    'cat.badge.popular': 'Most popular', 'cat.badge.advanced': 'Most advanced',
    'cat.badge.large': 'For large businesses', 'cat.badge.self': 'Self-service',
    'cat.badge.dual': 'Dual screen',
    'cat.price.available': 'Purchase · Rent/Lease available',
    'cat.price.approval': 'Purchase · Rent/Lease subject to approval',
    'cat.cta.text': "Can't find what you're looking for? We have more equipment available.",
    'cat.cta.btn1': 'Request advice', 'cat.cta.btn2': 'Download PDF catalog',
    // Catalog specs
    'cat.spec.dj.p1': '5.5" Touch screen · WiFi 2.4/5GHz · 4G · Chip · Swipe · Contactless · Printer',
    'cat.spec.dj.qd2': 'LCD 5.5" Touch · 58mm Printer · WiFi · Contactless · IPOSpays · SPIn',
    'cat.spec.dj.d1': 'For restaurants & retail · Quick setup · High speed',
    'cat.spec.cl.flex': 'WiFi · 4G · Ethernet · Reader + Contactless · Printer · App Market',
    'cat.spec.cl.mini': 'WiFi · Ethernet · Printer · Contactless · App Market · Clover Market',
    'cat.spec.cl.duo': 'WiFi · 4G · Ethernet · Dual 10" screen · Touch · App Market · Printer',
    'cat.spec.su.p2pro': '5.99" HD+ screen · Quad-core · 1D/2D Scanner · 4G · WiFi · GPS · 58mm Printer',
    'cat.spec.su.t2s': '15" + 10" · Android · Camera · WiFi · Bluetooth · Handheld · SUNMI OS 3.0',
    'cat.spec.su.p2mini': '5" HD screen · 4G LTE · Dual WiFi · BT 5.0 · NFC · QR · PCI/EMV · Android 9.0',
    'cat.spec.su.d3pro': '15.6" FHD · Qualcomm · SUNMI OS 4.0 · 4GB RAM · 64GB ROM · Aluminum',
    'cat.spec.px.a920': 'Android 8.1 · 5.5" IPS screen · 4G · WiFi · Bluetooth · 5MP Camera · Printer',
    'cat.spec.px.elyse': 'Android 11 · 14" FHD Touch · Qualcomm Octa-Core 2.0GHz · 4GB RAM · 64GB ROM',
    'cat.spec.px.sistema': 'Modular · PCI DSS · Red Dot Award · Workstation + Tablet + Scanner + Printer',
    'cat.spec.px.e700': '12.5" HD screen · 4G · WiFi · Bluetooth · 3" Printer · PCI 5.x SRED · NFC',
    'cat.spec.px.kiosk': '24" screen · Scanner · Ethernet · Printer · Card reader · Self-checkout',
    'cat.spec.la.m20': 'Android 13 · Quad-core 2.0GHz · 6.5" screen · Designed for one-handed use',
    'cat.spec.la.c20pro': 'Android 13 · Qualcomm Octa-Core · Dual screen · SoftPOS compatible',
    // Catalog feature text replacements
    'cat.feat.sw.basic': 'Basic software:', 'cat.feat.sw.full': 'Full software:',
    'cat.feat.sw': 'Software:', 'cat.feat.inv.with': 'With inventory:',
    'cat.feat.inv.without': 'Without inventory:', 'cat.feat.internet': 'Internet:',
    'cat.feat.internet.opt': 'Optional internet:', 'cat.feat.host': 'Internet/Hosting:',
    'cat.feat.app.client': 'Client app:', 'cat.feat.per.month': '/mo',
    // Sunmi features
    'cat.feat.su.bat': '2580mAh long-lasting battery',
    'cat.feat.su.usb': 'USB Type-C · GPS & A-GPS',
    'cat.feat.su.temp': 'Operation range -10°C to 50°C · 430g',
    'cat.feat.su.chip': 'Chip, swipe, NFC and QR',
    'cat.feat.su.drop': 'Drop-resistant up to 1.2m',
    'cat.feat.su.weight': '200g · 15mm thick',
    'cat.feat.su.perf': '60% better performance',
    'cat.feat.su.modules': 'Optional modules: customer screen, NFC',
    'cat.feat.su.pnp': 'Plug &amp; Play · Customizable with your brand',
    // PAX features
    'cat.feat.px.cam': '5MP AF Camera · BT 5.0',
    'cat.feat.px.fp': 'Fingerprint reader on power button',
    'cat.feat.px.usb': 'USB Type-C · POGO PIN',
    'cat.feat.px.enc': 'Encryption, tokenization & PCI DSS',
    'cat.feat.px.printer': '260mm/s ultra-fast printer',
    'cat.feat.px.scanner': 'Scanner with walkie-talkie function',
    'cat.feat.px.nfc': 'NFC contactless',
    'cat.feat.px.pci': 'PCI 5.x SRED certified',
    'cat.feat.px.hiprinter': 'High-speed printer',
    // Landi features
    'cat.feat.la.cert': 'CE/CB/FCC/IC/RoHS certified',
    'cat.feat.la.sd': 'Supports SD 3.0 card',
    'cat.feat.la.visual': 'Immersive visual experience',
    'cat.feat.la.screen': 'Independent screens for customer & operator',
    // GALLERY
    'gallery.label': 'In action',
    'gallery.title': 'Our equipment<br />operating in the field.',
    'gallery.desc': "Real installations at our clients' businesses.",
    // TESTIMONIALS
    'testi.label': 'Success stories',
    'testi.title': 'Trust you<br />can feel.',
    'testi.q1': '"Implementing their payment system was a total success. Our diners now pay quickly and securely. We increased sales especially on weekends. An excellent investment."',
    'testi.q2': '"The virtual terminal synced perfectly with our system. We now accept contactless payments and transactions are 30% faster."',
    'testi.q3': '"Great savings on fees and total clarity in the numbers. The POS system is reliable, easy to use, and has improved daily collection efficiency."',
    'testi.verified': 'Verified customer',
    // CONTACT
    'contact.label': 'Contact',
    'contact.title': 'Ready to accept<br />payments without complications?',
    'contact.desc': "Secure, fast payment solutions tailored to your business. Contact us and we'll help you choose the best option.",
    'contact.west': 'West Zone', 'contact.east': 'East Zone', 'contact.support': 'Technical Support',
    'form.title': 'Send us a message',
    'form.firstname': 'First Name', 'form.firstname.ph': 'Your first name',
    'form.lastname': 'Last Name', 'form.lastname.ph': 'Your last name',
    'form.email': 'Email address', 'form.email.ph': 'you@company.com',
    'form.phone': 'Phone', 'form.phone.ph': '+1 (555) 000-0000',
    'form.subject': 'How can we help you?',
    'form.opt.default': 'Select an option', 'form.opt.pos': 'Physical POS terminal',
    'form.opt.virtual': 'Virtual processing', 'form.opt.support': 'Technical support',
    'form.opt.general': 'General inquiry',
    'form.message': 'Message', 'form.message.ph': 'Tell us about your business...',
    'form.submit': 'Send message', 'form.sending': 'Sending...',
    // FOOTER
    'footer.desc': 'Payment processing solutions for businesses of all sizes. We connect your company with the best processors.',
    'footer.col1': 'Solutions', 'footer.col2': 'Company',
    'footer.sol.physical': 'Physical POS Equipment', 'footer.sol.virtual': 'Virtual Processing',
    'footer.sol.gateway': 'Payment Gateways', 'footer.sol.catalog': 'Equipment Catalog',
    'footer.about': 'About Us', 'footer.success': 'Success Stories',
    'footer.contact': 'Contact', 'footer.terms': 'Terms & Conditions',
    'footer.download': 'Download Catalog',
    'footer.rights': '© 2025 CATAPULTA PAYMENT SYSTEMS. All rights reserved.',
    'toast.msg': 'Message sent successfully',
    'wa.href': 'https://wa.me/13109486153?text=Hello%2C+I%27m+interested+in+CatapultaPay',
    // TERMINAL SIMULATOR
    'term.label': 'Live terminal',
    'term.title': 'This easy to collect with CatapultaPay',
    'term.desc': 'Enter the amount with the keypad, choose how to collect, and process in seconds.',
    'term.screen.label': 'Enter amount',
    'term.method.title': 'Payment method',
    'term.summary.title': 'Summary',
    'term.summary.amount': 'Amount to charge',
    'term.summary.rate': 'CatapultaPay rate',
    'term.summary.fee': 'Estimated fee',
    'term.summary.net': 'Net you receive',
    'term.btn.process': 'Process payment',
    'term.reader.tag': 'Chip / Swipe / NFC',
    'term.method.chip.name': 'Chip card',
    'term.method.chip.sub': '•••• •••• •••• 4521 · Visa',
    'term.method.chip.label': 'Chip · Visa ••4521',
    'term.method.nfc.name': 'Contactless / NFC',
    'term.method.nfc.sub': 'Apple Pay · Google Pay',
    'term.method.nfc.label': 'NFC · Apple/Google Pay',
    'term.method.swipe.name': 'Magnetic stripe',
    'term.method.swipe.sub': '•••• •••• •••• 8834 · Amex',
    'term.method.swipe.label': 'Swipe · Amex ••8834',
    'term.processing': 'Processing',
    'term.approved': 'APPROVED',
    'term.thanks': 'Thank you for your purchase',
    'term.ticket.date': 'Date', 'term.ticket.time': 'Time',
    'term.ticket.txn': 'TXN', 'term.ticket.method': 'Method',
    'term.ticket.subtotal': 'Subtotal', 'term.ticket.rate': 'Rate (1.89%)',
    'term.ticket.net': 'Net received',
    'term.ticket.approved': 'PAYMENT APPROVED',
    'term.ticket.thanks': 'Thank you for using CatapultaPay',
    'term.ticket.locale': 'en-US',
  }
};

// ══════════════════════════════════════════
// MÓDULO I18N
// ══════════════════════════════════════════
const I18N = {
  currentLang: 'es',

  // Caches para poder restaurar el español original
  _specsCache: null,
  _featuresCache: null,

  /* ── helpers ── */
  _q(sel)    { return document.querySelector(sel); },
  _qa(sel)   { return document.querySelectorAll(sel); },

  _setText(sel, key, t) {
    const el = this._q(sel);
    if (el && t[key] != null) el.textContent = t[key];
  },
  _setHTML(sel, key, t) {
    const el = this._q(sel);
    if (el && t[key] != null) el.innerHTML = t[key];
  },

  // Para labels con .dot hijo
  _setLabel(sel, key, t) {
    const el = this._q(sel);
    if (!el || t[key] == null) return;
    const dot = el.querySelector('.dot');
    el.textContent = t[key];
    if (dot) el.prepend(dot);
  },

  // Para botones que contienen un ícono SVG/lucide
  _setBtn(sel, key, t) {
    const el = typeof sel === 'string' ? this._q(sel) : sel;
    if (!el || t[key] == null) return;
    const icon = el.querySelector('svg') || el.querySelector('i');
    while (el.firstChild) el.removeChild(el.firstChild);
    el.appendChild(document.createTextNode(t[key]));
    if (icon) { el.appendChild(document.createTextNode(' ')); el.appendChild(icon); }
  },

  /* ── Guardar HTML original de specs y features de catálogo ── */
  _cacheIfNeeded() {
    if (!this._specsCache) {
      this._specsCache = [];
      this._qa('.catalog-specs').forEach(el => this._specsCache.push(el.textContent));
    }
    if (!this._featuresCache) {
      this._featuresCache = [];
      this._qa('.catalog-features li').forEach(el => this._featuresCache.push(el.innerHTML));
    }
  },

  /* ── Catálogo: specs y features con reemplazo por posición ── */
  _applyCatalogItems(lang, t) {
    this._cacheIfNeeded();

    // Lista de keys de specs en el MISMO orden que aparecen en el HTML
    const specKeys = [
      'cat.spec.dj.p1', 'cat.spec.dj.qd2', 'cat.spec.dj.d1',       // Dejavoo (3)
      'cat.spec.cl.flex', 'cat.spec.cl.mini', 'cat.spec.cl.duo',     // Clover (3)
      'cat.spec.su.p2pro', 'cat.spec.su.t2s', 'cat.spec.su.p2mini',  // Sunmi (3)
      'cat.spec.su.d3pro',                                             // Sunmi D3 (1)
      'cat.spec.px.a920', 'cat.spec.px.elyse', 'cat.spec.px.sistema', // PAX (3)
      'cat.spec.px.e700', 'cat.spec.px.kiosk',                        // PAX (2)
      'cat.spec.la.m20', 'cat.spec.la.c20pro',                        // Landi (2)
    ];
    this._qa('.catalog-specs').forEach((el, i) => {
      if (specKeys[i] && t[specKeys[i]]) el.textContent = t[specKeys[i]];
      else if (lang === 'es' && this._specsCache[i]) el.textContent = this._specsCache[i];
    });

    // Feature list: reemplazar a partir del original ES cacheado
    const featMap = [
      ['cat.feat.sw.basic', 'Software básico:'],
      ['cat.feat.sw.full',  'Software completo:'],
      ['cat.feat.sw',       'Software:'],
      ['cat.feat.inv.with', 'Con inventario:'],
      ['cat.feat.inv.without', 'Sin inventario:'],
      ['cat.feat.internet.opt', 'Internet opcional:'],
      ['cat.feat.host',     'Internet/Hosting:'],
      ['cat.feat.internet', 'Internet:'],
      ['cat.feat.app.client','App cliente:'],
      ['cat.feat.per.month', '/mes'],
      // Sunmi
      ['cat.feat.su.bat',     'Batería 2580mAh de larga duración'],
      ['cat.feat.su.usb',     'USB Tipo C · GPS y A-GPS'],
      ['cat.feat.su.temp',    'Operación -10°C a 50°C · 430g'],
      ['cat.feat.su.chip',    'Chip, banda, NFC y QR'],
      ['cat.feat.su.drop',    'Resistente a caídas de 1.2m'],
      ['cat.feat.su.weight',  '200g · 15mm de grosor'],
      ['cat.feat.su.perf',    '60% mejor rendimiento'],
      ['cat.feat.su.modules', 'Módulos opcionales: pantalla cliente, NFC'],
      ['cat.feat.su.pnp',     'Plug &amp; Play · Personalizable con tu marca'],
      // PAX
      ['cat.feat.px.cam',     'Cámara 5MP Auto Focus · BT 5.0'],
      ['cat.feat.px.fp',      'Lector de huella en encendido'],
      ['cat.feat.px.usb',     'USB Tipo C · POGO PIN'],
      ['cat.feat.px.enc',     'Cifrado, tokenización y PCI DSS'],
      ['cat.feat.px.printer', 'Impresora 260mm/s ultrarrápida'],
      ['cat.feat.px.scanner', 'Scanner con función walkie-talkie'],
      ['cat.feat.px.nfc',     'NFC sin contacto'],
      ['cat.feat.px.pci',     'PCI 5.x SRED certificado'],
      ['cat.feat.px.hiprinter','Impresora de alta velocidad'],
      // Landi
      ['cat.feat.la.cert',    'Certificado CE/CB/FCC/IC/RoHS'],
      ['cat.feat.la.sd',      'Soporta tarjeta SD 3.0'],
      ['cat.feat.la.visual',  'Experiencia visual inmersiva'],
      ['cat.feat.la.screen',  'Pantalla independiente para cliente y operador'],
    ];

    this._qa('.catalog-features li').forEach((el, i) => {
      // Restaurar siempre desde el caché ES
      let html = this._featuresCache[i] || el.innerHTML;
      if (lang !== 'es') {
        // Aplicar todos los reemplazos de texto
        featMap.forEach(([key, esText]) => {
          if (t[key] && html.includes(esText)) {
            html = html.split(esText).join(t[key]);
          }
        });
      }
      el.innerHTML = html;
    });
  },

  /* ── Función principal de aplicación ── */
  apply(lang) {
    if (!TRANSLATIONS[lang]) return;
    this.currentLang = lang;
    const t = TRANSLATIONS[lang];

    // Atributo lang en <html> (semántico + sirve para CSS)
    document.documentElement.setAttribute('lang', lang);
    localStorage.setItem('cpay-lang', lang);

    // Título de página
    if (t['page.title']) document.title = t['page.title'];

    this._applyNav(t);
    this._applyHero(t);
    this._applyDashboard(t);
    this._applyMarquee(t);
    this._applyAbout(t);
    this._applyStats(t);
    this._applyTerminal(t);
    this._applyCalculator(t);
    this._applySolutions(t);
    this._applyCatalogHeader(t);
    this._applyCatalogItems(lang, t);
    this._applyGallery(t);
    this._applyTestimonials(t);
    this._applyContact(t);
    this._applyFooter(t);
    this._applyMisc(t);

    // Estado activo del botón de idioma
    this._qa('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
  },

  _applyNav(t) {
    const navLinks    = this._qa('#nav .nlinks .nav-link');
    const mobileLinks = this._qa('#nav .mobile-menu .mobile-link');
    const keys = ['nav.home','nav.about','nav.solutions','nav.catalog','nav.clients','nav.contact'];
    navLinks.forEach((el, i)    => { if (keys[i]) el.textContent = t[keys[i]]; });
    mobileLinks.forEach((el, i) => { if (keys[i]) el.textContent = t[keys[i]]; });
    this._qa('.ncta, .mobile-cta').forEach(el => this._setBtn(el, 'nav.cta', t));
  },

  _applyHero(t) {
    this._setLabel('#hero .section-label', 'hero.label', t);
    this._setHTML('#hero h1', 'hero.h1', t);
    this._setText('.hero-desc', 'hero.desc', t);
    this._setBtn('#hero .hero-actions .btn-primary', 'hero.cta1', t);
    this._setText('#hero .btn-ghost', 'hero.cta2', t);
    this._setText('.trust-text', 'hero.trust', t);
  },

  _applyDashboard(t) {
    this._setText('.dash-title', 'dash.title', t);
    this._setText('.dash-badge', 'dash.badge', t);
    const bars = this._qa('.bar-label');
    ['dash.bar1','dash.bar2','dash.bar3','dash.bar4'].forEach((k,i) => {
      if (bars[i] && t[k]) bars[i].textContent = t[k];
    });
    // Badge aprobado (tiene <strong> con el monto)
    const approvedSpan = this._q('.badge-approved span');
    if (approvedSpan && t['badge.approved']) {
      const strong = approvedSpan.querySelector('strong');
      approvedSpan.textContent = t['badge.approved'] + ' ';
      if (strong) approvedSpan.appendChild(strong);
    }
    this._setText('.badge-pci span', 'badge.pci', t);
  },

  _applyMarquee(t) {
    if (!t['marquee']) return;
    const items = this._qa('.marquee-track span:not(.dot-sep)');
    items.forEach((el, i) => { el.textContent = t['marquee'][i % t['marquee'].length]; });
  },

  _applyAbout(t) {
    this._setText('#about .section-label', 'about.label', t);
    this._setHTML('#about .section-title', 'about.title', t);
    this._setText('.about-desc', 'about.desc', t);
    this._setText('.about-badge span', 'about.badge', t);
    const fTitles = this._qa('.feature-text h3');
    const fDescs  = this._qa('.feature-text p');
    [['about.f1.title','about.f1.desc'],['about.f2.title','about.f2.desc'],['about.f3.title','about.f3.desc']].forEach(([tk,dk],i) => {
      if (fTitles[i] && t[tk]) fTitles[i].textContent = t[tk];
      if (fDescs[i]  && t[dk]) fDescs[i].textContent  = t[dk];
    });
  },

  _applyStats(t) {
    const labels = this._qa('.stat-label');
    ['stats.years','stats.businesses','stats.partners','stats.support'].forEach((k,i) => {
      if (labels[i] && t[k]) labels[i].textContent = t[k];
    });
  },

  _applyTerminal(t) {
    // Encabezado de sección
    const label = this._q('#termLabel');
    if (label && t['term.label']) {
      const dot = label.querySelector('.dot');
      label.textContent = t['term.label'];
      if (dot) label.prepend(dot);
    }
    this._setText('#termTitle', 'term.title', t);
    this._setText('#termDesc',  'term.desc',  t);

    // Títulos de paneles
    const panelTitles = this._qa('.panel-section-title');
    if (panelTitles[0] && t['term.method.title']) panelTitles[0].textContent = t['term.method.title'];
    if (panelTitles[1] && t['term.summary.title']) panelTitles[1].textContent = t['term.summary.title'];

    // Etiquetas del resumen
    const sumKeys = this._qa('.summary-key');
    ['term.summary.amount','term.summary.rate','term.summary.fee','term.summary.net'].forEach((k,i) => {
      if (sumKeys[i] && t[k]) sumKeys[i].textContent = t[k];
    });

    // Reader tag
    this._setText('.reader-tag', 'term.reader.tag', t);

    // Botón procesar
    const chargeBtn = this._q('#chargeBtn');
    if (chargeBtn && t['term.btn.process']) {
      const icon = chargeBtn.querySelector('i') || chargeBtn.querySelector('svg');
      chargeBtn.textContent = '';
      if (icon) chargeBtn.appendChild(icon);
      chargeBtn.appendChild(document.createTextNode(' ' + t['term.btn.process']));
    }

    // Tarjetas de método
    [
      { sel:'[data-method="chip"]',  nk:'term.method.chip.name',  sk:'term.method.chip.sub',  lk:'term.method.chip.label'  },
      { sel:'[data-method="nfc"]',   nk:'term.method.nfc.name',   sk:'term.method.nfc.sub',   lk:'term.method.nfc.label'   },
      { sel:'[data-method="swipe"]', nk:'term.method.swipe.name', sk:'term.method.swipe.sub', lk:'term.method.swipe.label' },
    ].forEach(({ sel, nk, sk, lk }) => {
      const card = this._q(sel);
      if (!card) return;
      const nameEl = card.querySelector('.mcard-name');
      const subEl  = card.querySelector('.mcard-sub');
      if (nameEl && t[nk]) nameEl.textContent = t[nk];
      if (subEl  && t[sk]) subEl.textContent  = t[sk];
      if (t[lk]) card.dataset.label = t[lk];
    });

    // Actualizar objeto TERM global (strings dinámicos)
    if (window.TERM) {
      const map = {
        screenLabel:'term.screen.label', processing:'term.processing',
        approved:'term.approved', thanks:'term.thanks',
        chipLabel:'term.method.chip.label', nfcLabel:'term.method.nfc.label',
        swipeLabel:'term.method.swipe.label',
        ticketDate:'term.ticket.date', ticketTime:'term.ticket.time',
        ticketTxn:'term.ticket.txn', ticketMethod:'term.ticket.method',
        ticketSubtotal:'term.ticket.subtotal', ticketRate:'term.ticket.rate',
        ticketNet:'term.ticket.net', ticketApproved:'term.ticket.approved',
        ticketThanks:'term.ticket.thanks', ticketLocale:'term.ticket.locale',
      };
      Object.entries(map).forEach(([prop, key]) => {
        if (t[key]) window.TERM[prop] = t[key];
      });

      // Si el método activo cambió de idioma, actualizar la pantalla
      if (window.activeMethod) {
        const methodLabels = {
          chip:  t['term.method.chip.label'],
          nfc:   t['term.method.nfc.label'],
          swipe: t['term.method.swipe.label'],
        };
        const newLabel = methodLabels[window.activeMethod.method];
        if (newLabel) {
          window.activeMethod.label = newLabel;
          const screenMethodTxt = document.getElementById('screenMethodTxt');
          if (screenMethodTxt) screenMethodTxt.textContent = newLabel;
        }
      }
    }

    // Etiqueta de pantalla si está en reposo
    const screenLabelEl = this._q('.screen-entry-label');
    if (screenLabelEl && t['term.screen.label']) screenLabelEl.textContent = t['term.screen.label'];
  },

  _applyCalculator(t) {
    this._setLabel('#calculator .section-label', 'calc.label', t);
    this._setHTML('#calculator .section-title', 'calc.title', t);
    this._setText('#calculator .section-desc', 'calc.desc', t);
    this._setText('label[for="sliderSales"]', 'calc.sales.label', t);
    this._setText('label[for="sliderRate"]',  'calc.rate.label',  t);
    const noteSpan = this._q('.calc-note span');
    if (noteSpan && t['calc.note']) noteSpan.innerHTML = t['calc.note'];
    const rLabels = this._qa('.calc-result-label');
    const rSubs   = this._qa('.calc-result-sub');
    if (rLabels[0]) rLabels[0].textContent = t['calc.current.label']    || rLabels[0].textContent;
    if (rLabels[1]) rLabels[1].textContent = t['calc.catapulta.label']  || rLabels[1].textContent;
    if (rSubs[0])   rSubs[0].textContent   = t['calc.current.sub']      || rSubs[0].textContent;
    if (rSubs[1])   rSubs[1].textContent   = t['calc.catapulta.sub']    || rSubs[1].textContent;
    this._setText('.calc-savings-top span', 'calc.savings.title', t);
    const periods = this._qa('.calc-savings-period');
    if (periods[0]) periods[0].textContent = t['calc.savings.month'] || periods[0].textContent;
    if (periods[1]) periods[1].textContent = t['calc.savings.year']  || periods[1].textContent;
    this._setBtn('.calc-cta-btn', 'calc.cta', t);
  },

  _applySolutions(t) {
    this._setText('#solutions .section-label', 'sol.label', t);
    this._setHTML('#solutions .section-title',  'sol.title', t);
    this._setBtn('#tabPhysical', 'sol.tab.physical', t);
    this._setBtn('#tabVirtual',  'sol.tab.virtual',  t);

    const physData = [
      ['sol.p1.title','sol.p1.desc'],['sol.p2.title','sol.p2.desc'],
      ['sol.p3.title','sol.p3.desc'],['sol.p4.title','sol.p4.desc'],
      ['sol.p5.title','sol.p5.desc'],['sol.p6.title','sol.p6.desc'],
    ];
    this._qa('#panelPhysical .sol-card').forEach((card, i) => {
      const [tk,dk] = physData[i] || [];
      const h3 = card.querySelector('h3'); if (h3 && t[tk]) h3.textContent = t[tk];
      const p  = card.querySelector('p');  if (p  && t[dk]) p.textContent  = t[dk];
    });
    // Link del último card de físico
    const solLink = this._q('#panelPhysical .sol-link');
    if (solLink && t['sol.p6.link']) {
      const icon = solLink.querySelector('svg') || solLink.querySelector('i');
      solLink.textContent = t['sol.p6.link'] + ' ';
      if (icon) solLink.appendChild(icon);
    }
    const virtData = [
      ['sol.v1.title','sol.v1.desc'],['sol.v2.title','sol.v2.desc'],
      ['sol.v3.title','sol.v3.desc'],['sol.v4.title','sol.v4.desc'],
      ['sol.v5.title','sol.v5.desc'],['sol.v6.title','sol.v6.desc'],
    ];
    this._qa('#panelVirtual .sol-card').forEach((card, i) => {
      const [tk,dk] = virtData[i] || [];
      const h3 = card.querySelector('h3'); if (h3 && t[tk]) h3.textContent = t[tk];
      const p  = card.querySelector('p');  if (p  && t[dk]) p.textContent  = t[dk];
    });
  },

  _applyCatalogHeader(t) {
    this._setLabel('#catalogo .section-label', 'cat.label', t);
    this._setHTML('#catalogo .section-title', 'cat.title', t);
    this._setText('#catalogo .section-desc', 'cat.desc', t);
    // Badges
    const gold = this._q('.badge-gold');
    if (gold && t['cat.badge.popular']) gold.textContent = t['cat.badge.popular'];
    // badge-teal en orden del DOM: Clover Duo, Sunmi T2S, PAX Kiosk, Landi C20
    const tealKeys = ['cat.badge.large','cat.badge.advanced','cat.badge.self','cat.badge.dual'];
    this._qa('.badge-teal').forEach((el, i) => {
      if (tealKeys[i] && t[tealKeys[i]]) el.textContent = t[tealKeys[i]];
    });
    // Price notes
    this._qa('.price-note').forEach(el => {
      const txt = el.textContent.trim();
      if (txt.includes('aprobación') || txt.includes('approval')) {
        el.textContent = t['cat.price.approval'] || el.textContent;
      } else if (txt.includes('disponible') || txt.includes('available')) {
        el.textContent = t['cat.price.available'] || el.textContent;
      }
    });
    // CTA
    this._setText('.catalog-cta > p', 'cat.cta.text', t);
    this._setBtn('.catalog-cta .btn-primary', 'cat.cta.btn1', t);
    // Download button (ícono + texto)
    const dlBtn = this._q('.catalog-cta .btn-ghost');
    if (dlBtn && t['cat.cta.btn2']) {
      const icon = dlBtn.querySelector('svg') || dlBtn.querySelector('i');
      dlBtn.textContent = '';
      if (icon) { dlBtn.appendChild(icon); dlBtn.appendChild(document.createTextNode(' ')); }
      dlBtn.appendChild(document.createTextNode(t['cat.cta.btn2']));
    }
  },

  _applyGallery(t) {
    this._setLabel('#gallery .section-label', 'gallery.label', t);
    this._setHTML('#gallery .section-title',   'gallery.title', t);
    this._setText('#gallery .section-desc',    'gallery.desc',  t);
  },

  _applyTestimonials(t) {
    this._setText('#testimonials .section-label', 'testi.label', t);
    this._setHTML('#testimonials .section-title', 'testi.title', t);
    const quotes = this._qa('.testi-quote');
    ['testi.q1','testi.q2','testi.q3'].forEach((k,i) => {
      if (quotes[i] && t[k]) quotes[i].textContent = t[k];
    });
    this._qa('.testi-role').forEach(el => { if (t['testi.verified']) el.textContent = t['testi.verified']; });
  },

  _applyContact(t) {
    this._setText('#contact .section-label', 'contact.label', t);
    this._setHTML('#contact .section-title',  'contact.title', t);
    this._setText('.contact-desc',            'contact.desc',  t);
    const strongs = this._qa('.contact-card strong');
    ['contact.west','contact.east','contact.support'].forEach((k,i) => {
      if (strongs[i] && t[k]) strongs[i].textContent = t[k];
    });
    // Formulario
    this._setText('.form-title', 'form.title', t);
    this._setText('label[for="firstName"]', 'form.firstname', t);
    this._setText('label[for="lastName"]',  'form.lastname',  t);
    this._setText('label[for="email"]',     'form.email',     t);
    this._setText('label[for="phone"]',     'form.phone',     t);
    this._setText('label[for="subject"]',   'form.subject',   t);
    this._setText('label[for="message"]',   'form.message',   t);
    // Placeholders
    [['firstName','form.firstname.ph'],['lastName','form.lastname.ph'],
     ['email','form.email.ph'],['phone','form.phone.ph'],['message','form.message.ph']
    ].forEach(([id, key]) => {
      const el = document.getElementById(id);
      if (el && t[key]) el.placeholder = t[key];
    });
    // Select options
    const sel = document.getElementById('subject');
    if (sel) {
      const optKeys = ['form.opt.default','form.opt.pos','form.opt.virtual','form.opt.support','form.opt.general'];
      Array.from(sel.options).forEach((opt, i) => { if (optKeys[i] && t[optKeys[i]]) opt.textContent = t[optKeys[i]]; });
    }
    this._setBtn('#contactForm button[type="submit"]', 'form.submit', t);
  },

  _applyFooter(t) {
    this._setText('.footer-desc', 'footer.desc', t);
    const colTitles = this._qa('.footer-col-title');
    if (colTitles[0] && t['footer.col1']) colTitles[0].textContent = t['footer.col1'];
    if (colTitles[1] && t['footer.col2']) colTitles[1].textContent = t['footer.col2'];
    const cols = this._qa('.footer-col ul');
    const col1Keys = ['footer.sol.physical','footer.sol.virtual','footer.sol.gateway','footer.sol.catalog'];
    const col2Keys = ['footer.about','footer.success','footer.contact','footer.terms','footer.download'];
    if (cols[0]) cols[0].querySelectorAll('a').forEach((a,i) => { if (col1Keys[i] && t[col1Keys[i]]) a.textContent = t[col1Keys[i]]; });
    if (cols[1]) cols[1].querySelectorAll('a').forEach((a,i) => { if (col2Keys[i] && t[col2Keys[i]]) a.textContent = t[col2Keys[i]]; });
    const rights = this._q('.footer-bottom p');
    if (rights && t['footer.rights']) rights.textContent = t['footer.rights'];
  },

  _applyMisc(t) {
    // Toast
    const toastSpan = this._q('.toast span');
    if (toastSpan && t['toast.msg']) toastSpan.textContent = t['toast.msg'];
    // WhatsApp href
    const wa = this._q('.whatsapp-float');
    if (wa && t['wa.href']) wa.href = t['wa.href'];
  },

  /* ── Inicialización ── */
  init() {
    const saved = localStorage.getItem('cpay-lang') || 'es';
    this.apply(saved);

    // Sincronizar TODOS los lang-toggles (desktop + móvil)
    document.querySelectorAll('.lang-toggle').forEach(toggle => {
      toggle.addEventListener('click', e => {
        const btn = e.target.closest('.lang-btn');
        if (btn && btn.dataset.lang !== this.currentLang) {
          this.apply(btn.dataset.lang);
        }
      });
    });
  }
};

document.addEventListener('DOMContentLoaded', () => I18N.init());