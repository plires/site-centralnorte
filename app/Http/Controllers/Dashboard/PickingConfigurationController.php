<?php

namespace App\Http\Controllers\Dashboard;

use Exception;
use Inertia\Inertia;
use App\Models\PickingBox;
use App\Models\PickingCostScale;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Models\PickingComponentIncrement;
use App\Http\Requests\Picking\UpdateAllPickingBoxesRequest;
use App\Http\Requests\Picking\UpdateAllPickingCostScalesRequest;
use App\Http\Requests\Picking\StorePickingComponentIncrementRequest;
use App\Http\Requests\Picking\UpdatePickingComponentIncrementRequest;

class PickingConfigurationController extends Controller
{
    // ========================================================================
    // GESTIÓN DE CAJAS
    // ========================================================================

    /**
     * Update all boxes at once (bulk update)
     */
    public function updateAllBoxes(UpdateAllPickingBoxesRequest $request)
    {
        $validated = $request->validated();

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
            Log::error('Error al actualizar cajas masivamente: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->back()->with('error', 'Ocurrió un error al actualizar las cajas. Por favor, verifica los datos e intenta nuevamente.');
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
    public function updateAllCostScales(UpdateAllPickingCostScalesRequest $request)
    {
        try {
            DB::transaction(function () use ($request) {
                $validated = $request->validated();

                // IDs que vienen del frontend (ignoramos los "new-...")
                $submittedIds = collect($validated['scales'])
                    ->pluck('id')
                    ->filter(fn($id) => $id && !str_starts_with($id, 'new-'))
                    ->all();

                // Eliminar las escalas que ya no existen en el frontend
                if (!empty($submittedIds)) {
                    PickingCostScale::whereNotIn('id', $submittedIds)->delete();
                } else {
                    PickingCostScale::truncate();
                }

                foreach ($validated['scales'] as $scaleData) {

                    // Normalizamos los datos una sola vez
                    $attributes = $scaleData;

                    // Nunca queremos sobreescribir el id con fill()
                    unset($attributes['id']);

                    // Campos con defaults / nullables
                    $attributes['quantity_to'] = $scaleData['quantity_to'] ?? null;
                    $attributes['is_active']   = $scaleData['is_active'] ?? true;

                    // Escala existente o nueva
                    $scale = (isset($scaleData['id']) && !str_starts_with($scaleData['id'], 'new-'))
                        ? PickingCostScale::findOrNew($scaleData['id'])
                        : new PickingCostScale();

                    // Gracias a $fillable, fill() solo toma los campos permitidos
                    $scale->fill($attributes);
                    $scale->save();
                }
            });

            return redirect()
                ->back()
                ->with('success', 'Todas las escalas de costos fueron actualizadas correctamente.');
        } catch (\Throwable $e) {
            Log::error('Error al actualizar escalas de costos: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()
                ->back()
                ->with('error', 'Ocurrió un error al actualizar las escalas de costos. Por favor, verifica los datos e intenta nuevamente.');
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
     * Remove the specified cost scale
     */
    public function destroyCostScale(PickingCostScale $pickingCostScale)
    {
        try {
            $pickingCostScale->delete();

            return back()->with('success', 'Rango eliminado correctamente.');
        } catch (\Exception $e) {
            Log::error('Error al eliminar el rango: ' . $e->getMessage());
            return back()->with('error', 'Error al eliminar el rango.');
        }
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

        try {
            PickingComponentIncrement::create($request->validated());
            return back()->with('success', 'Incremento por componentes creado correctamente.');
        } catch (\Exception $e) {
            Log::error('Error al actualizar incremento por componentes: ' . $e->getMessage());
            return back()->with('error', 'Error al actualizar el incremento por componentes.');
        }
    }

    /**
     * Update the specified component increment
     */
    public function updateComponentIncrement(UpdatePickingComponentIncrementRequest $request, PickingComponentIncrement $pickingComponentIncrement)
    {
        try {
            $pickingComponentIncrement->update($request->validated());
            return back()->with('success', 'Incremento por componentes actualizado correctamente.');
        } catch (\Exception $e) {
            Log::error('Error al actualizar Incremento por componentes: ' . $e->getMessage());
            return back()->with('error', 'Error al actualizar el incremento por componentes.');
        }
    }

    /**
     * Remove the specified component increment
     */
    public function destroyComponentIncrement(PickingComponentIncrement $pickingComponentIncrement)
    {

        try {
            $pickingComponentIncrement->delete();

            return back()->with('success', 'Incremento por componentes eliminado correctamente.');
        } catch (\Exception $e) {
            Log::error('Error al eliminar Incremento por componentes: ' . $e->getMessage());
            return back()->with('error', 'Error al eliminar el incremento por componentes.');
        }
    }
}
