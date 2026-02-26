<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;

class ApiController extends Controller
{
    /**
     * Búsqueda de clientes para select con autocompletado
     * Los vendedores solo ven datos básicos por seguridad
     */
    public function searchClients(Request $request)
    {
        $search = $request->get('search', '');
        $limit = $request->get('limit', 20);

        $query = Client::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('company', 'like', "%{$search}%");
            });
        }

        $clients = $query->select('id', 'name', 'company', 'email')
            ->orderBy('name')
            ->limit($limit)
            ->get();

        // Formatear respuesta para el select
        $formattedClients = $clients->map(function ($client) {
            return [
                'value' => $client->id,
                'label' => $client->name . ($client->company ? " ({$client->company})" : ''),
                'data' => [
                    'id' => $client->id,
                    'name' => $client->name,
                    'company' => $client->company,
                    'email' => $client->email, // Solo para envío de presupuestos
                ]
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $formattedClients
        ]);
    }

    /**
     * Búsqueda de productos para select con autocompletado
     */
    public function searchProducts(Request $request)
    {
        $search = $request->get('search', '');
        $limit = $request->get('limit', 20);

        $query = Product::with(['categories', 'featuredImage', 'variants']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        $products = $query->select('id', 'name', 'sku', 'last_price')
            ->orderBy('name')
            ->limit($limit)
            ->get();

        // Formatear respuesta para el select
        $formattedProducts = $products->map(function ($product) {
            // Manejar múltiples categorías
            $categoryNames = $product->categories->pluck('name')->toArray();
            $categoryDisplay = !empty($categoryNames)
                ? implode(', ', $categoryNames)
                : 'Sin categoría';

            return [
                'value' => $product->id,
                'label' => "{$product->name} ({$product->sku})",
                'data' => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'sku' => $product->sku,
                    'last_price' => $product->last_price,
                    'categories' => $categoryNames,
                    'category_display' => $categoryDisplay,
                    'featured_image' => $product->featuredImage ? $product->featuredImage->full_url : null,
                    'variants' => $product->variants,
                ]
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $formattedProducts
        ]);
    }

    /**
     * Obtener datos completos de un producto por ID
     */
    public function getProduct($id)
    {
        try {
            $product = Product::with(['categories', 'featuredImage', 'variants'])
                ->findOrFail($id);

            // Manejar múltiples categorías
            $categoryNames = $product->categories->pluck('name')->toArray();
            $categoryDisplay = !empty($categoryNames)
                ? implode(', ', $categoryNames)
                : 'Sin categoría';

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'sku' => $product->sku,
                    'last_price' => $product->last_price,
                    'categories' => $categoryNames,
                    'category_display' => $categoryDisplay,
                    'featured_image' => $product->featuredImage ? $product->featuredImage->full_url : null,
                    'variants' => $product->variants,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Producto no encontrado'
            ], 404);
        }
    }

    /**
     * Obtener datos básicos de un cliente por ID
     */
    public function getClient($id)
    {
        try {
            $client = Client::select('id', 'name', 'company', 'email')
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $client->id,
                    'name' => $client->name,
                    'company' => $client->company,
                    'email' => $client->email,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Cliente no encontrado'
            ], 404);
        }
    }

    /**
     * Acortar una URL usando la API gratuita de TinyURL
     */
    public function shortenUrl(Request $request)
    {
        $request->validate(['url' => 'required|url']);

        $url = $request->input('url');

        try {
            $response = Http::timeout(5)->get('https://tinyurl.com/api-create.php', ['url' => $url]);

            if ($response->successful() && str_starts_with($response->body(), 'https://tinyurl.com/')) {
                return response()->json(['success' => true, 'short_url' => trim($response->body())]);
            }
        } catch (\Exception) {
            // Si falla, devolvemos la URL original
        }

        return response()->json(['success' => false, 'short_url' => $url]);
    }

    /**
     * Obtener lista de vendedores (solo para admins)
     */
    public function getVendedores(Request $request)
    {
        // Verificar que el usuario sea admin
        if (Auth::user()->role->name !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'No autorizado'
            ], 403);
        }

        $search = $request->get('search', '');
        $limit = $request->get('limit', 20);

        $query = \App\Models\User::vendedores();

        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        $vendedores = $query->select('id', 'name', 'email')
            ->orderBy('name')
            ->limit($limit)
            ->get();

        $formattedVendedores = $vendedores->map(function ($vendedor) {
            return [
                'value' => $vendedor->id,
                'label' => $vendedor->name,
                'data' => [
                    'id' => $vendedor->id,
                    'name' => $vendedor->name,
                    'email' => $vendedor->email,
                ]
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $formattedVendedores
        ]);
    }
}
