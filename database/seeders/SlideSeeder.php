<?php

namespace Database\Seeders;

use App\Models\Slide;
use Illuminate\Database\Seeder;

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
                'title' => 'Experiencias hechas para vos',
                'image_desktop' => 'slides/desktop/slide-1-desktop.webp',
                'image_mobile' => 'slides/mobile/slide-1-mobile.webp',
                'link' => '/products',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'title' => 'Productos de Merchandising',
                'image_desktop' => 'slides/desktop/slide-2-desktop.webp',
                'image_mobile' => 'slides/mobile/slide-2-mobile.webp',
                'link' => '/products',
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'title' => 'Servicios de Picking y Kitting',
                'image_desktop' => 'slides/desktop/slide-3-desktop.webp',
                'image_mobile' => 'slides/mobile/slide-3-mobile.webp',
                'link' => '/products',
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'title' => 'Cotizá tu proyecto',
                'image_desktop' => 'slides/desktop/slide-4-desktop.webp',
                'image_mobile' => 'slides/mobile/slide-4-mobile.webp',
                'link' => '/products',
                'is_active' => true,
                'sort_order' => 4,
            ],
            [
                'title' => 'Conocé nuestra trayectoria',
                'image_desktop' => 'slides/desktop/slide-5-desktop.webp',
                'image_mobile' => 'slides/mobile/slide-5-mobile.webp',
                'link' => '/products',
                'is_active' => true,
                'sort_order' => 5,
            ],
        ];

        foreach ($slides as $slideData) {
            Slide::create($slideData);
        }
    }
}
