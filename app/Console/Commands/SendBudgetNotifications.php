<?php

namespace App\Console\Commands;

use App\Models\Budget;
use App\Enums\BudgetStatus;
use App\Mail\BudgetExpiredMail;
use Illuminate\Console\Command;
use App\Models\BudgetNotification;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\BudgetExpiredClientMail;
use App\Mail\BudgetExpiryWarningMail;
use App\Mail\BudgetExpiryWarningClientMail;

class SendBudgetNotifications extends Command
{
    protected $signature = 'budget:send-notifications';
    protected $description = 'Envía notificaciones de presupuestos próximos a vencer o vencidos';

    public function handle()
    {
        $this->info('Iniciando envío de notificaciones de presupuestos...');

        try {
            $warningDays = config('budget.warning_days', env('BUDGET_WARNING_DAYS', 3));

            // ENFOQUE DIRECTO: Buscar presupuestos que necesitan notificación
            $budgetsExpiringSoon = $this->getBudgetsExpiringSoon($warningDays);
            $budgetsExpiredToday = $this->getBudgetsExpiredToday();

            $totalSent = 0;

            // Procesar presupuestos que expiran pronto (3 días o menos)
            foreach ($budgetsExpiringSoon as $budget) {
                $statusData = $budget->getStatusData();
                if ($this->sendExpiryWarning($budget, $statusData['days_until_expiry'])) {
                    $totalSent++;
                }
            }

            // Procesar presupuestos que vencen hoy
            foreach ($budgetsExpiredToday as $budget) {
                if ($this->sendExpiredNotification($budget)) {
                    $totalSent++;
                }
            }

            $this->info("Proceso completado: {$totalSent} notificaciones enviadas.");
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
     * Obtener presupuestos que expiran en X días o menos y necesitan aviso
     */
    private function getBudgetsExpiringSoon(int $warningDays)
    {
        // Obtener todos los presupuestos enviados que no han vencido aún
        $activeBudgets = Budget::with(['user', 'client'])
            ->where('status', BudgetStatus::SENT)
            ->where('expiry_date', '>', now()->startOfDay())
            ->whereDoesntHave('notifications', function ($query) {
                $query->where('type', 'expiry_warning')
                    ->where('sent', true);
            })
            ->get();

        // Filtrar usando getStatusData() para encontrar los que vencen en warningDays o menos
        return $activeBudgets->filter(function ($budget) use ($warningDays) {
            $statusData = $budget->getStatusData();
            return !$statusData['is_expired'] &&
                !$statusData['is_expiring_today'] &&
                $statusData['days_until_expiry'] <= $warningDays;
        });
    }

    /**
     * Obtener presupuestos que vencen hoy y necesitan notificación
     */
    private function getBudgetsExpiredToday()
    {
        // Obtener presupuestos enviados y usar getStatusData() para verificar si vencen hoy
        $activeBudgets = Budget::with(['user', 'client'])
            ->where('status', BudgetStatus::SENT)
            ->whereDate('expiry_date', now()->startOfDay())
            ->whereDoesntHave('notifications', function ($query) {
                $query->where('type', 'expired')
                    ->where('sent', true);
            })
            ->get();

        // Filtrar usando getStatusData() para confirmar que vencen hoy
        return $activeBudgets->filter(function ($budget) {
            $statusData = $budget->getStatusData();
            return $statusData['is_expiring_today'] || $statusData['is_expired'];
        });
    }

    /**
     * Enviar aviso de vencimiento próximo
     */
    private function sendExpiryWarning(Budget $budget, int $actualDaysUntilExpiry)
    {
        try {
            // Crear registro de notificación para control
            $notification = BudgetNotification::create([
                'budget_id' => $budget->id,
                'type' => 'expiry_warning',
                'scheduled_for' => now(),
                'notification_data' => [
                    'days_until_expiry' => $actualDaysUntilExpiry,
                ]
            ]);

            $sent = 0;
            $errors = [];

            // Enviar al vendedor
            try {
                if ($budget->user->email) {
                    $dashboardUrl = route('dashboard.budgets.show', $budget->id);
                    Mail::to($budget->user->email)->send(new BudgetExpiryWarningMail($budget, $dashboardUrl));
                    $sent++;
                    $this->line("  → Aviso enviado al vendedor: {$budget->user->email} (vence en {$actualDaysUntilExpiry} días)");
                } else {
                    $errors[] = "Vendedor sin email";
                }
            } catch (\Exception $e) {
                $errors[] = "Error vendedor: " . $e->getMessage();
            }

            // Enviar al cliente
            try {
                if ($budget->client->email) {
                    $publicUrl = route('public.budget.show', $budget->token);
                    Mail::to($budget->client->email)->send(new BudgetExpiryWarningClientMail($budget, $publicUrl));
                    $sent++;
                    $this->line("  → Aviso enviado al cliente: {$budget->client->email} (vence en {$actualDaysUntilExpiry} días)");
                } else {
                    $errors[] = "Cliente sin email";
                }
            } catch (\Exception $e) {
                $errors[] = "Error cliente: " . $e->getMessage();
            }

            // Marcar como enviada si se envió al menos uno
            if ($sent > 0) {
                $notification->update([
                    'sent' => true,
                    'sent_at' => now(),
                    'notification_data' => array_merge($notification->notification_data, [
                        'emails_sent' => $sent,
                        'errors' => $errors
                    ])
                ]);

                $this->info("✓ Aviso de vencimiento enviado para presupuesto #{$budget->id} ({$sent} emails, vence en {$actualDaysUntilExpiry} días)");

                if (!empty($errors)) {
                    $this->warn("  Errores: " . implode(', ', $errors));
                }

                return true;
            } else {
                $this->error("✗ No se pudo enviar ningún email para presupuesto #{$budget->id}");
                return false;
            }
        } catch (\Exception $e) {
            $this->error("✗ Error con presupuesto #{$budget->id}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Enviar notificación de vencimiento
     */
    private function sendExpiredNotification(Budget $budget)
    {
        try {
            // Crear registro de notificación para control
            $notification = BudgetNotification::create([
                'budget_id' => $budget->id,
                'type' => 'expired',
                'scheduled_for' => now(),
                'notification_data' => []
            ]);

            $sent = 0;
            $errors = [];

            // Enviar al vendedor
            try {
                if ($budget->user->email) {
                    $dashboardUrl = route('dashboard.budgets.show', $budget->id);
                    Mail::to($budget->user->email)->send(new BudgetExpiredMail($budget, $dashboardUrl));
                    $sent++;
                    $this->line("  → Vencimiento enviado al vendedor: {$budget->user->email}");
                } else {
                    $errors[] = "Vendedor sin email";
                }
            } catch (\Exception $e) {
                $errors[] = "Error vendedor: " . $e->getMessage();
            }

            // Enviar al cliente
            try {
                if ($budget->client->email) {
                    $publicUrl = route('public.budget.show', $budget->token);
                    Mail::to($budget->client->email)->send(new BudgetExpiredClientMail($budget, $publicUrl));
                    $sent++;
                    $this->line("  → Vencimiento enviado al cliente: {$budget->client->email}");
                } else {
                    $errors[] = "Cliente sin email";
                }
            } catch (\Exception $e) {
                $errors[] = "Error cliente: " . $e->getMessage();
            }

            // Marcar como enviada si se envió al menos uno
            if ($sent > 0) {
                $notification->update([
                    'sent' => true,
                    'sent_at' => now(),
                    'notification_data' => [
                        'emails_sent' => $sent,
                        'errors' => $errors
                    ]
                ]);

                $this->info("✓ Notificación de vencimiento enviada para presupuesto #{$budget->id} ({$sent} emails)");

                if (!empty($errors)) {
                    $this->warn("  Errores: " . implode(', ', $errors));
                }

                return true;
            } else {
                $this->error("✗ No se pudo enviar ningún email para presupuesto #{$budget->id}");
                return false;
            }
        } catch (\Exception $e) {
            $this->error("✗ Error con presupuesto #{$budget->id}: " . $e->getMessage());
            return false;
        }
    }
}
