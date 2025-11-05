<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'sku' => strtoupper($this->faker->unique()->bothify('SKU-####')),
            'name' => $this->faker->words(3, true),
            'description' => $this->faker->sentence(),
            'proveedor' => $this->faker->company,
            'last_price' => $this->faker->randomFloat(2, 1000, 50000),
        ];
    }

    // Método para adjuntar categorías después de crear el producto
    public function withCategories(int $count = null)
    {
        return $this->afterCreating(function ($product) use ($count) {
            $categoriesToAttach = $count ?? rand(1, 3);

            // Si no hay categorías, crear algunas
            if (Category::count() === 0) {
                Category::factory()->count(5)->create();
            }

            $categories = Category::inRandomOrder()
                ->limit($categoriesToAttach)
                ->pluck('id');

            $product->categories()->attach($categories);
        });
    }
}
