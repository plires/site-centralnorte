<?php

use App\Enums\BudgetStatus;
use App\Models\Budget;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed([RoleSeeder::class, PermissionSeeder::class]);
});

// ─── Visibilidad por estado ───────────────────────────────────────────────────

it('presupuesto en estado sent es visible públicamente', function () {
    $vendor = createAdmin();
    $budget = Budget::factory()->sent()->create([
        'user_id'     => $vendor->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->get(route('public.budget.show', $budget->token))
        ->assertOk();
});

it('presupuesto en estado in_review es visible públicamente', function () {
    $vendor = createAdmin();
    $budget = Budget::factory()->create([
        'user_id'     => $vendor->id,
        'status'      => BudgetStatus::IN_REVIEW,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->get(route('public.budget.show', $budget->token))
        ->assertOk();
});

it('presupuesto en estado approved es visible públicamente', function () {
    $vendor = createAdmin();
    $budget = Budget::factory()->approved()->create([
        'user_id'     => $vendor->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->get(route('public.budget.show', $budget->token))
        ->assertOk();
});

it('presupuesto en estado rejected es visible públicamente', function () {
    $vendor = createAdmin();
    $budget = Budget::factory()->rejected()->create([
        'user_id'     => $vendor->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->get(route('public.budget.show', $budget->token))
        ->assertOk();
});

it('presupuesto en estado unsent NO es visible (muestra vista not found)', function () {
    $vendor = createAdmin();
    $budget = Budget::factory()->unsent()->create([
        'user_id'     => $vendor->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);

    // El controlador devuelve HTTP 200 pero renderiza la vista BudgetNotFound
    $this->get(route('public.budget.show', $budget->token))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('public/components/BudgetNotFound'));
});

it('presupuesto en estado draft NO es visible (muestra vista not found)', function () {
    $vendor = createAdmin();
    $budget = Budget::factory()->draft()->create([
        'user_id'     => $vendor->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->get(route('public.budget.show', $budget->token))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('public/components/BudgetNotFound'));
});

it('presupuesto vencido por fecha muestra vista de vencido', function () {
    $vendor = createAdmin();
    $budget = Budget::factory()->sent()->create([
        'user_id'     => $vendor->id,
        'expiry_date' => now()->subDays(1)->format('Y-m-d'),
    ]);

    $this->get(route('public.budget.show', $budget->token))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('public/components/BudgetNotFound')
            ->where('reason', 'expired'));
});

it('token inexistente devuelve vista not found', function () {
    $this->get(route('public.budget.show', 'token-que-no-existe-123456'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('public/components/BudgetNotFound')
            ->where('reason', 'not_found'));
});

// ─── Datos pasados a la vista ─────────────────────────────────────────────────

it('la vista recibe los datos del presupuesto correctos', function () {
    $vendor = createAdmin();
    $budget = Budget::factory()->sent()->create([
        'user_id'     => $vendor->id,
        'title'       => 'Presupuesto Test Público',
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->get(route('public.budget.show', $budget->token))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('public/budgets/Budget')
            ->has('budget')
            ->has('businessConfig')
            ->where('budget.id', $budget->id)
            ->where('budget.title', 'Presupuesto Test Público')
            ->where('budget.token', $budget->token)
            ->where('budget.status', BudgetStatus::SENT->value));
});

it('la vista recibe businessConfig con iva_rate y apply_iva', function () {
    $vendor = createAdmin();
    $budget = Budget::factory()->sent()->create([
        'user_id'     => $vendor->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->get(route('public.budget.show', $budget->token))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('businessConfig.iva_rate')
            ->has('businessConfig.apply_iva'));
});

it('la vista recibe datos del cliente', function () {
    $vendor = createAdmin();
    $budget = Budget::factory()->sent()->create([
        'user_id'     => $vendor->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->get(route('public.budget.show', $budget->token))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('budget.client.name')
            ->has('budget.client.company'));
});

it('la vista recibe grouped_items con regulares y variantes', function () {
    $vendor = createAdmin();
    $budget = Budget::factory()->sent()->create([
        'user_id'     => $vendor->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->get(route('public.budget.show', $budget->token))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('budget.grouped_items.regular')
            ->has('budget.grouped_items.variants'));
});
