{{-- resources/views/emails/picking-budget-sent.blade.php --}}
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Presupuesto de Picking</title>
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

        .budget-details p {
            margin: 10px 0;
        }

        .total-amount {
            font-size: 20px;
            color: {{ env('SECONDARY_COLOR', '#19ac90') }};
            font-weight: bold;
            margin-top: 15px;
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

        .info-list {
            background-color: #f8f9fa;
            padding: 15px 15px 15px 35px;
            border-radius: 6px;
            margin: 20px 0;
        }

        .info-list li {
            margin: 8px 0;
        }

        .info-box {
            background-color: #e7f3ff;
            border-left: 4px solid {{ env('SECONDARY_COLOR', '#19ac90') }};
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
        }

        .info-box p {
            margin: 5px 0;
        }

        .info-box strong {
            color: {{ env('PRIMARY_COLOR', '#3d5095') }};
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

        .footer strong {
            color: {{ env('PRIMARY_COLOR', '#3d5095') }};
        }

        .divider {
            height: 1px;
            background-color: #e9ecef;
            margin: 25px 0;
        }
    </style>
</head>

<body>
    <div class="email-container">
        <div class="header">
            <img src="{{ asset(env('LOGO_PATH', '/images/logo-central-norte-email.png')) }}" alt="Central Norte"
                class="logo">
            <h1>📦 Presupuesto de Picking/Armado de Kit</h1>
        </div>

        <div class="content">
            <p class="greeting">Hola {{ $budget->client->name }},</p>

            <p>Te enviamos el presupuesto de <strong>Picking/Armado de Kit</strong> que solicitaste.</p>

            <div class="budget-details">
                <h3>📋 Detalles del Presupuesto</h3>
                <p><strong>Presupuesto N°:</strong> {{ $budget->budget_number }}</p>
                <p><strong>Título:</strong> {{ $budget->title }}</p>
                <p><strong>Fecha de emisión:</strong> {{ $budget->created_at->format('d/m/Y') }}</p>
                <p><strong>Válido hasta:</strong> {{ $budget->valid_until->format('d/m/Y') }}</p>
                @if (is_object($vendedor) && $vendedor->name)
                    <p><strong>Vendedor:</strong> {{ $vendedor->name }}</p>
                @endif
                @if (is_object($vendedor) && $vendedor->email)
                    <p><strong>Email del vendedor:</strong>
                        <a href="mailto:{{ $vendedor->email }}"
                            style="color: {{ env('SECONDARY_COLOR', '#19ac90') }};">{{ $vendedor->email }}</a>
                    </p>
                @endif
                <p><strong>Cantidad de kits:</strong> {{ number_format($budget->total_kits) }}</p>
                <p><strong>Componentes por kit:</strong> {{ $budget->total_components_per_kit }}</p>
                <p><strong>Tiempo de producción:</strong> {{ $budget->production_time }}</p>
                <p class="total-amount">Total: ${{ number_format($budget->total, 2, ',', '.') }}</p>
                <p class="total-amount">Precio por kit: ${{ number_format($budget->unit_price_per_kit, 2, ',', '.') }}
                </p>
            </div>

            <p>Encontrarás el detalle completo en el PDF adjunto a este correo.</p>

            <p>Para ver los detalles completos del presupuesto, hacé clic en el siguiente enlace:</p>

            <div style="text-align: center;">
                <a href="{{ $publicUrl }}" class="button">Ver Presupuesto Completo</a>
            </div>

            <p>En la página del presupuesto podrás:</p>
            <ul class="info-list">
                <li>Ver todos los productos incluidos con sus imágenes</li>
                <li>Descargar una versión en PDF</li>
                <li>Aprobar / evaluar el presupuesto</li>
            </ul>

            <div class="divider"></div>

            @if ($budget->notes)
                <div class="info-box">
                    <p><strong>Notas:</strong></p>
                    <p>{{ $budget->notes }}</p>
                </div>
            @endif

            @if (is_object($vendedor) && $vendedor->email)
                <p>Si tenés alguna pregunta, no dudes en contactar a tu vendedor en
                    <a href="mailto:{{ $vendedor->email }}"
                        style="color: {{ env('SECONDARY_COLOR', '#19ac90') }};">{{ $vendedor->email }}</a>.
                </p>
            @else
                <p>Si tenés alguna consulta o necesitás modificaciones, no dudes en contactarnos -
                    <a href="mailto:{{ env('COMPANY_EMAIL', 'consultas@centralnortesrl.com') }}"
                        style="color: {{ env('PRIMARY_COLOR', '#3d5095') }};">{{ env('COMPANY_EMAIL', 'consultas@centralnortesrl.com') }}</a>.
                </p>
            @endif

            <p style="text-align: center;"><strong>¡Gracias por confiar en nosotros!</strong></p>

        </div>

        <div class="footer">
            <p><strong>{{ env('COMPANY_NAME', 'Central Norte') }}</strong></p>
            <p>{{ env('COMPANY_EMAIL', 'consultas@centralnortesrl.com') }} |
                {{ env('COMPANY_PHONE', '+54 11 7840-0401') }}
            </p>
            <p style="margin-top: 15px;">Este es un email automático. Para consultas, contactá directamente con
                @if (is_object($vendedor) && $vendedor->email)
                    <a href="mailto:{{ $vendedor->email }}"
                        style="color: {{ env('PRIMARY_COLOR', '#3d5095') }};">{{ $vendedor->name }}</a>
                @else
                    <a href="mailto:{{ env('COMPANY_EMAIL', 'consultas@centralnortesrl.com') }}"
                        style="color: {{ env('PRIMARY_COLOR', '#3d5095') }};">{{ env('COMPANY_EMAIL', 'consultas@centralnortesrl.com') }}</a>
                @endif
            </p>
        </div>
    </div>
</body>

</html>
