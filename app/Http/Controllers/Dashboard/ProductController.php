<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function show(Product $product)
    {
        $product->load('category');

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
            'sku' => 'required|unique:products,sku',
            'name' => 'required|string',
            'description' => 'nullable|string',
            'proveedor' => 'nullable|string',
            'category_id' => 'required|exists:categories,id',
            'last_price' => 'nullable|numeric',
        ]);

        Product::create($validated);

        return redirect()->route('dashboard.products.index')->with('success', 'Producto creado correctamente.');
    }

    public function edit(Product $product)
    {
        return Inertia::render('dashboard/products/Edit', [
            'product' => $product,
            'categories' => Category::all(),
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'sku' => 'required|unique:products,sku,' . $product->id,
            'name' => 'required|string',
            'description' => 'nullable|string',
            'proveedor' => 'nullable|string',
            'category_id' => 'required|exists:categories,id',
            'last_price' => 'nullable|numeric',
        ]);

        $product->update($validated);

        return redirect()->route('dashboard.products.index')->with('success', 'Producto actualizado.');
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return redirect()->route('dashboard.products.index')->with('success', 'Producto eliminado.');
    }
}
