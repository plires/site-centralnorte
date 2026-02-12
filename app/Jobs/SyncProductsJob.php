<?php

namespace App\Jobs;

use App\Services\ProductSyncService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SyncProductsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Tiempo máximo de ejecución del job (en segundos).
     * Igual que el comando Artisan products:sync.
     */
    public int $timeout = 600;

    /**
     * Sin reintentos automáticos: la API puede tardar y reintentar
     * causaría una sincronización duplicada.
     */
    public int $tries = 1;

    public function handle(ProductSyncService $syncService): void
    {
        Log::info('[SyncProductsJob] Iniciando sincronización de productos...');

        $stats = $syncService->syncAll();

        Log::info('[SyncProductsJob] Sincronización completada.', $stats);
    }

    public function failed(\Throwable $e): void
    {
        Log::error('[SyncProductsJob] El job falló: ' . $e->getMessage(), [
            'trace' => $e->getTraceAsString(),
        ]);
    }
}
