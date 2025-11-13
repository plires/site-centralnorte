<?php

namespace Database\Seeders;

use App\Models\PickingComponentIncrement;
use Illuminate\Database\Seeder;

class PickingComponentIncrementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $increments = [
            [
                'components_from' => 1,
                'components_to' => 3,
                'description' => '1 a 3 componentes',
                'percentage' => 0.00, // 0%
            ],
            [
                'components_from' => 4,
                'components_to' => 6,
                'description' => '4 a 6 componentes',
                'percentage' => 0.10, // 10%
            ],
            [
                'components_from' => 7,
                'components_to' => 10,
                'description' => '7 a 10 componentes',
                'percentage' => 0.20, // 20%
            ],
            [
                'components_from' => 11,
                'components_to' => 15,
                'description' => '11 a 15 componentes',
                'percentage' => 0.30, // 30%
            ],
            [
                'components_from' => 16,
                'components_to' => null, // "o más"
                'description' => '16 o más componentes',
                'percentage' => 0.40, // 40%
            ],
        ];

        foreach ($increments as $increment) {
            PickingComponentIncrement::create(array_merge($increment, ['is_active' => true]));
        }

        $this->command->info('✓ ' . count($increments) . ' incrementos por componentes creados correctamente');
    }
}
