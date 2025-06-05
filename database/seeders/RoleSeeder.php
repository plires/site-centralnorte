<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        // Crear rol admin
        Role::factory(1)->create([
            'name' => 'admin',
        ]);

        // Crear rol vendedor
        Role::factory(1)->create([
            'name' => 'vendedor',
        ]);

        // Crear rol diseñador
        Role::factory(1)->create([
            'name' => 'design',
        ]);
    }
}
