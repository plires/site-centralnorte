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
        .total-final {
            border-top: 2px solid #2563eb;
            padding-top: 10px;
            margin-top: 10px;
            font-size: 16px;
            color: #2563eb;
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
                    <div class="info-value">{{ $budget->client_name }}</div>
                </div>
                @if($budget->client_email)
                <div class="info-row">
                    <div class="info-label">Email:</div>
                    <div class="info-value">{{ $budget->client_email }}</div>
                </div>
                @endif
                @if($budget->client_phone)
                <div class="info-row">
                    <div class="info-label">Teléfono:</div>
                    <div class="info-value">{{ $budget->client_phone }}</div>
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
                <div class="info-row">
                    <div class="info-label">Caja a utilizar:</div>
                    <div class="info-value">{{ $budget->box_dimensions }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Tiempo de producción:</div>
                    <div class="info-value"><strong>{{ $budget->production_time }}</strong></div>
                </div>
            </div>
        </div>

        <!-- SERVICIOS INCLUIDOS -->
        <div class="info-section">
            <h2>Servicios Incluidos</h2>
            <table class="services-table">
                <thead>
                    <tr>
                        <th style="width: 40%;">Servicio</th>
                        <th style="width: 15%;" class="text-right">Cantidad</th>
                        <th style="width: 20%;" class="text-right">Costo Unitario</th>
                        <th style="width: 25%;" class="text-right">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($budget->services as $service)
                    <tr>
                        <td>{{ $service->service_description }}</td>
                        <td class="text-right">{{ $service->quantity > 1 ? number_format($service->quantity, 0, ',', '.') : '-' }}</td>
                        <td class="text-right">${{ number_format($service->unit_cost, 2, ',', '.') }}</td>
                        <td class="text-right">${{ number_format($service->subtotal, 2, ',', '.') }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <!-- TOTALES -->
        <div class="totals-box">
            <div class="totals-row">
                <div class="totals-label">Subtotal servicios:</div>
                <div class="totals-value">${{ number_format($budget->services_subtotal, 2, ',', '.') }}</div>
            </div>
            
            <div class="totals-row">
                <div class="totals-label">
                    Incremento por componentes ({{ $budget->component_increment_description }}):
                </div>
                <div class="totals-value">${{ number_format($budget->component_increment_amount, 2, ',', '.') }}</div>
            </div>
            
            <div class="totals-row">
                <div class="totals-label">Subtotal con incremento:</div>
                <div class="totals-value">${{ number_format($budget->subtotal_with_increment, 2, ',', '.') }}</div>
            </div>
            
            <div class="totals-row">
                <div class="totals-label">Costo de caja ({{ $budget->box_dimensions }}):</div>
                <div class="totals-value">${{ number_format($budget->box_total, 2, ',', '.') }}</div>
            </div>
            
            <div class="totals-row total-final">
                <div class="totals-label" style="font-size: 16px;">TOTAL:</div>
                <div class="totals-value" style="font-size: 18px;">${{ number_format($budget->total, 2, ',', '.') }}</div>
            </div>
        </div>

        <!-- NOTAS -->
        @if($budget->notes)
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
