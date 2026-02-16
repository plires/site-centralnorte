<?php

use App\Models\Client;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed([RoleSeeder::class, PermissionSeeder::class]);
});

// ─── Index ────────────────────────────────────────────────────────────────────

it('admin puede listar clientes', function () {
    $admin = createAdmin();
    Client::factory()->count(3)->create();

    $this->actingAs($admin)
        ->get(route('dashboard.clients.index'))
        ->assertOk();
});

it('vendedor no puede listar clientes', function () {
    $vendor = createVendor();
    Client::factory()->count(3)->create();

    $this->actingAs($vendor)
        ->get(route('dashboard.clients.index'))
        ->assertForbidden();
});

// ─── Store ────────────────────────────────────────────────────────────────────

it('admin puede crear un cliente', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->post(route('dashboard.clients.store'), [
            'name'    => 'Ana García',
            'email'   => 'ana@empresa.com',
            'company' => 'Empresa SA',
            'phone'   => '1122334455',
            'address' => 'Av. Siempreviva 123',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('clients', [
        'email' => 'ana@empresa.com',
        'name'  => 'Ana García',
    ]);
});

it('vendedor no puede crear un cliente', function () {
    $vendor = createVendor();

    $this->actingAs($vendor)
        ->post(route('dashboard.clients.store'), [
            'name'  => 'Carlos López',
            'email' => 'carlos@empresa.com',
        ])
        ->assertForbidden();

    $this->assertDatabaseMissing('clients', ['email' => 'carlos@empresa.com']);
});

// ─── Update ───────────────────────────────────────────────────────────────────

it('admin puede actualizar un cliente', function () {
    $admin  = createAdmin();
    $client = Client::factory()->create(['name' => 'Nombre Viejo']);

    $this->actingAs($admin)
        ->put(route('dashboard.clients.update', $client), [
            'name'  => 'Nombre Nuevo',
            'email' => $client->email,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('clients', [
        'id'   => $client->id,
        'name' => 'Nombre Nuevo',
    ]);
});

// ─── Destroy ──────────────────────────────────────────────────────────────────

it('admin puede eliminar un cliente (soft delete)', function () {
    $admin  = createAdmin();
    $client = Client::factory()->create();

    $this->actingAs($admin)
        ->delete(route('dashboard.clients.destroy', $client))
        ->assertRedirect();

    $this->assertSoftDeleted('clients', ['id' => $client->id]);
});
