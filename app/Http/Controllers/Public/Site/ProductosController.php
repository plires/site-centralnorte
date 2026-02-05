<?php

namespace App\Http\Controllers\Public\Site;

use Inertia\Inertia;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class ProductosController extends Controller
{
    public function index(Request $request)
    {
        // Obtener categorías visibles para el sidebar
        $categories = Category::visible()
            ->orderBy('name')
            ->get(['id', 'name', 'description', 'icon_url']);

        // Query base de productos visibles
        $query = Product::visibleInFront()
            ->with(['featuredImage', 'categories', 'variants', 'images']);

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
