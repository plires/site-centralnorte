<?php

namespace App\Services;

use App\Models\Budget;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Str;

class BudgetPdfService
{
    /**
     * Genera el PDF de un presupuesto merch y devuelve la instancia de Pdf.
     */
    public function generate(Budget $budget)
    {
        $budget->load([
            'client',
            'user',
            'items.product.featuredImage',
            'items.product.categories',
            'items.product.variants',
            'items.productVariant',
            'paymentCondition',
        ]);

        $groupedItems = $this->processItems($budget->items);

        $businessConfig = [
            'iva_rate'  => config('business.tax.iva_rate', 0.21),
            'apply_iva' => config('business.tax.apply_iva', true),
        ];

        $statusData = $budget->getStatusData();

        $budgetData = array_merge([
            'id'                            => $budget->id,
            'budget_merch_number'           => $budget->budget_merch_number,
            'title'                         => $budget->title,
            'token'                         => $budget->token,
            'status'                        => $budget->status?->value,
            'status_label'                  => $budget->status_label,
            'status_color'                  => $budget->status_color,
            'status_text'                   => $budget->status_label,
            'picking_payment_condition_id'  => $budget->picking_payment_condition_id,
            'payment_condition_amount'      => $budget->payment_condition_amount,
            'payment_condition_percentage'  => $budget->payment_condition_percentage,
            'payment_condition_description' => $budget->payment_condition_description,
            'issue_date_formatted'          => $budget->issue_date_formatted,
            'expiry_date_formatted'         => $budget->expiry_date_formatted,
            'issue_date_short'              => $budget->issue_date_short,
            'expiry_date_short'             => $budget->expiry_date_short,
            'footer_comments'               => $budget->footer_comments,
            'subtotal'                      => $budget->subtotal,
            'total'                         => $budget->total,
            'payment_condition'             => $budget->paymentCondition ? [
                'description' => $budget->payment_condition_description,
                'percentage'  => $budget->payment_condition_percentage,
                'amount'      => $budget->payment_condition_amount,
            ] : null,
            'client' => [
                'name'    => $budget->client->name,
                'company' => $budget->client->company,
            ],
            'user' => [
                'name'  => $budget->user?->name ?? 'Central Norte',
                'email' => $budget->user?->email ?? null,
            ],
            'grouped_items' => $groupedItems,
        ], $statusData);

        $pdf = Pdf::loadView('pdf.budget', [
            'budget'         => $budgetData,
            'businessConfig' => $businessConfig,
        ]);

        $pdf->setPaper('a4', 'portrait');

        return $pdf;
    }

    /**
     * Genera el nombre de archivo estándar para el PDF de un presupuesto merch.
     */
    public function filename(Budget $budget): string
    {
        $safeTitle = Str::slug($budget->title, '-');
        return "presupuesto-merch-{$budget->budget_merch_number}-{$safeTitle}.pdf";
    }

    /**
     * Procesa los items del presupuesto para el PDF.
     * Solo incluye variantes seleccionadas (is_selected = true).
     */
    private function processItems($items): array
    {
        $grouped = [
            'regular'  => [],
            'variants' => [],
        ];

        foreach ($items as $item) {
            if ($item->variant_group && ! $item->is_selected) {
                continue;
            }

            $featuredImage = null;
            if ($item->product && $item->product->featuredImage) {
                $featuredImage = $this->processImage($item->product->featuredImage);
            }

            $categoryNames = [];
            if ($item->product && $item->product->categories) {
                $categoryNames = $item->product->categories->pluck('name')->toArray();
            }

            $itemData = [
                'id'                  => $item->id,
                'product_id'          => $item->product_id,
                'quantity'            => $item->quantity,
                'unit_price'          => $item->unit_price,
                'line_total'          => $item->line_total,
                'production_time_days'=> $item->production_time_days,
                'logo_printing'       => $item->logo_printing,
                'variant_group'       => $item->variant_group,
                'is_variant'          => $item->is_variant,
                'is_selected'         => $item->is_selected,
                'product'             => [
                    'id'               => $item->product->id ?? null,
                    'name'             => $item->product->name ?? 'Producto',
                    'sku'              => $item->product->sku ?? null,
                    'categories'       => $categoryNames,
                    'category_display' => ! empty($categoryNames)
                        ? implode(', ', $categoryNames)
                        : 'Sin categoría',
                ],
                'featured_image' => $featuredImage,
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
     * Procesa una imagen para incluirla en el PDF (URL externa o path local).
     */
    private function processImage($imageModel): ?array
    {
        if (! $imageModel || ! $imageModel->url) {
            return null;
        }

        $rawUrl = $imageModel->url;

        if (Str::startsWith($rawUrl, ['http://', 'https://'])) {
            return [
                'url'         => $rawUrl,
                'file_path'   => $rawUrl,
                'is_external' => true,
            ];
        }

        $publicPath = storage_path('app/public/' . $rawUrl);
        $webUrl     = asset('storage/' . $rawUrl);

        return [
            'url'         => $rawUrl,
            'file_path'   => file_exists($publicPath) ? $publicPath : $webUrl,
            'web_url'     => $webUrl,
            'is_external' => false,
        ];
    }
}
