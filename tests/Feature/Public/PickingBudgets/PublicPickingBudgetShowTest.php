<?php

use App\Enums\BudgetStatus;
use App\Models\PickingBudget;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed([RoleSeeder::class, PermissionSeeder::class]);
});

// ─── Visibilidad por estado ───────────────────────────────────────────────────

it('picking budget en estado sent es visible públicamente', function () {
    $vendor = createAdmin();
    $budget = PickingBudget::factory()->sent()->create([
        'vendor_id'   => $vendor->id,
        'valid_until' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->get(route('public.picking.budget.show', $budget->token))
        ->assertOk();
});

it('picking budget en estado in_review es visible públicamente', function () {
    $vendor = createAdmin();
    $budget = PickingBudget::factory()->create([
        'vendor_id'   => $vendor->id,
        'status'      => BudgetStatus::IN_REVIEW,
        'valid_until' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->get(route('public.picking.budget.show', $budget->token))
        ->assertOk();
});

it('picking budget en estado approved es visible públicamente', function () {
    $vendor = createAdmin();
    $budget = PickingBudget::factory()->approved()->create([
        'vendor_id'   => $vendor->id,
        'valid_until' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->get(route('public.picking.budget.show', $budget->token))
        ->assertOk();
});

it('picking budget en estado rejected es visible públicamente', function () {
    $vendor = createAdmin();
    $budget = PickingBudget::factory()->rejected()->create([
        'vendor_id'   => $vendor->id,
        'valid_until' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->get(route('public.picking.budget.show', $budget->token))
        ->assertOk();
});

it('picking budget en estado unsent NO es visible (muestra vista not found)', function () {
    $vendor = createAdmin();
    $budget = PickingBudget::factory()->unsent()->create([
        'vendor_id'   => $vendor->id,
        'valid_until' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->get(route('public.picking.budget.show', $budget->token))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('public/components/BudgetNotFound'));
});

it('picking budget en estado draft NO es visible (muestra vista not found)', function () {
    $vendor = createAdmin();
    $budget = PickingBudget::factory()->draft()->create([
        'vendor_id'   => $vendor->id,
        'valid_until' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->get(route('public.picking.budget.show', $budget->token))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('public/components/BudgetNotFound'));
});

it('picking budget vencido por fecha muestra vista de vencido', function () {
    $vendor = createAdmin();
    $budget = PickingBudget::factory()->sent()->create([
        'vendor_id'   => $vendor->id,
        'valid_until' => now()->subDays(1)->format('Y-m-d'),
    ]);

    $this->get(route('public.picking.budget.show', $budget->token))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('public/components/BudgetNotFound')
            ->where('reason', 'expired'));
});

it('token de picking inexistente devuelve vista not found', function () {
    $this->get(route('public.picking.budget.show', 'token-picking-inexistente-123'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('public/components/BudgetNotFound')
            ->where('reason', 'not_found'));
});

// ─── Datos pasados a la vista ─────────────────────────────────────────────────

it('la vista de picking recibe los datos del presupuesto correctos', function () {
    $vendor = createAdmin();
    $budget = PickingBudget::factory()->sent()->create([
        'vendor_id'   => $vendor->id,
        'valid_until' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->get(route('public.picking.budget.show', $budget->token))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('public/picking/PickingBudget')
            ->has('budget')
            ->has('businessConfig'));
});

it('la vista de picking recibe businessConfig con iva_rate y apply_iva', function () {
    $vendor = createAdmin();
    $budget = PickingBudget::factory()->sent()->create([
        'vendor_id'   => $vendor->id,
        'valid_until' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->get(route('public.picking.budget.show', $budget->token))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('businessConfig.iva_rate')
            ->has('businessConfig.apply_iva'));
});
