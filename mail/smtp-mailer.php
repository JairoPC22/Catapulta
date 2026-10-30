<?php
declare(strict_types=1);

// Cliente SMTP mínimo sin dependencias externas (coherente con la convención del
// proyecto de no depender de librerías de terceros). Soporta SSL/TLS directo
// (puerto 465) y STARTTLS (puerto 587), AUTH LOGIN y cuerpo HTML con UTF-8.
final class SmtpMailer
{
    private array $config;

    public function __construct(array $config)
    {
        $this->config = $config;
    }

    /**
     * @param string[] $to
     */
    public function send(array $to, string $subject, string $htmlBody, string $fromEmail, ?string $replyTo = null): void
    {
        foreach (array_merge($to, [$fromEmail], $replyTo ? [$replyTo] : []) as $address) {
            if (!filter_var($address, FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n]/', $address)) throw new InvalidArgumentException('Invalid mail address');
        }
        if (!$to) throw new InvalidArgumentException('Missing recipients');
        $host = (string) $this->config['smtp_host'];
        $port = (int) $this->config['smtp_port'];
        $secure = $this->config['smtp_secure'] ?? 'ssl';
        if (!in_array($secure, ['ssl', 'tls'], true)) throw new InvalidArgumentException('TLS required');
        $user = (string) $this->config['smtp_user'];
        $pass = (string) $this->config['smtp_pass'];
        $fromName = (string) ($this->config['from_name'] ?? 'CatapultaPay');

        $transport = $secure === 'ssl' ? 'ssl://' . $host : $host;
        $socket = @fsockopen($transport, $port, $errno, $errstr, 15);
        if (!$socket) {
            throw new RuntimeException("No se pudo conectar al servidor SMTP: $errstr ($errno)");
        }
        stream_set_timeout($socket, 15);

        try {
            $this->expect($socket, [220]);
            $this->command($socket, 'EHLO catapultapay.com', [250]);

            if ($secure === 'tls') {
                $this->command($socket, 'STARTTLS', [220]);
                if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                    throw new RuntimeException('No se pudo iniciar TLS con el servidor SMTP.');
                }
                $this->command($socket, 'EHLO catapultapay.com', [250]);
            }

            $this->command($socket, 'AUTH LOGIN', [334]);
            $this->command($socket, base64_encode($user), [334]);
            $this->command($socket, base64_encode($pass), [235]);

            $this->command($socket, "MAIL FROM:<$fromEmail>", [250]);
            foreach ($to as $recipient) {
                $this->command($socket, "RCPT TO:<$recipient>", [250, 251]);
            }
            $this->command($socket, 'DATA', [354]);

            $headers = [
                'From: ' . $this->encodeHeader($fromName) . " <$fromEmail>",
                'To: ' . implode(', ', $to),
            ];
            if ($replyTo) {
                $headers[] = "Reply-To: <$replyTo>";
            }
            $headers[] = 'Subject: ' . $this->encodeHeader($subject);
            $headers[] = 'MIME-Version: 1.0';
            $headers[] = 'Content-Type: text/html; charset=UTF-8';
            $headers[] = 'Content-Transfer-Encoding: 8bit';
            $headers[] = 'Date: ' . date('r');

            $data = implode("\r\n", $headers) . "\r\n\r\n" . $this->dotStuff($htmlBody) . "\r\n.";
            $this->raw($socket, $data);
            $this->expect($socket, [250]);

            // DATA was accepted: a failed QUIT must not turn delivery into a retry.
            try { $this->command($socket, 'QUIT', [221]); } catch (Throwable $e) { /* Already accepted. */ }
        } finally {
            fclose($socket);
        }
    }

    private function encodeHeader(string $value): string
    {
        return '=?UTF-8?B?' . base64_encode($value) . '?=';
    }

    private function dotStuff(string $body): string
    {
        $normalized = str_replace(["\r\n", "\r"], "\n", $body);
        return str_replace("\n", "\r\n", preg_replace('/^\./m', '..', $normalized) ?? $normalized);
    }

    /** @param resource $socket */
    private function raw($socket, string $line): void
    {
        $data = $line . "\r\n";
        while ($data !== '') {
            $written = fwrite($socket, $data);
            if ($written === false || $written === 0) throw new RuntimeException('SMTP write failed');
            $data = substr($data, $written);
        }
    }

    /** @param resource $socket */
    private function command($socket, string $line, array $expectedCodes): void
    {
        $this->raw($socket, $line);
        $this->expect($socket, $expectedCodes);
    }

    /** @param resource $socket */
    private function expect($socket, array $expectedCodes): void
    {
        $response = '';
        do {
            $line = fgets($socket, 515);
            if ($line === false) {
                throw new RuntimeException('Conexión SMTP cerrada inesperadamente.');
            }
            $response .= $line;
        } while (strlen($line) >= 4 && $line[3] === '-');

        $code = (int) substr($response, 0, 3);
        if (!in_array($code, $expectedCodes, true)) {
            throw new RuntimeException("Respuesta SMTP inesperada ($code): " . trim($response));
        }
    }
}
