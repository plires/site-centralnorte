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

        $products = $query->paginate(10)->withQueryString();

        // Información de la última sincronización
        $lastSyncInfo = $this->syncService->getLastSyncInfo();

        return Inertia::render('dashboard/products/Index', [
            'products' => $products,
            'last_sync_info' => $lastSyncInfo,
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
            'product' => $product
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
                return redirect()->back()->with(
                    'warning',
                    "Sincronización completada con errores: {$stats['created']} creados, {$stats['updated']} actualizados, {$stats['errors']} errores. Revisa los logs."
                );
            }

            return redirect()->back()->with(
                'success',
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

    public function create()
    {
        return Inertia::render('dashboard/products/Create', [
            'categories' => Category::all()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'sku' => 'required|string|max:255|unique:products,sku,',
            'name' => ['required', 'string', 'max:255'],
            'description' => 'nullable|string',
            'proveedor' => 'nullable|string|max:255',
            'category_id' => 'required|exists:categories,id',
        ]);

        try {
            $product = Product::create($validated);

            return redirect()->back()->with('success', "Producto '{$product->name}' creado correctamente.");
        } catch (\Exception $e) {
            Log::error('Error al crear el producto: ' . $e->getMessage());

            return redirect()->back()->with('error', 'Ocurrió un error al crear el producto. Inténtalo de nuevo.');
        }
    }

    public function edit(Product $product)
    {
        $categories = Category::all(); // para el select de categorías

        return inertia('dashboard/products/Edit', [
            'product' => $product,
            'categories' => $categories,
        ]);
    }


    public function update(Request $request, Product $product)
    {

        $request->validate([
            'sku' => 'required|string|max:255|unique:products,sku,' . $product->id,
            'name' => ['required', 'string', 'max:255'],
            'description' => 'nullable|string',
            'proveedor' => 'nullable|string|max:255',
            'category_id' => 'required|exists:categories,id',
        ]);

        try {
            $product->update([
                'sku' => $request->sku,
                'name' => $request->name,
                'description' => $request->description,
                'proveedor' => $request->proveedor,
                'category_id' => $request->category_id,
            ]);

            return redirect()->back()->with('success', "Producto '{$product->name}' actualizado correctamente.");
        } catch (\Throwable $e) {
            Log::error('Error al actualizar producto: ' . $e->getMessage());

            return redirect()->back()->with('error', 'Ocurrió un error al actualizar el producto.');
        }
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return redirect()->route('dashboard.products.index')->with('success', 'Producto eliminado.');
    }
}
