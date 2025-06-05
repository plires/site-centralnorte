<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminRole = Role::where('name', 'admin')->first();
        $sellerRole = Role::where('name', 'vendedor')->first();
        $designRole = Role::where('name', 'design')->first();

        User::factory()->create([
            'name' => 'Administrador',
            'email' => 'pablo@admin.com',
            'password' => Hash::make('123123123'),
            'role_id' => $adminRole->id,
        ]);

        User::factory()->create([
            'name' => 'Vendedor',
            'email' => 'pablo@vendedor.com',
            'password' => Hash::make('123123123'),
            'role_id' => $sellerRole->id,
        ]);

        User::factory()->create([
            'name' => 'Diseñador',
            'email' => 'pablo@design.com',
            'password' => Hash::make('123123123'),
            'role_id' => $designRole->id,
        ]);
    }
}
