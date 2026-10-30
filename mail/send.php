<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'method_not_allowed']);
    exit;
}

$configPath = __DIR__ . '/config.php';
if (!is_file($configPath)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'not_configured']);
    exit;
}
$config = require $configPath;

require __DIR__ . '/smtp-mailer.php';

$raw = file_get_contents('php://input');
$data = json_decode($raw ?: '', true);
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'invalid_payload']);
    exit;
}

function cp_field(array $data, string $key): string
{
    return trim((string) ($data[$key] ?? ''));
}

// Honeypot: si un bot lo rellenó, respondemos éxito sin enviar nada.
if (cp_field($data, 'honeypot') !== '') {
    echo json_encode(['ok' => true]);
    exit;
}

$firstName = cp_field($data, 'firstName');
$lastName  = cp_field($data, 'lastName');
$email     = cp_field($data, 'email');
$company   = cp_field($data, 'company');
$phone     = cp_field($data, 'phone');
$subject   = cp_field($data, 'subject');
$message   = cp_field($data, 'message');

if ($firstName === '' || $lastName === '' || $email === '' || $message === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'missing_fields']);
    exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'invalid_email']);
    exit;
}

$labels = [
    'pos' => 'Terminal POS físico',
    'virtual' => 'Procesamiento virtual',
    'support' => 'Soporte técnico',
    'general' => 'Consulta general',
];
$interes = $labels[$subject] ?? 'Consulta general';
$nombre = trim($firstName . ' ' . $lastName);

function cp_escape(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

function cp_render_template(string $file, array $vars): string
{
    $html = file_get_contents($file);
    if ($html === false) {
        throw new RuntimeException("No se pudo leer la plantilla: $file");
    }
    foreach ($vars as $key => $value) {
        $html = str_replace('{{' . $key . '}}', $value, $html);
    }
    return $html;
}

try {
    $mensajeHtml = nl2br(cp_escape($message));

    $adminHtml = cp_render_template(__DIR__ . '/../email-template.html', [
        'Nombre' => cp_escape($nombre),
        'Negocio' => cp_escape($company !== '' ? $company : 'No proporcionado'),
        'Correo' => cp_escape($email),
        'Telefono' => cp_escape($phone !== '' ? $phone : 'No proporcionado'),
        'Interes' => cp_escape($interes),
        'Mensaje' => $mensajeHtml,
    ]);

    $autoreplyHtml = cp_render_template(__DIR__ . '/../email-template-autoreply.html', [
        'Nombre' => cp_escape($nombre),
        'Interes' => cp_escape($interes),
        'Mensaje' => $mensajeHtml,
    ]);

    $mailer = new SmtpMailer($config);

    // Aviso interno: si falla, el envío completo falla y el cliente ve el error
    // en el formulario (sus datos no se pierden, puede reintentar).
    $mailer->send(
        $config['admin_recipients'],
        'Nueva solicitud de contacto — ' . $nombre,
        $adminHtml,
        $config['from_email'],
        $email
    );

    // Confirmación al cliente: mejor esfuerzo. Si falla, no debe impedir que el
    // formulario reporte éxito, porque el equipo interno ya fue notificado.
    try {
        $mailer->send([$email], 'Recibimos tu solicitud — CatapultaPay', $autoreplyHtml, $config['from_email']);
    } catch (Throwable $e) {
        error_log('CatapultaPay: no se pudo enviar la confirmación automática al cliente: ' . $e->getMessage());
    }

    echo json_encode(['ok' => true]);
} catch (Throwable $e) {
    error_log('CatapultaPay: fallo al enviar el correo del formulario: ' . $e->getMessage());
    http_response_code(502);
    echo json_encode(['ok' => false, 'error' => 'send_failed']);
}
