{{-- resources/views/emails/budget-expired.blade.php --}}
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Presupuesto vencido</title>
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
            background-color: #f8d7da;
            padding: 20px;
            text-align: center;
            border-radius: 8px;
            margin-bottom: 20px;
            border: 1px solid #f5c6cb;
        }

        .content {
            background-color: #fff;
            padding: 20px;
            border: 1px solid #e9ecef;
            border-radius: 8px;
        }

        .expired {
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
        }

        .button {
            display: inline-block;
            background-color: #dc3545;
            color: white;
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
        <h1>❌ Presupuesto vencido</h1>
    </div>

    <div class="content">
        <h2>Estimado/a {{ $budget->user->name }},</h2>

        <div class="expired">
            <p><strong>¡Importante!</strong> El siguiente presupuesto ha vencido el
                {{ $budget->expiry_date_formatted }}:</p>

            <h3>{{ $budget->title }}</h3>
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

        <p><strong>Acciones sugeridas:</strong></p>
        <ul>
            <li>Contactar al cliente para evaluar su interés actual</li>
            <li>Crear un nuevo presupuesto actualizado si es necesario</li>
            <li>Revisar y actualizar precios según condiciones actuales</li>
            <li>Archivar este presupuesto si ya no es relevante</li>
            <li>Hacer seguimiento para futuras oportunidades comerciales</li>
        </ul>

        <div style="text-align: center;">
            <a href="{{ $dashboardUrl }}" class="button">Ver Presupuesto en Dashboard</a>
        </div>

        <p><em>Nota: El cliente también ha sido notificado sobre el vencimiento del presupuesto.</em></p>
    </div>
</body>

</html>
