<?php

namespace Database\Seeders;

use App\Models\PickingPaymentCondition;
use Illuminate\Database\Seeder;

class PickingPaymentConditionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $conditions = [
            ['description' => 'Contado', 'percentage' => -5.00],
            ['description' => '7 días', 'percentage' => 0.00],
            ['description' => '15 días', 'percentage' => 2.00],
            ['description' => '30 días', 'percentage' => 5.00],
            ['description' => '45 días', 'percentage' => 7.50],
            ['description' => '60 días', 'percentage' => 10.00],
            ['description' => '90 días', 'percentage' => 15.00],
            ['description' => 'Anticipo 50%', 'percentage' => -3.00],
        ];

        foreach ($conditions as $condition) {
            PickingPaymentCondition::create([
                'description' => $condition['description'],
                'percentage' => $condition['percentage'],
                'is_active' => true,
            ]);
        }

        $this->command->info('✓ ' . count($conditions) . ' condiciones de pago creadas correctamente');
    }
}
