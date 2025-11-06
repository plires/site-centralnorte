<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductAttribute;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ProductAttribute>
 */
class ProductAttributeFactory extends Factory
{
  protected $model = ProductAttribute::class;

  /**
   * Define the model's default state.
   *
   * @return array<string, mixed>
   */
  public function definition(): array
  {
    $attributeTypes = [
      'Marca' => ['Tahg', 'Nike', 'Adidas', 'Puma', 'Reebok', 'Under Armour'],
      'Técnica de aplicación' => ['Serigrafía', 'Bordado', 'Transfer', 'Sublimación', 'Transfer full color'],
      'Material' => ['Algodón', 'Poliéster', 'Friselina', 'Nylon', 'Mezcla', 'Licra'],
      'Color' => ['Rojo', 'Azul', 'Verde', 'Negro', 'Blanco', 'Gris', 'Amarillo'],
      'Tamaño' => ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    ];

    $attributeName = $this->faker->randomElement(array_keys($attributeTypes));
    $value = $this->faker->randomElement($attributeTypes[$attributeName]);

    return [
      'product_id' => Product::factory(),
      'external_id' => $this->faker->optional(0.8)->numerify('####'),
      'attribute_name' => $attributeName,
      'value' => $value,
    ];
  }

  /**
   * State para crear atributo de tipo Marca
   */
  public function marca(): static
  {
    return $this->state(fn(array $attributes) => [
      'attribute_name' => 'Marca',
      'value' => $this->faker->randomElement(['Tahg', 'Nike', 'Adidas', 'Puma']),
    ]);
  }

  /**
   * State para crear atributo de tipo Técnica
   */
  public function tecnica(): static
  {
    return $this->state(fn(array $attributes) => [
      'attribute_name' => 'Técnica de aplicación',
      'value' => $this->faker->randomElement(['Serigrafía', 'Bordado', 'Transfer', 'Sublimación']),
    ]);
  }
}
