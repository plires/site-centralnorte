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
            ['name' => 'Merchandising', 'description' => 'Productos promocionales generales'],
            ['name' => 'Tecnología', 'description' => 'Gadgets y accesorios tecnológicos'],
            ['name' => 'Indumentaria', 'description' => 'Remeras, gorras y ropa corporativa'],
            ['name' => 'Oficina', 'description' => 'Útiles y artículos de oficina'],
            ['name' => 'Bebidas', 'description' => 'Termos, tazas y botellas'],
            ['name' => 'Productos Importados', 'description' => 'Sincronizados desde API externa'],
        ];

        foreach ($categories as $category) {
            \App\Models\Category::firstOrCreate(
                ['name' => $category['name']],
                ['description' => $category['description']]
            );
        }
    }
}
