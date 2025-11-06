<?php

namespace App\Http\Controllers\Dashboard;

use Inertia\Inertia;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;

class CategoryController extends Controller
{
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


    public function update(Request $request, Category $category)
    {

        // No permitir editar categorías externas
        if ($category->isExternal()) {
            return redirect()
                ->back()
                ->with('error', 'No puedes editar categorías sincronizadas desde la API externa.');
        }

        $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('categories', 'name')->ignore($category->id), // o ->ignore($id)
            ],
            'description' => 'nullable|string'
        ]);

        try {
            $category->update([
                'name' => $request->name,
                'description' => $request->description,
            ]);

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

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:categories,name'],
            'description' => 'nullable|string',
        ]);

        try {
            $category = Category::create([
                ...$validated,
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
}
