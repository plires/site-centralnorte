<?php

namespace App\Http\Controllers\Dev;

use App\Http\Controllers\Controller;
use App\Models\Budget;
use App\Models\PickingBudget;
use Illuminate\Http\Response;

class MailPreviewController extends Controller
{
    // -----------------------------------------------------------------------
    // Helpers privados
    // -----------------------------------------------------------------------

    private function budget(): Budget
    {
        return Budget::with(['client', 'user', 'items.product', 'items.productVariant'])
            ->latest()
            ->firstOrFail();
    }

    private function pickingBudget(): PickingBudget
    {
        return PickingBudget::with(['client', 'vendor', 'services', 'boxes'])
            ->latest()
            ->firstOrFail();
    }

    private function html(string $view, array $data): Response
    {
        return response(view($view, $data)->render());
    }

    // -----------------------------------------------------------------------
    // INDEX: listado de todas las plantillas disponibles
    // -----------------------------------------------------------------------

    public function index(): Response
    {
        $links = [
            'Merchandising — Cliente' => [
                'budget-created'               => 'Presupuesto creado / enviado al cliente',
                'budget-created-resend'        => 'Presupuesto reenviado al cliente',
                'budget-expiry-warning-client' => 'Aviso de vencimiento próximo (cliente)',
                'budget-expired-client'        => 'Presupuesto vencido (cliente)',
            ],
            'Merchandising — Vendedor' => [
                'budget-approved-vendor'       => 'Presupuesto aprobado (vendedor)',
                'budget-rejected-vendor'       => 'Presupuesto rechazado (vendedor)',
                'budget-in-review-vendor'      => 'Presupuesto en evaluación (vendedor)',
                'budget-expiry-warning'        => 'Aviso de vencimiento próximo (vendedor)',
                'budget-expired'               => 'Presupuesto vencido (vendedor)',
            ],
            'Picking — Cliente' => [
                'picking-budget-sent'          => 'Presupuesto picking enviado al cliente',
            ],
            'Picking — Vendedor' => [
                'picking-budget-approved-vendor'  => 'Presupuesto picking aprobado (vendedor)',
                'picking-budget-rejected-vendor'  => 'Presupuesto picking rechazado (vendedor)',
                'picking-budget-in-review-vendor' => 'Presupuesto picking en evaluación (vendedor)',
            ],
            'Otros' => [
                'contact-message-received' => 'Mensaje de contacto recibido',
                'new-quote-request'        => 'Nueva solicitud de presupuesto',
            ],
        ];

        $html = '<html><head><meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 40px; color: #333; }
                h1 { color: #3d5095; }
                h2 { color: #19ac90; margin-top: 30px; font-size: 15px; text-transform: uppercase; letter-spacing: 1px; }
                ul { list-style: none; padding: 0; }
                li { background: #fff; margin: 6px 0; border-radius: 6px; box-shadow: 0 1px 4px rgba(0,0,0,.08); }
                a { display: block; padding: 12px 18px; text-decoration: none; color: #3d5095; font-size: 14px; }
                a:hover { background: #e7f3ff; border-radius: 6px; }
                .slug { color: #aaa; font-size: 12px; margin-left: 8px; }
            </style>
        </head><body>
            <h1>📧 Preview de plantillas de email</h1>
            <p style="color:#888;font-size:13px;">Solo disponible en entorno <strong>local</strong>. Usa el último registro disponible de la base de datos.</p>';

        foreach ($links as $grupo => $items) {
            $html .= "<h2>{$grupo}</h2><ul>";
            foreach ($items as $slug => $label) {
                $html .= "<li><a href=\"/dev/mails/{$slug}\">{$label} <span class=\"slug\">/dev/mails/{$slug}</span></a></li>";
            }
            $html .= '</ul>';
        }

        $html .= '</body></html>';

        return response($html);
    }

    // -----------------------------------------------------------------------
    // Merchandising — Cliente
    // -----------------------------------------------------------------------

    public function budgetCreated(): Response
    {
        $budget = $this->budget();

        return $this->html('emails.budget-created', [
            'budget'    => $budget,
            'client'    => $budget->client,
            'vendedor'  => $budget->user,
            'user'      => $budget->user,
            'publicUrl' => url("/presupuesto/{$budget->token}"),
            'isResend'  => false,
        ]);
    }

    public function budgetCreatedResend(): Response
    {
        $budget = $this->budget();

        return $this->html('emails.budget-created', [
            'budget'    => $budget,
            'client'    => $budget->client,
            'vendedor'  => $budget->user,
            'user'      => $budget->user,
            'publicUrl' => url("/presupuesto/{$budget->token}"),
            'isResend'  => true,
        ]);
    }

    public function budgetExpiryWarningClient(): Response
    {
        $budget = $this->budget();

        return $this->html('emails.budget-expiry-warning-client', [
            'budget'      => $budget,
            'warningDays' => (int) env('BUDGET_WARNING_DAYS', 3),
            'publicUrl'   => url("/presupuesto/{$budget->token}"),
            'vendedor'    => $budget->user,
        ]);
    }

    public function budgetExpiredClient(): Response
    {
        $budget = $this->budget();

        return $this->html('emails.budget-expired-client', [
            'budget'    => $budget,
            'publicUrl' => url("/presupuesto/{$budget->token}"),
            'vendedor'  => $budget->user,
        ]);
    }

    // -----------------------------------------------------------------------
    // Merchandising — Vendedor
    // -----------------------------------------------------------------------

    public function budgetApprovedVendor(): Response
    {
        $budget = $this->budget();

        return $this->html('emails.budget-approved-vendor', [
            'budget'       => $budget,
            'vendedor'     => $budget->user,
            'dashboardUrl' => url("/dashboard/budgets/{$budget->id}"),
        ]);
    }

    public function budgetRejectedVendor(): Response
    {
        $budget = $this->budget();

        return $this->html('emails.budget-rejected-vendor', [
            'budget'          => $budget,
            'vendedor'        => $budget->user,
            'dashboardUrl'    => url("/dashboard/budgets/{$budget->id}"),
            'rejectionReason' => $budget->rejection_reason ?? 'Motivo de ejemplo para preview',
        ]);
    }

    public function budgetInReviewVendor(): Response
    {
        $budget = $this->budget();

        return $this->html('emails.budget-in-review-vendor', [
            'budget'       => $budget,
            'vendedor'     => $budget->user,
            'cliente'      => $budget->client,
            'dashboardUrl' => url("/dashboard/budgets/{$budget->id}"),
        ]);
    }

    public function budgetExpiryWarning(): Response
    {
        $budget = $this->budget();

        return $this->html('emails.budget-expiry-warning', [
            'budget'          => $budget,
            'daysUntilExpiry' => 3,
            'dashboardUrl'    => url("/dashboard/budgets/{$budget->id}"),
        ]);
    }

    public function budgetExpired(): Response
    {
        $budget = $this->budget();

        return $this->html('emails.budget-expired', [
            'budget'       => $budget,
            'dashboardUrl' => url("/dashboard/budgets/{$budget->id}"),
        ]);
    }

    // -----------------------------------------------------------------------
    // Picking — Cliente
    // -----------------------------------------------------------------------

    public function pickingBudgetSent(): Response
    {
        $budget = $this->pickingBudget();

        return $this->html('emails.picking-budget-sent', [
            'budget'    => $budget,
            'vendedor'  => $budget->vendor,
            'publicUrl' => url("/presupuesto-picking/{$budget->token}"),
        ]);
    }

    // -----------------------------------------------------------------------
    // Picking — Vendedor
    // -----------------------------------------------------------------------

    public function pickingBudgetApprovedVendor(): Response
    {
        $budget = $this->pickingBudget();

        return $this->html('emails.picking-budget-approved-vendor', [
            'budget'       => $budget,
            'vendedor'     => $budget->vendor,
            'dashboardUrl' => url("/dashboard/picking/{$budget->id}"),
        ]);
    }

    public function pickingBudgetRejectedVendor(): Response
    {
        $budget = $this->pickingBudget();

        return $this->html('emails.picking-budget-rejected-vendor', [
            'budget'          => $budget,
            'vendedor'        => $budget->vendor,
            'dashboardUrl'    => url("/dashboard/picking/{$budget->id}"),
            'rejectionReason' => 'Motivo de ejemplo para preview',
        ]);
    }

    public function pickingBudgetInReviewVendor(): Response
    {
        $budget = $this->pickingBudget();

        return $this->html('emails.picking-budget-in-review-vendor', [
            'budget'       => $budget,
            'vendedor'     => $budget->vendor,
            'cliente'      => $budget->client,
            'dashboardUrl' => url("/dashboard/picking/{$budget->id}"),
        ]);
    }

    // -----------------------------------------------------------------------
    // Otros
    // -----------------------------------------------------------------------

    public function contactMessageReceived(): Response
    {
        // Datos de ejemplo — ContactMessage puede no tener registros en local
        $fakeMessage = (object) [
            'name'       => 'Juan',
            'last_name'  => 'Pérez',
            'email'      => 'juan@ejemplo.com',
            'phone'      => '+54 11 1234-5678',
            'company'    => 'Empresa Ejemplo S.A.',
            'message'    => 'Hola, me gustaría solicitar información sobre sus servicios de picking y armado de kits para nuestra empresa.',
            'created_at' => now(),
        ];

        return $this->html('emails.contact-message-received', [
            'contactMessage' => $fakeMessage,
        ]);
    }

    public function newQuoteRequest(): Response
    {
        $budget = $this->budget();

        return $this->html('emails.new-quote-request', [
            'budget'       => $budget,
            'vendedor'     => $budget->user,
            'client'       => $budget->client,
            'dashboardUrl' => url("/dashboard/budgets/{$budget->id}"),
            'items'        => $budget->items,
        ]);
    }
}
