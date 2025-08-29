<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Presupuesto {{ $budget['title'] }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            margin: 0;
            padding: 0;
            color: #333;
        }

        /* Header Institucional */
        .institutional-header {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            background-color: #f8f9fa;
            border: 2px solid #3d5095;
        }

        .institutional-header td {
            padding: 15px;
            vertical-align: top;
        }

        .company-logo {
            width: 80px;
            text-align: center;
            border-right: 1px solid #ddd;
            vertical-align: middle;
            padding: 10px;
        }

        .company-logo img {
            display: block;
            margin: 0 auto;
            max-width: 60px;
            max-height: 60px;
            object-fit: contain;
        }

        .company-logo-placeholder {
            width: 60px;
            height: 60px;
            background-color: #e9ecef;
            border: 2px solid #3d5095;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 9px;
            color: #3d5095;
            font-weight: bold;
            text-align: center;
            margin: 0 auto;
        }

        .company-info {
            font-weight: bold;
        }

        .company-name {
            font-size: 18px;
            color: #3d5095;
            margin-bottom: 8px;
        }

        .company-tagline {
            font-size: 12px;
            color: #666;
            font-style: italic;
            margin-bottom: 8px;
        }

        .company-contact {
            font-size: 10px;
            color: #555;
            line-height: 1.4;
        }

        /* Estilos originales mantenidos */
        .header {
            border: 1px solid #ddd;
            margin-bottom: 20px;
            padding: 15px;
        }

        .header-row {
            display: table;
            width: 100%;
            margin-bottom: 10px;
        }

        .header-col {
            display: table-cell;
            width: 33.33%;
            vertical-align: top;
            padding: 5px;
        }

        .header-title {
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #3d5095;
        }

        .label {
            font-weight: bold;
            color: #666;
        }

        .products-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }

        .products-table th {
            background-color: #f5f5f5;
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
            font-weight: bold;
        }

        .products-table td {
            border: 1px solid #ddd;
            padding: 8px;
            vertical-align: top;
        }

        .products-table tr:nth-child(even) {
            background-color: #f9f9f9;
        }

        .product-image {
            width: 60px;
            text-align: center;
        }

        .product-image img {
            max-width: 50px;
            max-height: 50px;
            border: 1px solid #ddd;
            object-fit: cover;
        }

        .product-image-placeholder {
            width: 50px;
            height: 50px;
            background-color: #f0f0f0;
            border: 1px solid #ddd;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 9px;
            color: #999;
            text-align: center;
            margin: 0 auto;
        }

        .text-right {
            text-align: right;
        }

        .text-center {
            text-align: center;
        }

        .variant-header {
            background-color: #ffffff;
            padding: 8px;
            font-weight: bold;
            color: #19ac90;
            border: 1px solid #bbdefb;
            margin-top: 15px;
        }

        .variant-header-row {
            background-color: #ffffff;
        }

        .variant-header-cell {
            padding: 12px;
            font-weight: bold;
            color: #19ac90;
            border: 1px solid #19ac90;
            text-align: left;
            font-size: 10px;
        }

        .comments {
            margin: 20px 0;
            padding: 15px;
            background-color: #f5f5f5;
            border-left: 4px solid #4caf50;
        }

        .comments h4 {
            margin: 0 0 10px 0;
            color: #388e3c;
        }

        .totals {
            width: 300px;
            float: right;
            margin-top: 20px;
        }

        .totals-table {
            width: 100%;
            border-collapse: collapse;
        }

        .totals-table td {
            padding: 5px 10px;
            border: 1px solid #ddd;
        }

        .totals-table .total-row {
            background-color: #3d5095;
            color: white;
            font-weight: bold;
        }

        .clear {
            clear: both;
        }

        /* Footer Institucional */
        .institutional-footer {
            width: 100%;
            border-collapse: collapse;
            margin-top: 30px;
            background-color: #f8f9fa;
            border: 2px solid #3d5095;
        }

        .institutional-footer td {
            padding: 12px;
            font-size: 10px;
            vertical-align: top;
        }

        .footer-company {
            font-weight: bold;
            color: #3d5095;
            margin-bottom: 5px;
        }

        .footer-details {
            color: #555;
            line-height: 1.4;
        }

        .footer-right {
            text-align: right;
            color: #666;
        }

        @page {
            margin: 1cm;
        }
    </style>
</head>

