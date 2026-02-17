<?php

use App\Models\PickingComponentIncrement;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed([RoleSeeder::class, PermissionSeeder::class]);
});

// ─── Acceso ───────────────────────────────────────────────────────────────────

it('admin puede ver la página de incrementos por componentes', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->get(route('dashboard.picking.config.component-increments'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('dashboard/picking/config/ComponentIncrements'));
});

it('vendedor sin permiso no puede ver los incrementos por componentes', function () {
    $vendor = createVendor();

    $this->actingAs($vendor)
        ->get(route('dashboard.picking.config.component-increments'))
        ->assertForbidden();
});

// ─── Store ────────────────────────────────────────────────────────────────────

it('admin puede crear un incremento por componentes', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->post(route('dashboard.picking.config.component-increments.store'), [
            'components_from' => 1,
            'components_to'   => 3,
            'description'     => '1 A 3 componentes',
            'percentage'      => 0.10,
            'is_active'       => true,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertDatabaseHas('picking_component_increments', [
        'components_from' => 1,
        'components_to'   => 3,
        'description'     => '1 A 3 componentes',
        'percentage'      => 0.10,
    ]);
});

it('puede crear un incremento abierto (sin components_to)', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->post(route('dashboard.picking.config.component-increments.store'), [
            'components_from' => 20,
            'components_to'   => null,
            'description'     => '20 o mas componentes',
            'percentage'      => 0.40,
            'is_active'       => true,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertDatabaseHas('picking_component_increments', [
        'components_from' => 20,
        'components_to'   => null,
        'description'     => '20 o mas componentes',
    ]);
});

it('crear falla si components_from está ausente', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->post(route('dashboard.picking.config.component-increments.store'), [
            'description' => 'Sin rango',
            'percentage'  => 0.10,
        ])
        ->assertSessionHasErrors('components_from');
});

it('crear falla si components_to no es mayor que components_from', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->post(route('dashboard.picking.config.component-increments.store'), [
            'components_from' => 5,
            'components_to'   => 3,
            'description'     => 'Rango inválido',
            'percentage'      => 0.10,
        ])
        ->assertSessionHasErrors('components_to');
});

it('crear falla si percentage es mayor a 1', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->post(route('dashboard.picking.config.component-increments.store'), [
            'components_from' => 1,
            'components_to'   => 3,
            'description'     => 'Test',
            'percentage'      => 1.50,
        ])
        ->assertSessionHasErrors('percentage');
});

it('crear falla si percentage es negativo', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->post(route('dashboard.picking.config.component-increments.store'), [
            'components_from' => 1,
            'components_to'   => 3,
            'description'     => 'Test',
            'percentage'      => -0.10,
        ])
        ->assertSessionHasErrors('percentage');
});

// ─── Update ───────────────────────────────────────────────────────────────────

it('admin puede actualizar un incremento por componentes', function () {
    $admin     = createAdmin();
    $increment = PickingComponentIncrement::factory()->create([
        'components_from' => 1,
        'components_to'   => 3,
        'description'     => '1 A 3 componentes',
        'percentage'      => 0.10,
        'is_active'       => true,
    ]);

    $this->actingAs($admin)
        ->put(route('dashboard.picking.config.component-increments.update', $increment), [
            'components_from' => 1,
            'components_to'   => 3,
            'description'     => '1 A 3 componentes actualizado',
            'percentage'      => 0.15,
            'is_active'       => true,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertDatabaseHas('picking_component_increments', [
        'id'          => $increment->id,
        'description' => '1 A 3 componentes actualizado',
        'percentage'  => 0.15,
    ]);
});

it('puede desactivar un incremento existente', function () {
    $admin     = createAdmin();
    $increment = PickingComponentIncrement::factory()->create([
        'is_active' => true,
    ]);

    $this->actingAs($admin)
        ->put(route('dashboard.picking.config.component-increments.update', $increment), [
            'components_from' => $increment->components_from,
            'description'     => $increment->description,
            'percentage'      => $increment->percentage,
            'is_active'       => false,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertDatabaseHas('picking_component_increments', [
        'id'        => $increment->id,
        'is_active' => false,
    ]);
});
