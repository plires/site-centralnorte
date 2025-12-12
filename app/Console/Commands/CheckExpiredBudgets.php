<?php

namespace App\Console\Commands;

use App\Models\Budget;
use App\Models\PickingBudget;
use App\Enums\BudgetStatus;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckExpiredBudgets extends Command
{
    protected $signature = 'budgets:check-expired';

    protected $description = 'Marca como vencidos los presupuestos (merch y picking) que superaron su fecha de validez';

    public function handle()
    {
        $this->info('Verificando presupuestos vencidos...');
        $this->newLine();

        $totalExpired = 0;

        // 1. Verificar presupuestos de Merch
        $totalExpired += $this->checkMerchBudgets();

        // 2. Verificar presupuestos de Picking
        $totalExpired += $this->checkPickingBudgets();

        $this->newLine();
        $this->info("✓ Proceso completado: {$totalExpired} presupuesto(s) marcado(s) como vencido(s).");

        return Command::SUCCESS;
    }

    /**
     * Verificar y actualizar presupuestos de Merch
     */
    private function checkMerchBudgets(): int
    {
        $this->info('📦 Presupuestos de Merch:');

        $expiredBudgets = Budget::where('expiry_date', '<', now()->startOfDay())
            ->whereIn('status', [
                BudgetStatus::UNSENT,
                BudgetStatus::DRAFT,
                BudgetStatus::SENT,
            ])
            ->get();

        if ($expiredBudgets->isEmpty()) {
            $this->line('   No se encontraron presupuestos vencidos.');
            return 0;
        }

        $count = 0;
        foreach ($expiredBudgets as $budget) {
            $budget->markAsExpired();
            $count++;
            $this->line("   ✓ Presupuesto #{$budget->id} \"{$budget->title}\" marcado como vencido");
        }

        Log::info("CheckExpiredBudgets: {$count} presupuestos de merch marcados como vencidos");

        return $count;
    }

    /**
     * Verificar y actualizar presupuestos de Picking
     */
    private function checkPickingBudgets(): int
    {
        $this->info('📦 Presupuestos de Picking:');

        $expiredBudgets = PickingBudget::where('valid_until', '<', now()->startOfDay())
            ->whereIn('status', [
                BudgetStatus::UNSENT,
                BudgetStatus::DRAFT,
                BudgetStatus::SENT,
            ])
            ->get();

        if ($expiredBudgets->isEmpty()) {
            $this->line('   No se encontraron presupuestos vencidos.');
            return 0;
        }

        $count = 0;
        foreach ($expiredBudgets as $budget) {
            $budget->markAsExpired();
            $count++;
            $this->line("   ✓ Presupuesto {$budget->budget_number} marcado como vencido");
        }

        Log::info("CheckExpiredBudgets: {$count} presupuestos de picking marcados como vencidos");

        return $count;
    }
}
