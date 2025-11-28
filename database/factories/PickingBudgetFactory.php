<?php

namespace Database\Factories;

use App\Models\PickingBudget;
use App\Models\User;
use App\Enums\PickingBudgetStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PickingBudget>
 */
class PickingBudgetFactory extends Factory
{
    protected $model = PickingBudget::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
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

        // Calcular precio unitario por kit
        $unitPricePerKit = $totalKits > 0 ? round($total / $totalKits, 2) : 0;

        return [
            'budget_number' => PickingBudget::generateBudgetNumber(),
            'vendor_id' => User::factory(),
            'client_name' => fake()->company(),
            'client_email' => fake()->companyEmail(),
            'client_phone' => fake()->phoneNumber(),
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
            'status' => fake()->randomElement(PickingBudgetStatus::cases()),
            'valid_until' => fake()->dateTimeBetween('now', '+60 days'),
            'notes' => fake()->optional(0.3)->sentence(),
        ];
    }

    /**
     * Indicate that the budget is a draft.
     */
    public function draft(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => PickingBudgetStatus::DRAFT,
        ]);
    }

    /**
     * Indicate that the budget has been sent.
     */
    public function sent(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => PickingBudgetStatus::SENT,
        ]);
    }

    /**
     * Indicate that the budget is approved.
     */
    public function approved(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => PickingBudgetStatus::APPROVED,
        ]);
    }

    /**
     * Indicate that the budget is expired.
     */
    public function expired(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => PickingBudgetStatus::EXPIRED,
            'valid_until' => fake()->dateTimeBetween('-30 days', '-1 day'),
        ]);
    }

    /**
     * Indicate that the budget is for a specific vendor.
     */
    public function forVendor(User $vendor): static
    {
        return $this->state(fn(array $attributes) => [
            'vendor_id' => $vendor->id,
        ]);
    }
}
