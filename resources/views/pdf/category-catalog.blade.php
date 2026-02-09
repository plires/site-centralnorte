{{-- resources/views/pdf/category-catalog.blade.php --}}
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Catálogo - {{ $category->name }}</title>
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

        /* HEADER INSTITUCIONAL */
        .institutional-header {
            width: 100%;
            background: {{ env('PRIMARY_COLOR', '#3d5095') }};
            padding: 25px 20px;
            text-align: center;
        }

        .company-logo {
            text-align: center;
            margin-bottom: 10px;
        }

        .company-logo img {
            max-width: 280px;
            height: auto;
            display: inline-block;
        }

        .header-title {
            background: {{ env('SECONDARY_COLOR', '#19ac90') }};
            color: white;
            font-size: 20px;
            font-weight: bold;
            text-align: center;
            padding: 12px 2%;
            margin-bottom: 0;
        }

        .header-subtitle {
            color: white;
            background: {{ env('SECONDARY_COLOR', '#19ac90') }};
            font-size: 12px;
            text-align: center;
            padding: 0 2% 8px;
        }

        /* CONTENIDO PRINCIPAL */
        .main-content {
            padding: 20px 2%;
        }

        .category-info {
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid {{ env('SECONDARY_COLOR', '#19ac90') }};
        }

        .category-info h2 {
            color: {{ env('PRIMARY_COLOR', '#3d5095') }};
            font-size: 14px;
            margin-bottom: 5px;
        }

        .category-info p {
            color: #6b7280;
            font-size: 10px;
        }

        /* GRILLA DE PRODUCTOS */
        .products-grid {
            width: 100%;
        }

        .products-table {
            width: 100%;
            border-collapse: collapse;
        }

        .product-row {
            page-break-inside: avoid;
        }

        .product-cell {
            width: 50%;
            padding: 10px;
            vertical-align: top;
            border-bottom: 1px solid #e5e7eb;
        }

        .product-card {
            display: table;
            width: 100%;
        }

        .product-image-container {
            display: table-cell;
            width: 80px;
            vertical-align: top;
            padding-right: 12px;
        }

        .product-image {
            width: 80px;
            height: 80px;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            overflow: hidden;
            background-color: #f9fafb;
        }

        .product-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .product-image-placeholder {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #f3f4f6;
            color: #9ca3af;
            font-size: 9px;
            text-align: center;
        }

        .product-info {
            display: table-cell;
            vertical-align: top;
        }

        .product-name {
            font-weight: bold;
            font-size: 11px;
            color: {{ env('PRIMARY_COLOR', '#3d5095') }};
            margin-bottom: 4px;
            line-height: 1.3;
        }

        .product-sku {
            font-size: 9px;
            color: #6b7280;
        }

        .product-description {
            font-size: 8px;
            color: #6b7280;
            margin-top: 4px;
            line-height: 1.4;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 5;
            -webkit-box-orient: vertical;
            max-height: 56px;
            /* 5 líneas * 1.4 line-height * 8px font-size */
        }

        /* FOOTER INSTITUCIONAL */
        .institutional-footer {
            width: 100%;
            border-collapse: collapse;
            margin-top: 30px;
            background: {{ env('SECONDARY_COLOR', '#19ac90') }};
            color: white;
        }

        .institutional-footer td {
            padding: 15px 20px;
            font-size: 10px;
            vertical-align: top;
        }

        .footer-company {
            font-weight: bold;
            font-size: 12px;
            margin-bottom: 5px;
        }

        .footer-contact {
            line-height: 1.6;
            opacity: 0.95;
        }

        .footer-right {
            text-align: right;
            opacity: 0.9;
        }

        /* CONTADOR DE PRODUCTOS */
        .products-count {
            background-color: #f3f4f6;
            padding: 10px 15px;
            margin-bottom: 15px;
            border-radius: 6px;
            border-left: 4px solid {{ env('PRIMARY_COLOR', '#3d5095') }};
        }

        .products-count span {
            color: {{ env('PRIMARY_COLOR', '#3d5095') }};
            font-weight: bold;
        }

        @page {
            margin-top: 1cm;
            margin-bottom: 2.5cm;
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
                <div style="font-size: 28px; font-weight: bold; color: white;">
                    {{ env('APP_NAME', 'Central Norte') }}
                </div>
            @endif
        </div>
    </div>

    <div class="header-title">Catálogo de Productos</div>
    <div class="header-subtitle">{{ $category->name }}</div>

    <!-- CONTENIDO PRINCIPAL -->
    <div class="main-content">
        <!-- Info de categoría -->
        <div class="category-info">
            <h2>{{ $category->name }}</h2>
            @if ($category->description)
                <p>{{ $category->description }}</p>
            @endif
        </div>

        <!-- Contador de productos -->
        <div class="products-count">
            <span>{{ $products->count() }}</span> producto(s) en esta categoría
        </div>

        <!-- Grilla de productos -->
        <table class="products-table">
            @foreach ($products->chunk(2) as $pair)
                <tr class="product-row">
                    @foreach ($pair as $product)
                        <td class="product-cell">
                            <div class="product-card">
                                <div class="product-image-container">
                                    <div class="product-image">
                                        @if ($product['image'])
                                            <img src="{{ $product['image'] }}" alt="{{ $product['name'] }}">
                                        @else
                                            <div class="product-image-placeholder">Sin imagen</div>
                                        @endif
                                    </div>
                                </div>
                                <div class="product-info">
                                    <div class="product-name">{{ $product['name'] }}</div>
                                    @if ($product['sku'])
                                        <div class="product-sku">SKU: {{ $product['sku'] }}</div>
                                    @endif
                                    @if ($product['description'])
                                        <div class="product-description">
                                            {{ \Illuminate\Support\Str::limit($product['description'], 250) }}</div>
                                    @endif
                                </div>
                            </div>
                        </td>
                    @endforeach
                    {{-- Si es impar, agregar celda vacía --}}
                    @if ($pair->count() == 1)
                        <td class="product-cell"></td>
                    @endif
                </tr>
            @endforeach
        </table>
    </div>

    <!-- FOOTER INSTITUCIONAL -->
    <table class="institutional-footer">
        <tr>
            <td style="width: 60%;">
                <div class="footer-company">{{ env('APP_NAME', 'Central Norte') }}</div>
                <div class="footer-contact">
                    {{ env('COMPANY_ADDRESS', 'Buenos Aires, Argentina') }}<br>
                    Tel: {{ env('COMPANY_PHONE', '+54 11 2479-7281') }} |
                    Email: {{ env('COMPANY_EMAIL', 'info@centralnortesrl.com') }}
                </div>
            </td>
            <td class="footer-right" style="width: 40%;">
                <strong>Catálogo de Productos</strong><br>
                <em>{{ date('d/m/Y H:i') }}</em><br>
                <small>Documento generado automáticamente</small>
            </td>
        </tr>
    </table>
</body>

</html>
