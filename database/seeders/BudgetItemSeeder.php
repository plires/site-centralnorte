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

        // Recalcular totales del presupuesto con las variantes correctamente seleccionadas
        $budget->calculateTotals();
    }

    /**
     * Crear un grupo de variantes para un producto.
     */
    private function createVariantGroup(Budget $budget, Product $product, int &$sortOrder, int $variantGroupNumber): void
    {
        $variantGroup = "variant_{$product->name}_{$variantGroupNumber}";
        $variantCount = fake()->numberBetween(2, 4);

        // Cantidades base para las variantes (diferentes volúmenes)
        $baseQuantities = [50, 100, 250, 500, 1000];
        $selectedQuantities = fake()->randomElements($baseQuantities, $variantCount);

        for ($i = 0; $i < $variantCount; $i++) {
            $quantity = $selectedQuantities[$i];
            $unitPrice = $this->calculateVariantPrice($product, $quantity);

            BudgetItem::factory()->create([
                'budget_id' => $budget->id,
                'product_id' => $product->id,
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
                'production_time_days' => fake()->optional(0.8)->numberBetween(7, 21),
                'logo_printing' => fake()->optional(0.7)->randomElement([
                    'Serigrafía 1 color',
                    'Serigrafía 2 colores',
                    'Bordado',
                    'Tampografía',
                    'Transfer térmico',
                    'Grabado láser',
                    'Sin impresión'
                ]),
                'sort_order' => $sortOrder++,
                'variant_group' => $variantGroup,
                'is_variant' => true,
                'is_selected' => $i === 0, // NUEVO: Solo la primera variante está seleccionada
            ]);
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
            'is_selected' => true, // Items regulares SIEMPRE están seleccionados
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
