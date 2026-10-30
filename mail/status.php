<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require __DIR__.'/contact-store.php';
$config = require __DIR__.'/config.php';
$db = cp_store($config);
$jobs = $db->query('SELECT id,created,admin,admin_attempts,admin_error,receipt,receipt_attempts,receipt_error,receipt_next FROM jobs ORDER BY created DESC LIMIT 5')->fetchAll(PDO::FETCH_ASSOC);
foreach ($jobs as &$job) {
    $job['id'] = strtoupper(substr($job['id'], 0, 10));
    $job['created'] = gmdate('Y-m-d H:i:s', (int)$job['created']).' UTC';
}
unset($job);
echo json_encode($jobs, JSON_PRETTY_PRINT), PHP_EOL;
echo "sent = accepted by SMTP; inbox delivery is not confirmed.\n";
