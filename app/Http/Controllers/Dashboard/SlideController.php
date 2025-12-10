<?php

namespace App\Http\Controllers\Dashboard;

use Inertia\Inertia;
use App\Models\Slide;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;
use App\Http\Requests\StoreSlideRequest;
use App\Http\Requests\UpdateSlideRequest;
use Intervention\Image\Laravel\Facades\Image;

class SlideController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Slide::query();

        // Filtro por estado activo/inactivo
        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        // Búsqueda por título
        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        // Ordenamiento
        $sortField = $request->get('sort', 'sort_order');
        $sortDirection = $request->get('direction', 'asc');
        $query->orderBy($sortField, $sortDirection);

        $slides = $query->paginate(10)->withQueryString();

        return Inertia::render('dashboard/slides/Index', [
            'slides' => $slides,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
                'sort' => $sortField,
                'direction' => $sortDirection,
            ],
            'stats' => [
                'total' => Slide::count(),
                'active' => Slide::activeCount(),
                'maxActive' => Slide::MAX_ACTIVE_SLIDES,
                'canActivateMore' => Slide::canActivateMore(),
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('dashboard/slides/Create', [
            'canActivate' => Slide::canActivateMore(),
            'activeCount' => Slide::activeCount(),
            'maxActive' => Slide::MAX_ACTIVE_SLIDES,
            'nextSortOrder' => Slide::getNextSortOrder(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSlideRequest $request)
    {
        try {
            $validated = $request->validated();

            // Procesar imagen desktop
            if ($request->hasFile('image_desktop')) {
                $validated['image_desktop'] = $this->processAndStoreImage(
                    $request->file('image_desktop'),
                    Slide::DESKTOP_WIDTH,
                    Slide::DESKTOP_HEIGHT,
                    'desktop'
                );
            }

            // Procesar imagen mobile
            if ($request->hasFile('image_mobile')) {
                $validated['image_mobile'] = $this->processAndStoreImage(
                    $request->file('image_mobile'),
                    Slide::MOBILE_WIDTH,
                    Slide::MOBILE_HEIGHT,
                    'mobile'
                );
            }

            // Establecer sort_order si no se proporciona
            if (empty($validated['sort_order'])) {
                $validated['sort_order'] = Slide::getNextSortOrder();
            }

            // Establecer is_active por defecto
            $validated['is_active'] = $validated['is_active'] ?? false;

            Slide::create($validated);

            return redirect()
                ->route('dashboard.slides.index')
                ->with('success', 'Slide creado correctamente.');
        } catch (\Exception $e) {
            Log::error('Error al crear slide: ' . $e->getMessage());

            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'Ocurrió un error al crear el slide. Intentalo nuevamente.');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Slide $slide)
    {
        return Inertia::render('dashboard/slides/Show', [
            'slide' => $slide,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Slide $slide)
    {
        return Inertia::render('dashboard/slides/Edit', [
            'slide' => $slide,
            'canActivate' => Slide::canActivateMore() || $slide->is_active,
            'activeCount' => Slide::activeCount(),
            'maxActive' => Slide::MAX_ACTIVE_SLIDES,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSlideRequest $request, Slide $slide)
    {
        try {
            $validated = $request->validated();

            // Procesar imagen desktop si se sube una nueva
            if ($request->hasFile('image_desktop')) {
                // Eliminar imagen anterior si existe y es local
                $this->deleteImageIfLocal($slide->image_desktop);

                $validated['image_desktop'] = $this->processAndStoreImage(
                    $request->file('image_desktop'),
                    Slide::DESKTOP_WIDTH,
                    Slide::DESKTOP_HEIGHT,
                    'desktop'
                );
            }

            // Procesar imagen mobile si se sube una nueva
            if ($request->hasFile('image_mobile')) {
                // Eliminar imagen anterior si existe y es local
                $this->deleteImageIfLocal($slide->image_mobile);

                $validated['image_mobile'] = $this->processAndStoreImage(
                    $request->file('image_mobile'),
                    Slide::MOBILE_WIDTH,
                    Slide::MOBILE_HEIGHT,
                    'mobile'
                );
            }

            $slide->update($validated);

            return redirect()
                ->route('dashboard.slides.index')
                ->with('success', 'Slide actualizado correctamente.');
        } catch (\Exception $e) {
            Log::error('Error al actualizar slide: ' . $e->getMessage());

            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'Ocurrió un error al actualizar el slide. Intentalo nuevamente.');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Slide $slide)
    {
        try {
            // Eliminar imágenes del disco si son locales
            $this->deleteImageIfLocal($slide->image_desktop);
            $this->deleteImageIfLocal($slide->image_mobile);

            $slide->delete();

            return redirect()
                ->route('dashboard.slides.index')
                ->with('success', 'Slide eliminado correctamente.');
        } catch (\Exception $e) {
            Log::error('Error al eliminar slide: ' . $e->getMessage());

            return redirect()
                ->back()
                ->with('error', 'Ocurrió un error al eliminar el slide. Intentalo nuevamente.');
        }
    }

    /**
     * Toggle the active status of a slide.
     */
    public function toggleStatus(Slide $slide)
    {
        try {
            // Si se va a activar, verificar el límite
            if (!$slide->is_active && !Slide::canActivateMore()) {
                return redirect()
                    ->back()
                    ->with('error', 'Ya existen ' . Slide::MAX_ACTIVE_SLIDES . ' slides activos. Desactiva uno antes de activar otro.');
            }

            $slide->update(['is_active' => !$slide->is_active]);

            $status = $slide->is_active ? 'activado' : 'desactivado';

            return redirect()
                ->back()
                ->with('success', "Slide {$status} correctamente.");
        } catch (\Exception $e) {
            Log::error('Error al cambiar estado del slide: ' . $e->getMessage());

            return redirect()
                ->back()
                ->with('error', 'Ocurrió un error al cambiar el estado del slide.');
        }
    }

    /**
     * Update the sort order of slides.
     */
    public function updateOrder(Request $request)
    {
        $request->validate([
            'slides' => 'required|array',
            'slides.*.id' => 'required|exists:slides,id',
            'slides.*.sort_order' => 'required|integer|min:0',
        ]);

        try {
            foreach ($request->slides as $slideData) {
                Slide::where('id', $slideData['id'])
                    ->update(['sort_order' => $slideData['sort_order']]);
            }

            return redirect()
                ->back()
                ->with('success', 'Orden actualizado correctamente.');
        } catch (\Exception $e) {
            Log::error('Error al actualizar orden de slides: ' . $e->getMessage());

            return redirect()
                ->back()
                ->with('error', 'Ocurrió un error al actualizar el orden.');
        }
    }

    /**
     * Procesar y almacenar una imagen.
     */
    private function processAndStoreImage($file, int $width, int $height, string $type): string
    {
        // Leer y procesar la imagen con Intervention
        $image = Image::read($file)
            ->cover($width, $height) // Recorta y ajusta al tamaño exacto
            ->encodeByExtension('webp', 85); // Convertir a WebP con calidad 85

        // Generar nombre único
        $filename = Str::uuid() . '.webp';

        // Ruta en storage/app/public/slides/{type}/
        $path = "slides/{$type}/{$filename}";

        // Guardar imagen
        Storage::disk('public')->put($path, (string) $image);

        return $path;
    }

    /**
     * Eliminar una imagen del disco si es local.
     */
    private function deleteImageIfLocal(?string $imagePath): void
    {
        if (empty($imagePath)) {
            return;
        }

        // Solo eliminar si no es una URL externa
        if (!Str::startsWith($imagePath, ['http://', 'https://'])) {
            if (Storage::disk('public')->exists($imagePath)) {
                Storage::disk('public')->delete($imagePath);
            } else {
                Log::warning("El archivo {$imagePath} no existe en el disco.");
            }
        }
    }
}
