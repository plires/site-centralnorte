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

            // NUEVO: Verificar si el presupuesto está activo
            if (!$budget->is_active) {
                return Inertia::render('public/BudgetNotFound', [
                    'message' => 'Este presupuesto ha sido desactivado temporalmente y no está disponible para visualización.',
                    'reason' => 'inactive'
                ]);
            }

            // Obtener datos de estado usando el método del modelo
            $statusData = $budget->getStatusData();

            // OPCIONAL: También verificar si está vencido (puedes comentar esto si quieres mostrar presupuestos vencidos)
            /*
            if ($budget->is_expired) {
                return Inertia::render('public/BudgetNotFound', [
                    'message' => 'Este presupuesto ha expirado y ya no está disponible.',
                    'reason' => 'expired'
                ]);
            }
            */

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
            $budget = Budget::where('token', $token)
                ->with([
                    'client',
                    'user',
                    'items.product.images',
                    'items.product.featuredImage',
                    'items.product.category'
                ])
                ->firstOrFail();

            // NUEVO: Verificar si el presupuesto está activo antes de generar PDF
            if (!$budget->is_active) {
                abort(404, 'Presupuesto no disponible');
            }

            // Agrupar items por variantes
            $groupedItems = $this->groupItemsByVariants($budget->items);

            // Obtener configuración de IVA
            $businessConfig = [
                'iva_rate' => config('business.tax.iva_rate', 0.21),
                'apply_iva' => config('business.tax.apply_iva', true),
            ];

            // Obtener datos de estado
            $statusData = $budget->getStatusData();

            // Preparar datos para el PDF
            $budgetData = array_merge([
                'id' => $budget->id,
                'title' => $budget->title,
                'token' => $budget->token,
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
            ], $statusData);

            // Generar PDF
            $pdf = Pdf::loadView('pdf.budget', [
                'budget' => $budgetData,
                'businessConfig' => $businessConfig,
            ]);

            // Nombre del archivo
            $filename = 'Presupuesto_' . str_replace(' ', '_', $budget->title) . '.pdf';

            return $pdf->download($filename);
        } catch (\Exception $e) {
            Log::error('Error al generar PDF del presupuesto público: ' . $e->getMessage());
            abort(500, 'Error al generar el PDF');
        }
    }

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
