<?php

use App\Enums\BudgetStatus;
use App\Models\Budget;
use App\Models\Client;
use App\Models\PickingBudget;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed([RoleSeeder::class, PermissionSeeder::class]);
});

// ─── Index ────────────────────────────────────────────────────────────────────

it('admin puede listar todos los clientes', function () {
    $admin   = createAdmin();
    $vendor  = createVendor();
    $client1 = Client::factory()->create(['user_id' => $admin->id]);
    $client2 = Client::factory()->create(['user_id' => $vendor->id]);

    $this->actingAs($admin)
        ->get(route('dashboard.clients.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/clients/Index')
            ->where('clients', fn ($clients) => collect($clients)->pluck('id')->contains($client1->id)
                && collect($clients)->pluck('id')->contains($client2->id))
        );
});

it('vendedor solo ve sus propios clientes en el index', function () {
    $vendor       = createVendor();
    $admin        = createAdmin();
    $propioClient = Client::factory()->create(['user_id' => $vendor->id]);
    $ajenoClient  = Client::factory()->create(['user_id' => $admin->id]);

    $this->actingAs($vendor)
        ->get(route('dashboard.clients.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/clients/Index')
            ->where('clients', fn ($clients) => collect($clients)->pluck('id')->contains($propioClient->id)
                && !collect($clients)->pluck('id')->contains($ajenoClient->id))
        );
});

// ─── Show ─────────────────────────────────────────────────────────────────────

it('vendedor puede ver un cliente propio', function () {
    $vendor = createVendor();
    $client = Client::factory()->create(['user_id' => $vendor->id]);

    $this->actingAs($vendor)
        ->get(route('dashboard.clients.show', $client))
        ->assertOk();
});

it('vendedor no puede ver un cliente ajeno', function () {
    $vendor     = createVendor();
    $otroVendor = createVendor();
    $client     = Client::factory()->create(['user_id' => $otroVendor->id]);

    $this->actingAs($vendor)
        ->get(route('dashboard.clients.show', $client))
        ->assertForbidden();
});

it('admin puede ver cualquier cliente', function () {
    $admin  = createAdmin();
    $vendor = createVendor();
    $client = Client::factory()->create(['user_id' => $vendor->id]);

    $this->actingAs($admin)
        ->get(route('dashboard.clients.show', $client))
        ->assertOk();
});

// ─── Store ────────────────────────────────────────────────────────────────────

