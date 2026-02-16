<?php

namespace App\Http\Controllers\Public;

use Inertia\Inertia;
use App\Models\Budget;
use App\Enums\BudgetStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Str;
use App\Mail\BudgetApprovedVendorMail;
use App\Mail\BudgetRejectedVendorMail;
use Illuminate\Support\Facades\Mail;
use App\Mail\BudgetInReviewVendorMail;

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
                    'items.product.categories',
                    'paymentCondition',
                ])
                ->firstOrFail();

            // Verificar si el presupuesto es visible públicamente
            if (!$budget->isPubliclyVisible()) {
                return $this->renderNotFound($budget);
            }

            // Verificar si está vencido por fecha
            if ($budget->isExpiredByDate()) {
                return Inertia::render('public/components/BudgetNotFound', [
                    'message' => 'Este presupuesto está vencido y no está disponible para visualización.',
                    'reason' => 'expired'
                ]);
            }

            // Obtener datos de estado usando el método del modelo
            $statusData = $budget->getStatusData();

            // Agrupar items por variantes para facilitar el manejo en el frontend
            $groupedItems = $this->groupItemsByVariants($budget->items);

            // Obtener configuración de IVA
            $businessConfig = [
                'iva_rate' => config('business.tax.iva_rate', 0.21),
                'apply_iva' => config('business.tax.apply_iva', true),
            ];

            return Inertia::render('public/budgets/Budget', [
                'budget' => array_merge([
                    'id' => $budget->id,
                    'budget_merch_number' => $budget->budget_merch_number,
                    'title' => $budget->title,
                    'token' => $budget->token,
                    'status' => $budget->status?->value,
                    'status_label' => $budget->status_label,
                    'status_color' => $budget->status_color,
                    'picking_payment_condition_id' => $budget->picking_payment_condition_id,
                    'payment_condition_description' => $budget->payment_condition_description,
                    'payment_condition_percentage' => $budget->payment_condition_percentage,
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
                    'user' => $budget->user ? [
                        'name' => $budget->user->name,
                        'email' => $budget->user->email,
                    ] : null,
                    'grouped_items' => $groupedItems,
                    'variant_groups' => $budget->getVariantGroups(),
                    'has_variants' => $budget->hasVariants(),
                    'issue_date' => $budget->issue_date,
                    'expiry_date' => $budget->expiry_date,
                ], $statusData),
                'businessConfig' => $businessConfig,
            ]);
        } catch (\Exception $e) {
            Log::error('Error al mostrar presupuesto público: ' . $e->getMessage());

            return Inertia::render('public/components/BudgetNotFound', [
                'message' => 'El presupuesto solicitado no existe o ha sido eliminado.',
                'reason' => 'not_found'
            ]);
        }
    }

    /**
     * Cliente aprueba el presupuesto
     */
    public function approve($token)
    {
        try {
            $budget = Budget::where('token', $token)->firstOrFail();

            if (!$budget->allowsClientAction()) {
                return back()->with('error', 'Este presupuesto no permite realizar esta acción.');
            }

            if ($budget->isExpiredByDate()) {
                return back()->with('error', 'Este presupuesto está vencido.');
            }

            $budget->markAsApproved();

            Log::info('Presupuesto aprobado por cliente', [
                'budget_id' => $budget->id,
                'title' => $budget->title,
            ]);

            if ($budget->user && $budget->user->email) {
                $dashboardUrl = route('dashboard.budgets.show', $budget->id);
                Mail::to($budget->user->email)->send(new BudgetApprovedVendorMail($budget, $dashboardUrl));
            }

            return back()->with('success', '¡Presupuesto aprobado correctamente! Nos pondremos en contacto contigo pronto.');
        } catch (\Exception $e) {
            Log::error('Error al aprobar presupuesto: ' . $e->getMessage());
            return back()->with('error', 'Ocurrió un error al procesar tu solicitud.');
        }
    }

    /**
     * Cliente pone el presupuesto en evaluación
     */
    public function inReview($token)
    {
        try {
            $budget = Budget::where('token', $token)->firstOrFail();

            if (!$budget->allowsClientAction()) {
                return back()->with('error', 'Este presupuesto no permite realizar esta acción.');
            }

            if ($budget->isExpiredByDate()) {
                return back()->with('error', 'Este presupuesto está vencido.');
            }

            $budget->markAsInReview();

            Log::info('Presupuesto puesto en evaluación por cliente', [
                'budget_id' => $budget->id,
                'title' => $budget->title,
            ]);

            // Enviar email al vendedor
            if ($budget->user && $budget->user->email) {
                $dashboardUrl = route('dashboard.budgets.show', $budget->id);
                Mail::to($budget->user->email)->send(new BudgetInReviewVendorMail($budget, $dashboardUrl));
            }

            return back()->with('success', 'Presupuesto marcado como "En Evaluación". Te contactaremos pronto.');
        } catch (\Exception $e) {
            Log::error('Error al poner presupuesto en evaluación: ' . $e->getMessage());
            return back()->with('error', 'Ocurrió un error al procesar tu solicitud.');
        }
    }

    /**
     * Generar PDF con variantes seleccionadas por el usuario
     */
    public function downloadPdf($token, Request $request)
    {
        try {
            $budget = Budget::where('token', $token)
                ->with([
                    'client:id,name,company,email,phone',
                    'user:id,name,email',
                    'paymentCondition:id,description,percentage',
                    'items' => function ($query) {
                        $query->with([
                            'product:id,name',
                            'product.categories:id,name',
                            'product.featuredImage:id,product_id,url,is_featured'
                        ]);
                    }
                ])
                ->firstOrFail();

            if (!$budget->isPubliclyVisible()) {
                abort(404, 'Presupuesto no disponible');
            }

            if ($budget->isExpiredByDate()) {
                abort(404, 'Presupuesto vencido');
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

            $calculatedTotals = $this->calculateFilteredTotals(
                $filteredItems,
                $businessConfig,
                $budget
            );

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
                'payment_condition' => $budget->paymentCondition ? [
                    'description' => $budget->payment_condition_description,
                    'percentage' => $budget->payment_condition_percentage,
                    'amount' => $calculatedTotals['payment_condition_amount'],
                ] : null,
                'iva_amount' => $calculatedTotals['iva_amount'],
                'total' => $calculatedTotals['total'],
                'client' => [
                    'name' => $budget->client->name,
                    'company' => $budget->client->company,
                ],
                'user' => [
                    'name' => $budget->user->name,
                ],
                'grouped_items' => $groupedItems,
            ], $statusData);

            $pdf = Pdf::loadView('pdf.budget', [
                'budget' => $budgetData,
                'businessConfig' => $businessConfig,
            ]);

            $pdf->setPaper('a4', 'portrait');

            $safeTitle = Str::slug($budget->title, '-');
            $filename = "presupuesto-{$safeTitle}-{$budget->id}.pdf";

            return $pdf->download($filename);
        } catch (\Exception $e) {
            Log::error('Error al generar PDF público: ' . $e->getMessage());
            abort(404, 'Error al generar el PDF');
        }
    }

    /**
     * Renderizar vista de presupuesto no encontrado según el estado
     */
    private function renderNotFound(Budget $budget): \Inertia\Response
    {
        $messages = [
            BudgetStatus::UNSENT->value => 'Este presupuesto aún no ha sido enviado.',
            BudgetStatus::DRAFT->value => 'Este presupuesto está en borrador y no está disponible.',
            BudgetStatus::APPROVED->value => 'Este presupuesto ya fue aprobado.',
            BudgetStatus::REJECTED->value => 'Este presupuesto fue rechazado.',
            BudgetStatus::EXPIRED->value => 'Este presupuesto está vencido.',
        ];

        $message = $messages[$budget->status?->value] ?? 'Este presupuesto no está disponible.';

        return Inertia::render('public/components/BudgetNotFound', [
            'message' => $message,
            'reason' => $budget->status?->value ?? 'unknown',
        ]);
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
     * Filtrar items basado en variantes seleccionadas
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
     * Agrupar items con imágenes procesadas
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
     * Procesa la imagen para el PDF
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
    private function calculateFilteredTotals($filteredItems, $businessConfig, $budget = null)
    {
        $subtotal = $filteredItems->sum('line_total');

        $paymentConditionAmount = 0;
        if ($budget && $budget->payment_condition_percentage) {
            $paymentConditionAmount = $subtotal * ($budget->payment_condition_percentage / 100);
        }

        $subtotalWithPayment = $subtotal + $paymentConditionAmount;

        $ivaAmount = $businessConfig['apply_iva']
            ? $subtotalWithPayment * $businessConfig['iva_rate']
            : 0;

        $total = $subtotalWithPayment + $ivaAmount;

        return [
            'subtotal' => $subtotal,
            'payment_condition_amount' => $paymentConditionAmount,
            'iva_amount' => $ivaAmount,
            'total' => $total,
        ];
    }
}
