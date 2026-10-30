<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
function cp_reply(int $status,string $error=''): void {
    http_response_code($status);
    echo json_encode($error==='' ? ['ok'=>true] : ['ok'=>false,'error'=>$error]);
    exit;
}
if ($_SERVER['REQUEST_METHOD']!=='POST') { header('Allow: POST'); cp_reply(405,'method_not_allowed'); }
if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json')!==0) cp_reply(415,'invalid_content_type');
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0)>32768) cp_reply(413,'payload_too_large');
$raw=file_get_contents('php://input',false,null,0,32769);
if ($raw===false || strlen($raw)>32768) cp_reply(413,'payload_too_large');
$data=json_decode($raw,true);
if (!is_array($data)) cp_reply(400,'invalid_payload');
if (is_string($data['honeypot'] ?? null) && trim($data['honeypot'])!=='') cp_reply(202);
require __DIR__.'/contact-store.php';
try { $data=cp_validate($data); } catch (InvalidArgumentException $e) { cp_reply(400,$e->getMessage()); }
try {
    if (!is_file(__DIR__.'/config.php')) cp_reply(503,'not_configured');
    $config=require __DIR__.'/config.php';
    $origin=$_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin!=='' && !in_array($origin,$config['allowed_origins'] ?? [],true)) cp_reply(403,'origin_denied');
    if (strlen($config['storage_secret'] ?? '')<32 || empty($config['admin_recipients'])) cp_reply(503,'not_configured');
    foreach (array_merge($config['admin_recipients'],[$config['from_email'] ?? '']) as $address) {
        if (!filter_var($address,FILTER_VALIDATE_EMAIL)) cp_reply(503,'not_configured');
    }
    cp_enqueue(cp_store($config),$data,$_SERVER['REMOTE_ADDR'] ?? 'unknown',$config['storage_secret'],time());
    cp_reply(202);
} catch (OverflowException $e) { header('Retry-After: 900'); cp_reply(429,'rate_limited'); }
catch (Throwable $e) { error_log('CatapultaPayment: contact queue unavailable'); cp_reply(503,'temporarily_unavailable'); }
