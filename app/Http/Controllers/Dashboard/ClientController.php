<?php

namespace App\Http\Controllers\Dashboard;

use Inertia\Inertia;
use App\Models\Client;
use App\Models\User;
use Illuminate\Http\Request;
use App\Traits\ExportsToExcel;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\StoreClientRequest;
use App\Enums\BudgetStatus;
use App\Http\Requests\UpdateClientRequest;

class ClientController extends Controller
{
    use ExportsToExcel;

    private function userIsAdmin(): bool
    {
        return Auth::user()->role?->name === 'admin';
    }

    private function authorizeClientAccess(Client $client): void
    {
        if (!$this->userIsAdmin() && $client->user_id !== Auth::id()) {
            abort(403, 'No tienes permiso para acceder a este cliente.');
        }
    }

    private function getSellers(): \Illuminate\Database\Eloquent\Collection
    {
        return User::vendedores()->orderBy('name')->get(['id', 'name']);
    }

    public function index()
    {
        $nonVigenteStatuses = [BudgetStatus::EXPIRED->value, BudgetStatus::REJECTED->value];

        $query = Client::withCount([
            'budgets as active_merch_count'          => fn ($q) => $q->whereNotIn('status', $nonVigenteStatuses),
            'pickingBudgets as active_picking_count'  => fn ($q) => $q->whereNotIn('status', $nonVigenteStatuses),
        ])->with('user:id,name');

        if (!$this->userIsAdmin()) {
            $query->where('user_id', Auth::id());
        }

        $clients = $query->get();

        return Inertia::render('dashboard/clients/Index', [
            'clients' => $clients,
        ]);
    }

    public function show(Client $client)
    {
        $this->authorizeClientAccess($client);

        return Inertia::render('dashboard/clients/Show', [
            'client' => $client->load('user:id,name'),
        ]);
    }

    public function create()
    {
        return inertia('dashboard/clients/Create', [
            'sellers' => $this->userIsAdmin() ? $this->getSellers() : null,
        ]);
    }

    public function store(StoreClientRequest $request)
    {
        try {
            $validated = $request->validated();

            // El vendedor siempre queda asignado a sí mismo
            if (!$this->userIsAdmin()) {
                $validated['user_id'] = Auth::id();
            }

            $client = Client::create($validated);

            return redirect()->back()->with('success', "Cliente '{$client->name}' creado correctamente.");
        } catch (\Exception $e) {
            Log::error('Error al crear el cliente: ' . $e->getMessage());

            return redirect()->back()->with('error', 'Ocurrió un error al crear el cliente. Inténtalo de nuevo.');
        }
    }

    public function edit(Client $client)
    {
        $this->authorizeClientAccess($client);

        return inertia('dashboard/clients/Edit', [
            'client'  => $client->load('user:id,name'),
            'sellers' => $this->userIsAdmin() ? $this->getSellers() : null,
        ]);
    }

    public function update(UpdateClientRequest $request, Client $client)
    {
        $this->authorizeClientAccess($client);

        try {
            $validated = $request->validated();

            // El vendedor no puede reasignar el cliente
            if (!$this->userIsAdmin()) {
                unset($validated['user_id']);
            }

            $client->update($validated);

            return redirect()->back()->with('success', "Cliente '{$client->name}' actualizado correctamente.");
        } catch (\Throwable $e) {
            Log::error('Error al actualizar el cliente: ' . $e->getMessage());

            return redirect()->back()->with('error', 'Ocurrió un error al actualizar el cliente. Inténtalo de nuevo.');
        }
    }

    public function destroy(Client $client)
    {
        $this->authorizeClientAccess($client);

        try {
            $nonVigenteStatuses = [BudgetStatus::EXPIRED->value, BudgetStatus::REJECTED->value];

            $hasActiveBudgets = $client->budgets()->whereNotIn('status', $nonVigenteStatuses)->exists()
                || $client->pickingBudgets()->whereNotIn('status', $nonVigenteStatuses)->exists();

            if ($hasActiveBudgets) {
                return redirect()->back()->with(
                    'error',
                    "No se puede eliminar el cliente '{$client->name}' porque tiene presupuestos vigentes asociados."
                );
            }

            $client->delete();

            return redirect()->back()->with('success', "Cliente '{$client->name}' eliminado correctamente.");
        } catch (\Exception $e) {
            Log::error('Error al eliminar el cliente: ' . $e->getMessage());

            return redirect()->back()->with('error', 'Ocurrió un error al eliminar el cliente. Inténtalo de nuevo.');
        }
    }

    /**
     * Exportar listado de clientes a Excel.
     * Solo accesible para usuarios con role 'admin'.
     */
    public function export(Request $request)
    {
        try {
            $user = Auth::user();

            if (!$this->userIsAdmin()) {
                if ($request->wantsJson() || $request->ajax()) {
                    return response()->json(['message' => 'No tienes permisos para exportar datos.'], 403);
                }

                abort(403, 'No tienes permisos para exportar datos.');
            }

            $clients = Client::with('user:id,name')->get();

            if ($clients->isEmpty()) {
                if ($request->wantsJson() || $request->ajax()) {
                    return response()->json(['message' => 'No hay clientes para exportar.'], 404);
                }

                return redirect()->back()->with('error', 'No hay clientes para exportar.');
            }

            $headers = [
                'id'         => 'ID',
                'name'       => 'Nombre',
                'company'    => 'Empresa',
                'email'      => 'Email',
                'phone'      => 'Teléfono',
                'address'    => 'Dirección',
                'seller'     => 'Vendedor asignado',
                'created_at' => 'Fecha de Creación',
                'updated_at' => 'Última Actualización',
                'deleted_at' => 'Fecha de Eliminación',
            ];

            $data = $clients->map(function ($client) {
                return [
                    'id'         => $client->id,
                    'name'       => $client->name,
                    'company'    => $client->company,
                    'email'      => $client->email,
                    'phone'      => $client->phone,
                    'address'    => $client->address,
                    'seller'     => $client->user?->name ?? '-',
                    'created_at' => $client->created_at?->format('d/m/Y H:i') ?? '',
                    'updated_at' => $client->updated_at?->format('d/m/Y H:i') ?? '',
                    'deleted_at' => $client->deleted_at?->format('d/m/Y H:i') ?? '',
                ];
            })->toArray();

            Log::info('Clientes exportados', [
                'user_id'   => $user->id,
                'user_name' => $user->name,
                'count'     => count($data),
            ]);

            return $this->exportToExcel(
                data: $data,
                headers: $headers,
                filename: 'clientes',
                sheetTitle: 'Lista de Clientes'
            );
        } catch (\Exception $e) {
            Log::error('Error al exportar clientes', [
                'user_id' => Auth::id(),
                'error'   => $e->getMessage(),
            ]);

            if ($request->wantsJson() || $request->ajax()) {
                return response()->json(['message' => 'Error al generar el archivo de exportación.'], 500);
            }

            return redirect()->back()->with('error', 'Error al generar el archivo de exportación. Por favor, inténtalo de nuevo.');
        }
    }
}
