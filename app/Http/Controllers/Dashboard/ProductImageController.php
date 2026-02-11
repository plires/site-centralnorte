<?php

namespace App\Http\Controllers\Dashboard;

use App\Models\Product;
use Illuminate\Support\Str;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Laravel\Facades\Image;
use Illuminate\Support\Facades\Log;

class ProductImageController extends Controller
{

    public function store(Request $request, Product $product)
    {

        try {

            if (!$request->hasFile('image')) {
                return back()->with('error', 'No se recibió ninguna imagen o excede el límite permitido.')->withInput();
            }

            $request->validate([
                'image' => 'required|image|max:5120', // máx 5MB
                'variant' => 'nullable|string|max:255',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->validator)->withInput();
        }

        try {
            $file = $request->file('image');

            // 1. Leer y procesar: recortar+redimensionar a 800×800
            $image = Image::read($file)
                ->pad(800, 800, 'fff') // color blanco
                ->encodeByExtension('webp', 85);

            // 2. Nombre único
            $filename = Str::uuid() . '.webp';

            // 3. Ruta en storage/app/public/products/{id}/
            $path = "products/{$product->id}/{$filename}";

            // 4. Guardar imagen
            Storage::disk('public')->put($path, (string) $image);

            // 5. Guardar en base de datos
            $productImage = new ProductImage();
            $productImage->product_id = $product->id;
            $productImage->url = $path;
            $productImage->is_featured = ($product->images()->count() === 0);
            $productImage->variant = $this->normalizeVariant($request->input('variant'));
            $productImage->save();

            return back()->with('success', 'Las imágenes fueron subidas correctamente.');
        } catch (\Exception $e) {
            Log::error('Error al subir imágenes: ' . $e->getMessage());
            return back()->with('error', 'Ocurrió un error al subir las imágenes. Intentalo nuevamente.');
        }
    }

    public function destroy(Product $product, ProductImage $image)
    {

        try {
            if ($image->product_id !== $product->id) {
                return back()->with('error', 'La imagen no pertenece a este producto.');
            }

            // Si es una imagen local (no es una URL externa), la eliminamos del disco
            if (!Str::startsWith($image->url, ['http://', 'https://'])) {
                if (Storage::disk('public')->exists($image->url)) {
                    Storage::disk('public')->delete($image->url);
                } else {
                    Log::warning("El archivo {$image->url} no existe en el disco.");
                }
            }

            // Guardamos si era destacada
            $wasFeatured = $image->is_featured;

            // Eliminamos la imagen de la base de datos
            $image->delete();

            // Si era la destacada, buscamos una nueva imagen para destacarla
            if ($wasFeatured) {
                $newFeatured = $product->images()->orderBy('id')->first();
                if ($newFeatured) {
                    $newFeatured->is_featured = true;
                    $newFeatured->save();
                }
            }

            return back()->with('success', 'Imagen eliminada correctamente.');
        } catch (\Exception $e) {
            Log::error("Error al eliminar imagen: " . $e->getMessage());
            return back()->with('error', 'Ocurrió un error al eliminar la imagen. Inténtalo nuevamente.');
        }
    }

    public function setFeatured(Product $product, ProductImage $image)
    {

        try {
            // Validación: la imagen debe pertenecer al producto
            if ($image->product_id !== $product->id) {
                return back()->with('error', 'La imagen no pertenece a este producto.');
            }

            // Desmarcar todas las imágenes como destacadas
            $product->images()->update(['is_featured' => false]);

            // Marcar esta imagen como destacada
            $image->is_featured = true;
            $image->save();

            return back()->with('success', 'Imagen destacada actualizada correctamente.');
        } catch (\Exception $e) {
            // Loguear el error si querés
            Log::error('Error al actualizar imagen destacada: ' . $e->getMessage());

            return back()->with('error', 'Ocurrió un error al actualizar la imagen destacada. Intenta nuevamente.');
        }
    }

    public function updateVariant(Request $request, Product $product, ProductImage $image)
    {
        try {
            if ($image->product_id !== $product->id) {
                return back()->with('error', 'La imagen no pertenece a este producto.');
            }

            $request->validate([
                'variant' => 'nullable|string|max:255',
            ]);

            $image->variant = $this->normalizeVariant($request->input('variant'));
            $image->save();

            return back()->with('success', 'Variante actualizada correctamente.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->validator)->withInput();
        } catch (\Exception $e) {
            Log::error('Error al actualizar variante: ' . $e->getMessage());
            return back()->with('error', 'Ocurrió un error al actualizar la variante. Intenta nuevamente.');
        }
    }

    /**
     * Normaliza el campo variant separando los términos con " / ".
     * Acepta comas, guiones y "y" como separadores.
     * Ej: "Rojo, Azul y Verde" → "Rojo / Azul / Verde"
     */
    private function normalizeVariant(?string $variant): ?string
    {
        if (empty($variant)) {
            return null;
        }

        // Separar por comas, guiones, barras, " y ", "Y"
        $parts = preg_split('/\s*[,\-\/]\s*|\s+y\s+/iu', $variant);

        // Limpiar espacios y filtrar vacíos, capitalizar cada término
        $parts = array_filter(array_map(function ($part) {
            return mb_convert_case(trim($part), MB_CASE_TITLE, 'UTF-8');
        }, $parts), fn($part) => $part !== '');

        $result = implode(' / ', $parts);

        return $result ?: null;
    }
}
