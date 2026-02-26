<?php

namespace App\Http\Controllers\Public\Site;

use Inertia\Inertia;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class ProductosController extends Controller
{
    /**
     * Muestra el detalle de un producto
     */
    public function show(Product $product)
    {

        // Verificar que el producto sea visible
        if (!$product->is_visible_in_front) {
            abort(404);
        }

        // Cargar todas las relaciones necesarias
        $product->load([
            'images' => fn($q) => $q->orderByDesc('is_featured'),
            'variants' => fn($q) => $q->orderBy('stock', 'desc'),
            'attributes',
            'categories' => fn($q) => $q->publicVisible(),
        ]);

        // Obtener la categoría inicial para el breadcrumb
        $mainCategory = $product->categories->first();

        // Transformar las imágenes
        $images = $product->images->map(fn($img) => [
            'id' => $img->id,
            'url' => $img->full_url,
            'is_featured' => $img->is_featured,
            'variant' => $img->variant,
        ])->toArray();

        // Si no hay imágenes, usar placeholder
        if (empty($images)) {
            $images = [[
                'id' => 0,
                'url' => config('business.product.placeholder_image'),
                'is_featured' => true,
                'variant' => null,
            ]];
        }

        // Transformar las variantes
        $variants = $product->variants->map(fn($v) => [
            'id' => $v->id,
            'sku' => $v->sku,
            'description' => $v->full_description,
            'stock' => $v->stock,
            'primary_color' => $v->primary_color,
            'secondary_color' => $v->secondary_color,
            'variant_type' => $v->variant_type,
            'size' => $v->size,
            'color' => $v->color,
            'primary_color_text' => $v->primary_color_text,
            'secondary_color_text' => $v->secondary_color_text,
            'material_text' => $v->material_text,
        ])->toArray();

        // Agrupar atributos por nombre
        $attributes = $product->getRelation('attributes')
            ->groupBy('attribute_name')
            ->map(fn($group) => $group->pluck('value')->unique()->values()->toArray())
            ->toArray();

        return Inertia::render('public/site/productos/ProductoDetalle', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'description' => $product->description,
                'images' => $images,
                'variants' => $variants,
                'attributes' => $attributes,
            ],
            'mainCategory' => $mainCategory ? [
                'id' => $mainCategory->id,
                'name' => $mainCategory->name,
            ] : null,
        ]);
    }

    /**
     * API de búsqueda de productos con fuzzy matching
     */
    public function search(Request $request)
    {
        $query = trim($request->get('q', ''));

        if (strlen($query) < 2) {
            return response()->json([
                'products' => [],
                'categories' => [],
            ]);
        }

        // Buscar productos con fuzzy matching
        $products = $this->searchProductsFuzzy($query);

        // Buscar categorías
        $categories = $this->searchCategoriesFuzzy($query);

        return response()->json([
            'products' => $products,
            'categories' => $categories,
        ]);
    }

    /**
     * Busca productos usando LIKE y SOUNDEX para fuzzy matching
     */
    private function searchProductsFuzzy(string $query): array
    {
        $searchTerms = $this->generateSearchVariants($query);

        $products = Product::visibleInFront()
            ->with(['featuredImage', 'categories' => fn($q) => $q->publicVisible()])
            ->where(function ($q) use ($query, $searchTerms) {
                // Búsqueda exacta (mayor prioridad)
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('sku', 'like', "%{$query}%");

                // Búsqueda por variantes fuzzy
                foreach ($searchTerms as $term) {
                    $q->orWhere('name', 'like', "%{$term}%");
                }

                // Búsqueda por SOUNDEX (fonética)
                $q->orWhereRaw('SOUNDEX(name) = SOUNDEX(?)', [$query]);
            })
            ->orderByRaw("
                CASE
                    WHEN name LIKE ? THEN 1
                    WHEN name LIKE ? THEN 2
                    ELSE 3
                END
            ", ["{$query}%", "%{$query}%"])
            ->limit(8)
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'sku' => $product->sku,
                    'image' => $product->featuredImage?->full_url ?? config('business.product.placeholder_image'),
                    'category' => $product->categories->first()?->name,
                ];
            });

        return $products->toArray();
    }

    /**
     * Busca categorías visibles con fuzzy matching
     */
    private function searchCategoriesFuzzy(string $query): array
    {
        $searchTerms = $this->generateSearchVariants($query);

        $categories = Category::publicVisible()
            ->where(function ($q) use ($query, $searchTerms) {
                $q->where('name', 'like', "%{$query}%");

                foreach ($searchTerms as $term) {
                    $q->orWhere('name', 'like', "%{$term}%");
                }
            })
            ->orderBy('name')
            ->limit(4)
            ->get(['id', 'name', 'icon_url']);

        return $categories->toArray();
    }

    /**
     * Genera variantes de búsqueda para fuzzy matching
     */
    private function generateSearchVariants(string $query): array
    {
        $variants = [];
        $query = mb_strtolower($query);

        $replacements = [
            'a' => ['á', 'à'],
            'e' => ['é', 'è'],
            'i' => ['í', 'ì', 'y'],
            'o' => ['ó', 'ò'],
            'u' => ['ú', 'ù', 'ü'],
            'á' => ['a'],
            'é' => ['e'],
            'í' => ['i'],
            'ó' => ['o'],
            'ú' => ['u'],
            'ü' => ['u'],
            'b' => ['v'],
            'v' => ['b'],
            'c' => ['s', 'k', 'z'],
            's' => ['c', 'z'],
            'z' => ['s', 'c'],
            'k' => ['c', 'q'],
            'q' => ['k', 'c'],
            'g' => ['j'],
            'j' => ['g'],
            'n' => ['ñ', 'm'],
            'ñ' => ['n', 'ni'],
            'm' => ['n'],
            'll' => ['y', 'l'],
            'y' => ['ll', 'i'],
            'r' => ['t', 'e'],
            't' => ['r', 'y'],
            'h' => ['g', 'j'],
            'l' => ['k', 'ñ'],
        ];

        foreach ($replacements as $char => $alternatives) {
            if (mb_strpos($query, $char) !== false) {
                foreach ($alternatives as $alt) {
                    $variant = str_replace($char, $alt, $query);
                    if ($variant !== $query) {
                        $variants[] = $variant;
                    }
                }
            }
        }

        $normalized = $this->removeAccents($query);
        if ($normalized !== $query) {
            $variants[] = $normalized;
        }

        return array_slice(array_unique($variants), 0, 10);
    }

    /**
     * Remueve acentos de una cadena
     */
    private function removeAccents(string $string): string
    {
        $accents = [
            'á' => 'a',
            'é' => 'e',
            'í' => 'i',
            'ó' => 'o',
            'ú' => 'u',
            'à' => 'a',
            'è' => 'e',
            'ì' => 'i',
            'ò' => 'o',
            'ù' => 'u',
            'ä' => 'a',
            'ë' => 'e',
            'ï' => 'i',
            'ö' => 'o',
            'ü' => 'u',
            'â' => 'a',
            'ê' => 'e',
            'î' => 'i',
            'ô' => 'o',
            'û' => 'u',
            'ñ' => 'n',
        ];

        return strtr($string, $accents);
    }

    public function index(Request $request)
    {
        // Obtener categorías visibles para el sidebar (excluye las ocultas en público)
        $categories = Category::publicVisible()
            ->orderBy('name')
            ->get(['id', 'name', 'description', 'icon_url']);

        // Query base de productos visibles
        $query = Product::visibleInFront()
            ->with(['featuredImage', 'categories' => fn($q) => $q->publicVisible(), 'variants', 'images']);

        // Búsqueda por término
        $searchTerm = $request->get('search');
        if ($request->filled('search')) {
            $searchTerms = $this->generateSearchVariants($searchTerm);

            $query->where(function ($q) use ($searchTerm, $searchTerms) {
                // Búsqueda exacta
                $q->where('name', 'like', "%{$searchTerm}%")
                    ->orWhere('sku', 'like', "%{$searchTerm}%");

                // Búsqueda fuzzy
                foreach ($searchTerms as $term) {
                    $q->orWhere('name', 'like', "%{$term}%");
                }

                // Búsqueda fonética
                $q->orWhereRaw('SOUNDEX(name) = SOUNDEX(?)', [$searchTerm]);
            });
        }

        // Filtrar por categoría si se especifica
        if ($request->filled('category')) {
            $categoryId = $request->category;
            $query->whereHas('categories', function ($q) use ($categoryId) {
                $q->where('categories.id', $categoryId);
            });
        }

        // Ordenar por nombre
        $query->orderBy('name');

        // Paginar de a 12 productos
        $products = $query->paginate(12)->withQueryString();

        // Transformar productos para el frontend
        $products->getCollection()->transform(function ($product) {
            return $this->transformProduct($product);
        });

        // Obtener categoría seleccionada
        $selectedCategory = $request->filled('category')
            ? Category::find($request->category)
            : null;

        return Inertia::render('public/site/productos/Productos', [
            'products' => $products,
            'categories' => $categories,
            'selectedCategory' => $selectedCategory,
            'searchTerm' => $searchTerm,
        ]);
    }

    /**
     * Transforma un producto para el frontend
     */
    private function transformProduct(Product $product): array
    {
        $defaultImage = $product->featuredImage?->full_url ?? config('business.product.placeholder_image');

        return [
            'id' => $product->id,
            'name' => $product->name,
            'sku' => $product->sku,
            'defaultImage' => $defaultImage,
            'categories' => $product->categories->map(fn($cat) => [
                'id' => $cat->id,
                'name' => $cat->name,
            ]),
            'colorVariants' => $this->getColorVariants($product),
        ];
    }

    /**
     * Obtiene las variantes de color de un producto con sus imágenes asociadas
     */
    private function getColorVariants(Product $product): array
    {
        $variants = $product->variants;
        $images = $product->images;

        if ($variants->isEmpty()) {
            return [];
        }

        // Determinar el tipo de variante (usar el primero como referencia)
        $variantType = $variants->first()->variant_type;

        if ($variantType === 'apparel') {
            // Para apparel: agrupar por color único y sumar stock
            return $variants
                ->filter(fn($v) => $v->color !== null)
                ->groupBy('color')
                ->map(function ($colorVariants) use ($images) {
                    $firstVariant = $colorVariants->first();
                    $totalStock = $colorVariants->sum('stock');

                    // Buscar imagen que coincida con el color
                    $matchingImage = $images->first(fn($img) => $img->variant === $firstVariant->color);

                    return [
                        'title' => $firstVariant->color,
                        'primaryColor' => $firstVariant->primary_color,
                        'secondaryColor' => $firstVariant->secondary_color,
                        'image' => $matchingImage?->full_url,
                        'stock' => $totalStock,
                    ];
                })
                ->values()
                ->toArray();
        }

        // Para standard: cada variante es un círculo
        return $variants
            ->map(function ($variant) use ($images) {
                $parts = array_filter([
                    $variant->primary_color_text,
                    $variant->secondary_color_text,
                    $variant->material_text,
                ]);

                $variantKey = implode(' / ', $parts);

                // Buscar imagen que coincida con la combinación de variante (búsqueda flexible)
                $matchingImage = $this->findMatchingImage($images, $variant);

                return [
                    'title' => $variantKey,
                    'primaryColor' => $variant->primary_color,
                    'secondaryColor' => $variant->secondary_color,
                    'image' => $matchingImage?->full_url,
                    'stock' => $variant->stock ?? 0,
                ];
            })
            ->filter(fn($v) => $v['primaryColor'] !== null || $v['secondaryColor'] !== null)
            ->values()
            ->toArray();
    }

    /**
     * Busca una imagen que coincida con la variante de forma flexible
     * Compara los segmentos del variant de la imagen (separados por " / ") con los valores de la variante
     * Prioriza imágenes con más coincidencias exactas de segmentos
     */
    private function findMatchingImage($images, $variant)
    {
        $primaryColorText = trim($variant->primary_color_text ?? '');
        $secondaryColorText = trim($variant->secondary_color_text ?? '');
        $materialText = trim($variant->material_text ?? '');

        // Si no hay textos para buscar, no hay coincidencia
        if (empty($primaryColorText) && empty($secondaryColorText) && empty($materialText)) {
            return null;
        }

        $bestMatch = null;
        $bestScore = 0;

        foreach ($images as $img) {
            if (empty($img->variant)) {
                continue;
            }

            // Separar el variant de la imagen en segmentos y limpiar espacios
            $imageSegments = array_map('trim', explode('/', $img->variant));
            $imageSegments = array_filter($imageSegments); // Eliminar segmentos vacíos

            $score = 0;

            // Verificar si primary_color_text coincide exactamente con algún segmento
            if (!empty($primaryColorText) && in_array($primaryColorText, $imageSegments)) {
                $score++;
            }

            // Verificar si secondary_color_text coincide exactamente con algún segmento
            if (!empty($secondaryColorText) && in_array($secondaryColorText, $imageSegments)) {
                $score++;
            }

            // Verificar si material_text coincide exactamente con algún segmento
            if (!empty($materialText) && in_array($materialText, $imageSegments)) {
                $score++;
            }

            // Actualizar mejor coincidencia si el score es mayor
            if ($score > $bestScore) {
                $bestScore = $score;
                $bestMatch = $img;
            }
        }

        // Solo devolver si al menos hay una coincidencia
        return $bestScore > 0 ? $bestMatch : null;
    }
}
