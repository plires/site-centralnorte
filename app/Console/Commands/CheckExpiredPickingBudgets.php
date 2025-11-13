<?php

namespace App\Console\Commands;

use App\Models\PickingBudget;
use App\Enums\PickingBudgetStatus;
use Illuminate\Console\Command;

class CheckExpiredPickingBudgets extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'picking:check-expired';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Marca como vencidos los presupuestos de picking que superaron su fecha de validez';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Verificando presupuestos de picking vencidos...');

        // Buscar presupuestos vencidos que no estén aprobados o rechazados
        $expiredBudgets = PickingBudget::where('valid_until', '<', now())
            ->whereNotIn('status', [
                PickingBudgetStatus::APPROVED,
                PickingBudgetStatus::REJECTED,
                PickingBudgetStatus::EXPIRED,
            ])
            ->get();

        if ($expiredBudgets->isEmpty()) {
            $this->info('No se encontraron presupuestos vencidos.');
            return 0;
        }

        $count = 0;
        foreach ($expiredBudgets as $budget) {
            $budget->update(['status' => PickingBudgetStatus::EXPIRED]);
            $count++;
            
            $this->line("✓ Presupuesto {$budget->budget_number} marcado como vencido");
        }

        $this->info("Total: {$count} presupuesto(s) marcado(s) como vencido(s).");

        return 0;
    }
}
