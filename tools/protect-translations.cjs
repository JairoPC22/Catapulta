// Native ES/EN copy is already localized. Safari recommends protecting
// individual text elements, rather than relying only on the root container.
const fs = require('node:fs');
const path = require('node:path');
const pages = ['index.html','en/index.html','catalogo.html','privacy.html','terms.html','cookies.html','404.html','error.html','offline.html'];
function protectTranslations(html) {
  html = html.replace(/<html\b[^>]*>/i, tag => {
    if (!/\btranslate=/.test(tag)) tag = tag.replace(/>$/, ' translate="no">');
    return tag;
  });
  if (!/<meta\b[^>]*name="google"[^>]*content="notranslate"/i.test(html)) {
    html = html.replace(/(<meta charset="UTF-8"\s*\/>)/i, '$1\n  <meta name="google" content="notranslate" />');
  }
  // Preserve scripts, JSON-LD, comments and styles verbatim.
  return html.replace(/<!--[\s\S]*?-->|<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>|<(?:h[1-6]|p|a|span|button|label|option|li|dt|dd|summary|figcaption|address|td|th)\b[^>]*>/gi,
    tag => /^<(?:!--|script\b|style\b)/i.test(tag) || /\btranslate=/.test(tag) ? tag : tag.replace(/>$/, ' translate="no">'));
}
module.exports = {protectTranslations, pages};
if (require.main === module) {
  for (const file of pages) {
    const target = path.resolve(__dirname, '..', file);
    fs.writeFileSync(target, protectTranslations(fs.readFileSync(target, 'utf8')));
  }
  console.log('Native language copy protected at text-element level.');
}