it('vendedor puede crear un cliente y queda asignado a él automáticamente', function () {
    $vendor = createVendor();

    $this->actingAs($vendor)
        ->post(route('dashboard.clients.store'), [
            'name'  => 'Cliente Test',
            'email' => 'cliente@test.com',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('clients', [
        'email'   => 'cliente@test.com',
        'user_id' => $vendor->id,
    ]);
});

it('admin puede crear un cliente y asignarlo a un vendedor específico', function () {
    $admin  = createAdmin();
    $vendor = createVendor();

    $this->actingAs($admin)
        ->post(route('dashboard.clients.store'), [
            'name'    => 'Ana García',
            'email'   => 'ana@empresa.com',
            'company' => 'Empresa SA',
            'user_id' => $vendor->id,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('clients', [
        'email'   => 'ana@empresa.com',
        'user_id' => $vendor->id,
    ]);
});

it('admin puede crear un cliente y asignarlo a sí mismo', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->post(route('dashboard.clients.store'), [
            'name'    => 'Cliente Propio',
            'email'   => 'propio@empresa.com',
            'user_id' => $admin->id,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('clients', [
        'email'   => 'propio@empresa.com',
        'user_id' => $admin->id,
    ]);
});

// ─── Edit / Update ────────────────────────────────────────────────────────────

it('admin puede actualizar cualquier cliente', function () {
    $admin  = createAdmin();
    $client = Client::factory()->create(['name' => 'Nombre Viejo', 'user_id' => $admin->id]);

    $this->actingAs($admin)
        ->put(route('dashboard.clients.update', $client), [
            'name'  => 'Nombre Nuevo',
            'email' => $client->email,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('clients', ['id' => $client->id, 'name' => 'Nombre Nuevo']);
});

it('admin puede reasignar un cliente a otro vendedor al editar', function () {
    $admin   = createAdmin();
    $vendor1 = createVendor();
    $vendor2 = createVendor();
    $client  = Client::factory()->create(['user_id' => $vendor1->id]);

    $this->actingAs($admin)
        ->put(route('dashboard.clients.update', $client), [
            'name'    => $client->name,
            'email'   => $client->email,
            'user_id' => $vendor2->id,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('clients', ['id' => $client->id, 'user_id' => $vendor2->id]);
});

it('vendedor puede actualizar un cliente propio', function () {
    $vendor = createVendor();
    $client = Client::factory()->create(['name' => 'Nombre Viejo', 'user_id' => $vendor->id]);

    $this->actingAs($vendor)
        ->put(route('dashboard.clients.update', $client), [
            'name'  => 'Nombre Nuevo',
            'email' => $client->email,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('clients', ['id' => $client->id, 'name' => 'Nombre Nuevo']);
});

it('vendedor no puede actualizar un cliente ajeno', function () {
    $vendor     = createVendor();
    $otroVendor = createVendor();
    $client     = Client::factory()->create(['user_id' => $otroVendor->id]);

    $this->actingAs($vendor)
        ->put(route('dashboard.clients.update', $client), [
            'name'  => 'Intento de cambio',
            'email' => $client->email,
        ])
        ->assertForbidden();
});

it('vendedor no puede reasignar un cliente a otro usuario', function () {
    $vendor     = createVendor();
    $otroVendor = createVendor();
    $client     = Client::factory()->create(['user_id' => $vendor->id]);

    $this->actingAs($vendor)
        ->put(route('dashboard.clients.update', $client), [
            'name'    => $client->name,
            'email'   => $client->email,
            'user_id' => $otroVendor->id,
        ])
        ->assertRedirect();

    // El user_id no debe haber cambiado
    $this->assertDatabaseHas('clients', ['id' => $client->id, 'user_id' => $vendor->id]);
});

// ─── Destroy ──────────────────────────────────────────────────────────────────

it('admin puede eliminar cualquier cliente (soft delete)', function () {
    $admin  = createAdmin();
    $vendor = createVendor();
    $client = Client::factory()->create(['user_id' => $vendor->id]);

    $this->actingAs($admin)
        ->delete(route('dashboard.clients.destroy', $client))
        ->assertRedirect();

    $this->assertSoftDeleted('clients', ['id' => $client->id]);
});

it('vendedor puede eliminar un cliente propio (soft delete)', function () {
    $vendor = createVendor();
    $client = Client::factory()->create(['user_id' => $vendor->id]);

    $this->actingAs($vendor)
        ->delete(route('dashboard.clients.destroy', $client))
        ->assertRedirect();

    $this->assertSoftDeleted('clients', ['id' => $client->id]);
});

it('vendedor no puede eliminar un cliente ajeno', function () {
    $vendor     = createVendor();
    $otroVendor = createVendor();
    $client     = Client::factory()->create(['user_id' => $otroVendor->id]);

    $this->actingAs($vendor)
        ->delete(route('dashboard.clients.destroy', $client))
        ->assertForbidden();

    $this->assertDatabaseHas('clients', ['id' => $client->id, 'deleted_at' => null]);
});

it('admin NO puede eliminar un cliente con presupuestos merch vigentes', function () {
    $admin  = createAdmin();
    $client = Client::factory()->create(['user_id' => $admin->id]);

    Budget::factory()->sent()->create([
        'user_id'   => $admin->id,
        'client_id' => $client->id,
    ]);

    $this->actingAs($admin)
        ->delete(route('dashboard.clients.destroy', $client))
        ->assertRedirect()
        ->assertSessionHas('error');

    $this->assertDatabaseHas('clients', ['id' => $client->id, 'deleted_at' => null]);
});

it('admin NO puede eliminar un cliente con presupuestos picking vigentes', function () {
    $admin  = createAdmin();
    $client = Client::factory()->create(['user_id' => $admin->id]);

    PickingBudget::factory()->sent()->create([
        'vendor_id' => $admin->id,
        'client_id' => $client->id,
    ]);

    $this->actingAs($admin)
        ->delete(route('dashboard.clients.destroy', $client))
        ->assertRedirect()
        ->assertSessionHas('error');

    $this->assertDatabaseHas('clients', ['id' => $client->id, 'deleted_at' => null]);
});

it('admin puede eliminar un cliente cuyos presupuestos están todos expirados o rechazados', function () {
    $admin  = createAdmin();
    $client = Client::factory()->create(['user_id' => $admin->id]);

    Budget::factory()->create([
        'user_id'   => $admin->id,
        'client_id' => $client->id,
        'status'    => BudgetStatus::EXPIRED,
    ]);
    Budget::factory()->rejected()->create([
        'user_id'   => $admin->id,
        'client_id' => $client->id,
    ]);
    PickingBudget::factory()->create([
        'vendor_id' => $admin->id,
        'client_id' => $client->id,
        'status'    => BudgetStatus::EXPIRED,
    ]);

    $this->actingAs($admin)
        ->delete(route('dashboard.clients.destroy', $client))
        ->assertRedirect();

    $this->assertSoftDeleted('clients', ['id' => $client->id]);
});
