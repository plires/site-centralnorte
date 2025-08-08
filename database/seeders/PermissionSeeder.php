<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permDashboard = Permission::create(['name' => 'ver_dashboard']);
        $permUsers = Permission::create(['name' => 'gestionar_usuarios']);
        $permClientes = Permission::create(['name' => 'gestionar_clientes']);
        $permRoles = Permission::create(['name' => 'gestionar_roles']);
        $permProducts = Permission::create(['name' => 'gestionar_productos']);
        $permCategories = Permission::create(['name' => 'gestionar_categorias']);
        $permProductImages = Permission::create(['name' => 'gestionar_imagenes_de_productos']);
        $permPresupuestosMerch = Permission::create(['name' => 'gestionar_presupuestos_merch']);
        $permPresupuestosPick = Permission::create(['name' => 'gestionar_presupuestos_pick']);
        $permSlides = Permission::create(['name' => 'gestionar_slides']);
        $permBlog = Permission::create(['name' => 'gestionar_blog']);

        $admin = Role::where('name', 'admin')->first();
        $admin->permissions()->attach([$permDashboard->id, $permUsers->id, $permClientes->id, $permRoles->id, $permProducts->id, $permCategories->id, $permProductImages->id, $permPresupuestosMerch->id, $permPresupuestosPick->id, $permSlides->id, $permBlog->id]);

        $seller = Role::where('name', 'vendedor')->first();
        $seller->permissions()->attach([$permDashboard->id, $permProducts->id, $permCategories->id, $permProductImages->id, $permPresupuestosMerch->id, $permPresupuestosPick->id]);

        $design = Role::where('name', 'design')->first();
        $design->permissions()->attach([$permSlides->id, $permBlog->id]);
    }
}
