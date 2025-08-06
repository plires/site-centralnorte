<?php

namespace App\Http\Controllers\Dashboard;

use App\Models\Product;
use Illuminate\Support\Str;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Laravel\Facades\Image;

class ProductImageController extends Controller
{

    public function store(Request $request, Product $product)
    {
        $request->validate([
            'images' => 'required|array',
            'images.*' => 'image|max:5120', // máx 5MB por imagen
        ]);

        $images = $request->file('images');

        foreach ($images as $file) {
            // 1. Leer y procesar: recortar+redimensionar a 800×800
            $image = Image::read($file)
                ->pad(800, 800, 'fff')                   // reemplaza fit()
                ->encodeByExtension('webp', 85);    // codifica a WebP calidad 85%

            // 2. Nombre único
            $filename = Str::uuid() . '.webp';

            // 3. Ruta en storage/app/public/products/{id}/
            $path = "products/{$product->id}/{$filename}";

            // 4. Guardar
            Storage::disk('public')->put($path, (string) $image);

            // Creamos el registro en base de datos
            $productImage = new ProductImage();
            $productImage->product_id = $product->id;
            $productImage->url = "$path";
            $productImage->is_featured = ($product->images()->count() === 0);
            $productImage->save();
        }

        // foreach ($images as $file) {

        // $image = Image::read($file)           // crea la instancia
        //     ->fit(800, 800)                   // recorta a 800×800
        //     ->encodeByExtension('webp', 85);  // codifica a WebP con calidad 85%

        // // 3. Generar un nombre único
        // $filename = Str::uuid() . '.webp';

        // // 4. Definir ruta dentro de storage/app/public/products/{id}/
        // $directory = "products/{$product->id}";
        // $path = "{$directory}/{$filename}";

        // // 5. Guardar en el disco 'public' (storage/app/public/)
        // Storage::disk('public')->put($path, (string) $image);

        // $image = Image::read($file)
        //     ->pad(800, 800, 'fff');
        // $foo = Storage::put(
        //     uniqid('img_') . '.webp',
        //     $image->toWebp(80)
        // );

        // $filename = uniqid('img_') . '.webp';

        // // Carpeta donde guardar (por ejemplo: products/12/)
        // $folder = "products/{$product->id}";

        // // Guardamos en storage/app/public/products/{id}/
        // Storage::disk('public')->put("{$folder}/{$filename}", $image);


        // // Creamos un nombre único
        // $filename = uniqid('img_') . '.webp';

        // // Carpeta donde guardar (por ejemplo: products/12/)
        // $folder = "products/{$product->id}";

        // // Guardamos en storage/app/public/products/{id}/
        // Storage::disk('public')->put("{$folder}/{$filename}", $image);

        // Creamos el registro en base de datos
        // $productImage = new ProductImage();
        // $productImage->product_id = $product->id;
        // $productImage->url = "{$folder}/{$filename}";
        // $productImage->is_featured = false; // o lógica para destacada si querés
        // $productImage->save();
        // }

        return back()->with('success', 'Imágenes subidas correctamente.');
    }

    // public function store(Request $request, Product $product)
    // {
    //     $request->validate([
    //         'images.*' => 'required|image|max:2048', // máx 2MB por imagen
    //     ]);

    //     if ($request->hasFile('images')) {
    //         foreach ($request->file('images') as $file) {
    //             $url = $file->store('products', 'public');

    //             $product->images()->create([
    //                 'url' => $url,
    //                 'is_featured' => false,
    //             ]);
    //         }
    //     }

    //     return back()->with('success', 'Imágenes subidas correctamente.');
    // }

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
