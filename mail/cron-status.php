<?php
declare(strict_types=1);
// HTTP twin of status.php (which is CLI-only) for when there is no SSH
// access either. Gated by the same token as cron.php. Shows only states,
// attempt counts and SMTP phase/code — never the message, email address or
// IP of a request, matching status.php's existing privacy scope.
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

if (!is_file(__DIR__.'/cron-token.php')) { http_response_code(503); echo json_encode(['error'=>'not_configured']); exit; }
$expected = require __DIR__.'/cron-token.php';
$provided = $_GET['token'] ?? ($_SERVER['HTTP_X_CRON_TOKEN'] ?? '');
if (!is_string($expected) || strlen($expected)<32 || !is_string($provided) || !hash_equals($expected, $provided)) { http_response_code(404); exit; }

require __DIR__.'/contact-store.php';
if (!is_file(__DIR__.'/config.php')) { http_response_code(503); echo json_encode(['error'=>'not_configured']); exit; }
$config = require __DIR__.'/config.php';
$db = cp_store($config);
$jobs = $db->query('SELECT id,created,admin,admin_attempts,admin_error,receipt,receipt_attempts,receipt_error,receipt_next FROM jobs ORDER BY created DESC LIMIT 5')->fetchAll(PDO::FETCH_ASSOC);
foreach ($jobs as &$job) {
    $job['id'] = strtoupper(substr($job['id'], 0, 10));
    $job['created'] = gmdate('Y-m-d H:i:s', (int)$job['created']).' UTC';
}
unset($job);
echo json_encode(['note'=>'sent = accepted by SMTP; inbox delivery is not confirmed.','jobs'=>$jobs], JSON_PRETTY_PRINT);
