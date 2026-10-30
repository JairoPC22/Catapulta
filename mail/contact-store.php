<?php
declare(strict_types=1);
function cp_store(array $config): PDO {
    $dir = realpath((string)($config['storage_dir'] ?? ''));
    $root = realpath(__DIR__.'/..');
    if (!$dir || !$root || $dir === $root || strpos($dir.DIRECTORY_SEPARATOR, $root.DIRECTORY_SEPARATOR) === 0) throw new RuntimeException('Configure private storage outside public website');
    // CLI has no document root. realpath('') would wrongly use its working directory.
    $documentRoot = (string)($_SERVER['DOCUMENT_ROOT'] ?? '');
    $public = $documentRoot !== '' ? realpath($documentRoot) : false;
    if ($public && ($dir === $public || strpos($dir.DIRECTORY_SEPARATOR, $public.DIRECTORY_SEPARATOR) === 0)) throw new RuntimeException('Storage must not be web accessible');
    $db = new PDO('sqlite:'.$dir.'/contact.sqlite', null, null, [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
    $db->exec('PRAGMA busy_timeout=5000');
    cp_schema($db);
    @chmod($dir.'/contact.sqlite', 0600);
    return $db;
}
function cp_schema(PDO $db): void {
    // Serialize upgrades: web requests and cron can open the same existing queue.
    $db->exec('BEGIN IMMEDIATE');
    try {
        $db->exec('CREATE TABLE IF NOT EXISTS jobs (id TEXT PRIMARY KEY, created INTEGER NOT NULL, payload TEXT NOT NULL, ip TEXT NOT NULL, email TEXT NOT NULL, admin TEXT NOT NULL DEFAULT "pending", receipt TEXT NOT NULL DEFAULT "pending")');
        $columns=array_column($db->query('PRAGMA table_info(jobs)')->fetchAll(PDO::FETCH_ASSOC),'name');
        foreach (['admin','receipt'] as $kind) {
            foreach (['attempts'=>'INTEGER NOT NULL DEFAULT 0','next'=>'INTEGER NOT NULL DEFAULT 0','error'=>"TEXT NOT NULL DEFAULT ''"] as $suffix=>$type) {
                $name=$kind.'_'.$suffix;
                if (!in_array($name,$columns,true)) $db->exec("ALTER TABLE jobs ADD COLUMN $name $type");
            }
        }
        $db->exec('CREATE INDEX IF NOT EXISTS jobs_created ON jobs(created)');
        $db->exec('COMMIT');
    } catch (Throwable $e) { $db->exec('ROLLBACK'); throw $e; }
}
function cp_validate(array $data): array {
    $limits=['firstName'=>80,'lastName'=>80,'email'=>254,'company'=>160,'phone'=>40,'subject'=>20,'message'=>5000,'honeypot'=>200];
    $clean=[];
    foreach ($limits as $key=>$limit) {
        $value=$data[$key] ?? '';
        if (!is_string($value) || strlen($value)>$limit*4 || preg_match('//u',$value)!==1) throw new InvalidArgumentException('invalid_field');
        $value=trim($value);
        if (preg_match_all('/./us',$value)>$limit || preg_match('/\x00/',$value) || ($key!=='message' && preg_match('/[\r\n]/',$value))) throw new InvalidArgumentException('invalid_field');
        $clean[$key]=$value;
    }
    foreach (['firstName','lastName','email','message'] as $key) if ($clean[$key]==='') throw new InvalidArgumentException('missing_fields');
    if (!filter_var($clean['email'],FILTER_VALIDATE_EMAIL)) throw new InvalidArgumentException('invalid_email');
    if (!in_array($clean['subject'],['pos','virtual','support','general'],true)) throw new InvalidArgumentException('invalid_subject');
    return $clean;
}
function cp_enqueue(PDO $db,array $data,string $ip,string $secret,int $now): bool {
    $payload=json_encode($data,JSON_THROW_ON_ERROR|JSON_UNESCAPED_UNICODE);
    $id=hash_hmac('sha256',$payload,$secret);
    $ip=hash_hmac('sha256',$ip,$secret);
    $email=hash_hmac('sha256',strtolower($data['email']),$secret);
    $db->exec('BEGIN IMMEDIATE');
    try {
        $db->prepare('DELETE FROM jobs WHERE created<? AND admin="sent" AND receipt="sent"')->execute([$now-7*86400]);
        $q=$db->prepare('SELECT id FROM jobs WHERE id=?'); $q->execute([$id]);
        if ($q->fetchColumn()) { $db->exec('COMMIT'); return false; }
        foreach ([['ip',$ip,900,5],['email',$email,3600,3]] as [$col,$value,$window,$limit]) {
            $q=$db->prepare("SELECT COUNT(*) FROM jobs WHERE $col=? AND created>?"); $q->execute([$value,$now-$window]);
            if ((int)$q->fetchColumn()>=$limit) throw new OverflowException('rate_limited');
        }
        $q=$db->prepare('SELECT COUNT(*) FROM jobs WHERE created>?'); $q->execute([$now-3600]);
        if ((int)$q->fetchColumn()>=100 || (int)$db->query('SELECT COUNT(*) FROM jobs')->fetchColumn()>=10000) throw new OverflowException('rate_limited');
        $db->prepare('INSERT INTO jobs(id,created,payload,ip,email) VALUES(?,?,?,?,?)')->execute([$id,$now,$payload,$ip,$email]);
        $db->exec('COMMIT'); return true;
    } catch (Throwable $e) { $db->exec('ROLLBACK'); throw $e; }
}
