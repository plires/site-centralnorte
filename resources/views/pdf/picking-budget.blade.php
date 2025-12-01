<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Presupuesto {{ $budget->budget_number }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: Arial, sans-serif;
            font-size: 11px;
            color: #333;
            line-height: 1.4;
        }

        .container {
            padding: 20px;
        }

        .header {
            margin-bottom: 30px;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 15px;
        }

        .header h1 {
            color: #2563eb;
            font-size: 24px;
            margin-bottom: 5px;
        }

        .header .subtitle {
            color: #6b7280;
            font-size: 12px;
        }

        .info-section {
            margin-bottom: 20px;
        }

        .info-section h2 {
            background-color: #2563eb;
            color: white;
            padding: 8px 12px;
            font-size: 14px;
            margin-bottom: 10px;
        }

        .info-grid {
            display: table;
            width: 100%;
            margin-bottom: 15px;
        }

        .info-row {
            display: table-row;
        }

        .info-label {
            display: table-cell;
            font-weight: bold;
            padding: 5px 10px 5px 0;
            width: 40%;
        }

        .info-value {
            display: table-cell;
            padding: 5px 0;
        }

        .budget-number {
            float: right;
            background-color: #f3f4f6;
            padding: 10px 15px;
            border-radius: 5px;
            font-size: 16px;
            font-weight: bold;
        }

        .services-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        .services-table th {
            background-color: #f3f4f6;
            padding: 10px;
            text-align: left;
            font-weight: bold;
            border-bottom: 2px solid #e5e7eb;
        }

        .services-table td {
            padding: 8px 10px;
            border-bottom: 1px solid #e5e7eb;
        }

        .services-table tr:last-child td {
            border-bottom: none;
        }

        .text-right {
            text-align: right;
        }

        .totals-box {
            background-color: #f9fafb;
            padding: 15px;
            border: 2px solid #e5e7eb;
            margin-top: 20px;
        }

        .totals-row {
            display: table;
            width: 100%;
            margin-bottom: 8px;
        }

        .totals-label {
            display: table-cell;
            text-align: right;
            padding-right: 20px;
            width: 70%;
        }

        .totals-value {
            display: table-cell;
            text-align: right;
            font-weight: bold;
            width: 30%;
        }

        .totals-separator {
            border-top: 1px solid #d1d5db;
            margin: 10px 0;
        }

        /* Estilos para payment condition */
        .payment-condition-positive {
            color: #dc2626;
        }

        .payment-condition-negative {
            color: #16a34a;
        }

        .payment-condition-note {
            font-size: 9px;
            font-style: italic;
            color: #6b7280;
            margin-top: 2px;
        }

        .subtotal-base {
            border-top: 1px solid #9ca3af;
            padding-top: 8px;
            margin-top: 5px;
        }

        .total-final {
            border-top: 2px solid #2563eb;
            padding-top: 10px;
            margin-top: 10px;
            font-size: 16px;
            color: #2563eb;
        }

        .price-per-kit {
            background-color: #dcfce7;
            border: 1px solid #86efac;
            padding: 10px;
            margin-top: 10px;
            border-radius: 5px;
        }

        .notes-box {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 12px;
            margin-top: 20px;
        }

        .footer {
            position: fixed;
            bottom: 20px;
            left: 20px;
            right: 20px;
            text-align: center;
            font-size: 10px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 10px;
        }

        .page-break {
            page-break-after: always;
        }
    </style>
</head>

