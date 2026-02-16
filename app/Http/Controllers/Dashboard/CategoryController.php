<?php

namespace App\Http\Controllers\Dashboard;

use Inertia\Inertia;
use App\Models\Category;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use App\Traits\ExportsToExcel;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use Illuminate\Support\Facades\Auth;

class CategoryController extends Controller
{
    use ExportsToExcel;

    public function index(Request $request)
    {
        $query = Category::withoutTrashed();

        // Filtro por origen
        if ($request->filled('origin')) {
            $query->where('origin', $request->origin);
        }

        // Búsqueda
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Ordenamiento
        if ($request->filled('sort')) {
            $direction = $request->get('direction', 'asc');
            $query->orderBy($request->sort, $direction);
        } else {
            $query->orderBy('created_at', 'desc'); // Orden por defecto
        }

        $categories = $query->withCount('products')->paginate(10)->withQueryString();

        return Inertia::render('dashboard/categories/Index', [
            'categories' => $categories,
            'filters' => [
                'search' => $request->search,
                'sort' => $request->sort,
                'direction' => $request->direction,
            ]
        ]);
    }

    public function show(Category $category)
    {
        // Cargar la relación con el rol si existe
        $category->load('products');

        return inertia('dashboard/categories/Show', [
            'category' => $category
        ]);
    }

    public function edit(Category $category)
    {

        // Redirigir si intentan editar categoría externa
        if ($category->isExternal()) {
            return redirect()
                ->route('dashboard.categories.index', $category)
                ->with('error', 'No puedes editar categorías sincronizadas desde la API externa.');
        }

        return inertia('dashboard/categories/Edit', [
            'category' => $category,
        ]);
    }


    public function update(UpdateCategoryRequest $request, Category $category)
    {

        // No permitir editar categorías externas
        if ($category->isExternal()) {
            return redirect()
                ->back()
                ->with('error', 'No puedes editar categorías sincronizadas desde la API externa.');
        }

        try {
            $category->update($request->validated());

            return redirect()->back()->with('success', "Categoría '{$category->name}' actualizada correctamente.");
        } catch (\Throwable $e) {
            Log::error('Error al actualizar la categoría: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Ocurrió un error al actualizar la categoría.');
        }
    }

    public function create()
    {
        return Inertia::render('dashboard/categories/Create');
    }

    public function store(StoreCategoryRequest $request)
    {
        try {
            $category = Category::create([
                ...$request->validated(),
                'origin' => Category::ORIGIN_LOCAL,
            ]);

            return redirect()->back()->with('success', "Categoría '{$category->name}' creada correctamente.");
        } catch (\Exception $e) {
            Log::error('Error al crear la categoría: ' . $e->getMessage());

            return redirect()->back()->with('error', 'Ocurrió un error al crear la categoría. Inténtalo de nuevo.');
        }
    }

    public function destroy(Category $category)
    {

        // No permitir eliminar categorías externas
        if ($category->isExternal()) {
            return redirect()
                ->back()
                ->with('error', 'No puedes eliminar categorías sincronizadas desde la API externa.');
        }

        try {
            // Verificar si la categoria tiene productos asociados
            if ($category->products()->exists()) {
                return redirect()->back()->with(
                    'error',
                    "No se puede eliminar la categoría '{$category->name}' porque esta asociada a uno o mas productos. Antes Debe cambiarle esta categoría a cualquier producto que la tenga asociada."
                );
            }

            // Eliminar la categoría
            $category->delete();

            return redirect()->back()->with(
                'success',
                "Categoría '{$category->name}' eliminada correctamente."
            );
        } catch (\Exception $e) {
            Log::error('Error al eliminar la categoria: ' . $e->getMessage());
            return redirect()->back()->with(
                'error',
                'Ocurrió un error al eliminar la categoría. Inténtalo de nuevo.'
            );
        }
    }

