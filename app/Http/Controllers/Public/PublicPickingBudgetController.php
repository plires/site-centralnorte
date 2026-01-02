<?php

namespace App\Http\Controllers\Public;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\PickingBudget;
use App\Enums\BudgetStatus;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Mail\PickingBudgetApprovedVendorMail;
use App\Mail\PickingBudgetRejectedVendorMail;
use Illuminate\Support\Facades\Mail;

class PublicPickingBudgetController extends Controller
{
    /**
     * Mostrar vista pública del presupuesto de picking
     */
    public function show($token)
    {
        try {
            $budget = PickingBudget::where('token', $token)
                ->with([
                    'client:id,name,company,email,phone',
                    'vendor:id,name,email',
                    'services',
                    'boxes',
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

            $statusData = $budget->getStatusData();
            $businessConfig = [
                'iva_rate' => config('business.tax.iva_rate', 0.21),
                'apply_iva' => config('business.tax.apply_iva', true),
            ];

            return Inertia::render('public/picking/PickingBudget', [
                'budget' => array_merge($budget->toArray(), $statusData),
                'businessConfig' => $businessConfig,
            ]);
        } catch (\Exception $e) {
            Log::error('Error al mostrar presupuesto de picking público: ' . $e->getMessage());

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
            $budget = PickingBudget::where('token', $token)->firstOrFail();

            if (!$budget->allowsClientAction()) {
                return back()->with('error', 'Este presupuesto no permite realizar esta acción.');
            }

            if ($budget->isExpiredByDate()) {
                return back()->with('error', 'Este presupuesto está vencido.');
            }

            $budget->markAsApproved();

            Log::info('Presupuesto de picking aprobado por cliente', [
                'budget_id' => $budget->id,
                'budget_number' => $budget->budget_number,
            ]);

            if ($budget->vendor && $budget->vendor->email) {
                $dashboardUrl = route('dashboard.picking.budgets.show', $budget->id);
                Mail::to($budget->vendor->email)->send(new PickingBudgetApprovedVendorMail($budget, $dashboardUrl));
            }

            return back()->with('success', '¡Presupuesto aprobado correctamente! Nos pondremos en contacto contigo pronto.');
        } catch (\Exception $e) {
            Log::error('Error al aprobar presupuesto de picking: ' . $e->getMessage());
            return back()->with('error', 'Ocurrió un error al procesar tu solicitud.');
        }
    }

    /**
     * Cliente rechaza el presupuesto
     */
    public function reject($token, Request $request)
    {
        try {
            $budget = PickingBudget::where('token', $token)->firstOrFail();

            if (!$budget->allowsClientAction()) {
                return back()->with('error', 'Este presupuesto no permite realizar esta acción.');
            }

            if ($budget->isExpiredByDate()) {
                return back()->with('error', 'Este presupuesto está vencido.');
            }

            $budget->markAsRejected();

            // Guardar motivo de rechazo en rejection_comments (igual que Budget)
            if ($request->has('reason') && !empty($request->reason)) {
                $budget->update([
                    'rejection_comments' => $request->reason
                ]);
            }

            Log::info('Presupuesto de picking rechazado por cliente', [
                'budget_id' => $budget->id,
                'budget_number' => $budget->budget_number,
                'reason' => $request->reason ?? 'No especificado',
            ]);

            if ($budget->vendor && $budget->vendor->email) {
                $dashboardUrl = route('dashboard.picking.budgets.show', $budget->id);
                Mail::to($budget->vendor->email)->send(new PickingBudgetRejectedVendorMail($budget, $dashboardUrl, $request->reason));
            }

            return back()->with('success', 'Presupuesto rechazado. Gracias por tu respuesta.');
        } catch (\Exception $e) {
            Log::error('Error al rechazar presupuesto de picking: ' . $e->getMessage());
            return back()->with('error', 'Ocurrió un error al procesar tu solicitud.');
        }
    }

    /**
     * Descargar PDF del presupuesto
     */
    public function downloadPdf($token)
    {
        try {
            $budget = PickingBudget::where('token', $token)
                ->with([
                    'client:id,name,company,email,phone,address',
                    'vendor:id,name,email',
                    'services',
                    'boxes',
                    'paymentCondition',
                ])
                ->firstOrFail();

            if (!$budget->isPubliclyVisible()) {
                abort(404, 'Presupuesto no disponible');
            }

            if ($budget->isExpiredByDate()) {
                abort(404, 'Presupuesto vencido');
            }

            $businessConfig = [
                'iva_rate' => config('business.tax.iva_rate', 0.21),
                'apply_iva' => config('business.tax.apply_iva', true),
            ];

            $pdf = Pdf::loadView('pdf.picking-budget', [
                'budget' => $budget,
                'businessConfig' => $businessConfig,
            ]);

            $pdf->setPaper('a4', 'portrait');

            return $pdf->download("presupuesto-picking-{$budget->budget_number}.pdf");
        } catch (\Exception $e) {
            Log::error('Error al generar PDF de picking público: ' . $e->getMessage());
            abort(404, 'Error al generar el PDF');
        }
    }

    /**
     * Renderizar vista de presupuesto no encontrado según el estado
     */
    private function renderNotFound(PickingBudget $budget): \Inertia\Response
    {
        $messages = [
            BudgetStatus::UNSENT->value => 'Este presupuesto aún no ha sido enviado.',
            BudgetStatus::DRAFT->value => 'Este presupuesto está en borrador y no está disponible.',
            BudgetStatus::APPROVED->value => 'Este presupuesto ya fue aprobado.',
            BudgetStatus::REJECTED->value => 'Este presupuesto fue rechazado.',
            BudgetStatus::EXPIRED->value => 'Este presupuesto está vencido.',
        ];

        $message = $messages[$budget->status->value] ?? 'Este presupuesto no está disponible.';

        return Inertia::render('public/components/BudgetNotFound', [
            'message' => $message,
            'reason' => $budget->status->value,
        ]);
    }
}
