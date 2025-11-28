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
use Database\Seeders\PickingBoxSeeder;
use Database\Seeders\ProductImageSeeder;
use Database\Seeders\ProductVariantSeeder;
use Database\Seeders\VendedoresUserSeeder;
use Database\Seeders\PickingCostScaleSeeder;
use Database\Seeders\ProductAttributeSeeder;
use Database\Seeders\SimplePickingBudgetSeeder;
use Database\Seeders\PickingPaymentConditionSeeder;
use Database\Seeders\PickingComponentIncrementSeeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {

        $this->call([
            CategorySeeder::class,
            RoleSeeder::class,
            AdminUserSeeder::class,
            VendedoresUserSeeder::class,
            PermissionSeeder::class,
            ProductSeeder::class,
            ProductImageSeeder::class,
            ProductAttributeSeeder::class,
            ProductVariantSeeder::class,
            ClientSeeder::class,
            BudgetSeeder::class,
            BudgetItemSeeder::class,
            PickingBoxSeeder::class,
            PickingCostScaleSeeder::class,
            PickingComponentIncrementSeeder::class,
            PickingPaymentConditionSeeder::class,
            SimplePickingBudgetSeeder::class,
        ]);
    }
}
