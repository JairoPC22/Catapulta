// Real PHP worker + local SMTP/TLS fixture. Never connects to IONOS or sends live mail.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const net = require('node:net');
const tls = require('node:tls');
const {spawn, spawnSync} = require('node:child_process');
const php = process.env.PHP_BINARY || 'php';
const openssl = process.env.OPENSSL_BINARY || 'openssl';
const available = spawnSync(php,['-v']).status === 0 && spawnSync(openssl,['version']).status === 0;

test('production worker delivers distinct admin and customer messages through SMTP', {skip:!available && 'Requires PHP and OpenSSL',timeout:60000}, async t => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(),'catapulta-smtp-test-'));
  const certPath = path.join(temp,'cert.pem'), keyPath = path.join(temp,'key.pem');
  const generated = spawnSync(openssl,['req','-x509','-newkey','rsa:2048','-sha256','-nodes','-days','1','-subj','/CN=127.0.0.1','-addext','subjectAltName=IP:127.0.0.1','-keyout',keyPath,'-out',certPath],{encoding:'utf8'});
  assert.equal(generated.status,0,generated.stderr);
  const secure = {cert:fs.readFileSync(certPath),key:fs.readFileSync(keyPath)};
  const context = tls.createSecureContext(secure);
  t.after(()=>{if(path.dirname(temp)===os.tmpdir() && path.basename(temp).startsWith('catapulta-smtp-test-')) fs.rmSync(temp,{recursive:true,force:true});});
  const flags = process.env.PHP_EXT_DIR ? ['-n','-d',`extension_dir="${process.env.PHP_EXT_DIR}"`,'-d','extension=pdo_sqlite','-d','extension=openssl'] : [];

  for(const scenario of [
    {name:'STARTTLS: admin and receipt are both accepted',mode:'tls',reject:0},
    {name:'TLS direct: admin and receipt are both accepted',mode:'ssl',reject:0},
    {name:'temporary client rejection retries only the receipt',mode:'tls',reject:450},
    {name:'permanent client rejection stays visible for review',mode:'tls',reject:550}
  ]) await t.test(scenario.name,async()=>{
    const messages=[], sockets=new Set(); let rejected=false, clientAttempts=0;
    function connection(socket,greet=true){
      sockets.add(socket); socket.on('close',()=>sockets.delete(socket)); socket.on('error',()=>{});
      if(greet)socket.write('220 local SMTP test\r\n');
      let buffer='', auth='', data=false, lines=[], recipient='';
      socket.on('data',chunk=>{
        buffer+=chunk.toString(); let offset;
        while((offset=buffer.indexOf('\r\n'))>=0){
          const line=buffer.slice(0,offset);buffer=buffer.slice(offset+2);
          if(data){
            if(line==='.') {messages.push({recipient,body:lines.join('\r\n')});data=false;socket.write('250 accepted\r\n');}
            else lines.push(line.startsWith('..')?line.slice(1):line);
            continue;
          }
          if(auth==='user'){auth='pass';socket.write('334 UGFzc3dvcmQ6\r\n');continue;}
          if(auth==='pass'){auth='';socket.write('235 authenticated\r\n');continue;}
          if(line.startsWith('EHLO'))socket.write(socket.encrypted?'250 local test\r\n':'250-local test\r\n250 STARTTLS\r\n');
          else if(line==='STARTTLS'){
            socket.write('220 Ready for TLS\r\n');socket.removeAllListeners('data');
            connection(new tls.TLSSocket(socket,{isServer:true,secureContext:context}),false);return;
          }
          else if(line==='AUTH LOGIN'){
            if(!socket.encrypted){socket.write('530 TLS required\r\n');continue;}
            auth='user';socket.write('334 VXNlcm5hbWU6\r\n');
          }
          else if(line.startsWith('MAIL FROM:'))socket.write('250 sender accepted\r\n');
          else if(line.startsWith('RCPT TO:')){
            recipient=line.slice(9).replace(/[<>]/g,'');
            if(recipient==='customer@example.invalid'){
              clientAttempts++;
              if(scenario.reject && (!rejected || scenario.reject===550)){rejected=true;socket.write(`${scenario.reject} recipient rejected\r\n`);continue;}
            }
            socket.write('250 recipient accepted\r\n');
          }
          else if(line==='DATA'){data=true;lines=[];socket.write('354 Send message\r\n');}
          else if(line==='QUIT'){socket.end('221 bye\r\n');}
          else socket.write('500 unexpected command\r\n');
        }
      });
    }
    const server=scenario.mode==='ssl'?tls.createServer(secure,s=>connection(s)):net.createServer(s=>connection(s));
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
    const port=server.address().port;
    try {
      const fixture=path.join(temp,'run.php');
      const worker=path.resolve(__dirname,'../mail/worker.php').replaceAll('\\','/').replaceAll("'","\\'");
      fs.writeFileSync(fixture,`<?php
require '${worker}';
$db=new PDO('sqlite::memory:',null,null,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);cp_schema($db);
$config=['smtp_host'=>'127.0.0.1','smtp_port'=>${port},'smtp_secure'=>'${scenario.mode}','smtp_user'=>'test@example.invalid','smtp_pass'=>'test-only','from_email'=>'sender@example.invalid','from_name'=>'CatapultaPayment','admin_recipients'=>['admin@example.invalid']];
$data=cp_validate(['firstName'=>'Ana','lastName'=>'Prueba','email'=>'customer@example.invalid','subject'=>'general','message'=>'Private customer message for administrator only']);
cp_enqueue($db,$data,'127.0.0.1','test-secret',10000);
$mailer=new SmtpMailer($config);cp_process($db,$config,$mailer,10000);cp_process($db,$config,$mailer,10060);cp_process($db,$config,$mailer,11000);
echo json_encode($db->query('SELECT admin,receipt,receipt_attempts,receipt_error FROM jobs')->fetch(PDO::FETCH_ASSOC));`);
      const child=spawn(php,[...flags,'-d',`openssl.cafile="${certPath}"`,fixture],{stdio:['ignore','pipe','pipe']});
      const result=await new Promise((resolve,reject)=>{
        let stdout='',stderr='';const timeout=setTimeout(()=>{child.kill();reject(Error('SMTP integration timed out: '+stderr));},25000);
        child.stdout.on('data',s=>stdout+=s);child.stderr.on('data',s=>stderr+=s);
        child.once('error',e=>{clearTimeout(timeout);reject(e);});
        child.once('exit',code=>{clearTimeout(timeout);resolve({code,stdout,stderr});});
      });
      assert.equal(result.code,0,result.stderr+result.stdout);
      const state=JSON.parse(result.stdout);
      assert.equal(state.admin,'sent');
      assert.equal(messages.filter(m=>m.recipient==='admin@example.invalid').length,1);
      const receipt=messages.find(m=>m.recipient==='customer@example.invalid');
      if(scenario.reject===550){assert.equal(state.receipt,'review');assert.equal(receipt,undefined);assert.equal(clientAttempts,1);}
      else {
        assert.equal(state.receipt,'sent',result.stderr);assert.ok(receipt);
        assert.equal(clientAttempts,scenario.reject===450?2:1);
        assert.match(receipt.body,/To: customer@example\.invalid/);
        assert.match(receipt.body,/Content-ID: <catapulta-logo@catapultapay\.com>/);
        assert.doesNotMatch(receipt.body,/Private customer message for administrator only/);
        assert.notEqual(receipt.body,messages[0].body);
      }
    } finally {for(const socket of sockets)socket.destroy();await new Promise(resolve=>server.close(resolve));}
  });
});
