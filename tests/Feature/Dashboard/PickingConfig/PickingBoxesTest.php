<?php

use App\Models\PickingBox;
use App\Models\PickingBudget;
use App\Models\PickingBudgetBox;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed([RoleSeeder::class, PermissionSeeder::class]);
});

// ─── Acceso ───────────────────────────────────────────────────────────────────

it('admin puede ver la página de cajas de picking', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->get(route('dashboard.picking.config.boxes'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('dashboard/picking/config/Boxes'));
});

it('vendedor sin permiso gestionar_costos_pick no puede ver las cajas', function () {
    $vendor = createVendor();

    $this->actingAs($vendor)
        ->get(route('dashboard.picking.config.boxes'))
        ->assertForbidden();
});

it('invitado es redirigido al login', function () {
    $this->get(route('dashboard.picking.config.boxes'))
        ->assertRedirect(route('login'));
});

// ─── Update All Boxes (bulk) ──────────────────────────────────────────────────

it('admin puede actualizar todas las cajas en bulk', function () {
    $admin = createAdmin();
    $box   = PickingBox::factory()->create();

    $this->actingAs($admin)
        ->put(route('dashboard.picking.config.boxes.update-all'), [
            'boxes' => [
                [
                    'id'         => $box->id,
                    'dimensions' => '300 x 200 x 150',
                    'cost'       => 99.50,
                    'is_active'  => true,
                ],
            ],
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertDatabaseHas('picking_boxes', [
        'id'         => $box->id,
        'dimensions' => '300 x 200 x 150',
        'cost'       => 99.50,
    ]);
});

it('actualizar bulk crea una nueva caja cuando el id empieza con new-', function () {
    $admin    = createAdmin();
    // Se necesita al menos una caja existente para evitar que el controller llame
    // PickingBox::truncate(), que en MySQL emite un commit implícito incompatible con RefreshDatabase.
    $existing = PickingBox::factory()->create();

    $this->actingAs($admin)
        ->put(route('dashboard.picking.config.boxes.update-all'), [
            'boxes' => [
                [
                    'id'         => $existing->id,
                    'dimensions' => $existing->dimensions,
                    'cost'       => $existing->cost,
                    'is_active'  => true,
                ],
                [
                    'id'         => 'new-1',
                    'dimensions' => '500 x 400 x 300',
                    'cost'       => 250.00,
                    'is_active'  => true,
                ],
            ],
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertDatabaseHas('picking_boxes', [
        'dimensions' => '500 x 400 x 300',
        'cost'       => 250.00,
    ]);
});

it('actualizar bulk elimina cajas que ya no están en la lista', function () {
    $admin        = createAdmin();
    $boxToKeep    = PickingBox::factory()->create();
    $boxToRemove  = PickingBox::factory()->create();

    $this->actingAs($admin)
        ->put(route('dashboard.picking.config.boxes.update-all'), [
            'boxes' => [
                [
                    'id'         => $boxToKeep->id,
                    'dimensions' => $boxToKeep->dimensions,
                    'cost'       => $boxToKeep->cost,
                    'is_active'  => true,
                ],
            ],
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertSoftDeleted('picking_boxes', ['id' => $boxToRemove->id]);
    $this->assertDatabaseHas('picking_boxes', ['id' => $boxToKeep->id]);
});

it('actualizar bulk falla sin el campo boxes', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->put(route('dashboard.picking.config.boxes.update-all'), [])
        ->assertSessionHasErrors('boxes');
});

it('actualizar bulk falla si dimensions está vacío', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->put(route('dashboard.picking.config.boxes.update-all'), [
            'boxes' => [
                ['id' => 'new-1', 'dimensions' => '', 'cost' => 100],
            ],
        ])
        ->assertSessionHasErrors();
});

it('actualizar bulk falla si cost es negativo', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->put(route('dashboard.picking.config.boxes.update-all'), [
            'boxes' => [
                ['id' => 'new-1', 'dimensions' => '200 x 200 x 200', 'cost' => -5],
            ],
        ])
        ->assertSessionHasErrors();
});

// ─── Destroy Box ──────────────────────────────────────────────────────────────

it('admin puede eliminar una caja sin presupuestos vigentes', function () {
    $admin = createAdmin();
    $box   = PickingBox::factory()->create();

    $this->actingAs($admin)
        ->delete(route('dashboard.picking.config.boxes.destroy', $box))
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertSoftDeleted('picking_boxes', ['id' => $box->id]);
});

it('no se puede eliminar una caja que está en presupuestos vigentes', function () {
    $admin  = createAdmin();
    $box    = PickingBox::factory()->create();
    $budget = PickingBudget::factory()->sent()->create([
        'vendor_id'   => $admin->id,
        'valid_until' => now()->addDays(15)->format('Y-m-d'),
    ]);

    PickingBudgetBox::create([
        'picking_budget_id' => $budget->id,
        'picking_box_id'    => $box->id,
        'box_dimensions'    => $box->dimensions,
        'box_unit_cost'     => $box->cost,
        'quantity'          => 10,
    ]);

    $this->actingAs($admin)
        ->delete(route('dashboard.picking.config.boxes.destroy', $box))
        ->assertRedirect()
        ->assertSessionHas('error');

    $this->assertDatabaseHas('picking_boxes', ['id' => $box->id]);
});
