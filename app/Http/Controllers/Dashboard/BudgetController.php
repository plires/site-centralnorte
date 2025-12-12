<?php

namespace App\Http\Controllers\Dashboard;

use Inertia\Inertia;
use App\Models\Budget;
use App\Models\Client;
use App\Models\Product;
use App\Models\BudgetItem;
use App\Enums\BudgetStatus;
use Illuminate\Http\Request;
use App\Mail\BudgetCreatedMail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use App\Http\Requests\BudgetRequest;
use App\Models\PickingPaymentCondition;
use App\Models\User;

class BudgetController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        $query = Budget::with(['user:id,name', 'client:id,name,company'])
            ->select([
                'id',
                'title',
                'token',
                'user_id',
                'client_id',
                'issue_date',
                'expiry_date',
                'status',
                'email_sent',
                'email_sent_at',
                'subtotal',
                'total',
                'created_at'
            ]);

        // Filtro por vendedor
        if ($user->role->name !== 'admin') {
            $query->where('user_id', $user->id);
        } elseif ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filtro por estado
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filtro por rango de fechas
        if ($request->filled('from_date')) {
            $query->whereDate('issue_date', '>=', $request->from_date);
        }
        if ($request->filled('to_date')) {
            $query->whereDate('issue_date', '<=', $request->to_date);
        }

        // Búsqueda
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhereHas('client', function ($clientQuery) use ($search) {
                        $clientQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('company', 'like', "%{$search}%");
                    });
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

        return Inertia::render('dashboard/budgets/Index', [
            'budgets' => $budgets,
            'vendors' => $vendors,
            'filters' => $request->only(['search', 'status', 'user_id', 'from_date', 'to_date']),
            'statuses' => BudgetStatus::toSelectArray(),
        ]);
    }

    public function create()
    {
        $user = Auth::user();

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

        $products = Product::with(['categories', 'featuredImage', 'images', 'variants'])
            ->orderBy('name')
            ->get();

        // Cargar condiciones de pago activas
        $paymentConditions = PickingPaymentCondition::active()
            ->orderBy('description')
            ->get();

        return Inertia::render('dashboard/budgets/Create', [
            'clients' => $clients,
            'products' => $products,
            'paymentConditions' => $paymentConditions,
            'user' => $user,
            'businessConfig' => $this->getBusinessConfig(),
        ]);
    }

    public function store(BudgetRequest $request)
    {

        try {
            DB::beginTransaction();

            $user = Auth::user();

            // Obtener snapshot de la condición de pago si fue seleccionada
            $paymentConditionData = [];
            if ($request->picking_payment_condition_id) {
                $paymentCondition = PickingPaymentCondition::find($request->picking_payment_condition_id);
                if ($paymentCondition) {
                    $paymentConditionData = [
                        'picking_payment_condition_id' => $paymentCondition->id,
                        'payment_condition_description' => $paymentCondition->description,
                        'payment_condition_percentage' => $paymentCondition->percentage,
                    ];
                }
            }

            $initialStatus = $request->boolean('send_email_to_client')
                ? BudgetStatus::SENT
                : BudgetStatus::UNSENT;

            // Crear el presupuesto usando los datos validados
            $budget = Budget::create(array_merge([
                'title' => $request->title,
                'user_id' => $user->id,
                'client_id' => $request->client_id,
                'issue_date' => $request->issue_date,
                'expiry_date' => $request->expiry_date,
                'status' => $initialStatus,
                'send_email_to_client' => $request->boolean('send_email_to_client'),
                'footer_comments' => $request->footer_comments,
            ], $paymentConditionData));

            // Procesar items del presupuesto
            $this->processBudgetItems($budget, $request->items);

            // Calcular totales (ahora incluye el ajuste de condición de pago)
            $budget->calculateTotals();

            // Enviar email si está configurado
            if ($request->boolean('send_email_to_client')) {
                $this->sendBudgetEmail($budget, false, false);
            }

            DB::commit();

            return redirect()->route('dashboard.budgets.show', $budget)
                ->with('success', 'Presupuesto creado exitosamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al crear presupuesto: ' . $e->getMessage());
            return redirect()->back()->withInput()
                ->with('error', 'Ocurrió un error al crear el presupuesto.');
        }
    }

    public function show(Budget $budget)
    {
        $user = Auth::user();

        if ($user->role->name === 'vendedor' && $budget->user_id !== $user->id) {
            abort(403, 'No tienes permisos para ver este presupuesto.');
        }

        // Cargar relaciones necesarias
        $budget->load([
            'client',
            'user',
            'items.product.featuredImage',
            'items.product.variants',
            'items.productVariant',
            'paymentCondition',
        ]);

        // Agrupar items
        $regularItems = [];
        $variantGroups = [];

        foreach ($budget->items as $item) {
            if ($item->variant_group) {
                if (!isset($variantGroups[$item->variant_group])) {
                    $variantGroups[$item->variant_group] = [];
                }
                $variantGroups[$item->variant_group][] = $item;
            } else {
                $regularItems[] = $item;
            }
        }

        $hasVariants = count($variantGroups) > 0;
        $statusData = $budget->getStatusData();
        $budgetFinal = array_merge($budget->toArray(), $statusData);


        return Inertia::render('dashboard/budgets/Show', [
            'budget' => $budgetFinal,
            'regularItems' => $regularItems,
            'variantGroups' => $variantGroups,
            'hasVariants' => $hasVariants,
            'businessConfig' => $this->getBusinessConfig(),
            'statuses' => BudgetStatus::toSelectArray(),
        ]);
    }

    public function edit(Budget $budget)
    {
        $user = Auth::user();

        if ($user->role->name === 'vendedor' && $budget->user_id !== $user->id) {
            abort(403, 'No tienes permisos para editar este presupuesto.');
        }

        $budget->load([
            'client',
            'user',
            'items.product.featuredImage',
            'items.product.variants',
            'items.productVariant',
            'paymentCondition',
        ]);

        $regularItems = [];
        $variantGroups = [];

        foreach ($budget->items as $item) {
            if ($item->variant_group) {
                $variantGroups[$item->variant_group][] = $item;
            } else {
                $regularItems[] = $item;
            }
        }

        $clients = Client::orderBy('name')->get()->map(fn($client) => [
            'value' => $client->id,
            'label' => $client->company ? "{$client->name} ({$client->company})" : $client->name,
        ]);

        $paymentConditions = PickingPaymentCondition::where('is_active', true)
            ->orderBy('description')
            ->get();

        return Inertia::render('dashboard/budgets/Edit', [
            'budget' => $budget,
            'regularItems' => $regularItems,
            'variantGroups' => $variantGroups,
            'clients' => $clients,
            'paymentConditions' => $paymentConditions,
            'businessConfig' => $this->getBusinessConfig(),
        ]);
    }

    public function update(BudgetRequest $request, Budget $budget)
    {
        try {
            DB::beginTransaction();

            $user = Auth::user();

            if ($user->role->name === 'vendedor' && $budget->user_id !== $user->id) {
                abort(403, 'No tienes permisos para actualizar este presupuesto.');
            }

            $paymentConditionData = [
                'picking_payment_condition_id' => null,
                'payment_condition_description' => null,
                'payment_condition_percentage' => null,
            ];

            if ($request->picking_payment_condition_id) {
                $paymentCondition = PickingPaymentCondition::find($request->picking_payment_condition_id);
                if ($paymentCondition) {
                    $paymentConditionData = [
                        'picking_payment_condition_id' => $paymentCondition->id,
                        'payment_condition_description' => $paymentCondition->description,
                        'payment_condition_percentage' => $paymentCondition->percentage,
                    ];
                }
            }

            $budget->update(array_merge([
                'title' => $request->title,
                'user_id' => $request->user_id,
                'client_id' => $request->client_id,
                'issue_date' => $request->issue_date,
                'expiry_date' => $request->expiry_date,
                'footer_comments' => $request->footer_comments,
            ], $paymentConditionData));

            $budget->items()->delete();
            $this->processBudgetItems($budget, $request->items);
            $budget->calculateTotals();

            DB::commit();

            return redirect()->route('dashboard.budgets.show', $budget)
                ->with('success', 'Presupuesto actualizado exitosamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al actualizar presupuesto: ' . $e->getMessage());
            return redirect()->back()->withInput()
                ->with('error', 'Ocurrió un error al actualizar el presupuesto.');
        }
    }

    public function destroy(Budget $budget)
    {
        try {
            DB::beginTransaction();

            $user = Auth::user();

            if ($user->role->name === 'vendedor' && $budget->user_id !== $user->id) {
                abort(403, 'No tienes permisos para eliminar este presupuesto.');
            }

            $budget->items()->delete();
            $budget->delete();

            DB::commit();

            return redirect()->route('dashboard.budgets.index')
                ->with('success', 'Presupuesto eliminado exitosamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al eliminar presupuesto: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Ocurrió un error al eliminar el presupuesto.');
        }
    }

    public function duplicate(Budget $budget)
    {
        try {
            DB::beginTransaction();

            $user = Auth::user();

            if ($user->role->name === 'vendedor' && $budget->user_id !== $user->id) {
                abort(403, 'No tienes permisos para duplicar este presupuesto.');
            }

            $budget->load('items');

            $newBudget = $budget->replicate(['token', 'email_sent', 'email_sent_at']);
            $newBudget->title = $budget->title . ' (copia)';
            $newBudget->status = BudgetStatus::DRAFT;
            $newBudget->issue_date = now();
            $newBudget->expiry_date = now()->addDays(config('business.budget.default_validity_days', 15));
            $newBudget->email_sent = false;
            $newBudget->email_sent_at = null;
            $newBudget->save();

            foreach ($budget->items as $item) {
                $newItem = $item->replicate();
                $newItem->budget_id = $newBudget->id;
                $newItem->save();
            }

            $newBudget->calculateTotals();

            DB::commit();

            return redirect()->route('dashboard.budgets.edit', $newBudget)
                ->with('success', 'Presupuesto duplicado. Puedes editarlo antes de enviarlo.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al duplicar presupuesto: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Ocurrió un error al duplicar el presupuesto.');
        }
    }

    public function sendEmail(Budget $budget)
    {
        try {
            $user = Auth::user();

            if ($user->role->name === 'vendedor' && $budget->user_id !== $user->id) {
                abort(403, 'No tienes permisos para enviar este presupuesto.');
            }

            if (!$budget->canBeSent() && $budget->status !== BudgetStatus::SENT) {
                return redirect()->back()->with('error', 'Este presupuesto no puede ser enviado.');
            }

            $isResend = $budget->email_sent;
            $this->sendBudgetEmail($budget, $isResend, true);

            if ($budget->status !== BudgetStatus::SENT) {
                $budget->markAsSent();
            }

            $message = $isResend ? 'Reenvío exitoso.' : 'Email enviado exitosamente.';
            return redirect()->back()->with('success', $message);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al enviar: ' . $e->getMessage());
        }
    }

    public function updateStatus(Request $request, Budget $budget)
    {
        $request->validate([
            'status' => 'required|in:' . implode(',', array_column(BudgetStatus::cases(), 'value'))
        ]);

        try {
            $user = Auth::user();

            if ($user->role->name === 'vendedor' && $budget->user_id !== $user->id) {
                abort(403, 'No tienes permisos para modificar este presupuesto.');
            }

            $newStatus = BudgetStatus::from($request->status);
            $budget->update(['status' => $newStatus]);

            if ($newStatus === BudgetStatus::SENT && !$budget->email_sent) {
                $budget->update(['email_sent' => true, 'email_sent_at' => now()]);
            }

            return back()->with('success', 'Estado actualizado a: ' . $newStatus->label());
        } catch (\Exception $e) {
            Log::error('Error al cambiar estado', ['budget_id' => $budget->id, 'error' => $e->getMessage()]);
            return back()->with('error', 'Error al actualizar el estado.');
        }
    }

    private function processBudgetItems(Budget $budget, array $items)
    {
        $sortOrder = 0;

        foreach ($items as $index => $itemData) {
            if (!isset($itemData['product_id'], $itemData['quantity'], $itemData['unit_price'])) {
                throw new \Exception("Datos incompletos en el item {$index}");
            }

            $budget->items()->create([
                'product_id' => $itemData['product_id'],
                'product_variant_id' => $itemData['product_variant_id'] ?? null,
                'quantity' => (int) $itemData['quantity'],
                'unit_price' => (float) $itemData['unit_price'],
                'production_time_days' => !empty($itemData['production_time_days'])
                    ? (int) $itemData['production_time_days'] : null,
                'logo_printing' => $itemData['logo_printing'] ?? null,
                'line_total' => (int) $itemData['quantity'] * (float) $itemData['unit_price'],
                'sort_order' => $sortOrder++,
                'variant_group' => $itemData['variant_group'] ?? null,
                'is_variant' => (bool) ($itemData['is_variant'] ?? false),
                'is_selected' => isset($itemData['is_selected']) ? (bool) $itemData['is_selected'] : true,
            ]);

            // Actualizar last_price del producto
            $product = Product::find($itemData['product_id']);
            if ($product && $product->last_price != $itemData['unit_price']) {
                $product->update(['last_price' => $itemData['unit_price']]);
            }
        }
    }

    private function sendBudgetEmail(Budget $budget, bool $isResend = false, bool $throwOnError = true): bool
    {
        try {
            if (!$budget->client->email) {
                $message = 'El cliente no tiene email configurado.';
                if ($throwOnError) throw new \Exception($message);
                Log::warning($message, ['budget_id' => $budget->id]);
                return false;
            }

            $publicUrl = route('public.budget.show', $budget->token);
            Mail::to($budget->client->email)->send(
                new BudgetCreatedMail($budget, Auth::user(), $publicUrl, $isResend)
            );

            $budget->update(['email_sent' => true, 'email_sent_at' => now()]);

            return true;
        } catch (\Exception $e) {
            $action = $isResend ? 'reenviar' : 'enviar';
            Log::error("Error al {$action} email: " . $e->getMessage(), ['budget_id' => $budget->id]);
            if ($throwOnError) throw $e;
            return false;
        }
    }

    private function getBusinessConfig(): array
    {
        return [
            'iva_rate' => config('business.tax.iva_rate'),
            'apply_iva' => config('business.tax.apply_iva'),
            'default_validity_days' => config('business.budget.default_validity_days'),
            'warning_days_before_expiry' => config('business.budget.warning_days_before_expiry'),
        ];
    }
}
