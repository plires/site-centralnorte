<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Client;
use App\Models\PickingBudget;
use App\Enums\BudgetStatus;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PickingBudget>
 */
class PickingBudgetFactory extends Factory
{
    protected $model = PickingBudget::class;

    public function definition(): array
    {
        $totalKits = fake()->numberBetween(50, 500);
        $componentsPerKit = fake()->numberBetween(3, 15);

        $servicesSubtotal = fake()->randomFloat(2, 500, 5000);
        $componentIncrementPercentage = fake()->randomElement([0.00, 0.10, 0.20, 0.30, 0.40]);
        $componentIncrementAmount = $servicesSubtotal * $componentIncrementPercentage;
        $subtotalWithIncrement = $servicesSubtotal + $componentIncrementAmount;
        $boxTotal = fake()->randomFloat(2, 50, 350);
        $total = $subtotalWithIncrement + $boxTotal;
        $unitPricePerKit = $totalKits > 0 ? round($total / $totalKits, 2) : 0;

        $titles = [
            'Presupuesto Picking: bolígrafos y botellas',
            'Presupuesto Picking: Material promocional corporativo',
            'Presupuesto Picking: Artículos publicitarios para evento',
            'Presupuesto Picking: Merchandising personalizado',
            'Presupuesto Picking: Productos promocionales para campaña',
            'Presupuesto Picking: Kit corporativo personalizado',
            'Presupuesto Picking: Regalos empresariales',
            'Presupuesto Picking: Material POP y señalética',
            'Presupuesto Picking: Productos con logo corporativo',
            'Presupuesto Picking: Artículos para feria comercial'
        ];

        return [
            'budget_number' => PickingBudget::generateBudgetNumber(),
            'title' => $this->faker->randomElement($titles),
            'token' => Str::random(32),
            'vendor_id' => User::factory(),
            'client_id' => Client::factory(),
            'total_kits' => $totalKits,
            'total_components_per_kit' => $componentsPerKit,
            'scale_quantity_from' => 100,
            'scale_quantity_to' => 500,
            'production_time' => fake()->randomElement(['24 hs', '48 hs', '3 dias', '5 dias']),
            'component_increment_description' => fake()->randomElement([
                '1 A 3 componentes',
                '4 A 6 componentes',
                '7 A 10 componentes',
                '11 A 15 componentes',
                '16 o mas componentes',
            ]),
            'component_increment_percentage' => $componentIncrementPercentage,
            'services_subtotal' => $servicesSubtotal,
            'component_increment_amount' => $componentIncrementAmount,
            'subtotal_with_increment' => $subtotalWithIncrement,
            'box_total' => $boxTotal,
            'total' => $total,
            'unit_price_per_kit' => $unitPricePerKit,
            'status' => BudgetStatus::UNSENT,
            'email_sent' => false,
            'email_sent_at' => null,
            'valid_until' => fake()->dateTimeBetween('now', '+60 days'),
            'notes' => fake()->optional(0.3)->sentence(),
        ];
    }

    /**
     * Estado: Sin enviar (nuevo)
     */
    public function unsent(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => BudgetStatus::UNSENT,
            'email_sent' => false,
            'email_sent_at' => null,
        ]);
    }

    /**
     * Estado: Borrador (clonado)
     */
    public function draft(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => BudgetStatus::DRAFT,
            'email_sent' => false,
            'email_sent_at' => null,
        ]);
    }

    /**
     * Estado: Enviado
     */
    public function sent(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => BudgetStatus::SENT,
            'email_sent' => true,
            'email_sent_at' => fake()->dateTimeBetween('-30 days', 'now'),
        ]);
    }

    /**
     * Estado: Aprobado
     */
    public function approved(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => BudgetStatus::APPROVED,
            'email_sent' => true,
            'email_sent_at' => fake()->dateTimeBetween('-30 days', 'now'),
        ]);
    }

    /**
     * Estado: Rechazado
     */
    public function rejected(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => BudgetStatus::REJECTED,
            'email_sent' => true,
            'email_sent_at' => fake()->dateTimeBetween('-30 days', 'now'),
        ]);
    }

    /**
     * Estado: Vencido
     */
    public function expired(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => BudgetStatus::EXPIRED,
            'valid_until' => fake()->dateTimeBetween('-30 days', '-1 day'),
        ]);
    }

    /**
     * Vence pronto
     */
    public function expiringSoon(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => BudgetStatus::SENT,
            'valid_until' => fake()->dateTimeBetween('now', '+3 days'),
            'email_sent' => true,
            'email_sent_at' => fake()->dateTimeBetween('-10 days', 'now'),
        ]);
    }

    /**
     * Para vendedor específico
     */
    public function forVendor(User $vendor): static
    {
        return $this->state(fn(array $attributes) => [
            'vendor_id' => $vendor->id,
        ]);
    }

    /**
     * Para datos existentes
     */
    public function forExistingData(): static
    {
        return $this->state(fn(array $attributes) => [
            'client_id' => Client::inRandomOrder()->first()?->id ?? Client::factory(),
            'vendor_id' => User::whereHas('role', function ($q) {
                $q->whereIn('name', ['admin', 'vendedor']);
            })->inRandomOrder()->first()?->id ?? User::factory(),
        ]);
    }
}
