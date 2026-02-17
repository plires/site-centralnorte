<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permUsers             = Permission::firstOrCreate(['name' => 'gestionar_usuarios']);
        $permClientes          = Permission::firstOrCreate(['name' => 'gestionar_clientes']);
        $permRoles             = Permission::firstOrCreate(['name' => 'gestionar_roles']);
        $permProducts          = Permission::firstOrCreate(['name' => 'gestionar_productos']);
        $permCategories        = Permission::firstOrCreate(['name' => 'gestionar_categorias']);
        $permProductImages     = Permission::firstOrCreate(['name' => 'gestionar_imagenes_de_productos']);
        $permPresupuestosMerch = Permission::firstOrCreate(['name' => 'gestionar_presupuestos_merch']);
        $permPresupuestosPick  = Permission::firstOrCreate(['name' => 'gestionar_presupuestos_pick']);
        $permCostosPick        = Permission::firstOrCreate(['name' => 'gestionar_costos_pick']);
        $permSlides            = Permission::firstOrCreate(['name' => 'gestionar_slides']);

        $admin = Role::where('name', 'admin')->first();
        $admin->permissions()->syncWithoutDetaching([
            $permUsers->id,
            $permClientes->id,
            $permRoles->id,
            $permProducts->id,
            $permCategories->id,
            $permProductImages->id,
            $permPresupuestosMerch->id,
            $permPresupuestosPick->id,
            $permCostosPick->id,
            $permSlides->id,
        ]);

        $seller = Role::where('name', 'vendedor')->first();
        $seller->permissions()->syncWithoutDetaching([
            $permProducts->id,
            $permCategories->id,
            $permProductImages->id,
            $permPresupuestosMerch->id,
            $permPresupuestosPick->id,
        ]);

        $design = Role::where('name', 'design')->first();
        $design->permissions()->syncWithoutDetaching([
            $permSlides->id,
        ]);
    }
}
