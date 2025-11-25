<?php

namespace Database\Factories;

use App\Models\PickingPaymentCondition;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PickingPaymentCondition>
 */
class PickingPaymentConditionFactory extends Factory
{
    protected $model = PickingPaymentCondition::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $conditions = [
            'Contado',
            '7 días',
            '15 días',
            '30 días',
            '45 días',
            '60 días',
            '90 días',
            'Anticipo 50%',
        ];
        
        return [
            'description' => fake()->randomElement($conditions),
            'percentage' => fake()->randomFloat(2, -15, 15), // Rango de -15% a +15%
            'is_active' => true,
        ];
    }

    /**
     * Indicate that the payment condition is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Indicate that the payment condition has a discount (negative percentage).
     */
    public function withDiscount(): static
    {
        return $this->state(fn (array $attributes) => [
            'percentage' => fake()->randomFloat(2, -15, -1),
        ]);
    }

    /**
     * Indicate that the payment condition has a surcharge (positive percentage).
     */
    public function withSurcharge(): static
    {
        return $this->state(fn (array $attributes) => [
            'percentage' => fake()->randomFloat(2, 1, 15),
        ]);
    }
}
