{{-- resources/views/pdf/budget.blade.php --}}
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Presupuesto - {{ $budget['title'] }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: Arial, sans-serif;
            font-size: 10px;
            color: #333;
            line-height: 1.4;
        }

        /* HEADER INSTITUCIONAL */
        .institutional-header {
            width: 100%;
            top: 0;
            background: {{ env('PRIMARY_COLOR', '#3d5095') }};
            padding: 30px 20px;
            text-align: center;
        }

        .company-logo {
            text-align: center;
            margin-bottom: 15px;
        }

        .company-logo img {
            max-width: 320px;
            height: auto;
            display: inline-block;
        }

        .header-title {
            background: {{ env('SECONDARY_COLOR', '#3d5095') }};
            color: white;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
            text-align: center;
            padding: 5px 2%;
        }

        .header-subtitle {
            color: rgba(255, 255, 255, 0.9);
            background: {{ env('SECONDARY_COLOR', '#3d5095') }};
            font-size: 14px;
            text-align: center;
        }

        /* .main-content {
            margin-top: 350px;
            margin-bottom: 350px;
        } */

        /* INFO GENERAL */
        .budget-info-header {
            width: 100%;
            margin-bottom: 20px;
            color: #6b7280;
            background-color: white;
            border-bottom: 4px solid {{ env('SECONDARY_COLOR', '#3d5095') }};
        }

        .budget-info-header td {
            padding: 10px 15px;
            vertical-align: top;
            font-size: 10px;
        }

        .header-col {
            width: 50%;
        }

        .label {
            font-weight: bold;
            color: {{ env('PRIMARY_COLOR', '#3d5095') }};
        }

        /* PRODUCTOS */
        .products-table {
            width: 96%;
            margin-left: 2%;
            margin-right: 2%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }

        .products-table th {
            background-color: {{ env('PRIMARY_COLOR', '#3d5095') }};
            color: white;
            padding: 8px;
            text-align: left;
            font-size: 9px;
            font-weight: bold;
        }

        .products-table td {
            padding: 8px;
            border-bottom: 1px solid #ddd;
            font-size: 9px;
        }

        .product-image {
            text-align: center;
            padding: 4px 2px !important;
        }

        .product-image img {
            width: 120px !important;
            height: 120px !important;
            object-fit: contain;
        }

        .product-image-placeholder {
            width: 120px !important;
            height: 120px !important;
            background-color: #f0f0f0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 8px;
            color: #999;
        }

        .text-center {
            text-align: center;
        }

        .text-right {
            text-align: right;
        }

        /* VARIANTES */
        .variant-header-row {
            /* background-color: #ffffff; */
        }

        .variant-header-cell {
            padding-bottom: 0;
            margin-bottomtom: 0;
            padding-top: 2px;
            margin-toptom: 2px;
            /* font-weight: bold; */
            /* background-color: {{ env('SECONDARY_COLOR', '#19ac90') }}; */
            color: {{ env('PRIMARY_COLOR', '#19ac90') }};
            text-align: left;
            font-size: 10px;
        }

        /* COMENTARIOS Y CONDICIÓN DE PAGO */
        .info-box {
            background-color: #f3f4f6;
            padding: 15px;
            margin: 20px 2%;
            border-left: 4px solid {{ env('SECONDARY_COLOR', '#19ac90') }};
            border-radius: 4px;
        }

        .info-box strong {
            color: {{ env('PRIMARY_COLOR', '#3d5095') }};
        }

        .info-box small {
            color: #6b7280;
        }

        .comments {
            margin: 20px 2%;
            padding: 15px;
            background-color: #f3f4f6;
            border-left: 4px solid {{ env('SECONDARY_COLOR', '#19ac90') }};
            border-radius: 4px;
        }

        .comments h4 {
            margin: 0 0 10px 0;
            color: #d97706;
        }

        /* TOTALES */
        .totals-wrapper {
            page-break-inside: avoid;
            margin-top: 30px;
            margin-bottom: 30px;
        }

        .totals {
            width: 350px;
            float: right;
            margin-top: 20px;
            margin-right: 2%;
        }

        .totals-table {
            width: 100%;
            border-collapse: collapse;
        }

        .totals-table td {
            padding: 8px 12px;
            border: 1px solid #e5e7eb;
            font-size: 10px;
        }

        .totals-table tr:first-child td {
            border-top: 2px solid {{ env('PRIMARY_COLOR', '#3d5095') }};
        }

        .payment-condition-row.positive {
            color: #dc2626;
        }

        .payment-condition-row.negative {
            color: #16a34a;
        }

        .total-row {
            background: {{ env('PRIMARY_COLOR', '#3d5095') }};
            color: white;
            font-weight: bold;
            font-size: 12px;
        }

        .clear {
            clear: both;
        }

        /* FOOTER INSTITUCIONAL */
        .institutional-footer {
            width: 100%;
            border-collapse: collapse;
            background: {{ env('SECONDARY_COLOR', '#19ac90') }};
            color: white;
            padding: 20px;
        }

        .institutional-footer td {
            padding: 15px;
            font-size: 10px;
            vertical-align: top;
        }

        .footer-company {
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 8px;
        }

        .footer-details {
            line-height: 1.6;
            opacity: 0.95;
        }

        .footer-right {
            text-align: right;
            opacity: 0.9;
        }

        /* LEGALES */
        .legal-notes {
            margin: 0 2%;
            padding: 12px 15px;
            border-top: 1px solid #e5e7eb;
            clear: both;
            margin-top: 30px;
        }

        .legal-notes p {
            font-size: 8px;
            color: #9ca3af;
            line-height: 1.6;
            margin: 0;
        }

        .legal-notes p::before {
            content: '* ';
        }

        @page {
            margin-top: 3.5cm;
            /* Aumentar para dar espacio al header */
            margin-bottom: 3cm;
            /* Aumentar para dar espacio al footer */
            margin-left: 1cm;
            margin-right: 1cm;
        }
    </style>
