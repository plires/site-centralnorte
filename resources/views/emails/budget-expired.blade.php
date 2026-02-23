{{-- resources/views/emails/budget-expired.blade.php --}}
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Presupuesto Vencido</title>
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

        .alert-box {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
        }

        .alert-box strong {
            color: #856404;
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

        .actions-list {
            background-color: #f8f9fa;
            padding: 15px 15px 15px 35px;
            border-radius: 6px;
            margin: 20px 0;
        }

        .actions-list li {
            margin: 10px 0;
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

        .note {
            font-style: italic;
            color: #666;
            margin-top: 20px;
        }
    </style>
</head>

<body>
    <div class="email-container">
        <div class="header">
            <img src="{{ asset(env('LOGO_PATH', '/images/logo-central-norte-email.png')) }}" alt="Central Norte"
                class="logo">
            <h1>❌ Presupuesto Vencido</h1>
        </div>

        <div class="content">
            <div class="alert-box">
                <strong>⚠️ Notificación de Vencimiento</strong>
                <p style="margin: 10px 0 0 0;">El siguiente presupuesto ha alcanzado su fecha de vencimiento:
                    <strong>{{ $budget->expiry_date_formatted }}</strong>
                </p>
            </div>

            <div class="budget-details">
                <h3>📋 Información del Presupuesto</h3>
                <p><strong>Título:</strong> {{ $budget->title }}</p>
                <p><strong>Fecha de emisión:</strong> {{ $budget->issue_date_formatted }}</p>
                <p><strong>Fecha de vencimiento:</strong> {{ $budget->expiry_date_formatted }}</p>
            </div>

            <div class="client-info">
                <h4>📋 Información del Cliente</h4>
                @if ($budget->client)
                    <p><strong>Cliente:</strong> {{ $budget->client->name }}</p>
                    @if ($budget->client->company)
                        <p><strong>Empresa:</strong> {{ $budget->client->company }}</p>
                    @endif
                    @if ($budget->client->email)
                        <p><strong>Email:</strong> {{ $budget->client->email }}</p>
                    @endif
                    @if ($budget->client->phone)
                        <p><strong>Teléfono:</strong> {{ $budget->client->phone }}</p>
                    @endif
                @else
                    <p
                        style="color: #856404; background-color: #fff3cd; padding: 8px 12px; border-radius: 4px; font-size: 13px;">
                        ⚠️ El cliente asociado a este presupuesto ya no se encuentra disponible en el sistema. Consultá
                        el dashboard para más detalles.
                    </p>
                @endif
            </div>

            <p><strong>Acciones sugeridas:</strong></p>
            <ul class="actions-list">
                <li>Contactar al cliente para evaluar su interés actual</li>
                <li>Crear un nuevo presupuesto actualizado si es necesario</li>
                <li>Revisar y actualizar precios según condiciones actuales</li>
                <li>Archivar este presupuesto si ya no es relevante</li>
                <li>Hacer seguimiento para futuras oportunidades comerciales</li>
            </ul>

            <div style="text-align: center;">
                <a href="{{ $dashboardUrl }}" class="button">Ver Presupuesto en Dashboard</a>
            </div>

            <p class="note">Nota: El cliente también ha sido notificado sobre el vencimiento del presupuesto.</p>
        </div>

        <div class="footer">
            <p><strong>Central Norte</strong></p>
            <p>{{ env('COMPANY_EMAIL', 'consultas@centralnortesrl.com') }} |
                {{ env('COMPANY_PHONE', '+54 11 7840-0401') }}
            </p>
            <p style="margin-top: 15px;">Este es un mensaje automático del sistema de gestión de presupuestos.</p>
        </div>
    </div>
</body>

</html>
