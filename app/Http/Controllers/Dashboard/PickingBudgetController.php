<?php

namespace App\Http\Controllers\Dashboard;

use App\Models\User;
use Inertia\Inertia;
use App\Models\Client;
use App\Models\PickingBox;
use Illuminate\Http\Request;
use App\Models\PickingBudget;
use App\Enums\BudgetStatus;
use App\Mail\PickingBudgetSent;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\PickingBudgetBox;
use App\Models\PickingCostScale;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Models\PickingBudgetService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Models\PickingPaymentCondition;
use App\Models\PickingComponentIncrement;
use App\Http\Requests\Picking\StorePickingBudgetRequest;
use App\Http\Requests\Picking\UpdatePickingBudgetRequest;

class PickingBudgetController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        $query = PickingBudget::with(['vendor:id,name', 'client:id,name,company']);

        // Filtro por vendedor
        if ($user->role->name !== 'admin') {
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

        // Búsqueda
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('client', function ($cq) use ($search) {
                    $cq->where('name', 'like', "%{$search}%")
                        ->orWhere('company', 'like', "%{$search}%");
                })->orWhere('budget_number', 'like', "%{$search}%");
            });
        }

        $budgets = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        $budgets->getCollection()->transform(function ($budget) {
            $statusData = $budget->getStatusData();
            return array_merge($budget->toArray(), $statusData);
        });

        $vendors = [];
        if ($user->role->name === 'admin') {
            $vendors = User::whereHas('role', function ($q) {
                $q->whereIn('name', ['admin', 'vendedor']);
            })->select('id', 'name')->get();
        }

        return Inertia::render('dashboard/picking/Index', [
            'budgets' => $budgets,
            'vendors' => $vendors,
            'filters' => $request->only(['search', 'status', 'vendor_id', 'from_date', 'to_date']),
            'statuses' => BudgetStatus::toSelectArray(),
        ]);
    }

    public function create()
    {
        $boxes = PickingBox::active()->orderBy('cost')->get();
        $scales = PickingCostScale::active()->orderBy('quantity_from')->get();
        $increments = PickingComponentIncrement::active()->orderBy('components_from')->get();

        $clients = Client::orderBy('name')->get()->map(fn($client) => [
            'value' => $client->id,
            'label' => $client->company ? "{$client->name} ({$client->company})" : $client->name,
        ]);

        // Cargar condiciones de pago activas
        $paymentConditions = PickingPaymentCondition::active()
            ->orderBy('description')
            ->get();

        return Inertia::render('dashboard/picking/Create', [
            'boxes' => $boxes,
            'costScales' => $scales,
            'componentIncrements' => $increments,
            'clients' => $clients,
            'paymentConditions' => $paymentConditions,
            'businessConfig' => [
                'iva_rate' => config('business.tax.iva_rate', 0.21),
                'apply_iva' => config('business.tax.apply_iva', true),
            ],
        ]);
    }

    public function store(StorePickingBudgetRequest $request)
    {
        $validated = $request->validated();

        DB::beginTransaction();

        try {
            $scale = PickingCostScale::findForQuantity($validated['total_kits']);
            if (!$scale) {
                return back()->withErrors(['total_kits' => 'No se encontró una escala de costos para esta cantidad.']);
            }

            $increment = PickingComponentIncrement::findForComponents($validated['total_components_per_kit']);
            if (!$increment) {
                return back()->withErrors(['total_components_per_kit' => 'No se encontró un incremento para esta cantidad de componentes.']);
            }

            $paymentConditionData = [
                'picking_payment_condition_id' => null,
                'payment_condition_description' => null,
                'payment_condition_percentage' => null,
            ];

            if (!empty($validated['picking_payment_condition_id'])) {
                $paymentCondition = PickingPaymentCondition::find($validated['picking_payment_condition_id']);
                if ($paymentCondition) {
                    $paymentConditionData = [
                        'picking_payment_condition_id' => $paymentCondition->id,
                        'payment_condition_description' => $paymentCondition->description,
                        'payment_condition_percentage' => $paymentCondition->percentage,
                    ];
                }
            }

            // Crear con estado UNSENT (sin enviar)
            $budget = PickingBudget::create(array_merge([
                'budget_number' => PickingBudget::generateBudgetNumber(),
                'vendor_id' => Auth::id(),
                'client_id' => $validated['client_id'],
                'total_kits' => $validated['total_kits'],
                'total_components_per_kit' => $validated['total_components_per_kit'],
                'scale_quantity_from' => $scale->quantity_from,
                'scale_quantity_to' => $scale->quantity_to,
                'production_time' => $scale->production_time,
                'component_increment_description' => $increment->description,
                'component_increment_percentage' => $increment->percentage,
                'services_subtotal' => 0,
                'component_increment_amount' => 0,
                'subtotal_with_increment' => 0,
                'box_total' => 0,
                'total' => 0,
                'unit_price_per_kit' => 0,
                'status' => BudgetStatus::UNSENT,
                'valid_until' => now()->addDays(30),
                'notes' => $validated['notes'] ?? null,
            ], $paymentConditionData));

            // Crear cajas
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

            // Crear servicios
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

            $budget->calculateTotals();
            $budget->save();

            DB::commit();

            return redirect()->route('dashboard.picking.budgets.show', $budget)
                ->with('success', 'Presupuesto de picking creado correctamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al crear presupuesto de picking: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Error al crear el presupuesto: ' . $e->getMessage()]);
        }
    }

    public function show(PickingBudget $pickingBudget)
    {
        $user = Auth::user();

        if ($user->role->name !== 'admin' && $pickingBudget->vendor_id !== Auth::id()) {
            abort(403, 'No tienes permiso para ver este presupuesto.');
        }

        $pickingBudget->load([
            'vendor:id,name,email',
            'client:id,name,email,phone,company,address',
            'services',
            'boxes',
            'paymentCondition'
        ]);

        $statusData = $pickingBudget->getStatusData();

        return Inertia::render('dashboard/picking/Show', [
            'budget' => array_merge($pickingBudget->toArray(), $statusData),
            'businessConfig' => [
                'iva_rate' => config('business.tax.iva_rate', 0.21),
                'apply_iva' => config('business.tax.apply_iva', true),
            ],
            'statuses' => BudgetStatus::toSelectArray(),
        ]);
    }

    public function edit(PickingBudget $pickingBudget)
    {
        $user = Auth::user();

        if ($user->role->name !== 'admin' && $pickingBudget->vendor_id !== Auth::id()) {
            abort(403, 'No tienes permiso para editar este presupuesto.');
        }

        // Solo se puede editar si es editable
        if (!$pickingBudget->isEditable()) {
            return back()->withErrors(['error' => 'Solo se pueden editar presupuestos sin enviar o en borrador.']);
        }

        $pickingBudget->load(['services', 'boxes', 'client:id,name,email,phone,company']);

        $boxes = PickingBox::active()->orderBy('cost')->get();
        $scales = PickingCostScale::active()->orderBy('quantity_from')->get();
        $increments = PickingComponentIncrement::active()->orderBy('components_from')->get();

        $clients = Client::orderBy('name')->get()->map(fn($client) => [
            'value' => $client->id,
            'label' => $client->company ? "{$client->name} ({$client->company})" : $client->name,
        ]);

        $paymentConditions = PickingPaymentCondition::where('is_active', true)
            ->orderBy('description')
            ->get();

        return Inertia::render('dashboard/picking/Edit', [
            'budget' => $pickingBudget,
            'boxes' => $boxes,
            'costScales' => $scales,
            'componentIncrements' => $increments,
            'clients' => $clients,
            'paymentConditions' => $paymentConditions,
        ]);
    }

    public function update(UpdatePickingBudgetRequest $request, PickingBudget $pickingBudget)
    {
        $user = Auth::user();

        if ($user->role->name !== 'admin' && $pickingBudget->vendor_id !== Auth::id()) {
            abort(403, 'No tienes permiso para actualizar este presupuesto.');
        }

        if (!$pickingBudget->isEditable()) {
            return back()->withErrors(['error' => 'Solo se pueden editar presupuestos sin enviar o en borrador.']);
        }

        $validated = $request->validated();

        DB::beginTransaction();

        try {
            $scale = PickingCostScale::findForQuantity($validated['total_kits']);
            $increment = PickingComponentIncrement::findForComponents($validated['total_components_per_kit']);

            $paymentConditionData = [
                'picking_payment_condition_id' => null,
                'payment_condition_description' => null,
                'payment_condition_percentage' => null,
            ];

            if (!empty($validated['picking_payment_condition_id'])) {
                $paymentCondition = PickingPaymentCondition::find($validated['picking_payment_condition_id']);
                if ($paymentCondition) {
                    $paymentConditionData = [
                        'picking_payment_condition_id' => $paymentCondition->id,
                        'payment_condition_description' => $paymentCondition->description,
                        'payment_condition_percentage' => $paymentCondition->percentage,
                    ];
                }
            }

            $pickingBudget->update(array_merge([
                'client_id' => $validated['client_id'],
                'total_kits' => $validated['total_kits'],
                'total_components_per_kit' => $validated['total_components_per_kit'],
                'scale_quantity_from' => $scale->quantity_from,
                'scale_quantity_to' => $scale->quantity_to,
                'production_time' => $scale->production_time,
                'component_increment_description' => $increment->description,
                'component_increment_percentage' => $increment->percentage,
                'valid_until' => $validated['valid_until'] ?? $pickingBudget->valid_until,
                'notes' => $validated['notes'] ?? null,
            ], $paymentConditionData));

            // Actualizar cajas
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

            // Actualizar servicios
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

            $pickingBudget->calculateTotals();
            $pickingBudget->save();

            DB::commit();

            return redirect()->route('dashboard.picking.budgets.show', $pickingBudget)
                ->with('success', 'Presupuesto actualizado correctamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al actualizar presupuesto de picking: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Error al actualizar: ' . $e->getMessage()]);
        }
    }

    public function destroy(PickingBudget $pickingBudget)
    {
        $user = Auth::user();

        if ($user->role->name !== 'admin' && $pickingBudget->vendor_id !== Auth::id()) {
            abort(403, 'No tienes permiso para eliminar este presupuesto.');
        }

        $pickingBudget->delete();

        return redirect()->route('dashboard.picking.budgets.index')
            ->with('success', 'Presupuesto eliminado correctamente.');
    }

    public function duplicate(PickingBudget $pickingBudget)
    {
        $user = Auth::user();

        if ($user->role->name !== 'admin' && $pickingBudget->vendor_id !== Auth::id()) {
            abort(403, 'No tienes permiso para duplicar este presupuesto.');
        }

        DB::beginTransaction();

        try {
            // Clonar con estado DRAFT (borrador)
            $newBudget = $pickingBudget->replicate(['token', 'email_sent', 'email_sent_at']);
            $newBudget->budget_number = PickingBudget::generateBudgetNumber();
            $newBudget->status = BudgetStatus::DRAFT;
            $newBudget->valid_until = now()->addDays(30);
            $newBudget->vendor_id = Auth::id();
            $newBudget->email_sent = false;
            $newBudget->email_sent_at = null;
            $newBudget->save();

            // Clonar servicios
            foreach ($pickingBudget->services as $service) {
                $newService = $service->replicate();
                $newService->picking_budget_id = $newBudget->id;
                $newService->save();
            }

            // Clonar cajas
            foreach ($pickingBudget->boxes as $box) {
                $newBox = $box->replicate();
                $newBox->picking_budget_id = $newBudget->id;
                $newBox->save();
            }

            $newBudget->calculateTotals();
            $newBudget->save();

            DB::commit();

            return redirect()->route('dashboard.picking.budgets.edit', $newBudget)
                ->with('success', 'Presupuesto duplicado. Puedes editarlo antes de enviarlo.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al duplicar presupuesto de picking: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Error al duplicar: ' . $e->getMessage()]);
        }
    }

    public function send(PickingBudget $pickingBudget)
    {
        $user = Auth::user();

        if ($user->role->name !== 'admin' && $pickingBudget->vendor_id !== Auth::id()) {
            abort(403, 'No tienes permiso para enviar este presupuesto.');
        }

        if (!$pickingBudget->canBeSent() && $pickingBudget->status !== BudgetStatus::SENT) {
            return back()->withErrors(['error' => 'Este presupuesto no puede ser enviado.']);
        }

        $pickingBudget->load('client');

        if (!$pickingBudget->client || !$pickingBudget->client->email) {
            return back()->withErrors(['error' => 'El cliente no tiene un email asociado.']);
        }

        try {
            $isResend = $pickingBudget->email_sent;

            $pdf = $this->generatePdf($pickingBudget);
            Mail::to($pickingBudget->client->email)
                ->send(new PickingBudgetSent($pickingBudget, $pdf));

            $pickingBudget->markAsSent();

            $message = $isResend ? 'Reenvío exitoso.' : 'Presupuesto enviado correctamente.';
            return back()->with('success', $message . ' a ' . $pickingBudget->client->email);
        } catch (\Exception $e) {
            Log::error('Error al enviar presupuesto de picking: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Error al enviar: ' . $e->getMessage()]);
        }
    }

    public function updateStatus(Request $request, PickingBudget $pickingBudget)
    {
        $request->validate([
            'status' => 'required|in:' . implode(',', array_column(BudgetStatus::cases(), 'value'))
        ]);

        try {
            $user = Auth::user();

            if ($user->role->name !== 'admin' && $pickingBudget->vendor_id !== Auth::id()) {
                abort(403, 'No tienes permiso para modificar este presupuesto.');
            }

            $newStatus = BudgetStatus::from($request->status);
            $pickingBudget->update(['status' => $newStatus]);

            if ($newStatus === BudgetStatus::SENT && !$pickingBudget->email_sent) {
                $pickingBudget->update(['email_sent' => true, 'email_sent_at' => now()]);
            }

            return back()->with('success', 'Estado actualizado a: ' . $newStatus->label());
        } catch (\Exception $e) {
            Log::error('Error al cambiar estado', ['budget_id' => $pickingBudget->id, 'error' => $e->getMessage()]);
            return back()->with('error', 'Error al actualizar el estado.');
        }
    }

    public function downloadPdf(PickingBudget $pickingBudget)
    {
        $user = Auth::user();

        if ($user->role->name !== 'admin' && $pickingBudget->vendor_id !== Auth::id()) {
            abort(403, 'No tienes permiso para descargar este presupuesto.');
        }

        $pickingBudget->load(['client', 'vendor', 'services', 'boxes']);
        $pdf = $this->generatePdf($pickingBudget);

        return $pdf->download("presupuesto-picking-{$pickingBudget->budget_number}.pdf");
    }

    private function generatePdf(PickingBudget $pickingBudget)
    {
        $pickingBudget->load(['client', 'vendor', 'services', 'boxes', 'paymentCondition']);

        $pdf = Pdf::loadView('pdf.picking-budget', [
            'budget' => $pickingBudget,
            'businessConfig' => [
                'iva_rate' => config('business.tax.iva_rate', 0.21),
                'apply_iva' => config('business.tax.apply_iva', true),
            ],
        ]);

        $pdf->setPaper('a4', 'portrait');

        return $pdf;
    }

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

        $servicesSubtotal = collect($validated['services'])->sum(function ($service) {
            return $service['unit_cost'] * $service['quantity'];
        });

        $increment = PickingComponentIncrement::findForComponents($validated['total_components_per_kit']);
        $incrementPercentage = $increment ? $increment->percentage : 0;
        $incrementAmount = $servicesSubtotal * $incrementPercentage;

        $subtotalWithIncrement = $servicesSubtotal + $incrementAmount;
        $total = $subtotalWithIncrement + $validated['box_cost'];

        return response()->json([
            'services_subtotal' => round($servicesSubtotal, 2),
            'increment_percentage' => $incrementPercentage,
            'increment_amount' => round($incrementAmount, 2),
            'subtotal_with_increment' => round($subtotalWithIncrement, 2),
            'box_cost' => round($validated['box_cost'], 2),
            'total' => round($total, 2),
            'unit_price_per_kit' => $validated['total_kits'] > 0
                ? round($total / $validated['total_kits'], 2)
                : 0,
        ]);
    }
}
