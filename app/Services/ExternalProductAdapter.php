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
            // Intentar obtener productos (la API no tiene endpoint /health)
            $response = Http::withHeaders($this->headers)
                ->timeout(10)
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
                return $response->json('data', []);
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
     * Obtener un producto específico por SKU
     */
    public function fetchBySku(string $sku): ?array
    {
        try {
            $response = Http::withHeaders($this->headers)
                ->timeout($this->timeout)
                ->get("{$this->baseUrl}/generic_product/{$sku}");

            if ($response->successful()) {
                return $response->json('data');
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
                return $response->json('data', []);
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
        // La API devuelve el producto dentro de 'generic_product'
        $product = $externalProduct['generic_product'] ?? $externalProduct;

        return [
            'sku' => $product['external_id'] ?? $product['id'] ?? null,
            'name' => $product['name'] ?? '',
            'description' => $this->cleanDescription($product['description'] ?? null),
            'proveedor' => $this->extractSupplier($product),
            'category_id' => $this->resolveCategoryId($product),
            'last_price' => $this->parsePrice($product['price'] ?? $product['unit_price'] ?? 0),
        ];
    }

    /**
     * Limpiar descripción removiendo textos innecesarios
     */
    protected function cleanDescription(?string $description): ?string
    {
        if (!$description) {
            return null;
        }

        // Remover información de LOGO24 y otras notas técnicas
        $description = preg_replace('/\nLOGO24:.*$/s', '', $description);

        return trim($description);
    }

    /**
     * Extraer proveedor/marca de los subatributos
     */
    protected function extractSupplier(array $product): ?string
    {
        // Buscar en subattributes el que corresponda a marca/proveedor (attribute_id = 2 según el JSON)
        if (!isset($product['subattributes']) || !is_array($product['subattributes'])) {
            return null;
        }

        foreach ($product['subattributes'] as $subattr) {
            // attribute_id = 2 parece ser la marca según el ejemplo (Tahg)
            if (isset($subattr['attribute_id']) && $subattr['attribute_id'] == 2) {
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
            'name' => $externalCategory['name'] ?? $externalCategory['nombre'] ?? '',
            'description' => $externalCategory['description'] ?? $externalCategory['descripcion'] ?? 'Categoría importada desde API externa',
        ];
    }

    /**
     * Extraer imágenes del producto desde la API
     */
    public function extractImages(array $externalProduct): array
    {
        $product = $externalProduct['generic_product'] ?? $externalProduct;
        $images = [];

        // Obtener todas las imágenes de los productos variantes
        if (isset($product['products']) && is_array($product['products'])) {
            $processedUrls = []; // Para evitar duplicados

            foreach ($product['products'] as $variant) {
                if (isset($variant['images']) && is_array($variant['images'])) {
                    foreach ($variant['images'] as $image) {
                        $imageUrl = $image['imageUrl'] ?? null;

                        if ($imageUrl && !in_array($imageUrl, $processedUrls)) {
                            $images[] = [
                                'url' => $imageUrl,
                                'is_featured' => $image['main'] ?? false,
                            ];
                            $processedUrls[] = $imageUrl;
                        }
                    }
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
     * Por ahora, crear una categoría genérica ya que la API no devuelve categorías explícitas
     */
    protected function resolveCategoryId($product): ?int
    {
        // Buscar en subattributes alguna categoría (attribute_id = 10 parece ser tipo de producto)
        if (is_array($product) && isset($product['subattributes'])) {
            foreach ($product['subattributes'] as $subattr) {
                if (isset($subattr['attribute_id']) && $subattr['attribute_id'] == 10) {
                    $categoryName = $subattr['name'] ?? null;
                    if ($categoryName) {
                        $category = \App\Models\Category::firstOrCreate(
                            ['name' => $categoryName],
                            ['description' => 'Categoría importada desde API externa']
                        );
                        return $category->id;
                    }
                }
            }
        }

        // Fallback: categoría por defecto
        $category = \App\Models\Category::firstOrCreate(
            ['name' => 'Productos Importados'],
            ['description' => 'Productos sincronizados desde API externa']
        );

        return $category->id;
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
