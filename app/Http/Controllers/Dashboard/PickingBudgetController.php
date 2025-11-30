<?php

namespace App\Http\Controllers\Dashboard;

use App\Models\User;
use Inertia\Inertia;
use App\Models\Client;
use App\Models\PickingBox;
use Illuminate\Http\Request;
use App\Models\PickingBudget;
use App\Mail\PickingBudgetSent;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\PickingBudgetBox;
use App\Models\PickingCostScale;
use App\Enums\PickingBudgetStatus;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Models\PickingBudgetService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use App\Models\PickingComponentIncrement;
use App\Http\Requests\Picking\StorePickingBudgetRequest;
use App\Http\Requests\Picking\UpdatePickingBudgetRequest;


class PickingBudgetController extends Controller
{
    /**
     * Display a listing of picking budgets
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        $query = PickingBudget::with('vendor:id,name')
            ->select([
                'id',
                'budget_number',
                'vendor_id',
                'total_kits',
                'total_components_per_kit',
                'total',
                'unit_price_per_kit',
                'status',
                'valid_until',
                'created_at'
            ]);

        $query = PickingBudget::with(['vendor:id,name', 'client:id,name,company']);

        // Filtro por vendedor (si no es admin, solo ve sus presupuestos)
        if (!$user->role->name === 'admin') {
            $query->where('vendor_id', Auth::id());
        } elseif ($request->filled('vendor_id')) {
            $query->where('vendor_id', $request->vendor_id);
        }

        // Filtro por estado
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filtro por rango de fechas
        if ($request->filled('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }
        if ($request->filled('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        // Búsqueda por cliente o número de presupuesto
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('client', function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%");
                })
                    ->orWhere('budget_number', 'like', "%{$search}%");
            });
        }

        // Ordenar por fecha de creación descendente
        $query->orderBy('created_at', 'desc');

        $budgets = $query->paginate(15)->withQueryString();

        return Inertia::render('dashboard/picking/Index', [
            'budgets' => $budgets,
            'filters' => $request->only(['status', 'vendor_id', 'from_date', 'to_date', 'search']),
        ]);
    }

    /**
     * Show the form for creating a new picking budget
     */
    public function create()
    {
        $boxes = PickingBox::active()->orderBy('cost')->get();
        $scales = PickingCostScale::active()->orderBy('quantity_from')->get();
        $increments = PickingComponentIncrement::active()->orderBy('components_from')->get();

        $clients = Client::orderBy('name')
            ->get()
            ->map(function ($client) {
                return [
                    'value' => $client->id,
                    'label' => $client->company
                        ? "{$client->name} ({$client->company})"
                        : $client->name,
                ];
            });

        return Inertia::render('dashboard/picking/Create', [
            'clients' => $clients,
            'boxes' => $boxes,
            'costScales' => $scales,
            'componentIncrements' => $increments,
        ]);
    }

