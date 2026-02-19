{{-- resources/views/emails/budget-created.blade.php --}}
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $isResend ? 'Reenvío de Presupuesto' : 'Nuevo Presupuesto' }}</title>
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

        .resend-badge {
            display: inline-block;
            background-color: rgba(255, 255, 255, 0.2);
            padding: 5px 15px;
            border-radius: 20px;
            margin-top: 10px;
            font-size: 14px;
        }

        .content {
            padding: 30px;
        }

        .greeting {
            font-size: 18px;
            color: {{ env('PRIMARY_COLOR', '#3d5095') }};
            margin-bottom: 20px;
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

        .budget-details {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid {{ env('PRIMARY_COLOR', '#3d5095') }};
            margin: 20px 0;
        }

        .budget-details h3 {
            color: {{ env('PRIMARY_COLOR', '#3d5095') }};
            margin-top: 0;
        }

        .budget-details p {
            margin: 10px 0;
        }

        .total-amount {
            font-size: 20px;
            color: {{ env('SECONDARY_COLOR', '#19ac90') }};
            font-weight: bold;
        }

        .info-list {
            background-color: #f8f9fa;
            padding: 15px 15px 15px 35px;
            border-radius: 6px;
            margin: 20px 0;
        }

        .info-list li {
            margin: 8px 0;
        }

        .info-box {
            background-color: #e7f3ff;
            border-left: 4px solid {{ env('SECONDARY_COLOR', '#19ac90') }};
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
        }

        .info-box p {
            margin: 5px 0;
        }

        .info-box strong {
            color: {{ env('PRIMARY_COLOR', '#3d5095') }};
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

        .divider {
            height: 1px;
            background-color: #e9ecef;
            margin: 25px 0;
        }
    </style>
</head>

<body>
    <div class="email-container">
        <div class="header">
            <img src="{{ asset(env('LOGO_PATH', '/images/logo-central-norte-email.png')) }}" alt="Central Norte"
                class="logo">
            <h1>{{ $isResend ? '📤 Te reenviamos tu presupuesto' : '🎉 ¡Tienes un nuevo presupuesto!' }}</h1>
            @if ($isResend)
                <div class="resend-badge">Reenvío de presupuesto</div>
            @endif
        </div>

        <div class="content">
            <p class="greeting">Hola {{ $client->name }},</p>

            <p>{{ $isResend ? 'Te reenviamos el presupuesto solicitado.' : 'Te enviamos el presupuesto que solicitaste.' }}
                A continuación encontrarás los detalles:</p>

            <div class="budget-details">
                <h3>📋 Detalles del Presupuesto</h3>
                <p><strong>Presupuesto N°:</strong> {{ $budget->budget_merch_number }}</p>
                <p><strong>Título:</strong> {{ $budget->title }}</p>
                <p><strong>Fecha de emisión:</strong> {{ $budget->issue_date->format('d/m/Y') }}</p>
                <p><strong>Válido hasta:</strong> {{ $budget->expiry_date->format('d/m/Y') }}</p>
                <p><strong>Vendedor:</strong> {{ $vendedor->name }}</p>
                @if (is_object($vendedor) && $vendedor->email)
                    <p><strong>Email del vendedor:</strong>
                        <a href="mailto:{{ $vendedor->email }}"
                            style="color: {{ env('SECONDARY_COLOR', '#19ac90') }};">{{ $vendedor->email }}</a>
                    </p>
                @endif
                <p class="total-amount">Total: ${{ number_format($budget->total, 2, ',', '.') }}</p>
            </div>

            <p>Encontrarás el detalle completo en el PDF adjunto a este correo.</p>

            <p>Para ver los detalles completos del presupuesto, hacé clic en el siguiente enlace:</p>

            <div style="text-align: center;">
                <a href="{{ $publicUrl }}" class="button">Ver Presupuesto Completo</a>
            </div>

            <p>En la página del presupuesto podrás:</p>
            <ul class="info-list">
                <li>Ver todos los productos incluidos con sus imágenes</li>
                <li>Seleccionar entre las diferentes opciones disponibles (si existen)</li>
                <li>Descargar una versión en PDF</li>
                <li>Aprobar / evaluar el presupuesto</li>
            </ul>

            <div class="divider"></div>

            @if ($budget->footer_comments)
                <div class="info-box">
                    <p><strong>Notas:</strong></p>
                    <p>{{ $budget->footer_comments }}</p>
                </div>
            @endif

            <div class="divider"></div>

            @if (is_object($vendedor) && $vendedor->email)
                <p>Si tenés alguna pregunta, no dudes en contactar a tu vendedor en
                    <a href="mailto:{{ $vendedor->email }}"
                        style="color: {{ env('SECONDARY_COLOR', '#19ac90') }};">{{ $vendedor->email }}</a>.
                </p>
            @else
                <p>Si tenés alguna consulta o necesitás modificaciones, no dudes en contactarnos.</p>
            @endif

            <p style="text-align: center;"><strong>¡Gracias por confiar en nosotros!</strong></p>
        </div>

        <div class="footer">
            <p><strong>{{ env('COMPANY_NAME', 'Central Norte') }}</strong></p>
            <p>{{ env('COMPANY_EMAIL', 'info@centralnortesrl.com') }} | {{ env('COMPANY_PHONE', '+54 11 2479-7281') }}
            </p>
            <p style="margin-top: 15px;">Este es un email automático. Para consultas, contactá directamente con
                <a href="mailto:{{ $vendedor->email }}"
                    style="color: {{ env('PRIMARY_COLOR', '#3d5095') }};">{{ $vendedor->name }}</a>
            </p>
        </div>

    </div>
</body>

</html>
