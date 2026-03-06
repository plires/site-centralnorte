<?php

use App\Models\Budget;
use App\Models\Client;
use App\Models\PickingBudget;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed([RoleSeeder::class, PermissionSeeder::class]);
    $this->admin = createAdmin();
});

// ─── Protecciones básicas ─────────────────────────────────────────────────────

it('no puede eliminar su propia cuenta', function () {
    $this->actingAs($this->admin)
        ->delete(route('dashboard.users.destroy', $this->admin))
        ->assertRedirect()
        ->assertSessionHas('error', 'No puedes eliminar tu propia cuenta.');

    expect(User::withTrashed()->find($this->admin->id)->deleted_at)->toBeNull();
});

it('no puede eliminar el último administrador del sistema', function () {
    $vendor = createVendor();

    $this->actingAs($this->admin)
        ->delete(route('dashboard.users.destroy', $this->admin))
        ->assertRedirect()
        ->assertSessionHas('error');

    expect(User::withTrashed()->find($this->admin->id)->deleted_at)->toBeNull();
});

it('puede eliminar un usuario sin registros asignados sin proveer reassign_to', function () {
    $vendor = createVendor();

    $this->actingAs($this->admin)
        ->delete(route('dashboard.users.destroy', $vendor))
        ->assertRedirect()
        ->assertSessionHas('success');

    expect(User::withTrashed()->find($vendor->id)->deleted_at)->not->toBeNull();
});

it('el usuario eliminado queda en soft-delete, no se borra físicamente', function () {
    $vendor = createVendor();

    $this->actingAs($this->admin)
        ->delete(route('dashboard.users.destroy', $vendor));

    expect(User::withTrashed()->find($vendor->id))->not->toBeNull();
    expect(User::find($vendor->id))->toBeNull();
});

// ─── Validación de reassign_to ────────────────────────────────────────────────

it('retorna error si el usuario tiene presupuestos merch y no se provee reassign_to', function () {
    $vendor = createVendor();
    Budget::factory()->create(['user_id' => $vendor->id]);

    $this->actingAs($this->admin)
        ->delete(route('dashboard.users.destroy', $vendor))
        ->assertRedirect()
        ->assertSessionHas('error');

    expect(User::find($vendor->id))->not->toBeNull();
});

it('retorna error si el usuario tiene presupuestos picking y no se provee reassign_to', function () {
    $vendor = createVendor();
    PickingBudget::factory()->create(['vendor_id' => $vendor->id]);

    $this->actingAs($this->admin)
        ->delete(route('dashboard.users.destroy', $vendor))
        ->assertRedirect()
        ->assertSessionHas('error');

    expect(User::find($vendor->id))->not->toBeNull();
});

it('retorna error si el usuario tiene clientes y no se provee reassign_to', function () {
    $vendor = createVendor();
    Client::factory()->create(['user_id' => $vendor->id]);

    $this->actingAs($this->admin)
        ->delete(route('dashboard.users.destroy', $vendor))
        ->assertRedirect()
        ->assertSessionHas('error');

    expect(User::find($vendor->id))->not->toBeNull();
});

it('retorna error si reassign_to apunta a un usuario inexistente', function () {
    $vendor = createVendor();
    Budget::factory()->create(['user_id' => $vendor->id]);

    $this->actingAs($this->admin)
        ->delete(route('dashboard.users.destroy', $vendor), ['reassign_to' => 99999])
        ->assertRedirect()
        ->assertSessionHas('error');

    expect(User::find($vendor->id))->not->toBeNull();
});

it('retorna error si reassign_to apunta al mismo usuario a eliminar', function () {
    $vendor = createVendor();
    Budget::factory()->create(['user_id' => $vendor->id]);

    $this->actingAs($this->admin)
        ->delete(route('dashboard.users.destroy', $vendor), ['reassign_to' => $vendor->id])
        ->assertRedirect()
        ->assertSessionHas('error');

    expect(User::find($vendor->id))->not->toBeNull();
});

it('retorna error si reassign_to apunta a un usuario soft-deleted', function () {
    $vendor    = createVendor();
    $otherVendor = createVendor();
    Budget::factory()->create(['user_id' => $vendor->id]);
    $otherVendor->delete();

    $this->actingAs($this->admin)
        ->delete(route('dashboard.users.destroy', $vendor), ['reassign_to' => $otherVendor->id])
        ->assertRedirect()
        ->assertSessionHas('error');

    expect(User::find($vendor->id))->not->toBeNull();
});

// ─── Reasignación de presupuestos merch ───────────────────────────────────────

it('reasigna presupuestos merch al nuevo vendedor y elimina el usuario', function () {
    $vendor    = createVendor();
    $newVendor = createVendor();
    $budget    = Budget::factory()->create(['user_id' => $vendor->id]);

    $this->actingAs($this->admin)
        ->delete(route('dashboard.users.destroy', $vendor), ['reassign_to' => $newVendor->id])
        ->assertRedirect()
        ->assertSessionHas('success');

    // El vendedor fue soft-deleted
    expect(User::withTrashed()->find($vendor->id)->deleted_at)->not->toBeNull();

    // El presupuesto ahora apunta al nuevo vendedor
    expect($budget->fresh()->user_id)->toBe($newVendor->id);
});

