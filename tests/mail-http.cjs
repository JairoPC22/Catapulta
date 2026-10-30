const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const net = require('node:net');
const {spawn, spawnSync} = require('node:child_process');

const php = process.env.PHP_BINARY || 'php';
const available = spawnSync(php, ['-v'], {encoding:'utf8'}).status === 0;
test('PHP HTTP endpoint: validation, limits, durable acceptance and duplicates', {skip: !available && 'PHP runtime not available'}, async t => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'catapulta-mail-test-'));
  const web = path.join(tempRoot,'public'), mail = path.join(web,'mail'), privateDir = path.join(tempRoot,'private');
  fs.mkdirSync(mail,{recursive:true}); fs.mkdirSync(privateDir);
  for (const file of ['send.php','contact-store.php','worker.php']) fs.copyFileSync(path.join(__dirname,'../mail',file),path.join(mail,file));
  const quote = s => "'"+s.replaceAll('\\','\\\\').replaceAll("'","\\'")+"'";
  fs.writeFileSync(path.join(mail,'config.php'), `<?php return ['storage_dir'=>${quote(privateDir)},'storage_secret'=>'unit-test-secret-with-at-least-32-characters','admin_recipients'=>['admin@example.invalid'],'from_email'=>'sender@example.invalid','allowed_origins'=>['https://catapultapay.com']];`);
  const reserve = net.createServer(); await new Promise(resolve=>reserve.listen(0,'127.0.0.1',resolve));
  const port=reserve.address().port; await new Promise(resolve=>reserve.close(resolve));
  const flags=process.env.PHP_EXT_DIR ? ['-n','-d',`extension_dir="${process.env.PHP_EXT_DIR}"`,'-d','extension=pdo_sqlite'] : [];
  const child=spawn(php,[...flags,'-S',`127.0.0.1:${port}`,'-t',web],{stdio:['ignore','ignore','pipe']});
  t.after(async()=>{
    child.kill(); await new Promise(resolve=>child.exitCode!==null ? resolve() : child.once('exit',resolve));
    // Only delete this test's verified temporary fixture directory.
    if (path.dirname(tempRoot)===os.tmpdir() && path.basename(tempRoot).startsWith('catapulta-mail-test-')) fs.rmSync(tempRoot,{recursive:true,force:true});
  });
  await new Promise((resolve,reject)=>{ child.once('error',reject); child.stderr.on('data',chunk=>{if(chunk.toString().includes('Development Server'))resolve();}); child.once('exit',code=>reject(Error('PHP server exited '+code))); });
  const url=`http://127.0.0.1:${port}/mail/send.php`;
  const payload={firstName:'Ana',lastName:'Prueba',email:'ana@example.invalid',subject:'general',message:'Consulta',honeypot:''};
  const send=(body,headers={})=>fetch(url,{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)});
  await t.test('GET rejected',async()=>assert.equal((await fetch(url)).status,405));
  await t.test('wrong content type rejected',async()=>assert.equal((await send(payload,{'Content-Type':'text/plain'})).status,415));
  await t.test('oversized request rejected',async()=>assert.equal((await send({...payload,message:'x'.repeat(33000)})).status,413));
  await t.test('invalid types rejected',async()=>assert.equal((await send({...payload,firstName:[]})).status,400));
  await t.test('foreign origin rejected',async()=>assert.equal((await send(payload,{Origin:'https://other.example'})).status,403));
  await t.test('honeypot returns generic receipt',async()=>assert.equal((await send({...payload,honeypot:'bot'})).status,202));
  await t.test('valid request durably accepted',async()=>{const r=await send(payload,{Origin:'https://catapultapay.com'});assert.equal(r.status,202);assert.deepEqual(await r.json(),{ok:true});assert.equal(r.headers.get('cache-control'),'no-store');});
  await t.test('duplicate returns receipt without another job',async()=>{
    assert.equal((await send(payload)).status,202);
    const r=spawnSync(php,[...flags,'-r', '$db=new PDO("sqlite:".$argv[1]); echo $db->query("SELECT COUNT(*) FROM jobs")->fetchColumn();',path.join(privateDir,'contact.sqlite')],{encoding:'utf8'});
    assert.equal(r.status,0,r.stderr); assert.equal(r.stdout,'1');
  });
  await t.test('email limit returns 429',async()=>{
    await send({...payload,message:'second'});await send({...payload,message:'third'});
    const r=await send({...payload,message:'fourth'}); assert.equal(r.status,429);assert.equal(r.headers.get('retry-after'),'900');
  });
  await t.test('worker cannot run through HTTP',async()=>assert.equal((await fetch(`http://127.0.0.1:${port}/mail/worker.php`)).status,404));
});
