<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Presupuesto de Picking</title>
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
            background-color: #2563eb;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }

        .content {
            background-color: #f9fafb;
            padding: 30px;
            border-radius: 0 0 8px 8px;
        }

        .info-box {
            background-color: white;
            border-left: 4px solid #2563eb;
            padding: 15px;
            margin: 20px 0;
        }

        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }

        .button {
            display: inline-block;
            background-color: #2563eb;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin-top: 20px;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1 style="margin: 0;">Central Norte</h1>
        <p style="margin: 5px 0 0 0;">Presupuesto de Picking</p>
    </div>

    <div class="content">
        <h2>¡Hola {{ $budget->client->name }}!</h2>

        <p>Gracias por tu interés en nuestros servicios de armado de kits y picking.</p>

        <p>Te enviamos el presupuesto <strong>{{ $budget->budget_number }}</strong> con el detalle de los servicios
            solicitados.</p>

        <div class="info-box">
            <h3 style="margin-top: 0;">Resumen del Presupuesto</h3>
            <p><strong>Cantidad de kits:</strong> {{ number_format($budget->total_kits, 0, ',', '.') }}</p>
            <p><strong>Componentes por kit:</strong> {{ $budget->total_components_per_kit }}</p>
            <p><strong>Tiempo de producción:</strong> {{ $budget->production_time }}</p>
            <p style="font-size: 18px; color: #2563eb; margin-bottom: 0;">
                <strong>Total: ${{ number_format($budget->total, 2, ',', '.') }}</strong>
            </p>
        </div>

        <p>Encontrarás el detalle completo en el PDF adjunto a este correo.</p>

        <p><strong>Validez del presupuesto:</strong> {{ $budget->valid_until->format('d/m/Y') }}</p>

        @if ($budget->notes)
            <div class="info-box" style="border-left-color: #10b981;">
                <p style="margin: 0;"><strong>Notas:</strong></p>
                <p style="margin: 10px 0 0 0;">{{ $budget->notes }}</p>
            </div>
        @endif

        <p>Si tenés alguna consulta o necesitás modificar algo del presupuesto, no dudes en contactarnos.</p>

        <p>Saludos cordiales,<br>
            <strong>Equipo de Central Norte</strong>
        </p>
    </div>

    <div class="footer">
        <p><strong>Central Norte</strong></p>
        <p>Email: contacto@centralnorte.com | Tel: (011) 1234-5678</p>
        <p style="font-size: 12px; color: #9ca3af; margin-top: 15px;">
            Este es un correo automático, por favor no responder directamente a este mensaje.
        </p>
    </div>
</body>

</html>
