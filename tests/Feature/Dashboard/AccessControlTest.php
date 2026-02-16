<?php

use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed([RoleSeeder::class, PermissionSeeder::class]);
});

// ─── Guests ──────────────────────────────────────────────────────────────────

it('redirige al login a un guest que intenta acceder al dashboard', function () {
    $this->get(route('dashboard.home'))->assertRedirect(route('login'));
});

it('redirige al login a un guest que intenta acceder a clientes', function () {
    $this->get(route('dashboard.clients.index'))->assertRedirect(route('login'));
});

it('redirige al login a un guest que intenta acceder a usuarios', function () {
    $this->get(route('dashboard.users.index'))->assertRedirect(route('login'));
});

// ─── Sin permiso ─────────────────────────────────────────────────────────────

it('devuelve 403 a un usuario sin permiso gestionar_usuarios', function () {
    $vendor = createVendor();

    $this->actingAs($vendor)
        ->get(route('dashboard.users.index'))
        ->assertForbidden();
});

it('devuelve 403 a un usuario sin permiso gestionar_roles', function () {
    $vendor = createVendor();

    $this->actingAs($vendor)
        ->get(route('dashboard.roles.index'))
        ->assertForbidden();
});

it('devuelve 403 a un usuario sin permiso gestionar_clientes', function () {
    $vendor = createVendor();

    $this->actingAs($vendor)
        ->get(route('dashboard.clients.index'))
        ->assertForbidden();
});

// ─── Admin ───────────────────────────────────────────────────────────────────

it('admin puede acceder a la gestión de usuarios', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->get(route('dashboard.users.index'))
        ->assertOk();
});

it('admin puede acceder a la gestión de roles', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->get(route('dashboard.roles.index'))
        ->assertOk();
});

it('admin puede acceder a la gestión de clientes', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->get(route('dashboard.clients.index'))
        ->assertOk();
});

it('admin puede acceder a la gestión de productos', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->get(route('dashboard.products.index'))
        ->assertOk();
});

// ─── Vendedor ─────────────────────────────────────────────────────────────────

it('vendedor puede acceder a la gestión de productos', function () {
    $vendor = createVendor();

    $this->actingAs($vendor)
        ->get(route('dashboard.products.index'))
        ->assertOk();
});

it('vendedor no puede acceder a la gestión de clientes', function () {
    $vendor = createVendor();

    $this->actingAs($vendor)
        ->get(route('dashboard.clients.index'))
        ->assertForbidden();
});

it('vendedor no puede acceder a la gestión de usuarios', function () {
    $vendor = createVendor();

    $this->actingAs($vendor)
        ->get(route('dashboard.users.index'))
        ->assertForbidden();
});

it('vendedor no puede acceder a la gestión de roles', function () {
    $vendor = createVendor();

    $this->actingAs($vendor)
        ->get(route('dashboard.roles.index'))
        ->assertForbidden();
});