it('reasigna múltiples presupuestos merch al nuevo vendedor', function () {
    $vendor    = createVendor();
    $newVendor = createVendor();
    $budgets   = Budget::factory()->count(3)->create(['user_id' => $vendor->id]);

    $this->actingAs($this->admin)
        ->delete(route('dashboard.users.destroy', $vendor), ['reassign_to' => $newVendor->id]);

    foreach ($budgets as $budget) {
        expect($budget->fresh()->user_id)->toBe($newVendor->id);
    }
});

// ─── Reasignación de presupuestos picking ─────────────────────────────────────

it('reasigna presupuestos picking al nuevo vendedor y elimina el usuario', function () {
    $vendor         = createVendor();
    $newVendor      = createVendor();
    $pickingBudget  = PickingBudget::factory()->create(['vendor_id' => $vendor->id]);

    $this->actingAs($this->admin)
        ->delete(route('dashboard.users.destroy', $vendor), ['reassign_to' => $newVendor->id])
        ->assertRedirect()
        ->assertSessionHas('success');

    expect(User::withTrashed()->find($vendor->id)->deleted_at)->not->toBeNull();
    expect($pickingBudget->fresh()->vendor_id)->toBe($newVendor->id);
});

// ─── Reasignación de clientes ─────────────────────────────────────────────────

it('reasigna clientes al nuevo vendedor y elimina el usuario', function () {
    $vendor    = createVendor();
    $newVendor = createVendor();
    $client    = Client::factory()->create(['user_id' => $vendor->id]);

    $this->actingAs($this->admin)
        ->delete(route('dashboard.users.destroy', $vendor), ['reassign_to' => $newVendor->id])
        ->assertRedirect()
        ->assertSessionHas('success');

    expect(User::withTrashed()->find($vendor->id)->deleted_at)->not->toBeNull();
    expect($client->fresh()->user_id)->toBe($newVendor->id);
});

// ─── Reasignación combinada ───────────────────────────────────────────────────

it('reasigna presupuestos merch, picking y clientes en una sola operación', function () {
    $vendor        = createVendor();
    $newVendor     = createVendor();
    $budget        = Budget::factory()->create(['user_id' => $vendor->id]);
    $pickingBudget = PickingBudget::factory()->create(['vendor_id' => $vendor->id]);
    $client        = Client::factory()->create(['user_id' => $vendor->id]);

    $this->actingAs($this->admin)
        ->delete(route('dashboard.users.destroy', $vendor), ['reassign_to' => $newVendor->id])
        ->assertRedirect()
        ->assertSessionHas('success');

    expect(User::withTrashed()->find($vendor->id)->deleted_at)->not->toBeNull();
    expect($budget->fresh()->user_id)->toBe($newVendor->id);
    expect($pickingBudget->fresh()->vendor_id)->toBe($newVendor->id);
    expect($client->fresh()->user_id)->toBe($newVendor->id);
});

it('si la reasignación falla, el usuario no queda eliminado (transacción)', function () {
    $vendor = createVendor();
    Budget::factory()->create(['user_id' => $vendor->id]);

    // Forzar un fallo enviando reassign_to inválido → la transacción no se ejecuta
    $this->actingAs($this->admin)
        ->delete(route('dashboard.users.destroy', $vendor), ['reassign_to' => 99999]);

    expect(User::find($vendor->id))->not->toBeNull();
});

// ─── Index: datos precargados ─────────────────────────────────────────────────

it('el index incluye conteos de presupuestos merch, picking y clientes por usuario', function () {
    $vendor        = createVendor();
    $client        = Client::factory()->create(['user_id' => $vendor->id]);
    // Crear de a uno para evitar que la resolución simultánea de definiciones
    // genere el mismo budget_number (unique constraint) antes de insertar.
    Budget::factory()->create(['user_id' => $vendor->id]);
    Budget::factory()->create(['user_id' => $vendor->id]);
    PickingBudget::factory()->create(['vendor_id' => $vendor->id]);
    PickingBudget::factory()->create(['vendor_id' => $vendor->id]);
    PickingBudget::factory()->create(['vendor_id' => $vendor->id]);

    $this->actingAs($this->admin)
        ->get(route('dashboard.users.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/users/Index')
            ->where('users.data', function ($users) use ($vendor) {
                $found = collect($users)->firstWhere('id', $vendor->id);
                return $found
                    && $found['merch_budget_count']   === 2
                    && $found['picking_budget_count']  === 3
                    && $found['clients_count']         === 1;
            })
        );
});

it('el index incluye availableSellers con vendedores y admins activos', function () {
    $vendor = createVendor();

    $this->actingAs($this->admin)
        ->get(route('dashboard.users.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/users/Index')
            ->where('availableSellers', fn ($sellers) =>
                collect($sellers)->pluck('id')->contains($this->admin->id) &&
                collect($sellers)->pluck('id')->contains($vendor->id)
            )
        );
});

it('availableSellers no incluye usuarios soft-deleted', function () {
    $deletedVendor = createVendor();
    $deletedVendor->delete();

    $this->actingAs($this->admin)
        ->get(route('dashboard.users.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/users/Index')
            ->where('availableSellers', fn ($sellers) =>
                ! collect($sellers)->pluck('id')->contains($deletedVendor->id)
            )
        );
});
