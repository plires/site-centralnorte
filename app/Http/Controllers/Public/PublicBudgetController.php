<?php

namespace App\Http\Controllers\Public;

use Inertia\Inertia;
use App\Models\Budget;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Barryvdh\DomPDF\Facade\Pdf;

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

            // Agrupar items por variantes para facilitar el manejo en el frontend
            $groupedItems = $this->groupItemsByVariants($budget->items);

            return Inertia::render('public/Budget', [
                'budget' => [
                    'id' => $budget->id,
                    'title' => $budget->title,
                    'token' => $budget->token,
                    'issue_date' => $budget->issue_date->format('d/m/Y'),
                    'expiry_date' => $budget->expiry_date->format('d/m/Y'),
                    'is_expired' => $budget->is_expired,
                    'days_until_expiry' => $budget->days_until_expiry,
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
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error al mostrar presupuesto público: ' . $e->getMessage());

            return Inertia::render('public/BudgetNotFound', [
                'message' => 'El presupuesto solicitado no existe o ha sido eliminado.'
            ]);
        }
    }

    public function downloadPdf($token, Request $request)
    {
        try {
            $budget = Budget::where('token', $token)
                ->with([
                    'client',
                    'user',
                    'items.product.featuredImage',
                    'items.product.category'
                ])
                ->firstOrFail();

            // Obtener selecciones de variantes del frontend
            $selectedVariants = $request->get('selected_variants', []);

            // Calcular items y totales basados en las selecciones
            $itemsForPdf = $this->calculateItemsForPdf($budget->items, $selectedVariants);
            $totalsForPdf = $this->calculateTotalsForPdf($itemsForPdf);

            // Datos para el PDF
            $pdfData = [
                'budget' => $budget,
                'items' => $itemsForPdf,
                'subtotal' => $totalsForPdf['subtotal'],
                'total' => $totalsForPdf['total'],
                'company_logo' => public_path('images/company-logo.png'), // Ruta al logo
                'selected_variants' => $selectedVariants,
            ];

            // Generar PDF
            $pdf = Pdf::loadView('pdf.budget', $pdfData);
            $pdf->setPaper('A4', 'portrait');

            // Nombre del archivo
            $filename = 'Presupuesto_' . $budget->id . '_' . now()->format('Y-m-d') . '.pdf';

            return $pdf->download($filename);
        } catch (\Exception $e) {
            Log::error('Error al generar PDF: ' . $e->getMessage());

            return redirect()->back()
                ->with('error', 'Error al generar el PDF. Inténtalo nuevamente.');
        }
    }

    /**
     * Agrupa los items por variantes para facilitar el manejo en el frontend
     */
    private function groupItemsByVariants($items)
    {
        $grouped = [];
        $regularItems = [];
        $variantItems = [];

        foreach ($items as $item) {
            if ($item->is_variant && $item->variant_group) {
                $variantItems[$item->variant_group][] = [
                    'id' => $item->id,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'line_total' => $item->line_total,
                    'production_time_days' => $item->production_time_days,
                    'logo_printing' => $item->logo_printing,
                    'product' => [
                        'id' => $item->product->id,
                        'name' => $item->product->name,
                        'sku' => $item->product->sku,
                        'category' => $item->product->category->name ?? 'Sin categoría',
                        'featured_image' => $item->product->featuredImage ? [
                            'url' => $item->product->featuredImage->full_url,
                            'alt' => 'Imagen de ' . $item->product->name
                        ] : null,
                        'images' => $item->product->images->map(function ($img) {
                            return [
                                'url' => $img->full_url,
                                'alt' => 'Imagen de ' . $img->product->name,
                                'is_featured' => $img->is_featured
                            ];
                        })->toArray()
                    ]
                ];
            } else {
                $regularItems[] = [
                    'id' => $item->id,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'line_total' => $item->line_total,
                    'production_time_days' => $item->production_time_days,
                    'logo_printing' => $item->logo_printing,
                    'product' => [
                        'id' => $item->product->id,
                        'name' => $item->product->name,
                        'sku' => $item->product->sku,
                        'category' => $item->product->category->name ?? 'Sin categoría',
                        'featured_image' => $item->product->featuredImage ? [
                            'url' => $item->product->featuredImage->full_url,
                            'alt' => 'Imagen de ' . $item->product->name
                        ] : null,
                        'images' => $item->product->images->map(function ($img) {
                            return [
                                'url' => $img->full_url,
                                'alt' => 'Imagen de ' . $img->product->name,
                                'is_featured' => $img->is_featured
                            ];
                        })->toArray()
                    ]
                ];
            }
        }

        return [
            'regular' => $regularItems,
            'variants' => $variantItems
        ];
    }

    /**
     * Calcula qué items incluir en el PDF basado en las selecciones de variantes
     */
    private function calculateItemsForPdf($allItems, $selectedVariants)
    {
        $itemsForPdf = [];

        foreach ($allItems as $item) {
            if ($item->is_variant && $item->variant_group) {
                // Solo incluir si esta variante fue seleccionada
                if (
                    isset($selectedVariants[$item->variant_group]) &&
                    $selectedVariants[$item->variant_group] == $item->id
                ) {
                    $itemsForPdf[] = $item;
                }
            } else {
                // Incluir todos los items regulares
                $itemsForPdf[] = $item;
            }
        }

        return $itemsForPdf;
    }

    /**
     * Calcula los totales basados en los items seleccionados
     */
    private function calculateTotalsForPdf($items)
    {
        $subtotal = collect($items)->sum('line_total');

        return [
            'subtotal' => $subtotal,
            'total' => $subtotal, // Aquí puedes agregar lógica para impuestos
        ];
    }
}
