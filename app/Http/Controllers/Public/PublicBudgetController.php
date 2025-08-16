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

            // Obtener datos de estado usando el método del modelo
            $statusData = $budget->getStatusData();

            // Agrupar items por variantes para facilitar el manejo en el frontend
            $groupedItems = $this->groupItemsByVariants($budget->items);

            return Inertia::render('public/Budget', [
                'budget' => array_merge([
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
                ], $statusData)
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
                    'items.product.images',
                    'items.product.featuredImage',
                    'items.product.category'
                ])
                ->firstOrFail();

            // Obtener variantes seleccionadas del request
            $selectedVariants = $request->get('selected_variants', []);

            // Filtrar items según las variantes seleccionadas
            $filteredItems = $this->filterItemsByVariants($budget->items, $selectedVariants);

            // Recalcular totales basado en items filtrados
            $subtotal = $filteredItems->sum('line_total');
            $total = $subtotal; // Aquí puedes agregar lógica de IVA si es necesario

            // Obtener datos de estado
            $statusData = $budget->getStatusData();

            //TODO: ver porque no detecta esta clase
            $pdf = Pdf::loadView('pdf.budget', [
                'budget' => array_merge([
                    'title' => $budget->title,
                    'issue_date_formatted' => $budget->issue_date_formatted,
                    'expiry_date_formatted' => $budget->expiry_date_formatted,
                    'footer_comments' => $budget->footer_comments,
                    'subtotal' => $subtotal,
                    'total' => $total,
                    'client' => $budget->client,
                    'user' => $budget->user,
                ], $statusData),
                'items' => $filteredItems,
            ])->setPaper('a4');

            return $pdf->download("presupuesto-{$budget->id}.pdf");
        } catch (\Exception $e) {
            Log::error('Error al generar PDF: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Error al generar el PDF');
        }
    }

    private function groupItemsByVariants($items)
    {
        $grouped = [];
        $regular = [];

        foreach ($items as $item) {
            if ($item->variant_group) {
                if (!isset($grouped[$item->variant_group])) {
                    $grouped[$item->variant_group] = [];
                }
                $grouped[$item->variant_group][] = $item;
            } else {
                $regular[] = $item;
            }
        }

        return [
            'variants' => $grouped,
            'regular' => $regular
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
