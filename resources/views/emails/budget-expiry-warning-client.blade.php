{{-- resources/views/emails/budget-expiry-warning-client.blade.php --}}
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Su Presupuesto Vence Pronto</title>
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

        .warning-box {
            background-color: #fff4e6;
            border-left: 4px solid #ff9800;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
        }

        .warning-box strong {
            color: #e65100;
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

        .contact-info {
            background-color: #e7f3ff;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
        }

        .contact-info h4 {
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
    </style>
</head>

<body>
    <div class="email-container">
        <div class="header">
            <img src="{{ asset(env('LOGO_PATH', '/images/product-placeholder.jpg')) }}" alt="Central Norte" class="logo">
            <h1>⏰ Su Presupuesto Vence Pronto</h1>
        </div>

        <div class="content">
            <p class="greeting">Estimado/a {{ $budget->client->name }},</p>

            <div class="warning-box">
                <strong>⏰ Recordatorio de Vencimiento</strong>
                <p style="margin: 10px 0 0 0;">Su presupuesto vencerá en <strong>{{ $warningDays }}</strong>
                    {{ $warningDays == 1 ? 'día' : 'días' }}</p>
            </div>

            <p>Le recordamos que su presupuesto está próximo a vencer. Para que pueda revisarlo y tomar una decisión,
                aquí están los detalles:</p>

            <div class="budget-details">
                <h3>📋 Detalles del Presupuesto</h3>
                <p><strong>Título:</strong> {{ $budget->title }}</p>
                <p><strong>Fecha de emisión:</strong> {{ $budget->issue_date_formatted }}</p>
                <p><strong>Fecha de vencimiento:</strong> {{ $budget->expiry_date_formatted }}</p>
                <p style="font-size: 18px; color: {{ env('SECONDARY_COLOR', '#19ac90') }};"><strong>Total:
                        ${{ number_format($budget->total, 2, ',', '.') }}</strong></p>
            </div>

            <p>Para ver el presupuesto completo y todos sus detalles, puede acceder haciendo clic en el siguiente
                enlace:</p>

            <div style="text-align: center;">
                <a href="{{ $publicUrl }}" class="button">Ver Presupuesto Completo</a>
            </div>

            <div class="contact-info">
                <h4>📞 Información de Contacto</h4>
                <p><strong>Su vendedor:</strong> {{ $vendedor->name }}</p>
                @if ($vendedor->email)
                    <p><strong>Email:</strong> <a href="mailto:{{ $vendedor->email }}"
                            style="color: {{ env('SECONDARY_COLOR', '#19ac90') }};">{{ $vendedor->email }}</a></p>
                @endif
                @if ($vendedor->phone)
                    <p><strong>Teléfono:</strong> {{ $vendedor->phone }}</p>
                @endif
            </div>

            @if($vendedor && $vendedor->email)
                <p>Si tiene alguna pregunta, no dude en contactar a su vendedor en
                    <a href="mailto:{{ $vendedor->email }}" style="color: {{ env('SECONDARY_COLOR', '#19ac90') }};">{{ $vendedor->email }}</a>.
                </p>
            @else
                <p>Si tiene alguna consulta o necesita modificaciones en el presupuesto, no dude en contactar a su vendedor.</p>
            @endif

            <p>Le recomendamos revisar el presupuesto antes de la fecha de vencimiento para aprovechar las condiciones
                ofrecidas.</p>
        </div>

        <div class="footer">
            <p><strong>Central Norte</strong></p>
            <p>{{ env('COMPANY_EMAIL', 'info@centralnortesrl.com') }} | {{ env('COMPANY_PHONE', '+54 11 2479-7281') }}
            </p>
            <p style="margin-top: 15px;">Este es un mensaje automático para recordarle sobre el vencimiento de su
                presupuesto.</p>
        </div>
    </div>
</body>

</html>
