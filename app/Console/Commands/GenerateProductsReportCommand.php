<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class GenerateProductsReportCommand extends Command
{
  protected $signature = 'products:report 
                          {--output=products-report.html : Output filename}
                          {--open : Open the file in browser after generation}';

  protected $description = 'Generate a visual ecommerce-style HTML report of all products with filters';

  public function handle(): int
  {
    $this->info('🚀 Generating products report...');
    $this->newLine();

    // Cargar productos con todas sus relaciones
    $products = Product::with([
      'categories',
      'attributes',
      'variants' => function ($query) {
        $query->orderBy('variant_type')->orderBy('sku');
      },
      'featuredImage'
    ])
      ->orderBy('name')
      ->get();

    // Cargar todas las categorías para el filtro (incluyendo show = false)
    $categories = Category::withCount('products')
      ->having('products_count', '>', 0)
      ->orderBy('name')
      ->get();

    $this->info("📦 Found {$products->count()} products");
    $this->info("🏷️  Found {$categories->count()} categories");

    // Generar HTML
    $html = $this->generateHTML($products, $categories);

    // Guardar archivo
    $filename = $this->option('output');
    $path = storage_path('app/public/' . $filename);

    file_put_contents($path, $html);

    $this->newLine();
    $this->info("✅ Report generated successfully!");
    $this->info("📄 File: {$path}");
    $this->info("🌐 URL: " . asset('storage/' . $filename));
    $this->newLine();

    // Abrir en navegador si se especifica
    if ($this->option('open')) {
      $this->info('🌐 Opening in browser...');
      if (PHP_OS_FAMILY === 'Darwin') {
        exec("open {$path}");
      } elseif (PHP_OS_FAMILY === 'Windows') {
        exec("start {$path}");
      } else {
        exec("xdg-open {$path}");
      }
    }

    return self::SUCCESS;
  }

  protected function generateHTML($products, $categories): string
  {
    $totalProducts = $products->count();
    $localProducts = $products->where('origin', 'local')->count();
    $zecatProducts = $products->where('origin', 'Zecat')->count();
    $totalVariants = $products->sum(fn($p) => $p->variants->count());
    $totalAttributes = $products->sum(fn($p) => $p->attributes->count());

    $generatedAt = now()->timezone('America/Argentina/Buenos_Aires')->format('d/m/Y H:i:s');

    // Generar JSON de productos para JavaScript
    $productsJson = $products->map(function ($product) {
      return [
        'id' => $product->id,
        'name' => $product->name,
        'sku' => $product->sku,
        'description' => $product->description,
        'proveedor' => $product->proveedor,
        'last_price' => $product->last_price,
        'origin' => $product->origin,
        'origin_label' => $product->origin === 'Zecat' ? 'API Externa' : 'Local',
        'image' => $product->featuredImage ? $product->featuredImage->full_url : null,
        'categories' => $product->categories->pluck('id')->toArray(),
        'category_names' => $product->categories->pluck('name')->toArray(),
        'attributes_count' => $product->attributes->count(),
        'variants_count' => $product->variants->count(),
        'total_stock' => $product->variants->sum('stock'),
        'attributes' => $product->attributes->map(fn($attr) => [
          'name' => $attr->attribute_name,
          'value' => $attr->value,
        ])->toArray(),
        'variants' => $product->variants->map(fn($variant) => [
          'sku' => $variant->sku,
          'type' => $variant->variant_type,
          'description' => $variant->full_description,
          'stock' => $variant->stock,
          'primary_color' => $variant->primary_color,
          'secondary_color' => $variant->secondary_color,
        ])->toArray(),
      ];
    })->toJson();

    $categoriesJson = $categories->map(function ($category) {
      return [
        'id' => $category->id,
        'name' => $category->name,
        'count' => $category->products_count,
        'show' => $category->show,
      ];
    })->toJson();

    $html = <<<'HTML'
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Catálogo de Productos - Central Norte</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: #f9fafb;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            position: sticky;
            top: 0;
            z-index: 100;
        }

        .header-content {
            max-width: 1400px;
            margin: 0 auto;
        }

        .header h1 {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .header p {
            opacity: 0.9;
            font-size: 1rem;
        }

        .stats {
            display: flex;
            gap: 1rem;
            margin-top: 1rem;
            flex-wrap: wrap;
        }

        .stat-badge {
            background: rgba(255,255,255,0.2);
            padding: 0.5rem 1rem;
            border-radius: 8px;
            font-size: 0.9rem;
            backdrop-filter: blur(10px);
        }

        .stat-badge strong {
            font-weight: 700;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem 1rem;
        }

        .filters {
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
        }

        .filters-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }

        .filters-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: #111827;
        }

        .search-box {
            flex: 1;
            max-width: 400px;
            position: relative;
        }

        .search-box input {
            width: 100%;
            padding: 0.75rem 1rem 0.75rem 2.5rem;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 1rem;
            transition: all 0.2s;
        }

        .search-box input:focus {
            outline: none;
            border-color: #667eea;
        }

        .search-icon {
            position: absolute;
            left: 0.75rem;
            top: 50%;
            transform: translateY(-50%);
            color: #9ca3af;
        }

        .category-toggle {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem 1rem;
            background: #f9fafb;
            border-radius: 8px;
            margin-bottom: 1rem;
            border: 1px solid #e5e7eb;
        }

        .category-toggle label {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.9rem;
            color: #374151;
            font-weight: 500;
            cursor: pointer;
            user-select: none;
        }

        .toggle-switch {
            position: relative;
            display: inline-block;
            width: 48px;
            height: 24px;
        }

        .toggle-switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }

        .toggle-slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #cbd5e1;
            transition: 0.3s;
            border-radius: 24px;
        }

        .toggle-slider:before {
            position: absolute;
            content: "";
            height: 18px;
            width: 18px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            transition: 0.3s;
            border-radius: 50%;
        }

        input:checked + .toggle-slider {
            background-color: #667eea;
        }

        input:checked + .toggle-slider:before {
            transform: translateX(24px);
        }

        .category-filters {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
        }

        .category-btn {
            padding: 0.5rem 1rem;
            border: 2px solid #e5e7eb;
            background: white;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 0.9rem;
            font-weight: 500;
            color: #374151;
        }

        .category-btn:hover {
            border-color: #667eea;
            background: #f3f4f6;
        }

        .category-btn.active {
            background: #667eea;
            border-color: #667eea;
            color: white;
        }

        .category-btn .count {
            background: rgba(0,0,0,0.1);
            padding: 0.15rem 0.5rem;
            border-radius: 12px;
            font-size: 0.8rem;
            margin-left: 0.5rem;
        }

        .category-btn.active .count {
            background: rgba(255,255,255,0.2);
        }

        .category-btn.inactive {
            opacity: 0.6;
            border-style: dashed;
        }

        .category-btn.inactive .count {
            background: rgba(239, 68, 68, 0.1);
            color: #dc2626;
        }

        .results-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            padding: 1rem;
            background: white;
            border-radius: 8px;
        }

        .results-count {
            font-size: 1rem;
            color: #6b7280;
        }

        .results-count strong {
            color: #111827;
            font-weight: 600;
        }

        .products-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        .product-card {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            transition: all 0.3s;
            cursor: pointer;
            display: flex;
            flex-direction: column;
        }

        .product-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 24px rgba(0,0,0,0.15);
        }

        .product-image {
            width: 100%;
            height: 250px;
            object-fit: contain;
            background: #f9fafb;
            padding: 1rem;
        }

        .product-image.no-image {
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
            color: #9ca3af;
            font-size: 3rem;
        }

        .product-body {
            padding: 1.25rem;
            flex: 1;
            display: flex;
            flex-direction: column;
        }

        .product-header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 0.75rem;
            gap: 0.5rem;
        }

        .product-name {
            font-size: 1.1rem;
            font-weight: 600;
            color: #111827;
            line-height: 1.3;
            flex: 1;
        }

        .badge {
            padding: 0.25rem 0.6rem;
            border-radius: 6px;
            font-size: 0.7rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            white-space: nowrap;
        }

        .badge-zecat {
            background: #dbeafe;
            color: #1e40af;
        }

        .badge-local {
            background: #d1fae5;
            color: #065f46;
        }

        .product-meta {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            margin-bottom: 1rem;
            font-size: 0.9rem;
            color: #6b7280;
        }

        .product-meta-row {
            display: flex;
            justify-content: space-between;
        }

        .product-price {
            font-size: 1.5rem;
            font-weight: 700;
            color: #667eea;
            margin-bottom: 0.75rem;
        }

        .product-categories {
            display: flex;
            flex-wrap: wrap;
            gap: 0.4rem;
            margin-bottom: 0.75rem;
        }

        .category-tag {
            background: #f3e8ff;
            color: #6b21a8;
            padding: 0.25rem 0.6rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 500;
        }

        .product-stats {
            display: flex;
            gap: 1rem;
            padding-top: 0.75rem;
            border-top: 1px solid #e5e7eb;
            font-size: 0.85rem;
            color: #6b7280;
            margin-top: auto;
        }

        .product-stat {
            display: flex;
            align-items: center;
            gap: 0.3rem;
        }

        .product-stat strong {
            color: #111827;
            font-weight: 600;
        }

        /* Modal */
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 1000;
            align-items: center;
            justify-content: center;
            padding: 1rem;
            overflow-y: auto;
        }

        .modal.active {
            display: flex;
        }

        .modal-content {
            background: white;
            border-radius: 12px;
            width: 100%;
            max-width: 900px;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
        }

        .modal-header {
            padding: 1.5rem;
            border-bottom: 1px solid #e5e7eb;
            position: sticky;
            top: 0;
            background: white;
            z-index: 10;
        }

        .modal-close {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: #f3f4f6;
            border: none;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 1.2rem;
            line-height: 1;
            transition: all 0.2s;
        }

        .modal-close:hover {
            background: #e5e7eb;
        }

        .modal-body {
            padding: 1.5rem;
        }

        .modal-section {
            margin-bottom: 2rem;
        }

        .modal-section:last-child {
            margin-bottom: 0;
        }

        .modal-section-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: #111827;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #e5e7eb;
        }

        .attributes-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 0.75rem;
        }

        .attribute-item {
            background: #fef3c7;
            padding: 0.75rem;
            border-radius: 6px;
            border-left: 3px solid #f59e0b;
        }

        .attribute-name {
            font-weight: 600;
            color: #92400e;
            font-size: 0.85rem;
            margin-bottom: 0.25rem;
        }

        .attribute-value {
            color: #78350f;
            font-size: 0.9rem;
        }

        .variants-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.9rem;
        }

        .variants-table th {
            background: #f3f4f6;
            padding: 0.75rem;
            text-align: left;
            font-weight: 600;
            color: #374151;
            border-bottom: 2px solid #e5e7eb;
        }

        .variants-table td {
            padding: 0.75rem;
            border-bottom: 1px solid #e5e7eb;
        }

        .variants-table tr:hover {
            background: #f9fafb;
        }

        .variant-type {
            display: inline-block;
            padding: 0.25rem 0.6rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
        }

        .variant-apparel {
            background: #fce7f3;
            color: #9f1239;
        }

        .variant-standard {
            background: #e0e7ff;
            color: #3730a3;
        }

        .stock {
            font-weight: 600;
        }

        .stock-good {
            color: #059669;
        }

        .stock-low {
            color: #d97706;
        }

        .stock-out {
            color: #dc2626;
        }

        .color-indicator {
            display: inline-block;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 2px solid #e5e7eb;
            vertical-align: middle;
        }

        .no-data {
            color: #9ca3af;
            font-style: italic;
            text-align: center;
            padding: 2rem;
            background: #f9fafb;
            border-radius: 8px;
        }

        .empty-state {
            text-align: center;
            padding: 4rem 2rem;
            color: #6b7280;
        }

        .empty-state-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
            opacity: 0.3;
        }

        .empty-state-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: #111827;
            margin-bottom: 0.5rem;
        }

        .footer {
            background: white;
            padding: 2rem;
            text-align: center;
            color: #6b7280;
            font-size: 0.9rem;
            border-top: 1px solid #e5e7eb;
            margin-top: 2rem;
        }

        @media (max-width: 768px) {
            .products-grid {
                grid-template-columns: 1fr;
            }

            .category-filters {
                max-height: 200px;
                overflow-y: auto;
            }

            .filters-header {
                flex-direction: column;
                align-items: stretch;
                gap: 1rem;
            }

            .search-box {
                max-width: 100%;
            }
        }

        @media print {
            .filters, .modal {
                display: none !important;
            }
            
            .product-card {
                break-inside: avoid;
            }
        }
    </style>
