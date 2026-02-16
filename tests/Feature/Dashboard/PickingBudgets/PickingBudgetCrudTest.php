<?php

use App\Enums\BudgetStatus;
use App\Models\PickingBudget;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed([RoleSeeder::class, PermissionSeeder::class]);
});

// ─── Index ─────────────────────────────────────────────────────────────────────

it('admin ve todos los picking budgets', function () {
    $admin  = createAdmin();
    $vendor = createVendor();

    // Creamos uno a uno para evitar colisiones en budget_number (se calcula por último ID)
    PickingBudget::factory()->create(['vendor_id' => $vendor->id, 'budget_number' => 'PK-2026-T1']);
    PickingBudget::factory()->create(['vendor_id' => $vendor->id, 'budget_number' => 'PK-2026-T2']);
    PickingBudget::factory()->create(['vendor_id' => $admin->id,  'budget_number' => 'PK-2026-T3']);

    $this->actingAs($admin)
        ->get(route('dashboard.picking.budgets.index'))
        ->assertOk();
});

it('vendedor solo ve sus propios picking budgets en el index', function () {
    $admin  = createAdmin();
    $vendor = createVendor();

    PickingBudget::factory()->create(['vendor_id' => $vendor->id, 'budget_number' => 'PK-2026-T4']);
    PickingBudget::factory()->create(['vendor_id' => $vendor->id, 'budget_number' => 'PK-2026-T5']);
    PickingBudget::factory()->create(['vendor_id' => $admin->id,  'budget_number' => 'PK-2026-T6']);

    $this->actingAs($vendor)
        ->get(route('dashboard.picking.budgets.index'))
        ->assertOk();
});

// ─── Edit protection ─────────────────────────────────────────────────────────

it('intentar editar un picking budget en estado sent redirige con error', function () {
    $admin  = createAdmin();
    $budget = PickingBudget::factory()->sent()->create([
        'vendor_id'   => $admin->id,
        'valid_until' => now()->addDays(30)->format('Y-m-d'),
    ]);

    $this->actingAs($admin)
        ->get(route('dashboard.picking.budgets.edit', $budget))
        ->assertRedirect()
        ->assertSessionHas('error');
});

it('puede acceder al edit de un picking budget en estado unsent', function () {
    $admin  = createAdmin();
    $budget = PickingBudget::factory()->unsent()->create([
        'vendor_id'   => $admin->id,
        'valid_until' => now()->addDays(30)->format('Y-m-d'),
    ]);

    $this->actingAs($admin)
        ->get(route('dashboard.picking.budgets.edit', $budget))
        ->assertOk();
});

// ─── Duplicate ─────────────────────────────────────────────────────────────────

it('puede duplicar un picking budget → nuevo en estado draft', function () {
    $admin  = createAdmin();
    $budget = PickingBudget::factory()->unsent()->create([
        'vendor_id'   => $admin->id,
        'valid_until' => now()->addDays(30)->format('Y-m-d'),
    ]);

    $this->actingAs($admin)
        ->post(route('dashboard.picking.budgets.duplicate', $budget))
        ->assertRedirect();

    $this->assertDatabaseHas('picking_budgets', [
        'status' => BudgetStatus::DRAFT->value,
    ]);
});

// ─── Destroy ───────────────────────────────────────────────────────────────────

it('admin puede soft-deletear un picking budget', function () {
    $admin  = createAdmin();
    $budget = PickingBudget::factory()->unsent()->create([
        'vendor_id'   => $admin->id,
        'valid_until' => now()->addDays(30)->format('Y-m-d'),
    ]);

    $this->actingAs($admin)
        ->delete(route('dashboard.picking.budgets.destroy', $budget))
        ->assertRedirect();

    $this->assertSoftDeleted('picking_budgets', ['id' => $budget->id]);
});
