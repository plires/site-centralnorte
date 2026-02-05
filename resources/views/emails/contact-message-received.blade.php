{{-- resources/views/emails/contact-message-received.blade.php --}}
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nuevo Mensaje de Contacto</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 0;
            background-color: #f5f5f5;
        }

        .email-container {
            background-color: #ffffff;
            margin: 20px auto;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .header {
            background: {{ env('PRIMARY_COLOR', '#3d5095') }};
            padding: 30px 20px;
            text-align: center;
            color: white;
        }

        .logo {
            max-width: 230px;
            height: auto;
            margin-bottom: 15px;
        }

        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }

        .content {
            padding: 30px;
        }

        .greeting {
            font-size: 18px;
            color: {{ env('PRIMARY_COLOR', '#3d5095') }};
            margin-bottom: 20px;
        }

        .info-box {
            background-color: #e7f3ff;
            border-left: 4px solid {{ env('PRIMARY_COLOR', '#3d5095') }};
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
        }

        .info-box strong {
            color: {{ env('PRIMARY_COLOR', '#3d5095') }};
        }

        .contact-details {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid {{ env('SECONDARY_COLOR', '#19ac90') }};
            margin: 20px 0;
        }

        .contact-details h3 {
            color: {{ env('PRIMARY_COLOR', '#3d5095') }};
            margin-top: 0;
        }

        .contact-details p {
            margin: 10px 0;
        }

        .message-box {
            background-color: #fff8e1;
            border-left: 4px solid #ffc107;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
        }

        .message-box h4 {
            color: #f57c00;
            margin-top: 0;
        }

        .message-box p {
            margin: 10px 0;
            white-space: pre-wrap;
        }

        .button {
            display: inline-block;
            background-color: {{ env('SECONDARY_COLOR', '#19ac90') }};
            color: white !important;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 6px;
            margin: 25px 0;
            font-weight: 600;
            transition: background-color 0.3s;
        }

        .button:hover {
            background-color: {{ env('PRIMARY_COLOR', '#3d5095') }};
        }

        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 13px;
            color: #666;
            border-top: 1px solid #e9ecef;
        }

        .footer p {
            margin: 5px 0;
        }

        .footer strong {
            color: {{ env('PRIMARY_COLOR', '#3d5095') }};
        }
    </style>
</head>

<body>
    <div class="email-container">
        <div class="header">
            @if (env('LOGO_PATH'))
                <img src="{{ env('APP_URL') . env('LOGO_PATH') }}" alt="Central Norte" class="logo">
            @endif
            <h1>Nuevo Mensaje de Contacto 📩</h1>
        </div>

        <div class="content">
            <p class="greeting">Hola,</p>

            <div class="info-box">
                <strong>¡Has recibido un nuevo mensaje!</strong>
                <p>Alguien completó el formulario de contacto en el sitio web.</p>
            </div>

            <div class="contact-details">
                <h3>👤 Datos del Contacto</h3>
                <p><strong>Nombre:</strong> {{ $contactMessage->name }} {{ $contactMessage->last_name }}</p>
                @if ($contactMessage->company)
                    <p><strong>Empresa:</strong> {{ $contactMessage->company }}</p>
                @endif
                <p><strong>Email:</strong> <a href="mailto:{{ $contactMessage->email }}"
                        style="color: {{ env('SECONDARY_COLOR', '#19ac90') }};">{{ $contactMessage->email }}</a></p>
                @if ($contactMessage->phone)
                    <p><strong>Teléfono:</strong> {{ $contactMessage->phone }}</p>
                @endif
                <p><strong>Fecha:</strong> {{ $contactMessage->created_at->format('d/m/Y H:i') }}</p>
            </div>

            <div class="message-box">
                <h4>💬 Mensaje</h4>
                <p>{{ $contactMessage->message }}</p>
            </div>

            <p>Por favor, responde a este contacto a la brevedad.</p>

            <p><strong>¡Gracias!</strong></p>
        </div>

        <div class="footer">
            <p><strong>Central Norte</strong></p>
            <p>{{ env('COMPANY_EMAIL', 'info@centralnortesrl.com') }} | {{ env('COMPANY_PHONE', '+54 11 2479-7281') }}
            </p>
            <p style="margin-top: 15px;">Este es un mensaje automático de notificación del formulario de contacto.</p>
        </div>
    </div>
</body>

</html>
