<?php

namespace App\Services;

use App\Models\Category;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

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
            'last_price' => $this->parsePrice($externalProduct['price']),
            'origin' => \App\Models\Product::ORIGIN_ZECAT,
            'category_ids' => $categoryIds,
        ];
    }

    /**
     * Normalizar string: convierte strings vacíos o solo espacios en null
     */
    private function normalizeString(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $trimmed = trim($value);
        return $trimmed === '' ? null : $trimmed;
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
     * Normalizar datos de categoría desde la API
     */
    public function normalizeCategory(array $externalCategory): array
    {
        return [
            // name: usamos "description" de la API (ej: "2025 Día del Padre")
            'name' => $externalCategory['description'] ?? $externalCategory['title'] ?? '',

            // title: viene directamente de la API
            'title' => $externalCategory['title'] ?? null,

            // description: seteamos meta ya que en la API externa tiene mucho mas contenido
            'description' => $externalCategory['meta'] ?? null,

            // icon_url: URL del ícono de la categoría
            'icon_url' => $externalCategory['icon_url'] ?? null,

            // show: indica si la categoría debe mostrarse
            'show' => $externalCategory['show'] ?? true,

            // origin: indica el origen del que proviene la categoria
            'origin' => Category::ORIGIN_ZECAT,
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
                        'variant' => $image['variant'] ?? null,
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
     * Ahora retorna un array con la estructura necesaria para sync() con datos pivot
     * IMPORTANTE: NO sobrescribe datos de categorías, solo las busca/crea mínimamente
     */
    protected function resolveCategoryIds($product): array
    {
        $syncData = [];

        // La API devuelve 'families' que son las categorías
        if (is_array($product) && isset($product['families']) && !empty($product['families'])) {
            foreach ($product['families'] as $family) {
                if (isset($family['description'])) {
                    $categoryName = $family['description'];

                    // Solo buscar o crear con datos mínimos
                    // NO actualizamos porque los datos completos vienen de syncCategories()
                    $category = \App\Models\Category::firstOrCreate(
                        ['name' => $categoryName],
                        [
                            // Solo datos básicos para creación inicial
                            'title' => $categoryName, // Usar el name como fallback
                            'description' => null,
                            'icon_url' => null,
                            'show' => $family['show'] ?? true,
                            'origin' => Category::ORIGIN_ZECAT,
                        ]
                    );

                    // Preparar datos para el pivot
                    $syncData[$category->id] = [
                        'show' => $family['show'] ?? true,
                        'is_main' => $family['fgp']['main'] ?? false,
                    ];
                }
            }
        }

        // Si no se encontraron categorías, usar categoría por defecto
        if (empty($syncData)) {
            $category = \App\Models\Category::firstOrCreate(
                ['name' => 'Sin Categoría'],
                [
                    'title' => 'Sin Categoría',
                    'description' => 'Productos sincronizados desde API externa sin categoría',
                    'icon_url' => null,
                    'show' => true,
                    'origin' => Category::ORIGIN_ZECAT,
                ]
            );

            $syncData[$category->id] = [
                'show' => true,
                'is_main' => true,
            ];
        }

        return $syncData;
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

    /**
     * Extraer subattributes del producto desde la API
     * 
     * @param array $externalProduct
     * @return array
     */
    public function extractAttributes(array $externalProduct): array
    {
        $attributes = [];

        // La API devuelve 'subattributes' directamente en el producto
        if (isset($externalProduct['subattributes']) && is_array($externalProduct['subattributes'])) {
            foreach ($externalProduct['subattributes'] as $subattr) {
                // Validar que tenga los campos necesarios
                if (isset($subattr['attribute_name']) && isset($subattr['name'])) {
                    $attributes[] = [
                        'external_id' => $subattr['id'] ?? null,
                        'attribute_name' => $this->normalizeString($subattr['attribute_name']),
                        'value' => $this->normalizeString($subattr['name']),
                    ];
                }
            }
        }

        return $attributes;
    }

    /**
     * Determinar si un producto es de tipo Apparel
     * 
     * @param array $externalProduct
     * @return bool
     */
    protected function isApparelProduct(array $externalProduct): bool
    {
        if (!isset($externalProduct['families']) || !is_array($externalProduct['families'])) {
            return false;
        }

        foreach ($externalProduct['families'] as $family) {
            $description = $family['description'] ?? '';

            // Buscar "Apparel" en la descripción de la familia (case insensitive)
            if (stripos($description, 'Apparel') !== false) {
                return true;
            }
        }

        return false;
    }

    /**
     * Extraer variantes del producto desde la API
     * 
     * @param array $externalProduct (producto completo con 'products' y 'families')
     * @return array
     */
    public function extractVariants(array $externalProduct): array
    {
        $variants = [];

        // Los productos variantes vienen en el array 'products'
        if (!isset($externalProduct['products']) || !is_array($externalProduct['products'])) {
            return $variants;
        }

        // Determinar si es producto tipo Apparel
        $isApparel = $this->isApparelProduct($externalProduct);
        $variantType = $isApparel ? 'apparel' : 'standard';

        foreach ($externalProduct['products'] as $variantData) {
            // Validar que tenga SKU
            if (empty($variantData['sku'])) {
                Log::warning('Variant without SKU, skipping', $variantData);
                continue;
            }

            $variant = [
                'external_id' => $variantData['id'] ?? null,
                'sku' => $this->normalizeString($variantData['sku']),
                'stock' => $variantData['stock'] ?? 0,
                'variant_type' => $this->normalizeString($variantType),
                'primary_color' => $this->normalizeString($variantData['primary_color']) ?? null,
                'secondary_color' => $this->normalizeString($variantData['secondary_color']) ?? null,
            ];

            if ($isApparel) {
                // Para productos Apparel: guardar size y color
                $variant['size'] = !empty($variantData['size']) ? $this->normalizeString($variantData['size']) : null;
                $variant['color'] = !empty($variantData['color']) ? $this->normalizeString($variantData['color']) : null;
                $variant['primary_color_text'] = null;
                $variant['secondary_color_text'] = null;
                $variant['material_text'] = null;
            } else {
                // Para productos Standard: guardar element_description_1, 2, 3
                $variant['size'] = null;
                $variant['color'] = null;
                $variant['primary_color_text'] = $this->normalizeString($variantData['element_description_1']) ?? null;
                $variant['secondary_color_text'] = $this->normalizeString($variantData['element_description_2']) ?? null;
                $variant['material_text'] = $this->normalizeString($variantData['element_description_3']) ?? null;
            }

            $variants[] = $variant;
        }

        return $variants;
    }
}
