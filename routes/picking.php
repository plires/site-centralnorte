<?php

/**
 * ===========================================================================
 * RUTAS DE PICKING - Presupuestos de Armado de Kits
 * ===========================================================================
 * 
 * Estas rutas manejan todo el módulo de presupuestos de picking/armado de kits.
 * Acceso: Vendedores y Administradores
 */


use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Dashboard\PickingBudgetController;
use App\Http\Controllers\Dashboard\PickingConfigurationController;
use App\Http\Controllers\Dashboard\PickingPaymentConditionController;

Route::middleware(['auth', 'verified', 'permission:gestionar_costos_pick'])->prefix('dashboard')->name('dashboard.')->group(function () {

    // ========================================================================
    // PRESUPUESTOS DE PICKING
    // ========================================================================
    Route::prefix('picking')->name('picking.')->group(function () {

        // CRUD básico
        Route::get('/', [PickingBudgetController::class, 'index'])
            ->name('budgets.index');

        Route::get('/export', [PickingBudgetController::class, 'export'])
            ->name('budgets.export')
            ->middleware('admin');

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

        // Acciones especiales
        Route::post('/{pickingBudget}/duplicate', [PickingBudgetController::class, 'duplicate'])
            ->name('budgets.duplicate');
        Route::post('/{pickingBudget}/send', [PickingBudgetController::class, 'send'])
            ->name('budgets.send');
        Route::get('/{pickingBudget}/pdf', [PickingBudgetController::class, 'downloadPdf'])
            ->name('budgets.pdf');
        Route::patch('{pickingBudget}/status', [PickingBudgetController::class, 'updateStatus'])->name('budgets.update-status');

        // ====================================================================
        // CONFIGURACIÓN (Solo Administradores)
        // ====================================================================
        Route::prefix('config')->name('config.')->group(function () {

            // Gestión de Cajas
            Route::put('/boxes/update-all', [PickingConfigurationController::class, 'updateAllBoxes'])
                ->name('boxes.update-all');

            Route::get('/boxes/export', [PickingConfigurationController::class, 'exportAllBoxes'])
                ->name('boxes.export')
                ->middleware('admin');

            Route::get('/boxes', [PickingConfigurationController::class, 'boxes'])
                ->name('boxes');

            Route::delete('/boxes/{pickingBox}', [PickingConfigurationController::class, 'destroyBox'])
                ->name('boxes.destroy');

            // Gestión de Escalas de Costos
            Route::put('/cost-scales/update-all', [PickingConfigurationController::class, 'updateAllCostScales'])
                ->name('cost-scales.update-all');

            Route::get('/cost-scales/export', [PickingConfigurationController::class, 'exportAllCostScales'])
                ->name('cost-scales.export')
                ->middleware('admin');

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

            // Gestión de Condiciones de Pago
            Route::get('/payment-conditions', [PickingPaymentConditionController::class, 'index'])
                ->name('payment-conditions');

            Route::post('/payment-conditions', [PickingPaymentConditionController::class, 'store'])
                ->name('payment-conditions.store');

            Route::put('/payment-conditions/{pickingPaymentCondition}', [PickingPaymentConditionController::class, 'update'])
                ->name('payment-conditions.update');

            Route::delete('/payment-conditions/{pickingPaymentCondition}', [PickingPaymentConditionController::class, 'destroy'])
                ->name('payment-conditions.destroy');
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
