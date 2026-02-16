<?php

use App\Models\Role;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed([RoleSeeder::class, PermissionSeeder::class]);
});

// ─── Store ─────────────────────────────────────────────────────────────────────

it('falla si el nombre está vacío al crear un rol', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->post(route('dashboard.roles.store'), ['name' => ''])
        ->assertSessionHasErrors('name');
});

it('falla si el nombre del rol ya existe al crear', function () {
    $admin = createAdmin();
    Role::create(['name' => 'duplicado', 'is_system' => false]);

    $this->actingAs($admin)
        ->post(route('dashboard.roles.store'), ['name' => 'duplicado'])
        ->assertSessionHasErrors('name');
});

// ─── Update ────────────────────────────────────────────────────────────────────

it('falla si el nombre está vacío al actualizar un rol', function () {
    $admin = createAdmin();
    $role  = Role::create(['name' => 'temporal', 'is_system' => false]);

    $this->actingAs($admin)
        ->put(route('dashboard.roles.update', $role), ['name' => ''])
        ->assertSessionHasErrors('name');
});

it('falla si el nombre ya está en uso por otro rol al actualizar', function () {
    $admin = createAdmin();
    Role::create(['name' => 'ocupado', 'is_system' => false]);
    $role  = Role::create(['name' => 'temporal-upd', 'is_system' => false]);

    $this->actingAs($admin)
        ->put(route('dashboard.roles.update', $role), ['name' => 'ocupado'])
        ->assertSessionHasErrors('name');
});

it('no falla al guardar un rol con su propio nombre actual', function () {
    $admin = createAdmin();
    $role  = Role::create(['name' => 'mi-rol', 'is_system' => false]);

    $this->actingAs($admin)
        ->put(route('dashboard.roles.update', $role), [
            'name' => 'mi-rol', // mismo nombre → el unique debe ignorar el propio rol
        ])
        ->assertSessionHasNoErrors();
});
