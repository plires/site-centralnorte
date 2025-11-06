<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductAttribute;
use Illuminate\Database\Seeder;

class ProductAttributeSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    $products = Product::all();

    foreach ($products as $product) {
      // Cada producto tendrá entre 2 y 5 atributos aleatorios
      $attributesCount = rand(2, 5);

      // Asegurar que al menos tenga una Marca
      ProductAttribute::factory()
        ->marca()
        ->create(['product_id' => $product->id]);

      // Crear el resto de atributos aleatorios
      ProductAttribute::factory()
        ->count($attributesCount - 1)
        ->create(['product_id' => $product->id]);
    }
  }
}
