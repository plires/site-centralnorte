<?php

use App\Models\Slide;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed([RoleSeeder::class, PermissionSeeder::class]);
});

// ─── Límite de slides activos ─────────────────────────────────────────────────

it('canActivateMore devuelve true si hay menos de MAX_ACTIVE_SLIDES activos', function () {
    // Sin slides activos
    Slide::factory()->count(2)->inactive()->create(['title' => 'Slide Test']);

    expect(Slide::canActivateMore())->toBeTrue();
});

it('canActivateMore devuelve false al llegar al límite', function () {
    Slide::factory()->count(Slide::MAX_ACTIVE_SLIDES)->active()->create(['title' => 'Slide Test']);

    expect(Slide::canActivateMore())->toBeFalse();
});

it('activeCount refleja correctamente la cantidad de activos', function () {
    Slide::factory()->count(3)->active()->create(['title' => 'Slide Activo']);
    Slide::factory()->count(2)->inactive()->create(['title' => 'Slide Inactivo']);

    expect(Slide::activeCount())->toBe(3);
});

it('getNextSortOrder retorna max + 1', function () {
    Slide::factory()->create(['sort_order' => 7]);
    Slide::factory()->create(['sort_order' => 3]);

    expect(Slide::getNextSortOrder())->toBe(8);
});

it('getNextSortOrder retorna 1 si no hay slides', function () {
    expect(Slide::getNextSortOrder())->toBe(1);
});

// ─── Scope active() y ordered() ──────────────────────────────────────────────

it('scope active() filtra solo slides activos', function () {
    Slide::factory()->count(3)->active()->create(['title' => 'Slide Activo X']);
    Slide::factory()->count(2)->inactive()->create(['title' => 'Slide Inact X']);

    $activos = Slide::active()->get();
    expect($activos)->toHaveCount(3);
    expect($activos->every(fn ($s) => $s->is_active))->toBeTrue();
});

it('scope ordered() ordena por sort_order ascendente por defecto', function () {
    Slide::factory()->create(['sort_order' => 5, 'title' => 'Tercero']);
    Slide::factory()->create(['sort_order' => 1, 'title' => 'Primero']);
    Slide::factory()->create(['sort_order' => 3, 'title' => 'Segundo']);

    $slides = Slide::ordered()->get();
    expect($slides->first()->title)->toBe('Primero');
    expect($slides->last()->title)->toBe('Tercero');
});
