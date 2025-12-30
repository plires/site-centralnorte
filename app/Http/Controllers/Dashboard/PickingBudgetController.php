<?php

namespace App\Http\Controllers\Dashboard;

use App\Models\User;
use Inertia\Inertia;
use App\Models\Client;
use App\Models\PickingBox;
use Illuminate\Http\Request;
use App\Traits\ExportsToExcel;
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

    use ExportsToExcel;

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

        $budgets = $query->orderBy('id', 'desc')
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
                'title' => $validated['title'],
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

            // Crear/Actualizar cajas
            if (!empty($validated['boxes'])) {
                foreach ($validated['boxes'] as $boxData) {
                    PickingBudgetBox::create([
                        'picking_budget_id' => $budget->id, // 
                        'picking_box_id' => $boxData['box_id'] ?? null,
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

        // 1. Cargar relaciones INCLUYENDO las borradas
        $pickingBudget->load([
            'vendor' => fn($q) => $q->withTrashed(),
            'client' => fn($q) => $q->withTrashed(),
            'services',
            'boxes',
            'paymentCondition' => fn($q) => $q->withTrashed()
        ]);

        // 2. Generar Array de Advertencias Globales
        $warnings = [];

        // Verificamos Cliente
        if ($pickingBudget->client && $pickingBudget->client->trashed()) {
            $warnings[] = [
                'type' => 'client',
                'message' => "El cliente '{$pickingBudget->client->name}' ha sido eliminado del sistema."
            ];
        }

        // Verificamos Vendedor (User)
        if ($pickingBudget->vendor && $pickingBudget->vendor->trashed()) {
            $warnings[] = [
                'type' => 'user',
                'message' => "El vendedor '{$pickingBudget->vendor->name}' ya no es un usuario activo."
            ];
        }

        // Verificamos Condición de Pago
        if ($pickingBudget->paymentCondition && $pickingBudget->paymentCondition->trashed()) {
            $warnings[] = [
                'type' => 'condition',
                'message' => "La condición de pago original ya no está disponible en la configuración."
            ];
        }

        // Verificar si las boxes, scales o increments usados fueron eliminados
        // Nota: boxes, scales e increments están guardados como datos en el presupuesto,
        // no como relaciones directas, por lo que no podemos verificar si fueron eliminados
        // a menos que establezcas relaciones directas

        $statusData = $pickingBudget->getStatusData();

        return Inertia::render('dashboard/picking/Show', [
            'budget' => array_merge($pickingBudget->toArray(), $statusData),
            'warnings' => $warnings,
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
            return redirect()->route('dashboard.picking.budgets.show', $pickingBudget)
                ->with('error', 'Solo se pueden editar presupuestos sin enviar o en borrador. Cambie el estado a borrador y luego edite.');
        }

        // 1. Cargar relaciones INCLUYENDO las borradas
        $pickingBudget->load([
            'services',
            'boxes',
            'client' => fn($q) => $q->withTrashed(),
            'vendor' => fn($q) => $q->withTrashed(),
            'paymentCondition' => fn($q) => $q->withTrashed()
        ]);

        // 2. Cargar BOXES (activas + la usada en el presupuesto si fue borrada)
        $boxes = PickingBox::active()->orderBy('cost')->get();

        // 3. Cargar SCALES (activas)
        $scales = PickingCostScale::active()->orderBy('quantity_from')->get();

        // 4. Cargar INCREMENTS (activos)
        $increments = PickingComponentIncrement::active()->orderBy('components_from')->get();

        // 5. Cargar CLIENTES (activos + el cliente actual si fue borrado)
        $clients = Client::query()
            ->withTrashed()
            ->where(function ($query) use ($pickingBudget) {
                $query->whereNull('deleted_at')
                    ->orWhere('id', $pickingBudget->client_id);
            })
            ->orderBy('name')
            ->get()
            ->map(function ($client) {
                return [
                    'value' => $client->id,
                    'label' => $client->company
                        ? "{$client->name} ({$client->company})" . ($client->trashed() ? ' - ELIMINADO' : '')
                        : $client->name . ($client->trashed() ? ' - ELIMINADO' : ''),
                    'is_deleted' => $client->trashed()
                ];
            });

        // 6. Cargar CONDICIONES DE PAGO (activas + la usada si fue borrada)
        $paymentConditions = PickingPaymentCondition::query()
            ->withTrashed()
            ->where(function ($q) use ($pickingBudget) {
                $q->where('is_active', true)
                    ->orWhere('id', $pickingBudget->picking_payment_condition_id);
            })
            ->orderBy('description')
            ->get()
            ->map(function ($condition) {
                $condition->condition_deleted = $condition->trashed();
                if ($condition->trashed()) {
                    $condition->description .= ' (NO DISPONIBLE)';
                }
                return $condition;
            });

        // 7. Generar Array de Advertencias Globales
        $warnings = [];

        // Verificamos Cliente
        if ($pickingBudget->client && $pickingBudget->client->trashed()) {
            $warnings[] = [
                'type' => 'client',
                'message' => "El cliente '{$pickingBudget->client->name}' ha sido eliminado del sistema."
            ];
        }

        // Verificamos Vendedor
        if ($pickingBudget->vendor && $pickingBudget->vendor->trashed()) {
            $warnings[] = [
                'type' => 'user',
                'message' => "El vendedor '{$pickingBudget->vendor->name}' ya no es un usuario activo."
            ];
        }

        // Verificamos Condición de Pago
        if ($pickingBudget->paymentCondition && $pickingBudget->paymentCondition->trashed()) {
            $warnings[] = [
                'type' => 'condition',
                'message' => "La condición de pago original ya no está disponible en la configuración."
            ];
        }

        return Inertia::render('dashboard/picking/Edit', [
            'budget' => $pickingBudget,
            'boxes' => $boxes,
            'costScales' => $scales,
            'componentIncrements' => $increments,
            'clients' => $clients,
            'paymentConditions' => $paymentConditions,
            'warnings' => $warnings,
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
                'title' => $validated['title'],
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
            // Crear/Actualizar cajas
            if (!empty($validated['boxes'])) {
                foreach ($validated['boxes'] as $boxData) {
                    PickingBudgetBox::create([
                        'picking_budget_id' => $pickingBudget->id,
                        'picking_box_id' => $boxData['box_id'] ?? null,
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
            $newBudget->title = $pickingBudget->title . ' (copia)';
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

            if ($user->role->name === 'vendedor' && $pickingBudget->user_id !== $user->id) {
                abort(403, 'No tienes permisos para modificar este presupuesto.');
            }
            $oldStatus = $pickingBudget->status;
            $newStatus = BudgetStatus::from($request->status);

            // Datos a actualizar
            $updateData = ['status' => $newStatus];

            // Si un presupuesto esta vencido y se quiere cambiar el estado
            if ($pickingBudget->isExpiredByDate()) {
                return back()->with(
                    'error',
                    'No podés cambiar el estado de un presupuesto vencido. Podés duplicar el presupuesto y volver a enviar.'
                );
            }

            // Si cambia de REJECTED a otro estado, limpiar rejection_comments
            if ($oldStatus === BudgetStatus::REJECTED && $newStatus !== BudgetStatus::REJECTED) {
                $updateData['rejection_comments'] = null;
            }

            // Si cambia a SENT y no se había enviado antes, marcar como enviado
            if ($newStatus === BudgetStatus::SENT && !$pickingBudget->email_sent) {
                $updateData['email_sent'] = true;
                $updateData['email_sent_at'] = now();
            }

            // Si cambia de SENT a UNSENT o DRAFT, resetear flags de envío
            if (
                in_array($oldStatus, [BudgetStatus::SENT, BudgetStatus::APPROVED, BudgetStatus::REJECTED, BudgetStatus::EXPIRED])
                && in_array($newStatus, [BudgetStatus::UNSENT, BudgetStatus::DRAFT])
            ) {
                $updateData['email_sent'] = false;
                $updateData['email_sent_at'] = null;
            }

            $pickingBudget->update($updateData);

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

    /**
     * Exportar listado de presupuestos picking a Excel
     * Solo accesible para usuarios con role 'admin'
     */
    public function export(Request $request)
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

            $budgets = PickingBudget::all();

            // Verificar si hay datos para exportar
            if ($budgets->isEmpty()) {
                if ($request->wantsJson() || $request->ajax()) {
                    return response()->json([
                        'message' => 'No hay presupuestos de picking para exportar.'
                    ], 404);
                }

                return redirect()->back()->with('error', 'No hay presupuestos de picking para exportar.');
            }

            // Definir encabezados y sus keys correspondientes
            $headers = [
                'id' => 'ID',
                'budget_number' => 'Numero de Presupuesto',
                'title' => 'Título',
                'vendor_id' => 'Vendedor',
                'client_id' => 'Cliente',
                'payment_condition_description' => 'Forma de Pago',
                'total_kits' => 'Kits Totales',
                'total_components_per_kit' => 'Componentes por Kit',
                'total' => 'Total',
                'status' => 'Estado',
                'valid_until' => 'Vencimiento',
                'created_at' => 'Fecha de Creación',
                'updated_at' => 'Última Actualización',
                'deleted_at' => 'Fecha de Eliminación',
            ];

            // Preparar datos para exportación
            $data = $budgets->map(function ($budget) {
                return [
                    'id' => $budget->id,
                    'budget_number' => $budget->budget_number,
                    'title' => $budget->title,
                    'vendor_id' => $budget->vendor->name,
                    'client_id' => $budget->client->name,
                    'payment_condition_description' => $budget->payment_condition_description,
                    'total_kits' => $budget->total_kits,
                    'total_components_per_kit' => $budget->total_components_per_kit,
                    'total' => $budget->total,
                    'status' => $budget->status->label(),
                    'valid_until' => $budget->valid_until ? $budget->valid_until->format('d/m/Y H:i') : '',
                    'created_at' => $budget->created_at ? $budget->created_at->format('d/m/Y H:i') : '',
                    'updated_at' => $budget->updated_at ? $budget->updated_at->format('d/m/Y H:i') : '',
                    'deleted_at' => $budget->deleted_at ? $budget->deleted_at->format('d/m/Y H:i') : '',
                ];
            })->toArray();

            // Log de exportación exitosa
            Log::info('Categorias exportados', [
                'user_id' => $user->id,
                'user_name' => $user->name,
                'count' => count($data),
            ]);

            // Exportar usando el trait
            return $this->exportToExcel(
                data: $data,
                headers: $headers,
                filename: 'categorias',
                sheetTitle: 'Lista de Categorias'
            );
        } catch (\Exception $e) {
            // Log del error
            Log::error('Error al exportar clientes', [
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
}
