<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Presupuesto vencido</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-radius: 8px;
            margin-bottom: 30px;
        }

        .alert-danger {
            background-color: #f8d7da;
            border-left: 4px solid #dc3545;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }

        .budget-details {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }

        .btn {
            display: inline-block;
            padding: 12px 24px;
            background-color: #28a745;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 0;
        }

        .btn:hover {
            background-color: #218838;
        }

        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
        }

        .contact-info {
            background-color: #e9ecef;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }

        .next-steps {
            background-color: #d1ecf1;
            border-left: 4px solid #17a2b8;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>❌ Su presupuesto ha vencido</h1>
    </div>

    <p>Estimado/a <strong>{{ $budget->client->name }}</strong>,</p>

    <div class="alert-danger">
        <strong>¡Importante!</strong> Su presupuesto ha vencido el {{ $budget->expiry_date_formatted }}.
    </div>

    <p>Le informamos que su presupuesto ha alcanzado su fecha de vencimiento. Aunque el presupuesto ya no está vigente
        con las condiciones originales, aún puede revisar los detalles:</p>

    <div class="budget-details">
        <h3>📋 Detalles del Presupuesto Vencido</h3>
        <p><strong>Título:</strong> {{ $budget->title }}</p>
        <p><strong>Fecha de emisión:</strong> {{ $budget->issue_date_formatted }}</p>
        <p><strong>Fecha de vencimiento:</strong> {{ $budget->expiry_date_formatted }}</p>
        <p><strong>Total:</strong> ${{ number_format($budget->total, 2, ',', '.') }}</p>
    </div>

    <div class="next-steps">
        <h4>🔄 ¿Qué puede hacer ahora?</h4>
        <ul>
            <li><strong>Solicitar renovación:</strong> Contacte a su vendedor para obtener un nuevo presupuesto con
                precios actualizados.</li>
            <li><strong>Consultar disponibilidad:</strong> Los productos y precios pueden haber cambiado desde la
                emisión original.</li>
            <li><strong>Revisar condiciones:</strong> Es posible que se apliquen nuevas condiciones comerciales.</li>
        </ul>
    </div>

    <div class="contact-info">
        <h4>📞 Contacte a su Vendedor</h4>
        <p><strong>Vendedor:</strong> {{ $vendedor->name }}</p>
        @if ($vendedor->email)
            <p><strong>Email:</strong> <a href="mailto:{{ $vendedor->email }}">{{ $vendedor->email }}</a></p>
        @endif
        @if ($vendedor->phone)
            <p><strong>Teléfono:</strong> {{ $vendedor->phone }}</p>
        @endif
    </div>

    <div style="text-align: center; margin: 30px 0;">
        <a href="mailto:{{ $vendedor->email }}?subject=Consulta sobre presupuesto vencido: {{ $budget->title }}"
            class="btn">Contactar Vendedor</a>
    </div>

    <p>Nuestro equipo estará encantado de ayudarle a generar un nuevo presupuesto actualizado con las mejores
        condiciones disponibles.</p>

    <p>Gracias por su interés en nuestros productos y servicios.</p>

    <div class="footer">
        <p>Este es un mensaje automático para informarle sobre el vencimiento de su presupuesto.</p>
        <p>Para obtener un nuevo presupuesto actualizado, por favor contacte a su vendedor.</p>
    </div>
</body>

</html>
