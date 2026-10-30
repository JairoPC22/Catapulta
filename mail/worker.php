<?php
declare(strict_types=1);
if (PHP_SAPI!=='cli') { http_response_code(404); exit; }
require __DIR__.'/contact-store.php';
require __DIR__.'/smtp-mailer.php';
function cp_template(string $file,array $vars): string {
    $html=file_get_contents(__DIR__.'/../'.$file);
    if ($html===false) throw new RuntimeException('Missing template');
    $replace=[];
    foreach ($vars as $key=>$value) $replace['{{'.$key.'}}']=htmlspecialchars($value,ENT_QUOTES,'UTF-8');
    return strtr($html,$replace);
}
function cp_process(PDO $db,array $config,object $mailer,?int $now=null): void {
$now=$now ?? time();
$ready=$db->prepare('SELECT * FROM jobs WHERE (admin="pending" AND admin_next<=?) OR (admin="sent" AND receipt="pending" AND receipt_next<=?) ORDER BY created LIMIT 20');
$ready->execute([$now,$now]);
$rows=$ready->fetchAll(PDO::FETCH_ASSOC);
foreach ($rows as $row) {
    $d=json_decode($row['payload'],true,512,JSON_THROW_ON_ERROR);
    $labels=['pos'=>'Terminal POS físico','virtual'=>'Procesamiento virtual','support'=>'Soporte técnico','general'=>'Consulta general'];
    $vars=['Nombre'=>$d['firstName'].' '.$d['lastName'],'Negocio'=>$d['company'] ?: 'No proporcionado','Correo'=>$d['email'],'Telefono'=>$d['phone'] ?: 'No proporcionado','Interes'=>$labels[$d['subject']],'Mensaje'=>$d['message'],'Referencia'=>strtoupper(substr($row['id'],0,10))];
    foreach (['admin','receipt'] as $kind) {
        $condition=$kind==='receipt' ? ' AND admin="sent"' : '';
        $claim=$db->prepare("UPDATE jobs SET $kind='sending', {$kind}_attempts={$kind}_attempts+1 WHERE id=? AND $kind='pending' AND {$kind}_next<=? AND {$kind}_attempts<3$condition");
        $claim->execute([$row['id'],$now]); if (!$claim->rowCount()) continue;
        try {
            $internal=$kind==='admin';
            $mailer->send($internal ? $config['admin_recipients'] : [$d['email']], $internal ? 'Nueva solicitud de contacto — '.$vars['Nombre'] : 'Hemos recibido tu solicitud — CatapultaPayment', cp_template($internal ? 'email-template.html' : 'email-template-autoreply.html',$vars),$config['from_email'],$internal ? $d['email'] : null);
            $db->prepare("UPDATE jobs SET $kind='sent', {$kind}_error='', {$kind}_next=0 WHERE id=?")->execute([$row['id']]);
            error_log('CatapultaPayment: SMTP accepted '.$row['id'].' '.$kind);
        } catch (Throwable $e) {
            $details=$e instanceof SmtpDeliveryException ? ' phase='.$e->phase.' code='.$e->smtpCode : ' phase=application';
            $count=$db->prepare("SELECT {$kind}_attempts FROM jobs WHERE id=?"); $count->execute([$row['id']]);
            $attempts=(int)$count->fetchColumn();
            $retry=$e instanceof SmtpDeliveryException && $e->canRetry() && $attempts<3;
            $next=$retry ? $now+($attempts===1 ? 60 : 300) : 0;
            $state=$retry ? 'pending' : 'review';
            $db->prepare("UPDATE jobs SET $kind=?, {$kind}_next=?, {$kind}_error=? WHERE id=?")->execute([$state,$next,trim($details),$row['id']]);
            error_log('CatapultaPayment: delivery '.$state.' '.$row['id'].' '.$kind.$details);
        }
    }
}
}
if (realpath($_SERVER['SCRIPT_FILENAME'] ?? '')===__FILE__) {
    $config=require __DIR__.'/config.php';
    $config['admin_recipients']=require __DIR__.'/recipients.php';
    cp_process(cp_store($config),$config,new SmtpMailer($config));
}
