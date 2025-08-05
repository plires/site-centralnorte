<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class ProductImageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = Product::all();

        foreach ($products as $product) {
            // Cantidad aleatoria de imágenes por producto
            $imagesCount = rand(1, 4);

            // Crear las imágenes (todas con is_featured = false)
            $images = ProductImage::factory()
                ->count($imagesCount)
                ->create(['product_id' => $product->id]);

            // Marcar una aleatoria como destacada
            if ($images->isNotEmpty()) {
                $images->random()->update(['is_featured' => true]);
            }
        }
    }
}
