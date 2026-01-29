<?php

namespace Database\Seeders;

use App\Models\Slide;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class SlideSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear 5 slides activos con orden secuencial
        $slides = [
            [
                'title' => 'Bienvenidos a Central Norte',
                'image_desktop' => 'https://placehold.co/1920x850/3d5095/FFFFFF?text=Slide+1',
                'image_mobile' => 'https://placehold.co/580x630/3d5095/FFFFFF?text=Slide+1',
                'link' => null,
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'title' => 'Productos de Merchandising',
                'image_desktop' => 'https://placehold.co/1920x850/19ac90/FFFFFF?text=Slide+2',
                'image_mobile' => 'https://placehold.co/580x630/19ac90/FFFFFF?text=Slide+2',
                'link' => '/productos',
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'title' => 'Servicios de Picking y Kitting',
                'image_desktop' => 'https://placehold.co/1920x850/FF6B35/FFFFFF?text=Slide+3',
                'image_mobile' => 'https://placehold.co/580x630/FF6B35/FFFFFF?text=Slide+3',
                'link' => '/servicios',
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'title' => 'Cotizá tu proyecto',
                'image_desktop' => 'https://placehold.co/1920x850/7B68EE/FFFFFF?text=Slide+4',
                'image_mobile' => 'https://placehold.co/580x630/7B68EE/FFFFFF?text=Slide+4',
                'link' => '/contacto',
                'is_active' => true,
                'sort_order' => 4,
            ],
            [
                'title' => 'Conocé nuestra trayectoria',
                'image_desktop' => 'https://placehold.co/1920x850/2C3E50/FFFFFF?text=Slide+5',
                'image_mobile' => 'https://placehold.co/580x630/2C3E50/FFFFFF?text=Slide+5',
                'link' => '/nosotros',
                'is_active' => true,
                'sort_order' => 5,
            ],
        ];

        foreach ($slides as $slideData) {
            Slide::create($slideData);
        }

        // Crear 2 slides adicionales inactivos para pruebas
        Slide::factory()->inactive()->create([
            'title' => 'Promoción de Verano (Inactivo)',
            'sort_order' => 6,
        ]);

        Slide::factory()->inactive()->create([
            'title' => 'Black Friday (Inactivo)',
            'sort_order' => 7,
        ]);
    }
}
