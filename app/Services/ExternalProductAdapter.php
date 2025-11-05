<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ExternalProductAdapter
{
    protected string $baseUrl;
    protected array $headers;
    protected int $timeout;

    public function __construct()
    {
        $this->baseUrl = config('services.external_products.url');
        $this->timeout = config('services.external_products.timeout', 30);

        $apiToken = config('services.external_products.api_token');
        $this->headers = [
            'Authorization' => 'Bearer ' . $apiToken,
            'Accept' => 'application/json',
        ];
    }

    /**
     * Verificar si la API está disponible
     */
    public function isAvailable(): bool
    {
        try {
            $response = Http::withHeaders($this->headers)
                ->timeout($this->timeout)
                ->get("{$this->baseUrl}/generic_product");

            return $response->successful();
        } catch (\Exception $e) {
            Log::warning('External API health check failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtener todos los productos de la API externa
     */
    public function fetchAll(): array
    {
        try {
            $response = Http::withHeaders($this->headers)
                ->timeout($this->timeout)
                ->get("{$this->baseUrl}/generic_product");

            if ($response->successful()) {
                $responseData = $response->json();
                return $responseData['generic_products'] ?? [];
            }

            Log::error('Error fetching products from API', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            return [];
        } catch (\Exception $e) {
            Log::error('Exception fetching products: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Obtener un producto específico por ID
     */
    public function fetchById(string $id): ?array
    {
        try {
            $response = Http::withHeaders($this->headers)
                ->timeout($this->timeout)
                ->get("{$this->baseUrl}/generic_product/{$id}");

            if ($response->successful()) {
                $responseData = $response->json();
                return $responseData['generic_product'] ?? null;
            }

            return null;
        } catch (\Exception $e) {
            Log::error("Exception fetching product {$id}: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Obtener un producto específico por SKU (buscar por external_id)
     */
    public function fetchBySku(string $sku): ?array
    {
        try {
            // Primero obtener todos y buscar por external_id
            $products = $this->fetchAll();

            foreach ($products as $product) {
                $productData = $product['generic_product'] ?? $product;
                if (isset($productData['external_id']) && $productData['external_id'] == $sku) {
                    return $product;
                }
            }

            return null;
        } catch (\Exception $e) {
            Log::error("Exception fetching product {$sku}: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Obtener todas las categorías de la API externa
     */
    public function fetchCategories(): array
    {
        try {
            $response = Http::withHeaders($this->headers)
                ->timeout($this->timeout)
                ->get("{$this->baseUrl}/family");

            if ($response->successful()) {
                $responseData = $response->json();
                return $responseData['families'] ?? [];
            }

            Log::error('Error fetching categories from API', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            return [];
        } catch (\Exception $e) {
            Log::error('Exception fetching categories: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Normalizar datos de producto de la API al formato de tu base de datos
     */
    public function normalizeProduct(array $externalProduct): array
    {

        $categoryIds = $this->resolveCategoryIds($externalProduct);

        // La API devuelve directamente el producto (no viene wrapeado en 'generic_product')
        return [
            'sku' => $externalProduct['external_id'] ?? $externalProduct['id'] ?? null,
            'name' => $externalProduct['name'] ?? '',
            'description' => $this->cleanDescription($externalProduct['description'] ?? null),
            'proveedor' => $this->extractSupplier($externalProduct),
            'last_price' => $this->parsePrice($externalProduct['price'] ?? $externalProduct['discountPrice'] ?? 0),
        ];

        // Sincronizar todas las categorías
        $product->categories()->sync($categoryIds);
    }

    /**
     * Limpiar descripción removiendo textos innecesarios
     */
    protected function cleanDescription(?string $description): ?string
    {
        if (!$description) {
            return null;
        }

        // Remover información de LOGO24 y otras notas técnicas si existen
        $description = preg_replace('/\nLOGO24:.*$/s', '', $description);

        return trim($description);
    }

    /**
     * Extraer proveedor/marca de los subatributos
     */
    protected function extractSupplier(array $product): ?string
    {
        // Buscar en subattributes el que corresponda a marca
        if (!isset($product['subattributes']) || !is_array($product['subattributes'])) {
            return null;
        }

        foreach ($product['subattributes'] as $subattr) {
            // Buscar por nombre del atributo "Marca"
            if (isset($subattr['attribute_name']) && strtolower($subattr['attribute_name']) === 'marca') {
                return $subattr['name'] ?? null;
            }
        }

        return null;
    }

    /**
     * Normalizar datos de categoría
     */
    public function normalizeCategory(array $externalCategory): array
    {
        return [
            'name' => $externalCategory['description'] ?? $externalCategory['name'] ?? '',
            'description' => 'Categoría importada desde API externa',
        ];
    }

    /**
     * Extraer imágenes del producto desde la API
     */
    public function extractImages(array $externalProduct): array
    {
        $images = [];

        // La API devuelve 'images' directamente en el producto
        if (isset($externalProduct['images']) && is_array($externalProduct['images'])) {
            $processedUrls = []; // Para evitar duplicados

            foreach ($externalProduct['images'] as $image) {
                $imageUrl = $image['image_url'] ?? null;

                if ($imageUrl && !in_array($imageUrl, $processedUrls)) {
                    $images[] = [
                        'url' => $imageUrl,
                        'is_featured' => $image['main'] ?? false,
                    ];
                    $processedUrls[] = $imageUrl;
                }
            }
        }

        // Si no hay imágenes principales, marcar la primera como destacada
        if (!empty($images) && !collect($images)->contains('is_featured', true)) {
            $images[0]['is_featured'] = true;
        }

        return $images;
    }

    /**
     * Resolver category_id desde el producto
     */
    protected function resolveCategoryIds($product): array
    {
        $categoryIds = [];

        // La API devuelve 'families' que son las categorías
        if (is_array($product) && isset($product['families']) && !empty($product['families'])) {
            foreach ($product['families'] as $family) {
                if (isset($family['description'])) {
                    $categoryName = $family['description'];

                    $category = \App\Models\Category::firstOrCreate(
                        ['name' => $categoryName],
                        ['description' => 'Categoría importada desde API externa']
                    );

                    $categoryIds[] = $category->id;
                }
            }
        }

        // Si no se encontraron categorías, usar categoría por defecto
        if (empty($categoryIds)) {
            $category = \App\Models\Category::firstOrCreate(
                ['name' => 'Productos Importados'],
                ['description' => 'Productos sincronizados desde API externa']
            );
            $categoryIds[] = $category->id;
        }

        return $categoryIds;
    }

    /**
     * Parsear precio a formato decimal
     */
    protected function parsePrice($price): float
    {
        if (is_numeric($price)) {
            return (float) $price;
        }

        // Remover símbolos de moneda y espacios
        $price = preg_replace('/[^0-9.,]/', '', $price);

        // Convertir coma decimal a punto
        $price = str_replace(',', '.', $price);

        return (float) $price ?: 0;
    }
}
