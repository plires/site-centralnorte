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
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-radius: 8px;
            margin-bottom: 30px;
        }

        .alert-warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }

        .budget-details {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }

        .btn {
            display: inline-block;
            padding: 12px 24px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 0;
        }

        .btn:hover {
            background-color: #0056b3;
        }

        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
        }

        .contact-info {
            background-color: #e9ecef;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>⏰ Su presupuesto vence pronto</h1>
    </div>

    <p>Estimado/a <strong>{{ $budget->client->name }}</strong>,</p>

    <div class="alert-warning">
        <strong>¡Atención!</strong> Su presupuesto vencerá en {{ $warningDays }}
        {{ $warningDays == 1 ? 'día' : 'días' }}.
    </div>

    <p>Le recordamos que su presupuesto está próximo a vencer. Para que pueda revisarlo y tomar una decisión, aquí están
        los detalles:</p>

    <div class="budget-details">
        <h3>📋 Detalles del Presupuesto</h3>
        <p><strong>Título:</strong> {{ $budget->title }}</p>
        <p><strong>Fecha de emisión:</strong> {{ $budget->issue_date_formatted }}</p>
        <p><strong>Fecha de vencimiento:</strong> {{ $budget->expiry_date_formatted }}</p>
        <p><strong>Total:</strong> ${{ number_format($budget->total, 2, ',', '.') }}</p>
    </div>

    <p>Para ver el presupuesto completo y todos sus detalles, puede acceder haciendo clic en el siguiente enlace:</p>

    <div style="text-align: center; margin: 30px 0;">
        <a href="{{ $publicUrl }}" class="btn">Ver Presupuesto Completo</a>
    </div>

    <div class="contact-info">
        <h4>📞 Información de Contacto</h4>
        <p><strong>Su vendedor:</strong> {{ $vendedor->name }}</p>
        @if ($vendedor->email)
            <p><strong>Email:</strong> <a href="mailto:{{ $vendedor->email }}">{{ $vendedor->email }}</a></p>
        @endif
        @if ($vendedor->phone)
            <p><strong>Teléfono:</strong> {{ $vendedor->phone }}</p>
        @endif
    </div>

    <p>Si tiene alguna consulta o necesita modificaciones en el presupuesto, no dude en contactar a su vendedor.</p>

    <p>Le recomendamos revisar el presupuesto antes de la fecha de vencimiento para aprovechar las condiciones
        ofrecidas.</p>

    <div class="footer">
        <p>Este es un mensaje automático para recordarle sobre el vencimiento de su presupuesto.</p>
        <p>Si ya ha procesado este presupuesto, puede ignorar este mensaje.</p>
    </div>
</body>

</html>
