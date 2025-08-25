<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Presupuesto {{ $budget['title'] }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #007bff;
        }

        .header h1 {
            font-size: 24px;
            color: #007bff;
            margin-bottom: 10px;
        }

        .header .subtitle {
            font-size: 14px;
            color: #666;
        }

        .info-section {
            display: table;
            width: 100%;
            margin-bottom: 20px;
        }

        .info-left,
        .info-right {
            display: table-cell;
            width: 50%;
            vertical-align: top;
            padding: 0 10px;
        }

        .info-box {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 15px;
        }

        .info-box h3 {
            font-size: 14px;
            color: #007bff;
            margin-bottom: 8px;
            border-bottom: 1px solid #dee2e6;
            padding-bottom: 5px;
        }

        .info-box p {
            margin-bottom: 4px;
        }

        .info-box strong {
            color: #495057;
        }

        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        .items-table th {
            background-color: #007bff;
            color: white;
            padding: 10px 8px;
            text-align: left;
            font-size: 11px;
            font-weight: bold;
        }

        .items-table td {
            padding: 8px;
            border-bottom: 1px solid #dee2e6;
            font-size: 11px;
        }

        .items-table tbody tr:nth-child(even) {
            background-color: #f8f9fa;
        }

        .text-right {
            text-align: right;
        }

        .text-center {
            text-align: center;
        }

        .variant-group {
            margin-bottom: 25px;
        }

        .variant-header {
            background-color: #e9ecef;
            padding: 10px;
            margin-bottom: 10px;
            border-left: 4px solid #007bff;
        }

        .variant-header h4 {
            color: #495057;
            font-size: 13px;
            margin: 0;
        }

        .totals-section {
            margin-top: 30px;
            float: right;
            width: 300px;
        }

        .totals-table {
            width: 100%;
            border-collapse: collapse;
        }

        .totals-table td {
            padding: 8px 12px;
            border: 1px solid #dee2e6;
            font-size: 12px;
        }

        .totals-table .label {
            background-color: #f8f9fa;
            font-weight: bold;
            text-align: right;
            width: 60%;
        }

        .totals-table .amount {
            text-align: right;
            width: 40%;
        }

        .total-final {
            background-color: #007bff !important;
            color: white !important;
            font-weight: bold;
            font-size: 14px;
        }

        .footer-comments {
            clear: both;
            margin-top: 40px;
            padding: 15px;
            background-color: #f8f9fa;
            border-left: 4px solid #28a745;
        }

        .footer-comments h4 {
            color: #28a745;
            margin-bottom: 10px;
            font-size: 13px;
        }

        .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 3px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .status-active {
            background-color: #d4edda;
            color: #155724;
        }

        .status-expired {
            background-color: #f8d7da;
            color: #721c24;
        }

        .status-pending {
            background-color: #fff3cd;
            color: #856404;
        }

        .page-break {
            page-break-before: always;
        }

        @media print {
            .page-break {
                page-break-before: always;
            }
        }

        /* Responsive adjustments for PDF */
        @page {
            margin: 2cm;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>PRESUPUESTO</h1>
        <div class="subtitle">{{ $budget['title'] }}</div>
        <div style="margin-top: 10px;">
            <span class="status-badge status-{{ $budget['status_class'] ?? 'pending' }}">
                {{ $budget['status_text'] ?? 'Pendiente' }}
            </span>
        </div>
    </div>

    <div class="info-section">
        <div class="info-left">
            <div class="info-box">
                <h3>Información del Cliente</h3>
                <p><strong>Nombre:</strong> {{ $budget['client']['name'] }}</p>
                @if (!empty($budget['client']['company']))
                    <p><strong>Empresa:</strong> {{ $budget['client']['company'] }}</p>
                @endif
            </div>

            <div class="info-box">
                <h3>Información del Vendedor</h3>
                <p><strong>Responsable:</strong> {{ $budget['user']['name'] }}</p>
            </div>
        </div>

        <div class="info-right">
            <div class="info-box">
                <h3>Detalles del Presupuesto</h3>
                <p><strong>Número:</strong> #{{ $budget['id'] }}</p>
                <p><strong>Fecha de Emisión:</strong>
                    {{ $budget['issue_date_short'] ?? $budget['issue_date_formatted'] }}</p>
                <p><strong>Válido hasta:</strong> {{ $budget['expiry_date_short'] ?? $budget['expiry_date_formatted'] }}
                </p>
            </div>
        </div>
    </div>

    <!-- Items regulares (sin variantes) -->
    @if (!empty($budget['grouped_items']['regular']))
        <div class="variant-group">
            <div class="variant-header">
                <h4>Productos</h4>
            </div>

            <table class="items-table">
                <thead>
                    <tr>
                        <th style="width: 50%;">Descripción</th>
                        <th style="width: 15%;" class="text-center">Cantidad</th>
                        <th style="width: 17%;" class="text-right">Precio Unit.</th>
                        <th style="width: 18%;" class="text-right">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($budget['grouped_items']['regular'] as $item)
                        <tr>
                            <td>
                                <strong>{{ $item['product']['name'] ?? 'Producto' }}</strong>
                                @if (!empty($item['product']['category']['name']))
                                    <br><small style="color: #666;">{{ $item['product']['category']['name'] }}</small>
                                @endif
                                @if (!empty($item['description']))
                                    <br><small style="color: #666;">{{ $item['description'] }}</small>
                                @endif
                            </td>
                            <td class="text-center">{{ $item['quantity'] ?? 1 }}</td>
                            <td class="text-right">${{ number_format($item['unit_price'] ?? 0, 2, ',', '.') }}</td>
                            <td class="text-right">${{ number_format($item['subtotal'] ?? 0, 2, ',', '.') }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    @endif

    <!-- Items con variantes -->
    @if (!empty($budget['grouped_items']['variants']))
        @foreach ($budget['grouped_items']['variants'] as $variantGroup => $items)
            <div class="variant-group">
                <div class="variant-header">
                    <h4>Opción {{ $variantGroup }}</h4>
                </div>

                <table class="items-table">
                    <thead>
                        <tr>
                            <th style="width: 50%;">Descripción</th>
                            <th style="width: 15%;" class="text-center">Cantidad</th>
                            <th style="width: 17%;" class="text-right">Precio Unit.</th>
                            <th style="width: 18%;" class="text-right">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($items as $item)
                            <tr>
                                <td>
                                    <strong>{{ $item['product']['name'] ?? 'Producto' }}</strong>
                                    @if (!empty($item['product']['category']['name']))
                                        <br><small
                                            style="color: #666;">{{ $item['product']['category']['name'] }}</small>
                                    @endif
                                    @if (!empty($item['description']))
                                        <br><small style="color: #666;">{{ $item['description'] }}</small>
                                    @endif
                                </td>
                                <td class="text-center">{{ $item['quantity'] ?? 1 }}</td>
                                <td class="text-right">${{ number_format($item['unit_price'] ?? 0, 2, ',', '.') }}</td>
                                <td class="text-right">${{ number_format($item['subtotal'] ?? 0, 2, ',', '.') }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        @endforeach
    @endif

    <!-- Totales -->
    <div class="totals-section">
        <table class="totals-table">
            <tr>
                <td class="label">Subtotal:</td>
                <td class="amount">${{ number_format($budget['subtotal'] ?? 0, 2, ',', '.') }}</td>
            </tr>
            @if ($businessConfig['apply_iva'] && $businessConfig['iva_rate'] > 0)
                <tr>
                    <td class="label">IVA ({{ number_format($businessConfig['iva_rate'] * 100, 1) }}%):</td>
                    <td class="amount">
                        ${{ number_format(($budget['subtotal'] ?? 0) * $businessConfig['iva_rate'], 2, ',', '.') }}
                    </td>
                </tr>
            @endif
            <tr class="total-final">
                <td class="label">TOTAL:</td>
                <td class="amount">${{ number_format($budget['total'] ?? 0, 2, ',', '.') }}</td>
            </tr>
        </table>
    </div>

    @if (!empty($budget['footer_comments']))
        <div class="footer-comments">
            <h4>Comentarios adicionales</h4>
            <p>{{ $budget['footer_comments'] }}</p>
        </div>
    @endif

    <div style="clear: both; margin-top: 50px; text-align: center; font-size: 10px; color: #666;">
        <p>Presupuesto generado el {{ date('d/m/Y H:i') }} - Token: {{ $budget['token'] }}</p>
    </div>
</body>

</html>
