<?php

namespace App\Http\Controllers\Dashboard;

use Inertia\Inertia;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use PhpParser\Node\Stmt\TryCatch;

class ProductController extends Controller
{
    public function show(Product $product)
    {

        $product->load('category', 'images', 'featuredImage'); // featuredImage en las vistas se recibe como featured_image (Laravel, por defecto, convierte los nombres de atributos de los modelos y relaciones a snake_case cuando los transforma a JSON (que es lo que Inertia pasa a React).)

        return inertia('dashboard/products/Show', [
            'product' => $product
        ]);
    }

    public function index(Request $request)
    {
        $query = Product::with('category')->withoutTrashed();

        // Búsqueda
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")
                    ->orWhere('proveedor', 'like', "%{$search}%");
            });
        }

        // Ordenamiento
        if ($request->filled('sort')) {
            $direction = $request->get('direction', 'asc');
            $query->orderBy($request->sort, $direction);
        } else {
            $query->orderBy('created_at', 'desc'); // Orden por defecto
        }

        $products = $query->paginate(5)->withQueryString();

        return Inertia::render('dashboard/products/Index', [
            'products' => $products,
            'filters' => [
                'search' => $request->search,
                'sort' => $request->sort,
                'direction' => $request->direction,
            ]
        ]);
    }

    public function create()
    {
        return Inertia::render('dashboard/products/Create', [
            'categories' => Category::all()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'sku' => 'required|string|max:255|unique:products,sku,',
            'name' => ['required', 'string', 'max:255'],
            'description' => 'nullable|string',
            'proveedor' => 'nullable|string|max:255',
            'category_id' => 'required|exists:categories,id',
        ]);

        try {
            $product = Product::create($validated);

            return redirect()->back()->with('success', "Producto '{$product->name}' creado correctamente.");
        } catch (\Exception $e) {
            Log::error('Error al crear el producto: ' . $e->getMessage());

            return redirect()->back()->with('error', 'Ocurrió un error al crear el producto. Inténtalo de nuevo.');
        }
    }

    public function edit(Product $product)
    {
        $categories = Category::all(); // para el select de categorías

        return inertia('dashboard/products/Edit', [
            'product' => $product,
            'categories' => $categories,
        ]);
    }


    public function update(Request $request, Product $product)
    {

        $request->validate([
            'sku' => 'required|string|max:255|unique:products,sku,' . $product->id,
            'name' => ['required', 'string', 'max:255'],
            'description' => 'nullable|string',
            'proveedor' => 'nullable|string|max:255',
            'category_id' => 'required|exists:categories,id',
        ]);

        try {
            $product->update([
                'sku' => $request->sku,
                'name' => $request->name,
                'description' => $request->description,
                'proveedor' => $request->proveedor,
                'category_id' => $request->category_id,
            ]);

            return redirect()->back()->with('success', "Producto '{$product->name}' actualizado correctamente.");
        } catch (\Throwable $e) {
            Log::error('Error al actualizar producto: ' . $e->getMessage());

            return redirect()->back()->with('error', 'Ocurrió un error al actualizar el producto.');
        }
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return redirect()->route('dashboard.products.index')->with('success', 'Producto eliminado.');
    }
}
