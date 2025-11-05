<?php

namespace App\Http\Controllers\Public;

use Inertia\Inertia;
use App\Models\Budget;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Str;

class PublicBudgetController extends Controller
{
    public function show($token)
    {
        try {
            $budget = Budget::where('token', $token)
                ->with([
                    'client',
                    'user',
                    'items.product.images',
                    'items.product.featuredImage',
                    'items.product.categories'
                ])
                ->firstOrFail();

            // Verificar si el presupuesto está activo
            if (!$budget->is_active) {
                return Inertia::render('public/budgets/BudgetNotFound', [
                    'message' => 'Este presupuesto ha sido desactivado temporalmente y no está disponible para visualización.',
                    'reason' => 'inactive'
                ]);
            }

            // Obtener datos de estado usando el método del modelo
            $statusData = $budget->getStatusData();

            // Verificar si el presupuesto está vigente
            if ($statusData['is_expired']) {
                return Inertia::render('public/budgets/BudgetNotFound', [
                    'message' => 'Este presupuesto esta vencido y no está disponible para visualización.',
                    'reason' => 'expired'
                ]);
            }

            // Agrupar items por variantes para facilitar el manejo en el frontend
            $groupedItems = $this->groupItemsByVariants($budget->items);

            // Obtener configuración de IVA (igual que en DashboardBudgetController)
            $businessConfig = [
                'iva_rate' => config('business.tax.iva_rate', 0.21),
                'apply_iva' => config('business.tax.apply_iva', true),
            ];

            return Inertia::render('public/budgets/Budget', [
                'budget' => array_merge([
                    'id' => $budget->id,
                    'title' => $budget->title,
                    'token' => $budget->token,
                    'is_active' => $budget->is_active, // AGREGADO: Para consistencia
                    'issue_date_formatted' => $budget->issue_date_formatted,
                    'expiry_date_formatted' => $budget->expiry_date_formatted,
                    'issue_date_short' => $budget->issue_date_short,
                    'expiry_date_short' => $budget->expiry_date_short,
                    'footer_comments' => $budget->footer_comments,
                    'subtotal' => $budget->subtotal,
                    'total' => $budget->total,
                    'client' => [
                        'name' => $budget->client->name,
                        'company' => $budget->client->company,
                    ],
                    'user' => [
                        'name' => $budget->user->name,
                    ],
                    'grouped_items' => $groupedItems,
                    'variant_groups' => $budget->getVariantGroups(),
                    'has_variants' => $budget->hasVariants(),
                ], $statusData),
                'businessConfig' => $businessConfig,
            ]);
        } catch (\Exception $e) {
            Log::error('Error al mostrar presupuesto público: ' . $e->getMessage());

            return Inertia::render('public/budgets/BudgetNotFound', [
                'message' => 'El presupuesto solicitado no existe o ha sido eliminado.',
                'reason' => 'not_found'
            ]);
        }
    }

    /**
     * Generar PDF con variantes seleccionadas por el usuario
     */
    public function downloadPdf($token, Request $request)
    {
        try {
            // Una sola query con las relaciones necesarias
            $budget = Budget::where('token', $token)
                ->with([
                    'client:id,name,company,email,phone',
                    'user:id,name,email',
                    'items' => function ($query) {
                        // Cargar TODOS los items (sin filtrar por is_selected aquí)
                        $query->with([
                            'product:id,name',
                            'product.categories:id,name',
                            'product.featuredImage:id,product_id,url,is_featured'
                        ]);
                    }
                ])
                ->firstOrFail();

            if (!$budget->is_active) {
                abort(404, 'Presupuesto no disponible');
            }

            // Obtener variantes seleccionadas desde la request
            $selectedVariants = $this->parseSelectedVariants($request);

            // Filtrar items basado en las variantes seleccionadas
            $filteredItems = $this->filterItemsBySelectedVariants($budget->items, $selectedVariants);

            // Incluye imágenes con los items filtrados
            $groupedItems = $this->groupItemsWithImages($filteredItems);

            $businessConfig = [
                'iva_rate' => config('business.tax.iva_rate', 0.21),
                'apply_iva' => config('business.tax.apply_iva', true),
            ];

            $statusData = $budget->getStatusData();
            $calculatedTotals = $this->calculateFilteredTotals($filteredItems, $businessConfig);

            $budgetData = array_merge([
                'id' => $budget->id,
                'title' => $budget->title,
                'token' => $budget->token,
                'issue_date_formatted' => $budget->issue_date_formatted,
                'expiry_date_formatted' => $budget->expiry_date_formatted,
                'issue_date_short' => $budget->issue_date_short,
                'expiry_date_short' => $budget->expiry_date_short,
                'footer_comments' => $budget->footer_comments,
                'subtotal' => $calculatedTotals['subtotal'],
                'total' => $calculatedTotals['total'],
                'client' => [
                    'name' => $budget->client->name,
                    'company' => $budget->client->company ?? '',
                    'email' => $budget->client->email ?? '',
                    'phone' => $budget->client->phone ?? '',
                ],
                'user' => [
                    'name' => $budget->user->name,
                    'email' => $budget->user->email ?? '',
                ],
                'grouped_items' => $groupedItems,
            ], $statusData);

            // CONFIGURACIÓN MÍNIMA DEL PDF
            $pdf = Pdf::loadView('pdf.budget', [
                'budget' => $budgetData,
                'businessConfig' => $businessConfig,
            ]);

            $pdf->setPaper('A4', 'portrait');

            $filename = 'Presupuesto_' . str_replace(' ', '_', $budget->title) . '.pdf';
            return $pdf->download($filename);
        } catch (\Exception $e) {
            Log::error('Error al generar PDF: ' . $e->getMessage());
            abort(500, 'Error al generar el PDF');
        }
    }

