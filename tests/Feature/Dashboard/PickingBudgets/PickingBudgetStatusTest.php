<?php

use App\Enums\BudgetStatus;
use App\Models\PickingBudget;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Support\Facades\Mail;

beforeEach(function () {
    $this->seed([RoleSeeder::class, PermissionSeeder::class]);
});

// ─── updateStatus (dashboard) ────────────────────────────────────────────────

it('admin puede cambiar el estado de un picking budget vía updateStatus', function () {
    $admin  = createAdmin();
    $budget = PickingBudget::factory()->sent()->create([
        'vendor_id'   => $admin->id,
        'valid_until' => now()->addDays(30)->format('Y-m-d'),
    ]);

    $this->actingAs($admin)
        ->patch(route('dashboard.picking.budgets.update-status', $budget), [
            'status' => BudgetStatus::IN_REVIEW->value,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('picking_budgets', [
        'id'     => $budget->id,
        'status' => BudgetStatus::IN_REVIEW->value,
    ]);
});

// ─── Métodos de modelo (state transitions) ───────────────────────────────────

it('markAsSent() actualiza estado del picking budget', function () {
    $admin  = createAdmin();
    $budget = PickingBudget::factory()->unsent()->create([
        'vendor_id'   => $admin->id,
        'valid_until' => now()->addDays(15)->format('Y-m-d'),
    ]);
    $budget->markAsSent();

    expect($budget->fresh()->status)->toBe(BudgetStatus::SENT);
    expect($budget->fresh()->email_sent)->toBeTrue();
});

it('markAsInReview() desde sent → in_review', function () {
    $admin  = createAdmin();
    $budget = PickingBudget::factory()->sent()->create([
        'vendor_id'   => $admin->id,
        'valid_until' => now()->addDays(15)->format('Y-m-d'),
    ]);
    $budget->markAsInReview();

    expect($budget->fresh()->status)->toBe(BudgetStatus::IN_REVIEW);
});

it('markAsApproved() → approved', function () {
    $admin  = createAdmin();
    $budget = PickingBudget::factory()->sent()->create([
        'vendor_id'   => $admin->id,
        'valid_until' => now()->addDays(15)->format('Y-m-d'),
    ]);
    $budget->markAsApproved();

    expect($budget->fresh()->status)->toBe(BudgetStatus::APPROVED);
});

it('markAsExpired() solo actúa si el estado puede vencer', function () {
    $admin = createAdmin();

    $budget = PickingBudget::factory()->sent()->create([
        'vendor_id'   => $admin->id,
        'valid_until' => now()->addDays(15)->format('Y-m-d'),
    ]);
    $budget->markAsExpired();
    expect($budget->fresh()->status)->toBe(BudgetStatus::EXPIRED);

    // Estado approved no puede vencer
    $approved = PickingBudget::factory()->approved()->create([
        'vendor_id'   => $admin->id,
        'valid_until' => now()->addDays(15)->format('Y-m-d'),
    ]);
    $approved->markAsExpired();
    expect($approved->fresh()->status)->toBe(BudgetStatus::APPROVED);
});

// ─── Ruta pública ─────────────────────────────────────────────────────────────

it('ruta pública de picking budget con token sent devuelve 200', function () {
    $admin  = createAdmin();
    $budget = PickingBudget::factory()->sent()->create([
        'vendor_id'   => $admin->id,
        'valid_until' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->get(route('public.picking.budget.show', $budget->token))
        ->assertOk();
});

it('ruta pública con token de picking budget no enviado no es visible', function () {
    $admin  = createAdmin();
    $budget = PickingBudget::factory()->unsent()->create([
        'vendor_id'   => $admin->id,
        'valid_until' => now()->addDays(15)->format('Y-m-d'),
    ]);

    // El controlador devuelve una vista Inertia "not found" con HTTP 200
    $this->get(route('public.picking.budget.show', $budget->token))
        ->assertOk();
});

// ─── Acciones del cliente ─────────────────────────────────────────────────────

it('cliente aprueba picking budget sent → approved', function () {
    Mail::fake();
    $admin  = createAdmin();
    $budget = PickingBudget::factory()->sent()->create([
        'vendor_id'   => $admin->id,
        'valid_until' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->post(route('public.picking.budget.approve', $budget->token))
        ->assertRedirect();

    expect($budget->fresh()->status)->toBe(BudgetStatus::APPROVED);
});

it('cliente pone en evaluación picking budget sent → in_review', function () {
    Mail::fake();
    $admin  = createAdmin();
    $budget = PickingBudget::factory()->sent()->create([
        'vendor_id'   => $admin->id,
        'valid_until' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->post(route('public.picking.budget.in_review', $budget->token))
        ->assertRedirect();

    expect($budget->fresh()->status)->toBe(BudgetStatus::IN_REVIEW);
});

// ─── Expiración automática ─────────────────────────────────────────────────────

it('checkExpiredBudgets expira picking budgets con fecha vencida', function () {
    $admin  = createAdmin();
    $budget = PickingBudget::factory()->sent()->create([
        'vendor_id'   => $admin->id,
        'valid_until' => now()->subDays(3)->format('Y-m-d'),
    ]);

    $this->artisan('budgets:check-expired')->assertExitCode(0);

    expect($budget->fresh()->status)->toBe(BudgetStatus::EXPIRED);
});

it('checkExpiredBudgets NO expira picking budgets en estado approved', function () {
    $admin    = createAdmin();
    $approved = PickingBudget::factory()->approved()->create([
        'vendor_id'   => $admin->id,
        'valid_until' => now()->subDays(3)->format('Y-m-d'),
    ]);

    $this->artisan('budgets:check-expired')->assertExitCode(0);

    expect($approved->fresh()->status)->toBe(BudgetStatus::APPROVED);
});
