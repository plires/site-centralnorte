{{-- resources/views/emails/new-quote-request.blade.php --}}
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nueva Solicitud de Presupuesto</title>
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

        .new-badge {
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

        .client-info {
            background-color: #e7f3ff;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid {{ env('PRIMARY_COLOR', '#3d5095') }};
            margin: 20px 0;
        }

        .client-info h3 {
            color: {{ env('PRIMARY_COLOR', '#3d5095') }};
            margin-top: 0;
        }

        .client-info p {
            margin: 8px 0;
        }

        .budget-details {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid {{ env('SECONDARY_COLOR', '#19ac90') }};
            margin: 20px 0;
        }

        .budget-details h3 {
            color: {{ env('SECONDARY_COLOR', '#19ac90') }};
            margin-top: 0;
        }

        .products-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }

        .products-table th {
            background-color: {{ env('PRIMARY_COLOR', '#3d5095') }};
            color: white;
            padding: 10px;
            text-align: left;
            font-size: 13px;
        }

        .products-table td {
            padding: 10px;
            border-bottom: 1px solid #e9ecef;
            font-size: 13px;
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

        .next-steps {
            background-color: #d4edda;
            border-left: 4px solid #28a745;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
        }

        .next-steps h4 {
            color: #155724;
            margin-top: 0;
        }

        .next-steps ul {
            margin: 10px 0;
            padding-left: 20px;
        }

        .next-steps li {
            margin: 8px 0;
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
            @if (env('LOGO_PATH'))
                <img src="{{ env('APP_URL') . env('LOGO_PATH') }}" alt="Central Norte" class="logo">
            @endif
            <h1>Nueva Solicitud de Presupuesto</h1>
            <div class="new-badge">Desde el sitio web</div>
        </div>

        <div class="content">
            <p class="greeting">Hola {{ $vendedor->name }},</p>

            <div class="alert-box">
                <strong>Se te ha asignado una nueva solicitud de presupuesto.</strong>
                <p>Un cliente ha solicitado un presupuesto a través del sitio web y te fue asignado automáticamente.</p>
            </div>

            <div class="client-info">
                <h3>👤 Datos del Cliente</h3>
                <p><strong>Nombre:</strong> {{ $client->name }}</p>
                @if ($client->company)
                    <p><strong>Empresa:</strong> {{ $client->company }}</p>
                @endif
                <p><strong>Email:</strong> <a href="mailto:{{ $client->email }}"
                        style="color: {{ env('SECONDARY_COLOR', '#19ac90') }};">{{ $client->email }}</a></p>
                @if ($client->phone)
                    <p><strong>Teléfono:</strong> {{ $client->phone }}</p>
                @endif
                @if ($client->address)
                    <p><strong>Dirección:</strong> {{ $client->address }}</p>
                @endif
            </div>

            <div class="budget-details">
                <h3>📋 Detalles del Presupuesto</h3>
                <p><strong>N° de Presupuesto:</strong> {{ $budget->budget_merch_number }}</p>
                <p><strong>Título:</strong> {{ $budget->title }}</p>
                <p><strong>Fecha de solicitud:</strong> {{ $budget->issue_date->format('d/m/Y H:i') }}</p>
                <p><strong>Válido hasta:</strong> {{ $budget->expiry_date->format('d/m/Y') }}</p>
            </div>

            <h3 style="color: {{ env('PRIMARY_COLOR', '#3d5095') }};">🛒 Productos Solicitados</h3>

            <table class="products-table">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Variante</th>
                        <th style="text-align: center;">Cantidad</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($items as $item)
                        <tr>
                            <td>
                                <strong>{{ $item->product->name ?? 'Producto' }}</strong>
                                @if ($item->product?->sku)
                                    <br><small style="color: #6c757d;">SKU: {{ $item->product->sku }}</small>
                                @endif
                            </td>
                            <td>
                                @if ($item->productVariant)
                                    {{ $item->productVariant->description ?? '-' }}
                                    @if ($item->productVariant->sku)
                                        <br><small style="color: #6c757d;">{{ $item->productVariant->sku }}</small>
                                    @endif
                                @else
                                    -
                                @endif
                            </td>
                            <td style="text-align: center;">{{ $item->quantity }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>

            @if ($budget->footer_comments)
                <div class="comments-box">
                    <h4>💬 Comentarios del Cliente</h4>
                    <p>{{ $budget->footer_comments }}</p>
                </div>
            @endif

            <div class="divider"></div>

            <div class="next-steps">
                <h4>📌 Próximos Pasos</h4>
                <ul>
                    <li>Revisar los productos solicitados y verificar disponibilidad</li>
                    <li>Asignar precios a cada producto en el presupuesto</li>
                    <li>Agregar tiempos de producción si corresponde</li>
                    <li>Enviar el presupuesto al cliente desde el dashboard</li>
                </ul>
            </div>

            <div style="text-align: center;">
                <a href="{{ $dashboardUrl }}" class="button">Ver y Completar Presupuesto</a>
            </div>

            <p style="text-align: center;">Accedé al dashboard para revisar y completar el presupuesto antes de enviarlo
                al cliente.</p>
        </div>

        <div class="footer">
            <p><strong>{{ env('COMPANY_NAME', 'Central Norte') }}</strong></p>
            <p>{{ env('COMPANY_EMAIL', 'consultas@centralnortesrl.com') }} |
                {{ env('COMPANY_PHONE', '+54 11 7840-0401') }}</p>
            <p style="margin-top: 15px;">Este es un mensaje automático del sistema de cotizaciones web.</p>
        </div>
    </div>
</body>

</html>
