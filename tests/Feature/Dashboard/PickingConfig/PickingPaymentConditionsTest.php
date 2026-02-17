<?php

use App\Models\PickingPaymentCondition;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed([RoleSeeder::class, PermissionSeeder::class]);
});

// ─── Acceso ───────────────────────────────────────────────────────────────────

it('admin puede ver la página de condiciones de pago de picking', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->get(route('dashboard.picking.config.payment-conditions'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('dashboard/picking/config/PaymentConditions'));
});

it('vendedor sin permiso no puede ver las condiciones de pago', function () {
    $vendor = createVendor();

    $this->actingAs($vendor)
        ->get(route('dashboard.picking.config.payment-conditions'))
        ->assertForbidden();
});

it('invitado es redirigido al login', function () {
    $this->get(route('dashboard.picking.config.payment-conditions'))
        ->assertRedirect(route('login'));
});

// ─── Store ────────────────────────────────────────────────────────────────────

it('admin puede crear una condición de pago', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->post(route('dashboard.picking.config.payment-conditions.store'), [
            'description' => 'Contado',
            'percentage'  => -5.00,
            'is_active'   => true,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertDatabaseHas('picking_payment_conditions', [
        'description' => 'Contado',
        'percentage'  => -5.00,
    ]);
});

it('puede crear una condición con porcentaje cero', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->post(route('dashboard.picking.config.payment-conditions.store'), [
            'description' => 'Sin cargo',
            'percentage'  => 0.00,
            'is_active'   => true,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertDatabaseHas('picking_payment_conditions', [
        'description' => 'Sin cargo',
        'percentage'  => 0.00,
    ]);
});

it('puede crear una condición con porcentaje positivo (recargo)', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->post(route('dashboard.picking.config.payment-conditions.store'), [
            'description' => '90 días',
            'percentage'  => 15.00,
            'is_active'   => true,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertDatabaseHas('picking_payment_conditions', [
        'description' => '90 días',
        'percentage'  => 15.00,
    ]);
});

it('crear falla si description está ausente', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->post(route('dashboard.picking.config.payment-conditions.store'), [
            'percentage' => 5.00,
        ])
        ->assertSessionHasErrors('description');
});

it('crear falla si percentage supera el máximo de 100', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->post(route('dashboard.picking.config.payment-conditions.store'), [
            'description' => 'Inválida',
            'percentage'  => 150.00,
        ])
        ->assertSessionHasErrors('percentage');
});

it('crear falla si percentage es menor al mínimo de -100', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->post(route('dashboard.picking.config.payment-conditions.store'), [
            'description' => 'Inválida',
            'percentage'  => -150.00,
        ])
        ->assertSessionHasErrors('percentage');
});

it('crear falla si description supera los 100 caracteres', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->post(route('dashboard.picking.config.payment-conditions.store'), [
            'description' => str_repeat('a', 101),
            'percentage'  => 5.00,
        ])
        ->assertSessionHasErrors('description');
});

// ─── Update ───────────────────────────────────────────────────────────────────

it('admin puede actualizar una condición de pago', function () {
    $admin     = createAdmin();
    $condition = PickingPaymentCondition::factory()->create([
        'description' => 'Contado',
        'percentage'  => 0.00,
        'is_active'   => true,
    ]);

    $this->actingAs($admin)
        ->put(route('dashboard.picking.config.payment-conditions.update', $condition), [
            'description' => 'Contado inmediato',
            'percentage'  => -10.00,
            'is_active'   => true,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertDatabaseHas('picking_payment_conditions', [
        'id'          => $condition->id,
        'description' => 'Contado inmediato',
        'percentage'  => -10.00,
    ]);
});

it('puede desactivar una condición de pago existente', function () {
    $admin     = createAdmin();
    $condition = PickingPaymentCondition::factory()->create(['is_active' => true]);

    $this->actingAs($admin)
        ->put(route('dashboard.picking.config.payment-conditions.update', $condition), [
            'description' => $condition->description,
            'percentage'  => $condition->percentage,
            'is_active'   => false,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertDatabaseHas('picking_payment_conditions', [
        'id'        => $condition->id,
        'is_active' => false,
    ]);
});

it('actualizar falla si description está ausente', function () {
    $admin     = createAdmin();
    $condition = PickingPaymentCondition::factory()->create();

    $this->actingAs($admin)
        ->put(route('dashboard.picking.config.payment-conditions.update', $condition), [
            'percentage' => 5.00,
        ])
        ->assertSessionHasErrors('description');
});

// ─── Destroy ──────────────────────────────────────────────────────────────────

it('admin puede eliminar una condición de pago', function () {
    $admin     = createAdmin();
    $condition = PickingPaymentCondition::factory()->create();

    $this->actingAs($admin)
        ->delete(route('dashboard.picking.config.payment-conditions.destroy', $condition))
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertSoftDeleted('picking_payment_conditions', ['id' => $condition->id]);
});

it('vendedor sin permiso no puede eliminar una condición de pago', function () {
    $vendor    = createVendor();
    $condition = PickingPaymentCondition::factory()->create();

    $this->actingAs($vendor)
        ->delete(route('dashboard.picking.config.payment-conditions.destroy', $condition))
        ->assertForbidden();

    $this->assertDatabaseHas('picking_payment_conditions', ['id' => $condition->id]);
});
