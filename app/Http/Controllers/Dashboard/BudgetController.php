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
            $query->where('user_id', $user->id);
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

        // Ordenamiento
        if ($request->filled('sort')) {
            $direction = $request->get('direction', 'asc');
            $query->orderBy($request->sort, $direction);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $budgets = $query->paginate(10)->withQueryString();

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
        // Cargar todas las relaciones necesarias
        $budget->load([
            'user',
            'client',
            'items' => function ($query) {
                $query->with([
                    'product' => function ($query) {
                        $query->with(['images' => function ($query) {
                            $query->where('is_featured', true)->limit(1);
                        }]);
                    }
                ])->orderBy('sort_order');
            }
        ]);

        // Obtener grupos de variantes si existen
        $variantGroups = $budget->hasVariants() ? $budget->getVariantGroups() : [];

        // Organizar items por grupos de variantes
        $organizedItems = [];
        $regularItems = [];

        foreach ($budget->items as $item) {
            if ($item->variant_group) {
                if (!isset($organizedItems[$item->variant_group])) {
                    $organizedItems[$item->variant_group] = [];
                }
                $organizedItems[$item->variant_group][] = $item;
            } else {
                $regularItems[] = $item;
            }
        }

        return Inertia::render('dashboard/budgets/Show', [
            'budget' => $budget,
            'regularItems' => $regularItems,
            'variantGroups' => $organizedItems,
            'hasVariants' => $budget->hasVariants(),
        ]);
    }

    public function create()
    {

        $userAuth = Auth::user();

        // Obtener clientes para el select
        $clients = Client::select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        // Obtener productos con sus imágenes para el selector
        $products = Product::with(['images' => function ($query) {
            $query->where('is_featured', true)->limit(1);
        }])
            ->select('id', 'name', 'description', 'last_price')
            ->orderBy('name')
            ->get();

        // Si algún producto no tiene imagen featured, cargar la primera disponible
        foreach ($products as $product) {
            if ($product->images->isEmpty()) {
                $product->load(['images' => function ($query) {
                    $query->limit(1);
                }]);
            }
        }

        return Inertia::render('dashboard/budgets/Create', [
            'clients' => $clients,
            'products' => $products,
            'user' => $userAuth,
        ]);
    }

    // En tu controlador
    public function edit(Budget $budget)
    {
        $userAuth = Auth::user();

        $budget->load(['client', 'items.product.images']);

        return Inertia::render('dashboard/budgets/Edit', [
            'budget' => $budget,
            'clients' => Client::all(),
            'products' => Product::with('images')->get(),
            'user' => $userAuth,
        ]);
    }

    public function store(BudgetRequest $request)
    {

        $userAuth = Auth::user();

        DB::beginTransaction();

        try {
            // Crear el presupuesto (el token se genera automáticamente en el modelo)
            $budget = Budget::create([
                'title' => $request->title,
                'user_id' => $userAuth->id,
                'client_id' => $request->client_id,
                'issue_date' => $request->issue_date,
                'expiry_date' => $request->expiry_date,
                'is_active' => true,
                'send_email_to_client' => $request->boolean('send_email_to_client'),
                'footer_comments' => $request->footer_comments,
                'subtotal' => 0, // Se calculará después
                'total' => 0, // Se calculará después
            ]);

            // Procesar items y actualizar precios de productos
            $this->processBudgetItems($budget, $request->input('items', []));

            // Calcular totales
            $budget->calculateTotals();

            // Enviar email si está configurado
            if ($request->boolean('send_email_to_client')) {
                // Aquí puedes agregar la lógica de envío de email
                // dispatch(new SendBudgetEmailJob($budget));

                $budget->update([
                    'email_sent' => true,
                    'email_sent_at' => now(),
                ]);
            }

            DB::commit();

            return redirect()->back()->with('success', 'Presupuesto creado exitosamente');
        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Error al crear el presupuesto: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Ocurrió un error al crear el presupuesto. Inténtalo de nuevo.');
        }
    }

    public function update(BudgetRequest $request, Budget $budget)
    {

        DB::beginTransaction();

        try {
            // Actualizar el presupuesto
            $budget->update([
                'title' => $request->title,
                'client_id' => $request->client_id,
                'issue_date' => $request->issue_date,
                'expiry_date' => $request->expiry_date,
                'send_email_to_client' => $request->boolean('send_email_to_client'),
                'footer_comments' => $request->footer_comments,
            ]);

            // Eliminar items existentes
            $budget->items()->delete();

            // Procesar nuevos items y actualizar precios de productos
            $this->processBudgetItems($budget, $request->input('items', []));

            // Calcular totales
            $budget->calculateTotals();

            // Manejar envío de email
            if ($request->boolean('send_email_to_client') && !$budget->email_sent) {
                // Aquí puedes agregar la lógica de envío de email
                // dispatch(new SendBudgetEmailJob($budget));

                $budget->update([
                    'email_sent' => true,
                    'email_sent_at' => now(),
                ]);
            } elseif (!$request->boolean('send_email_to_client')) {
                // Si se destilda el checkbox, resetear el estado de envío
                $budget->update([
                    'email_sent' => false,
                    'email_sent_at' => null,
                ]);
            }

            DB::commit();

            return redirect()->back()->with('success', 'Presupuesto actualizado exitosamente');
        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Error al actualizar el presupuesto: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Ocurrió un error al actualizar el presupuesto. Inténtalo de nuevo.');
        }
    }

    /**
     * Procesar items del presupuesto y actualizar precios de productos
     */
    private function processBudgetItems(Budget $budget, array $items)
    {
        $productPriceUpdates = [];
        $sortOrder = 0;

        Log::info('Processing budget items', ['count' => count($items)]);

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
                    'quantity' => (int) $itemData['quantity'],
                    'unit_price' => (float) $itemData['unit_price'],
                    'production_time_days' => !empty($itemData['production_time_days']) ? (int) $itemData['production_time_days'] : null,
                    'logo_printing' => $itemData['logo_printing'] ?? null,
                    'line_total' => (int) $itemData['quantity'] * (float) $itemData['unit_price'],
                    'sort_order' => $sortOrder++,
                    'variant_group' => $itemData['variant_group'] ?? null,
                    'is_variant' => (bool) ($itemData['is_variant'] ?? false),
                ]);

                Log::info('Created budget item', ['id' => $budgetItem->id, 'product_id' => $itemData['product_id']]);

                // Preparar actualización de precio del producto
                $productId = $itemData['product_id'];
                $unitPrice = (float) $itemData['unit_price'];

                // Para productos con variantes, solo tomar el precio de la primera variante de cada grupo
                if (!empty($itemData['variant_group'])) {
                    $variantGroup = $itemData['variant_group'];

                    // Si es la primera vez que vemos este grupo de variantes, guardar el precio
                    if (!isset($productPriceUpdates[$productId]['variant_groups'][$variantGroup])) {
                        $productPriceUpdates[$productId] = [
                            'price' => $unitPrice,
                            'variant_groups' => [$variantGroup => true]
                        ];
                    }
                } else {
                    // Para productos individuales, siempre actualizar el precio
                    $productPriceUpdates[$productId] = [
                        'price' => $unitPrice,
                        'variant_groups' => []
                    ];
                }
            } catch (\Exception $e) {
                Log::error('Error processing item', ['index' => $index, 'error' => $e->getMessage(), 'item' => $itemData]);
                throw $e;
            }
        }

        // Actualizar precios en la tabla products
        foreach ($productPriceUpdates as $productId => $priceData) {
            try {
                Product::where('id', $productId)->update([
                    'last_price' => $priceData['price']
                ]);

                Log::info('Updated product price', ['product_id' => $productId, 'price' => $priceData['price']]);
            } catch (\Exception $e) {
                Log::error('Error updating product price', ['product_id' => $productId, 'error' => $e->getMessage()]);
                throw $e;
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

    private function scheduleNotifications(Budget $budget)
    {
        // Notificación 72 horas antes del vencimiento
        $warningDate = $budget->expiry_date->subDays(3);

        if ($warningDate > now()) {
            \App\Models\BudgetNotification::create([
                'budget_id' => $budget->id,
                'type' => 'expiry_warning',
                'scheduled_for' => $warningDate,
                'notification_data' => [
                    'days_until_expiry' => 3
                ]
            ]);
        }

        // Notificación el día del vencimiento
        \App\Models\BudgetNotification::create([
            'budget_id' => $budget->id,
            'type' => 'expired',
            'scheduled_for' => $budget->expiry_date,
            'notification_data' => []
        ]);
    }

    private function sendBudgetEmail(Budget $budget)
    {
        if (!$budget->client->email) {
            throw new \Exception('El cliente no tiene email configurado.');
        }

        Mail::to($budget->client->email)->send(new BudgetCreatedMail($budget));

        $budget->update([
            'email_sent' => true,
            'email_sent_at' => now(),
        ]);
    }
}
