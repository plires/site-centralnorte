<?php

namespace App\Http\Controllers\Dashboard;

use App\Models\Role;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

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
        $roles = Role::all();
        return inertia('dashboard/users/Create', ['roles' => $roles]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6|confirmed',
            'role_id' => 'required|exists:roles,id',
        ]);

        User::create([
            ...$request->only(['name', 'email', 'role_id']),
            'password' => bcrypt($request->password),
        ]);

        return redirect()->route('dashboard.users.index');
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
