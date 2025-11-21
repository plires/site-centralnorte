<?php

/**
 * ===========================================================================
 * RUTAS DE PICKING - Presupuestos de Armado de Kits
 * ===========================================================================
 * 
 * Estas rutas manejan todo el módulo de presupuestos de picking/armado de kits.
 * Acceso: Vendedores y Administradores
 */


use App\Http\Controllers\Dashboard\PickingBudgetController;
use App\Http\Controllers\Dashboard\PickingConfigurationController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'permission:gestionar_costos_pick'])->prefix('dashboard')->name('dashboard.')->group(function () {

    // ========================================================================
    // PRESUPUESTOS DE PICKING
    // ========================================================================
    Route::prefix('picking')->name('picking.')->group(function () {

        // Lista y gestión de presupuestos
        Route::get('/', [PickingBudgetController::class, 'index'])
            ->name('budgets.index');

        Route::get('/create', [PickingBudgetController::class, 'create'])
            ->name('budgets.create');

        Route::post('/', [PickingBudgetController::class, 'store'])
            ->name('budgets.store');

        Route::get('/{pickingBudget}', [PickingBudgetController::class, 'show'])
            ->name('budgets.show');

        Route::get('/{pickingBudget}/edit', [PickingBudgetController::class, 'edit'])
            ->name('budgets.edit');

        Route::put('/{pickingBudget}', [PickingBudgetController::class, 'update'])
            ->name('budgets.update');

        Route::delete('/{pickingBudget}', [PickingBudgetController::class, 'destroy'])
            ->name('budgets.destroy');

        // Acciones especiales sobre presupuestos
        Route::post('/{pickingBudget}/duplicate', [PickingBudgetController::class, 'duplicate'])
            ->name('budgets.duplicate');

        Route::post('/{pickingBudget}/send', [PickingBudgetController::class, 'send'])
            ->name('budgets.send');

        Route::get('/{pickingBudget}/pdf', [PickingBudgetController::class, 'downloadPdf'])
            ->name('budgets.pdf');

        // ====================================================================
        // CONFIGURACIÓN (Solo Administradores)
        // ====================================================================
        Route::prefix('config')->name('config.')->group(function () {

            // Gestión de Cajas
            Route::put('/boxes/update-all', [PickingConfigurationController::class, 'updateAllBoxes'])
                ->name('boxes.update-all');

            Route::get('/boxes', [PickingConfigurationController::class, 'boxes'])
                ->name('boxes');

            Route::delete('/boxes/{pickingBox}', [PickingConfigurationController::class, 'destroyBox'])
                ->name('boxes.destroy');

            // Gestión de Escalas de Costos
            Route::put('/cost-scales/update-all', [PickingConfigurationController::class, 'updateAllCostScales'])
                ->name('cost-scales.update-all');

            Route::get('/cost-scales', [PickingConfigurationController::class, 'costScales'])
                ->name('cost-scales');

            Route::delete('/cost-scales/{pickingCostScale}', [PickingConfigurationController::class, 'destroyCostScale'])
                ->name('cost-scales.destroy');

            // Gestión de Incrementos por Componentes
            Route::get('/component-increments', [PickingConfigurationController::class, 'componentIncrements'])
                ->name('component-increments');

            Route::put('/component-increments/{pickingComponentIncrement}', [PickingConfigurationController::class, 'updateComponentIncrement'])
                ->name('component-increments.update');

            Route::post('/component-increments', [PickingConfigurationController::class, 'storeComponentIncrement'])
                ->name('component-increments.store');

            Route::delete('/component-increments/{pickingComponentIncrement}', [PickingConfigurationController::class, 'destroyComponentIncrement'])
                ->name('component-increments.destroy');
        });
    });

    // ========================================================================
    // API - RUTAS AJAX PARA CÁLCULOS EN TIEMPO REAL
    // ========================================================================
    Route::prefix('api/picking')->name('api.picking.')->group(function () {

        // Calcular totales del presupuesto en tiempo real
        Route::post('/calculate', [PickingBudgetController::class, 'calculateTotals'])
            ->name('calculate');

        // Obtener escala de costos según cantidad de kits
        Route::get('/cost-scale/{quantity}', [PickingBudgetController::class, 'getCostScaleForQuantity'])
            ->name('cost-scale');

        // Obtener incremento según cantidad de componentes
        Route::get('/component-increment/{components}', [PickingBudgetController::class, 'getComponentIncrementForQuantity'])
            ->name('component-increment');
    });
});
