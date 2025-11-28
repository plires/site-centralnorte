<?php

namespace Database\Seeders;

use App\Models\PickingBudget;
use App\Models\PickingBudgetService;
use App\Models\PickingBudgetBox;
use App\Models\User;
use App\Enums\PickingBudgetStatus;
use Illuminate\Database\Seeder;

/**
 * Seeder simple para crear algunos presupuestos de picking rápidamente
 */
class SimplePickingBudgetSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🚀 Creando presupuestos de picking (versión simple - ACTUALIZADA)...');

        // Obtener un vendedor
        $vendor = User::whereHas('role', function ($q) {
            $q->whereIn('name', ['admin', 'vendedor']);
        })->first();

        if (!$vendor) {
            $this->command->error('❌ No se encontró ningún vendedor. Ejecuta UserSeeder primero.');
            return;
        }

        // 1. Presupuesto DRAFT simple con 1 caja
        $this->command->info('📝 Creando presupuesto DRAFT (1 caja)...');
        $draft = $this->createSimpleBudget($vendor, PickingBudgetStatus::DRAFT, [
            'total_kits' => 100,
            'components' => 5,
            'client' => 'Empresa Demo S.A.',
            'boxes' => [
                ['dimensions' => '300 x 200 x 150', 'unit_cost' => 250.00, 'quantity' => 100],
            ]
        ]);

        // 2. Presupuesto SENT con 2 cajas diferentes
        $this->command->info('📧 Creando presupuesto SENT (2 cajas)...');
        $sent = $this->createSimpleBudget($vendor, PickingBudgetStatus::SENT, [
            'total_kits' => 250,
            'components' => 8,
            'client' => 'Comercial del Norte',
            'boxes' => [
                ['dimensions' => '400 x 300 x 200', 'unit_cost' => 320.00, 'quantity' => 150],
                ['dimensions' => '300 x 200 x 150', 'unit_cost' => 250.00, 'quantity' => 100],
            ]
        ]);

        // 3. Presupuesto APPROVED con 3 cajas
        $this->command->info('✅ Creando presupuesto APPROVED (3 cajas)...');
        $approved = $this->createSimpleBudget($vendor, PickingBudgetStatus::APPROVED, [
            'total_kits' => 500,
            'components' => 12,
            'client' => 'Marketing Plus SRL',
            'boxes' => [
                ['dimensions' => '500 x 400 x 300', 'unit_cost' => 420.00, 'quantity' => 200],
                ['dimensions' => '400 x 300 x 200', 'unit_cost' => 320.00, 'quantity' => 200],
                ['dimensions' => '300 x 200 x 150', 'unit_cost' => 250.00, 'quantity' => 100],
            ]
        ]);

        $this->command->info('✨ ¡3 presupuestos de picking creados exitosamente!');
        $this->command->info('💡 Nota: Presupuestos incluyen múltiples cajas y precio unitario por kit');
    }

    /**
     * Crear un presupuesto simple
     */
    private function createSimpleBudget(User $vendor, PickingBudgetStatus $status, array $config): PickingBudget
    {
        // Crear presupuesto
        $budget = PickingBudget::create([
            'budget_number' => PickingBudget::generateBudgetNumber(),
            'vendor_id' => $vendor->id,
            'client_name' => $config['client'],
            'client_email' => fake()->companyEmail(),
            'client_phone' => fake()->phoneNumber(),
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
            'valid_until' => now()->addDays(30),
            'notes' => 'Presupuesto de prueba generado automáticamente',
        ]);

        // Agregar cajas (soporte múltiples cajas)
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
