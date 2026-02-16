<?php

use App\Models\Client;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed([RoleSeeder::class, PermissionSeeder::class]);
});

// ─── Nombre requerido ─────────────────────────────────────────────────────────

it('falla si el nombre está vacío al crear', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->post(route('dashboard.clients.store'), [
            'name'  => '',
            'email' => 'test@test.com',
        ])
        ->assertSessionHasErrors('name');
});

// ─── Email inválido ───────────────────────────────────────────────────────────

it('falla si el email tiene formato inválido al crear', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->post(route('dashboard.clients.store'), [
            'name'  => 'Juan',
            'email' => 'no-es-un-email',
        ])
        ->assertSessionHasErrors('email');
});

// ─── Email requerido ──────────────────────────────────────────────────────────

it('falla si el email está vacío al crear', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->post(route('dashboard.clients.store'), [
            'name' => 'Solo Nombre',
        ])
        ->assertSessionHasErrors('email');
});

// ─── Campos opcionales ────────────────────────────────────────────────────────

it('se puede crear un cliente con nombre y email sin otros campos opcionales', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->post(route('dashboard.clients.store'), [
            'name'  => 'Solo Nombre',
            'email' => 'solo@ejemplo.com',
        ])
        ->assertSessionHasNoErrors();

    $this->assertDatabaseHas('clients', ['name' => 'Solo Nombre', 'email' => 'solo@ejemplo.com']);
});
