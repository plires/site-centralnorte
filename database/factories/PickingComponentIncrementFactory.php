<?php

namespace Database\Factories;

use App\Models\PickingComponentIncrement;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PickingComponentIncrement>
 */
class PickingComponentIncrementFactory extends Factory
{
    protected $model = PickingComponentIncrement::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $componentsFrom = fake()->randomElement([1, 4, 7, 11, 16, 20]);
        $componentsTo = fake()->boolean(80) ? $componentsFrom + fake()->numberBetween(2, 5) : null;
        
        $description = $componentsTo 
            ? "{$componentsFrom} A {$componentsTo} componentes"
            : "{$componentsFrom} o mas componentes";
        
        return [
            'components_from' => $componentsFrom,
            'components_to' => $componentsTo,
            'description' => $description,
            'percentage' => fake()->randomElement([0.00, 0.10, 0.15, 0.20, 0.25, 0.30, 0.40]),
            'is_active' => true,
        ];
    }

    /**
     * Indicate that the component increment is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
