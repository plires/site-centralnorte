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

        $width = 600;
        $height = 600;
        $bgColor = $this->faker->hexColor(); // Sin #
        $textColor = 'FFFFFF';
        $text = urlencode($this->faker->word());

        // https://placehold.co/600x600/000000/FFFFFF.jpg

        return [
            'product_id' => Product::factory(), // O asignalo manualmente en el seeder
            'url' => "https://placehold.co/{$width}x{$height}/" . ltrim($bgColor, '#') . "/{$textColor}?text={$text}",
            'is_featured' => false,
        ];
    }
}
