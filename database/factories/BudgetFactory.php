<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Client;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Budget>
 */
class BudgetFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $issueDate = $this->faker->dateTimeBetween('-30 days', 'now');
        $expiryDate = $this->faker->dateTimeBetween($issueDate, '+30 days');

        // Títulos realistas para presupuestos
        $titles = [
            'Presupuesto: Cotización cuadernos, bolígrafos y botellas',
            'Presupuesto: Material promocional corporativo',
            'Presupuesto: Artículos publicitarios para evento',
            'Presupuesto: Merchandising personalizado',
            'Presupuesto: Productos promocionales para campaña',
            'Presupuesto: Kit corporativo personalizado',
            'Presupuesto: Regalos empresariales',
            'Presupuesto: Material POP y señalética',
            'Presupuesto: Productos con logo corporativo',
            'Presupuesto: Artículos para feria comercial'
        ];

        return [
            'title' => $this->faker->randomElement($titles),
            'token' => Str::random(32),
            'user_id' => User::factory(),
            'client_id' => Client::factory(),
            'issue_date' => $issueDate,
            'expiry_date' => $expiryDate,
            'is_active' => $this->faker->boolean(85), // 85% activos
            'send_email_to_client' => $this->faker->boolean(60), // 60% configurados para envío automático
            'email_sent' => false, // Se configurará después según send_email_to_client
            'email_sent_at' => null, // Se configurará después
            'footer_comments' => $this->faker->optional(0.4)->paragraph(),
            'subtotal' => 0, // Se calculará al agregar items
            'total' => 0, // Se calculará al agregar items
        ];
    }

    /**
     * Configure the model factory after making.
     */
    public function configure()
    {
        return $this->afterMaking(function ($budget) {
            // Si está configurado para envío automático, simular que se envió en algunos casos
            if ($budget->send_email_to_client && $this->faker->boolean(70)) {
                $budget->email_sent = true;
                $budget->email_sent_at = $this->faker->dateTimeBetween($budget->issue_date, 'now');
            }
        });
    }

    /**
     * Create budget with existing client and user (vendedor/admin).
     */
    public function forExistingData(): static
    {
        return $this->state(fn(array $attributes) => [
            'client_id' => Client::inRandomOrder()->first()?->id ?? Client::factory(),
            'user_id' => User::whereHas('role', function ($q) {
                $q->whereIn('name', ['admin', 'vendedor']);
            })->inRandomOrder()->first()?->id ?? User::factory(),
        ]);
    }

    /**
     * Create an active budget.
     */
    public function active(): static
    {
        return $this->state(fn(array $attributes) => [
            'is_active' => true,
        ]);
    }

    /**
     * Create an inactive budget.
     */
    public function inactive(): static
    {
        return $this->state(fn(array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Create an expired budget.
     */
    public function expired(): static
    {
        return $this->state(fn(array $attributes) => [
            'issue_date' => $this->faker->dateTimeBetween('-60 days', '-31 days'),
            'expiry_date' => $this->faker->dateTimeBetween('-30 days', '-1 days'),
        ]);
    }

    /**
     * Create a budget expiring soon.
     */
    public function expiringSoon(): static
    {
        return $this->state(fn(array $attributes) => [
            'issue_date' => $this->faker->dateTimeBetween('-20 days', 'now'),
            'expiry_date' => $this->faker->dateTimeBetween('now', '+3 days'),
            'is_active' => true,
        ]);
    }

    /**
     * Create a budget with email already sent.
     */
    public function emailSent(): static
    {
        return $this->state(function (array $attributes) {
            $issueDate = $attributes['issue_date'] ?? now();
            return [
                'send_email_to_client' => true,
                'email_sent' => true,
                'email_sent_at' => $this->faker->dateTimeBetween($issueDate, 'now'),
            ];
        });
    }

    /**
     * Create a budget configured for email but not sent yet.
     */
    public function pendingEmail(): static
    {
        return $this->state(fn(array $attributes) => [
            'send_email_to_client' => true,
            'email_sent' => false,
            'email_sent_at' => null,
        ]);
    }
}
