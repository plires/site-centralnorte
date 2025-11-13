<?php

namespace Database\Factories;

use App\Models\PickingCostScale;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PickingCostScale>
 */
class PickingCostScaleFactory extends Factory
{
    protected $model = PickingCostScale::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $quantityFrom = fake()->randomElement([25, 50, 100, 250, 500, 1000]);
        
        return [
            'quantity_from' => $quantityFrom,
            'quantity_to' => fake()->boolean(80) ? $quantityFrom + fake()->numberBetween(50, 500) : null,
            'cost_without_assembly' => fake()->randomFloat(2, 10, 50),
            'cost_with_assembly' => fake()->randomFloat(2, 15, 60),
            'palletizing_without_pallet' => fake()->randomFloat(2, 1, 10),
            'palletizing_with_pallet' => fake()->randomFloat(2, 5, 25),
            'cost_with_labeling' => fake()->randomFloat(2, 5, 15),
            'cost_without_labeling' => fake()->randomFloat(2, 0.5, 2),
            'additional_assembly' => fake()->randomFloat(2, 2, 10),
            'quality_control' => fake()->randomFloat(2, 3, 10),
            'dome_sticking_unit' => fake()->randomFloat(2, 5, 20),
            'shavings_50g_unit' => fake()->randomFloat(2, 15, 25),
            'shavings_100g_unit' => fake()->randomFloat(2, 25, 35),
            'shavings_200g_unit' => fake()->randomFloat(2, 30, 45),
            'bag_10x15_unit' => fake()->randomFloat(2, 5, 10),
            'bag_20x30_unit' => fake()->randomFloat(2, 10, 15),
            'bag_35x45_unit' => fake()->randomFloat(2, 15, 20),
            'bubble_wrap_5x10_unit' => fake()->randomFloat(2, 5, 15),
            'bubble_wrap_10x15_unit' => fake()->randomFloat(2, 10, 20),
            'bubble_wrap_20x30_unit' => fake()->randomFloat(2, 15, 25),
            'production_time' => fake()->randomElement(['24 hs', '48 hs', '72 hs', '3 dias', '5 dias', '7 dias']),
            'is_active' => true,
        ];
    }

    /**
     * Indicate that the cost scale is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