<body>
    <div class="container">
        <!-- HEADER -->
        <div class="header">
            <div class="budget-number">{{ $budget->budget_number }}</div>
            <h1>CENTRAL NORTE</h1>
            <div class="subtitle">Presupuesto de Picking / Armado de Kits</div>
            <div class="subtitle" style="margin-top: 5px;">
                Fecha: {{ $budget->created_at->format('d/m/Y') }} |
                Válido hasta: {{ $budget->valid_until->format('d/m/Y') }}
            </div>
        </div>

        <!-- DATOS DEL CLIENTE -->
        <div class="info-section">
            <h2>Datos del Cliente</h2>
            <div class="info-grid">
                <div class="info-row">
                    <div class="info-label">Cliente:</div>
                    <div class="info-value">{{ $budget->client->name }}</div>
                </div>
                @if ($budget->client->email)
                    <div class="info-row">
                        <div class="info-label">Email:</div>
                        <div class="info-value">{{ $budget->client->email }}</div>
                    </div>
                @endif
                @if ($budget->client->phone)
                    <div class="info-row">
                        <div class="info-label">Teléfono:</div>
                        <div class="info-value">{{ $budget->client->phone }}</div>
                    </div>
                @endif
                <div class="info-row">
                    <div class="info-label">Vendedor:</div>
                    <div class="info-value">{{ $budget->vendor->name }}</div>
                </div>
            </div>
        </div>

        <!-- CONFIGURACIÓN DEL PEDIDO -->
        <div class="info-section">
            <h2>Configuración del Pedido</h2>
            <div class="info-grid">
                <div class="info-row">
                    <div class="info-label">Cantidad de kits a armar:</div>
                    <div class="info-value">{{ number_format($budget->total_kits, 0, ',', '.') }} kits</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Componentes por kit:</div>
                    <div class="info-value">{{ $budget->total_components_per_kit }} componentes</div>
                </div>
                @if ($budget->boxes && $budget->boxes->count() > 0)
                    <div class="info-row">
                        <div class="info-label">Caja/s a utilizar:</div>
                        <div class="info-value">
                            {{ $budget->boxes->pluck('box_dimensions')->join(', ') }}
                        </div>
                    </div>
                @endif
                <div class="info-row">
                    <div class="info-label">Tiempo de producción:</div>
                    <div class="info-value"><strong>{{ $budget->production_time }}</strong></div>
                </div>
                @if ($budget->payment_condition_description)
                    <div class="info-row">
                        <div class="info-label">Condición de Pago:</div>
                        <div class="info-value">
                            <strong>{{ $budget->payment_condition_description }}</strong>
                            @if ($budget->payment_condition_percentage)
                                @php
                                    $percentage = $budget->payment_condition_percentage;
                                    $isPositive = $percentage > 0;
                                @endphp
                                <span style="color: {{ $isPositive ? '#dc2626' : '#16a34a' }};">
                                    ({{ $isPositive ? '+' : '' }}{{ number_format($percentage, 2, ',', '.') }}%)
                                </span>
                            @endif
                        </div>
                    </div>
                @endif
            </div>
        </div>

        <!-- SERVICIOS INCLUIDOS -->
        <div class="info-section">
            <h2>Servicios Incluidos</h2>
            <table class="services-table">
                <thead>
                    <tr>
                        <th style="width: 40%;">Servicio</th>
                        <th style="width: 15%;" class="text-left">Cantidad</th>
                        <th style="width: 20%;" class="text-left">Costo Unitario</th>
                        <th style="width: 25%;" class="text-left">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($budget->services as $service)
                        <tr>
                            <td>{{ $service->service_description }}</td>
                            <td class="text-left">
                                {{ $service->quantity > 1 ? number_format($service->quantity, 0, ',', '.') : '-' }}
                            </td>
                            <td class="text-left">${{ number_format($service->unit_cost, 2, ',', '.') }}
                            </td>
                            <td class="text-left">${{ number_format($service->subtotal, 2, ',', '.') }}
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <!-- TOTALES CON PAYMENT CONDITION E IVA -->
        <div class="totals-box">
            <!-- Subtotal servicios -->
            <div class="totals-row">
                <div class="totals-label">Subtotal servicios:</div>
                <div class="totals-value">${{ number_format($budget->services_subtotal, 2, ',', '.') }}</div>
            </div>

            <!-- Incremento por componentes -->
            @if ($budget->component_increment_amount > 0)
                <div class="totals-row">
                    <div class="totals-label">
                        Incremento por componentes ({{ $budget->component_increment_description }}):
                    </div>
                    <div class="totals-value">${{ number_format($budget->component_increment_amount, 2, ',', '.') }}
                    </div>
                </div>
            @endif

            <!-- Total cajas -->
            @if ($budget->box_total > 0)
                <div class="totals-row">
                    <div class="totals-label">
                        Costo de caja/s
                        @if ($budget->boxes && $budget->boxes->count() > 0)
                            ({{ $budget->boxes->pluck('box_dimensions')->join(', ') }})
                        @endif:
                    </div>
                    <div class="totals-value">${{ number_format($budget->box_total, 2, ',', '.') }}</div>
                </div>
            @endif

            <!-- Subtotal base (antes de payment condition e IVA) -->
            <div class="totals-row subtotal-base">
                <div class="totals-label">Subtotal:</div>
                <div class="totals-value">
                    ${{ number_format($budget->subtotal_with_increment + $budget->box_total, 2, ',', '.') }}
                </div>
            </div>

            <!-- Payment Condition -->
            @if ($budget->payment_condition_percentage && $budget->payment_condition_amount != 0)
                @php
                    $isPositive = $budget->payment_condition_percentage > 0;
                    $colorClass = $isPositive ? 'payment-condition-positive' : 'payment-condition-negative';
                @endphp
                <div class="totals-row" style="margin-top: 10px;">
                    <div class="totals-label">
                        Condición de Pago ({{ $budget->payment_condition_description }})
                        <span class="{{ $colorClass }}">
                            ({{ $isPositive ? '+' : '' }}{{ number_format($budget->payment_condition_percentage, 2, ',', '.') }}%)
                        </span>:
                        <div class="payment-condition-note">
                            @if ($isPositive)
                                Se aplicó un recargo del
                                {{ number_format($budget->payment_condition_percentage, 2, ',', '.') }}% sobre el
                                subtotal
                            @else
                                Se aplicó un descuento del
                                {{ number_format(abs($budget->payment_condition_percentage), 2, ',', '.') }}% sobre el
                                subtotal
                            @endif
                        </div>
                    </div>
                    <div class="totals-value {{ $colorClass }}">
                        {{ $isPositive ? '+' : '-' }}
                        ${{ number_format(abs($budget->payment_condition_amount), 2, ',', '.') }}
                    </div>
                </div>
            @endif

            <!-- IVA -->
            @php
                $ivaRate = config('business.tax.iva_rate', 0.21);
                $applyIva = config('business.tax.apply_iva', true);

                // Calcular subtotal con payment condition
                $subtotalBase = $budget->subtotal_with_increment + $budget->box_total;
                $subtotalWithPayment = $subtotalBase + ($budget->payment_condition_amount ?? 0);

                // Calcular IVA
                $ivaAmount = $applyIva ? $subtotalWithPayment * $ivaRate : 0;
            @endphp

            @if ($applyIva && $ivaAmount > 0)
                <div class="totals-row" style="margin-top: 5px;">
                    <div class="totals-label">IVA ({{ number_format($ivaRate * 100, 0) }}%):</div>
                    <div class="totals-value" style="color: #6b7280;">
                        ${{ number_format($ivaAmount, 2, ',', '.') }}
                    </div>
                </div>
            @endif

            <!-- Total Final -->
            <div class="totals-row total-final">
                <div class="totals-label" style="font-size: 16px;">TOTAL:</div>
                <div class="totals-value" style="font-size: 18px;">
                    ${{ number_format($budget->total, 2, ',', '.') }}
                </div>
            </div>

            <!-- Precio por Kit -->
            @if ($budget->unit_price_per_kit > 0)
                <div class="price-per-kit">
                    <div class="totals-row" style="margin: 0;">
                        <div class="totals-label" style="color: #166534; font-weight: bold;">
                            Precio unitario por kit ({{ number_format($budget->total_kits, 0, ',', '.') }} kits):
                        </div>
                        <div class="totals-value" style="color: #166534; font-size: 14px;">
                            ${{ number_format($budget->unit_price_per_kit, 2, ',', '.') }}
                        </div>
                    </div>
                </div>
            @endif
        </div>

        <!-- NOTAS -->
        @if ($budget->notes)
            <div class="notes-box">
                <strong>Notas:</strong><br>
                {{ $budget->notes }}
            </div>
        @endif

        <!-- TÉRMINOS Y CONDICIONES -->
        <div class="info-section" style="margin-top: 30px; font-size: 10px; color: #6b7280;">
            <h2 style="font-size: 12px;">Términos y Condiciones</h2>
            <ul style="margin-left: 20px; margin-top: 10px;">
                <li>Este presupuesto es válido hasta la fecha indicada.</li>
                <li>Los tiempos de producción son estimativos y pueden variar según disponibilidad.</li>
                <li>Los precios están sujetos a cambios sin previo aviso una vez vencido el presupuesto.</li>
                <li>Se requiere confirmación por escrito para iniciar la producción.</li>
                @if ($applyIva)
                    <li>Todos los precios incluyen IVA ({{ number_format($ivaRate * 100, 0) }}%).</li>
                @endif
            </ul>
        </div>
    </div>

    <!-- FOOTER -->
    <div class="footer">
        <strong>CENTRAL NORTE</strong> - Merchandising y Productos Promocionales<br>
        Email: contacto@centralnorte.com | Tel: (011) 1234-5678 | www.centralnorte.com
    </div>
</body>

</html>
