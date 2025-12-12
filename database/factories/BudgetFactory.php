<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Client;
use App\Enums\BudgetStatus;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Budget>
 */
class BudgetFactory extends Factory
{
    public function definition(): array
    {
        $issueDate = $this->faker->dateTimeBetween('-30 days', 'now');
        $expiryDate = $this->faker->dateTimeBetween($issueDate, '+30 days');

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
            'status' => BudgetStatus::UNSENT,
            'send_email_to_client' => $this->faker->boolean(60),
            'email_sent' => false,
            'email_sent_at' => null,
            'footer_comments' => $this->faker->optional(0.4)->paragraph(),
            'subtotal' => 0,
            'total' => 0,
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
        return $this->state(function (array $attributes) {
            $issueDate = $attributes['issue_date'] ?? now();
            return [
                'status' => BudgetStatus::SENT,
                'send_email_to_client' => true,
                'email_sent' => true,
                'email_sent_at' => $this->faker->dateTimeBetween($issueDate, 'now'),
            ];
        });
    }

    /**
     * Estado: Aprobado
     */
    public function approved(): static
    {
        return $this->state(function (array $attributes) {
            $issueDate = $attributes['issue_date'] ?? now();
            return [
                'status' => BudgetStatus::APPROVED,
                'email_sent' => true,
                'email_sent_at' => $this->faker->dateTimeBetween($issueDate, 'now'),
            ];
        });
    }

    /**
     * Estado: Rechazado
     */
    public function rejected(): static
    {
        return $this->state(function (array $attributes) {
            $issueDate = $attributes['issue_date'] ?? now();
            return [
                'status' => BudgetStatus::REJECTED,
                'email_sent' => true,
                'email_sent_at' => $this->faker->dateTimeBetween($issueDate, 'now'),
            ];
        });
    }

    /**
     * Estado: Vencido
     */
    public function expired(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => BudgetStatus::EXPIRED,
            'issue_date' => $this->faker->dateTimeBetween('-60 days', '-31 days'),
            'expiry_date' => $this->faker->dateTimeBetween('-30 days', '-1 days'),
        ]);
    }

    /**
     * Presupuesto que vence pronto (3 días o menos)
     */
    public function expiringSoon(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => BudgetStatus::SENT,
            'issue_date' => $this->faker->dateTimeBetween('-20 days', 'now'),
            'expiry_date' => $this->faker->dateTimeBetween('now', '+3 days'),
            'email_sent' => true,
            'email_sent_at' => $this->faker->dateTimeBetween('-20 days', 'now'),
        ]);
    }

    /**
     * Con email ya enviado
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
     * Email pendiente de envío
     */
    public function pendingEmail(): static
    {
        return $this->state(fn(array $attributes) => [
            'send_email_to_client' => true,
            'email_sent' => false,
            'email_sent_at' => null,
        ]);
    }

    /**
     * Para datos existentes
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

    // Métodos legacy para compatibilidad (mapean a los nuevos)
    public function active(): static
    {
        return $this->sent();
    }

    public function inactive(): static
    {
        return $this->rejected();
    }
}
