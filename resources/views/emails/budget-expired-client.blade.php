{{-- resources/views/emails/budget-expired-client.blade.php --}}
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

        .greeting {
            font-size: 18px;
            color: {{ env('PRIMARY_COLOR', '#3d5095') }};
            margin-bottom: 20px;
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

        .next-steps {
            background-color: #e7f3ff;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
        }

        .next-steps h4 {
            color: {{ env('PRIMARY_COLOR', '#3d5095') }};
            margin-top: 0;
        }

        .next-steps ul {
            margin: 10px 0;
        }

        .next-steps li {
            margin: 8px 0;
        }

        .contact-info {
            background-color: #f8f9fa;
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
            <img src="{{ asset(env('LOGO_PATH', '/images/logo-central-norte-email.png')) }}" alt="Central Norte"
                class="logo">
            <h1>❌ Su Presupuesto ha Vencido</h1>
        </div>

        <div class="content">
            <p class="greeting">Estimado/a {{ $budget->client->name }},</p>

            <div class="alert-box">
                <strong>⚠️ Presupuesto Vencido</strong>
                <p style="margin: 10px 0 0 0;">Le informamos que su presupuesto ha alcanzado su fecha de vencimiento el
                    <strong>{{ $budget->expiry_date_formatted }}</strong>
                </p>
            </div>

            <p>Aunque el presupuesto ya no está vigente con las condiciones originales, aún puede revisar los detalles:
            </p>

            <div class="budget-details">
                <h3>📋 Detalles del Presupuesto Vencido</h3>
                <p><strong>Título:</strong> {{ $budget->title }}</p>
                <p><strong>Fecha de emisión:</strong> {{ $budget->issue_date_formatted }}</p>
                <p><strong>Fecha de vencimiento:</strong> {{ $budget->expiry_date_formatted }}</p>
                <p><strong>Total:</strong> ${{ number_format($budget->total, 2, ',', '.') }}</p>
            </div>

            <div class="next-steps">
                <h4>🔄 ¿Qué puede hacer ahora?</h4>
                <ul>
                    <li><strong>Solicitar renovación:</strong> Contacte a su vendedor para obtener un nuevo presupuesto
                        con precios actualizados.</li>
                    <li><strong>Consultar disponibilidad:</strong> Los productos y precios pueden haber cambiado desde
                        la emisión original.</li>
                    <li><strong>Revisar condiciones:</strong> Es posible que se apliquen nuevas condiciones comerciales.
                    </li>
                </ul>
            </div>

            <div class="contact-info">
                <h4>📞 Contacte a su Vendedor</h4>
                <p><strong>Vendedor:</strong> {{ $vendedor->name }}</p>
                @if ($vendedor->email)
                    <p><strong>Email:</strong> <a href="mailto:{{ $vendedor->email }}"
                            style="color: {{ env('SECONDARY_COLOR', '#19ac90') }};">{{ $vendedor->email }}</a></p>
                @endif
                @if ($vendedor->phone)
                    <p><strong>Teléfono:</strong> {{ $vendedor->phone }}</p>
                @endif
            </div>

            <div style="text-align: center;">
                <a href="mailto:{{ $vendedor->email }}?subject=Consulta sobre presupuesto vencido: {{ $budget->title }}"
                    class="button">Contactar Vendedor</a>
            </div>

            @if ($vendedor && $vendedor->email)
                <p>Si tiene alguna pregunta, no dude en contactar a su vendedor en
                    <a href="mailto:{{ $vendedor->email }}"
                        style="color: {{ env('SECONDARY_COLOR', '#19ac90') }};">{{ $vendedor->email }}</a>.
                </p>
            @endif
            <p>Nuestro equipo estará encantado de ayudarle a generar un nuevo presupuesto actualizado con las mejores
                condiciones disponibles.</p>

            <p><strong>Gracias por su interés en nuestros productos y servicios.</strong></p>
        </div>

        <div class="footer">
            <p><strong>Central Norte</strong></p>
            <p>{{ env('COMPANY_EMAIL', 'info@centralnortesrl.com') }} | {{ env('COMPANY_PHONE', '+54 11 2479-7281') }}
            </p>
            <p style="margin-top: 15px;">Este es un mensaje automático para informarle sobre el vencimiento de su
                presupuesto.</p>
        </div>
    </div>
</body>

</html>