<body>
    <!-- HEADER INSTITUCIONAL -->
    <table class="institutional-header">
        <tr>
            <td class="company-logo">
                @php
                    $logoPath = public_path('images/logo-centralnorte.png');
                    $logoExists = file_exists($logoPath);
                @endphp

                @if ($logoExists)
                    <img src="{{ $logoPath }}" alt="Logo {{ env('APP_NAME') }}" />
                @else
                    <div class="company-logo-placeholder">
                        LOGO<br>EMPRESA
                    </div>
                @endif
            </td>
            <td class="company-info">
                <div class="company-name">{{ env('APP_NAME', 'Central Norte') }}</div>
                <div class="company-tagline">Soluciones en Merchandising y Productos Promocionales</div>
                <div class="company-contact">
                    <strong>Email:</strong> {{ env('COMPANY_EMAIL', 'info@centralnorte.com') }}<br>
                    <strong>Teléfono:</strong> {{ env('COMPANY_PHONE', '+54 11 4000-0000') }}<br>
                    <strong>Web:</strong> {{ env('COMPANY_WEBSITE', 'www.centralnorte.com') }}<br>
                    <strong>Dirección:</strong> {{ env('COMPANY_ADDRESS', 'Buenos Aires, Argentina') }}
                </div>
            </td>
        </tr>
    </table>

    <!-- HEADER ORIGINAL DEL PRESUPUESTO -->
    <div class="header">
        <div class="header-title">PRESUPUESTO - {{ $budget['title'] }}</div>

        <div class="header-row">
            <div class="header-col">
                <div><span class="label">Cliente:</span> {{ $budget['client']['name'] }}</div>
                @if (!empty($budget['client']['company']))
                    <div><span class="label">Empresa:</span> {{ $budget['client']['company'] }}</div>
                @endif
                @if (!empty($budget['client']['email']))
                    <div><span class="label">Email:</span> {{ $budget['client']['email'] }}</div>
                @endif
            </div>

            <div class="header-col">
                <div><span class="label">Presupuesto:</span> #{{ $budget['id'] }}</div>
                <div><span class="label">Fecha:</span>
                    {{ $budget['issue_date_short'] ?? $budget['issue_date_formatted'] }}</div>
                <div><span class="label">Vencimiento:</span>
                    {{ $budget['expiry_date_short'] ?? $budget['expiry_date_formatted'] }}</div>
            </div>

            <div class="header-col">
                <div><span class="label">Vendedor:</span> {{ $budget['user']['name'] }}</div>
                @if (!empty($budget['user']['email']))
                    <div><span class="label">Email:</span> {{ $budget['user']['email'] }}</div>
                @endif
                <div><span class="label">Estado:</span> {{ $budget['status_text'] ?? 'Pendiente' }}</div>
            </div>
        </div>
    </div>

    <!-- PRODUCTOS REGULARES -->
    @if (!empty($budget['grouped_items']['regular']))
        <table class="products-table">
            <thead>
                <tr>
                    <th style="width: 60px;">Imagen</th>
                    <th style="width: 40px;">Cant.</th>
                    <th>Producto</th>
                    <th style="width: 80px;">Precio Unit.</th>
                    <th style="width: 60px;">Tiempo</th>
                    <th style="width: 60px;">Logo</th>
                    <th style="width: 80px;">Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($budget['grouped_items']['regular'] as $item)
                    <tr>
                        <td class="product-image">
                            @if (isset($item['featured_image']['file_path']))
                                <img src="{{ $item['featured_image']['file_path'] }}" alt="producto" />
                            @else
                                <div class="product-image-placeholder">Sin imagen</div>
                            @endif
                        </td>
                        <td class="text-center">{{ $item['quantity'] ?? 1 }}</td>
                        <td>
                            <strong>{{ $item['product']['name'] ?? 'Producto' }}</strong>
                            @if (isset($item['product']['category']['name']))
                                <br><small style="color: #666;">{{ $item['product']['category']['name'] }}</small>
                            @endif
                            @if (isset($item['description']))
                                <br><small>{{ $item['description'] }}</small>
                            @endif
                        </td>
                        <td class="text-right">${{ number_format($item['unit_price'] ?? 0, 2, ',', '.') }}</td>
                        <td class="text-center">
                            @if (isset($item['production_time_days']))
                                {{ $item['production_time_days'] }} días
                            @else
                                -
                            @endif
                        </td>
                        <td class="text-center">
                            @if (isset($item['logo_printing']))
                                {{ $item['logo_printing'] ? 'Sí' : 'No' }}
                            @else
                                -
                            @endif
                        </td>
                        <td class="text-right">${{ number_format($item['line_total'] ?? 0, 2, ',', '.') }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    <!-- PRODUCTOS CON VARIANTES -->
    @if (!empty($budget['grouped_items']['variants']))
        @foreach ($budget['grouped_items']['variants'] as $groupName => $variantItems)
            @php
                // Obtener el nombre del producto del primer item del grupo de variantes
                $productName = $variantItems[0]['product']['name'] ?? 'Producto';
            @endphp

            <table class="products-table">
                <!-- Header de la variante integrado en la tabla -->
                <tr class="variant-header-row">
                    <td colspan="7" class="variant-header-cell">
                        Opción seleccionada para: {{ $productName }}
                    </td>
                </tr>
                <thead>
                    <tr>
                        <th style="width: 60px;">Imagen</th>
                        <th style="width: 40px;">Cant.</th>
                        <th>Producto</th>
                        <th style="width: 80px;">Precio Unit.</th>
                        <th style="width: 60px;">Tiempo</th>
                        <th style="width: 60px;">Logo</th>
                        <th style="width: 80px;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($variantItems as $item)
                        <tr>
                            <td class="product-image">
                                @if (isset($item['featured_image']['file_path']))
                                    <img src="{{ $item['featured_image']['file_path'] }}" alt="producto" />
                                @else
                                    <div class="product-image-placeholder">Sin imagen</div>
                                @endif
                            </td>
                            <td class="text-center">{{ $item['quantity'] ?? 1 }}</td>
                            <td>
                                <strong>{{ $item['product']['name'] ?? 'Producto' }}</strong>
                                @if (isset($item['product']['category']['name']))
                                    <br><small style="color: #666;">{{ $item['product']['category']['name'] }}</small>
                                @endif
                                @if (isset($item['description']))
                                    <br><small>{{ $item['description'] }}</small>
                                @endif
                            </td>
                            <td class="text-right">${{ number_format($item['unit_price'] ?? 0, 2, ',', '.') }}</td>
                            <td class="text-center">
                                @if (isset($item['production_time_days']))
                                    {{ $item['production_time_days'] }} días
                                @else
                                    -
                                @endif
                            </td>
                            <td class="text-center">
                                @if (isset($item['logo_printing']))
                                    {{ $item['logo_printing'] ? 'Sí' : 'No' }}
                                @else
                                    -
                                @endif
                            </td>
                            <td class="text-right">${{ number_format($item['line_total'] ?? 0, 2, ',', '.') }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @endforeach
    @endif

    <!-- COMENTARIOS -->
    @if (!empty($budget['footer_comments']))
        <div class="comments">
            <h4>Comentarios:</h4>
            <p>{{ $budget['footer_comments'] }}</p>
        </div>
    @endif

    <!-- TOTALES -->
    <div class="totals">
        <table class="totals-table">
            <tr>
                <td><strong>Subtotal:</strong></td>
                <td class="text-right">${{ number_format($budget['subtotal'] ?? 0, 2, ',', '.') }}</td>
            </tr>
            @if ($businessConfig['apply_iva'])
                <tr>
                    <td>IVA ({{ $businessConfig['iva_rate'] * 100 }}%):</td>
                    <td class="text-right">
                        ${{ number_format(($budget['subtotal'] ?? 0) * $businessConfig['iva_rate'], 2, ',', '.') }}
                    </td>
                </tr>
            @endif
            <tr class="total-row">
                <td><strong>TOTAL:</strong></td>
                <td class="text-right"><strong>${{ number_format($budget['total'] ?? 0, 2, ',', '.') }}</strong></td>
            </tr>
        </table>
    </div>

    <div class="clear"></div>

    <!-- FOOTER INSTITUCIONAL -->
    <table class="institutional-footer">
        <tr>
            <td style="width: 60%;">
                <div class="footer-company">{{ env('APP_NAME', 'Central Norte') }}</div>
                <div class="footer-details">
                    {{ env('COMPANY_ADDRESS', 'Buenos Aires, Argentina') }}<br>
                    Tel: {{ env('COMPANY_PHONE', '+54 11 4000-0000') }} |
                    Email: {{ env('COMPANY_EMAIL', 'info@centralnorte.com') }}<br>
                    Web: {{ env('COMPANY_WEBSITE', 'www.centralnorte.com') }}
                </div>
            </td>
            <td class="footer-right">
                <strong>Presupuesto generado el {{ date('d/m/Y H:i') }}</strong><br>
                <em>Documento generado automáticamente</em>
            </td>
        </tr>
    </table>
</body>

</html>
