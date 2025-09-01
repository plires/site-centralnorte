<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// CONFIGURACIÓN DEL SCHEDULER PARA NOTIFICACIONES DE PRESUPUESTOS MERCH
Schedule::command('budget:send-notifications')
    // ->everyFiveMinutes()          // Cada 5 minutos (Para testear unicamente)
    ->hourly()                    // Ejecutar cada hora
    ->withoutOverlapping()        // Evitar ejecuciones simultáneas
    ->runInBackground()           // No bloquear otras tareas
    ->appendOutputTo(storage_path('logs/budget-notifications.log')); // Guardar logs