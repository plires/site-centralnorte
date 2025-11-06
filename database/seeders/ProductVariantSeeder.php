<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Seeder;

class ProductVariantSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    $products = Product::all();

    foreach ($products as $product) {
      // Decidir aleatoriamente si es Apparel o Standard
      $isApparel = fake()->boolean(30); // 30% de probabilidad de ser Apparel

      // Cada producto tendrá entre 2 y 6 variantes
      $variantsCount = rand(2, 6);

      if ($isApparel) {
        // Crear variantes tipo Apparel
        ProductVariant::factory()
          ->apparel()
          ->count($variantsCount)
          ->create(['product_id' => $product->id]);
      } else {
        // Crear variantes tipo Standard
        ProductVariant::factory()
          ->standard()
          ->count($variantsCount)
          ->create(['product_id' => $product->id]);
      }
    }
  }
}
