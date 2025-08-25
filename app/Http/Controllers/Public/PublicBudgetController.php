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
                    'items.product.category'
                ])
                ->firstOrFail();

            // Verificar si el presupuesto está activo
            if (!$budget->is_active) {
                return Inertia::render('public/BudgetNotFound', [
                    'message' => 'Este presupuesto ha sido desactivado temporalmente y no está disponible para visualización.',
                    'reason' => 'inactive'
                ]);
            }

            // Obtener datos de estado usando el método del modelo
            $statusData = $budget->getStatusData();

            // Agrupar items por variantes para facilitar el manejo en el frontend
            $groupedItems = $this->groupItemsByVariants($budget->items);

            // Obtener configuración de IVA (igual que en DashboardBudgetController)
            $businessConfig = [
                'iva_rate' => config('business.tax.iva_rate', 0.21),
                'apply_iva' => config('business.tax.apply_iva', true),
            ];

            return Inertia::render('public/Budget', [
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

            return Inertia::render('public/BudgetNotFound', [
                'message' => 'El presupuesto solicitado no existe o ha sido eliminado.',
                'reason' => 'not_found'
            ]);
        }
    }

    public function downloadPdf($token)
    {
        try {
            // OPTIMIZADO: Una sola query con las relaciones necesarias para imágenes
            $budget = Budget::where('token', $token)
                ->with([
                    'client:id,name,company,email,phone',
                    'user:id,name,email',
                    'items' => function ($query) {
                        $query->where(function ($q) {
                            $q->whereNull('variant_group')->orWhere('is_selected', true);
                        })->with([
                            'product:id,name',
                            'product.category:id,name',
                            'product.featuredImage:id,product_id,url,is_featured' // AGREGADO: Solo imagen destacada
                        ]);
                    }
                ])
                ->firstOrFail();

            if (!$budget->is_active) {
                abort(404, 'Presupuesto no disponible');
            }

            // OPTIMIZADO: Ahora incluye imágenes sin bucles adicionales
            $groupedItems = $this->groupItemsWithImages($budget->items);

            $businessConfig = [
                'iva_rate' => config('business.tax.iva_rate', 0.21),
                'apply_iva' => config('business.tax.apply_iva', true),
            ];

            $statusData = $budget->getStatusData();
            $calculatedTotals = $this->calculateFilteredTotals($budget->items, $businessConfig);

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
     * NUEVO: Agrupa items incluyendo imágenes destacadas para el PDF
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
                    'category' => ['name' => $item->product->category->name ?? '']
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
     * NUEVO: Procesa la imagen para el PDF (maneja URLs absolutas y relativas)
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
     * MÉTODO ORIGINAL - sin cambios de imágenes
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
     * ULTRA SIMPLE: Sin queries de imágenes en bucle
     */
    private function groupItemsSimple($items)
    {
        $grouped = ['regular' => [], 'variants' => []];

        foreach ($items as $item) {
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
                    'category' => ['name' => $item->product->category->name ?? '']
                ],
                'featured_image' => null // Sin imágenes por ahora para velocidad
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

    private function filterItemsByVariants($items, $selectedVariants)
    {
        return $items->filter(function ($item) use ($selectedVariants) {
            // Si no tiene grupo de variante, incluirlo siempre
            if (!$item->variant_group) {
                return true;
            }

            // Si tiene grupo de variante, incluirlo solo si está seleccionado
            return isset($selectedVariants[$item->variant_group]) &&
                $selectedVariants[$item->variant_group] == $item->id;
        });
    }
}
