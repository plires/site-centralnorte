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

        User::factory()->create([
            'name' => 'Administrador',
            'email' => 'pablo@gmail.com',
            'password' => Hash::make('123123123'),
            'role_id' => $adminRole->id,
        ]);
    }
}
