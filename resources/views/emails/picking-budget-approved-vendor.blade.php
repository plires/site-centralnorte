{{-- resources/views/emails/picking-budget-approved-vendor.blade.php --}}
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Presupuesto de Picking Aprobado por el Cliente</title>
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

        .success-box {
            background-color: #d4edda;
            border-left: 4px solid #28a745;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
        }

        .success-box strong {
            color: #155724;
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

        .next-steps {
            background-color: #fff8e1;
            border-left: 4px solid #ffc107;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
        }

        .next-steps h4 {
            color: #f57c00;
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
            <h1>¡Presupuesto de Picking Aprobado! ✅</h1>
        </div>

        <div class="content">
            <p class="greeting">Hola {{ $vendedor->name }},</p>

            <div class="success-box">
                <strong>¡Excelente noticia!</strong>
                <p>El cliente ha aprobado el presupuesto de picking que le enviaste.</p>
            </div>

            <div class="budget-details">
                <h3>📦 Detalles del Presupuesto de Picking</h3>
                <p><strong>Número:</strong> #{{ $budget->budget_number }}</p>
                <p><strong>Fecha de emisión:</strong> {{ $budget->issue_date_formatted }}</p>
                <p><strong>Fecha de vencimiento:</strong> {{ $budget->expiry_date_formatted }}</p>
                <p><strong>Monto total:</strong> ${{ number_format($budget->total, 2, ',', '.') }}</p>
            </div>

            <div class="client-info">
                <h4>👤 Información del Cliente</h4>
                @if ($budget->client)
                    <p><strong>Nombre:</strong> {{ $budget->client->name }}</p>
                    @if ($budget->client->company)
                        <p><strong>Empresa:</strong> {{ $budget->client->company }}</p>
                    @endif
                    <p><strong>Email:</strong> <a href="mailto:{{ $budget->client->email }}"
                            style="color: {{ env('SECONDARY_COLOR', '#19ac90') }};">{{ $budget->client->email }}</a></p>
                    @if ($budget->client->phone)
                        <p><strong>Teléfono:</strong> {{ $budget->client->phone }}</p>
                    @endif
                @else
                    <p style="color: #856404; background-color: #fff3cd; padding: 8px 12px; border-radius: 4px; font-size: 13px;">
                        ⚠️ El cliente asociado a este presupuesto ya no se encuentra disponible en el sistema. Consultá el dashboard para más detalles.
                    </p>
                @endif
            </div>

            <div class="next-steps">
                <h4>📌 Próximos Pasos</h4>
                <ul>
                    <li>Contacta al cliente para coordinar los detalles del servicio de picking</li>
                    <li>Confirma las fechas de recolección y entrega</li>
                    <li>Prepara el material necesario para el armado de kits</li>
                    <li>Mantén al cliente informado sobre el progreso del servicio</li>
                </ul>
            </div>

            <div style="text-align: center;">
                <a href="{{ $dashboardUrl }}" class="button">Ver en Dashboard</a>
            </div>

            <p>¡Felicitaciones por cerrar este servicio! Ahora puedes proceder con la coordinación y ejecución del
                picking.</p>

            <p><strong>¡Éxito con este proyecto!</strong></p>
        </div>

        <div class="footer">
            <p><strong>Central Norte</strong></p>
            <p>{{ env('COMPANY_EMAIL', 'consultas@centralnortesrl.com') }} |
                {{ env('COMPANY_PHONE', '+54 11 7840-0401') }}
            </p>
            <p style="margin-top: 15px;">Este es un mensaje automático de notificación sobre la aprobación del
                presupuesto de picking.</p>
        </div>
    </div>
</body>

</html>
