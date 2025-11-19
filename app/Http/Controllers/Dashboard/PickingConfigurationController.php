<?php

namespace App\Http\Controllers\Dashboard;

use Inertia\Inertia;
use App\Models\PickingBox;
use Illuminate\Http\Request;
use App\Models\PickingCostScale;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Models\PickingComponentIncrement;
use App\Http\Requests\Picking\StorePickingBoxRequest;
use App\Http\Requests\Picking\UpdatePickingBoxRequest;
use App\Http\Requests\Picking\StorePickingCostScaleRequest;
use App\Http\Requests\Picking\UpdatePickingCostScaleRequest;
use App\Http\Requests\Picking\StorePickingComponentIncrementRequest;
use App\Http\Requests\Picking\UpdatePickingComponentIncrementRequest;

use function Laravel\Prompts\error;
use function PHPUnit\Framework\throwException;
use Exception;

class PickingConfigurationController extends Controller
{
    // ========================================================================
    // GESTIÓN DE CAJAS
    // ========================================================================

    /**
     * Update all boxes at once (bulk update)
     */
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
            // Obtener todos los IDs de las cajas que vienen del frontend
            $submittedIds = collect($validated['boxes'])
                ->pluck('id')
                ->filter(fn($id) => $id && !str_starts_with($id, 'new-'))
                ->toArray();

            // Eliminar las cajas que ya no están en la lista (fueron borradas por el usuario)
            if (!empty($submittedIds)) {
                PickingBox::whereNotIn('id', $submittedIds)->delete();
            } else {
                // Si no hay IDs válidos, significa que el usuario borró todas las cajas existentes
                PickingBox::truncate();
            }

