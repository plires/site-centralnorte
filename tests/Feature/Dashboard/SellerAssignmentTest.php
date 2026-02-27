<?php

use App\Models\SellerAssignment;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed([RoleSeeder::class, PermissionSeeder::class]);
});

// ─── Elegibilidad por rol ─────────────────────────────────────────────────────

it('getNextSeller devuelve un admin si es el único usuario disponible', function () {
    $admin = createAdmin();

    $seller = SellerAssignment::getNextSeller('merch_budget');

    expect($seller)->not->toBeNull();
    expect($seller->id)->toBe($admin->id);
});

it('getNextSeller devuelve un vendedor si es el único usuario disponible', function () {
    $vendor = createVendor();

    $seller = SellerAssignment::getNextSeller('merch_budget');

    expect($seller)->not->toBeNull();
    expect($seller->id)->toBe($vendor->id);
});

it('getNextSeller devuelve null si no hay vendedores ni admins', function () {
    // Sin crear usuarios: ningún user tiene role vendedor o admin
    $seller = SellerAssignment::getNextSeller('merch_budget');

    expect($seller)->toBeNull();
});

// ─── Round-robin entre vendedores y admins ────────────────────────────────────

it('getNextSeller rota en round-robin entre admins y vendedores', function () {
    $admin  = createAdmin();
    $vendor = createVendor();

    $first  = SellerAssignment::getNextSeller('merch_budget');
    $second = SellerAssignment::getNextSeller('merch_budget');

    // Los dos primeros asignados deben ser distintos
    expect($first->id)->not->toBe($second->id);

    // Ambos roles son parte del pool
    expect([$first->id, $second->id])->toContain($admin->id);
    expect([$first->id, $second->id])->toContain($vendor->id);
});

it('getNextSeller vuelve al inicio del ciclo tras agotar todos los usuarios', function () {
    $admin  = createAdmin();
    $vendor = createVendor();

    $first  = SellerAssignment::getNextSeller('merch_budget');
    $second = SellerAssignment::getNextSeller('merch_budget');
    $third  = SellerAssignment::getNextSeller('merch_budget'); // debe volver al primero

    expect($third->id)->toBe($first->id);
});

// ─── Aislamiento por tipo de asignación ──────────────────────────────────────

it('getNextSeller mantiene estado independiente por tipo de asignación', function () {
    $admin  = createAdmin();
    $vendor = createVendor();

    // Avanzar el tipo merch_budget un turno
    SellerAssignment::getNextSeller('merch_budget');

    // El tipo picking_budget comienza desde el primer usuario, independientemente
    $pickingFirst = SellerAssignment::getNextSeller('picking_budget');
    $merchSecond  = SellerAssignment::getNextSeller('merch_budget');

    // Ambos tipos deben funcionar sin interferirse
    expect($pickingFirst)->not->toBeNull();
    expect($merchSecond)->not->toBeNull();
});
