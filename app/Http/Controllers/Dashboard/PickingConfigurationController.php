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
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class PickingConfigurationController extends Controller
{
    // ========================================================================
    // GESTIÓN DE CAJAS
    // ========================================================================

    /**
     * Update all boxes at once (bulk update)
     */
    public function updateAllBoxes(Request $request)
    {
        $validated = $request->validate([
            'boxes' => 'required|array',
            'boxes.*.id' => 'nullable', // nullable para nuevas cajas
            'boxes.*.dimensions' => 'required|string|max:50',
            'boxes.*.cost' => 'required|numeric|min:0|max:999999.99',
            'boxes.*.is_active' => 'boolean',
        ]);

        DB::beginTransaction();

        try {
            foreach ($validated['boxes'] as $boxData) {
                if (isset($boxData['id']) && !str_starts_with($boxData['id'], 'new-')) {
                    // Actualizar caja existente
                    $box = PickingBox::findOrFail($boxData['id']);
                    $box->update([
                        'dimensions' => $boxData['dimensions'],
                        'cost' => $boxData['cost'],
                        'is_active' => $boxData['is_active'] ?? true,
                    ]);
                } else {
                    // Crear nueva caja
                    PickingBox::create([
                        'dimensions' => $boxData['dimensions'],
                        'cost' => $boxData['cost'],
                        'is_active' => $boxData['is_active'] ?? true,
                    ]);
                }
            }

            DB::commit();

            return redirect()->back()->with('success', 'Todas las cajas fueron actualizadas correctamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Error al actualizar las cajas: ' . $e->getMessage()]);
        }
    }

    /**
     * Display boxes configuration
     */
    public function boxes()
    {
        $boxes = PickingBox::orderBy('cost')->get();

        return Inertia::render('dashboard/picking/config/Boxes', [
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

        return Inertia::render('dashboard/picking/config/CostScales', [
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

        return Inertia::render('dashboard/picking/config/ComponentIncrements', [
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
