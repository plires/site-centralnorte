<?php

namespace App\Services;

use App\Models\PickingBudget;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Str;

class PickingBudgetPdfService
{
    /**
     * Genera el PDF de un presupuesto picking y devuelve la instancia de Pdf.
     */
    public function generate(PickingBudget $budget)
    {
        $budget->load(['client', 'vendor', 'services', 'boxes', 'paymentCondition']);

        $pdf = Pdf::loadView('pdf.picking-budget', [
            'budget'         => $budget,
            'businessConfig' => [
                'iva_rate'  => config('business.tax.iva_rate', 0.21),
                'apply_iva' => config('business.tax.apply_iva', true),
            ],
        ]);

        $pdf->setPaper('a4', 'portrait');

        return $pdf;
    }

    /**
     * Genera el nombre de archivo estándar para el PDF de un presupuesto picking.
     */
    public function filename(PickingBudget $budget): string
    {
        $safeTitle = Str::slug($budget->title, '-');
        return "presupuesto-picking-{$budget->budget_number}-{$safeTitle}.pdf";
    }
}
