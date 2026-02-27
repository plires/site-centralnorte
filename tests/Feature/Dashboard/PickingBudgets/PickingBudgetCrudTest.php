<?php

use App\Enums\BudgetStatus;
use App\Models\Client;
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

// ─── Campos de fecha ───────────────────────────────────────────────────────────

it('picking budget puede tener issue_date explícita y se persiste correctamente', function () {
    $admin     = createAdmin();
    $issueDate = now()->subDays(5)->format('Y-m-d');

    $budget = PickingBudget::factory()->unsent()->create([
        'vendor_id'   => $admin->id,
        'issue_date'  => $issueDate,
        'valid_until' => now()->addDays(30)->format('Y-m-d'),
    ]);

    $this->assertDatabaseHas('picking_budgets', [
        'id'         => $budget->id,
        'issue_date' => $issueDate,
    ]);

    expect($budget->fresh()->issue_date->format('Y-m-d'))->toBe($issueDate);
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

// ─── Scope de clientes en Create ───────────────────────────────────────────────

it('vendedor solo ve sus propios clientes en la página de crear picking budget', function () {
    $vendor      = createVendor();
    $ownClient   = Client::factory()->create(['user_id' => $vendor->id]);
    $otherClient = Client::factory()->create();

    $this->actingAs($vendor)
        ->get(route('dashboard.picking.budgets.create'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/picking/Create')
            ->where('clients', fn ($clients) =>
                collect($clients)->pluck('value')->contains($ownClient->id) &&
                !collect($clients)->pluck('value')->contains($otherClient->id)
            )
        );
});

it('admin ve todos los clientes en la página de crear picking budget', function () {
    $admin   = createAdmin();
    $client1 = Client::factory()->create();
    $client2 = Client::factory()->create();

    $this->actingAs($admin)
        ->get(route('dashboard.picking.budgets.create'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/picking/Create')
            ->where('clients', fn ($clients) =>
                collect($clients)->pluck('value')->contains($client1->id) &&
                collect($clients)->pluck('value')->contains($client2->id)
            )
        );
});

it('vendedor ve lista vacía de clientes si no tiene ninguno asignado al crear picking budget', function () {
    $vendor = createVendor();
    Client::factory()->create(); // cliente de otro usuario

    $this->actingAs($vendor)
        ->get(route('dashboard.picking.budgets.create'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/picking/Create')
            ->where('clients', fn ($clients) => count($clients) === 0)
        );
});

// ─── Scope de clientes en Edit ─────────────────────────────────────────────────

it('vendedor solo ve sus propios clientes en la página de editar picking budget', function () {
    $vendor      = createVendor();
    $ownClient   = Client::factory()->create(['user_id' => $vendor->id]);
    $otherClient = Client::factory()->create();
    $budget      = PickingBudget::factory()->unsent()->create([
        'vendor_id'   => $vendor->id,
        'client_id'   => $ownClient->id,
        'valid_until' => now()->addDays(30)->format('Y-m-d'),
    ]);

    $this->actingAs($vendor)
        ->get(route('dashboard.picking.budgets.edit', $budget))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/picking/Edit')
            ->where('clients', fn ($clients) =>
                collect($clients)->pluck('value')->contains($ownClient->id) &&
                !collect($clients)->pluck('value')->contains($otherClient->id)
            )
        );
});

it('admin ve todos los clientes en la página de editar picking budget', function () {
    $admin   = createAdmin();
    $client1 = Client::factory()->create();
    $client2 = Client::factory()->create();
    $budget  = PickingBudget::factory()->unsent()->create([
        'vendor_id'   => $admin->id,
        'client_id'   => $client1->id,
        'valid_until' => now()->addDays(30)->format('Y-m-d'),
    ]);

    $this->actingAs($admin)
        ->get(route('dashboard.picking.budgets.edit', $budget))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/picking/Edit')
            ->where('clients', fn ($clients) =>
                collect($clients)->pluck('value')->contains($client1->id) &&
                collect($clients)->pluck('value')->contains($client2->id)
            )
        );
});