</head>
<body>
HTML;

    $html .= <<<HTML
    <div class="header">
        <div class="header-content">
            <h1>📦 Catálogo de Productos</h1>
            <p>Central Norte - Sistema de Gestión de Presupuestos</p>
            <div class="stats">
                <div class="stat-badge">
                    <strong>{$totalProducts}</strong> Productos
                </div>
                <div class="stat-badge">
                    <strong>{$localProducts}</strong> Locales
                </div>
                <div class="stat-badge">
                    <strong>{$zecatProducts}</strong> API Externa
                </div>
                <div class="stat-badge">
                    <strong>{$totalVariants}</strong> Variantes
                </div>
                <div class="stat-badge">
                    <strong>{$totalAttributes}</strong> Atributos
                </div>
            </div>
        </div>
    </div>

    <div class="container">
        <div class="filters">
            <div class="filters-header">
                <div class="filters-title">🔍 Filtros</div>
                <div class="search-box">
                    <span class="search-icon">🔍</span>
                    <input 
                        type="text" 
                        id="searchInput" 
                        placeholder="Buscar por nombre, SKU o proveedor..."
                    >
                </div>
            </div>
            
            <div class="category-toggle">
                <label>
                    <div class="toggle-switch">
                        <input type="checkbox" id="showAllCategories">
                        <span class="toggle-slider"></span>
                    </div>
                    <span>Mostrar categorías inactivas</span>
                </label>
            </div>

            <div class="category-filters" id="categoryFilters">
                <button class="category-btn active" data-category="all">
                    Todas las categorías
                    <span class="count">{$totalProducts}</span>
                </button>
            </div>
        </div>

        <div class="results-info">
            <div class="results-count">
                Mostrando <strong id="resultsCount">{$totalProducts}</strong> productos
            </div>
        </div>

        <div class="products-grid" id="productsGrid">
            <!-- Products will be rendered by JavaScript -->
        </div>

        <div class="empty-state" id="emptyState" style="display: none;">
            <div class="empty-state-icon">🔍</div>
            <div class="empty-state-title">No se encontraron productos</div>
            <p>Intenta con otros filtros o búsqueda</p>
        </div>
    </div>

    <div class="modal" id="productModal">
        <div class="modal-content">
            <div class="modal-header">
                <button class="modal-close" onclick="closeModal()">×</button>
                <div id="modalHeader"></div>
            </div>
            <div class="modal-body" id="modalBody"></div>
        </div>
    </div>

    <div class="footer">
        <p><strong>Reporte generado el {$generatedAt}</strong></p>
        <p>Este documento contiene información detallada de todos los productos del sistema</p>
    </div>

    <script>
        // Data
        const products = {$productsJson};
        const categories = {$categoriesJson};
        
        let filteredProducts = [...products];
        let activeCategory = 'all';
        let searchTerm = '';
        let showAllCategories = false;

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            renderCategoryButtons();
            renderProducts();
            setupEventListeners();
        });

        function renderCategoryButtons() {
            const container = document.getElementById('categoryFilters');
            
            // Limpiar botones existentes excepto "Todas las categorías"
            const allButton = container.querySelector('[data-category="all"]');
            container.innerHTML = '';
            container.appendChild(allButton);
            
            // Filtrar categorías según el toggle
            const categoriesToShow = showAllCategories 
                ? categories 
                : categories.filter(cat => cat.show);
            
            categoriesToShow.forEach(category => {
                const button = document.createElement('button');
                button.className = 'category-btn';
                
                // Agregar clase 'inactive' si show = false
                if (!category.show) {
                    button.classList.add('inactive');
                }
                
                button.dataset.category = category.id;
                button.innerHTML = `
                    \${category.name}
                    <span class="count">\${category.count}</span>
                `;
                button.onclick = () => filterByCategory(category.id);
                container.appendChild(button);
            });

            // Actualizar contador del botón "Todas las categorías"
            updateAllCategoriesCount();
        }

        function updateAllCategoriesCount() {
            const allButton = document.querySelector('[data-category="all"]');
            const visibleCategories = showAllCategories 
                ? categories 
                : categories.filter(cat => cat.show);
            
            // Contar productos únicos en categorías visibles
            const visibleCategoryIds = visibleCategories.map(cat => cat.id);
            const productsInVisibleCategories = products.filter(product => 
                product.categories.some(catId => visibleCategoryIds.includes(catId))
            );
            
            allButton.querySelector('.count').textContent = productsInVisibleCategories.length;
        }

        function setupEventListeners() {
            document.getElementById('searchInput').addEventListener('input', (e) => {
                searchTerm = e.target.value.toLowerCase();
                applyFilters();
            });

            // Listener para el toggle
            document.getElementById('showAllCategories').addEventListener('change', (e) => {
                showAllCategories = e.target.checked;
                renderCategoryButtons();
                
                // Si la categoría activa está oculta, volver a "todas"
                if (activeCategory !== 'all') {
                    const activeIsVisible = showAllCategories || 
                        categories.find(cat => cat.id === parseInt(activeCategory))?.show;
                    
                    if (!activeIsVisible) {
                        filterByCategory('all');
                    }
                }
            });

            // Close modal on outside click
            document.getElementById('productModal').addEventListener('click', (e) => {
                if (e.target.id === 'productModal') {
                    closeModal();
                }
            });
        }

        function filterByCategory(categoryId) {
            activeCategory = categoryId;
            
            // Update active button
            document.querySelectorAll('.category-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelector(`[data-category="\${categoryId}"]`).classList.add('active');
            
            applyFilters();
        }

        function applyFilters() {
            // Obtener IDs de categorías visibles
            const visibleCategories = showAllCategories 
                ? categories 
                : categories.filter(cat => cat.show);
            const visibleCategoryIds = visibleCategories.map(cat => cat.id);

            filteredProducts = products.filter(product => {
                // Category filter
                let matchesCategory = false;
                
                if (activeCategory === 'all') {
                    // Si es "todas", mostrar productos que tengan al menos una categoría visible
                    matchesCategory = product.categories.some(catId => 
                        visibleCategoryIds.includes(catId)
                    );
                } else {
                    // Si es una categoría específica
                    matchesCategory = product.categories.includes(parseInt(activeCategory));
                }
                
                // Search filter
                const matchesSearch = !searchTerm || 
                    product.name.toLowerCase().includes(searchTerm) ||
                    product.sku.toLowerCase().includes(searchTerm) ||
                    (product.proveedor && product.proveedor.toLowerCase().includes(searchTerm));
                
                return matchesCategory && matchesSearch;
            });

            renderProducts();
        }

        function renderProducts() {
            const grid = document.getElementById('productsGrid');
            const emptyState = document.getElementById('emptyState');
            const resultsCount = document.getElementById('resultsCount');
            
            resultsCount.textContent = filteredProducts.length;

            if (filteredProducts.length === 0) {
                grid.style.display = 'none';
                emptyState.style.display = 'block';
                return;
            }

            grid.style.display = 'grid';
            emptyState.style.display = 'none';

            grid.innerHTML = filteredProducts.map(product => `
                <div class="product-card" onclick="openModal(\${product.id})">
                    \${product.image ? 
                        `<img src="\${product.image}" alt="\${product.name}" class="product-image">` :
                        `<div class="product-image no-image">📦</div>`
                    }
                    <div class="product-body">
                        <div class="product-header">
                            <div class="product-name">\${product.name}</div>
                            <span class="badge badge-\${product.origin === 'Zecat' ? 'zecat' : 'local'}">
                                \${product.origin_label}
                            </span>
                        </div>
                        
                        <div class="product-price">$ \${parseFloat(product.last_price).toFixed(2)}</div>
                        
                        <div class="product-meta">
                            <div class="product-meta-row">
                                <span><strong>SKU:</strong> \${product.sku}</span>
                            </div>
                            \${product.proveedor ? `
                                <div class="product-meta-row">
                                    <span><strong>Proveedor:</strong> \${product.proveedor}</span>
                                </div>
                            ` : ''}
                        </div>

                        \${product.category_names.length > 0 ? `
                            <div class="product-categories">
                                \${product.category_names.map(cat => 
                                    `<span class="category-tag">\${cat}</span>`
                                ).join('')}
                            </div>
                        ` : ''}

                        <div class="product-stats">
                            <div class="product-stat">
                                🏷️ <strong>\${product.attributes_count}</strong> atributos
                            </div>
                            <div class="product-stat">
                                🔀 <strong>\${product.variants_count}</strong> variantes
                            </div>
                            <div class="product-stat">
                                📦 <strong>\${product.total_stock}</strong> stock
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        function openModal(productId) {
            const product = products.find(p => p.id === productId);
            if (!product) return;

            const modal = document.getElementById('productModal');
            const modalHeader = document.getElementById('modalHeader');
            const modalBody = document.getElementById('modalBody');

            modalHeader.innerHTML = `
                <div class="product-header">
                    <div class="product-name" style="font-size: 1.5rem;">\${product.name}</div>
                    <span class="badge badge-\${product.origin === 'Zecat' ? 'zecat' : 'local'}">
                        \${product.origin_label}
                    </span>
                </div>
                <div class="product-meta">
                    <div class="product-meta-row">
                        <span><strong>SKU:</strong> \${product.sku}</span>
                        <span><strong>Precio:</strong> $ \${parseFloat(product.last_price).toFixed(2)}</span>
                    </div>
                    \${product.proveedor ? `
                        <div class="product-meta-row">
                            <span><strong>Proveedor:</strong> \${product.proveedor}</span>
                        </div>
                    ` : ''}
                </div>
            `;

            modalBody.innerHTML = `
                \${product.image ? `
                    <div class="modal-section">
                        <img src="\${product.image}" alt="\${product.name}" style="width: 100%; max-height: 400px; object-fit: contain; background: #f9fafb; padding: 1rem; border-radius: 8px;">
                    </div>
                ` : ''}

                \${product.description ? `
                    <div class="modal-section">
                        <div class="modal-section-title">📝 Descripción</div>
                        <p>\${product.description}</p>
                    </div>
                ` : ''}

                \${product.category_names.length > 0 ? `
                    <div class="modal-section">
                        <div class="modal-section-title">🏷️ Categorías</div>
                        <div class="product-categories">
                            \${product.category_names.map(cat => 
                                `<span class="category-tag">\${cat}</span>`
                            ).join('')}
                        </div>
                    </div>
                ` : ''}

                <div class="modal-section">
                    <div class="modal-section-title">⚙️ Atributos (\${product.attributes_count})</div>
                    \${product.attributes.length > 0 ? `
                        <div class="attributes-grid">
                            \${product.attributes.map(attr => `
                                <div class="attribute-item">
                                    <div class="attribute-name">\${attr.name}</div>
                                    <div class="attribute-value">\${attr.value}</div>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<div class="no-data">Sin atributos definidos</div>'}
                </div>

                <div class="modal-section">
                    <div class="modal-section-title">🔀 Variantes (\${product.variants_count})</div>
                    \${product.variants.length > 0 ? `
                        <table class="variants-table">
                            <thead>
                                <tr>
                                    <th>SKU</th>
                                    <th>Tipo</th>
                                    <th>Descripción</th>
                                    <th>Colores</th>
                                    <th>Stock</th>
                                </tr>
                            </thead>
                            <tbody>
                                \${product.variants.map(variant => {
                                    const stockClass = variant.stock > 50 ? 'stock-good' : 
                                                     (variant.stock > 0 ? 'stock-low' : 'stock-out');
                                    
                                    let colorsHtml = '';
                                    if (variant.primary_color) {
                                        colorsHtml += `<span class="color-indicator" style="background-color: \${variant.primary_color}" title="\${variant.primary_color}"></span> `;
                                    }
                                    if (variant.secondary_color) {
                                        colorsHtml += `<span class="color-indicator" style="background-color: \${variant.secondary_color}" title="\${variant.secondary_color}"></span>`;
                                    }
                                    if (!colorsHtml) {
                                        colorsHtml = '<span class="no-data">N/A</span>';
                                    }

                                    return `
                                        <tr>
                                            <td><code>\${variant.sku}</code></td>
                                            <td><span class="variant-type variant-\${variant.type}">\${variant.type === 'apparel' ? 'Apparel' : 'Standard'}</span></td>
                                            <td>\${variant.description || 'N/A'}</td>
                                            <td>\${colorsHtml}</td>
                                            <td><span class="stock \${stockClass}">\${variant.stock}</span></td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    ` : '<div class="no-data">Sin variantes disponibles</div>'}
                </div>
            `;

            modal.classList.add('active');
        }

        function closeModal() {
            document.getElementById('productModal').classList.remove('active');
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        });
    </script>
</body>
</html>
HTML;

    return $html;
  }
}
