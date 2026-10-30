<?php
// Copia este archivo como config.php (misma carpeta) y completa los valores reales.
// config.php NUNCA se sube a git (está en .gitignore): edítalo directamente en el
// Administrador de archivos de IONOS, o súbelo por SFTP a mano, una sola vez.
//
// Antes de completar esto, crea en IONOS la cuenta de correo que enviará los avisos
// (Panel IONOS > Correo > Crear dirección de correo), por ejemplo
// notificaciones@catapultapay.com, y usa esa cuenta y su contraseña aquí abajo.

return [
    // Datos del servidor SMTP de IONOS (iguales para cualquier cuenta @catapultapay.com).
    'smtp_host' => 'smtp.ionos.com',
    'smtp_port' => 465,     // 465 = SSL/TLS directo (recomendado). Si tu red lo bloquea, usa 587 + 'tls'.
    'smtp_secure' => 'ssl', // 'ssl' para el puerto 465, 'tls' (STARTTLS) para el 587.

    // Credenciales de la cuenta de correo creada en IONOS.
    'smtp_user' => 'notificaciones@catapultapay.com',
    'smtp_pass' => 'LA_CONTRASEÑA_DE_ESA_CUENTA',

    // Remitente que verán los destinatarios (debe ser la misma cuenta de arriba).
    'from_email' => 'notificaciones@catapultapay.com',
    'from_name' => 'CatapultaPay',

    // A dónde llega el aviso interno de cada nuevo contacto del formulario.
    // Puedes poner una o varias direcciones.
    'admin_recipients' => [
        'ventas@catapultapay.com',
    ],
];
