{{-- resources/views/emails/budget-created.blade.php --}}
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nuevo Presupuesto</title>
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
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-radius: 8px;
            margin-bottom: 20px;
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
    </style>
</head>

<body>
    <div class="header">
        <h1>¡Tienes un nuevo presupuesto!</h1>
    </div>

    <div class="content">
        <h2>Estimado/a {{ $client->name }},</h2>

        <p>Te enviamos el presupuesto que solicitaste. A continuación encontrarás los detalles:</p>

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
            <li>Seleccionar entre las diferentes opciones disponibles</li>
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
    </style>
</head>

<body>
    <div class="header">
        <h1>⚠️ Presupuesto próximo a vencer</h1>
    </div>

    <div class="content">
        <h2>Estimado/a {{ $budget->user->name }},</h2>

        <div class="warning">
            <p><strong>¡Atención!</strong> El siguiente presupuesto vence en {{ $daysUntilExpiry }} días:</p>
            <h3>{{ $budget->title }}</h3>
            <p><strong>Cliente:</strong> {{ $budget->client->name }}</p>
            <p><strong>Fecha de vencimiento:</strong> {{ $budget->expiry_date->format('d/m/Y') }}</p>
            <p><strong>Total:</strong> ${{ number_format($budget->total, 2, ',', '.') }}</p>
        </div>

        <p>Te recomendamos:</p>
        <ul>
            <li>Contactar al cliente para confirmar su interés</li>
            <li>Extender la validez si es necesario</li>
            <li>Realizar el seguimiento correspondiente</li>
        </ul>

        <div style="text-align: center;">
            <a href="{{ route('dashboard.budgets.show', $budget) }}" class="button">Ver Presupuesto</a>
        </div>
    </div>
</body>

</html>

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
    </style>
</head>

<body>
    <div class="header">
        <h1>❌ Presupuesto vencido</h1>
    </div>

    <div class="content">
        <h2>Estimado/a {{ $budget->user->name }},</h2>

        <div class="expired">
            <p><strong>¡Importante!</strong> El siguiente presupuesto ha vencido hoy:</p>
            <h3>{{ $budget->title }}</h3>
            <p><strong>Cliente:</strong> {{ $budget->client->name }}</p>
            <p><strong>Fecha de vencimiento:</strong> {{ $budget->expiry_date->format('d/m/Y') }}</p>
            <p><strong>Total:</strong> ${{ number_format($budget->total, 2, ',', '.') }}</p>
        </div>

        <p>Acciones sugeridas:</p>
        <ul>
            <li>Contactar al cliente para evaluar su interés</li>
            <li>Crear un nuevo presupuesto actualizado si es necesario</li>
            <li>Archivar este presupuesto si ya no es relevante</li>
            <li>Hacer seguimiento para futuras oportunidades</li>
        </ul>

        <div style="text-align: center;">
            <a href="{{ route('dashboard.budgets.show', $budget) }}" class="button">Ver Presupuesto</a>
        </div>
    </div>
</body>

</html>
