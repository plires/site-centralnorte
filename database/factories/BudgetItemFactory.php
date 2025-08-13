<?php

namespace Database\Factories;

use App\Models\Budget;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\BudgetItem>
 */
class BudgetItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Opciones realistas para impresión de logo
        $logoOptions = [
            'Serigrafía 1 color',
            'Serigrafía 2 colores',
            'Bordado',
            'Tampografía',
            'Transfer térmico',
            'Grabado láser',
            'Impresión digital',
            'Sin impresión',
            'Etiqueta cosida',
            'Vinilo adhesivo'
        ];

        return [
            'budget_id' => Budget::factory(),
            'product_id' => Product::factory(),
            'quantity' => $this->faker->numberBetween(50, 1000),
            'unit_price' => $this->faker->randomFloat(2, 500, 15000),
            'production_time_days' => $this->faker->optional(0.8)->numberBetween(5, 30),
            'logo_printing' => $this->faker->optional(0.7)->randomElement($logoOptions),
            'line_total' => 0, // Se calcula automáticamente en el modelo
            'sort_order' => $this->faker->numberBetween(1, 10),
            'variant_group' => null, // Se asigna en casos específicos
            'is_variant' => false, // Por defecto no es variante
        ];
    }

    /**
     * Create item with existing budget and product.
     */
    public function forExistingData(): static
    {
        return $this->state(fn(array $attributes) => [
            'budget_id' => Budget::inRandomOrder()->first()?->id ?? Budget::factory(),
            'product_id' => Product::inRandomOrder()->first()?->id ?? Product::factory(),
        ]);
    }

    /**
     * Create a variant item.
     */
    public function variant(string $variantGroup = null): static
    {
        return $this->state(fn(array $attributes) => [
            'is_variant' => true,
            'variant_group' => $variantGroup ?? 'variant_' . $this->faker->unique()->numberBetween(1000, 9999),
        ]);
    }

    /**
     * Create item without logo printing.
     */
    public function withoutLogo(): static
    {
        return $this->state(fn(array $attributes) => [
            'logo_printing' => null,
        ]);
    }

    /**
     * Create item with specific logo printing.
     */
    public function withLogo(string $logoType = null): static
    {
        $logoOptions = [
            'Serigrafía 1 color',
            'Serigrafía 2 colores',
            'Bordado',
            'Tampografía',
            'Transfer térmico',
            'Grabado láser'
        ];

        return $this->state(fn(array $attributes) => [
            'logo_printing' => $logoType ?? $this->faker->randomElement($logoOptions),
        ]);
    }

    /**
     * Create item with high quantity (bulk order).
     */
    public function bulk(): static
    {
        return $this->state(fn(array $attributes) => [
            'quantity' => $this->faker->numberBetween(1000, 5000),
            'unit_price' => $this->faker->randomFloat(2, 300, 8000), // Precio más bajo por volumen
            'production_time_days' => $this->faker->numberBetween(15, 45), // Más tiempo por volumen
        ]);
    }

    /**
     * Create item with small quantity.
     */
    public function small(): static
    {
        return $this->state(fn(array $attributes) => [
            'quantity' => $this->faker->numberBetween(10, 100),
            'unit_price' => $this->faker->randomFloat(2, 1000, 20000), // Precio más alto por unidad
            'production_time_days' => $this->faker->numberBetween(3, 15),
        ]);
    }

    /**
     * Create item without production time.
     */
    public function inStock(): static
    {
        return $this->state(fn(array $attributes) => [
            'production_time_days' => null,
        ]);
    }

    /**
     * Create item with long production time.
     */
    public function customProduction(): static
    {
        return $this->state(fn(array $attributes) => [
            'production_time_days' => $this->faker->numberBetween(20, 60),
            'logo_printing' => $this->faker->randomElement([
                'Bordado personalizado',
                'Serigrafía multicolor',
                'Grabado láser detallado',
                'Impresión digital full color'
            ]),
        ]);
    }

    /**
     * Create item with specific sort order.
     */
    public function withOrder(int $order): static
    {
        return $this->state(fn(array $attributes) => [
            'sort_order' => $order,
        ]);
    }
}