    /**
     * Store a newly created picking budget
     */
    public function store(StorePickingBudgetRequest $request)
    {
        DB::beginTransaction();

        try {
            $validated = $request->validated();

            // Obtener la escala de costos según cantidad de kits
            $scale = PickingCostScale::findForQuantity($validated['total_kits']);
            if (!$scale) {
                return back()->withErrors(['total_kits' => 'No se encontró una escala de costos para esta cantidad de kits.']);
            }

            // Obtener el incremento según componentes
            $increment = PickingComponentIncrement::findForComponents($validated['total_components_per_kit']);
            if (!$increment) {
                return back()->withErrors(['total_components_per_kit' => 'No se encontró un incremento para esta cantidad de componentes.']);
            }

            // Crear el presupuesto con snapshots
            $budget = PickingBudget::create([
                'budget_number' => PickingBudget::generateBudgetNumber(),
                'vendor_id' => Auth::id(),
                'client_id' => $validated['client_id'],
                'total_kits' => $validated['total_kits'],
                'total_components_per_kit' => $validated['total_components_per_kit'],
                // Snapshot de la escala
                'scale_quantity_from' => $scale->quantity_from,
                'scale_quantity_to' => $scale->quantity_to,
                'production_time' => $scale->production_time,
                // Snapshot del incremento
                'component_increment_description' => $increment->description,
                'component_increment_percentage' => $increment->percentage,
                // Totales (se calcularán después)
                'services_subtotal' => 0,
                'component_increment_amount' => 0,
                'subtotal_with_increment' => 0,
                'box_total' => 0,
                'total' => 0,
                'unit_price_per_kit' => 0,
                'status' => PickingBudgetStatus::DRAFT,
                'valid_until' => now()->addDays(30),
                'notes' => $validated['notes'] ?? null,
            ]);

            // Crear las cajas seleccionadas (soporte múltiples cajas)
            if (!empty($validated['boxes'])) {
                foreach ($validated['boxes'] as $boxData) {
                    PickingBudgetBox::create([
                        'picking_budget_id' => $budget->id,
                        'box_dimensions' => $boxData['box_dimensions'],
                        'box_unit_cost' => $boxData['box_unit_cost'],
                        'quantity' => $boxData['quantity'],
                        'subtotal' => $boxData['box_unit_cost'] * $boxData['quantity'],
                    ]);
                }
            }

            // Crear los servicios seleccionados
            if (!empty($validated['services'])) {
                foreach ($validated['services'] as $serviceData) {
                    PickingBudgetService::create([
                        'picking_budget_id' => $budget->id,
                        'service_type' => $serviceData['service_type'],
                        'service_description' => $serviceData['service_description'],
                        'unit_cost' => $serviceData['unit_cost'],
                        'quantity' => $serviceData['quantity'],
                        'subtotal' => $serviceData['unit_cost'] * $serviceData['quantity'],
                    ]);
                }
            }

            // Calcular y actualizar totales (incluye unit_price_per_kit)
            $budget->calculateTotals();
            $budget->save();

            DB::commit();

            return redirect()
                ->route('dashboard.picking.budgets.show', $budget)
                ->with('success', 'Presupuesto de picking creado correctamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error al crear el presupuesto: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified picking budget
     */
    public function show(PickingBudget $pickingBudget)
    {
        $user = Auth::user();

        // Verificar permiso (admin o propietario)
        if (!$user->role->name === 'admin' && $pickingBudget->vendor_id !== Auth::id()) {
            abort(403, 'No tienes permiso para ver este presupuesto.');
        }

        $pickingBudget->load(['vendor:id,name,email', 'client:id,name,email,phone,company,address', 'services', 'boxes']);

        return Inertia::render('dashboard/picking/Show', [
            'budget' => $pickingBudget,
        ]);
    }

    /**
     * Show the form for editing the specified picking budget
     */
    public function edit(PickingBudget $pickingBudget)
    {

        $user = Auth::user();

        // Verificar permiso
        if (!$user->role->name === 'admin' && $pickingBudget->vendor_id !== Auth::id()) {
            abort(403, 'No tienes permiso para editar este presupuesto.');
        }

        // Solo se puede editar si está en draft
        if ($pickingBudget->status !== PickingBudgetStatus::DRAFT) {
            return back()->withErrors(['error' => 'Solo se pueden editar presupuestos en estado borrador.']);
        }

        $pickingBudget->load(['services', 'boxes', 'client:id,name,email,phone,company']);
        $boxes = PickingBox::active()->orderBy('cost')->get();
        $scales = PickingCostScale::active()->orderBy('quantity_from')->get();
        $increments = PickingComponentIncrement::active()->orderBy('components_from')->get();

        $clients = Client::orderBy('name')
            ->get()
            ->map(function ($client) {
                return [
                    'value' => $client->id,
                    'label' => $client->company
                        ? "{$client->name} ({$client->company})"
                        : $client->name,
                ];
            });

        return Inertia::render('dashboard/picking/Edit', [
            'budget' => $pickingBudget,
            'boxes' => $boxes,
            'costScales' => $scales,
            'componentIncrements' => $increments,
            'clients' => $clients,
        ]);
    }

    /**
     * Update the specified picking budget
     */
    public function update(UpdatePickingBudgetRequest $request, PickingBudget $pickingBudget)
    {
        $user = Auth::user();

        // Verificar permiso
        if (!$user->role->name === 'admin' && $pickingBudget->vendor_id !== Auth::id()) {
            abort(403, 'No tienes permiso para actualizar este presupuesto.');
        }

        // Solo se puede editar si está en draft
        if ($pickingBudget->status !== PickingBudgetStatus::DRAFT) {
            return back()->withErrors(['error' => 'Solo se pueden editar presupuestos en estado borrador.']);
        }

        DB::beginTransaction();

        try {
            $validated = $request->validated();

            // Obtener la escala de costos según cantidad de kits
            $scale = PickingCostScale::findForQuantity($validated['total_kits']);
            if (!$scale) {
                return back()->withErrors(['total_kits' => 'No se encontró una escala de costos para esta cantidad de kits.']);
            }

            // Obtener el incremento según componentes
            $increment = PickingComponentIncrement::findForComponents($validated['total_components_per_kit']);
            if (!$increment) {
                return back()->withErrors(['total_components_per_kit' => 'No se encontró un incremento para esta cantidad de componentes.']);
            }

            // Actualizar el presupuesto
            $pickingBudget->update([
                'client_id' => $validated['client_id'],
                'total_kits' => $validated['total_kits'],
                'total_components_per_kit' => $validated['total_components_per_kit'],
                // Actualizar snapshot de la escala
                'scale_quantity_from' => $scale->quantity_from,
                'scale_quantity_to' => $scale->quantity_to,
                'production_time' => $scale->production_time,
                // Actualizar snapshot del incremento
                'component_increment_description' => $increment->description,
                'component_increment_percentage' => $increment->percentage,
                'notes' => $validated['notes'] ?? null,
            ]);

            // Eliminar cajas anteriores y crear las nuevas
            $pickingBudget->boxes()->delete();

            if (!empty($validated['boxes'])) {
                foreach ($validated['boxes'] as $boxData) {
                    PickingBudgetBox::create([
                        'picking_budget_id' => $pickingBudget->id,
                        'box_dimensions' => $boxData['box_dimensions'],
                        'box_unit_cost' => $boxData['box_unit_cost'],
                        'quantity' => $boxData['quantity'],
                        'subtotal' => $boxData['box_unit_cost'] * $boxData['quantity'],
                    ]);
                }
            }

            // Eliminar servicios anteriores y crear los nuevos
            $pickingBudget->services()->delete();

            if (!empty($validated['services'])) {
                foreach ($validated['services'] as $serviceData) {
                    PickingBudgetService::create([
                        'picking_budget_id' => $pickingBudget->id,
                        'service_type' => $serviceData['service_type'],
                        'service_description' => $serviceData['service_description'],
                        'unit_cost' => $serviceData['unit_cost'],
                        'quantity' => $serviceData['quantity'],
                        'subtotal' => $serviceData['unit_cost'] * $serviceData['quantity'],
                    ]);
                }
            }

            // Recalcular totales (incluye unit_price_per_kit)
            $pickingBudget->calculateTotals();
            $pickingBudget->save();

            DB::commit();

            return redirect()
                ->route('dashboard.picking.budgets.show', $pickingBudget)
                ->with('success', 'Presupuesto actualizado correctamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error al actualizar el presupuesto: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified picking budget (soft delete)
     */
    public function destroy(PickingBudget $pickingBudget)
    {

        $user = Auth::user();

        // Verificar permiso
        if (!$user->role->name === 'admin' && $pickingBudget->vendor_id !== Auth::id()) {
            abort(403, 'No tienes permiso para eliminar este presupuesto.');
        }

        $pickingBudget->delete();

        return redirect()
            ->route('picking.budgets.index')
            ->with('success', 'Presupuesto eliminado correctamente.');
    }

    /**
     * Duplicate an existing picking budget
     */
    public function duplicate(PickingBudget $pickingBudget)
    {
        $user = Auth::user();

        // Verificar permiso
        if (!$user->role->name === 'admin' && $pickingBudget->vendor_id !== Auth::id()) {
            abort(403, 'No tienes permiso para duplicar este presupuesto.');
        }

        DB::beginTransaction();

        try {
            // Clonar el presupuesto
            $newBudget = $pickingBudget->replicate();
            $newBudget->budget_number = PickingBudget::generateBudgetNumber();
            $newBudget->status = PickingBudgetStatus::DRAFT;
            $newBudget->valid_until = now()->addDays(30);
            $newBudget->vendor_id = Auth::id();
            $newBudget->save();

            // Clonar los servicios
            foreach ($pickingBudget->services as $service) {
                $newService = $service->replicate();
                $newService->picking_budget_id = $newBudget->id;
                $newService->save();
            }

            DB::commit();

            return redirect()
                ->route('picking.budgets.edit', $newBudget)
                ->with('success', 'Presupuesto duplicado correctamente. Puedes editarlo antes de enviarlo.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error al duplicar el presupuesto: ' . $e->getMessage()]);
        }
    }

    /**
     * Send picking budget to client via email
     */
    public function send(PickingBudget $pickingBudget)
    {
        $user = Auth::user();

        // Verificar permiso
        if (!$user->role->name === 'admin' && $pickingBudget->vendor_id !== Auth::id()) {
            abort(403, 'No tienes permiso para enviar este presupuesto.');
        }

        // Validar que tenga email
        $pickingBudget->load('client');

        if (!$pickingBudget->client || !$pickingBudget->client->email) {
            return back()->withErrors(['error' => 'El cliente no tiene un email asociado.']);
        }

        try {
            // Generar PDF
            $pdf = $this->generatePdf($pickingBudget);

            // Enviar email
            Mail::to($pickingBudget->client->email)
                ->send(new PickingBudgetSent($pickingBudget, $pdf));

            // Actualizar estado
            $pickingBudget->update(['status' => PickingBudgetStatus::SENT]);

            return back()->with('success', 'Presupuesto enviado correctamente a ' . $pickingBudget->client->email);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Error al enviar el presupuesto: ' . $e->getMessage()]);
        }
    }

    /**
     * Download picking budget as PDF
     */
    public function downloadPdf(PickingBudget $pickingBudget)
    {
        $user = Auth::user();

        $pickingBudget->load(['client', 'vendor', 'services', 'boxes']);

        // Verificar permiso
        if (!$user->role->name === 'admin' && $pickingBudget->vendor_id !== Auth::id()) {
            abort(403, 'No tienes permiso para descargar este presupuesto.');
        }

        $pdf = $this->generatePdf($pickingBudget);

        return $pdf->download("presupuesto-picking-{$pickingBudget->budget_number}.pdf");
    }

    /**
     * Generate PDF for picking budget
     */
    private function generatePdf(PickingBudget $pickingBudget)
    {
        $pickingBudget->load(['client', 'vendor', 'services', 'boxes']);

        $pdf = Pdf::loadView('pdf.picking-budget', [
            'budget' => $pickingBudget
        ]);

        $pdf->setPaper('a4', 'portrait');

        return $pdf;
    }

    /**
     * Calculate totals for AJAX requests (real-time calculation)
     */
    public function calculateTotals(Request $request)
    {
        $validated = $request->validate([
            'total_kits' => 'required|integer|min:1',
            'total_components_per_kit' => 'required|integer|min:1',
            'box_cost' => 'required|numeric|min:0',
            'services' => 'required|array',
            'services.*.unit_cost' => 'required|numeric|min:0',
            'services.*.quantity' => 'required|integer|min:1',
        ]);

        // Calcular subtotal de servicios
        $servicesSubtotal = collect($validated['services'])->sum(function ($service) {
            return $service['unit_cost'] * $service['quantity'];
        });

        // Obtener incremento por componentes
        $increment = PickingComponentIncrement::findForComponents($validated['total_components_per_kit']);
        $incrementPercentage = $increment ? $increment->percentage : 0;

        // Calcular incremento
        $incrementAmount = $servicesSubtotal * $incrementPercentage;

        // Calcular totales
        $subtotalWithIncrement = $servicesSubtotal + $incrementAmount;
        $total = $subtotalWithIncrement + $validated['box_cost'];

        return response()->json([
            'services_subtotal' => round($servicesSubtotal, 2),
            'component_increment_percentage' => $incrementPercentage,
            'component_increment_amount' => round($incrementAmount, 2),
            'subtotal_with_increment' => round($subtotalWithIncrement, 2),
            'box_total' => $validated['box_cost'],
            'total' => round($total, 2),
        ]);
    }

    /**
     * Get cost scale for a given quantity (AJAX)
     */
    public function getCostScaleForQuantity(int $quantity)
    {
        $scale = PickingCostScale::findForQuantity($quantity);

        if (!$scale) {
            return response()->json(['error' => 'No se encontró una escala de costos para esta cantidad.'], 404);
        }

        return response()->json($scale);
    }

    /**
     * Get component increment for a given number of components (AJAX)
     */
    public function getComponentIncrementForQuantity(int $components)
    {
        $increment = PickingComponentIncrement::findForComponents($components);

        if (!$increment) {
            return response()->json(['error' => 'No se encontró un incremento para esta cantidad de componentes.'], 404);
        }

        return response()->json($increment);
    }
}
