<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear categorías predefinidas más realistas
        $categories = [
            ['name' => 'Merchandising', 'description' => 'Productos promocionales generales', 'origin' => 'local'],
            ['name' => 'Tecnología', 'description' => 'Gadgets y accesorios tecnológicos', 'origin' => 'local'],
            ['name' => 'Indumentaria', 'description' => 'Remeras, gorras y ropa corporativa', 'origin' => 'local'],
            ['name' => 'Oficina', 'description' => 'Útiles y artículos de oficina', 'origin' => 'local'],
            ['name' => 'Bebidas', 'description' => 'Termos, tazas y botellas', 'origin' => 'local'],
        ];

        foreach ($categories as $category) {
            \App\Models\Category::firstOrCreate(
                ['name' => $category['name']],
                ['description' => $category['description']],
                ['origin' => $category['origin']]
            );
        }
    }
}
