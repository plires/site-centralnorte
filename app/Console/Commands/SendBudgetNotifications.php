<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\BudgetNotification;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Mail\BudgetExpiryWarningMail;
use App\Mail\BudgetExpiredMail;

class SendBudgetNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'budget:send-notifications';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Envía notificaciones de presupuestos próximos a vencer o vencidos';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Iniciando envío de notificaciones de presupuestos...');

        try {
            // Obtener notificaciones pendientes que deben enviarse
            $pendingNotifications = BudgetNotification::with(['budget.user', 'budget.client'])
                ->due()
                ->get();

            if ($pendingNotifications->isEmpty()) {
                $this->info('No hay notificaciones pendientes para enviar.');
                return Command::SUCCESS;
            }

            $sentCount = 0;
            $errorCount = 0;

            foreach ($pendingNotifications as $notification) {
                try {
                    $this->sendNotification($notification);
                    $sentCount++;

                    $this->line("✓ Notificación enviada: {$notification->type} para presupuesto #{$notification->budget_id}");
                } catch (\Exception $e) {
                    $errorCount++;
                    $this->error("✗ Error al enviar notificación #{$notification->id}: " . $e->getMessage());
                    Log::error('Error al enviar notificación de presupuesto', [
                        'notification_id' => $notification->id,
                        'budget_id' => $notification->budget_id,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            $this->info("Proceso completado:");
            $this->info("- Notificaciones enviadas: {$sentCount}");
            if ($errorCount > 0) {
                $this->warn("- Errores: {$errorCount}");
            }

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Error general en el comando: ' . $e->getMessage());
            Log::error('Error en comando SendBudgetNotifications', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return Command::FAILURE;
        }
    }

    /**
     * Envía una notificación específica
     */
    private function sendNotification(BudgetNotification $notification)
    {
        $budget = $notification->budget;
        $vendedor = $budget->user;

        // Verificar que el vendedor tenga email
        if (!$vendedor->email) {
            throw new \Exception("El vendedor {$vendedor->name} no tiene email configurado");
        }

        // Enviar según el tipo de notificación
        switch ($notification->type) {
            case 'expiry_warning':
                Mail::to($vendedor->email)->send(new BudgetExpiryWarningMail($budget));
                break;

            case 'expired':
                Mail::to($vendedor->email)->send(new BudgetExpiredMail($budget));
                break;

            default:
                throw new \Exception("Tipo de notificación desconocido: {$notification->type}");
        }

        // Marcar como enviada
        $notification->update([
            'sent' => true,
            'sent_at' => now(),
        ]);
    }
}

// También necesitarás estos Mails adicionales:

namespace App\Mail;

use App\Models\Budget;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BudgetExpiryWarningMail extends Mailable
{
    use Queueable, SerializesModels;

    public Budget $budget;

    public function __construct(Budget $budget)
    {
        $this->budget = $budget;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '⚠️ Presupuesto próximo a vencer: ' . $this->budget->title,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.budget-expiry-warning',
            with: [
                'budget' => $this->budget,
                'daysUntilExpiry' => $this->budget->days_until_expiry,
            ]
        );
    }

    public function attachments(): array
    {
        return [];
    }
}

class BudgetExpiredMail extends Mailable
{
    use Queueable, SerializesModels;

    public Budget $budget;

    public function __construct(Budget $budget)
    {
        $this->budget = $budget;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '❌ Presupuesto vencido: ' . $this->budget->title,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.budget-expired',
            with: [
                'budget' => $this->budget,
            ]
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