    /**
     * Exportar listado de categorias a Excel
     * Solo accesible para usuarios con role 'admin'
     */
    public function export(Request $request)
    {
        try {

            // Verificar que el usuario sea admin
            $user = Auth::user();

            // Verificar que el usuario sea admin
            if ($user->role->name !== 'admin') {
                // Si es una petición AJAX, devolver JSON
                if ($request->wantsJson() || $request->ajax()) {
                    return response()->json([
                        'message' => 'No tienes permisos para exportar datos.'
                    ], 403);
                }

                // Si es navegación directa, abort normal
                abort(403, 'No tienes permisos para exportar datos.');
            }

            $categories = Category::all();

            // Verificar si hay datos para exportar
            if ($categories->isEmpty()) {
                if ($request->wantsJson() || $request->ajax()) {
                    return response()->json([
                        'message' => 'No hay categorías para exportar.'
                    ], 404);
                }

                return redirect()->back()->with('error', 'No hay categorías para exportar.');
            }

            // Definir encabezados y sus keys correspondientes
            $headers = [
                'id' => 'ID',
                'name' => 'Nombre',
                'title' => 'Título',
                'description' => 'Descripción',
                'show' => 'Visible en Front',
                'origin' => 'Origen de la categoría',
                'created_at' => 'Fecha de Creación',
                'updated_at' => 'Última Actualización',
                'deleted_at' => 'Fecha de Eliminación',
            ];

            // Preparar datos para exportación
            $data = $categories->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'title' => $category->title,
                    'description' => $category->description,
                    'show' => $category->show,
                    'origin' => $category->origin,
                    'created_at' => $category->created_at ? $category->created_at->format('d/m/Y H:i') : '',
                    'updated_at' => $category->updated_at ? $category->updated_at->format('d/m/Y H:i') : '',
                    'deleted_at' => $category->deleted_at ? $category->deleted_at->format('d/m/Y H:i') : '',
                ];
            })->toArray();

            // Log de exportación exitosa
            Log::info('Categorias exportados', [
                'user_id' => $user->id,
                'user_name' => $user->name,
                'count' => count($data),
            ]);

            // Exportar usando el trait
            return $this->exportToExcel(
                data: $data,
                headers: $headers,
                filename: 'categorias',
                sheetTitle: 'Lista de Categorias'
            );
        } catch (\Exception $e) {
            // Log del error
            Log::error('Error al exportar clientes', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Si es petición AJAX, devolver JSON
            if ($request->wantsJson() || $request->ajax()) {
                return response()->json([
                    'message' => 'Error al generar el archivo de exportación. Por favor, inténtalo de nuevo.'
                ], 500);
            }

            // Si es navegación normal, redirect con error
            return redirect()->back()->with('error', 'Error al generar el archivo de exportación. Por favor, inténtalo de nuevo.');
        }
    }

    /**
     * Descargar catálogo de productos de una categoría en PDF
     */
    public function downloadCatalogPdf(Category $category)
    {
        try {
            // Cargar productos de la categoría con su imagen principal
            $category->load(['products' => function ($query) {
                $query->with('featuredImage')
                    ->orderBy('name');
            }]);

            // Verificar si hay productos
            if ($category->products->isEmpty()) {
                return redirect()->back()->with('error', 'Esta categoría no tiene productos para generar el catálogo.');
            }

            // Procesar productos con sus imágenes
            $products = $category->products->map(function ($product) {
                $imageData = null;

                if ($product->featuredImage) {
                    $fullUrl = $product->featuredImage->full_url;

                    if ($fullUrl && !empty($product->featuredImage->url)) {
                        $imageData = $this->processImageForPdf($fullUrl);
                    }
                }

                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'sku' => $product->sku,
                    'description' => $product->description,
                    'image' => $imageData,
                ];
            });

            $pdf = Pdf::loadView('pdf.category-catalog', [
                'category' => $category,
                'products' => $products,
            ]);

            $pdf->setPaper('a4', 'portrait');

            // Generar nombre de archivo limpio
            $filename = 'catalogo-' . \Illuminate\Support\Str::slug($category->name) . '.pdf';

            return $pdf->download($filename);
        } catch (\Exception $e) {
            Log::error('Error al generar catálogo PDF', [
                'category_id' => $category->id,
                'error' => $e->getMessage(),
            ]);

            return redirect()->back()->with('error', 'Error al generar el catálogo PDF. Por favor, inténtalo de nuevo.');
        }
    }

    /**
     * Procesa una imagen para ser compatible con DomPDF
     * Convierte WebP y otros formatos a base64 JPEG
     * DomPDF no soporta WebP, por lo que se convierte a JPEG
     */
    private function processImageForPdf(string $imageUrl): ?string
    {
        try {
            $imageContent = null;
            $isWebp = false;

            // Si es una URL externa
            if (str_starts_with($imageUrl, 'http://') || str_starts_with($imageUrl, 'https://')) {
                $imageContent = @file_get_contents($imageUrl);
                if ($imageContent === false) {
                    return null;
                }
                $isWebp = str_ends_with(strtolower($imageUrl), '.webp');
            } else {
                // Si es una ruta local
                $localPath = public_path('storage/' . ltrim($imageUrl, '/'));
                if (!file_exists($localPath)) {
                    return null;
                }
                $imageContent = file_get_contents($localPath);
                $isWebp = str_ends_with(strtolower($localPath), '.webp');
            }

            // Si es WebP, usar herramientas de línea de comandos para convertir
            if ($isWebp) {
                return $this->convertWebpToJpegBase64($imageContent);
            }

            // Para otros formatos, intentar con GD directamente
            $gdImage = @imagecreatefromstring($imageContent);
            if ($gdImage) {
                return $this->gdImageToJpegBase64($gdImage, 200);
            }

            return null;
        } catch (\Exception $e) {
            Log::warning('Error procesando imagen para PDF', [
                'url' => $imageUrl,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Convierte una imagen WebP (incluyendo animadas) a JPEG base64
     * Usa webpmux y dwebp para manejar WebP animados
     */
    private function convertWebpToJpegBase64(string $webpContent): ?string
    {
        $tempWebp = sys_get_temp_dir() . '/catalog_' . uniqid() . '.webp';
        $tempFrame = sys_get_temp_dir() . '/catalog_' . uniqid() . '_frame.webp';
        $tempPng = sys_get_temp_dir() . '/catalog_' . uniqid() . '.png';

        try {
            file_put_contents($tempWebp, $webpContent);

            // Primero intentar extraer frame (para WebP animados)
            exec('webpmux -get frame 1 "' . $tempWebp . '" -o "' . $tempFrame . '" 2>&1', $output, $returnCode);

            $sourceFile = $returnCode === 0 && file_exists($tempFrame) ? $tempFrame : $tempWebp;

            // Convertir a PNG
            exec('dwebp "' . $sourceFile . '" -o "' . $tempPng . '" 2>&1', $output2, $returnCode2);

            if ($returnCode2 !== 0 || !file_exists($tempPng)) {
                return null;
            }

            // Cargar con GD y convertir a JPEG base64
            $gdImage = @imagecreatefrompng($tempPng);
            if (!$gdImage) {
                return null;
            }

            return $this->gdImageToJpegBase64($gdImage, 200);
        } finally {
            // Limpiar archivos temporales
            @unlink($tempWebp);
            @unlink($tempFrame);
            @unlink($tempPng);
        }
    }

    /**
     * Convierte una imagen GD a JPEG base64 con resize
     */
    private function gdImageToJpegBase64($gdImage, int $maxWidth): string
    {
        $originalWidth = imagesx($gdImage);
        $originalHeight = imagesy($gdImage);

        // Calcular nuevas dimensiones manteniendo proporción
        $ratio = $maxWidth / $originalWidth;
        $newWidth = $maxWidth;
        $newHeight = (int) ($originalHeight * $ratio);

        // Crear imagen redimensionada
        $resized = imagecreatetruecolor($newWidth, $newHeight);

        // Fondo blanco (para transparencias)
        $white = imagecolorallocate($resized, 255, 255, 255);
        imagefill($resized, 0, 0, $white);

        imagecopyresampled($resized, $gdImage, 0, 0, 0, 0, $newWidth, $newHeight, $originalWidth, $originalHeight);

        // Convertir a JPEG
        ob_start();
        imagejpeg($resized, null, 80);
        $jpegData = ob_get_clean();

        imagedestroy($gdImage);
        imagedestroy($resized);

        return 'data:image/jpeg;base64,' . base64_encode($jpegData);
    }
}
