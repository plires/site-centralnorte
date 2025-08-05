<?php

namespace App\Http\Controllers\Dashboard;

use App\Models\Product;
use Illuminate\Support\Str;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Facades\Image;


class ProductImageController extends Controller
{

    public function store(Request $request, Product $product)
    {
        $request->validate([
            'images.*' => 'required|image|max:2048', // máx 2MB por imagen
        ]);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $url = $file->store('products', 'public');

                $product->images()->create([
                    'url' => $url,
                    'is_featured' => false,
                ]);
            }
        }

        return back()->with('success', 'Imágenes subidas correctamente.');
    }

    public function destroy(Product $product, ProductImage $image)
    {
        if ($image->product_id !== $product->id) {
            return back()->with('error', 'La imagen no pertenece a este producto.');
        }

        // Si es una imagen local (no es una URL externa), la eliminamos del disco
        if (!Str::startsWith($image->url, ['http://', 'https://'])) {
            // Eliminamos el archivo del almacenamiento
            Storage::disk('public')->delete($image->url);
        }

        // Guardamos si era destacada
        $wasFeatured = $image->is_featured;

        // Eliminamos la imagen de la base de datos
        $image->delete();

        // Si era la destacada, buscamos una nueva imagen para destacarla
        if ($wasFeatured) {
            $newFeatured = $product->images()->orderBy('id')->first(); // Primera imagen restante
            if ($newFeatured) {
                $newFeatured->is_featured = true;
                $newFeatured->save();
            }
        }

        return back()->with('success', 'Imagen eliminada correctamente.');
    }

    public function setFeatured(Product $product, ProductImage $image)
    {
        if ($image->product_id !== $product->id) {
            return back()->with('error', 'La imagen no pertenece a este producto.');
        }

        // Desmarcar todas como destacadas
        $product->images()->update(['is_featured' => false]);

        // Marcar esta como destacada
        $image->is_featured = true;
        $image->save();

        return back()->with('success', 'Imagen destacada actualizada.');
    }
}