            // Actualizar o crear las cajas que vienen del frontend
            foreach ($validated['boxes'] as $boxData) {
                if (isset($boxData['id']) && !str_starts_with($boxData['id'], 'new-')) {
                    // Actualizar caja existente
                    $box = PickingBox::find($boxData['id']);
                    if ($box) {
                        $box->update([
                            'dimensions' => $boxData['dimensions'],
                            'cost' => $boxData['cost'],
                            'is_active' => $boxData['is_active'] ?? true,
                        ]);
                    }
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
            return redirect()->back()->with('error', 'Error al actualizar las cajas: ' . $e->getMessage());
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
        try {
            $pickingBox->delete();

            return back()->with('success', 'Caja eliminada correctamente.');
        } catch (\Exception $e) {
            Log::error('Error al eliminar caja: ' . $e->getMessage());
            return back()->with('error', 'Error al eliminar la caja.');
        }
    }

    // ========================================================================
    // GESTIÓN DE ESCALAS DE COSTOS
    // ========================================================================

    /**
     * Update all cost scales at once (bulk update)
     */
    /**
     * Update all cost scales at once (bulk update)
     */
    public function updateAllCostScales(Request $request)
    {
        $validated = $request->validate([
            'scales' => 'required|array',
            'scales.*.id' => 'nullable',
            'scales.*.quantity_from' => 'required|integer|min:1',
            'scales.*.quantity_to' => 'nullable|integer|min:1',
            'scales.*.cost_without_assembly' => 'required|numeric|min:0|max:999999.99',
            'scales.*.cost_with_assembly' => 'required|numeric|min:0|max:999999.99',
            'scales.*.palletizing_without_pallet' => 'required|numeric|min:0|max:999999.99',
            'scales.*.palletizing_with_pallet' => 'required|numeric|min:0|max:999999.99',
            'scales.*.cost_with_labeling' => 'required|numeric|min:0|max:999999.99',
            'scales.*.cost_without_labeling' => 'required|numeric|min:0|max:999999.99',
            'scales.*.additional_assembly' => 'required|numeric|min:0|max:999999.99',
            'scales.*.quality_control' => 'required|numeric|min:0|max:999999.99',
            'scales.*.dome_sticking_unit' => 'required|numeric|min:0|max:999999.99',
            'scales.*.shavings_50g_unit' => 'required|numeric|min:0|max:999999.99',
            'scales.*.shavings_100g_unit' => 'required|numeric|min:0|max:999999.99',
            'scales.*.shavings_200g_unit' => 'required|numeric|min:0|max:999999.99',
            'scales.*.bag_10x15_unit' => 'required|numeric|min:0|max:999999.99',
            'scales.*.bag_20x30_unit' => 'required|numeric|min:0|max:999999.99',
            'scales.*.bag_35x45_unit' => 'required|numeric|min:0|max:999999.99',
            'scales.*.bubble_wrap_5x10_unit' => 'required|numeric|min:0|max:999999.99',
            'scales.*.bubble_wrap_10x15_unit' => 'required|numeric|min:0|max:999999.99',
            'scales.*.bubble_wrap_20x30_unit' => 'required|numeric|min:0|max:999999.99',
            'scales.*.production_time' => 'required|string|max:50',
            'scales.*.is_active' => 'boolean',
        ]);

        DB::beginTransaction();

        try {
            // Obtener todos los IDs de las escalas que vienen del frontend
            $submittedIds = collect($validated['scales'])
                ->pluck('id')
                ->filter(fn($id) => $id && !str_starts_with($id, 'new-'))
                ->toArray();

            // Eliminar las escalas que ya no están en la lista
            if (!empty($submittedIds)) {
                PickingCostScale::whereNotIn('id', $submittedIds)->delete();
            } else {
                PickingCostScale::truncate();
            }

            // Actualizar o crear las escalas que vienen del frontend
            foreach ($validated['scales'] as $scaleData) {
                if (isset($scaleData['id']) && !str_starts_with($scaleData['id'], 'new-')) {
                    // Actualizar escala existente
                    $scale = PickingCostScale::find($scaleData['id']);
                    if ($scale) {
                        $scale->update([
                            'quantity_from' => $scaleData['quantity_from'],
                            'quantity_to' => $scaleData['quantity_to'] ?? null,
                            'cost_without_assembly' => $scaleData['cost_without_assembly'],
                            'cost_with_assembly' => $scaleData['cost_with_assembly'],
                            'palletizing_without_pallet' => $scaleData['palletizing_without_pallet'],
                            'palletizing_with_pallet' => $scaleData['palletizing_with_pallet'],
                            'cost_with_labeling' => $scaleData['cost_with_labeling'],
                            'cost_without_labeling' => $scaleData['cost_without_labeling'],
                            'additional_assembly' => $scaleData['additional_assembly'],
                            'quality_control' => $scaleData['quality_control'],
                            'dome_sticking_unit' => $scaleData['dome_sticking_unit'],
                            'shavings_50g_unit' => $scaleData['shavings_50g_unit'],
                            'shavings_100g_unit' => $scaleData['shavings_100g_unit'],
                            'shavings_200g_unit' => $scaleData['shavings_200g_unit'],
                            'bag_10x15_unit' => $scaleData['bag_10x15_unit'],
                            'bag_20x30_unit' => $scaleData['bag_20x30_unit'],
                            'bag_35x45_unit' => $scaleData['bag_35x45_unit'],
                            'bubble_wrap_5x10_unit' => $scaleData['bubble_wrap_5x10_unit'],
                            'bubble_wrap_10x15_unit' => $scaleData['bubble_wrap_10x15_unit'],
                            'bubble_wrap_20x30_unit' => $scaleData['bubble_wrap_20x30_unit'],
                            'production_time' => $scaleData['production_time'],
                            'is_active' => $scaleData['is_active'] ?? true,
                        ]);
                    }
                } else {
                    // Crear nueva escala
                    PickingCostScale::create([
                        'quantity_from' => $scaleData['quantity_from'],
                        'quantity_to' => $scaleData['quantity_to'] ?? null,
                        'cost_without_assembly' => $scaleData['cost_without_assembly'],
                        'cost_with_assembly' => $scaleData['cost_with_assembly'],
                        'palletizing_without_pallet' => $scaleData['palletizing_without_pallet'],
                        'palletizing_with_pallet' => $scaleData['palletizing_with_pallet'],
                        'cost_with_labeling' => $scaleData['cost_with_labeling'],
                        'cost_without_labeling' => $scaleData['cost_without_labeling'],
                        'additional_assembly' => $scaleData['additional_assembly'],
                        'quality_control' => $scaleData['quality_control'],
                        'dome_sticking_unit' => $scaleData['dome_sticking_unit'],
                        'shavings_50g_unit' => $scaleData['shavings_50g_unit'],
                        'shavings_100g_unit' => $scaleData['shavings_100g_unit'],
                        'shavings_200g_unit' => $scaleData['shavings_200g_unit'],
                        'bag_10x15_unit' => $scaleData['bag_10x15_unit'],
                        'bag_20x30_unit' => $scaleData['bag_20x30_unit'],
                        'bag_35x45_unit' => $scaleData['bag_35x45_unit'],
                        'bubble_wrap_5x10_unit' => $scaleData['bubble_wrap_5x10_unit'],
                        'bubble_wrap_10x15_unit' => $scaleData['bubble_wrap_10x15_unit'],
                        'bubble_wrap_20x30_unit' => $scaleData['bubble_wrap_20x30_unit'],
                        'production_time' => $scaleData['production_time'],
                        'is_active' => $scaleData['is_active'] ?? true,
                    ]);
                }
            }

            DB::commit();

            return redirect()->back()->with('success', 'Todas las escalas de costos fueron actualizadas correctamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Error al actualizar las escalas de costos: ' . $e->getMessage());
        }
    }

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