    /**
     * Parsear variantes seleccionadas desde los parámetros de la request
     */
    private function parseSelectedVariants(Request $request)
    {
        $selectedVariants = [];
        $variants = $request->input('variants', []);

        foreach ($variants as $variant) {
            // Formato esperado: "grupo:itemId"
            if (strpos($variant, ':') !== false) {
                [$group, $itemId] = explode(':', $variant, 2);
                $selectedVariants[$group] = (int) $itemId;
            }
        }

        return $selectedVariants;
    }

    /**
     * Filtrar items basado en las variantes seleccionadas por el usuario
     */
    private function filterItemsBySelectedVariants($allItems, $selectedVariants)
    {
        $filtered = collect();

        foreach ($allItems as $item) {
            if ($item->variant_group) {
                // Es un item con variante
                $group = $item->variant_group;

                // Si hay una variante seleccionada para este grupo
                if (isset($selectedVariants[$group])) {
                    // Solo incluir si es el item seleccionado
                    if ($item->id === $selectedVariants[$group]) {
                        $filtered->push($item);
                    }
                } else {
                    // Si no hay selección específica, usar el que está marcado como selected en BD
                    if ($item->is_selected) {
                        $filtered->push($item);
                    }
                }
            } else {
                // Item regular (sin variantes), siempre incluir
                $filtered->push($item);
            }
        }

        return $filtered;
    }

    /**
     * Agrupa items incluyendo imágenes destacadas para el PDF
     */
    private function groupItemsWithImages($items)
    {
        $grouped = ['regular' => [], 'variants' => []];

        foreach ($items as $item) {
            // Procesar imagen destacada
            $featuredImage = null;
            if ($item->product && $item->product->featuredImage) {
                $featuredImage = $this->processImage($item->product->featuredImage);
            }

            // Manejar múltiples categorías
            $categoryNames = [];
            if ($item->product && $item->product->categories) {
                $categoryNames = $item->product->categories->pluck('name')->toArray();
            }

            $itemData = [
                'id' => $item->id,
                'quantity' => $item->quantity,
                'unit_price' => $item->unit_price,
                'line_total' => $item->line_total,
                'production_time_days' => $item->production_time_days,
                'logo_printing' => $item->logo_printing,
                'description' => $item->description,
                'variant_group' => $item->variant_group,
                'product' => [
                    'name' => $item->product->name ?? 'Producto',
                    // Devuelve array de categorías
                    'categories' => $categoryNames,
                    'category_display' => !empty($categoryNames)
                        ? implode(', ', $categoryNames)
                        : 'Sin categoría'
                ],
                'featured_image' => $featuredImage
            ];

            if ($item->variant_group) {
                $grouped['variants'][$item->variant_group][] = $itemData;
            } else {
                $grouped['regular'][] = $itemData;
            }
        }

        return $grouped;
    }

    /**
     * Procesa la imagen para el PDF (maneja URLs absolutas y relativas)
     */
    private function processImage($imageModel)
    {
        if (!$imageModel || !$imageModel->url) {
            return null;
        }

        $rawUrl = $imageModel->url;

        // Si es una URL externa (absoluta), la devolvemos tal como está
        if (Str::startsWith($rawUrl, ['http://', 'https://'])) {
            return [
                'url' => $rawUrl,
                'file_path' => $rawUrl, // Para el PDF usamos la misma URL
                'is_external' => true
            ];
        }

        // Si es una ruta local/relativa
        $publicPath = storage_path('app/public/' . $rawUrl);
        $webUrl = asset('storage/' . $rawUrl);

        return [
            'url' => $rawUrl,
            'file_path' => file_exists($publicPath) ? $publicPath : $webUrl, // Para PDF: ruta local si existe, sino web
            'web_url' => $webUrl, // Para uso en web
            'is_external' => false
        ];
    }

    /**
     * Agrupa items por regulares y variantes
     */
    private function groupItemsByVariants($items)
    {
        $grouped = [
            'regular' => [],
            'variants' => []
        ];

        foreach ($items as $item) {
            if ($item->variant_group) {
                if (!isset($grouped['variants'][$item->variant_group])) {
                    $grouped['variants'][$item->variant_group] = [];
                }
                $grouped['variants'][$item->variant_group][] = $item;
            } else {
                $grouped['regular'][] = $item;
            }
        }

        return $grouped;
    }

    /**
     * Calcular totales basados en items filtrados
     */
    private function calculateFilteredTotals($filteredItems, $businessConfig)
    {
        $subtotal = $filteredItems->sum('line_total');
        $ivaAmount = $businessConfig['apply_iva'] ? $subtotal * $businessConfig['iva_rate'] : 0;
        $total = $subtotal + $ivaAmount;

        return [
            'subtotal' => $subtotal,
            'iva' => $ivaAmount,
            'total' => $total,
        ];
    }
}
