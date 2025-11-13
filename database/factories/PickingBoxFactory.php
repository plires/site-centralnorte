<?php

namespace Database\Factories;

use App\Models\PickingBox;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PickingBox>
 */
class PickingBoxFactory extends Factory
{
    protected $model = PickingBox::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $sizes = [200, 250, 300, 350, 400, 450, 500, 550, 600];
        
        $width = fake()->randomElement($sizes);
        $height = fake()->randomElement($sizes);
        $depth = fake()->randomElement($sizes);
        
        return [
            'dimensions' => "{$width} x {$height} x {$depth}",
            'cost' => fake()->randomFloat(2, 50, 350),
            'is_active' => true,
        ];
    }

    /**
     * Indicate that the box is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
