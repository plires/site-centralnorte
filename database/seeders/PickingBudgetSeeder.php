<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Client;
use App\Models\PickingBudget;
use App\Models\PickingBox;
use App\Models\PickingBudgetBox;
use Illuminate\Database\Seeder;
use App\Enums\BudgetStatus;
use App\Models\PickingBudgetService;

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

        // Verificar que existan cajas
        $availableBoxes = PickingBox::where('is_active', true)->get();
        if ($availableBoxes->isEmpty()) {
            $this->command->warn('⚠️  No se encontraron cajas activas. Ejecuta PickingBoxSeeder primero.');
            return;
        }

        // 1. Presupuestos en estado DRAFT (5)
        $this->command->info('📝 Creando presupuestos en estado DRAFT...');
        foreach ($vendors->take(2) as $vendor) {
            for ($i = 0; $i < 3; $i++) {
                $budget = $this->createBudget($vendor, BudgetStatus::DRAFT);
                $this->addBoxesToBudget($budget, $availableBoxes);
                $this->addServicesToBudget($budget);
                $budget->calculateTotals();
                $budget->save();
            }
        }

        // 2. Presupuestos ENVIADOS (4)
        $this->command->info('📧 Creando presupuestos enviados...');
        foreach ($vendors->take(2) as $vendor) {
            for ($i = 0; $i < 2; $i++) {
                $budget = $this->createBudget($vendor, BudgetStatus::SENT);
                $this->addBoxesToBudget($budget, $availableBoxes);
                $this->addServicesToBudget($budget);
                $budget->calculateTotals();
                $budget->save();
            }
        }

        // 3. Presupuestos APROBADOS (3)
        $this->command->info('✅ Creando presupuestos aprobados...');
        foreach ($vendors->take(2) as $vendor) {
            $budget = $this->createBudget($vendor, BudgetStatus::APPROVED);
            $this->addBoxesToBudget($budget, $availableBoxes);
            $this->addServicesToBudget($budget);
            $budget->calculateTotals();
            $budget->save();
        }

        // 4. Presupuestos RECHAZADOS (2)
        $this->command->info('❌ Creando presupuestos rechazados...');
        $vendor = $vendors->random();
        for ($i = 0; $i < 2; $i++) {
            $budget = $this->createBudget($vendor, BudgetStatus::REJECTED);
            $this->addBoxesToBudget($budget, $availableBoxes);
            $this->addServicesToBudget($budget);
            $budget->calculateTotals();
            $budget->save();
        }

        // 5. Presupuestos VENCIDOS (3)
        $this->command->info('⏰ Creando presupuestos vencidos...');
        foreach ($vendors->take(2) as $vendor) {
            $budget = $this->createBudget($vendor, BudgetStatus::EXPIRED, true);
            $this->addBoxesToBudget($budget, $availableBoxes);
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
    private function createBudget(User $vendor, BudgetStatus $status, bool $expired = false): PickingBudget
    {
        $totalKits = fake()->numberBetween(50, 500);
        $componentsPerKit = fake()->numberBetween(3, 15);

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

        return PickingBudget::create([
            'budget_number' => PickingBudget::generateBudgetNumber(),
            'vendor_id' => $vendor->id,
            'client_id' => Client::inRandomOrder()->first()->id,
            'total_kits' => $totalKits,
            'total_components_per_kit' => $componentsPerKit,
            'scale_quantity_from' => $scaleFrom,
            'scale_quantity_to' => $scaleTo === 0 ? null : $scaleTo,
            'production_time' => $productionTime,
            'component_increment_description' => $incrementData['desc'],
            'component_increment_percentage' => $incrementData['perc'],
            'services_subtotal' => 0, // Se calculará después
            'component_increment_amount' => 0, // Se calculará después
            'subtotal_with_increment' => 0, // Se calculará después
            'box_total' => 0, // Se calculará después
            'total' => 0, // Se calculará después
            'unit_price_per_kit' => 0, // Se calculará después
            'status' => $status,
            'valid_until' => $validUntil,
            'notes' => fake()->optional(0.4)->sentence(),
            'created_at' => $createdAt,
            'updated_at' => $createdAt,
        ]);
    }

    /**
     * ✅ NUEVO MÉTODO: Agregar cajas al presupuesto
     */
    private function addBoxesToBudget(PickingBudget $budget, $availableBoxes): void
    {
        // Decidir cuántas cajas diferentes agregar (1-3)
        $boxCount = fake()->numberBetween(1, 3);

        // Seleccionar cajas aleatorias sin repetir
        $selectedBoxes = $availableBoxes->random(min($boxCount, $availableBoxes->count()));

        foreach ($selectedBoxes as $box) {
            // Cantidad de esta caja específica
            $quantity = fake()->numberBetween(
                (int)($budget->total_kits * 0.2), // Mínimo 20% de los kits
                (int)($budget->total_kits * 0.8)  // Máximo 80% de los kits
            );

            PickingBudgetBox::create([
                'picking_budget_id' => $budget->id,
                'picking_box_id' => $box->id, // ✅ AGREGADO: ID de la caja original
                'box_dimensions' => $box->dimensions,
                'box_unit_cost' => $box->cost,
                'quantity' => $quantity,
                'subtotal' => $box->cost * $quantity,
            ]);
        }
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
                ['type' => 'assembly', 'desc' => ['Bolsa o caja que no requiera su armado', 'Caja para armar o mochila con cierre'], 'cost_range' => [80, 180]],
                ['type' => 'palletizing', 'desc' => ['Palletizado con pallet', 'Palletizado sin pallet'], 'cost_range' => [120, 250]],
                ['type' => 'labeling', 'desc' => ['Con rotulado', 'Sin rotulado'], 'cost_range' => [30, 90]],
                ['type' => 'dome_sticking', 'desc' => ['Pegado de domes'], 'cost_range' => [15, 45]],
                ['type' => 'additional_assembly', 'desc' => ['Ensamble adicional'], 'cost_range' => [50, 120]],
                ['type' => 'quality_control', 'desc' => ['Control de calidad'], 'cost_range' => [40, 100]],
                ['type' => 'shavings', 'desc' => ['Viruta 50g', 'Viruta 100g', 'Viruta 200g'], 'cost_range' => [8, 25]],
                ['type' => 'bag', 'desc' => ['Bolsita 10x15 (2 por kit)', 'Bolsita 20x30 (1 por kit)', 'Bolsita 35x45 (1 por kit)'], 'cost_range' => [3, 12]],
                ['type' => 'bubble_wrap', 'desc' => ['Pluribol 5x10 (3 por kit)', 'Pluribol 10x15 (2 por kit)', 'Pluribol 20x30 (1 por kit)'], 'cost_range' => [5, 18]],
            ];

            // Filtrar servicios no usados
            $availableServices = array_filter($services, function ($s) use ($usedTypes) {
                return !in_array($s['type'], $usedTypes);
            });

            if (empty($availableServices)) {
                break;
            }

            $service = fake()->randomElement($availableServices);
            $usedTypes[] = $service['type'];

            $description = fake()->randomElement($service['desc']);
            $unitCost = fake()->randomFloat(2, $service['cost_range'][0], $service['cost_range'][1]);

            // Para bolsitas y pluribol, calcular cantidad total (kits × cantidad por kit)
            if (in_array($service['type'], ['bag', 'bubble_wrap'])) {
                // Extraer cantidad por kit de la descripción
                preg_match('/\((\d+)\s+por\s+kit\)/', $description, $matches);
                $perKit = isset($matches[1]) ? (int)$matches[1] : 1;
                $quantity = $budget->total_kits * $perKit;
            } else {
                $quantity = $budget->total_kits;
            }

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
