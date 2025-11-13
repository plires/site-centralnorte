<?php

namespace Database\Seeders;

use App\Models\PickingBox;
use Illuminate\Database\Seeder;

class PickingBoxSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $boxes = [
            ['dimensions' => '200 x 200 x 100', 'cost' => 49.80],
            ['dimensions' => '200 x 200 x 200', 'cost' => 61.50],
            ['dimensions' => '300 x 200 x 200', 'cost' => 74.48],
            ['dimensions' => '300 x 300 x 200', 'cost' => 112.26],
            ['dimensions' => '300 x 300 x 300', 'cost' => 132.30],
            ['dimensions' => '300 x 250 x 250', 'cost' => 102.87],
            ['dimensions' => '350 x 250 x 150', 'cost' => 87.65],
            ['dimensions' => '350 x 250 x 250', 'cost' => 112.26],
            ['dimensions' => '350 x 250 x 300', 'cost' => 122.67],
            ['dimensions' => '400 x 300 x 200', 'cost' => 126.95],
            ['dimensions' => '400 x 200 x 200', 'cost' => 87.65],
            ['dimensions' => '400 x 300 x 300', 'cost' => 151.38],
            ['dimensions' => '400 x 400 x 300', 'cost' => 191.96],
            ['dimensions' => '400 x 400 x 400', 'cost' => 219.65],
            ['dimensions' => '450 x 300 x 200', 'cost' => 139.44],
            ['dimensions' => '450 x 300 x 300', 'cost' => 162.86],
            ['dimensions' => '500 x 300 x 300', 'cost' => 170.54],
            ['dimensions' => '500 x 400 x 300', 'cost' => 216.27],
            ['dimensions' => '500 x 400 x 400', 'cost' => 246.15],
            ['dimensions' => '500 x 500 x 500', 'cost' => 340.92],
            ['dimensions' => '550 x 350 x 350', 'cost' => 216.27],
            ['dimensions' => '600 x 400 x 400', 'cost' => 273.29],
            ['dimensions' => '600 x 300 x 300', 'cost' => 185.43],
            ['dimensions' => '600 x 400 x 300', 'cost' => 238.17],
            ['dimensions' => '600 x 400 x 200', 'cost' => 204.65],
            ['dimensions' => '600 x 400 x 500', 'cost' => 306.45],
        ];

        foreach ($boxes as $box) {
            PickingBox::create([
                'dimensions' => $box['dimensions'],
                'cost' => $box['cost'],
                'is_active' => true,
            ]);
        }

        $this->command->info('✓ ' . count($boxes) . ' cajas creadas correctamente');
    }
}
