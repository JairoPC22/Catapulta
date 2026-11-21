<?php
declare(strict_types=1);
if (PHP_SAPI!=='cli') { http_response_code(404); exit; }
require __DIR__.'/processor.php';
if (realpath($_SERVER['SCRIPT_FILENAME'] ?? '')===__FILE__) {
    $config=require __DIR__.'/config.php';
    $config['admin_recipients']=require __DIR__.'/recipients.php';
    cp_process(cp_store($config),$config,new SmtpMailer(cp_smtp_config($config)));
}
