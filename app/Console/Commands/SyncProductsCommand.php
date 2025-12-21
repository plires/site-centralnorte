<?php

namespace App\Console\Commands;

use App\Services\ProductSyncService;
use App\Services\ExternalProductAdapter;
use Illuminate\Console\Command;

class SyncProductsCommand extends Command
{
    protected $signature = 'products:sync 
                          {--sku= : Sync a specific product by SKU}
                          {--force : Force sync even if recently synced}
                          {--cleanup : Remove products not in external API (dangerous!)}
                          {--categories : Sync only categories}';

    protected $description = 'Sync products from external API to local database';

    protected ProductSyncService $syncService;
    protected ExternalProductAdapter $adapter;

    public function __construct(ProductSyncService $syncService, ExternalProductAdapter $adapter)
    {
        parent::__construct();
        $this->syncService = $syncService;
        $this->adapter = $adapter;
    }

    public function handle(): int
    {
        // Aumentar timeout para sincronización completa
        set_time_limit(600); // 10 minutos
        ini_set('memory_limit', '512M'); // Por si acaso

        $this->info('🚀 Starting product synchronization...');
        $this->newLine();

        // Verificar conectividad con la API
        if (!$this->checkApiAvailability()) {
            return self::FAILURE;
        }

        // Solo sincronizar categorías
        if ($this->option('categories')) {
            return $this->syncCategories();
        }

        // Sincronizar un producto específico
        if ($sku = $this->option('sku')) {
            return $this->syncSingleProduct($sku);
        }

        // Verificar si es necesario sincronizar (a menos que se fuerce)
        if (!$this->option('force') && !$this->syncService->shouldSync()) {
            $lastSync = $this->syncService->getLastSyncInfo();
            $this->warn('⏱️  Sync not needed yet.');
            $this->info("Last sync: {$lastSync['last_sync_human']}");
            $this->info("Next sync: {$lastSync['next_sync']->diffForHumans()}");
            $this->newLine();
            $this->info('Use --force to sync anyway.');
            return self::SUCCESS;
        }

        // Sincronizar todos los productos
        $result = $this->syncAllProducts();

        // Cleanup opcional
        if ($this->option('cleanup') && $result === self::SUCCESS) {
            $this->performCleanup();
        }

        return $result;
    }

    /**
     * Verificar disponibilidad de la API
     */
    protected function checkApiAvailability(): bool
    {
        $this->info('🔍 Checking API availability...');

        if ($this->adapter->isAvailable()) {
            $this->info('✅ API is available');
            $this->newLine();
            return true;
        }

        $this->error('❌ External API is not available');
        $this->error('Please check your API credentials and network connection.');
        return false;
    }

    /**
     * Sincronizar solo categorías
     */
    protected function syncCategories(): int
    {
        $this->info('📁 Syncing categories...');

        $stats = $this->syncService->syncCategories();

        $this->newLine();
        $this->info('✅ Categories synchronization completed:');
        $this->table(
            ['Metric', 'Count'],
            [
                ['Total', $stats['total']],
                ['Created', $stats['created']],
                ['Updated', $stats['updated']],
                ['Errors', $stats['errors']],
            ]
        );

        return $stats['errors'] > 0 ? self::FAILURE : self::SUCCESS;
    }

    /**
     * Sincronizar un producto específico
     */
    protected function syncSingleProduct(string $sku): int
    {
        $this->info("🔄 Syncing product: {$sku}");
        $this->newLine();

        $product = $this->syncService->syncOne($sku);

        if ($product) {
            // Manejar múltiples categorías
            $categoryNames = $product->categories->pluck('name')->toArray();
            $categoryDisplay = !empty($categoryNames)
                ? implode(', ', $categoryNames)
                : 'N/A';

            $this->info("✅ Product synced successfully");
            $this->newLine();
            $this->table(
                ['Field', 'Value'],
                [
                    ['SKU', $product->sku],
                    ['Name', $product->name],
                    // Mostrar todas las categorías
                    ['Categories', $categoryDisplay],
                    ['Price', '$' . number_format($product->last_price, 2)],
                    ['Images', $product->images->count()],
                ]
            );
            return self::SUCCESS;
        }

        $this->error("❌ Failed to sync product {$sku}");
        $this->error("Check logs for more details.");
        return self::FAILURE;
    }

    /**
     * Sincronizar todos los productos
     */
    protected function syncAllProducts(): int
    {
        $this->info('🔄 Syncing all products...');
        $this->newLine();

        $progressBar = $this->output->createProgressBar();
        $progressBar->start();

        $stats = $this->syncService->syncAll();

        $progressBar->finish();
        $this->newLine(2);

        $this->info('✅ Synchronization completed:');
        $this->table(
            ['Metric', 'Count'],
            [
                ['Total Products', $stats['total']],
                ['Created', $stats['created']],
                ['Updated', $stats['updated']],
                ['Images Synced', $stats['images_synced']],
                ['Attributes synced', $stats['attributes_synced']],
                ['Variants synced', $stats['variants_synced']],
                ['Errors', $stats['errors']],
            ]
        );

        if ($stats['errors'] > 0) {
            $this->warn("⚠️  {$stats['errors']} errors occurred. Check logs for details.");
            return self::FAILURE;
        }

        return self::SUCCESS;
    }

    /**
     * Limpiar productos huérfanos
     */
    protected function performCleanup(): void
    {
        $this->newLine();
        $this->warn('🧹 Starting cleanup of orphaned products...');

        if (!$this->confirm('This will delete local products not found in the API. Continue?', false)) {
            $this->info('Cleanup cancelled.');
            return;
        }

        $stats = $this->syncService->cleanupOrphanedProducts();

        $this->info("✅ Cleanup completed: {$stats['deleted']} products deleted.");
    }
}
