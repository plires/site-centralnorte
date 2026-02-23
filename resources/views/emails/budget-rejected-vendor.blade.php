{{-- resources/views/emails/budget-rejected-vendor.blade.php --}}
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Presupuesto Rechazado por el Cliente</title>
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

        .alert-box {
            background-color: #f8d7da;
            border-left: 4px solid #dc3545;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
        }

        .alert-box strong {
            color: #721c24;
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

        .client-info {
            background-color: #e7f3ff;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
        }

        .client-info h4 {
            color: {{ env('PRIMARY_COLOR', '#3d5095') }};
            margin-top: 0;
        }

        .client-info p {
            margin: 5px 0;
        }

        .rejection-reason {
            background-color: #fff8e1;
            border-left: 4px solid #ff9800;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
        }

        .rejection-reason h4 {
            color: #e65100;
            margin-top: 0;
        }

        .rejection-reason p {
            margin: 5px 0;
            font-style: italic;
        }

        .next-steps {
            background-color: #e7f3ff;
            border-left: 4px solid {{ env('SECONDARY_COLOR', '#19ac90') }};
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
        }

        .next-steps h4 {
            color: {{ env('PRIMARY_COLOR', '#3d5095') }};
            margin-top: 0;
        }

        .next-steps ul {
            margin: 10px 0;
            padding-left: 20px;
        }

        .next-steps li {
            margin: 8px 0;
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
            <h1>Presupuesto Rechazado</h1>
        </div>

        <div class="content">
            <p class="greeting">Hola {{ $vendedor->name }},</p>

            <div class="alert-box">
                <strong>Notificación:</strong>
                <p>El cliente ha rechazado el presupuesto que le enviaste.</p>
            </div>

            <div class="budget-details">
                <h3>📋 Detalles del Presupuesto</h3>
                <p><strong>Título:</strong> {{ $budget->title }}</p>
                <p><strong>Fecha de emisión:</strong> {{ $budget->issue_date_formatted }}</p>
                <p><strong>Fecha de vencimiento:</strong> {{ $budget->expiry_date_formatted }}</p>
                <p><strong>Monto total:</strong> ${{ number_format($budget->total, 2, ',', '.') }}</p>
            </div>

            <div class="client-info">
                <h4>👤 Información del Cliente</h4>
                <p><strong>Nombre:</strong> {{ $budget->client->name }}</p>
                @if ($budget->client->company)
                    <p><strong>Empresa:</strong> {{ $budget->client->company }}</p>
                @endif
                <p><strong>Email:</strong> <a href="mailto:{{ $budget->client->email }}"
                        style="color: {{ env('SECONDARY_COLOR', '#19ac90') }};">{{ $budget->client->email }}</a></p>
                @if ($budget->client->phone)
                    <p><strong>Teléfono:</strong> {{ $budget->client->phone }}</p>
                @endif
            </div>

            @if (!empty($rejectionReason))
                <div class="rejection-reason">
                    <h4>💬 Motivo del Rechazo</h4>
                    <p>"{{ $rejectionReason }}"</p>
                </div>
            @endif

            <div class="next-steps">
                <h4>📌 Próximos Pasos Sugeridos</h4>
                <ul>
                    <li>Contacta al cliente para entender mejor sus necesidades</li>
                    <li>Revisa si es posible ajustar la propuesta o los precios</li>
                    <li>Considera ofrecer alternativas o productos similares</li>
                    <li>Mantén la comunicación abierta para futuras oportunidades</li>
                </ul>
            </div>

            <div style="text-align: center;">
                <a href="{{ $dashboardUrl }}" class="button">Ver en Dashboard</a>
            </div>

            <p>Este rechazo es una oportunidad para comprender mejor las necesidades del cliente y mejorar futuras
                propuestas.</p>

            <p><strong>¡No te desanimes! Cada feedback es una oportunidad de aprendizaje.</strong></p>
        </div>

        <div class="footer">
            <p><strong>Central Norte</strong></p>
            <p>{{ env('COMPANY_EMAIL', 'consultas@centralnortesrl.com') }} |
                {{ env('COMPANY_PHONE', '+54 11 7840-0401') }}
            </p>
            <p style="margin-top: 15px;">Este es un mensaje automático de notificación sobre el rechazo del
                presupuesto.</p>
        </div>
    </div>
</body>

</html>
