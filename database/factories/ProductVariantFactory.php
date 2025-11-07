<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ProductVariant>
 */
class ProductVariantFactory extends Factory
{
  protected $model = ProductVariant::class;

  /**
   * Define the model's default state.
   *
   * @return array<string, mixed>
   */
  public function definition(): array
  {
    $variantType = $this->faker->randomElement([
      ProductVariant::TYPE_APPAREL,
      ProductVariant::TYPE_STANDARD
    ]);

    $baseData = [
      'product_id' => Product::factory(),
      'external_id' => $this->faker->optional(0.8)->numerify('####'),
      'sku' => $this->faker->unique()->bothify('??########??##'),
      'stock' => $this->faker->numberBetween(0, 1000),
      'variant_type' => $variantType,
      'primary_color' => $this->faker->hexColor(),
      'secondary_color' => $this->faker->hexColor(),
    ];

    if ($variantType === ProductVariant::TYPE_APPAREL) {
      return array_merge($baseData, [
        'size' => $this->faker->randomElement(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
        'color' => $this->faker->randomElement(['Rojo', 'Azul', 'Verde', 'Negro', 'Blanco', 'Gris']),
        'primary_color_text' => null,
        'secondary_color_text' => null,
        'material_text' => null,
      ]);
    }

    // Standard variant
    return array_merge($baseData, [
      'size' => null,
      'color' => null,
      'primary_color_text' => $this->faker->words(2, true),
      'secondary_color_text' => $this->faker->words(2, true),
      'material_text' => $this->faker->randomElement(['Algodón', 'Poliéster', 'Friselina', 'Nylon']),
    ]);
  }

  /**
   * State para crear variante tipo Apparel
   */
  public function apparel(): static
  {
    return $this->state(fn(array $attributes) => [
      'variant_type' => ProductVariant::TYPE_APPAREL,
      'size' => $this->faker->randomElement(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
      'color' => $this->faker->randomElement(['Rojo', 'Azul', 'Verde', 'Negro', 'Blanco', 'Gris']),
      'primary_color_text' => null,
      'secondary_color_text' => null,
      'material_text' => null,
    ]);
  }

  /**
   * State para crear variante tipo Standard
   */
  public function standard(): static
  {
    return $this->state(fn(array $attributes) => [
      'variant_type' => ProductVariant::TYPE_STANDARD,
      'size' => null,
      'color' => null,
      'primary_color_text' => $this->faker->words(2, true),
      'secondary_color_text' => $this->faker->words(2, true),
      'material_text' => $this->faker->randomElement(['Algodón', 'Poliéster', 'Friselina', 'Nylon']),
    ]);
  }

  /**
   * State para crear variante con stock
   */
  public function inStock(): static
  {
    return $this->state(fn(array $attributes) => [
      'stock' => $this->faker->numberBetween(10, 1000),
    ]);
  }

  /**
   * State para crear variante sin stock
   */
  public function outOfStock(): static
  {
    return $this->state(fn(array $attributes) => [
      'stock' => 0,
    ]);
  }
}
