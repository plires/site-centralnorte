{{-- resources/views/emails/budget-expiry-warning.blade.php --}}
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Presupuesto próximo a vencer</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            background-color: #fff3cd;
            padding: 20px;
            text-align: center;
            border-radius: 8px;
            margin-bottom: 20px;
            border: 1px solid #ffeaa7;
        }

        .content {
            background-color: #fff;
            padding: 20px;
            border: 1px solid #e9ecef;
            border-radius: 8px;
        }

        .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
        }

        .button {
            display: inline-block;
            background-color: #ffc107;
            color: #212529;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }

        .client-info {
            background-color: #e9ecef;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>⚠️ Presupuesto próximo a vencer</h1>
    </div>

    <div class="content">
        <h2>Estimado/a {{ $budget->user->name }},</h2>

        <div class="warning">
            <p><strong>¡Atención!</strong> El siguiente presupuesto vencerá en {{ $daysUntilExpiry }}
                {{ $daysUntilExpiry == 1 ? 'día' : 'días' }}:</p>

            <h3>{{ $budget->title }}</h3>
            <p><strong>Fecha de vencimiento:</strong> {{ $budget->expiry_date_formatted }}</p>
            <p><strong>Total:</strong> ${{ number_format($budget->total, 2, ',', '.') }}</p>
        </div>

        <div class="client-info">
            <h4>📋 Información del Cliente</h4>
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
        </div>

        <p><strong>Acciones recomendadas:</strong></p>
        <ul>
            <li>Contactar al cliente para confirmar su interés</li>
            <li>Extender la validez del presupuesto si es necesario</li>
            <li>Realizar el seguimiento comercial correspondiente</li>
            <li>Considerar actualizar precios si han cambiado</li>
        </ul>

        <div style="text-align: center;">
            <a href="{{ $dashboardUrl }}" class="button">Ver Presupuesto en Dashboard</a>
        </div>

        <p><em>Nota: El cliente también recibirá una notificación automática sobre el próximo vencimiento.</em></p>
    </div>
</body>

</html>
