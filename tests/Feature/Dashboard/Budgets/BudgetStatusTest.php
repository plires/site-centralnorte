<?php

use App\Enums\BudgetStatus;
use App\Models\Budget;
use App\Models\Client;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Support\Facades\Mail;

beforeEach(function () {
    $this->seed([RoleSeeder::class, PermissionSeeder::class]);
});

// ─── updateStatus (dashboard) ────────────────────────────────────────────────

it('admin puede cambiar el estado de un presupuesto vía updateStatus', function () {
    $admin  = createAdmin();
    $budget = Budget::factory()->sent()->create([
        'user_id'     => $admin->id,
        'expiry_date' => now()->addDays(30)->format('Y-m-d'),
    ]);

    $this->actingAs($admin)
        ->patch(route('dashboard.budgets.update-status', $budget), [
            'status' => BudgetStatus::IN_REVIEW->value,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('budgets', [
        'id'     => $budget->id,
        'status' => BudgetStatus::IN_REVIEW->value,
    ]);
});

it('no puede cambiar el estado si el presupuesto está vencido por fecha', function () {
    $admin  = createAdmin();
    $budget = Budget::factory()->sent()->create([
        'user_id'     => $admin->id,
        'expiry_date' => now()->subDays(5)->format('Y-m-d'),
    ]);

    $this->actingAs($admin)
        ->patch(route('dashboard.budgets.update-status', $budget), [
            'status' => BudgetStatus::APPROVED->value,
        ])
        ->assertRedirect()
        ->assertSessionHas('error');
});

// ─── sendEmail ───────────────────────────────────────────────────────────────

it('sendEmail cambia el estado a sent y registra el envío', function () {
    Mail::fake();

    $admin  = createAdmin();
    $client = Client::factory()->create(['email' => 'cliente@test.com']);
    $budget = Budget::factory()->unsent()->create([
        'user_id'     => $admin->id,
        'client_id'   => $client->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->actingAs($admin)
        ->post(route('dashboard.budgets.send-email', $budget))
        ->assertRedirect();

    $budget->refresh();
    expect($budget->status)->toBe(BudgetStatus::SENT);
    expect($budget->email_sent)->toBeTrue();
});

it('sendEmail falla si el presupuesto ya está en estado final (approved)', function () {
    $admin  = createAdmin();
    $budget = Budget::factory()->approved()->create([
        'user_id'     => $admin->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->actingAs($admin)
        ->post(route('dashboard.budgets.send-email', $budget))
        ->assertRedirect()
        ->assertSessionHas('error');
});

// ─── Métodos de modelo (state transitions) ───────────────────────────────────

it('markAsSent() actualiza estado y flags de email', function () {
    $admin  = createAdmin();
    $budget = Budget::factory()->unsent()->create([
        'user_id'     => $admin->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);
    $budget->markAsSent();

    expect($budget->fresh()->status)->toBe(BudgetStatus::SENT);
    expect($budget->fresh()->email_sent)->toBeTrue();
});

it('markAsInReview() desde sent → in_review', function () {
    $admin  = createAdmin();
    $budget = Budget::factory()->sent()->create([
        'user_id'     => $admin->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);
    $budget->markAsInReview();

    expect($budget->fresh()->status)->toBe(BudgetStatus::IN_REVIEW);
});

it('markAsApproved() desde sent → approved', function () {
    $admin  = createAdmin();
    $budget = Budget::factory()->sent()->create([
        'user_id'     => $admin->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);
    $budget->markAsApproved();

    expect($budget->fresh()->status)->toBe(BudgetStatus::APPROVED);
});

it('markAsApproved() desde in_review → approved', function () {
    $admin  = createAdmin();
    $budget = Budget::factory()->sent()->create([
        'user_id'     => $admin->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);
    $budget->markAsInReview();
    $budget->markAsApproved();

    expect($budget->fresh()->status)->toBe(BudgetStatus::APPROVED);
});

it('markAsRejected() → rejected', function () {
    $admin  = createAdmin();
    $budget = Budget::factory()->sent()->create([
        'user_id'     => $admin->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);
    $budget->markAsRejected();

    expect($budget->fresh()->status)->toBe(BudgetStatus::REJECTED);
});

it('markAsExpired() solo actúa si el estado puede vencer', function () {
    $admin = createAdmin();

    $budget = Budget::factory()->sent()->create([
        'user_id'     => $admin->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);
    $budget->markAsExpired();
    expect($budget->fresh()->status)->toBe(BudgetStatus::EXPIRED);

    // Estado approved no puede vencer
    $approved = Budget::factory()->approved()->create([
        'user_id'     => $admin->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);
    $approved->markAsExpired();
    expect($approved->fresh()->status)->toBe(BudgetStatus::APPROVED);
});

// ─── Ruta pública ─────────────────────────────────────────────────────────────

it('ruta pública con token válido en estado sent devuelve 200', function () {
    $admin  = createAdmin();
    $budget = Budget::factory()->sent()->create([
        'user_id'     => $admin->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->get(route('public.budget.show', $budget->token))
        ->assertOk();
});

it('ruta pública con token de presupuesto no enviado no es visible', function () {
    $admin  = createAdmin();
    $budget = Budget::factory()->unsent()->create([
        'user_id'     => $admin->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);

    // El controlador devuelve una vista Inertia "not found" con HTTP 200
    $this->get(route('public.budget.show', $budget->token))
        ->assertOk();
});

// ─── Acciones del cliente (rutas públicas) ────────────────────────────────────

it('cliente aprueba un presupuesto sent → estado approved', function () {
    Mail::fake();
    $admin  = createAdmin();
    $budget = Budget::factory()->sent()->create([
        'user_id'     => $admin->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->post(route('public.budget.approve', $budget->token))
        ->assertRedirect();

    expect($budget->fresh()->status)->toBe(BudgetStatus::APPROVED);
});

it('cliente pone en evaluación un presupuesto sent → estado in_review', function () {
    Mail::fake();
    $admin  = createAdmin();
    $budget = Budget::factory()->sent()->create([
        'user_id'     => $admin->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->post(route('public.budget.in_review', $budget->token))
        ->assertRedirect();

    expect($budget->fresh()->status)->toBe(BudgetStatus::IN_REVIEW);
});

it('cliente NO puede actuar sobre un presupuesto en estado approved (final)', function () {
    $admin  = createAdmin();
    $budget = Budget::factory()->approved()->create([
        'user_id'     => $admin->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->post(route('public.budget.approve', $budget->token))
        ->assertRedirect()
        ->assertSessionHas('error');

    expect($budget->fresh()->status)->toBe(BudgetStatus::APPROVED);
});

// ─── Expiración automática ─────────────────────────────────────────────────────

it('checkExpiredBudgets expira presupuestos con fecha vencida', function () {
    $admin  = createAdmin();
    $budget = Budget::factory()->sent()->create([
        'user_id'     => $admin->id,
        'expiry_date' => now()->subDays(3)->format('Y-m-d'),
    ]);

    $this->artisan('budgets:check-expired')->assertExitCode(0);

    expect($budget->fresh()->status)->toBe(BudgetStatus::EXPIRED);
});

it('checkExpiredBudgets NO expira presupuestos en estado approved o rejected', function () {
    $admin = createAdmin();

    $approved = Budget::factory()->approved()->create([
        'user_id'     => $admin->id,
        'expiry_date' => now()->subDays(3)->format('Y-m-d'),
    ]);
    $rejected = Budget::factory()->rejected()->create([
        'user_id'     => $admin->id,
        'expiry_date' => now()->subDays(3)->format('Y-m-d'),
    ]);

    $this->artisan('budgets:check-expired')->assertExitCode(0);

    expect($approved->fresh()->status)->toBe(BudgetStatus::APPROVED);
    expect($rejected->fresh()->status)->toBe(BudgetStatus::REJECTED);
});
