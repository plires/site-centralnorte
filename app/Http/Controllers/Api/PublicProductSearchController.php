<?php

namespace App\Http\Controllers\Api;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class PublicProductSearchController extends Controller
{
    /**
     * Busca productos y categorías con fuzzy matching (tolerante a errores de tipeo)
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
        $products = $this->searchProducts($query);

        // Buscar categorías
        $categories = $this->searchCategories($query);

        return response()->json([
            'products' => $products,
            'categories' => $categories,
        ]);
    }

    /**
     * Busca productos usando LIKE y SOUNDEX para fuzzy matching
     */
    private function searchProducts(string $query): array
    {
        $searchTerms = $this->generateSearchVariants($query);

        $products = Product::visibleInFront()
            ->with(['featuredImage', 'categories'])
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
     * Busca categorías visibles
     */
    private function searchCategories(string $query): array
    {
        $searchTerms = $this->generateSearchVariants($query);

        $categories = Category::visible()
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
     * Maneja errores comunes de tipeo en español
     */
    private function generateSearchVariants(string $query): array
    {
        $variants = [];
        $query = mb_strtolower($query);

        // Reemplazos comunes de caracteres similares
        $replacements = [
            // Vocales con/sin tilde
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
            // Consonantes similares
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
            // Errores de teclado comunes (teclas adyacentes)
            'r' => ['t', 'e'],
            't' => ['r', 'y'],
            'h' => ['g', 'j'],
            'l' => ['k', 'ñ'],
        ];

        // Generar variantes con un solo reemplazo
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

        // Variante sin caracteres especiales
        $normalized = $this->removeAccents($query);
        if ($normalized !== $query) {
            $variants[] = $normalized;
        }

        // Limitar cantidad de variantes
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
            'Á' => 'A',
            'É' => 'E',
            'Í' => 'I',
            'Ó' => 'O',
            'Ú' => 'U',
            'Ñ' => 'N',
        ];

        return strtr($string, $accents);
    }
}
