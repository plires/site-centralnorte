<?php

use App\Models\Category;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed([RoleSeeder::class, PermissionSeeder::class]);
});

it('falla si el nombre está vacío al crear', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->post(route('dashboard.categories.store'), [
            'name' => '',
            'show' => true,
        ])
        ->assertSessionHasErrors('name');
});

it('falla si el nombre ya existe al crear', function () {
    $admin = createAdmin();
    Category::factory()->create(['name' => 'Remeras']);

    $this->actingAs($admin)
        ->post(route('dashboard.categories.store'), [
            'name' => 'Remeras',
            'show' => true,
        ])
        ->assertSessionHasErrors('name');
});

it('falla si show no se envía al crear', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->post(route('dashboard.categories.store'), [
            'name' => 'Gorros',
        ])
        ->assertSessionHasErrors('show');
});

it('al actualizar, el nombre único ignora la propia categoría', function () {
    $admin    = createAdmin();
    $category = Category::factory()->create([
        'name'   => 'Gorros',
        'origin' => \App\Models\Category::ORIGIN_LOCAL,
    ]);

    $this->actingAs($admin)
        ->put(route('dashboard.categories.update', $category), [
            'name' => 'Gorros', // mismo nombre → no debe fallar
            'show' => true,
        ])
        ->assertSessionHasNoErrors();
});

it('al actualizar, falla si el nombre pertenece a otra categoría', function () {
    $admin = createAdmin();
    Category::factory()->create(['name' => 'Remeras']);
    $category = Category::factory()->create([
        'name'   => 'Gorros',
        'origin' => \App\Models\Category::ORIGIN_LOCAL,
    ]);

    $this->actingAs($admin)
        ->put(route('dashboard.categories.update', $category), [
            'name' => 'Remeras', // nombre de otra categoría existente
            'show' => true,
        ])
        ->assertSessionHasErrors('name');
});
