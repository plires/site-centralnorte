<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Budget;
use App\Models\Client;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class BudgetSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Verificar que existan usuarios vendedores/admin y clientes
        $users = User::whereHas('role', function ($q) {
            $q->whereIn('name', ['admin', 'vendedor']);
        })->get();

        $clients = Client::all();

        if ($users->isEmpty() || $clients->isEmpty()) {
            $this->command->warn('No hay suficientes usuarios (admin/vendedores) o clientes para crear presupuestos.');
            $this->command->info('Asegúrate de ejecutar primero los seeders de usuarios y clientes.');
            return;
        }

        $this->command->info('Creando presupuestos...');

        // Crear diferentes tipos de presupuestos
        $this->createActiveBudgets($users, $clients, 15);
        $this->createInactiveBudgets($users, $clients, 5);
        $this->createExpiredBudgets($users, $clients, 8);
        $this->createExpiringSoonBudgets($users, $clients, 4);
        $this->createPendingEmailBudgets($users, $clients, 3);

        $this->command->info('Se crearon 35 presupuestos con diferentes estados.');
    }

    /**
     * Crear presupuestos activos
     */
    private function createActiveBudgets($users, $clients, int $count): void
    {
        for ($i = 0; $i < $count; $i++) {
            $budget = Budget::factory()
                ->active()
                ->create([
                    'user_id' => $users->random()->id,
                    'client_id' => $clients->random()->id,
                ]);

            // 70% probabilidad de tener email enviado
            if (fake()->boolean(70)) {
                $budget->update([
                    'send_email_to_client' => true,
                    'email_sent' => true,
                    'email_sent_at' => fake()->dateTimeBetween($budget->issue_date, 'now'),
                ]);
            }

            // Simular algunos totales (esto se haría normalmente con BudgetItems)
            $subtotal = fake()->randomFloat(2, 5000, 150000);
            $budget->update([
                'subtotal' => $subtotal,
                'total' => $subtotal,
            ]);
        }
    }

    /**
     * Crear presupuestos inactivos
     */
    private function createInactiveBudgets($users, $clients, int $count): void
    {
        for ($i = 0; $i < $count; $i++) {
            $budget = Budget::factory()
                ->inactive()
                ->create([
                    'user_id' => $users->random()->id,
                    'client_id' => $clients->random()->id,
                ]);

            $subtotal = fake()->randomFloat(2, 3000, 80000);
            $budget->update([
                'subtotal' => $subtotal,
                'total' => $subtotal,
            ]);
        }
    }

    /**
     * Crear presupuestos expirados
     */
    private function createExpiredBudgets($users, $clients, int $count): void
    {
        for ($i = 0; $i < $count; $i++) {
            $budget = Budget::factory()
                ->expired()
                ->create([
                    'user_id' => $users->random()->id,
                    'client_id' => $clients->random()->id,
                ]);

            // Los expirados pueden haber tenido email enviado
            if (fake()->boolean(80)) {
                $budget->update([
                    'send_email_to_client' => true,
                    'email_sent' => true,
                    'email_sent_at' => fake()->dateTimeBetween($budget->issue_date, $budget->expiry_date),
                ]);
            }

            $subtotal = fake()->randomFloat(2, 8000, 200000);
            $budget->update([
                'subtotal' => $subtotal,
                'total' => $subtotal,
            ]);
        }
    }

    /**
     * Crear presupuestos que expiran pronto
     */
    private function createExpiringSoonBudgets($users, $clients, int $count): void
    {
        for ($i = 0; $i < $count; $i++) {
            $budget = Budget::factory()
                ->expiringSoon()
                ->emailSent() // Estos probablemente ya tienen email enviado
                ->create([
                    'user_id' => $users->random()->id,
                    'client_id' => $clients->random()->id,
                ]);

            $subtotal = fake()->randomFloat(2, 15000, 300000);
            $budget->update([
                'subtotal' => $subtotal,
                'total' => $subtotal,
            ]);
        }
    }

    /**
     * Crear presupuestos con email pendiente de envío
     */
    private function createPendingEmailBudgets($users, $clients, int $count): void
    {
        for ($i = 0; $i < $count; $i++) {
            $budget = Budget::factory()
                ->pendingEmail()
                ->create([
                    'user_id' => $users->random()->id,
                    'client_id' => $clients->random()->id,
                ]);

            $subtotal = fake()->randomFloat(2, 12000, 180000);
            $budget->update([
                'subtotal' => $subtotal,
                'total' => $subtotal,
            ]);
        }
    }
}
