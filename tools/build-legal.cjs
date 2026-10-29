// Source of truth: content/legal-content.json. Run: node tools/build-legal.cjs
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const pages = JSON.parse(fs.readFileSync(path.join(root, 'content/legal-content.json'), 'utf8'));
const escape = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
for (const [slug, page] of Object.entries(pages)) {
  const sections = language => page.sections.map(section => `<section><h2>${escape(section[language][0])}</h2><p>${escape(section[language][1])}</p></section>`).join('\n');
  const html = `<!DOCTYPE html>
<html lang="es" data-theme="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex, follow" />
  <meta name="description" content="${escape(page.intro.es)}" />
  <title>${escape(page.title.es)} | CatapultaPayment</title>
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="stylesheet" href="/styles.css?v=29" />
  <link rel="stylesheet" href="/design.css?v=29" />
  <link rel="stylesheet" href="/legal.css?v=29" />
  <script src="/runtime.js?v=29" defer></script>
  <script src="/legal.js?v=29" defer></script>
</head>
<body class="legal-page" data-title-es="${escape(page.title.es)}" data-title-en="${escape(page.title.en)}">
  <header class="legal-header">
    <a href="/" aria-label="CatapultaPayment, inicio"><img src="/imagecata.png" width="108" height="58" alt="CatapultaPayment" /></a>
    <div class="lang-toggle" role="group" aria-label="Idioma / Language"><button class="lang-btn active" data-lang="es" aria-pressed="true">ES</button><button class="lang-btn" data-lang="en" aria-pressed="false">EN</button></div>
  </header>
  <main class="legal-main">
    <div class="legal-review" role="note"><span data-language="es">Documento para revisión. Falta confirmar la identidad legal completa, el domicilio del responsable y la política interna de conservación antes de su publicación definitiva.</span><span data-language="en" hidden>Document for review. Full legal identity, controller address and the internal retention policy must be confirmed before final publication.</span></div>
    <p class="legal-date"><span data-language="es">Revisión: 27 de octubre de 2026</span><span data-language="en" hidden>Revised: October 27, 2026</span></p>
    <article data-language="es"><h1>${escape(page.title.es)}</h1><p class="legal-intro">${escape(page.intro.es)}</p>${sections('es')}</article>
    <article data-language="en" hidden><h1>${escape(page.title.en)}</h1><p class="legal-intro">${escape(page.intro.en)}</p>${sections('en')}</article>
    ${slug === 'cookies' ? '<button id="clearPreferences" class="btn-outline" type="button"><span data-language="es">Borrar preferencias de este sitio</span><span data-language="en" hidden>Clear this site’s preferences</span></button><p id="preferenceStatus" role="status" class="legal-status"></p>' : ''}
    <a class="legal-home" href="/"><span data-language="es">← Volver al inicio</span><span data-language="en" hidden>← Back to home</span></a>
  </main>
  <footer class="legal-footer"><span>CatapultaPayment · CATAPULTA PAYMENT SYSTEMS</span><div><a href="/privacy.html">Privacidad / Privacy</a><a href="/terms.html">Términos / Terms</a><a href="/cookies.html">Cookies</a></div></footer>
</body>
</html>
`;
  fs.writeFileSync(path.join(root, `${slug}.html`), html);
}
console.log('Generated privacy.html, terms.html and cookies.html.');
