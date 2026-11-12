const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {protectTranslations,pages}=require('../tools/protect-translations.cjs');
test('translation protection is idempotent and preserves scripts, JSON-LD, styles and comments',()=>{
  const untouched='<script>const sample="<p>text</p>";</script><style>.p:after{content:"<p>"}</style><!-- <p> -->';
  const html='<html lang="es"><head><meta charset="UTF-8" /></head><body><h1>Texto</h1>'+untouched+'</body></html>';
  const output=protectTranslations(html);
  assert.equal(protectTranslations(output),output);assert.ok(output.includes(untouched));
  assert.match(output,/<h1 translate="no">Texto<\/h1>/);
  assert.match(output,/<html lang="es" translate="no">/);
});
test('all public HTML screens protect individual copy elements before JavaScript loads',()=>{
  for(const file of pages){
    const html=fs.readFileSync(path.resolve(__dirname,'..',file),'utf8');
    assert.equal(protectTranslations(html),html,file);
    assert.match(html,/<h1\b[^>]*translate="no"/,file);
    assert.match(html,/<meta name="google" content="notranslate"/,file);
  }
});
