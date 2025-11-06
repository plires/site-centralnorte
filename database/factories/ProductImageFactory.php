<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ProductImage>
 */
class ProductImageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */

    protected $model = ProductImage::class;

    public function definition(): array
    {

        $width = 800;
        $height = 800;
        $bgColor = $this->faker->hexColor(); // Sin #
        $textColor = 'FFFFFF';
        $text = urlencode($this->faker->word());

        // Generar una variante aleatoria para testing
        $colors = ['Rojo', 'Azul', 'Verde', 'Negro', 'Blanco', 'Gris', 'Amarillo'];
        $materials = ['Algodón', 'Poliéster', 'Friselina', 'Nylon', 'Mezcla'];
        $variant = $this->faker->boolean(70) // 70% de probabilidad de tener variant
            ? $this->faker->randomElement($colors) . ' / ' .
            $this->faker->randomElement($colors) . ' / ' .
            $this->faker->randomElement($materials)
            : null;

        return [
            'product_id' => Product::factory(), // O asignalo manualmente en el seeder
            'url' => "https://placehold.co/{$width}x{$height}/" . ltrim($bgColor, '#') . "/{$textColor}?text={$text}",
            'is_featured' => false,
            'variant' => $variant
        ];
    }
}
