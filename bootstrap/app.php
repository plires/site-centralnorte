<?php

use App\Http\Middleware\CheckPermission;
use App\Http\Middleware\EnsureUserIsAdmin;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\HandleInertiaRequestsCustom;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            HandleInertiaRequestsCustom::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'admin' => EnsureUserIsAdmin::class,
            'permission' => CheckPermission::class,
        ]);
    })
    ->withSchedule(function (Schedule $schedule) {
        // ========================================
        // COLAS DE TRABAJO - Cada minuto
        // Procesa emails y trabajos en segundo plano
        // ========================================
        $schedule->command('queue:work', [
            '--stop-when-empty',
            '--tries' => 3,
            '--max-time' => 50,
        ])
            ->everyMinute()
            ->withoutOverlapping()
            ->runInBackground();

        // ========================================
        // TAREAS DIARIAS - 3:00 AM y 4:00 AM
        // ========================================

        // Sincronizar productos desde API externa
        $schedule->command('products:sync')
            ->dailyAt('03:00')
            ->onOneServer()
            ->runInBackground();

        // Verificar y marcar presupuestos vencidos
        $schedule->command('budgets:check-expired')
            ->dailyAt('04:00')
            ->onOneServer()
            ->runInBackground();

        // ========================================
        // TAREAS POR HORA
        // ========================================

        // Enviar notificaciones de presupuestos próximos a vencer
        $schedule->command('budget:send-notifications')
            ->hourly()
            ->onOneServer()
            ->runInBackground();

        // ========================================
        // MANTENIMIENTO AUTOMÁTICO
        // ========================================

        // Limpiar trabajos fallidos de más de 48 horas
        $schedule->command('queue:prune-failed', ['--hours' => 48])
            ->daily()
            ->runInBackground();

        // Limpiar sesiones expiradas y otros modelos con SoftDeletes
        $schedule->command('model:prune')
            ->daily()
            ->runInBackground();
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
