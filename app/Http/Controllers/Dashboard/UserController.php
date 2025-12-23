<?php

namespace App\Http\Controllers\Dashboard;

use App\Models\Role;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;
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

        $query = User::withoutTrashed()->where('id', '!=', Auth::id());

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

        $users = $query->with('role')->paginate(10)->withQueryString();

        return Inertia::render('dashboard/users/Index', [
            'users' => $users,
            'filters' => [
                'search' => $request->search,
                'sort' => $request->sort,
                'direction' => $request->direction,
            ]
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
                'email_verified_at' => now(), // O null si quieres que verifiquen email
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

    public function destroy(User $user)
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

            $user->delete();

            return redirect()->back()->with('success', "Usuario '{$user->name}' eliminado correctamente.");
        } catch (\Exception $e) {
            Log::error('Error al eliminar usuario: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Ocurrió un error al eliminar el usuario. Inténtalo de nuevo.');
        }
    }
}
