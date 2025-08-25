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

        .header {
            width: 100%;
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
            color: #2563eb;
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
        }

        .text-right {
            text-align: right;
        }

        .text-center {
            text-align: center;
        }

        .variant-header {
            background-color: #e3f2fd;
            padding: 8px;
            font-weight: bold;
            color: #1976d2;
            border: 1px solid #bbdefb;
            margin-top: 15px;
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
            background-color: #2563eb;
            color: white;
            font-weight: bold;
        }

        .clear {
            clear: both;
        }

        @page {
            margin: 1cm;
        }
    </style>
</head>

<body>
    <!-- HEADER -->
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
                            @if (!empty($item['featured_image']))
                                <img src="{{ $item['featured_image']['file_path'] }}" alt="Producto" />
                            @else
                                <div class="product-image-placeholder">Sin imagen</div>
                            @endif
                        </td>
                        <td class="text-center">{{ $item['quantity'] ?? 1 }}</td>
                        <td>
                            <strong>{{ $item['product']['name'] ?? 'Producto' }}</strong>
                            @if (!empty($item['product']['category']['name']))
                                <br><small style="color: #666;">{{ $item['product']['category']['name'] }}</small>
                            @endif
                            @if (!empty($item['description']))
                                <br><small>{{ $item['description'] }}</small>
                            @endif
                        </td>
                        <td class="text-right">${{ number_format($item['unit_price'] ?? 0, 2, ',', '.') }}</td>
                        <td class="text-center">
                            @if (!empty($item['production_time_days']))
                                {{ $item['production_time_days'] }} días
                            @else
                                -
                            @endif
                        </td>
                        <td class="text-center">
                            @if (!empty($item['logo_printing']))
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

    <!-- VARIANTES (SOLO SELECCIONADAS) -->
    @if (!empty($budget['grouped_items']['variants']))
        @foreach ($budget['grouped_items']['variants'] as $variantGroup => $items)
            <div class="variant-header">Opción Seleccionada: {{ $variantGroup }}</div>

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
                    @foreach ($items as $item)
                        <tr>
                            <td class="product-image">
                                @if (!empty($item['featured_image']))
                                    <img src="{{ $item['featured_image']['file_path'] }}" alt="Producto" />
                                @else
                                    <div class="product-image-placeholder">Sin imagen</div>
                                @endif
                            </td>
                            <td class="text-center">{{ $item['quantity'] ?? 1 }}</td>
                            <td>
                                <strong>{{ $item['product']['name'] ?? 'Producto' }}</strong>
                                @if (!empty($item['product']['category']['name']))
                                    <br><small style="color: #666;">{{ $item['product']['category']['name'] }}</small>
                                @endif
                                @if (!empty($item['description']))
                                    <br><small>{{ $item['description'] }}</small>
                                @endif
                            </td>
                            <td class="text-right">${{ number_format($item['unit_price'] ?? 0, 2, ',', '.') }}</td>
                            <td class="text-center">
                                @if (!empty($item['production_time_days']))
                                    {{ $item['production_time_days'] }} días
                                @else
                                    -
                                @endif
                            </td>
                            <td class="text-center">
                                @if (!empty($item['logo_printing']))
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
            <h4>Comentarios</h4>
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
            @if ($businessConfig['apply_iva'] && $businessConfig['iva_rate'] > 0)
                <tr>
                    <td><strong>IVA ({{ number_format($businessConfig['iva_rate'] * 100, 1) }}%):</strong></td>
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

    <div style="margin-top: 30px; text-align: center; font-size: 10px; color: #666;">
        Presupuesto generado el {{ date('d/m/Y H:i') }} - Token: {{ $budget['token'] }}
    </div>
</body>

</html>
