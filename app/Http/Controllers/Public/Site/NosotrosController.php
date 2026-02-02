<?php

namespace App\Http\Controllers\Public\Site;

use Inertia\Inertia;
use App\Models\Category;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class NosotrosController extends Controller
{
    public function index()
    {
        // Obtener productos de la categoría "Próximos Arribos"
        $novedades = Category::where('name', 'Próximos Arribos')
            ->first()
            ?->products()
            ->with(['featuredImage'])
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'description' => $product->description,
                    'image' => $product->featuredImage?->url ?? null,
                ];
            }) ?? collect();

        return Inertia::render('public/site/nosotros/Nosotros', [
            'novedades' => $novedades,
        ]);
    }
}
