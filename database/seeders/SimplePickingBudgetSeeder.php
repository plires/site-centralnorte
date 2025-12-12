<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Client;
use App\Models\PickingBudget;
use Illuminate\Database\Seeder;
use App\Models\PickingBudgetBox;
use App\Enums\BudgetStatus;
use App\Models\PickingBudgetService;

class SimplePickingBudgetSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('🚀 Creando presupuestos de picking...');

        $vendor = User::whereHas('role', function ($q) {
            $q->whereIn('name', ['admin', 'vendedor']);
        })->first();

        if (!$vendor) {
            $this->command->error('❌ No se encontró ningún vendedor.');
            return;
        }

        // 1. Sin enviar
        $this->command->info('📝 Creando presupuesto SIN ENVIAR...');
        $this->createSimpleBudget($vendor, BudgetStatus::UNSENT, [
            'total_kits' => 100,
            'components' => 5,
            'boxes' => [
                ['dimensions' => '300 x 200 x 150', 'unit_cost' => 250.00, 'quantity' => 100],
            ]
        ]);

        // 2. Borrador
        $this->command->info('📄 Creando presupuesto BORRADOR...');
        $this->createSimpleBudget($vendor, BudgetStatus::DRAFT, [
            'total_kits' => 150,
            'components' => 6,
            'boxes' => [
                ['dimensions' => '300 x 200 x 150', 'unit_cost' => 250.00, 'quantity' => 150],
            ]
        ]);

        // 3. Enviado
        $this->command->info('📧 Creando presupuesto ENVIADO...');
        $this->createSimpleBudget($vendor, BudgetStatus::SENT, [
            'total_kits' => 250,
            'components' => 8,
            'boxes' => [
                ['dimensions' => '400 x 300 x 200', 'unit_cost' => 320.00, 'quantity' => 150],
                ['dimensions' => '300 x 200 x 150', 'unit_cost' => 250.00, 'quantity' => 100],
            ]
        ]);

        // 4. Aprobado
        $this->command->info('✅ Creando presupuesto APROBADO...');
        $this->createSimpleBudget($vendor, BudgetStatus::APPROVED, [
            'total_kits' => 500,
            'components' => 12,
            'boxes' => [
                ['dimensions' => '500 x 400 x 300', 'unit_cost' => 420.00, 'quantity' => 200],
                ['dimensions' => '400 x 300 x 200', 'unit_cost' => 320.00, 'quantity' => 200],
                ['dimensions' => '300 x 200 x 150', 'unit_cost' => 250.00, 'quantity' => 100],
            ]
        ]);

        // 5. Rechazado
        $this->command->info('❌ Creando presupuesto RECHAZADO...');
        $this->createSimpleBudget($vendor, BudgetStatus::REJECTED, [
            'total_kits' => 200,
            'components' => 7,
            'boxes' => [
                ['dimensions' => '300 x 200 x 150', 'unit_cost' => 250.00, 'quantity' => 200],
            ]
        ]);

        // 6. Vencido
        $this->command->info('⏰ Creando presupuesto VENCIDO...');
        $this->createSimpleBudget($vendor, BudgetStatus::EXPIRED, [
            'total_kits' => 100,
            'components' => 4,
            'boxes' => [
                ['dimensions' => '300 x 200 x 150', 'unit_cost' => 250.00, 'quantity' => 100],
            ],
            'valid_until' => now()->subDays(5),
        ]);

        $this->command->info('✨ ¡6 presupuestos de picking creados exitosamente!');
    }

    private function createSimpleBudget(User $vendor, BudgetStatus $status, array $config): PickingBudget
    {
        $validUntil = $config['valid_until'] ?? now()->addDays(30);
        
        // Determinar si tiene email enviado según el estado
        $emailSent = in_array($status, [BudgetStatus::SENT, BudgetStatus::APPROVED, BudgetStatus::REJECTED]);

        $budget = PickingBudget::create([
            'budget_number' => PickingBudget::generateBudgetNumber(),
            'vendor_id' => $vendor->id,
            'client_id' => Client::inRandomOrder()->first()->id,
            'total_kits' => $config['total_kits'],
            'total_components_per_kit' => $config['components'],
            'scale_quantity_from' => 100,
            'scale_quantity_to' => 199,
            'production_time' => '48 hs',
            'component_increment_description' => '4 A 6 componentes',
            'component_increment_percentage' => 0.10,
            'services_subtotal' => 0,
            'component_increment_amount' => 0,
            'subtotal_with_increment' => 0,
            'box_total' => 0,
            'total' => 0,
            'unit_price_per_kit' => 0,
            'status' => $status,
            'email_sent' => $emailSent,
            'email_sent_at' => $emailSent ? now()->subDays(rand(1, 10)) : null,
            'valid_until' => $validUntil,
            'notes' => 'Presupuesto de prueba generado automáticamente',
        ]);

        // Agregar cajas
        foreach ($config['boxes'] as $boxData) {
            PickingBudgetBox::create([
                'picking_budget_id' => $budget->id,
                'box_dimensions' => $boxData['dimensions'],
                'box_unit_cost' => $boxData['unit_cost'],
                'quantity' => $boxData['quantity'],
                'subtotal' => $boxData['unit_cost'] * $boxData['quantity'],
            ]);
        }

        // Agregar servicios estándar
        PickingBudgetService::create([
            'picking_budget_id' => $budget->id,
            'service_type' => 'assembly',
            'service_description' => 'Con armado',
            'unit_cost' => 120.00,
            'quantity' => $config['total_kits'],
            'subtotal' => 120.00 * $config['total_kits'],
        ]);

        PickingBudgetService::create([
            'picking_budget_id' => $budget->id,
            'service_type' => 'bag',
            'service_description' => 'Bolsita 20x30',
            'unit_cost' => 8.50,
            'quantity' => $config['total_kits'],
            'subtotal' => 8.50 * $config['total_kits'],
        ]);

        PickingBudgetService::create([
            'picking_budget_id' => $budget->id,
            'service_type' => 'labeling',
            'service_description' => 'Con rotulado',
            'unit_cost' => 45.00,
            'quantity' => $config['total_kits'],
            'subtotal' => 45.00 * $config['total_kits'],
        ]);

        // Recalcular totales
        $budget->calculateTotals();
        $budget->save();

        return $budget;
    }
}
