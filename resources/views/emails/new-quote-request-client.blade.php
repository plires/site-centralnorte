{{-- resources/views/emails/new-quote-request-client.blade.php --}}
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recibimos tu solicitud de presupuesto</title>
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

        .header-badge {
            display: inline-block;
            background-color: rgba(255, 255, 255, 0.2);
            padding: 5px 15px;
            border-radius: 20px;
            margin-top: 10px;
            font-size: 14px;
        }

        .content {
            padding: 30px;
        }

        .greeting {
            font-size: 18px;
            color: {{ env('PRIMARY_COLOR', '#3d5095') }};
            margin-bottom: 20px;
        }

        .confirm-box {
            background-color: #d4edda;
            border-left: 4px solid #28a745;
            padding: 15px 18px;
            border-radius: 6px;
            margin: 20px 0;
        }

        .confirm-box strong {
            color: #155724;
        }

        .confirm-box p {
            margin: 6px 0 0;
            color: #155724;
            font-size: 14px;
        }

        .request-details {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid {{ env('PRIMARY_COLOR', '#3d5095') }};
            margin: 20px 0;
        }

        .request-details h3 {
            color: {{ env('PRIMARY_COLOR', '#3d5095') }};
            margin-top: 0;
            margin-bottom: 14px;
        }

        .request-details p {
            margin: 8px 0;
            font-size: 14px;
        }

        .products-section h3 {
            color: {{ env('PRIMARY_COLOR', '#3d5095') }};
        }

        .products-table {
            width: 100%;
            border-collapse: collapse;
            margin: 16px 0;
        }

        .products-table th {
            background-color: {{ env('PRIMARY_COLOR', '#3d5095') }};
            color: white;
            padding: 10px;
            text-align: left;
            font-size: 13px;
        }

        .products-table th:last-child {
            text-align: center;
        }

        .products-table td {
            padding: 10px;
            border-bottom: 1px solid #e9ecef;
            font-size: 13px;
        }

        .products-table td:last-child {
            text-align: center;
        }

        .products-table tr:nth-child(even) {
            background-color: #f8f9fa;
        }

        .comments-box {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            border-left: 4px solid #6c757d;
        }

        .comments-box h4 {
            color: #495057;
            margin-top: 0;
        }

        .what-happens-next {
            background-color: #e7f3ff;
            border-left: 4px solid {{ env('PRIMARY_COLOR', '#3d5095') }};
            padding: 18px 20px;
            border-radius: 6px;
            margin: 24px 0;
        }

        .what-happens-next h4 {
            color: {{ env('PRIMARY_COLOR', '#3d5095') }};
            margin-top: 0;
            margin-bottom: 12px;
        }

        .what-happens-next ol {
            margin: 0;
            padding-left: 20px;
        }

        .what-happens-next li {
            margin: 8px 0;
            font-size: 14px;
            color: #333;
        }

        .divider {
            height: 1px;
            background-color: #e9ecef;
            margin: 25px 0;
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

    </style>
</head>

<body>
    <div class="email-container">

        <div class="header">
            @if (env('LOGO_PATH'))
                <img src="{{ env('APP_URL') . env('LOGO_PATH') }}" alt="{{ env('COMPANY_NAME', 'Central Norte') }}"
                    class="logo">
            @endif
            <h1>¡Recibimos tu solicitud!</h1>
            <div class="header-badge">Confirmación de solicitud de presupuesto</div>
        </div>

        <div class="content">
            <p class="greeting">Hola {{ $client->name }},</p>

            <div class="confirm-box">
                <strong>✅ Tu solicitud de presupuesto fue recibida correctamente.</strong>
                <p>En breve,
                    @if (is_object($vendedor) && $vendedor->name)
                        <strong>{{ $vendedor->name }}</strong>
                    @else
                        tu vendedor asignado
                    @endif
                    revisará los productos que seleccionaste y te enviará el presupuesto final con los costos correspondientes.</p>
            </div>

            <div class="request-details">
                <h3>📋 Detalles de tu solicitud</h3>
                <p><strong>N° de solicitud:</strong> {{ $budget->budget_merch_number }}</p>
                <p><strong>Fecha:</strong> {{ $budget->issue_date->format('d/m/Y \a \l\a\s H:i') }} hs.</p>
                @if ($vendedor)
                    <p><strong>Vendedor asignado:</strong> {{ $vendedor->name }}</p>
                @endif
                @if ($client->company)
                    <p><strong>Empresa:</strong> {{ $client->company }}</p>
                @endif
            </div>

            <div class="products-section">
                <h3>🛒 Productos solicitados</h3>
                <table class="products-table">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Cantidad</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($items as $item)
                            @if ($item->product)
                                <tr>
                                    <td>
                                        <strong>{{ $item->product->name }}</strong>
                                    </td>
                                    <td>{{ $item->quantity }}</td>
                                </tr>
                            @endif
                        @endforeach
                    </tbody>
                </table>
            </div>

            @if ($budget->footer_comments)
                <div class="comments-box">
                    <h4>💬 Tu mensaje</h4>
                    <p>{{ $budget->footer_comments }}</p>
                </div>
            @endif

            <div class="divider"></div>

            <div class="what-happens-next">
                <h4>📌 ¿Qué sucede ahora?</h4>
                <ol>
                    <li>
                        @if (is_object($vendedor) && $vendedor->name)
                            <strong>{{ $vendedor->name }}</strong> revisará los productos que seleccionaste.
                        @else
                            Tu vendedor asignado revisará los productos que seleccionaste.
                        @endif
                    </li>
                    <li>Armará el presupuesto con los precios y tiempos de producción correspondientes.</li>
                    <li>Te lo enviará por correo electrónico para que lo puedas revisar y aprobar.</li>
                </ol>
            </div>

            <p style="font-size: 14px; color: #555;">
                Si tenés alguna consulta o querés modificar tu solicitud antes de recibir el presupuesto,
                no dudes en contactar a
                @if (is_object($vendedor) && $vendedor->email)
                    {{ $vendedor->name }} a
                    <a href="mailto:{{ $vendedor->email }}"
                        style="color: {{ env('SECONDARY_COLOR', '#19ac90') }};">{{ $vendedor->email }}</a>
                @else
                    <a href="mailto:{{ env('COMPANY_EMAIL', 'consultas@centralnortesrl.com') }}"
                        style="color: {{ env('SECONDARY_COLOR', '#19ac90') }};">{{ env('COMPANY_EMAIL', 'consultas@centralnortesrl.com') }}</a>
                @endif
                indicando tu N° de solicitud <strong>{{ $budget->budget_merch_number }}</strong>.
            </p>
        </div>

        <div class="footer">
            <p><strong>{{ env('COMPANY_NAME', 'Central Norte') }}</strong></p>
            <p>{{ env('COMPANY_EMAIL', 'consultas@centralnortesrl.com') }} |
                {{ env('COMPANY_PHONE', '+54 11 7840-0401') }}</p>
            <p style="margin-top: 15px;">Este es un email automático. Para consultas, contactá directamente con
                @if (is_object($vendedor) && $vendedor->email)
                    <a href="mailto:{{ $vendedor->email }}" style="color: {{ env('PRIMARY_COLOR', '#3d5095') }};">
                        {{ $vendedor->name }}
                    </a>
                @else
                    <a href="mailto:{{ env('COMPANY_EMAIL', 'consultas@centralnortesrl.com') }}"
                        style="color: {{ env('PRIMARY_COLOR', '#3d5095') }};">
                        {{ env('COMPANY_EMAIL', 'consultas@centralnortesrl.com') }}
                    </a>
                @endif
            </p>
        </div>

    </div>
</body>

</html>