</head>

<body>
    <!-- HEADER INSTITUCIONAL -->
    <div class="institutional-header">
        <div class="company-logo">
            @php
                $logoPath = public_path('images/logo-central-norte-header-email.png');
                $logoExists = file_exists($logoPath);
            @endphp
            @if ($logoExists)
                <img src="{{ $logoPath }}" alt="Logo">
            @else
                <div style="font-size: 32px; font-weight: bold; color: white;">
                    {{ env('APP_NAME', 'Central Norte') }}
                </div>
            @endif
        </div>
    </div>
    <div class="header-title">{{ $budget['title'] }}</div>

    <div class="main-content">

        <!-- INFO GENERAL DEL PRESUPUESTO -->
        <table class="budget-info-header">
            <tr>
                <td class="header-col">
                    <div><span class="label">Presupuesto N°: </span>#{{ $budget['id'] }}</div>
                    <div><span class="label">Cliente: </span>{{ $budget['client']['name'] }}</div>
                    @if (!empty($budget['client']['company']))
                        <div><span class="label">Empresa: </span>{{ $budget['client']['company'] }}</div>
                    @endif
                    <div><span class="label">Fecha de emisión: </span>
                        {{ $budget['issue_date_formatted'] ?? $budget['issue_date_short'] }}</div>
                    <div><span class="label">Válido hasta: </span>
                        {{ $budget['expiry_date_formatted'] ?? $budget['expiry_date_short'] }}</div>
                </td>

                <td class="header-col">
                    <div><span class="label">Vendedor: </span>{{ $budget['user']['name'] }}</div>
                    @if (!empty($budget['user']['email']))
                        <div><span class="label">Email: </span>{{ $budget['user']['email'] }}</div>
                    @endif
                    <div><span class="label">Estado: </span>
                        {{ $budget['status_text'] ?? ($budget['status_label'] ?? 'Pendiente') }}</div>
                </td>
            </tr>
        </table>

        <!-- PRODUCTOS REGULARES -->
        @if (!empty($budget['grouped_items']['regular']))
            <table class="products-table">
                <thead>
                    <tr>
                        <th style="width: 125px;">Imagen</th>
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
                                    <img src="{{ $item['featured_image']['file_path'] }}"
                                        alt="{{ 'producto - ' . $item['id'] }}"" />
                                @else
                                    <div class="product-image-placeholder">Sin imagen</div>
                                @endif
                            </td>
                            <td class="text-center">{{ $item['quantity'] ?? 1 }}</td>
                            <td>
                                <strong>{{ $item['product']['name'] ?? 'Producto' }}</strong>
                                @if (isset($item['product']['category_display']) && !empty($item['product']['category_display']))
                                    <br><small style="color: #666;">{{ $item['product']['category_display'] }}</small>
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
                                    {{ $item['logo_printing'] }}
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
                    $productName = $variantItems[0]['product']['name'] ?? 'Producto';
                @endphp

                <table class="products-table">
                    <thead>
                        <tr>
                            <th style="width: 85px;">Imagen</th>
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
                                    @if (isset($item['product']['category_display']) && !empty($item['product']['category_display']))
                                        <br><small
                                            style="color: #666;">{{ $item['product']['category_display'] }}</small>
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
                        <tr class="variant-header-row">
                            <td colspan="7" class="variant-header-cell">
                                Opción seleccionada para: {{ $productName }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            @endforeach
        @endif

        {{-- Información de condición de pago --}}
        @if (isset($budget['payment_condition']) && $budget['payment_condition'] !== null)
            <div class="info-box">
                <strong>Condición de Pago:</strong> {{ $budget['payment_condition']['description'] }}<br>
                <small style="color: #6b7280;">
                    @php
                        $paymentPercentage = floatval($budget['payment_condition']['percentage'] ?? 0);
                    @endphp
                    @if ($paymentPercentage > 0)
                        Se ha aplicado un <strong style="color: #dc2626;">recargo del
                            {{ number_format($paymentPercentage, 2) }}%</strong> sobre el subtotal.
                    @elseif ($paymentPercentage < 0)
                        Se ha aplicado un <strong style="color: #16a34a;">descuento del
                            {{ number_format(abs($paymentPercentage), 2) }}%</strong> sobre el subtotal.
                    @else
                        Sin ajuste adicional.
                    @endif
                </small>
            </div>
        @endif

        <!-- COMENTARIOS -->
        @if (!empty($budget['footer_comments']))
            <div class="comments">
                <strong>Comentarios:</strong>
                <small style="color: #6b7280;">{{ $budget['footer_comments'] }}</small>
            </div>
        @endif

        <!-- TOTALES -->
        <div class="totals-wrapper">
            <div class="totals">
                <table class="totals-table">
                    <tr>
                        <td><strong>Subtotal:</strong></td>
                        <td class="text-right">${{ number_format($budget['subtotal'] ?? 0, 2, ',', '.') }}</td>
                    </tr>

                    {{-- Mostrar ajuste de condición de pago si existe --}}
                    @if (isset($budget['payment_condition']) && $budget['payment_condition'] !== null)
                        @php
                            // Validar que existan los valores antes de usarlos
                            $paymentAmount = isset($budget['payment_condition']['amount'])
                                ? floatval($budget['payment_condition']['amount'])
                                : 0;
                            $paymentDescription =
                                'Modo de pago: ' . $budget['payment_condition']['description'] ?? 'Ajuste de pago';
                            $isPositive = $paymentAmount > 0;
                        @endphp

                        <tr class="payment-condition-row {{ $isPositive ? 'positive' : 'negative' }}">
                            <td>
                                <strong>{{ $paymentDescription }}</strong>
                                <br><small>{{ number_format($paymentPercentage, 2, ',', '.') }}
                                    %</small>
                            </td>
                            <td class="text-right">
                                <strong>${{ number_format($paymentAmount, 2, ',', '.') }}</strong>
                            </td>
                        </tr>
                    @endif

                    @if ($businessConfig['apply_iva'])
                        <tr>
                            <td>IVA ({{ $businessConfig['iva_rate'] * 100 }}%):</td>
                            <td class="text-right">
                                ${{ number_format((($budget['subtotal'] ?? 0) + ($paymentAmount ?? 0)) * $businessConfig['iva_rate'], 2, ',', '.') }}
                            </td>
                        </tr>
                    @endif

                    <tr class="total-row">
                        <td><strong>TOTAL:</strong></td>
                        <td class="text-right">
                            <strong>${{ number_format($budget['total'] ?? 0, 2, ',', '.') }}</strong>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
    </div>

    <div class="clear"></div>

    <!-- LEGALES -->
    <div class="legal-notes">
        <p>Los plazos de entregregir luego de la aprobación del boceto digital.</p>
        <p>Sujeto a disponibilidad de stock disponible al momento de la confirmación.</p>
        <p>Incluye envío y entrega a domicilio según la dirección especificada dentro del ámbito de CABA y GBA hasta 30
            kms.</p>
    </div>

    <!-- FOOTER INSTITUCIONAL -->
    <table class="institutional-footer">
        <tr>
            <td style="width: 60%;">
                <div class="footer-company">{{ env('APP_NAME', 'Central Norte') }}</div>
                <div class="footer-details">
                    {{ env('COMPANY_ADDRESS', 'Buenos Aires, Argentina') }}<br>
                    Tel: {{ env('COMPANY_PHONE', '+54 11 2479-7281') }} |
                    Email: {{ env('COMPANY_EMAIL', 'info@centralnortesrl.com') }}<br>
                    @if (env('COMPANY_WEBSITE'))
                        Web: {{ env('COMPANY_WEBSITE') }}
                    @endif
                </div>
            </td>
            <td class="footer-right" style="width: 40%;">
                <strong>Presupuesto generado</strong><br>
                <em>{{ date('d/m/Y H:i') }}</em><br>
                <small>Documento generado automáticamente</small>
            </td>
        </tr>
    </table>
</body>

</html>
