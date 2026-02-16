<?php

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed([RoleSeeder::class, PermissionSeeder::class]);
});

// ─── Index ─────────────────────────────────────────────────────────────────────

it('admin puede listar roles', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->get(route('dashboard.roles.index'))
        ->assertOk();
});

// ─── Store ─────────────────────────────────────────────────────────────────────

it('admin puede crear un rol sin permisos', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->post(route('dashboard.roles.store'), [
            'name' => 'supervisor',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('roles', ['name' => 'supervisor']);
});

it('admin puede crear un rol con nombre y queda persistido', function () {
    $admin = createAdmin();
    $perms = Permission::all()->take(2)->pluck('id')->toArray();

    $this->actingAs($admin)
        ->post(route('dashboard.roles.store'), [
            'name'        => 'supervisor',
            'permissions' => $perms,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('roles', ['name' => 'supervisor']);
});

// ─── Update ────────────────────────────────────────────────────────────────────

it('admin puede actualizar el nombre de un rol no-sistema', function () {
    $admin = createAdmin();
    $role  = Role::create(['name' => 'temporal', 'is_system' => false]);

    $this->actingAs($admin)
        ->put(route('dashboard.roles.update', $role), [
            'name' => 'temporal-renombrado',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('roles', [
        'id'   => $role->id,
        'name' => 'temporal-renombrado',
    ]);
});

it('no puede cambiar el nombre de un rol de sistema', function () {
    $admin      = createAdmin();
    $sysRole    = Role::where('name', 'admin')->firstOrFail();
    $nombreOrig = $sysRole->name;

    $this->actingAs($admin)
        ->put(route('dashboard.roles.update', $sysRole), [
            'name'        => 'otro-nombre',
            'permissions' => [],
        ])
        ->assertRedirect()
        ->assertSessionHas('error');

    $this->assertDatabaseHas('roles', [
        'id'   => $sysRole->id,
        'name' => $nombreOrig,
    ]);
});

it('admin puede actualizar los permisos de un rol', function () {
    $admin = createAdmin();
    $role  = Role::create(['name' => 'temporal-2', 'is_system' => false]);
    $perms = Permission::all()->take(3)->pluck('id')->toArray();

    $this->actingAs($admin)
        ->put(route('dashboard.roles.update', $role), [
            'name'        => 'temporal',
            'permissions' => $perms,
        ])
        ->assertRedirect();

    expect($role->fresh()->permissions()->pluck('permissions.id')->sort()->values()->toArray())
        ->toBe(collect($perms)->sort()->values()->toArray());
});

// ─── Destroy ───────────────────────────────────────────────────────────────────

it('admin puede eliminar un rol sin usuarios', function () {
    $admin = createAdmin();
    $role  = Role::create(['name' => 'eliminar-me', 'is_system' => false]);

    $this->actingAs($admin)
        ->delete(route('dashboard.roles.destroy', $role))
        ->assertRedirect();

    $this->assertSoftDeleted('roles', ['id' => $role->id]);
});

it('no puede eliminar un rol de sistema', function () {
    $admin   = createAdmin();
    $sysRole = Role::where('name', 'admin')->firstOrFail();

    $this->actingAs($admin)
        ->delete(route('dashboard.roles.destroy', $sysRole))
        ->assertRedirect()
        ->assertSessionHas('error');

    $this->assertNotSoftDeleted('roles', ['id' => $sysRole->id]);
});

it('no puede eliminar un rol que tiene usuarios asociados', function () {
    $admin = createAdmin();
    $role  = Role::create(['name' => 'con-usuarios', 'is_system' => false]);
    User::factory()->create(['role_id' => $role->id]);

    $this->actingAs($admin)
        ->delete(route('dashboard.roles.destroy', $role))
        ->assertRedirect()
        ->assertSessionHas('error');

    $this->assertNotSoftDeleted('roles', ['id' => $role->id]);
});
