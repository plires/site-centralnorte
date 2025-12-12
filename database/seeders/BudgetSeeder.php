<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Budget;
use App\Models\Client;
use App\Enums\BudgetStatus;
use Illuminate\Database\Seeder;

class BudgetSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::whereHas('role', function ($q) {
            $q->whereIn('name', ['admin', 'vendedor']);
        })->get();

        $clients = Client::all();

        if ($users->isEmpty() || $clients->isEmpty()) {
            $this->command->warn('No hay suficientes usuarios o clientes.');
            return;
        }

        $this->command->info('Creando presupuestos de merch...');

        // Sin enviar (5)
        $this->command->info('📝 Creando presupuestos SIN ENVIAR...');
        $this->createBudgets($users, $clients, 5, BudgetStatus::UNSENT);

        // Borradores (3)
        $this->command->info('📄 Creando presupuestos BORRADOR...');
        $this->createBudgets($users, $clients, 3, BudgetStatus::DRAFT);

        // Enviados (10)
        $this->command->info('📧 Creando presupuestos ENVIADOS...');
        $this->createBudgets($users, $clients, 10, BudgetStatus::SENT);

        // Aprobados (5)
        $this->command->info('✅ Creando presupuestos APROBADOS...');
        $this->createBudgets($users, $clients, 5, BudgetStatus::APPROVED);

        // Rechazados (3)
        $this->command->info('❌ Creando presupuestos RECHAZADOS...');
        $this->createBudgets($users, $clients, 3, BudgetStatus::REJECTED);

        // Vencidos (4)
        $this->command->info('⏰ Creando presupuestos VENCIDOS...');
        $this->createExpiredBudgets($users, $clients, 4);

        // Por vencer (3)
        $this->command->info('⚠️ Creando presupuestos POR VENCER...');
        $this->createExpiringSoonBudgets($users, $clients, 3);

        $total = Budget::count();
        $this->command->info("✨ Se crearon {$total} presupuestos de merch.");
    }

    private function createBudgets($users, $clients, int $count, BudgetStatus $status): void
    {
        for ($i = 0; $i < $count; $i++) {
            $budget = Budget::factory()
                ->state(['status' => $status])
                ->create([
                    'user_id' => $users->random()->id,
                    'client_id' => $clients->random()->id,
                ]);

            // Actualizar tracking de email según estado
            if (in_array($status, [BudgetStatus::SENT, BudgetStatus::APPROVED, BudgetStatus::REJECTED])) {
                $budget->update([
                    'send_email_to_client' => true,
                    'email_sent' => true,
                    'email_sent_at' => fake()->dateTimeBetween($budget->issue_date, 'now'),
                ]);
            }

            // Simular totales
            $subtotal = fake()->randomFloat(2, 5000, 150000);
            $budget->update([
                'subtotal' => $subtotal,
                'total' => $subtotal,
            ]);
        }
    }

    private function createExpiredBudgets($users, $clients, int $count): void
    {
        for ($i = 0; $i < $count; $i++) {
            $budget = Budget::factory()
                ->expired()
                ->create([
                    'user_id' => $users->random()->id,
                    'client_id' => $clients->random()->id,
                ]);

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

    private function createExpiringSoonBudgets($users, $clients, int $count): void
    {
        for ($i = 0; $i < $count; $i++) {
            $budget = Budget::factory()
                ->expiringSoon()
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
}
