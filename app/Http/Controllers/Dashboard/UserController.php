<?php

namespace App\Http\Controllers\Dashboard;

use App\Models\Budget;
use App\Models\Client;
use App\Models\PickingBudget;
use App\Models\Role;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;

class UserController extends Controller
{
    public function show(User $user)
    {
        // Cargar la relación con el rol si existe
        $user->load('role');

        return inertia('dashboard/users/Show', [
            'user' => $user
        ]);
    }

    public function index(Request $request)
    {

        $query = User::withoutTrashed();

        // Búsqueda
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Ordenamiento
        if ($request->filled('sort')) {
            $direction = $request->get('direction', 'asc');
            $query->orderBy($request->sort, $direction);
        } else {
            $query->orderBy('created_at', 'desc'); // Orden por defecto
        }

        $users = $query
            ->with('role')
            ->withCount([
                'budgets as merch_budget_count',
                'pickingBudgets as picking_budget_count',
                'clients as clients_count',
            ])
            ->paginate(10)
            ->withQueryString();

        // Vendedores activos disponibles para reasignación al eliminar un usuario
        $availableSellers = User::withoutTrashed()
            ->whereHas('role', fn($q) => $q->whereIn('name', ['vendedor', 'admin']))
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return Inertia::render('dashboard/users/Index', [
            'users'            => $users,
            'availableSellers' => $availableSellers,
            'filters'          => [
                'search'    => $request->search,
                'sort'      => $request->sort,
                'direction' => $request->direction,
            ],
        ]);
    }

    public function create()
    {
        // Obtener roles disponibles para el select
        $roles = Role::all();

        return inertia('dashboard/users/Create', [
            'roles' => $roles
        ]);
    }

    public function store(StoreUserRequest $request)
    {
        $validated = $request->validated();

        try {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role_id' => $validated['role_id'],
                'email_verified_at' => now(),
                'accepts_budget_assignments' => $validated['accepts_budget_assignments'] ?? true,
            ]);

            return redirect()->back()->with('success', "Usuario '{$user->name}' creado correctamente.");
        } catch (\Exception $e) {
            Log::error('Error al crear usuario: ' . $e->getMessage());

            return redirect()->back()->with('error', 'Ocurrió un error al crear el usuario. Inténtalo de nuevo.');
        }
    }

    public function edit(User $user)
    {
        // Obtener roles disponibles para el select
        $roles = Role::all();

        return inertia('dashboard/users/Edit', [
            'user' => $user,
            'roles' => $roles
        ]);
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $validated = $request->validated();

        try {
            $updateData = [
                'name' => $validated['name'],
                'email' => $validated['email'],
                'role_id' => $validated['role_id'],
                'accepts_budget_assignments' => $validated['accepts_budget_assignments'] ?? true,
            ];

            // Solo actualizar la contraseña si se proporciona
            if (!empty($validated['password'])) {
                $updateData['password'] = Hash::make($validated['password']);
            }

            // Manejar verificación manual del email
            if ($request->boolean('manual_verification') && !$user->hasVerifiedEmail()) {
                $user->markEmailAsVerified();
            }

            $user->update($updateData);

            return redirect()->back()->with('success', "Usuario '{$user->name}' actualizado correctamente.");
        } catch (\Exception $e) {
            Log::error('Error al actualizar usuario: ' . $e->getMessage());

            return redirect()->back()->with('error', 'Ocurrió un error al actualizar el usuario. Inténtalo de nuevo.');
        }
    }

    public function destroy(Request $request, User $user)
    {
        try {
            // Verificar que no sea el usuario actual
            if ($user->id === Auth::id()) {
                return redirect()->back()->with('error', 'No puedes eliminar tu propia cuenta.');
            }

            // Verificar que no sea el último administrador del sistema
            if ($user->role && $user->role->name === 'admin' && User::whereHas('role', function ($q) {
                $q->where('name', 'admin');
            })->count() <= 1) {
                return redirect()->back()->with('error', 'No puedes eliminar el último administrador del sistema.');
            }

            // Verificar si el usuario tiene registros asignados
            $hasMerch    = $user->budgets()->exists();
            $hasPicking  = $user->pickingBudgets()->exists();
            $hasClients  = $user->clients()->exists();

            if ($hasMerch || $hasPicking || $hasClients) {
                $reassignToId = (int) $request->input('reassign_to');

                if (!$reassignToId) {
                    return redirect()->back()->with('error', 'Debés seleccionar un vendedor para reasignar los registros antes de eliminar.');
                }

                $reassignTo = User::withoutTrashed()->find($reassignToId);

                if (!$reassignTo || $reassignTo->id === $user->id) {
                    return redirect()->back()->with('error', 'El vendedor seleccionado para reasignación no es válido.');
                }

                DB::transaction(function () use ($user, $reassignTo) {
                    Budget::where('user_id', $user->id)
                        ->update(['user_id' => $reassignTo->id]);

                    PickingBudget::where('vendor_id', $user->id)
                        ->update(['vendor_id' => $reassignTo->id]);

                    Client::where('user_id', $user->id)
                        ->update(['user_id' => $reassignTo->id]);

                    $user->delete();
                });

                Log::info('Usuario eliminado con reasignación de registros', [
                    'deleted_user_id'       => $user->id,
                    'reassigned_to_user_id' => $reassignTo->id,
                    'merch_budgets'         => $hasMerch,
                    'picking_budgets'       => $hasPicking,
                    'clients'               => $hasClients,
                ]);
            } else {
                $user->delete();

                Log::info('Usuario eliminado sin registros asignados', [
                    'deleted_user_id' => $user->id,
                ]);
            }

            return redirect()->back()->with('success', "Usuario '{$user->name}' eliminado correctamente.");
        } catch (\Exception $e) {
            Log::error('Error al eliminar usuario: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Ocurrió un error al eliminar el usuario. Inténtalo de nuevo.');
        }
    }
}
