<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Category;
use App\Models\ProductImage;
use App\Models\ProductAttribute;
use App\Models\ProductVariant;
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
            'images_synced' => 0,
            'attributes_synced' => 0,
            'variants_synced' => 0
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

                    // Extraer category_ids antes de crear el producto
                    $categoryIds = $normalized['category_ids'] ?? [];
                    unset($normalized['category_ids']);

                    // Buscar producto (incluyendo soft-deleted)
                    $product = Product::withTrashed()
                        ->where('sku', $normalized['sku'])
                        ->first();

                    if ($product) {
                        // Si existe (activo o soft-deleted), restaurar y actualizar
                        if ($product->trashed()) {
                            $product->restore();
                            Log::info("Restored soft-deleted product", [
                                'sku' => $normalized['sku']
                            ]);
                        }
                        $product->update($normalized);
                        $stats['updated']++;
                    } else {
                        // No existe, crear nuevo
                        $product = Product::create($normalized);
                        $stats['created']++;
                    }

                    // Sincronizar categorías
                    if (!empty($categoryIds)) {
                        $product->categories()->sync($categoryIds);
                    }

                    // Sincronizar imágenes
                    $images = $this->adapter->extractImages($externalProduct);
                    if (!empty($images)) {
                        $this->syncProductImages($product, $images);
                        $stats['images_synced'] += count($images);
                    }

                    // Sincronizar atributos
                    $attributes = $this->adapter->extractAttributes($externalProduct);
                    if (!empty($attributes)) {
                        $this->syncProductAttributes($product, $attributes);
                        $stats['attributes_synced'] += count($attributes);
                    }

                    // Sincronizar variantes
                    $variants = $this->adapter->extractVariants($externalProduct);
                    if (!empty($variants)) {
                        $this->syncProductVariants($product, $variants);
                        $stats['variants_synced'] += count($variants);
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
     * Sincronizar atributos del producto
     * 
     * @param Product $product
     * @param array $attributes
     * @return void
     */
    protected function syncProductAttributes(Product $product, array $attributes): void
    {
        try {

            // NO comparar todavía, primero procesar los que vienen de la API
            // 1. PRIMERO: Agregar/actualizar/restaurar atributos que vienen de la API
            $processedExternalIds = [];

            foreach ($attributes as $attrData) {
                if (empty($attrData['external_id'])) {
                    Log::warning("Attribute missing external_id, skipping", [
                        'product_sku' => $product->sku,
                        'attribute_name' => $attrData['attribute_name'] ?? 'unknown',
                    ]);
                    continue;
                }

                $processedExternalIds[] = $attrData['external_id'];

                // Buscar si existe (incluyendo soft deleted)
                $existing = ProductAttribute::withTrashed()
                    ->where('product_id', $product->id)
                    ->where('external_id', $attrData['external_id'])
                    ->first();

                if ($existing) {
                    // Si existe (activo o soft-deleted), restaurar y actualizar
                    if ($existing->trashed()) {
                        $existing->restore();
                        Log::info("Restored soft-deleted attribute", [
                            'product_sku' => $product->sku,
                            'external_id' => $attrData['external_id']
                        ]);
                    }
                    $existing->update([
                        'attribute_name' => $attrData['attribute_name'],
                        'value' => $attrData['value']
                    ]);
                } else {
                    // No existe, crear nuevo
                    ProductAttribute::create([
                        'product_id' => $product->id,
                        'external_id' => $attrData['external_id'],
                        'attribute_name' => $attrData['attribute_name'],
                        'value' => $attrData['value']
                    ]);
                }
            }

            // 2. DESPUÉS: Soft delete los que NO vinieron de la API
            $product->attributes()
                ->whereNotIn('external_id', $processedExternalIds)
                ->delete();
        } catch (\Exception $e) {
            Log::error("Error syncing attributes for product {$product->sku}", [
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Sincronizar imágenes del producto
     */
    protected function syncProductImages(Product $product, array $images): void
    {
        try {
            $processedUrls = [];

            foreach ($images as $imageData) {
                if (empty($imageData['url'])) {
                    Log::warning("Image missing URL, skipping", [
                        'product_sku' => $product->sku,
                    ]);
                    continue;
                }

                $processedUrls[] = $imageData['url'];

                $existing = ProductImage::withTrashed()
                    ->where('product_id', $product->id)
                    ->where('url', $imageData['url'])
                    ->first();

                if ($existing) {
                    if ($existing->trashed()) {
                        $existing->restore();
                        Log::info("Restored soft-deleted image", [
                            'product_sku' => $product->sku,
                            'url' => $imageData['url']
                        ]);
                    }
                    $existing->update([
                        'is_featured' => $imageData['is_featured'] ?? false,
                        'variant' => $imageData['variant'] ?? null,
                    ]);
                } else {
                    ProductImage::create([
                        'product_id' => $product->id,
                        'url' => $imageData['url'],
                        'is_featured' => $imageData['is_featured'] ?? false,
                        'variant' => $imageData['variant'] ?? null,
                    ]);
                }
            }

            $product->images()
                ->whereNotIn('url', $processedUrls)
                ->delete();
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

            // Extraer category_ids
            $categoryIds = $normalized['category_ids'] ?? [];
            unset($normalized['category_ids']);

            // Buscar producto (incluyendo soft-deleted)
            $product = Product::withTrashed()
                ->where('sku', $normalized['sku'])
                ->first();

            if ($product) {
                // Si existe (activo o soft-deleted), restaurar y actualizar
                if ($product->trashed()) {
                    $product->restore();
                    Log::info("Restored soft-deleted product", [
                        'sku' => $normalized['sku']
                    ]);
                }
                $product->update($normalized);
            } else {
                // No existe, crear nuevo
                $product = Product::create($normalized);
                Log::info("Created new product", [
                    'sku' => $normalized['sku']
                ]);
            }

            // Sincronizar categorías
            if (!empty($categoryIds)) {
                $product->categories()->sync($categoryIds);
            }

            // Sincronizar imagenes
            $images = $this->adapter->extractImages($externalProduct);
            if (!empty($images)) {
                $this->syncProductImages($product, $images);
            }

            // Sincronizar atributos
            $attributes = $this->adapter->extractAttributes($externalProduct);
            if (!empty($attributes)) {
                $this->syncProductAttributes($product, $attributes);
            }

            // Sincronizar variantes
            $variants = $this->adapter->extractVariants($externalProduct);
            if (!empty($variants)) {
                $this->syncProductVariants($product, $variants);
            }

            DB::commit();

            Log::info("Product {$sku} synced successfully");

            return $product->fresh(['categories', 'images', 'featuredImage']);
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

    /**
     * Sincronizar variantes del producto
     * 
     * @param Product $product
     * @param array $variants
     * @return void
     */
    protected function syncProductVariants(Product $product, array $variants): void
    {
        try {
            $processedSkus = [];

            foreach ($variants as $variantData) {
                if (empty($variantData['sku'])) {
                    Log::warning("Variant missing SKU, skipping", [
                        'product_sku' => $product->sku,
                    ]);
                    continue;
                }

                $processedSkus[] = $variantData['sku'];

                $existing = ProductVariant::withTrashed()
                    ->where('product_id', $product->id)
                    ->where('sku', $variantData['sku'])
                    ->first();

                if ($existing) {
                    if ($existing->trashed()) {
                        $existing->restore();
                        Log::info("Restored soft-deleted variant", [
                            'product_sku' => $product->sku,
                            'variant_sku' => $variantData['sku']
                        ]);
                    }
                    $existing->update([
                        'external_id' => $variantData['external_id'],
                        'size' => $variantData['size'],
                        'color' => $variantData['color'],
                        'primary_color_text' => $variantData['primary_color_text'],
                        'secondary_color_text' => $variantData['secondary_color_text'],
                        'material_text' => $variantData['material_text'],
                        'stock' => $variantData['stock'],
                        'primary_color' => $variantData['primary_color'],
                        'secondary_color' => $variantData['secondary_color'],
                        'variant_type' => $variantData['variant_type'],
                    ]);
                } else {
                    ProductVariant::create([
                        'product_id' => $product->id,
                        'sku' => $variantData['sku'],
                        'external_id' => $variantData['external_id'],
                        'size' => $variantData['size'],
                        'color' => $variantData['color'],
                        'primary_color_text' => $variantData['primary_color_text'],
                        'secondary_color_text' => $variantData['secondary_color_text'],
                        'material_text' => $variantData['material_text'],
                        'stock' => $variantData['stock'],
                        'primary_color' => $variantData['primary_color'],
                        'secondary_color' => $variantData['secondary_color'],
                        'variant_type' => $variantData['variant_type'],
                    ]);
                }
            }

            $product->variants()
                ->whereNotIn('sku', $processedSkus)
                ->delete();
        } catch (\Exception $e) {
            Log::error("Error syncing variants for product {$product->sku}", [
                'error' => $e->getMessage()
            ]);
        }
    }
}
