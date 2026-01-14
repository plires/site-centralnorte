{{-- resources/views/emails/picking-budget-in-review-vendor.blade.php --}}
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Presupuesto de Picking en Evaluación por el Cliente</title>
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

        .info-box {
            background-color: #fff8e1;
            border-left: 4px solid #ffc107;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
        }

        .info-box strong {
            color: #f57c00;
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

        .client-info {
            background-color: #e7f3ff;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
        }

        .client-info h4 {
            color: {{ env('PRIMARY_COLOR', '#3d5095') }};
            margin-top: 0;
        }

        .client-info p {
            margin: 5px 0;
        }

        .next-steps {
            background-color: #e8f5e9;
            border-left: 4px solid #4caf50;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
        }

        .next-steps h4 {
            color: #2e7d32;
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
    </style>
</head>

<body>
    <div class="email-container">
        <div class="header">
            @if (env('LOGO_PATH'))
                <img src="{{ env('APP_URL') . env('LOGO_PATH') }}" alt="Central Norte" class="logo">
            @endif
            <h1>Presupuesto de Picking en Evaluación 📋</h1>
        </div>

        <div class="content">
            <p class="greeting">Hola {{ $vendedor->name }},</p>

            <div class="info-box">
                <strong>El cliente está evaluando tu presupuesto de picking</strong>
                <p>El cliente ha marcado el presupuesto como "En Evaluación", lo que indica que está considerando tu propuesta.</p>
            </div>

            <div class="budget-details">
                <h3>📋 Detalles del Presupuesto</h3>
                <p><strong>N° Presupuesto:</strong> {{ $budget->budget_number }}</p>
                @if($budget->title)
                    <p><strong>Título:</strong> {{ $budget->title }}</p>
                @endif
                <p><strong>Total de Kits:</strong> {{ number_format($budget->total_kits, 0, ',', '.') }}</p>
                <p><strong>Componentes por Kit:</strong> {{ $budget->total_components_per_kit }}</p>
                <p><strong>Fecha de validez:</strong> {{ $budget->valid_until_formatted }}</p>
                <p><strong>Monto total:</strong> ${{ number_format($budget->total, 2, ',', '.') }}</p>
            </div>

            <div class="client-info">
                <h4>👤 Información del Cliente</h4>
                <p><strong>Cliente:</strong> {{ $cliente->name }}</p>
                @if($cliente->company)
                    <p><strong>Empresa:</strong> {{ $cliente->company }}</p>
                @endif
                @if($cliente->email)
                    <p><strong>Email:</strong> {{ $cliente->email }}</p>
                @endif
                @if($cliente->phone)
                    <p><strong>Teléfono:</strong> {{ $cliente->phone }}</p>
                @endif
            </div>

            <div class="next-steps">
                <h4>📞 ¿Qué significa esto?</h4>
                <ul>
                    <li>El cliente está revisando tu propuesta detenidamente</li>
                    <li>Es una señal positiva - muestra interés genuino en tu oferta</li>
                    <li>Puede que necesite tiempo para consultar internamente</li>
                    <li>Es un buen momento para estar disponible para resolver dudas</li>
                </ul>
            </div>

            <div class="next-steps">
                <h4>💡 Acciones Recomendadas</h4>
                <ul>
                    <li>Mantente disponible para responder preguntas del cliente</li>
                    <li>Considera hacer un seguimiento proactivo en 2-3 días</li>
                    <li>Prepara información adicional sobre el servicio de picking</li>
                    <li>Verifica que todos los detalles del presupuesto sean correctos</li>
                </ul>
            </div>

            <div style="text-align: center;">
                <a href="{{ $dashboardUrl }}" class="button">
                    Ver Presupuesto en el Dashboard
                </a>
            </div>

            <p>Recuerda que el cliente aún puede aprobar el presupuesto directamente desde la vista pública.</p>

            <p style="margin-top: 30px; color: #666;">
                Saludos cordiales,<br>
                <strong style="color: {{ env('PRIMARY_COLOR', '#3d5095') }};">{{ env('APP_NAME', 'Central Norte') }}</strong>
            </p>
        </div>

        <div class="footer">
            <p><strong>{{ env('APP_NAME', 'Central Norte') }}</strong></p>
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
            <p>Si tienes consultas, comunícate con el equipo de soporte.</p>
        </div>
    </div>
</body>

</html>
