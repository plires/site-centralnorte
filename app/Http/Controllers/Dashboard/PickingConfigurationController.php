<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\PickingBox;
use App\Models\PickingCostScale;
use App\Models\PickingComponentIncrement;
use App\Http\Requests\Picking\StorePickingBoxRequest;
use App\Http\Requests\Picking\UpdatePickingBoxRequest;
use App\Http\Requests\Picking\StorePickingCostScaleRequest;
use App\Http\Requests\Picking\UpdatePickingCostScaleRequest;
use App\Http\Requests\Picking\StorePickingComponentIncrementRequest;
use App\Http\Requests\Picking\UpdatePickingComponentIncrementRequest;
use Inertia\Inertia;

class PickingConfigurationController extends Controller
{
    // ========================================================================
    // GESTIÓN DE CAJAS
    // ========================================================================

    /**
     * Display boxes configuration
     */
    public function boxes()
    {
        $boxes = PickingBox::orderBy('cost')->get();

        return Inertia::render('Picking/Config/Boxes', [
            'boxes' => $boxes
        ]);
    }

    /**
     * Store a newly created box
     */
    public function storeBox(StorePickingBoxRequest $request)
    {
        PickingBox::create($request->validated());

        return back()->with('success', 'Caja creada correctamente.');
    }

    /**
     * Update the specified box
     */
    public function updateBox(UpdatePickingBoxRequest $request, PickingBox $pickingBox)
    {
        $pickingBox->update($request->validated());

        return back()->with('success', 'Caja actualizada correctamente.');
    }

    /**
     * Remove the specified box
     */
    public function destroyBox(PickingBox $pickingBox)
    {
        // Verificar si hay presupuestos usando esta caja
        // Si hay, mejor desactivar en lugar de eliminar
        $pickingBox->update(['is_active' => false]);

        return back()->with('success', 'Caja desactivada correctamente.');
    }

    // ========================================================================
    // GESTIÓN DE ESCALAS DE COSTOS
    // ========================================================================

    /**
     * Display cost scales configuration
     */
    public function costScales()
    {
        $scales = PickingCostScale::orderBy('quantity_from')->get();

        return Inertia::render('Picking/Config/CostScales', [
            'scales' => $scales
        ]);
    }

    /**
     * Store a newly created cost scale
     */
    public function storeCostScale(StorePickingCostScaleRequest $request)
    {
        PickingCostScale::create($request->validated());

        return back()->with('success', 'Escala de costos creada correctamente.');
    }

    /**
     * Update the specified cost scale
     */
    public function updateCostScale(UpdatePickingCostScaleRequest $request, PickingCostScale $pickingCostScale)
    {
        $pickingCostScale->update($request->validated());

        return back()->with('success', 'Escala de costos actualizada correctamente.');
    }

    /**
     * Remove the specified cost scale
     */
    public function destroyCostScale(PickingCostScale $pickingCostScale)
    {
        // Desactivar en lugar de eliminar para mantener histórico
        $pickingCostScale->update(['is_active' => false]);

        return back()->with('success', 'Escala de costos desactivada correctamente.');
    }

    // ========================================================================
    // GESTIÓN DE INCREMENTOS POR COMPONENTES
    // ========================================================================

    /**
     * Display component increments configuration
     */
    public function componentIncrements()
    {
        $increments = PickingComponentIncrement::orderBy('components_from')->get();

        return Inertia::render('Picking/Config/ComponentIncrements', [
            'increments' => $increments
        ]);
    }

    /**
     * Store a newly created component increment
     */
    public function storeComponentIncrement(StorePickingComponentIncrementRequest $request)
    {
        PickingComponentIncrement::create($request->validated());

        return back()->with('success', 'Incremento por componentes creado correctamente.');
    }

    /**
     * Update the specified component increment
     */
    public function updateComponentIncrement(UpdatePickingComponentIncrementRequest $request, PickingComponentIncrement $pickingComponentIncrement)
    {
        $pickingComponentIncrement->update($request->validated());

        return back()->with('success', 'Incremento por componentes actualizado correctamente.');
    }

    /**
     * Remove the specified component increment
     */
    public function destroyComponentIncrement(PickingComponentIncrement $pickingComponentIncrement)
    {
        // Desactivar en lugar de eliminar
        $pickingComponentIncrement->update(['is_active' => false]);

        return back()->with('success', 'Incremento por componentes desactivado correctamente.');
    }
}
