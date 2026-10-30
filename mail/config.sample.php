<?php
// Copia este archivo como config.php (misma carpeta) y completa los valores reales.
// config.php NUNCA se sube a git (está en .gitignore): edítalo directamente en el
// Administrador de archivos de IONOS, o súbelo por SFTP a mano, una sola vez.
//
// Antes de completar esto, crea en IONOS la cuenta de correo que enviará los avisos
// (Panel IONOS > Correo > Crear dirección de correo), por ejemplo
// notificaciones@catapultapay.com, y usa esa cuenta y su contraseña aquí abajo.

return [
    // Datos confirmados en el panel IONOS México del buzón del proyecto.
    'smtp_host' => 'smtp.ionos.mx',
    'smtp_port' => 587,
    'smtp_secure' => 'tls', // STARTTLS, con autenticación SMTP.

    // Credenciales de la cuenta de correo creada en IONOS.
    'smtp_user' => 'notificaciones@catapultapay.com',
    'smtp_pass' => 'LA_CONTRASEÑA_DE_ESA_CUENTA',

    // Remitente que verán los destinatarios (debe ser la misma cuenta de arriba).
    'from_email' => 'notificaciones@catapultapay.com',
    'from_name' => 'CatapultaPayment',
    // Carpeta existente fuera del directorio publicado. Permisos 0700.
    'storage_dir' => '',
    // Generar localmente con: php -r "echo bin2hex(random_bytes(32));"
    'storage_secret' => '',
    'allowed_origins' => ['https://catapultapay.com', 'https://www.catapultapay.com'],

    // A dónde llega el aviso interno de cada nuevo contacto del formulario.
    // Puedes poner una o varias direcciones.
    'admin_recipients' => [
        // Pendiente: direcciones reales de administradores.
    ],
];
