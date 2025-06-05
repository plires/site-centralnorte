<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class VendedoresUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        $vendedorRole = Role::where('name', 'vendedor')->first();
        // Crear 20 vendedores
        User::factory(20)->create([
            'password' => Hash::make('123123123'),
            'role_id' => $vendedorRole->id,
        ]);
    }
}
