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
