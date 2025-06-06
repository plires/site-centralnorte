<?php

namespace App\Http\Controllers\Dashboard;

use App\Models\Role;
use Inertia\Inertia;
use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;

class RoleController extends Controller
{
    public function index()
    {
        return Inertia::render('dashboard/roles/Index', [
            'roles' => Role::with('permissions')->get(),
            'permissions' => Permission::all()
        ]);
    }

    public function create()
    {
        $roles = Role::all();

        return inertia('dashboard/roles/Create', [
            'roles' => Role::with('permissions')->get(),
            'permissions' => Permission::all()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|unique:roles,name',
            'permissions' => 'array'
        ]);

        $role = Role::create(['name' => $request->name]);
        $role->permissions()->sync($request->permissions);

        return redirect()->back();
    }

    public function update(Request $request, Role $role)
    {
        $request->validate([
            'name' => 'required|unique:roles,name,' . $role->id,
            'permissions' => 'array'
        ]);

        $role->update(['name' => $request->name]);
        $role->permissions()->sync($request->permissions);

        return redirect()->back();
    }

    public function destroy(Role $role)
    {
        try {
            // Opcional: Soft delete en lugar de eliminación completa
            $role->delete();

            return redirect()->back()->with('success', "Rol '{$role->name}' eliminado correctamente.");
        } catch (\Exception $e) {
            Log::error('Error al eliminar el rol: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Ocurrió un error al eliminar el rol. Inténtalo de nuevo.');
        }
    }
}
