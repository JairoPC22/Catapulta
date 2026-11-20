<?php
declare(strict_types=1);
// HTTP fallback trigger for the mail queue, used by the scheduled GitHub
// Actions workflow (.github/workflows/mail-cron.yml) when there is no
// access to configure a real cron job in the IONOS control panel. Prefer a
// native IONOS scheduled task per mail/SETUP.md once that access is back;
// this endpoint only accelerates sending of requests the form already
// validated and queued, it never accepts or returns visitor data.
//
// The expected token lives in mail/cron-token.php, which is NOT in git: the
// mail-cron workflow uploads it at run time from the MAIL_CRON_TOKEN GitHub
// secret, the same way config.php stays private and server-only.
header('Content-Type: text/plain; charset=utf-8');
header('Cache-Control: no-store');

if (!is_file(__DIR__.'/cron-token.php')) { http_response_code(503); echo 'not_configured'; exit; }
$expected = require __DIR__.'/cron-token.php';
$provided = $_GET['token'] ?? ($_SERVER['HTTP_X_CRON_TOKEN'] ?? '');
if (!is_string($expected) || strlen($expected)<32 || !is_string($provided) || !hash_equals($expected, $provided)) { http_response_code(404); exit; }

require __DIR__.'/processor.php';
if (!is_file(__DIR__.'/config.php')) { http_response_code(503); echo 'not_configured'; exit; }
$config=require __DIR__.'/config.php';
$config['admin_recipients']=require __DIR__.'/recipients.php';
cp_process(cp_store($config),$config,new SmtpMailer($config));
echo 'ok';
