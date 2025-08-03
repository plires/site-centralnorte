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
    public function show(Role $role)
    {
        $role->load(['permissions', 'users']);
        return Inertia::render('dashboard/roles/Show', [
            'role' => $role
        ]);
    }

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

    public function edit(Role $role)
    {
        // Obtener todos los permisos disponibles
        $permissions = Permission::all();

        // Obtener IDs de los permisos que ya tiene el rol
        $rolePermissions = $role->permissions->pluck('id');

        return inertia('dashboard/roles/Edit', [
            'role' => $role,
            'permissions' => $permissions,
            'rolePermissions' => $rolePermissions, // opcional si querés separar
        ]);
    }


    public function update(Request $request, Role $role)
    {
        $request->validate([
            'name' => 'required|unique:roles,name,' . $role->id,
            'permissions' => 'array'
        ]);

        try {
            $role->update(['name' => $request->name]);
            $role->permissions()->sync($request->permissions);
            return redirect()->back()->with('success', "Rol '{$role->name}' actualizado correctamente.");
        } catch (\Throwable $e) {
            Log::error('Error al actualizar rol: ' . $e->getMessage());

            return redirect()->back()->with('error', 'Ocurrió un error al actualizar el rol. Inténtalo de nuevo.');
        }
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
