<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Category;
use App\Models\ProductImage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class ProductSyncService
{
    protected ExternalProductAdapter $adapter;

    public function __construct(ExternalProductAdapter $adapter)
    {
        $this->adapter = $adapter;
    }

    /**
     * Sincronizar todas las categorías desde la API externa
     */
    public function syncCategories(): array
    {
        $stats = [
            'created' => 0,
            'updated' => 0,
            'errors' => 0,
            'total' => 0
        ];

        try {
            $externalCategories = $this->adapter->fetchCategories();
            $stats['total'] = count($externalCategories);

            if (empty($externalCategories)) {
                Log::warning('No categories received from external API');
                return $stats;
            }

            DB::beginTransaction();

            foreach ($externalCategories as $externalCategory) {
                try {
                    $normalized = $this->adapter->normalizeCategory($externalCategory);

                    if (empty($normalized['name'])) {
                        Log::warning('Skipping category with empty name', $externalCategory);
                        $stats['errors']++;
                        continue;
                    }

                    $category = Category::updateOrCreate(
                        ['name' => $normalized['name']],
                        $normalized
                    );

                    if ($category->wasRecentlyCreated) {
                        $stats['created']++;
                    } else {
                        $stats['updated']++;
                    }
                } catch (\Exception $e) {
                    $stats['errors']++;
                    Log::error('Error syncing category', [
                        'category' => $normalized['name'] ?? 'unknown',
                        'error' => $e->getMessage()
                    ]);
                }
            }

            DB::commit();

            Log::info('Categories sync completed', $stats);
            Cache::put('categories_last_sync', now(), 86400); // 24 horas

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Fatal error during categories sync: ' . $e->getMessage());
            $stats['errors']++;
        }

        return $stats;
    }

    /**
     * Sincronizar todos los productos desde la API externa
     */
    public function syncAll(): array
    {
        $stats = [
            'created' => 0,
            'updated' => 0,
            'errors' => 0,
            'total' => 0,
            'images_synced' => 0
        ];

        try {
            // Primero sincronizar categorías
            $this->syncCategories();

            $externalProducts = $this->adapter->fetchAll();
            $stats['total'] = count($externalProducts);

            if (empty($externalProducts)) {
                Log::warning('No products received from external API');
                return $stats;
            }

            DB::beginTransaction();

            foreach ($externalProducts as $externalProduct) {
                try {
                    $normalized = $this->adapter->normalizeProduct($externalProduct);

                    if (empty($normalized['sku'])) {
                        Log::warning('Skipping product with empty SKU', $externalProduct);
                        $stats['errors']++;
                        continue;
                    }

                    $product = Product::updateOrCreate(
                        ['sku' => $normalized['sku']],
                        $normalized
                    );

                    if ($product->wasRecentlyCreated) {
                        $stats['created']++;
                    } else {
                        $stats['updated']++;
                    }

                    // Sincronizar imágenes si las proporciona la API
                    $images = $this->adapter->extractImages($externalProduct);
                    if (!empty($images)) {
                        $this->syncProductImages($product, $images);
                        $stats['images_synced'] += count($images);
                    }
                } catch (\Exception $e) {
                    $stats['errors']++;
                    Log::error('Error syncing product', [
                        'sku' => $normalized['sku'] ?? 'unknown',
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                }
            }

            DB::commit();

            Log::info('Products sync completed', $stats);
            Cache::put('products_last_sync', now(), 3600); // 1 hora

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Fatal error during product sync: ' . $e->getMessage());
            $stats['errors']++;
        }

        return $stats;
    }

    /**
     * Sincronizar imágenes del producto
     */
    protected function syncProductImages(Product $product, array $images): void
    {
        try {
            // Obtener URLs existentes
            $existingUrls = $product->images()->pluck('url')->toArray();
            $newUrls = array_column($images, 'url');

            // Eliminar imágenes que ya no están en la API
            $urlsToDelete = array_diff($existingUrls, $newUrls);
            if (!empty($urlsToDelete)) {
                $product->images()->whereIn('url', $urlsToDelete)->delete();
            }

            // Agregar/actualizar imágenes
            foreach ($images as $imageData) {
                if (empty($imageData['url'])) {
                    continue;
                }

                ProductImage::updateOrCreate(
                    [
                        'product_id' => $product->id,
                        'url' => $imageData['url']
                    ],
                    [
                        'is_featured' => $imageData['is_featured'] ?? false
                    ]
                );
            }

            // Asegurar que haya al menos una imagen destacada
            $this->ensureFeaturedImage($product);
        } catch (\Exception $e) {
            Log::error("Error syncing images for product {$product->sku}", [
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Asegurar que el producto tenga una imagen destacada
     */
    protected function ensureFeaturedImage(Product $product): void
    {
        $hasFeatured = $product->images()->where('is_featured', true)->exists();

        if (!$hasFeatured) {
            $firstImage = $product->images()->first();
            if ($firstImage) {
                $firstImage->update(['is_featured' => true]);
            }
        }
    }

    /**
     * Sincronizar un producto específico por SKU
     */
    public function syncOne(string $sku): ?Product
    {
        try {
            $externalProduct = $this->adapter->fetchBySku($sku);

            if (!$externalProduct) {
                Log::warning("Product {$sku} not found in external API");
                return null;
            }

            DB::beginTransaction();

            $normalized = $this->adapter->normalizeProduct($externalProduct);

            $product = Product::updateOrCreate(
                ['sku' => $sku],
                $normalized
            );

            $images = $this->adapter->extractImages($externalProduct);
            if (!empty($images)) {
                $this->syncProductImages($product, $images);
            }

            DB::commit();

            Log::info("Product {$sku} synced successfully");

            return $product->fresh(['category', 'images', 'featuredImage']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error syncing product {$sku}: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Verificar si es necesario sincronizar (basado en tiempo transcurrido)
     */
    public function shouldSync(): bool
    {
        $lastSync = Cache::get('products_last_sync');

        if (!$lastSync) {
            return true;
        }

        $interval = (int) config('services.external_products.sync_interval', 3600);

        return now()->diffInSeconds($lastSync) >= $interval;
    }

    /**
     * Obtener información de la última sincronización
     */
    public function getLastSyncInfo(): ?array
    {
        $lastSync = Cache::get('products_last_sync');

        if (!$lastSync) {
            return null;
        }

        $interval = (int) config('services.external_products.sync_interval', 3600);

        return [
            'last_sync' => $lastSync,
            'last_sync_human' => $lastSync->diffForHumans(),
            'next_sync' => $lastSync->copy()->addSeconds($interval),
        ];
    }

    /**
     * Limpiar productos que ya no existen en la API
     * CUIDADO: Solo usar si estás seguro de que quieres eliminar productos locales
     */
    public function cleanupOrphanedProducts(): array
    {
        $stats = ['deleted' => 0];

        try {
            $externalProducts = $this->adapter->fetchAll();
            $externalSkus = array_column(
                array_map(fn($p) => $this->adapter->normalizeProduct($p), $externalProducts),
                'sku'
            );

            // Encontrar productos locales que no están en la API
            $orphanedProducts = Product::whereNotIn('sku', $externalSkus)->get();

            DB::beginTransaction();

            foreach ($orphanedProducts as $product) {
                // Solo eliminar si no tiene budget_items asociados
                if ($product->budgetItems()->doesntExist()) {
                    $product->delete();
                    $stats['deleted']++;
                } else {
                    Log::info("Skipping deletion of product {$product->sku} (has budget items)");
                }
            }

            DB::commit();

            Log::info('Orphaned products cleanup completed', $stats);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error during orphaned products cleanup: ' . $e->getMessage());
        }

        return $stats;
    }
}
