<?php

namespace App\Http\Controllers\Dashboard;

use Inertia\Inertia;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Category;
use Illuminate\Http\Request;
use App\Traits\ExportsToExcel;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Services\ProductSyncService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{

    use ExportsToExcel;

    protected ProductSyncService $syncService;

    public function __construct(ProductSyncService $syncService)
    {
        $this->syncService = $syncService;
    }

    public function index(Request $request)
    {
        $query = Product::with(['categories', 'featuredImage'])->withoutTrashed();

        // Filtro por origen
        if ($request->filled('origin')) {
            $query->where('origin', $request->origin);
        }

        // Búsqueda
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('products.name', 'like', "%{$search}%")
                    ->orWhere('products.sku', 'like', "%{$search}%")
                    ->orWhere('products.proveedor', 'like', "%{$search}%")
                    ->orWhereHas('categories', function ($categoryQuery) use ($search) {
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
                    $query->leftJoin('category_product', 'products.id', '=', 'category_product.product_id')
                        ->leftJoin('categories', 'category_product.category_id', '=', 'categories.id')
                        ->select('products.*')
                        ->groupBy('products.id')
                        ->orderByRaw("MIN(categories.name) {$direction}");
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

        // Cargar categorías en cada producto para el frontend
        $products->getCollection()->transform(function ($product) {
            $product->category_names = $product->categories->pluck('name')->toArray();
            return $product;
        });

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

        $product->load('categories', 'images', 'featuredImage', 'attributes', 'variants');

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
                "Sincronización exitosa: {$stats['created']} productos creados, {$stats['updated']} actualizados, {$stats['images_synced']} imágenes, {$stats['attributes_synced']} atributos y {$stats['variants_synced']} variantes sincronizadas."
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
                return redirect()->back()->with('success', "Producto {$product->name} sincronizado correctamente.");
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
            'categories' => Category::where('show', true)->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'sku' => 'required|string|max:255|unique:products,sku,',
            'name' => ['required', 'string', 'max:255'],
            'description' => 'nullable|string',
            'proveedor' => 'nullable|string|max:255',
            'category_ids' => 'required|array|min:1',
            'category_ids.*' => 'exists:categories,id',
            // VALIDACIONES PARA ATRIBUTOS
            'attributes' => 'nullable|array',
            'attributes.*.attribute_name' => 'required_with:attributes|string|max:255',
            'attributes.*.value' => 'required_with:attributes|string|max:255',
            // VALIDACIONES PARA VARIANTES
            'variants' => 'nullable|array',
            'variants.*.sku' => [
                'required_with:variants',
                'string',
                'max:255',
                'distinct',
                Rule::unique('product_variants', 'sku')->whereNull('deleted_at'),
            ],
            'variants.*.variant_type' => 'required_with:variants|in:apparel,standard',
            'variants.*.stock' => 'nullable|integer|min:0',
            'variants.*.size' => 'nullable|string|max:50',
            'variants.*.color' => 'nullable|string|max:100',
            'variants.*.primary_color_text' => 'nullable|string|max:255',
            'variants.*.secondary_color_text' => 'nullable|string|max:255',
            'variants.*.material_text' => 'nullable|string|max:255',
            'variants.*.primary_color' => 'nullable|string|max:50',
            'variants.*.secondary_color' => 'nullable|string|max:50',
        ]);

        // Validar que no se mezclen tipos de variantes
        if (!empty($validated['variants'])) {
            $types = collect($validated['variants'])->pluck('variant_type')->unique();
            if ($types->count() > 1) {
                return redirect()->back()
                    ->withErrors(['variants' => 'No se pueden mezclar variantes de tipo Apparel y Standard en un mismo producto.'])
                    ->withInput();
            }
        }

        try {

            DB::beginTransaction();

            $product = Product::create($validated);
            $product->categories()->attach($validated['category_ids']);

            // Crear variantes
            if (!empty($validated['variants'])) {
                // Eliminar definitivamente variantes soft-deleted con SKUs que se van a reusar
                $incomingSkus = collect($validated['variants'])->pluck('sku')->toArray();
                ProductVariant::onlyTrashed()->whereIn('sku', $incomingSkus)->forceDelete();

                foreach ($validated['variants'] as $variantData) {
                    $product->variants()->create([
                        'sku' => $variantData['sku'],
                        'variant_type' => $variantData['variant_type'],
                        'stock' => $variantData['stock'] ?? 0,
                        'size' => $variantData['size'] ?? null,
                        'color' => $this->normalizeColorText($variantData['color'] ?? null),
                        'primary_color_text' => $this->capitalizeText($variantData['primary_color_text'] ?? null),
                        'secondary_color_text' => $this->capitalizeText($variantData['secondary_color_text'] ?? null),
                        'material_text' => $variantData['material_text'] ?? null,
                        'primary_color' => $variantData['primary_color'] ?? null,
                        'secondary_color' => $variantData['secondary_color'] ?? null,
                    ]);
                }
            }

            DB::commit();

            return redirect()->route('dashboard.products.show', $product->id)->with('success', "Producto '{$product->name}' creado correctamente.");
        } catch (\Exception $e) {
            Log::error('Error al crear el producto: ' . $e->getMessage());

            return redirect()->back()->with('error', 'Ocurrió un error al crear el producto. Inténtalo de nuevo.');
        }
    }

    public function edit(Product $product)
    {

        // Redirigir si intentan editar producto externo
        if ($product->isExternal()) {
            return redirect()
                ->route('dashboard.products.index', $product)
                ->with('error', 'No puedes editar productos sincronizados desde la API externa.');
        }

        // Cargar categorías del producto
        $product->load('categories', 'attributes', 'variants');

        $categories = Category::where('show', true)->get();

        return inertia('dashboard/products/Edit', [
            'product' => $product,
            'categories' => $categories,
            'selected_category_ids' => $product->categories->pluck('id')->toArray(),
        ]);
    }


    public function update(Request $request, Product $product)
    {

        // No permitir editar productos externos
        if ($product->isExternal()) {
            return redirect()
                ->back()
                ->with('error', 'No puedes editar productos sincronizados desde la API externa.');
        }

        // IDs de variantes que pertenecen a este producto (para excluirlas del unique)
        $ownVariantIds = $product->variants()->pluck('id')->toArray();

        $validated = $request->validate([
            'sku' => 'required|string|max:255|unique:products,sku,' . $product->id,
            'name' => ['required', 'string', 'max:255'],
            'description' => 'nullable|string',
            'proveedor' => 'nullable|string|max:255',
            'category_ids' => 'required|array|min:1',
            'category_ids.*' => 'exists:categories,id',
            'is_visible_in_front' => 'boolean',
            // VALIDACIONES PARA ATRIBUTOS
            'attributes' => 'nullable|array',
            'attributes.*.attribute_name' => 'required_with:attributes|string|max:255',
            'attributes.*.value' => 'required_with:attributes|string|max:255',
            // VALIDACIONES PARA VARIANTES
            'variants' => 'nullable|array',
            'variants.*.sku' => [
                'required_with:variants',
                'string',
                'max:255',
                'distinct',
                Rule::unique('product_variants', 'sku')
                    ->whereNull('deleted_at')
                    ->whereNotIn('id', $ownVariantIds),
            ],
            'variants.*.variant_type' => 'required_with:variants|in:apparel,standard',
            'variants.*.stock' => 'nullable|integer|min:0',
            'variants.*.size' => 'nullable|string|max:50',
            'variants.*.color' => 'nullable|string|max:100',
            'variants.*.primary_color_text' => 'nullable|string|max:255',
            'variants.*.secondary_color_text' => 'nullable|string|max:255',
            'variants.*.material_text' => 'nullable|string|max:255',
            'variants.*.primary_color' => 'nullable|string|max:50',
            'variants.*.secondary_color' => 'nullable|string|max:50',
        ]);

        // Validar que no se mezclen tipos de variantes
        if (!empty($validated['variants'])) {
            $types = collect($validated['variants'])->pluck('variant_type')->unique();
            if ($types->count() > 1) {
                return redirect()->back()
                    ->withErrors(['variants' => 'No se pueden mezclar variantes de tipo Apparel y Standard en un mismo producto.'])
                    ->withInput();
            }
        }

        try {
            DB::beginTransaction();

            $product->update([
                'sku' => $validated['sku'],
                'name' => $validated['name'],
                'description' => $validated['description'],
                'proveedor' => $validated['proveedor'],
                'is_visible_in_front' => $validated['is_visible_in_front'] ?? $product->is_visible_in_front,
            ]);

            // Sincronizar categorías (reemplaza todas)
            $product->categories()->sync($validated['category_ids']);

            // Sincronizar atributos
            // Eliminar atributos existentes y crear nuevos
            $product->attributes()->delete();
            if (!empty($validated['attributes'])) {
                foreach ($validated['attributes'] as $attrData) {
                    $product->attributes()->create([
                        'attribute_name' => $attrData['attribute_name'],
                        'value' => $attrData['value'],
                    ]);
                }
            }

            // Sincronizar variantes
            // Obtener SKUs existentes y nuevos
            $existingSkus = $product->variants()->pluck('sku')->toArray();
            $newSkus = collect($validated['variants'] ?? [])->pluck('sku')->toArray();

            // Eliminar variantes que ya no están
            $skusToDelete = array_diff($existingSkus, $newSkus);
            if (!empty($skusToDelete)) {
                // Obtener los labels de variante de las variantes a eliminar
                // para limpiar las imágenes asociadas
                $variantsToDelete = $product->variants()->whereIn('sku', $skusToDelete)->get();
                $variantLabels = $variantsToDelete->map(function ($v) {
                    return $this->buildVariantImageLabel($v->toArray());
                })->filter()->values()->toArray();

                // Limpiar el campo variant de las imágenes asociadas
                if (!empty($variantLabels)) {
                    $product->images()->whereIn('variant', $variantLabels)->update(['variant' => null]);
                }

                $product->variants()->whereIn('sku', $skusToDelete)->delete();
            }

            // Actualizar o crear variantes
            if (!empty($validated['variants'])) {
                // Eliminar definitivamente variantes soft-deleted con SKUs que se van a reusar
                $incomingSkus = collect($validated['variants'])->pluck('sku')->toArray();
                ProductVariant::onlyTrashed()->whereIn('sku', $incomingSkus)->forceDelete();

                foreach ($validated['variants'] as $variantData) {
                    // Obtener el label anterior de la variante (si ya existía) para actualizar imágenes
                    $existingVariant = $product->variants()->where('sku', $variantData['sku'])->first();
                    $oldLabel = null;
                    if ($existingVariant) {
                        $oldLabel = $this->buildVariantImageLabel($existingVariant->toArray());
                    }

                    // Normalizar y capitalizar los campos de texto de color
                    $variantData['color'] = $this->normalizeColorText($variantData['color'] ?? null);
                    $variantData['primary_color_text'] = $this->capitalizeText($variantData['primary_color_text'] ?? null);
                    $variantData['secondary_color_text'] = $this->capitalizeText($variantData['secondary_color_text'] ?? null);

                    $product->variants()->updateOrCreate(
                        ['sku' => $variantData['sku']],
                        [
                            'variant_type' => $variantData['variant_type'],
                            'stock' => $variantData['stock'] ?? 0,
                            'size' => $variantData['size'] ?? null,
                            'color' => $variantData['color'],
                            'primary_color_text' => $variantData['primary_color_text'],
                            'secondary_color_text' => $variantData['secondary_color_text'],
                            'material_text' => $variantData['material_text'] ?? null,
                            'primary_color' => $variantData['primary_color'] ?? null,
                            'secondary_color' => $variantData['secondary_color'] ?? null,
                        ]
                    );

                    // Si el label cambió, actualizar las imágenes enlazadas
                    $newLabel = $this->buildVariantImageLabel($variantData);
                    if ($oldLabel && $oldLabel !== $newLabel) {
                        $product->images()->where('variant', $oldLabel)->update(['variant' => $newLabel]);
                    }
                }
            }

            DB::commit();

            return redirect()->back()->with('success', "Producto '{$product->name}' actualizado correctamente.");
        } catch (\Throwable $e) {
            Log::error('Error al actualizar producto: ' . $e->getMessage());

            return redirect()->back()->with('error', 'Ocurrió un error al actualizar el producto.');
        }
    }

    public function destroy(Product $product)
    {

        // No permitir eliminar productos externos
        if ($product->isExternal()) {
            return redirect()
                ->back()
                ->with('error', 'No puedes eliminar productos sincronizados desde la API externa.');
        }

        $product->delete();

        return redirect()->route('dashboard.products.index')->with('success', 'Producto eliminado.');
    }

    /**
     * Exportar listado de productos a Excel
     * Solo accesible para usuarios con role 'admin'
     */
    public function export(Request $request)
    {
        try {

            // Verificar que el usuario sea admin
            $user = Auth::user();

            // Verificar que el usuario sea admin
            if ($user->role->name !== 'admin') {
                // Si es una petición AJAX, devolver JSON
                if ($request->wantsJson() || $request->ajax()) {
                    return response()->json([
                        'message' => 'No tienes permisos para exportar datos.'
                    ], 403);
                }

                // Si es navegación directa, abort normal
                abort(403, 'No tienes permisos para exportar datos.');
            }

            $products = Product::all();

            // Verificar si hay datos para exportar
            if ($products->isEmpty()) {
                if ($request->wantsJson() || $request->ajax()) {
                    return response()->json([
                        'message' => 'No hay productos para exportar.'
                    ], 404);
                }

                return redirect()->back()->with('error', 'No hay productos para exportar.');
            }

            // Definir encabezados y sus keys correspondientes
            $headers = [
                'id' => 'ID',
                'sku' => 'SKU',
                'name' => 'Nombre',
                'categories' => 'Categorias',
                'description' => 'Descripción',
                'proveedor' => 'Proveedor',
                'last_price' => 'Precio',
                'origin' => 'Origen del Producto',
                'images' => 'imágenes del Producto',
                'created_at' => 'Fecha de Creación',
                'updated_at' => 'Última Actualización',
                'deleted_at' => 'Fecha de Eliminación',
            ];

            // Preparar datos para exportación
            $data = $products->map(function ($product) {
                return [
                    'id' => $product->id,
                    'sku' => $product->sku,
                    'name' => $product->name,
                    'categories' => $product->categories ? $product->categories->pluck('name')->join(', ') : '',
                    'description' => $product->description,
                    'proveedor' => $product->proveedor,
                    'last_price' => $product->last_price,
                    'origin' => $product->origin,
                    'images' => $product->images ? $product->images->pluck('url')->join(', ') : '',
                    'created_at' => $product->created_at ? $product->created_at->format('d/m/Y H:i') : '',
                    'updated_at' => $product->updated_at ? $product->updated_at->format('d/m/Y H:i') : '',
                    'deleted_at' => $product->deleted_at ? $product->deleted_at->format('d/m/Y H:i') : '',
                ];
            })->toArray();

            // Log de exportación exitosa
            Log::info('Productos exportados', [
                'user_id' => $user->id,
                'user_name' => $user->name,
                'count' => count($data),
            ]);

            // Exportar usando el trait
            return $this->exportToExcel(
                data: $data,
                headers: $headers,
                filename: 'productos',
                sheetTitle: 'Lista de Productos'
            );
        } catch (\Exception $e) {
            // Log del error
            Log::error('Error al exportar productos', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Si es petición AJAX, devolver JSON
            if ($request->wantsJson() || $request->ajax()) {
                return response()->json([
                    'message' => 'Error al generar el archivo de exportación. Por favor, inténtalo de nuevo.'
                ], 500);
            }

            // Si es navegación normal, redirect con error
            return redirect()->back()->with('error', 'Error al generar el archivo de exportación. Por favor, inténtalo de nuevo.');
        }
    }

    /**
     * Capitaliza un valor de texto con mb_convert_case.
     */
    private function capitalizeText(?string $value): ?string
    {
        if (empty($value)) {
            return null;
        }

        return mb_convert_case(trim($value), MB_CASE_TITLE, 'UTF-8');
    }

    /**
     * Normaliza un texto de colores separando los términos con " / " y capitalizando.
     * Acepta comas, guiones, barras, "y" o espacios como separadores.
     * Ej: "rojo, azul y verde" → "Rojo / Azul / Verde"
     */
    private function normalizeColorText(?string $value): ?string
    {
        if (empty($value)) {
            return null;
        }

        // Separar por comas, guiones, barras, " y " / "Y"
        $parts = preg_split('/\s*[,\-\/]\s*|\s+y\s+/iu', $value);

        // Si no se separó, intentar separar por espacios (caso "Rojo Azul")
        if (count($parts) === 1) {
            $parts = preg_split('/\s+/', trim($value));
        }

        // Limpiar, capitalizar y filtrar vacíos
        $parts = array_filter(array_map(function ($part) {
            return mb_convert_case(trim($part), MB_CASE_TITLE, 'UTF-8');
        }, $parts), fn($part) => $part !== '');

        $result = implode(' / ', $parts);

        return $result ?: null;
    }

    /**
     * Genera el label de variante para product_images.variant
     * a partir de los datos de una variante.
     */
    private function buildVariantImageLabel(array $variantData): ?string
    {
        if (($variantData['variant_type'] ?? '') === 'apparel') {
            return $this->normalizeColorText($variantData['color'] ?? null);
        }

        $primary = $this->capitalizeText($variantData['primary_color_text'] ?? null);
        $secondary = $this->capitalizeText($variantData['secondary_color_text'] ?? null);

        if ($primary && $secondary && $primary !== $secondary) {
            return "{$primary} / {$secondary}";
        }

        return $primary ?: $secondary ?: null;
    }
}
