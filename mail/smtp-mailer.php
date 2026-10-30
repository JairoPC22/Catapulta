<?php
declare(strict_types=1);

// Cliente SMTP mínimo sin dependencias externas (coherente con la convención del
// proyecto de no depender de librerías de terceros). Soporta SSL/TLS directo
// (puerto 465) y STARTTLS (puerto 587), AUTH LOGIN y cuerpo HTML con UTF-8.
final class SmtpDeliveryException extends RuntimeException
{
    public function __construct(public string $phase, public int $smtpCode = 0)
    {
        parent::__construct('SMTP delivery failed during ' . $phase, $smtpCode);
    }
}

final class SmtpMailer
{
    private array $config;
    private string $phase = 'connect';

    public function __construct(array $config)
    {
        $this->config = $config;
    }

    /**
     * @param string[] $to
     */
    public function send(array $to, string $subject, string $htmlBody, string $fromEmail, ?string $replyTo = null): void
    {
        $this->phase = 'connect';
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
            throw new SmtpDeliveryException($this->phase);
        }
        stream_set_timeout($socket, 15);

        try {
            $this->phase = 'greeting';
            $this->expect($socket, [220]);
            $this->command($socket, 'EHLO catapultapay.com', [250]);

            if ($secure === 'tls') {
                $this->phase = 'tls';
                $this->command($socket, 'STARTTLS', [220]);
                if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                    throw new SmtpDeliveryException($this->phase);
                }
                $this->command($socket, 'EHLO catapultapay.com', [250]);
            }

            $this->phase = 'auth';
            $this->command($socket, 'AUTH LOGIN', [334]);
            $this->command($socket, base64_encode($user), [334]);
            $this->command($socket, base64_encode($pass), [235]);

            $this->phase = 'envelope';
            $this->command($socket, "MAIL FROM:<$fromEmail>", [250]);
            $this->phase = 'recipient';
            foreach ($to as $recipient) {
                $this->command($socket, "RCPT TO:<$recipient>", [250, 251]);
            }
            $this->phase = 'data';
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
            $headers[] = 'Date: ' . date('r');
            $headers[] = 'Message-ID: <' . bin2hex(random_bytes(16)) . '@catapultapay.com>';
            $message = $this->mime($htmlBody);
            $headers[] = 'Content-Type: multipart/related; boundary="' . $message['boundary'] . '"';

            $data = implode("\r\n", $headers) . "\r\n\r\n" . $this->dotStuff($message['body']) . "\r\n.";
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
        $words = []; $chunk = '';
        foreach (preg_split('//u', $value, -1, PREG_SPLIT_NO_EMPTY) ?: [] as $character) {
            if (strlen($chunk . $character) > 42) {
                $words[] = '=?UTF-8?B?' . base64_encode($chunk) . '?=';
                $chunk = '';
            }
            $chunk .= $character;
        }
        if ($chunk !== '' || !$words) $words[] = '=?UTF-8?B?' . base64_encode($chunk) . '?=';
        return implode("\r\n ", $words);
    }

    private function mime(string $html): array
    {
        $boundary = 'cp_related_' . bin2hex(random_bytes(12));
        $alternative = 'cp_alt_' . bin2hex(random_bytes(12));
        $plain = preg_replace('/<(br\s*\/?|\/p|\/tr|\/h[1-6])>/i', "\n", $html);
        $plain = html_entity_decode(strip_tags(preg_replace('/<(style|head)[^>]*>.*?<\/\1>/is', '', $plain)), ENT_QUOTES, 'UTF-8');
        $plain = trim(preg_replace('/[\t ]+/', ' ', $plain));
        $part = static function (string $type, string $content): string {
            return 'Content-Type: ' . $type . '; charset=UTF-8' . "\r\nContent-Transfer-Encoding: quoted-printable\r\n\r\n" . quoted_printable_encode($content) . "\r\n";
        };
        $body = "--$boundary\r\nContent-Type: multipart/alternative; boundary=\"$alternative\"\r\n\r\n";
        $body .= "--$alternative\r\n" . $part('text/plain', $plain);
        $body .= "--$alternative\r\n" . $part('text/html', $html) . "--$alternative--\r\n";
        $logo = file_get_contents(__DIR__ . '/../imagecata.png');
        if ($logo === false) throw new RuntimeException('Missing inline brand logo');
        $body .= "--$boundary\r\nContent-Type: image/png; name=\"catapultapayment.png\"\r\nContent-Transfer-Encoding: base64\r\nContent-ID: <catapulta-logo@catapultapay.com>\r\nContent-Disposition: inline; filename=\"catapultapayment.png\"\r\n\r\n";
        $body .= chunk_split(base64_encode($logo), 76, "\r\n") . "--$boundary--\r\n";
        return ['boundary' => $boundary, 'body' => $body];
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
            if ($written === false || $written === 0) throw new SmtpDeliveryException($this->phase);
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
                throw new SmtpDeliveryException($this->phase);
            }
            $response .= $line;
        } while (strlen($line) >= 4 && $line[3] === '-');

        $code = (int) substr($response, 0, 3);
        if (!in_array($code, $expectedCodes, true)) {
            // Keep server replies (which may contain addresses) out of application logs.
            throw new SmtpDeliveryException($this->phase, $code);
        }
    }
}
