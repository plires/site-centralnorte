<?php

namespace Database\Factories;

use App\Models\PickingBudgetService;
use App\Models\PickingBudget;
use App\Enums\PickingServiceType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PickingBudgetService>
 */
class PickingBudgetServiceFactory extends Factory
{
    protected $model = PickingBudgetService::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $serviceType = fake()->randomElement(PickingServiceType::cases());
        $unitCost = fake()->randomFloat(2, 10, 250);
        $quantity = fake()->numberBetween(1, 100);
        
        return [
            'picking_budget_id' => PickingBudget::factory(),
            'service_type' => $serviceType,
            'service_description' => $this->getDescriptionForType($serviceType),
            'unit_cost' => $unitCost,
            'quantity' => $quantity,
            'subtotal' => $unitCost * $quantity,
        ];
    }

    /**
     * Generate a description based on service type.
     */
    private function getDescriptionForType(PickingServiceType $type): string
    {
        return match($type) {
            PickingServiceType::ASSEMBLY => fake()->randomElement(['Con armado', 'Sin armado']),
            PickingServiceType::PALLETIZING => fake()->randomElement(['Palletizado con pallet', 'Palletizado sin pallet']),
            PickingServiceType::LABELING => fake()->randomElement(['Con rotulado', 'Sin rotulado']),
            PickingServiceType::DOME_STICKING => 'Pegado de domes',
            PickingServiceType::ADDITIONAL_ASSEMBLY => 'Ensamble adicional',
            PickingServiceType::QUALITY_CONTROL => 'Control de calidad',
            PickingServiceType::SHAVINGS => fake()->randomElement(['Viruta 50g', 'Viruta 100g', 'Viruta 200g']),
            PickingServiceType::BAG => fake()->randomElement(['Bolsita 10x15', 'Bolsita 20x30', 'Bolsita 35x45']),
            PickingServiceType::BUBBLE_WRAP => fake()->randomElement(['Pluribol 5x10', 'Pluribol 10x15', 'Pluribol 20x30']),
        };
    }

    /**
     * Create an assembly service.
     */
    public function assembly(bool $withAssembly = true): static
    {
        return $this->state(fn (array $attributes) => [
            'service_type' => PickingServiceType::ASSEMBLY,
            'service_description' => $withAssembly ? 'Con armado' : 'Sin armado',
        ]);
    }

    /**
     * Create a palletizing service.
     */
    public function palletizing(bool $withPallet = true): static
    {
        return $this->state(fn (array $attributes) => [
            'service_type' => PickingServiceType::PALLETIZING,
            'service_description' => $withPallet ? 'Palletizado con pallet' : 'Palletizado sin pallet',
        ]);
    }

    /**
     * Create a labeling service.
     */
    public function labeling(bool $withLabeling = true): static
    {
        return $this->state(fn (array $attributes) => [
            'service_type' => PickingServiceType::LABELING,
            'service_description' => $withLabeling ? 'Con rotulado' : 'Sin rotulado',
        ]);
    }

    /**
     * Create a bag service.
     */
    public function bag(string $size = '10x15'): static
    {
        return $this->state(fn (array $attributes) => [
            'service_type' => PickingServiceType::BAG,
            'service_description' => "Bolsita {$size}",
        ]);
    }

    /**
     * Create a bubble wrap service.
     */
    public function bubbleWrap(string $size = '10x15'): static
    {
        return $this->state(fn (array $attributes) => [
            'service_type' => PickingServiceType::BUBBLE_WRAP,
            'service_description' => "Pluribol {$size}",
        ]);
    }

    /**
     * Create a shavings service.
     */
    public function shavings(string $weight = '100g'): static
    {
        return $this->state(fn (array $attributes) => [
            'service_type' => PickingServiceType::SHAVINGS,
            'service_description' => "Viruta {$weight}",
        ]);
    }

    /**
     * Create a dome sticking service.
     */
    public function domeSticking(): static
    {
        return $this->state(fn (array $attributes) => [
            'service_type' => PickingServiceType::DOME_STICKING,
            'service_description' => 'Pegado de domes',
        ]);
    }

    /**
     * Create an additional assembly service.
     */
    public function additionalAssembly(): static
    {
        return $this->state(fn (array $attributes) => [
            'service_type' => PickingServiceType::ADDITIONAL_ASSEMBLY,
            'service_description' => 'Ensamble adicional',
        ]);
    }

    /**
     * Create a quality control service.
     */
    public function qualityControl(): static
    {
        return $this->state(fn (array $attributes) => [
            'service_type' => PickingServiceType::QUALITY_CONTROL,
            'service_description' => 'Control de calidad',
        ]);
    }

    /**
     * Set a specific quantity.
     */
    public function quantity(int $quantity): static
    {
        return $this->state(function (array $attributes) use ($quantity) {
            return [
                'quantity' => $quantity,
                'subtotal' => $attributes['unit_cost'] * $quantity,
            ];
        });
    }

    /**
     * Set a specific unit cost.
     */
    public function unitCost(float $cost): static
    {
        return $this->state(function (array $attributes) use ($cost) {
            return [
                'unit_cost' => $cost,
                'subtotal' => $cost * $attributes['quantity'],
            ];
        });
    }
}
