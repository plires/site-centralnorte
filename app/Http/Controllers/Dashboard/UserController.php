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

class UserController extends Controller
{
    public function index(Request $request)
    {

        $query = User::where('id', '!=', Auth::id());
        // $query->with('role');

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

        $users = $query->with('role')->paginate(5)->withQueryString();

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

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role_id' => ['required', 'exists:roles,id'],
        ], [
            'name.required' => 'El nombre es obligatorio.',
            'email.required' => 'El email es obligatorio.',
            'email.unique' => 'Este email ya está registrado.',
            'password.required' => 'La contraseña es obligatoria.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
            'role_id.required' => 'Debes seleccionar un rol.',
            'role_id.exists' => 'El rol seleccionado no es válido.',
        ]);


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
        $roles = Role::all();
        return inertia('dashboard/users/Edit', [
            'user' => $user->load('role'),
            'roles' => $roles,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required',
            'email' => "required|email|unique:users,email,{$user->id}",
            'role_id' => 'required|exists:roles,id',
        ]);

        $user->update($request->only(['name', 'email', 'role_id']));

        return redirect()->route('dashboard.users.index');
    }

    public function destroy(User $user)
    {
        try {
            // Verificar que no sea el usuario actual
            if ($user->id === Auth::id()) {
                return redirect()->back()->with('error', 'No puedes eliminar tu propia cuenta.');
            }

            // Verificar que no sea un administrador (opcional)
            if ($user->role && $user->role->name === 'admin' && User::whereHas('role', function ($q) {
                $q->where('name', 'admin');
            })->count() <= 1) {
                return redirect()->back()->with('error', 'No puedes eliminar el último administrador del sistema.');
            }

            // Opcional: Soft delete en lugar de eliminación completa
            $user->delete();

            return redirect()->back()->with('success', "Usuario '{$user->name}' eliminado correctamente.");
        } catch (\Exception $e) {
            Log::error('Error al eliminar usuario: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Ocurrió un error al eliminar el usuario. Inténtalo de nuevo.');
        }
    }
}
