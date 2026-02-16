<?php

use App\Models\Category;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed([RoleSeeder::class, PermissionSeeder::class]);
});

// ─── Index ─────────────────────────────────────────────────────────────────────

it('admin puede listar categorías', function () {
    $admin = createAdmin();
    Category::factory()->count(3)->create();

    $this->actingAs($admin)
        ->get(route('dashboard.categories.index'))
        ->assertOk();
});

// ─── Store ─────────────────────────────────────────────────────────────────────

it('admin puede crear una categoría', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->post(route('dashboard.categories.store'), [
            'name'        => 'Remeras',
            'description' => 'Categoría de remeras',
            'show'        => true,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('categories', ['name' => 'Remeras']);
});

// ─── Update ────────────────────────────────────────────────────────────────────

it('admin puede actualizar una categoría local', function () {
    $admin    = createAdmin();
    $category = Category::factory()->create([
        'name'   => 'Nombre Viejo',
        'origin' => \App\Models\Category::ORIGIN_LOCAL,
    ]);

    $this->actingAs($admin)
        ->put(route('dashboard.categories.update', $category), [
            'name' => 'Nombre Nuevo',
            'show' => true,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('categories', [
        'id'   => $category->id,
        'name' => 'Nombre Nuevo',
    ]);
});

it('no puede editar una categoría externa', function () {
    $admin    = createAdmin();
    $category = Category::factory()->create([
        'name'   => 'Categoria Zecat',
        'origin' => \App\Models\Category::ORIGIN_ZECAT,
    ]);

    $this->actingAs($admin)
        ->put(route('dashboard.categories.update', $category), [
            'name' => 'Intento editar',
            'show' => true,
        ])
        ->assertRedirect()
        ->assertSessionHas('error');

    // El nombre no cambió
    $this->assertDatabaseHas('categories', [
        'id'   => $category->id,
        'name' => 'Categoria Zecat',
    ]);
});

// ─── Destroy ───────────────────────────────────────────────────────────────────

it('admin puede eliminar una categoría (soft delete)', function () {
    $admin    = createAdmin();
    $category = Category::factory()->create();

    $this->actingAs($admin)
        ->delete(route('dashboard.categories.destroy', $category))
        ->assertRedirect();

    $this->assertSoftDeleted('categories', ['id' => $category->id]);
});
