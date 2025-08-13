<?php

namespace Database\Seeders;

use App\Models\Budget;
use App\Models\Product;
use App\Models\BudgetItem;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class BudgetItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $budgets = Budget::all();
        $products = Product::all();

        if ($budgets->isEmpty() || $products->isEmpty()) {
            $this->command->warn('No hay presupuestos o productos para crear items.');
            $this->command->info('Ejecuta primero los seeders de Budget y Product.');
            return;
        }

        $this->command->info('Creando items para presupuestos...');

        foreach ($budgets as $budget) {
            $this->createItemsForBudget($budget, $products);
        }

        $this->command->info('Items de presupuestos creados exitosamente.');
    }

    /**
     * Crear items para un presupuesto específico.
     */
    private function createItemsForBudget(Budget $budget, $products): void
    {
        // Número aleatorio de items por presupuesto (2-8)
        $itemsCount = fake()->numberBetween(2, 8);

        // Seleccionar productos únicos para este presupuesto
        $selectedProducts = $products->random(min($itemsCount, $products->count()));

        $sortOrder = 1;
        $variantGroupCounter = 1;

        foreach ($selectedProducts as $index => $product) {
            // Decidir si este producto tendrá variantes (30% probabilidad)
            $hasVariants = fake()->boolean(30) && $index < $selectedProducts->count() - 1;

            if ($hasVariants) {
                $this->createVariantGroup($budget, $product, $sortOrder, $variantGroupCounter);
                $sortOrder += fake()->numberBetween(2, 4); // Incrementar por las variantes creadas
                $variantGroupCounter++;
            } else {
                $this->createRegularItem($budget, $product, $sortOrder);
                $sortOrder++;
            }
        }
    }

    /**
     * Crear un grupo de variantes para un producto.
     */
    private function createVariantGroup(Budget $budget, Product $product, int &$sortOrder, int $groupNumber): void
    {
        $variantGroup = "variant_group_{$budget->id}_{$groupNumber}";
        $variantsCount = fake()->numberBetween(2, 4);

        // Diferentes configuraciones para las variantes
        $variantConfigs = [
            [
                'quantity' => fake()->numberBetween(100, 300),
                'logo_printing' => 'Serigrafía 1 color',
                'production_time_days' => fake()->numberBetween(10, 15)
            ],
            [
                'quantity' => fake()->numberBetween(200, 500),
                'logo_printing' => 'Bordado',
                'production_time_days' => fake()->numberBetween(15, 20)
            ],
            [
                'quantity' => fake()->numberBetween(50, 150),
                'logo_printing' => 'Transfer térmico',
                'production_time_days' => fake()->numberBetween(7, 12)
            ],
            [
                'quantity' => fake()->numberBetween(300, 800),
                'logo_printing' => 'Serigrafía 2 colores',
                'production_time_days' => fake()->numberBetween(12, 18)
            ],
        ];

        for ($i = 0; $i < $variantsCount; $i++) {
            $config = $variantConfigs[$i] ?? $variantConfigs[0];

            BudgetItem::factory()->create([
                'budget_id' => $budget->id,
                'product_id' => $product->id,
                'quantity' => $config['quantity'],
                'unit_price' => $this->calculateVariantPrice($product, $config['quantity']),
                'production_time_days' => $config['production_time_days'],
                'logo_printing' => $config['logo_printing'],
                'sort_order' => $sortOrder,
                'variant_group' => $variantGroup,
                'is_variant' => true,
            ]);

            $sortOrder++;
        }
    }

    /**
     * Crear un item regular (sin variantes).
     */
    private function createRegularItem(Budget $budget, Product $product, int $sortOrder): void
    {
        // Tipos de items regulares con diferentes características
        $itemTypes = ['small', 'bulk', 'inStock', 'customProduction'];
        $itemType = fake()->randomElement($itemTypes);

        $baseData = [
            'budget_id' => $budget->id,
            'product_id' => $product->id,
            'sort_order' => $sortOrder,
        ];

        switch ($itemType) {
            case 'small':
                BudgetItem::factory()
                    ->small()
                    ->withLogo()
                    ->create($baseData);
                break;

            case 'bulk':
                BudgetItem::factory()
                    ->bulk()
                    ->create($baseData);
                break;

            case 'inStock':
                BudgetItem::factory()
                    ->inStock()
                    ->withoutLogo()
                    ->create($baseData);
                break;

            case 'customProduction':
                BudgetItem::factory()
                    ->customProduction()
                    ->create($baseData);
                break;

            default:
                BudgetItem::factory()->create($baseData);
        }
    }

    /**
     * Calcular precio unitario para variantes basado en la cantidad.
     */
    private function calculateVariantPrice(Product $product, int $quantity): float
    {
        $basePrice = $product->last_price ?? fake()->randomFloat(2, 1000, 10000);

        // Aplicar descuentos por volumen
        if ($quantity >= 500) {
            $basePrice *= 0.85; // 15% descuento
        } elseif ($quantity >= 200) {
            $basePrice *= 0.90; // 10% descuento
        } elseif ($quantity >= 100) {
            $basePrice *= 0.95; // 5% descuento
        }

        // Agregar variación de ±10%
        $variation = fake()->randomFloat(2, -0.10, 0.10);
        $basePrice *= (1 + $variation);

        return round($basePrice, 2);
    }
}
