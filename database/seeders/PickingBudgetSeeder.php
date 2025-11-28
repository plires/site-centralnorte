<?php

namespace Database\Seeders;

use App\Models\PickingBudget;
use App\Models\PickingBudgetService;
use App\Models\User;
use App\Enums\PickingBudgetStatus;
use Illuminate\Database\Seeder;

class PickingBudgetSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🎯 Iniciando seed de presupuestos de picking...');

        // Obtener vendedores (admin y vendedores)
        $vendors = User::whereHas('role', function ($q) {
            $q->whereIn('name', ['admin', 'vendedor']);
        })->get();

        if ($vendors->isEmpty()) {
            $this->command->warn('⚠️  No se encontraron vendedores. Asegúrate de ejecutar UserSeeder primero.');
            return;
        }

        // 1. Presupuestos en estado DRAFT (5)
        $this->command->info('📝 Creando presupuestos en estado DRAFT...');
        foreach ($vendors->take(2) as $vendor) {
            for ($i = 0; $i < 3; $i++) {
                $budget = $this->createBudget($vendor, PickingBudgetStatus::DRAFT);
                $this->addServicesToBudget($budget);
                $budget->calculateTotals();
                $budget->save();
            }
        }

        // 2. Presupuestos ENVIADOS (4)
        $this->command->info('📧 Creando presupuestos enviados...');
        foreach ($vendors->take(2) as $vendor) {
            for ($i = 0; $i < 2; $i++) {
                $budget = $this->createBudget($vendor, PickingBudgetStatus::SENT);
                $this->addServicesToBudget($budget);
                $budget->calculateTotals();
                $budget->save();
            }
        }

        // 3. Presupuestos APROBADOS (3)
        $this->command->info('✅ Creando presupuestos aprobados...');
        foreach ($vendors->take(2) as $vendor) {
            $budget = $this->createBudget($vendor, PickingBudgetStatus::APPROVED);
            $this->addServicesToBudget($budget);
            $budget->calculateTotals();
            $budget->save();
        }

        // 4. Presupuestos RECHAZADOS (2)
        $this->command->info('❌ Creando presupuestos rechazados...');
        $vendor = $vendors->random();
        for ($i = 0; $i < 2; $i++) {
            $budget = $this->createBudget($vendor, PickingBudgetStatus::REJECTED);
            $this->addServicesToBudget($budget);
            $budget->calculateTotals();
            $budget->save();
        }

        // 5. Presupuestos VENCIDOS (3)
        $this->command->info('⏰ Creando presupuestos vencidos...');
        foreach ($vendors->take(2) as $vendor) {
            $budget = $this->createBudget($vendor, PickingBudgetStatus::EXPIRED, true);
            $this->addServicesToBudget($budget);
            $budget->calculateTotals();
            $budget->save();
        }

        $total = PickingBudget::count();
        $this->command->info("✨ Seed completado: {$total} presupuestos de picking creados!");
    }

    /**
     * Crear un presupuesto base
     */
    private function createBudget(User $vendor, PickingBudgetStatus $status, bool $expired = false): PickingBudget
    {
        $totalKits = fake()->numberBetween(50, 500);
        $componentsPerKit = fake()->numberBetween(3, 15);

        // Datos de caja
        $boxDimensions = fake()->randomElement([
            '200 x 200 x 100',
            '300 x 200 x 150',
            '400 x 300 x 200',
            '500 x 400 x 300',
        ]);
        $boxCost = fake()->randomFloat(2, 150, 450);

        // Datos de escala (simulados)
        $scaleFrom = (int) (floor($totalKits / 100) * 100);
        $scaleTo = $scaleFrom + 99;
        $productionTime = fake()->randomElement(['24 hs', '48 hs', '3 días', '5 días', '7 días']);

        // Incremento por componentes
        $incrementRanges = [
            ['desc' => '1 A 3 componentes', 'perc' => 0.00],
            ['desc' => '4 A 6 componentes', 'perc' => 0.10],
            ['desc' => '7 A 10 componentes', 'perc' => 0.20],
            ['desc' => '11 A 15 componentes', 'perc' => 0.30],
            ['desc' => '16 o más componentes', 'perc' => 0.40],
        ];

        $incrementData = match (true) {
            $componentsPerKit <= 3 => $incrementRanges[0],
            $componentsPerKit <= 6 => $incrementRanges[1],
            $componentsPerKit <= 10 => $incrementRanges[2],
            $componentsPerKit <= 15 => $incrementRanges[3],
            default => $incrementRanges[4],
        };

        // Fechas
        $createdAt = $expired 
            ? fake()->dateTimeBetween('-60 days', '-31 days')
            : fake()->dateTimeBetween('-30 days', 'now');

        $validUntil = $expired
            ? fake()->dateTimeBetween('-30 days', '-1 day')
            : fake()->dateTimeBetween('now', '+60 days');

        // Datos del cliente
        $clientNames = [
            'Industrias ACME S.A.',
            'Distribuidora La Universal',
            'Comercial Del Centro',
            'Grupo Empresarial Norte',
            'Logística y Servicios SA',
            'TechnoMark Argentina',
            'Mundo Promocional',
            'Regalo Corporativo SRL',
            'Marketing Plus',
            'Eventos & Promociones'
        ];

        return PickingBudget::create([
            'budget_number' => PickingBudget::generateBudgetNumber(),
            'vendor_id' => $vendor->id,
            'client_name' => fake()->randomElement($clientNames),
            'client_email' => fake()->optional(0.8)->companyEmail(),
            'client_phone' => fake()->optional(0.7)->phoneNumber(),
            'total_kits' => $totalKits,
            'total_components_per_kit' => $componentsPerKit,
            'box_dimensions' => $boxDimensions,
            'box_cost' => $boxCost,
            'scale_quantity_from' => $scaleFrom,
            'scale_quantity_to' => $scaleTo === 0 ? null : $scaleTo,
            'production_time' => $productionTime,
            'component_increment_description' => $incrementData['desc'],
            'component_increment_percentage' => $incrementData['perc'],
            'services_subtotal' => 0, // Se calculará después
            'component_increment_amount' => 0, // Se calculará después
            'subtotal_with_increment' => 0, // Se calculará después
            'box_total' => $boxCost,
            'total' => 0, // Se calculará después
            'status' => $status,
            'valid_until' => $validUntil,
            'notes' => fake()->optional(0.4)->sentence(),
            'created_at' => $createdAt,
            'updated_at' => $createdAt,
        ]);
    }

    /**
     * Agregar servicios a un presupuesto
     */
    private function addServicesToBudget(PickingBudget $budget): void
    {
        $serviceCount = fake()->numberBetween(3, 7);
        $usedTypes = [];

        for ($i = 0; $i < $serviceCount; $i++) {
            // Servicios disponibles
            $services = [
                ['type' => 'assembly', 'desc' => ['Con armado', 'Sin armado'], 'cost_range' => [80, 180]],
                ['type' => 'palletizing', 'desc' => ['Palletizado con pallet', 'Palletizado sin pallet'], 'cost_range' => [120, 250]],
                ['type' => 'labeling', 'desc' => ['Con rotulado', 'Sin rotulado'], 'cost_range' => [30, 90]],
                ['type' => 'dome_sticking', 'desc' => ['Pegado de domes'], 'cost_range' => [15, 45]],
                ['type' => 'additional_assembly', 'desc' => ['Ensamble adicional'], 'cost_range' => [50, 120]],
                ['type' => 'quality_control', 'desc' => ['Control de calidad'], 'cost_range' => [40, 100]],
                ['type' => 'shavings', 'desc' => ['Viruta 50g', 'Viruta 100g', 'Viruta 200g'], 'cost_range' => [8, 25]],
                ['type' => 'bag', 'desc' => ['Bolsita 10x15', 'Bolsita 20x30', 'Bolsita 35x45'], 'cost_range' => [3, 12]],
                ['type' => 'bubble_wrap', 'desc' => ['Pluribol 5x10', 'Pluribol 10x15', 'Pluribol 20x30'], 'cost_range' => [5, 18]],
            ];

            // Filtrar servicios no usados
            $availableServices = array_filter($services, function($s) use ($usedTypes) {
                return !in_array($s['type'], $usedTypes);
            });

            if (empty($availableServices)) {
                break;
            }

            $service = fake()->randomElement($availableServices);
            $usedTypes[] = $service['type'];

            $description = fake()->randomElement($service['desc']);
            $unitCost = fake()->randomFloat(2, $service['cost_range'][0], $service['cost_range'][1]);
            $quantity = fake()->numberBetween(1, $budget->total_kits);

            PickingBudgetService::create([
                'picking_budget_id' => $budget->id,
                'service_type' => $service['type'],
                'service_description' => $description,
                'unit_cost' => $unitCost,
                'quantity' => $quantity,
                'subtotal' => $unitCost * $quantity,
            ]);
        }
    }
}
