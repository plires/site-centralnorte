<?php

namespace App\Http\Controllers\Dashboard;

use Inertia\Inertia;
use App\Models\Budget;
use App\Models\Client;
use App\Models\Product;
use App\Models\BudgetItem;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Mail\BudgetCreatedMail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Http\Requests\BudgetRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class BudgetController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        // Base query - Admins ven todos, vendedores solo los suyos
        $query = Budget::with(['client', 'user'])
            ->withCount('items');

        // Si es vendedor, solo sus presupuestos
        if ($user->role->name === 'vendedor') {
            $query->where('budgets.user_id', $user->id);
        }

        // Búsqueda
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('budgets.title', 'like', "%{$search}%")
                    ->orWhereHas('client', function ($clientQuery) use ($search) {
                        $clientQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('company', 'like', "%{$search}%");
                    });
            });
        }

        // Filtro por estado
        if ($request->filled('status')) {
            switch ($request->status) {
                case 'active':
                    $query->active();
                    break;
                case 'expired':
                    $query->expired();
                    break;
                case 'expiring_soon':
                    $query->expiringSoon();
                    break;
            }
        }

        // Ordenamiento con soporte para relaciones
        if ($request->filled('sort')) {
            $direction = $request->get('direction', 'asc');
            $sortField = $request->sort;

            switch ($sortField) {
                case 'client.name':
                    // JOIN con tabla clients para ordenar por nombre del cliente
                    $query->leftJoin('clients', 'budgets.client_id', '=', 'clients.id')
                        ->select('budgets.*')
                        ->orderBy('clients.name', $direction)
                        ->orderBy('budgets.id', 'asc'); // FIX: Ordenamiento determinístico
                    break;

                case 'user.name':
                    // JOIN con tabla users para ordenar por nombre del vendedor
                    $query->leftJoin('users', 'budgets.user_id', '=', 'users.id')
                        ->select('budgets.*')
                        ->orderBy('users.name', $direction)
                        ->orderBy('budgets.id', 'asc'); // FIX: Ordenamiento determinístico
                    break;

                default:
                    // Para campos directos de la tabla budgets
                    $query->orderBy("budgets.{$sortField}", $direction)
                        ->orderBy('budgets.id', 'asc'); // FIX: Ordenamiento determinístico
                    break;
            }
        } else {
            // FIX: Ordenamiento por defecto determinístico
            $query->orderBy('budgets.created_at', 'desc')
                ->orderBy('budgets.id', 'desc'); // Agregar ID como segundo criterio
        }

        $budgets = $query->paginate(10)->withQueryString();

        // Aplicar estados a cada presupuesto usando el método del modelo
        $budgets->getCollection()->transform(function ($budget) {
            $statusData = $budget->getStatusData();
            foreach ($statusData as $key => $value) {
                $budget->$key = $value;
            }
            return $budget;
        });

        return Inertia::render('dashboard/budgets/Index', [
            'budgets' => $budgets,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
                'sort' => $request->sort,
                'direction' => $request->direction,
            ]
        ]);
    }

    public function show(Budget $budget)
    {
        $user = Auth::user();

        // Verificar permisos
        $this->authorizeUserAccess($budget);

        // Cargar todas las relaciones necesarias
        $budget->load([
            'user',
            'client',
            'items' => function ($query) {
                $query->with([
                    'product' => function ($query) {
                        $query->with([
                            'images' => function ($query) {
                                $query->where('is_featured', true)->limit(1);
                            },
                            'featuredImage', // Agregar imagen destacada por separado
                            'categories' // Agregar categorías
                        ]);
                    }
                ])->orderBy('sort_order');
            }
        ]);

        // Usar método del modelo
        $statusData = $budget->getStatusData();

        // Separar items regulares y grupos de variantes
        $regularItems = $budget->items->whereNull('variant_group')->values();
        $variantGroups = [];

        if ($budget->hasVariants()) {
            $groupedVariants = $budget->items
                ->whereNotNull('variant_group')
                ->groupBy('variant_group');

            foreach ($groupedVariants as $group => $items) {
                $variantGroups[$group] = $items->values();
            }
        }

        // Obtener configuración de IVA
        $businessConfig = [
            'iva_rate' => config('business.tax.iva_rate', 0.21),
            'apply_iva' => config('business.tax.apply_iva', true),
        ];

        // Pasar budget como array combinado con statusData (igual que PublicBudgetController)
        return Inertia::render('dashboard/budgets/Show', [
            'budget' => array_merge($budget->toArray(), $statusData), // Combinar datos del presupuesto con estado
            'regularItems' => $regularItems,
            'variantGroups' => $variantGroups,
            'hasVariants' => $budget->hasVariants(),
            'businessConfig' => $businessConfig,
        ]);
    }

    public function create()
    {
        $user = Auth::user();

        // Obtener clientes y productos para los selects
        $clients = Client::select('id', 'name', 'company')
            ->orderBy('name')
            ->get()
            ->map(function ($client) {
                return [
                    'id' => $client->id,
                    'name' => $client->name,
                    'display_name' => $client->company ?
                        "{$client->name} ({$client->company})" : $client->name,
                ];
            });

        // Cargar relaciones necesarias
        $products = Product::with(['categories', 'featuredImage', 'images', 'variants'])
            ->orderBy('name')
            ->get();

        return Inertia::render('dashboard/budgets/Create', [
            'clients' => $clients,
            'products' => $products,
            'user' => $user,
            'businessConfig' => [
                'iva_rate' => config('business.tax.iva_rate', 0.21),
                'apply_iva' => config('business.tax.apply_iva', true),
                'default_validity_days' => config('business.budget.default_validity_days', 30), // NUEVO
                'warning_days_before_expiry' => config('business.budget.warning_days_before_expiry', 3), // NUEVO
            ]
        ]);
    }

    public function store(BudgetRequest $request)
    {
        try {
            DB::beginTransaction();

            $user = Auth::user();

            // Crear el presupuesto usando los datos validados
            $budget = Budget::create([
                'title' => $request->title,
                'user_id' => $user->id,
                'client_id' => $request->client_id,
                'issue_date' => $request->issue_date,
                'expiry_date' => $request->expiry_date, // Ya calculada automáticamente en BudgetRequest
                'is_active' => $request->boolean('is_active', true), // Activo por defecto
                'send_email_to_client' => $request->boolean('send_email_to_client'),
                'footer_comments' => $request->footer_comments,
            ]);

            // Procesar items del presupuesto
            $this->processBudgetItems($budget, $request->items);

            // Calcular totales
            $budget->calculateTotals();

            // Enviar email si está configurado (sin fallar la creación) (NUEVO PRESUPUESTO, no es reenvío)
            if ($request->boolean('send_email_to_client')) {
                $this->sendBudgetEmail($budget, false, false); // false = nuevo, false = no lanzar excepción
            }

            DB::commit();

            return redirect()
                ->route('dashboard.budgets.show', $budget)
                ->with('success', 'Presupuesto creado exitosamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al crear presupuesto: ' . $e->getMessage());
            return redirect()->back()
                ->withInput()
                ->with('error', 'Ocurrió un error al crear el presupuesto. Inténtalo de nuevo.');
        }
    }

    public function edit(Budget $budget)
    {
        $user = Auth::user();

        // Verificar permisos
        if ($user->role->name === 'vendedor' && $budget->user_id !== $user->id) {
            abort(403, 'No tienes permisos para editar este presupuesto.');
        }

        // Cargar relaciones necesarias 
        $budget->load([
            'client',
            'user', // Cargar el usuario/vendedor asignado
            'items' => function ($query) {
                $query->with([
                    'product' => function ($query) {
                        $query->with([
                            'images', // Cargar TODAS las imágenes
                            'featuredImage', // Y también la imagen destacada por separado
                            'categories' // Y las categorías
                        ]);
                    },
                    'productVariant'
                ])->orderBy('sort_order');
            }
        ]);

        // Obtener clientes para el select
        $clients = Client::select('id', 'name', 'company')
            ->orderBy('name')
            ->get()
            ->map(function ($client) {
                return [
                    'id' => $client->id,
                    'name' => $client->name,
                    'display_name' => $client->company ?
                        "{$client->name} ({$client->company})" : $client->name,
                ];
            });

        // Cargar relaciones necesarias
        $products = Product::with(['categories', 'featuredImage', 'images', 'variants'])
            ->orderBy('name')
            ->get();

        return Inertia::render('dashboard/budgets/Edit', [
            'budget' => [
                'id' => $budget->id,
                'title' => $budget->title,
                'client_id' => $budget->client_id,
                'user_id' => $budget->user_id, // Enviar el user_id al frontend
                'issue_date' => $budget->issue_date_iso, // Usar accessor para input HTML
                'expiry_date' => $budget->expiry_date_iso, // Usar accessor para input HTML
                'send_email_to_client' => $budget->send_email_to_client,
                'footer_comments' => $budget->footer_comments,
                'items' => $budget->items, // Las relaciones ya están cargadas correctamente
                'is_active' => $budget->is_active, // Campo faltante para el switch
            ],
            'clients' => $clients,
            'products' => $products,
            'user' => $user,
            'businessConfig' => [
                'iva_rate' => config('business.tax.iva_rate', 0.21),
                'apply_iva' => config('business.tax.apply_iva', true),
                'default_validity_days' => config('business.budget.default_validity_days', 30), // NUEVO
                'warning_days_before_expiry' => config('business.budget.warning_days_before_expiry', 3), // NUEVO
            ]
        ]);
    }

    public function update(BudgetRequest $request, Budget $budget)
    {
        try {
            DB::beginTransaction();

            $user = Auth::user();
            $isAdmin = $user->role->name === 'admin';

            // Verificar permisos
            if (!$isAdmin && $budget->user_id !== $user->id) {
                abort(403, 'No tienes permisos para editar este presupuesto.');
            }

            // Preparar datos de actualización
            $updateData = [
                'title' => $request->title,
                'client_id' => $request->client_id,
                'issue_date' => $request->issue_date, // En edición no debería cambiar, pero si llega se valida
                'expiry_date' => $request->expiry_date,
                'send_email_to_client' => $request->boolean('send_email_to_client'),
                'footer_comments' => $request->footer_comments,
            ];

            // Si es admin y se envió user_id, permitir cambiar el vendedor asignado
            if ($isAdmin && $request->has('user_id')) {
                $updateData['user_id'] = $request->user_id;
            }

            // Actualizar datos básicos del presupuesto
            $budget->update($updateData);

            // Eliminar items existentes y recrear
            $budget->items()->delete();
            $this->createBudgetItems($budget, $request->items);

            // Calcular totales
            $budget->calculateTotals();

            DB::commit();

            return redirect()
                ->route('dashboard.budgets.show', $budget)
                ->with('success', 'Presupuesto actualizado exitosamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al actualizar presupuesto: ' . $e->getMessage());
            return redirect()->back()
                ->withInput()
                ->with('error', 'Ocurrió un error al actualizar el presupuesto. Inténtalo de nuevo.');
        }
    }

    public function destroy(Budget $budget)
    {
        try {
            DB::beginTransaction();

            $user = Auth::user();

            // Verificar permisos
            if ($user->role->name === 'vendedor' && $budget->user_id !== $user->id) {
                abort(403, 'No tienes permisos para eliminar este presupuesto.');
            }

            // Eliminar explícitamente los BudgetItems primero
            // Aunque la migración tiene cascade, es mejor tener control explícito
            $budget->items()->delete();

            // Luego eliminar el presupuesto
            $budget->delete();

            DB::commit();

            return redirect()
                ->route('dashboard.budgets.index')
                ->with('success', 'Presupuesto eliminado exitosamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al eliminar presupuesto: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Ocurrió un error al eliminar el presupuesto.');
        }
    }

    /**
     * Método actualizado para crear items con is_selected
     */
    private function createBudgetItems(Budget $budget, array $items)
    {
        $sortOrder = 1;
        $productPriceUpdates = [];

        foreach ($items as $index => $itemData) {
            try {
                $budgetItem = BudgetItem::create([
                    'budget_id' => $budget->id,
                    'product_id' => $itemData['product_id'],
                    'product_variant_id' => $itemData['product_variant_id'] ?? null,
                    'quantity' => (int) $itemData['quantity'],
                    'unit_price' => (float) $itemData['unit_price'],
                    'production_time_days' => isset($itemData['production_time_days']) && $itemData['production_time_days'] !== ''
                        ? (int) $itemData['production_time_days'] : null,
                    'logo_printing' => $itemData['logo_printing'] ?? null,
                    'line_total' => (int) $itemData['quantity'] * (float) $itemData['unit_price'],
                    'sort_order' => $sortOrder++,
                    'variant_group' => $itemData['variant_group'] ?? null,
                    'is_variant' => (bool) ($itemData['is_variant'] ?? false),
                    'is_selected' => isset($itemData['is_selected']) ? (bool) $itemData['is_selected'] : true, // MEJORADO: Manejar is_selected con valor por defecto
                ]);

                // Preparar actualización de precio del producto si es diferente
                $currentPrice = Product::find($itemData['product_id'])->last_price ?? 0;
                $newPrice = (float) $itemData['unit_price'];

                if ($currentPrice != $newPrice) {
                    $productPriceUpdates[] = [
                        'id' => $itemData['product_id'],
                        'last_price' => $newPrice
                    ];
                }
            } catch (\Exception $e) {
                Log::error('Error creating budget item', ['index' => $index, 'error' => $e->getMessage(), 'item' => $itemData]);
                throw $e;
            }
        }

        // Actualizar precios de productos en lote
        if (!empty($productPriceUpdates)) {
            foreach ($productPriceUpdates as $update) {
                Product::where('id', $update['id'])->update(['last_price' => $update['last_price']]);
            }
        }
    }

    public function duplicate(Budget $budget)
    {
        try {
            DB::beginTransaction();

            $user = Auth::user();

            // Verificar permisos
            if ($user->role->name === 'vendedor' && $budget->user_id !== $user->id) {
                abort(403, 'No tienes permisos para duplicar este presupuesto.');
            }

            // Duplicar el presupuesto
            $newBudget = $budget->replicate();
            $newBudget->title = $budget->title . ' (Copia)';
            $newBudget->token = Str::random(32);
            $newBudget->email_sent = false;
            $newBudget->email_sent_at = null;
            $newBudget->issue_date = now()->format('Y-m-d');
            $newBudget->expiry_date = now()->addDays(30)->format('Y-m-d');
            $newBudget->save();

            // Duplicar los items
            foreach ($budget->items as $item) {
                $newItem = $item->replicate();
                $newItem->budget_id = $newBudget->id;
                $newItem->save();
            }

            // Calcular totales
            $newBudget->calculateTotals();

            DB::commit();

            return redirect()
                ->route('dashboard.budgets.edit', $newBudget)
                ->with('success', 'Presupuesto duplicado exitosamente.');
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

            // Verificar permisos
            if ($user->role->name === 'vendedor' && $budget->user_id !== $user->id) {
                abort(403, 'No tienes permisos para enviar este presupuesto.');
            }

            // Usar el método refactorizado (con excepción en caso de error). se indica que ES UN REENVÍO
            $this->sendBudgetEmail($budget, true, true); // true = es reenvío, true = lanzar excepción

            // Mensaje diferenciado para reenvío
            return redirect()->back()->with('success', 'Reenvío de email exitoso.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Ocurrió un error al enviar el email: ' . $e->getMessage());
        }
    }

    /**
     * Procesar items del presupuesto y actualizar precios de productos
     */
    private function processBudgetItems(Budget $budget, array $items)
    {
        $productPriceUpdates = [];
        $sortOrder = 0;

        foreach ($items as $index => $itemData) {
            try {
                // Validar que los datos requeridos estén presentes
                if (!isset($itemData['product_id']) || !isset($itemData['quantity']) || !isset($itemData['unit_price'])) {
                    Log::error('Missing required item data', ['index' => $index, 'item' => $itemData]);
                    throw new \Exception("Datos incompletos en el item {$index}");
                }

                // Crear el item del presupuesto 
                $budgetItem = $budget->items()->create([
                    'product_id' => $itemData['product_id'],
                    'product_variant_id' => $itemData['product_variant_id'] ?? null,
                    'quantity' => (int) $itemData['quantity'],
                    'unit_price' => (float) $itemData['unit_price'],
                    'production_time_days' => !empty($itemData['production_time_days']) ? (int) $itemData['production_time_days'] : null,
                    'logo_printing' => $itemData['logo_printing'] ?? null,
                    'line_total' => (int) $itemData['quantity'] * (float) $itemData['unit_price'],
                    'sort_order' => $sortOrder++,
                    'variant_group' => $itemData['variant_group'] ?? null,
                    'is_variant' => (bool) ($itemData['is_variant'] ?? false),
                    'is_selected' => isset($itemData['is_selected']) ? (bool) $itemData['is_selected'] : true, // Manejo de is_selected
                ]);

                // Preparar actualización de precio del producto si es diferente
                $currentPrice = Product::find($itemData['product_id'])->last_price ?? 0;
                $newPrice = (float) $itemData['unit_price'];

                if ($currentPrice != $newPrice) {
                    $productPriceUpdates[] = [
                        'id' => $itemData['product_id'],
                        'last_price' => $newPrice
                    ];
                }
            } catch (\Exception $e) {
                Log::error('Error creating budget item', ['index' => $index, 'error' => $e->getMessage(), 'item' => $itemData]);
                throw $e;
            }
        }

        // Actualizar precios de productos en lote
        if (!empty($productPriceUpdates)) {
            foreach ($productPriceUpdates as $update) {
                Product::where('id', $update['id'])->update(['last_price' => $update['last_price']]);
            }
        }
    }

    // Métodos privados auxiliares
    private function authorizeUserAccess(Budget $budget)
    {
        $user = Auth::user();

        // Admin puede ver todos, vendedores solo los suyos
        if ($user->role->name === 'vendedor' && $budget->user_id !== $user->id) {
            abort(403, 'No tienes permisos para acceder a este presupuesto.');
        }
    }

    /**
     * Programar notificaciones de vencimiento para un presupuesto
     * Usa la configuración BUDGET_WARNING_DAYS del .env
     */
    private function scheduleNotifications(Budget $budget)
    {
        // Obtener días de aviso desde .env (por defecto 3)
        $warningDays = config('budget.warning_days', env('BUDGET_WARNING_DAYS', 3));

        // Notificación X días antes del vencimiento (según configuración)
        $warningDate = $budget->expiry_date->copy()->subDays($warningDays);

        if ($warningDate > now()) {
            \App\Models\BudgetNotification::create([
                'budget_id' => $budget->id,
                'type' => 'expiry_warning',
                'scheduled_for' => $warningDate,
                'notification_data' => [
                    'days_until_expiry' => $warningDays,
                    // Campos para control de envío único
                    // Se marcarán como true cuando se envíen
                    // 'sent_to_seller' => false,
                    // 'sent_to_client' => false,
                ]
            ]);
        }

        // Notificación el día del vencimiento
        \App\Models\BudgetNotification::create([
            'budget_id' => $budget->id,
            'type' => 'expired',
            'scheduled_for' => $budget->expiry_date,
            'notification_data' => [
                // Campos para control de envío único
                // Se marcarán como true cuando se envíen
                // 'sent_to_seller' => false,
                // 'sent_to_client' => false,
            ]
        ]);
    }

    /**
     * Enviar email del presupuesto al cliente
     * 
     * @param Budget $budget
     * @param bool $throwOnError Si debe lanzar excepción en caso de error
     * @return bool true si se envió exitosamente, false si falló
     * @throws \Exception si $throwOnError es true y hay error
     */
    private function sendBudgetEmail(Budget $budget, bool $isResend = false, bool $throwOnError = true): bool
    {
        try {
            $user = Auth::user();

            // Verificar que el cliente tenga email
            if (!$budget->client->email) {
                $message = 'El cliente no tiene email configurado.';
                if ($throwOnError) {
                    throw new \Exception($message);
                }
                Log::warning($message, ['budget_id' => $budget->id]);
                return false;
            }

            $publicUrl = route('public.budget.show', $budget->token);
            Mail::to($budget->client->email)->send(new BudgetCreatedMail($budget, $user, $publicUrl, $isResend));

            $budget->update([
                'email_sent' => true,
                'email_sent_at' => now(),
            ]);

            return true;
        } catch (\Exception $e) {
            $action = $isResend ? 'reenviar' : 'enviar';
            Log::error("Error al {$action} email de presupuesto: " . $e->getMessage(), [
                'budget_id' => $budget->id,
                'is_resend' => $isResend
            ]);

            if ($throwOnError) {
                throw $e;
            }

            return false;
        }
    }

    // Método helper para obtener configuración de negocio
    private function getBusinessConfig()
    {
        return [
            'iva_rate' => config('business.tax.iva_rate'),
            'apply_iva' => config('business.tax.apply_iva'),
            'default_validity_days' => config('business.budget.default_validity_days'),
            'warning_days_before_expiry' => config('business.budget.warning_days_before_expiry'),
        ];
    }

    /**
     * Activar/desactivar presupuesto
     */
    public function toggleStatus(Request $request, Budget $budget)
    {
        $request->validate([
            'is_active' => 'required|boolean'
        ]);

        try {
            $budget->update([
                'is_active' => $request->is_active
            ]);

            return back()->with(
                'success',
                $request->is_active
                    ? 'Presupuesto activado correctamente'
                    : 'Presupuesto desactivado correctamente'
            );
        } catch (\Exception $e) {
            Log::error('Error al cambiar estado del presupuesto', [
                'budget_id' => $budget->id,
                'new_status' => $request->is_active,
                'error' => $e->getMessage()
            ]);

            return back()->with('error', 'Error al actualizar el estado del presupuesto');
        }
    }
}
