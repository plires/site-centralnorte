<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Database\Seeders\AdminUserSeeder;
use Database\Seeders\BudgetItemSeeder;
use Database\Seeders\BudgetSeeder;
use Database\Seeders\CategorySeeder;
use Database\Seeders\ClientSeeder;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\PickingBoxSeeder;
use Database\Seeders\PickingBudgetSeeder;
use Database\Seeders\PickingComponentIncrementSeeder;
use Database\Seeders\PickingCostScaleSeeder;
use Database\Seeders\PickingPaymentConditionSeeder;
use Database\Seeders\ProductAttributeSeeder;
use Database\Seeders\ProductImageSeeder;
use Database\Seeders\ProductSeeder;
use Database\Seeders\ProductVariantSeeder;
use Database\Seeders\RoleSeeder;
use Database\Seeders\SlideSeeder;
use Database\Seeders\VendedoresUserSeeder;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {

        $this->call([
            // CategorySeeder::class,
            RoleSeeder::class,
            AdminUserSeeder::class,
            // VendedoresUserSeeder::class,
            PermissionSeeder::class,
            // ProductSeeder::class,
            // ProductImageSeeder::class,
            // ProductAttributeSeeder::class,
            // ProductVariantSeeder::class,
            // ClientSeeder::class,
            // BudgetSeeder::class,
            // BudgetItemSeeder::class,
            PickingBoxSeeder::class,
            PickingCostScaleSeeder::class,
            PickingComponentIncrementSeeder::class,
            // PickingPaymentConditionSeeder::class,
            // PickingBudgetSeeder::class,
            SlideSeeder::class,
        ]);
    }
}
