<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Database\Seeders\RoleSeeder;
use Database\Seeders\BudgetSeeder;
use Database\Seeders\ClientSeeder;
use Database\Seeders\AdminUserSeeder;
use Database\Seeders\BudgetItemSeeder;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\ProductImageSeeder;
use Database\Seeders\VendedoresUserSeeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {

        $this->call([
            RoleSeeder::class,
            AdminUserSeeder::class,
            VendedoresUserSeeder::class,
            PermissionSeeder::class,
            CategorySeeder::class,
            ProductSeeder::class,
            ProductImageSeeder::class,
            ClientSeeder::class,
            BudgetSeeder::class,
            BudgetItemSeeder::class,
        ]);
    }
}
