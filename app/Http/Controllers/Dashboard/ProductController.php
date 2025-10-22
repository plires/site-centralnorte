<?php

namespace App\Http\Controllers\Dashboard;

use Inertia\Inertia;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Services\ProductSyncService;

class ProductController extends Controller
{
    protected ProductSyncService $syncService;

    public function __construct(ProductSyncService $syncService)
    {
        $this->syncService = $syncService;
    }

    public function index(Request $request)
    {
        $query = Product::with('category')->withoutTrashed();

        // Búsqueda
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('products.name', 'like', "%{$search}%")
                    ->orWhere('products.sku', 'like', "%{$search}%")
                    ->orWhere('products.proveedor', 'like', "%{$search}%")
                    ->orWhereHas('category', function ($categoryQuery) use ($search) {
                        $categoryQuery->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // Ordenamiento con soporte para relaciones
        if ($request->filled('sort')) {
            $direction = $request->get('direction', 'asc');
            $sortField = $request->sort;

            switch ($sortField) {
                case 'category.name':
                    // JOIN con tabla categories para ordenar por nombre de la categoría
                    $query->leftJoin('categories', 'products.category_id', '=', 'categories.id')
                        ->select('products.*')
                        ->orderBy('categories.name', $direction);
                    break;

                default:
                    // Para campos directos de la tabla products
                    $query->orderBy("products.{$sortField}", $direction);
                    break;
            }
        } else {
            $query->orderBy('products.created_at', 'desc'); // Orden por defecto
        }

        $products = $query->paginate(5)->withQueryString();

        // Información de la última sincronización
        $lastSyncInfo = $this->syncService->getLastSyncInfo();

        return Inertia::render('dashboard/products/Index', [
            'products' => $products,
            'last_sync_info' => $lastSyncInfo,
            'is_readonly' => true, // Indicador de que los productos son solo lectura
            'filters' => [
                'search' => $request->search,
                'sort' => $request->sort,
                'direction' => $request->direction,
            ]
        ]);
    }

    public function show(Product $product)
    {
        $product->load('category', 'images', 'featuredImage');

        return inertia('dashboard/products/Show', [
            'product' => $product,
            'is_readonly' => true, // Indicador de que los productos son solo lectura
        ]);
    }

    /**
     * Sincronizar productos desde la API externa
     */
    public function sync(Request $request)
    {
        try {
            $stats = $this->syncService->syncAll();

            if ($stats['errors'] > 0) {
                return redirect()->back()->with('warning', 
                    "Sincronización completada con errores: {$stats['created']} creados, {$stats['updated']} actualizados, {$stats['errors']} errores. Revisa los logs."
                );
            }

            return redirect()->back()->with('success', 
                "Sincronización exitosa: {$stats['created']} productos creados, {$stats['updated']} actualizados, {$stats['images_synced']} imágenes sincronizadas."
            );

        } catch (\Exception $e) {
            Log::error('Error en sincronización manual de productos: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Error al sincronizar productos. Revisa los logs.');
        }
    }

    /**
     * Sincronizar un producto específico
     */
    public function syncOne(Request $request, string $sku)
    {
        try {
            $product = $this->syncService->syncOne($sku);

            if ($product) {
                return redirect()->back()->with('success', "Producto {$sku} sincronizado correctamente.");
            }

            return redirect()->back()->with('error', "No se pudo sincronizar el producto {$sku}. Verifica que exista en la API externa.");

        } catch (\Exception $e) {
            Log::error("Error sincronizando producto {$sku}: " . $e->getMessage());
            return redirect()->back()->with('error', 'Error al sincronizar el producto.');
        }
    }

    // ========================================
    // MÉTODOS DESHABILITADOS (API de solo lectura)
    // ========================================

    /**
     * @deprecated Los productos se gestionan desde la API externa
     */
    public function create()
    {
        return redirect()->route('dashboard.products.index')
            ->with('warning', 'No puedes crear productos localmente. Los productos se sincronizan desde la API externa.');
    }

    /**
     * @deprecated Los productos se gestionan desde la API externa
     */
    public function store(Request $request)
    {
        return redirect()->route('dashboard.products.index')
            ->with('error', 'No puedes crear productos localmente. Los productos se sincronizan desde la API externa.');
    }

    /**
     * @deprecated Los productos se gestionan desde la API externa
     */
    public function edit(Product $product)
    {
        return redirect()->route('dashboard.products.show', $product)
            ->with('warning', 'No puedes editar productos localmente. Los productos se sincronizan desde la API externa.');
    }

    /**
     * @deprecated Los productos se gestionan desde la API externa
     */
    public function update(Request $request, Product $product)
    {
        return redirect()->route('dashboard.products.show', $product)
            ->with('error', 'No puedes editar productos localmente. Los productos se sincronizan desde la API externa.');
    }

    /**
     * @deprecated Los productos se gestionan desde la API externa
     * Solo se permite soft delete si no tiene budget_items asociados
     */
    public function destroy(Product $product)
    {
        // Verificar si tiene budget_items asociados
        if ($product->budgetItems()->exists()) {
            return redirect()->route('dashboard.products.index')
                ->with('error', "No puedes eliminar el producto '{$product->name}' porque está asociado a uno o más presupuestos.");
        }

        try {
            $product->delete();
            return redirect()->route('dashboard.products.index')
                ->with('success', "Producto '{$product->name}' eliminado de la caché local. Se volverá a sincronizar en la próxima actualización.");
        } catch (\Exception $e) {
            Log::error('Error al eliminar producto: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Error al eliminar el producto.');
        }
    }
}
