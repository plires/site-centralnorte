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
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
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
                $query->with('product')->orderBy('sort_order');
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

    // public function show(Budget $budget)
    // {
    //     // Verificar permisos (vendedores solo ven los suyos)
    //     $this->authorizeUserAccess($budget);

    //     $budget->load([
    //         'client',
    //         'user',
    //         'items.product.featuredImage',
    //         'items.product.category'
    //     ]);

    //     return Inertia::render('dashboard/budgets/Show', [
    //         'budget' => $budget
    //     ]);
    // }

    // public function create()
    // {
    //     return Inertia::render('dashboard/budgets/Create');
    // }

    // public function store(Request $request)
    // {
    //     $validated = $request->validate([
    //         'title' => 'required|string|max:255',
    //         'client_id' => 'required|exists:clients,id',
    //         'issue_date' => 'required|date',
    //         'expiry_date' => 'required|date|after:issue_date',
    //         'footer_comments' => 'nullable|string',
    //         'send_email_to_client' => 'boolean',
    //         'items' => 'required|array|min:1',
    //         'items.*.product_id' => 'required|exists:products,id',
    //         'items.*.quantity' => 'required|integer|min:1',
    //         'items.*.unit_price' => 'required|numeric|min:0',
    //         'items.*.production_time_days' => 'nullable|integer|min:0',
    //         'items.*.logo_printing' => 'nullable|string|max:255',
    //         'items.*.is_variant' => 'boolean',
    //         'items.*.variant_group' => 'nullable|string|max:50',
    //     ]);

    //     try {
    //         DB::beginTransaction();

    //         // Crear presupuesto
    //         $budget = Budget::create([
    //             'title' => $validated['title'],
    //             'user_id' => Auth::id(),
    //             'client_id' => $validated['client_id'],
    //             'issue_date' => $validated['issue_date'],
    //             'expiry_date' => $validated['expiry_date'],
    //             'footer_comments' => $validated['footer_comments'] ?? null,
    //             'send_email_to_client' => $validated['send_email_to_client'] ?? false,
    //             'token' => Str::random(32),
    //         ]);

    //         // Crear líneas de presupuesto
    //         foreach ($validated['items'] as $index => $itemData) {
    //             BudgetItem::create([
    //                 'budget_id' => $budget->id,
    //                 'product_id' => $itemData['product_id'],
    //                 'quantity' => $itemData['quantity'],
    //                 'unit_price' => $itemData['unit_price'],
    //                 'production_time_days' => $itemData['production_time_days'],
    //                 'logo_printing' => $itemData['logo_printing'],
    //                 'is_variant' => $itemData['is_variant'] ?? false,
    //                 'variant_group' => $itemData['variant_group'],
    //                 'sort_order' => $index,
    //             ]);
    //         }

    //         // Calcular totales
    //         $budget->calculateTotals();

    //         // Programar notificaciones
    //         $this->scheduleNotifications($budget);

    //         // Enviar email si está marcado
    //         if ($validated['send_email_to_client']) {
    //             $this->sendBudgetEmail($budget);
    //         }

    //         \DB::commit();

    //         return redirect()->route('dashboard.budgets.show', $budget)
    //             ->with('success', "Presupuesto '{$budget->title}' creado correctamente.");
    //     } catch (\Exception $e) {
    //         \DB::rollBack();
    //         Log::error('Error al crear presupuesto: ' . $e->getMessage());
    //         return redirect()->back()
    //             ->with('error', 'Ocurrió un error al crear el presupuesto. Inténtalo de nuevo.')
    //             ->withInput();
    //     }
    // }

    // public function edit(Budget $budget)
    // {
    //     $this->authorizeUserAccess($budget);

    //     $budget->load([
    //         'items.product.featuredImage',
    //         'items.product.category'
    //     ]);

    //     return Inertia::render('dashboard/budgets/Edit', [
    //         'budget' => $budget
    //     ]);
    // }

    // public function update(Request $request, Budget $budget)
    // {
    //     $this->authorizeUserAccess($budget);

    //     $validated = $request->validate([
    //         'title' => 'required|string|max:255',
    //         'client_id' => 'required|exists:clients,id',
    //         'issue_date' => 'required|date',
    //         'expiry_date' => 'required|date|after:issue_date',
    //         'footer_comments' => 'nullable|string',
    //         'is_active' => 'boolean',
    //         'items' => 'required|array|min:1',
    //         'items.*.product_id' => 'required|exists:products,id',
    //         'items.*.quantity' => 'required|integer|min:1',
    //         'items.*.unit_price' => 'required|numeric|min:0',
    //         'items.*.production_time_days' => 'nullable|integer|min:0',
    //         'items.*.logo_printing' => 'nullable|string|max:255',
    //         'items.*.is_variant' => 'boolean',
    //         'items.*.variant_group' => 'nullable|string|max:50',
    //     ]);

    //     try {
    //         \DB::beginTransaction();

    //         // Actualizar presupuesto
    //         $budget->update([
    //             'title' => $validated['title'],
    //             'client_id' => $validated['client_id'],
    //             'issue_date' => $validated['issue_date'],
    //             'expiry_date' => $validated['expiry_date'],
    //             'footer_comments' => $validated['footer_comments'] ?? null,
    //             'is_active' => $validated['is_active'] ?? true,
    //         ]);

    //         // Eliminar líneas existentes y crear nuevas
    //         $budget->items()->delete();

    //         foreach ($validated['items'] as $index => $itemData) {
    //             BudgetItem::create([
    //                 'budget_id' => $budget->id,
    //                 'product_id' => $itemData['product_id'],
    //                 'quantity' => $itemData['quantity'],
    //                 'unit_price' => $itemData['unit_price'],
    //                 'production_time_days' => $itemData['production_time_days'],
    //                 'logo_printing' => $itemData['logo_printing'],
    //                 'is_variant' => $itemData['is_variant'] ?? false,
    //                 'variant_group' => $itemData['variant_group'],
    //                 'sort_order' => $index,
    //             ]);
    //         }

    //         // Recalcular totales
    //         $budget->calculateTotals();

    //         // Actualizar notificaciones si cambió la fecha de vencimiento
    //         if ($budget->wasChanged('expiry_date')) {
    //             $budget->notifications()->delete();
    //             $this->scheduleNotifications($budget);
    //         }

    //         \DB::commit();

    //         return redirect()->back()
    //             ->with('success', "Presupuesto '{$budget->title}' actualizado correctamente.");
    //     } catch (\Exception $e) {
    //         \DB::rollBack();
    //         Log::error('Error al actualizar presupuesto: ' . $e->getMessage());
    //         return redirect()->back()
    //             ->with('error', 'Ocurrió un error al actualizar el presupuesto.')
    //             ->withInput();
    //     }
    // }

    // public function destroy(Budget $budget)
    // {
    //     $this->authorizeUserAccess($budget);

    //     try {
    //         $budgetTitle = $budget->title;
    //         $budget->delete();

    //         return redirect()->route('dashboard.budgets.index')
    //             ->with('success', "Presupuesto '{$budgetTitle}' eliminado correctamente.");
    //     } catch (\Exception $e) {
    //         Log::error('Error al eliminar presupuesto: ' . $e->getMessage());
    //         return redirect()->back()
    //             ->with('error', 'Ocurrió un error al eliminar el presupuesto.');
    //     }
    // }

    // public function duplicate(Budget $budget)
    // {
    //     $this->authorizeUserAccess($budget);

    //     try {
    //         \DB::beginTransaction();

    //         // Crear nuevo presupuesto
    //         $newBudget = Budget::create([
    //             'title' => $budget->title . ' (Copia)',
    //             'user_id' => Auth::id(),
    //             'client_id' => $budget->client_id,
    //             'issue_date' => now()->format('Y-m-d'),
    //             'expiry_date' => now()->addDays(30)->format('Y-m-d'),
    //             'footer_comments' => $budget->footer_comments,
    //             'send_email_to_client' => false,
    //             'token' => Str::random(32),
    //         ]);

    //         // Duplicar líneas
    //         foreach ($budget->items as $item) {
    //             BudgetItem::create([
    //                 'budget_id' => $newBudget->id,
    //                 'product_id' => $item->product_id,
    //                 'quantity' => $item->quantity,
    //                 'unit_price' => $item->unit_price,
    //                 'production_time_days' => $item->production_time_days,
    //                 'logo_printing' => $item->logo_printing,
    //                 'is_variant' => $item->is_variant,
    //                 'variant_group' => $item->variant_group,
    //                 'sort_order' => $item->sort_order,
    //             ]);
    //         }

    //         // Calcular totales
    //         $newBudget->calculateTotals();

    //         // Programar notificaciones
    //         $this->scheduleNotifications($newBudget);

    //         \DB::commit();

    //         return redirect()->route('dashboard.budgets.edit', $newBudget)
    //             ->with('success', 'Presupuesto duplicado correctamente. Puedes modificarlo antes de enviarlo.');
    //     } catch (\Exception $e) {
    //         \DB::rollBack();
    //         Log::error('Error al duplicar presupuesto: ' . $e->getMessage());
    //         return redirect()->back()
    //             ->with('error', 'Ocurrió un error al duplicar el presupuesto.');
    //     }
    // }

    // public function sendEmail(Budget $budget)
    // {
    //     $this->authorizeUserAccess($budget);

    //     try {
    //         $this->sendBudgetEmail($budget);

    //         return redirect()->back()
    //             ->with('success', 'Email enviado correctamente al cliente.');
    //     } catch (\Exception $e) {
    //         Log::error('Error al enviar email: ' . $e->getMessage());
    //         return redirect()->back()
    //             ->with('error', 'Ocurrió un error al enviar el email.');
    //     }
    // }

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
