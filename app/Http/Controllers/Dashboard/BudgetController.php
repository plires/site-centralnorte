<?php

namespace App\Http\Controllers\Dashboard;

use Inertia\Inertia;
use App\Models\Budget;
use App\Models\Client;
use App\Models\Product;
use App\Traits\ExportsToExcel;
use Barryvdh\DomPDF\Facade\Pdf;
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
    use ExportsToExcel;

    public function index(Request $request)
    {
        $user = Auth::user();

        $query = Budget::with(['user:id,name', 'client:id,name,company'])
            ->select([
                'id',
                'budget_merch_number',
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

        // Cargar condiciones de pago activas
        $paymentConditions = PickingPaymentCondition::active()
            ->orderBy('description')
            ->get();



        $vendors = [];
        if ($user->role->name === 'admin') {
            $vendors = User::whereHas('role', function ($q) {
                $q->whereIn('name', ['vendedor', 'admin']);
            })
                ->orderBy('name')
                ->get()
                ->map(function ($vendor) {
                    return [
                        'value' => $vendor->id,
                        'label' => $vendor->name,
                    ];
                });
        }

        return Inertia::render('dashboard/budgets/Create', [
            'clients' => $clients,
            'paymentConditions' => $paymentConditions,
            'vendors' => $vendors,
            'user' => $user,
            'businessConfig' => $this->getBusinessConfig(),
        ]);
    }

    public function store(BudgetRequest $request)
    {
        try {
            DB::beginTransaction();

            $user = Auth::user();

            if ($user->role->name !== 'admin') {
                $budgetOwner = $user->id;
            } else {
                $budgetOwner = $request->user_id;
            }

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
                'budget_merch_number' => Budget::generateBudgetMerchNumber(),
                'title' => $request->title,
                'user_id' => $budgetOwner,
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

        // 1. Cargar relaciones INCLUYENDO las borradas
        $budget->load([
            'client' => fn($q) => $q->withTrashed(),
            'user' => fn($q) => $q->withTrashed(),
            'paymentCondition' => fn($q) => $q->withTrashed(),
            'items.product' => fn($q) => $q->withTrashed()->with(['featuredImage', 'variants']),
            'items.productVariant' => fn($q) => $q->withTrashed(),
        ]);

        // 2. Generar Array de Advertencias Globales
        $warnings = [];

        // Verificamos Cliente
        if ($budget->client && $budget->client->trashed()) {
            $warnings[] = [
                'type' => 'client',
                'message' => "El cliente '{$budget->client->name}' ha sido eliminado del sistema."
            ];
        }

        // Verificamos Vendedor (User)
        if ($budget->user && $budget->user->trashed()) {
            $warnings[] = [
                'type' => 'user',
                'message' => "El vendedor '{$budget->user->name}' ya no es un usuario activo."
            ];
        }

        // Verificamos Condición de Pago
        if ($budget->paymentCondition && $budget->paymentCondition->trashed()) {
            $warnings[] = [
                'type' => 'condition',
                'message' => "La condición de pago original ya no está disponible en la configuración."
            ];
        }

        // 3. Procesamiento de Items (Detectar productos borrados)
        $regularItems = [];
        $variantGroups = [];
        $deletedProductsCount = 0;

        foreach ($budget->items as $item) {
            // Inyectamos una propiedad "virtual" al item para facilitar el trabajo en React
            // Esto nos evita tener que revisar 'item.product.deleted_at' profundamente en el JSX
            $item->is_product_deleted = $item->product && $item->product->trashed();

            if ($item->is_product_deleted) {
                $deletedProductsCount++;
            }

            // ... Tu lógica de agrupación original ...
            if ($item->variant_group) {
                if (!isset($variantGroups[$item->variant_group])) {
                    $variantGroups[$item->variant_group] = [];
                }
                $variantGroups[$item->variant_group][] = $item;
            } else {
                $regularItems[] = $item;
            }
        }

        if ($deletedProductsCount > 0) {
            $warnings[] = [
                'type' => 'product',
                'message' => "Este presupuesto contiene producto/s que han sido eliminado/s del catálogo."
            ];
        }

        $hasVariants = count($variantGroups) > 0;
        $statusData = $budget->getStatusData();
        $budgetFinal = array_merge($budget->toArray(), $statusData);

        return Inertia::render('dashboard/budgets/Show', [
            'budget' => $budgetFinal,
            'warnings' => $warnings,
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

        // Solo se puede editar si es editable
        if (!$budget->isEditable()) {
            return redirect()->route('dashboard.budgets.show', $budget)
                ->with('error', 'Solo se pueden editar presupuestos sin enviar o en borrador. Cambie el estado a borrador y luego edite.');
        }

        // 1. Cargar relaciones (INCLUYENDO BORRADOS)
        $budget->load([
            'client' => fn($q) => $q->withTrashed(),
            'user' => fn($q) => $q->withTrashed(),
            'items.product' => fn($q) => $q->withTrashed()->with(['featuredImage', 'variants']),
            'items.productVariant' => fn($q) => $q->withTrashed(),
            'paymentCondition' => fn($q) => $q->withTrashed(),
        ]);

        // 2. Procesar Items y detectar productos borrados
        $regularItems = [];
        $variantGroups = [];
        $currentProductIds = $budget->items->pluck('product_id')->unique()->toArray();

        // --- CORRECCIÓN: Inicializamos contador ---
        $deletedProductsCount = 0;

        foreach ($budget->items as $item) {
            $item->is_product_deleted = $item->product && $item->product->trashed();

            // --- CORRECCIÓN: Sumamos si está borrado ---
            if ($item->is_product_deleted) {
                $deletedProductsCount++;
            }

            if ($item->variant_group) {
                $variantGroups[$item->variant_group][] = $item;
            } else {
                $regularItems[] = $item;
            }
        }

        // 3. Cargar lista de CLIENTES (Activos + Actual)
        $clients = Client::query()
            ->withTrashed()
            ->where(function ($q) use ($budget) {
                $q->whereNull('deleted_at')->orWhere('id', $budget->client_id);
            })
            ->orderBy('name')
            ->get()
            ->map(function ($client) {
                $label = $client->company ? "{$client->name} ({$client->company})" : $client->name;
                if ($client->trashed()) {
                    $label .= " (ELIMINADO)";
                }
                return [
                    'value' => $client->id,
                    'label' => $label,
                    'is_deleted' => $client->trashed()
                ];
            });

        // 4. Cargar solo los PRODUCTOS actualmente en uso en este presupuesto
        // (el combobox async del frontend se encarga de buscar nuevos productos)
        $currentProducts = empty($currentProductIds) ? collect() : Product::with(['categories', 'featuredImage', 'variants'])
            ->withTrashed()
            ->whereIn('id', $currentProductIds)
            ->get()
            ->map(function ($product) {
                $categoryNames = $product->categories->pluck('name')->toArray();
                $product->is_deleted = $product->trashed();
                if ($product->trashed()) {
                    $product->name .= " (NO DISPONIBLE)";
                }
                $product->featured_image = $product->featuredImage ? $product->featuredImage->full_url : null;
                return $product;
            });

        // 5. Cargar CONDICIONES DE PAGO
        $paymentConditions = PickingPaymentCondition::query()
            ->withTrashed()
            ->where(function ($q) use ($budget) {
                $q->where('is_active', true)
                    ->orWhere('id', $budget->payment_condition_id);
            })
            ->orderBy('description')
            ->get()
            ->map(function ($condition) {
                // Agregamos la propiedad dinámica
                $condition->condition_deleted = $condition->trashed();

                // Opcional: Si quieres que el front vea visualmente que está borrada en el Select
                if ($condition->trashed()) {
                    $condition->description .= ' (NO DISPONIBLE)';
                }

                return $condition;
            });

        // 6. Cargar VENDEDORES
        $vendors = [];
        if (Auth::user()->role->name === 'admin') {
            $vendors = User::withTrashed()
                ->where(function ($query) use ($budget) {
                    $query->whereHas('role', function ($q) {
                        $q->whereIn('name', ['vendedor', 'admin']);
                    });
                    $query->where(function ($q) use ($budget) {
                        $q->whereNull('deleted_at')->orWhere('id', $budget->user_id);
                    });
                })
                ->orderBy('name')
                ->get()
                ->map(function ($vendor) {
                    return [
                        'value' => $vendor->id,
                        'label' => $vendor->trashed() ? "{$vendor->name} (INACTIVO)" : $vendor->name,
                        'vendor_deletd' => $vendor->trashed() ? true : false,
                    ];
                });
        }

        // --- Generación completa de Warnings ---
        $warnings = [];

        // Verificamos Cliente
        if ($budget->client && $budget->client->trashed()) {
            $warnings[] = [
                'type' => 'client',
                'message' => "El cliente '{$budget->client->name}' ha sido eliminado del sistema."
            ];
        }

        // Verificamos Vendedor (User)
        if ($budget->user && $budget->user->trashed()) {
            $warnings[] = [
                'type' => 'user',
                'message' => "El vendedor '{$budget->user->name}' ya no es un usuario activo."
            ];
        }

        // Verificamos Condición de Pago
        if ($budget->paymentCondition && $budget->paymentCondition->trashed()) {
            $warnings[] = [
                'type' => 'condition',
                'message' => "La condición de pago original ya no está disponible en la configuración."
            ];
        }

        if ($deletedProductsCount > 0) {
            $warnings[] = [
                'type' => 'product',
                'message' => "Este presupuesto contiene producto/s que han sido eliminado/s del catálogo."
            ];
        }

        return Inertia::render('dashboard/budgets/Edit', [
            'budget' => $budget,
            'regularItems' => $regularItems,
            'variantGroups' => $variantGroups,
            'clients' => $clients,
            'currentProducts' => $currentProducts,
            'paymentConditions' => $paymentConditions,
            'user' => $user,
            'vendors' => $vendors,
            'businessConfig' => $this->getBusinessConfig(),
            'warnings' => $warnings,
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

            if ($user->role->name !== 'admin') {
                $budgetOwner = $user->id;
            } else {
                $budgetOwner = $request->user_id;
            }

            // Solo se puede editar si es editable
            if (!$budget->isEditable()) {
                return redirect()->route('dashboard.budgets.show', $budget)
                    ->with('error', 'Solo se pueden editar presupuestos sin enviar o en borrador. Cambie el estado a borrador y luego edite.');
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
                'user_id' => $budgetOwner,
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
            $newBudget->budget_merch_number = Budget::generateBudgetMerchNumber();
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
            $oldStatus = $budget->status;
            $newStatus = BudgetStatus::from($request->status);

            // Datos a actualizar
            $updateData = ['status' => $newStatus];

            // Si un presupuesto esta vencido y se quiere cambiar el estado
            if ($budget->isExpiredByDate()) {
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
            if ($newStatus === BudgetStatus::SENT && !$budget->email_sent) {
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

            $budget->update($updateData);

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

            // Generar PDF
            $pdf = $this->generatePdf($budget);

            $publicUrl = route('public.budget.show', $budget->token);
            Mail::to($budget->client->email)->send(
                new BudgetCreatedMail($budget, Auth::user(), $publicUrl, $isResend, $pdf)
            );

            $budget->update(['email_sent' => true, 'email_sent_at' => now()]);

            return true;
        } catch (\Exception $e) {
            $action = $isResend ? 'reenviar' : 'enviar';
            Log::error("Error al {$action} email: " . $e->getMessage());

            if ($throwOnError) throw $e;
            return false;
        }
    }

    /**
     * Descargar PDF del presupuesto desde el dashboard
     */
    public function downloadPdf(Budget $budget)
    {
        $pdf = $this->generatePdf($budget);

        $safeTitle = \Illuminate\Support\Str::slug($budget->title, '-');
        $filename = "presupuesto-{$safeTitle}-{$budget->id}.pdf";

        return $pdf->download($filename);
    }

    /**
     * Generar PDF del presupuesto
     */
    private function generatePdf(Budget $budget)
    {
        // Cargar relaciones necesarias
        $budget->load([
            'client',
            'user',
            'items.product.featuredImage',
            'items.product.categories',
            'items.product.variants',
            'items.productVariant',
            'paymentCondition'
        ]);

        // Procesar items con el mismo formato que PublicBudgetController
        $groupedItems = $this->processItemsForPdf($budget->items);

        $businessConfig = [
            'iva_rate' => config('business.tax.iva_rate', 0.21),
            'apply_iva' => config('business.tax.apply_iva', true),
        ];

        $statusData = $budget->getStatusData();

        // Preparar datos del presupuesto con la estructura correcta
        $budgetData = array_merge([
            'id' => $budget->id,
            'title' => $budget->title,
            'token' => $budget->token,
            'status' => $budget->status?->value,
            'status_label' => $budget->status_label,
            'status_color' => $budget->status_color,
            'status_text' => $budget->status_label,
            'picking_payment_condition_id' => $budget->picking_payment_condition_id,
            'payment_condition_amount' => $budget->payment_condition_amount,
            'payment_condition_percentage' => $budget->payment_condition_percentage,
            'payment_condition_description' => $budget->payment_condition_description,
            'issue_date_formatted' => $budget->issue_date_formatted,
            'expiry_date_formatted' => $budget->expiry_date_formatted,
            'issue_date_short' => $budget->issue_date_short,
            'expiry_date_short' => $budget->expiry_date_short,
            'footer_comments' => $budget->footer_comments,
            'subtotal' => $budget->subtotal,
            'total' => $budget->total,
            'payment_condition' => $budget->paymentCondition ? [
                'description' => $budget->payment_condition_description,
                'percentage' => $budget->payment_condition_percentage,
            ] : null,
            'client' => [
                'name' => $budget->client->name,
                'company' => $budget->client->company,
            ],
            'user' => [
                'name' => $budget->user?->name ?? 'Central Norte',
                'email' => $budget->user?->email ?? null,
            ],
            'grouped_items' => $groupedItems,
        ], $statusData);

        $pdf = Pdf::loadView('pdf.budget', [
            'budget' => $budgetData,
            'businessConfig' => $businessConfig,
        ]);

        $pdf->setPaper('a4', 'portrait');

        return $pdf;
    }

    /**
     * Procesar items para el PDF con imágenes y categorías
     * Solo incluye variantes seleccionadas (is_selected = true)
     */
    private function processItemsForPdf($items)
    {
        $grouped = [
            'regular' => [],
            'variants' => []
        ];

        foreach ($items as $item) {
            // Si es una variante, solo incluir si está seleccionada
            if ($item->variant_group && !$item->is_selected) {
                continue; // ← ESTA ES LA LÍNEA CLAVE: Saltar variantes no seleccionadas
            }

            // Procesar imagen destacada
            $featuredImage = null;
            if ($item->product && $item->product->featuredImage) {
                $featuredImage = $this->processImageForPdf($item->product->featuredImage);
            }

            // Procesar categorías
            $categoryNames = [];
            if ($item->product && $item->product->categories) {
                $categoryNames = $item->product->categories->pluck('name')->toArray();
            }

            // Construir item formateado
            $itemData = [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'quantity' => $item->quantity,
                'unit_price' => $item->unit_price,
                'line_total' => $item->line_total,
                'production_time_days' => $item->production_time_days,
                'logo_printing' => $item->logo_printing,
                'variant_group' => $item->variant_group,
                'is_variant' => $item->is_variant,
                'is_selected' => $item->is_selected,
                'product' => [
                    'id' => $item->product->id ?? null,
                    'name' => $item->product->name ?? 'Producto',
                    'sku' => $item->product->sku ?? null,
                    'categories' => $categoryNames,
                    'category_display' => !empty($categoryNames)
                        ? implode(', ', $categoryNames)
                        : 'Sin categoría'
                ],
                'featured_image' => $featuredImage
            ];

            // Agrupar por regular o variantes
            if ($item->variant_group) {
                $grouped['variants'][$item->variant_group][] = $itemData;
            } else {
                $grouped['regular'][] = $itemData;
            }
        }

        return $grouped;
    }

    /**
     * Procesar imagen para el PDF
     */
    private function processImageForPdf($imageModel)
    {
        if (!$imageModel || !$imageModel->url) {
            return null;
        }

        $rawUrl = $imageModel->url;

        // Si es una URL externa (absoluta)
        if (\Illuminate\Support\Str::startsWith($rawUrl, ['http://', 'https://'])) {
            return [
                'url' => $rawUrl,
                'file_path' => $rawUrl,
                'is_external' => true
            ];
        }

        // Si es una ruta local/relativa
        $publicPath = storage_path('app/public/' . $rawUrl);
        $webUrl = asset('storage/' . $rawUrl);

        return [
            'url' => $rawUrl,
            'file_path' => file_exists($publicPath) ? $publicPath : $webUrl,
            'web_url' => $webUrl,
            'is_external' => false
        ];
    }

    /**
     * Agrupar items por variantes
     */
    private function groupItemsByVariants($items)
    {
        $regular = [];
        $variants = [];

        foreach ($items as $item) {
            if ($item->variant_group) {
                if (!isset($variants[$item->variant_group])) {
                    $variants[$item->variant_group] = [];
                }
                $variants[$item->variant_group][] = $item;
            } else {
                $regular[] = $item;
            }
        }

        return [
            'regular' => $regular,
            'variants' => $variants,
        ];
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

    /**
     * Exportar listado de budgets a Excel
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

            $budgets = Budget::all();

            // Verificar si hay datos para exportar
            if ($budgets->isEmpty()) {
                if ($request->wantsJson() || $request->ajax()) {
                    return response()->json([
                        'message' => 'No hay presupuestos para exportar.'
                    ], 404);
                }

                return redirect()->back()->with('error', 'No hay presupuestos para exportar.');
            }

            // Definir encabezados y sus keys correspondientes
            $headers = [
                'id' => 'ID',
                'budget_merch_number' => 'Numero',
                'title' => 'Título',
                'user_id' => 'Vendedor',
                'client_id' => 'Cliente',
                'payment_condition_description' => 'Condicion de pago',
                'status' => 'Estado',
                'total' => 'Total',
                'issue_date' => 'Fecha de emisión',
                'expiry_date' => 'Fecha de vencimiento',
                'created_at' => 'Fecha de Creación',
                'updated_at' => 'Última Actualización',
                'deleted_at' => 'Fecha de Eliminación',
            ];

            // Preparar datos para exportación
            $data = $budgets->map(function ($budget) {
                return [
                    'id' => $budget->id,
                    'budget_merch_number' => $budget->budget_merch_number,
                    'title' => $budget->title,
                    'user_id' => $budget->user->name,
                    'client_id' => $budget->client->name,
                    'payment_condition_description' => $budget->payment_condition_description,
                    'status' => $budget->status->label(),
                    'total' => $budget->total,
                    'issue_date' => $budget->issue_date->format('d/m/Y H:i'),
                    'expiry_date' => $budget->expiry_date->format('d/m/Y H:i'),
                    'created_at' => $budget->created_at ? $budget->created_at->format('d/m/Y H:i') : '',
                    'updated_at' => $budget->updated_at ? $budget->updated_at->format('d/m/Y H:i') : '',
                    'deleted_at' => $budget->deleted_at ? $budget->deleted_at->format('d/m/Y H:i') : '',
                ];
            })->toArray();

            // Log de exportación exitosa
            Log::info('Presupuestos Merch exportados', [
                'user_id' => $user->id,
                'user_name' => $user->name,
                'count' => count($data),
            ]);

            // Exportar usando el trait
            return $this->exportToExcel(
                data: $data,
                headers: $headers,
                filename: 'presupuestos',
                sheetTitle: 'Lista de Presupuestos Merch'
            );
        } catch (\Exception $e) {
            // Log del error
            Log::error('Error al exportar presupuestos', [
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
