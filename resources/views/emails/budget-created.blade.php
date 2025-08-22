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
            padding: 20px;
        }

        .header {
            background-color: {{ $isResend ? '#fff3cd' : '#f8f9fa' }};
            padding: 20px;
            text-align: center;
            border-radius: 8px;
            margin-bottom: 20px;
            {{ $isResend ? 'border: 1px solid #ffeaa7;' : '' }}
        }

        .content {
            background-color: #fff;
            padding: 20px;
            border: 1px solid #e9ecef;
            border-radius: 8px;
        }

        .button {
            display: inline-block;
            background-color: #007bff;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }

        .budget-details {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
        }

        .footer {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            font-size: 14px;
            color: #666;
        }

        .resend-notice {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 12px;
            border-radius: 5px;
            margin-bottom: 20px;
            color: #856404;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>{{ $isResend ? '📤 Te reenviamos tu presupuesto' : '🎉 ¡Tienes un nuevo presupuesto!' }}</h1>
    </div>

    <div class="content">
        <h2>Estimado/a {{ $client->name }},</h2>

        <p>{{ $isResend ? 'Te reenviamos el presupuesto solicitado.' : 'Te enviamos el presupuesto que solicitaste.' }}
            A continuación encontrarás los detalles:</p>

        <div class="budget-details">
            <h3>{{ $budget->title }}</h3>
            <p><strong>Fecha de emisión:</strong> {{ $budget->issue_date->format('d/m/Y') }}</p>
            <p><strong>Válido hasta:</strong> {{ $budget->expiry_date->format('d/m/Y') }}</p>
            <p><strong>Total:</strong> ${{ number_format($budget->total, 2, ',', '.') }}</p>
            <p><strong>Vendedor:</strong> {{ $vendedor->name }}</p>
        </div>

        <p>Para ver los detalles completos del presupuesto, hacer clic en el siguiente enlace:</p>

        <div style="text-align: center;">
            <a href="{{ $publicUrl }}" class="button">Ver Presupuesto Completo</a>
        </div>

        <p>En la página del presupuesto podrás:</p>
        <ul>
            <li>Ver todos los productos incluidos con sus imágenes</li>
            <li>Seleccionar entre las diferentes opciones disponibles (si existen)</li>
            <li>Descargar una versión en PDF</li>
        </ul>

        <p>Si tienes alguna consulta o necesitas modificaciones, no dudes en contactarnos.</p>

        <p>¡Gracias por confiar en nosotros!</p>
    </div>

    <div class="footer">
        <p>Este es un email automático, por favor no responder a esta dirección.</p>
        <p>Para consultas, contacta directamente con {{ $vendedor->name }}.</p>
    </div>
</body>

</html>
