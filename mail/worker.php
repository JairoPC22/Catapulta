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
function cp_process(PDO $db,array $config,object $mailer): void {
$rows=$db->query('SELECT * FROM jobs WHERE admin="pending" OR (admin="sent" AND receipt="pending") ORDER BY created LIMIT 20')->fetchAll(PDO::FETCH_ASSOC);
foreach ($rows as $row) {
    $d=json_decode($row['payload'],true,512,JSON_THROW_ON_ERROR);
    $labels=['pos'=>'Terminal POS físico','virtual'=>'Procesamiento virtual','support'=>'Soporte técnico','general'=>'Consulta general'];
    $vars=['Nombre'=>$d['firstName'].' '.$d['lastName'],'Negocio'=>$d['company'] ?: 'No proporcionado','Correo'=>$d['email'],'Telefono'=>$d['phone'] ?: 'No proporcionado','Interes'=>$labels[$d['subject']],'Mensaje'=>$d['message'],'Referencia'=>strtoupper(substr($row['id'],0,10))];
    foreach (['admin','receipt'] as $kind) {
        $condition=$kind==='receipt' ? ' AND admin="sent"' : '';
        $claim=$db->prepare("UPDATE jobs SET $kind='sending' WHERE id=? AND $kind='pending'$condition");
        $claim->execute([$row['id']]); if (!$claim->rowCount()) continue;
        try {
            $internal=$kind==='admin';
            $mailer->send($internal ? $config['admin_recipients'] : [$d['email']], $internal ? 'Nueva solicitud de contacto — '.$vars['Nombre'] : 'Hemos recibido tu solicitud — CatapultaPayment', cp_template($internal ? 'email-template.html' : 'email-template-autoreply.html',$vars),$config['from_email'],$internal ? $d['email'] : null);
            $db->prepare("UPDATE jobs SET $kind='sent' WHERE id=?")->execute([$row['id']]);
            error_log('CatapultaPayment: SMTP accepted '.$row['id'].' '.$kind);
        } catch (Throwable $e) {
            // An SMTP acknowledgement may be lost after delivery. Manual review avoids duplicates.
            $db->prepare("UPDATE jobs SET $kind='review' WHERE id=?")->execute([$row['id']]);
            $details=$e instanceof SmtpDeliveryException ? ' phase='.$e->phase.' code='.$e->smtpCode : ' phase=application';
            error_log('CatapultaPayment: delivery requires review '.$row['id'].' '.$kind.$details);
        }
    }
}
}
if (realpath($_SERVER['SCRIPT_FILENAME'] ?? '')===__FILE__) {
    $config=require __DIR__.'/config.php';
    $config['admin_recipients']=require __DIR__.'/recipients.php';
    cp_process(cp_store($config),$config,new SmtpMailer($config));
}
