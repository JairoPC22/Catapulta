<?php
declare(strict_types=1);
require __DIR__.'/../mail/worker.php';
$tests=0;
function check(bool $condition,string $message): void { global $tests; if (!$condition) throw new RuntimeException($message); $tests++; echo "PASS $message\n"; }
function rejects(callable $fn,string $type): bool { try { $fn(); return false; } catch (Throwable $e) { return $e instanceof $type; } }
function database(): PDO {
    $db=new PDO('sqlite::memory:',null,null,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
    cp_schema($db); return $db;
}
$data=['firstName'=>'Ana','lastName'=>'Prueba','email'=>'ana@example.invalid','subject'=>'general','message'=>'Consulta realista','company'=>'','phone'=>'','honeypot'=>''];
check(cp_validate($data)==$data,'valid input');
foreach ([['firstName',[]],['message',str_repeat('x',5001)],['email',"bad\r\n@example.com"],['subject','invalid'],['message',"\xC3\x28"]] as [$key,$value]) {
    check(rejects(fn()=>cp_validate(array_replace($data,[$key=>$value])),InvalidArgumentException::class),'reject invalid '.$key);
}
$db=database();
check(cp_enqueue($db,$data,'127.0.0.1','secret',10000),'accept first request');
check(!cp_enqueue($db,$data,'127.0.0.1','secret',10001),'deduplicate repeated request');
check((int)$db->query('SELECT COUNT(*) FROM jobs')->fetchColumn()===1,'duplicate creates no second job');
for ($i=1;$i<3;$i++) cp_enqueue($db,array_replace($data,['message'=>'message'.$i]),'127.0.0.1','secret',10000+$i);
check(rejects(fn()=>cp_enqueue($db,array_replace($data,['message'=>'excess']),'127.0.0.1','secret',10005),OverflowException::class),'email rate limit');
$db=database();
for ($i=0;$i<5;$i++) cp_enqueue($db,array_replace($data,['email'=>"user$i@example.invalid"]),'127.0.0.1','secret',10000);
check(rejects(fn()=>cp_enqueue($db,array_replace($data,['email'=>'next@example.invalid']),'127.0.0.1','secret',10001),OverflowException::class),'IP rate limit');
$config=['from_email'=>'sender@example.invalid','admin_recipients'=>['admin@example.invalid']];
$db=database(); cp_enqueue($db,$data,'127.0.0.1','secret',10000);
$fake=new class { public array $sent=[]; public function send(...$args): void { $this->sent[]=$args; } };
cp_process($db,$config,$fake); cp_process($db,$config,$fake);
check(count($fake->sent)===2,'one admin notice and one receipt despite repeated worker');
check($fake->sent[0][0]===['admin@example.invalid'] && $fake->sent[1][0]===[$data['email']],'correct recipients');
check(str_contains($fake->sent[0][2],'MENSAJE DEL CLIENTE') && !str_contains($fake->sent[1][2],'MENSAJE DEL CLIENTE'),'admin and customer receive different templates');
check(!str_contains($fake->sent[1][2],$data['message']) && !str_contains($fake->sent[1][2],$data['email']),'customer receipt does not repeat submitted message or address');
check(!preg_match('/\{\{\w+\}\}/',$fake->sent[1][2]),'receipt has no unresolved placeholders');
check(str_contains($fake->sent[0][2],'cid:catapulta-logo') && str_contains($fake->sent[1][2],'cid:catapulta-logo'),'both messages use inline CID logo');
$db=database(); cp_enqueue($db,$data,'127.0.0.1','secret',10000);
$failing=new class { public int $calls=0; public function send(...$args): void { $this->calls++; throw new RuntimeException('Lost acknowledgement'); } };
cp_process($db,$config,$failing); cp_process($db,$config,$failing);
check($failing->calls===1,'ambiguous SMTP delivery not retried');
check($db->query('SELECT admin FROM jobs')->fetchColumn()==='review','ambiguous delivery flagged for review');
$db=database(); cp_enqueue($db,$data,'127.0.0.1','secret',10000);
$receiptFail=new class { public int $calls=0; public function send(...$args): void { if (++$this->calls===2) throw new RuntimeException('Receipt failed'); } };
cp_process($db,$config,$receiptFail); cp_process($db,$config,$receiptFail);
check($receiptFail->calls===2 && $db->query('SELECT admin FROM jobs')->fetchColumn()==='sent','receipt failure never resends admin notice');
check(rejects(fn()=>cp_store(['storage_dir'=>realpath(__DIR__.'/..')]),RuntimeException::class),'reject public storage');
check(!str_contains(cp_template('email-template.html',['Nombre'=>'<script>','Mensaje'=>'{{Nombre}}']),'<script>'),'escape submitted HTML');
$db=database();
for ($i=0;$i<100;$i++) cp_enqueue($db,array_replace($data,['email'=>"global$i@example.invalid"]),'ip'.$i,'secret',10000);
check(rejects(fn()=>cp_enqueue($db,array_replace($data,['email'=>'globalnext@example.invalid']),'newip','secret',10001),OverflowException::class),'global hourly rate limit');
$db=database(); cp_enqueue($db,$data,'ip','secret',10000);
$overlap=new class($db,$config) {
    public int $calls=0;
    public function __construct(private PDO $db,private array $config) {}
    public function send(...$args): void { $this->calls++; if ($this->calls===1) cp_process($this->db,$this->config,$this); }
};
cp_process($db,$config,$overlap);
check($overlap->calls===2,'overlapping workers cannot duplicate a claimed job');
$mailer=new SmtpMailer([]);
check(rejects(fn()=>$mailer->send(["admin@example.com\r\nBcc: bad@example.com"],'subject','body','sender@example.invalid'),InvalidArgumentException::class),'SMTP header injection rejected before connection');
$method=new ReflectionMethod(SmtpMailer::class,'dotStuff');
check($method->invoke($mailer,"line\n.dot\r\nlast")==="line\r\n..dot\r\nlast",'SMTP line endings and dot escaping');
$mime=(new ReflectionMethod(SmtpMailer::class,'mime'))->invoke($mailer,$fake->sent[1][2]);
check(str_contains($mime['body'],'Content-ID: <catapulta-logo@catapultapay.com>') && str_contains($mime['body'],'Content-Type: image/png'),'logo attached to MIME message');
check(str_contains($mime['body'],'multipart/alternative') && str_contains($mime['body'],'Content-Type: text/plain'),'plain text alternative included');
check(str_contains($mime['body'],'Content-Transfer-Encoding: quoted-printable'),'HTML encoded with safe line wrapping');
check(max(array_map('strlen',explode("\r\n",$mime['body'])))<=998,'MIME lines respect SMTP limit');
$encoded=(new ReflectionMethod(SmtpMailer::class,'encodeHeader'))->invoke($mailer,str_repeat('Á',160));
check(max(array_map('strlen',explode("\r\n",$encoded)))<76,'long Unicode headers are folded');
preg_match('/Content-Transfer-Encoding: base64\r\nContent-ID:.*?\r\n\r\n(.*?)\r\n--/s',$mime['body'],$logoPart);
check(isset($logoPart[1]) && base64_decode($logoPart[1],true)===file_get_contents(__DIR__.'/../imagecata.png'),'attached PNG matches original brand asset');
preg_match('/Content-Type: text\/html; charset=UTF-8\r\nContent-Transfer-Encoding: quoted-printable\r\n\r\n(.*?)\r\n--/s',$mime['body'],$htmlPart);
check(isset($htmlPart[1]) && quoted_printable_decode($htmlPart[1])===$fake->sent[1][2],'MIME preserves customer HTML exactly');
$stream=fopen('php://temp','r+'); fwrite($stream,"550 recipient rejected private@example.invalid\r\n"); rewind($stream);
try {
    (new ReflectionMethod(SmtpMailer::class,'expect'))->invoke($mailer,$stream,[250]);
    check(false,'SMTP rejection should throw');
} catch (SmtpDeliveryException $e) {
    check($e->smtpCode===550 && !str_contains($e->getMessage(),'private@example.invalid'),'diagnostic exposes SMTP code without recipient address');
} finally { fclose($stream); }
$folder=sys_get_temp_dir().'/catapulta-store-'.bin2hex(random_bytes(8));
mkdir($folder,0700);
$cwd=getcwd(); $documentRoot=$_SERVER['DOCUMENT_ROOT'] ?? '';
try {
    chdir(sys_get_temp_dir()); $_SERVER['DOCUMENT_ROOT']='';
    $disk=cp_store(['storage_dir'=>$folder]);
    check($disk instanceof PDO,'CLI storage independent of current directory');
} finally {
    $disk=null; chdir($cwd); $_SERVER['DOCUMENT_ROOT']=$documentRoot;
    if (is_file($folder.'/contact.sqlite')) unlink($folder.'/contact.sqlite');
    rmdir($folder);
}
check((new SmtpDeliveryException('connect'))->canRetry(),'connection failure before DATA is retryable');
check((new SmtpDeliveryException('data',451))->canRetry(),'explicit temporary SMTP rejection is retryable');
check(!(new SmtpDeliveryException('data'))->canRetry(),'lost DATA acknowledgement is not retried');
check(!(new SmtpDeliveryException('recipient',550))->canRetry(),'permanent recipient rejection is not retried');
$db=database(); cp_enqueue($db,$data,'ip','secret',10000);
$transient=new class {
    public array $calls=[]; private bool $failed=false;
    public function send(...$args): void {
        $this->calls[]=$args[0];
        if ($args[0]===['ana@example.invalid'] && !$this->failed) { $this->failed=true; throw new SmtpDeliveryException('connect'); }
    }
};
cp_process($db,$config,$transient,10000);
check($db->query('SELECT admin FROM jobs')->fetchColumn()==='sent' && $db->query('SELECT receipt FROM jobs')->fetchColumn()==='pending','temporary receipt failure preserves admin success');
cp_process($db,$config,$transient,10030);
check(count($transient->calls)===2,'backoff prevents retry before due time');
cp_process($db,$config,$transient,10060); cp_process($db,$config,$transient,10100);
check(count($transient->calls)===3 && $db->query('SELECT receipt FROM jobs')->fetchColumn()==='sent','receipt recovers on scheduled retry without duplicate admin');
$db=database(); cp_enqueue($db,$data,'ip','secret',10000); $db->exec('UPDATE jobs SET admin="sent"');
$alwaysTemporary=new class { public int $calls=0; public function send(...$args): void { $this->calls++; throw new SmtpDeliveryException('recipient',450); } };
foreach ([10000,10060,10360,20000] as $time) cp_process($db,$config,$alwaysTemporary,$time);
check($alwaysTemporary->calls===3 && $db->query('SELECT receipt FROM jobs')->fetchColumn()==='review','temporary failure stops after three attempts');
check($db->query('SELECT receipt_error FROM jobs')->fetchColumn()==='phase=recipient code=450','failure detail stored without personal data');
$db=database(); cp_enqueue($db,$data,'ip','secret',10000); $db->exec('UPDATE jobs SET admin="sent"');
$uncertain=new class { public int $calls=0; public function send(...$args): void { $this->calls++; throw new SmtpDeliveryException('data'); } };
cp_process($db,$config,$uncertain,10000); cp_process($db,$config,$uncertain,20000);
check($uncertain->calls===1 && $db->query('SELECT receipt FROM jobs')->fetchColumn()==='review','uncertain receipt never automatically resends');
$legacy=new PDO('sqlite::memory:',null,null,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
$legacy->exec('CREATE TABLE jobs(id TEXT PRIMARY KEY,created INTEGER,payload TEXT,ip TEXT,email TEXT,admin TEXT DEFAULT "pending",receipt TEXT DEFAULT "pending")');
cp_enqueue($legacy,$data,'ip','secret',10000); $legacy->exec('UPDATE jobs SET admin="sent",receipt="review"');
cp_schema($legacy); cp_schema($legacy);
check($legacy->query('SELECT admin FROM jobs')->fetchColumn()==='sent' && $legacy->query('SELECT receipt FROM jobs')->fetchColumn()==='review','schema upgrade preserves historical delivery states');
check((int)$legacy->query('SELECT receipt_attempts FROM jobs')->fetchColumn()===0,'schema upgrade adds retry metadata safely');
echo "$tests total PHP checks passed\n";
