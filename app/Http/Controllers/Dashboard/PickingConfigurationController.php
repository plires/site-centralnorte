<?php

namespace App\Http\Controllers\Dashboard;

use Exception;
use Inertia\Inertia;
use App\Models\PickingBox;
use App\Models\PickingCostScale;
use Illuminate\Support\Facades\DB;
use App\Traits\ExportsToExcel;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;
use App\Models\PickingComponentIncrement;
use App\Http\Requests\Picking\UpdateAllPickingBoxesRequest;
use App\Http\Requests\Picking\UpdateAllPickingCostScalesRequest;
use App\Http\Requests\Picking\StorePickingComponentIncrementRequest;
use App\Http\Requests\Picking\UpdatePickingComponentIncrementRequest;

class PickingConfigurationController extends Controller
{
    use ExportsToExcel;

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
     * Exportar listado de cajas de picking a Excel
     * Solo accesible para usuarios con role 'admin'
     */
    public function exportAllBoxes(Request $request)
    {
        try {

            // Verificar que el usuario sea admin
            $user = Auth::user();

            // Verificar que el usuario sea admin
            if ($user->role->name !== 'admin') {
                // Si es una petición AJAX, devolver JSON
                if ($request->wantsJson() || $request->ajax()) {
                    return response()->json([
                        'message' => 'No tienes permisos para exportar datos.'
                    ], 403);
                }

                // Si es navegación directa, abort normal
                abort(403, 'No tienes permisos para exportar datos.');
            }

            $pickingBoxes = PickingBox::all();

            // Verificar si hay datos para exportar
            if ($pickingBoxes->isEmpty()) {
                if ($request->wantsJson() || $request->ajax()) {
                    return response()->json([
                        'message' => 'No hay cajas de picking para exportar.'
                    ], 404);
                }

                return redirect()->back()->with('error', 'No hay cajas de picking para exportar.');
            }

            // Definir encabezados y sus keys correspondientes
            $headers = [
                'id' => 'ID',
                'dimensions' => 'Dimensiones',
                'cost' => 'Costo',
                'created_at' => 'Fecha de Creación',
                'updated_at' => 'Última Actualización',
                'deleted_at' => 'Fecha de Eliminación',
            ];

            // Preparar datos para exportación
            $data = $pickingBoxes->map(function ($pickingBox) {
                return [
                    'id' => $pickingBox->id,
                    'dimensions' => $pickingBox->dimensions,
                    'cost' => $pickingBox->cost,
                    'created_at' => $pickingBox->created_at ? $pickingBox->created_at->format('d/m/Y H:i') : '',
                    'updated_at' => $pickingBox->updated_at ? $pickingBox->updated_at->format('d/m/Y H:i') : '',
                    'deleted_at' => $pickingBox->deleted_at ? $pickingBox->deleted_at->format('d/m/Y H:i') : '',
                ];
            })->toArray();

            // Log de exportación exitosa
            Log::info('Cajas exportadas', [
                'user_id' => $user->id,
                'user_name' => $user->name,
                'count' => count($data),
            ]);

            // Exportar usando el trait
            return $this->exportToExcel(
                data: $data,
                headers: $headers,
                filename: 'cajas',
                sheetTitle: 'Lista de Cajas'
            );
        } catch (\Exception $e) {
            // Log del error
            Log::error('Error al exportar cajas', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Si es petición AJAX, devolver JSON
            if ($request->wantsJson() || $request->ajax()) {
                return response()->json([
                    'message' => 'Error al generar el archivo de exportación. Por favor, inténtalo de nuevo.'
                ], 500);
            }

            // Si es navegación normal, redirect con error
            return redirect()->back()->with('error', 'Error al generar el archivo de exportación. Por favor, inténtalo de nuevo.');
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
     * Exportar listado de escala de costos de picking a Excel
     * Solo accesible para usuarios con role 'admin'
     */
    public function exportAllCostScales(Request $request)
    {
        try {

            // Verificar que el usuario sea admin
            $user = Auth::user();

            // Verificar que el usuario sea admin
            if ($user->role->name !== 'admin') {
                // Si es una petición AJAX, devolver JSON
                if ($request->wantsJson() || $request->ajax()) {
                    return response()->json([
                        'message' => 'No tienes permisos para exportar datos.'
                    ], 403);
                }

                // Si es navegación directa, abort normal
                abort(403, 'No tienes permisos para exportar datos.');
            }

            $pickingCostScales = PickingCostScale::all();

            // Verificar si hay datos para exportar
            if ($pickingCostScales->isEmpty()) {
                if ($request->wantsJson() || $request->ajax()) {
                    return response()->json([
                        'message' => 'No hay escala de costos de picking para exportar.'
                    ], 404);
                }

                return redirect()->back()->with('error', 'No hay escala de costos de picking para exportar.');
            }

            // Definir encabezados y sus keys correspondientes
            $headers = [
                'id' => 'ID',
                'quantity_from' => 'Cantidad desde',
                'quantity_to' => 'Cantidad hasta',
                'cost_without_assembly' => 'costo sin montaje',
                'cost_with_assembly' => 'costo con montaje',
                'palletizing_without_pallet' => 'paletizado sin palet',
                'palletizing_with_pallet' => 'paletizado con palet',
                'cost_without_labeling' => 'costo sin etiquetado',
                'cost_with_labeling' => 'costo con etiquetado',
                'additional_assembly' => 'montaje adicional',
                'quality_control' => 'control de calidad',
                'dome_sticking_unit' => 'unidad de pegado de domes',
                'shavings_50g_unit' => 'virutas unidad de 50g',
                'shavings_100g_unit' => 'virutas unidad de 100g',
                'shavings_200g_unit' => 'virutas unidad de 200g',
                'bag_10x15_unit' => 'bolsa 10x15 unidad',
                'bag_20x30_unit' => 'bolsa 20x30 unidad',
                'bag_35x45_unit' => 'bolsa 35x45 unidad',
                'bubble_wrap_5x10_unit' => 'Pluribol unidad 5x10',
                'bubble_wrap_10x15_unit' => 'Pluribol unidad 10x15',
                'bubble_wrap_20x30_unit' => 'Pluribol unidad 20x30',
                'production_time' => 'tiempo de producion',
                'created_at' => 'Fecha de Creación',
                'updated_at' => 'Última Actualización',
                'deleted_at' => 'Fecha de Eliminación',
            ];

            // Preparar datos para exportación
            $data = $pickingCostScales->map(function ($pickingCostScale) {
                return [
                    'id' => $pickingCostScale->id,
                    'quantity_from' => $pickingCostScale->quantity_from,
                    'quantity_to' => $pickingCostScale->quantity_to,
                    'cost_without_assembly' => $pickingCostScale->cost_without_assembly,
                    'cost_with_assembly' => $pickingCostScale->cost_with_assembly,
                    'palletizing_without_pallet' => $pickingCostScale->palletizing_without_pallet,
                    'palletizing_with_pallet' => $pickingCostScale->palletizing_with_pallet,
                    'cost_without_labeling' => $pickingCostScale->cost_without_labeling,
                    'cost_with_labeling' => $pickingCostScale->cost_with_labeling,
                    'additional_assembly' => $pickingCostScale->additional_assembly,
                    'quality_control' => $pickingCostScale->quality_control,
                    'dome_sticking_unit' => $pickingCostScale->dome_sticking_unit,
                    'shavings_50g_unit' => $pickingCostScale->shavings_50g_unit,
                    'shavings_100g_unit' => $pickingCostScale->shavings_100g_unit,
                    'shavings_200g_unit' => $pickingCostScale->shavings_200g_unit,
                    'bag_10x15_unit' => $pickingCostScale->bag_10x15_unit,
                    'bag_20x30_unit' => $pickingCostScale->bag_20x30_unit,
                    'bag_35x45_unit' => $pickingCostScale->bag_35x45_unit,
                    'bubble_wrap_5x10_unit' => $pickingCostScale->bubble_wrap_5x10_unit,
                    'bubble_wrap_10x15_unit' => $pickingCostScale->bubble_wrap_10x15_unit,
                    'bubble_wrap_20x30_unit' => $pickingCostScale->bubble_wrap_20x30_unit,
                    'production_time' => $pickingCostScale->production_time,
                    'created_at' => $pickingCostScale->created_at ? $pickingCostScale->created_at->format('d/m/Y H:i') : '',
                    'updated_at' => $pickingCostScale->updated_at ? $pickingCostScale->updated_at->format('d/m/Y H:i') : '',
                    'deleted_at' => $pickingCostScale->deleted_at ? $pickingCostScale->deleted_at->format('d/m/Y H:i') : '',
                ];
            })->toArray();

            // Log de exportación exitosa
            Log::info('Escalas de costos exportadas', [
                'user_id' => $user->id,
                'user_name' => $user->name,
                'count' => count($data),
            ]);

            // Exportar usando el trait
            return $this->exportToExcel(
                data: $data,
                headers: $headers,
                filename: 'escalas-costos',
                sheetTitle: 'Lista de Escalas de costos'
            );
        } catch (\Exception $e) {
            // Log del error
            Log::error('Error al exportar escalas-costos', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Si es petición AJAX, devolver JSON
            if ($request->wantsJson() || $request->ajax()) {
                return response()->json([
                    'message' => 'Error al generar el archivo de exportación. Por favor, inténtalo de nuevo.'
                ], 500);
            }

            // Si es navegación normal, redirect con error
            return redirect()->back()->with('error', 'Error al generar el archivo de exportación. Por favor, inténtalo de nuevo.');
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
