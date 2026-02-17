<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear rol admin
        Role::updateOrCreate(
            ['name' => 'admin'],
            ['is_system' => true]
        );

        // Crear rol vendedor
        Role::updateOrCreate(
            ['name' => 'vendedor'],
            ['is_system' => true]
        );

        // Crear rol diseñador
        Role::updateOrCreate(
            ['name' => 'design'],
            ['is_system' => true]
        );
    }
}
