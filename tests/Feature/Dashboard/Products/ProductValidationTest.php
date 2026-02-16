<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed([RoleSeeder::class, PermissionSeeder::class]);
});

// ─── SKU ───────────────────────────────────────────────────────────────────────

it('falla si el sku está vacío al crear', function () {
    $admin    = createAdmin();
    $category = Category::factory()->create();

    $this->actingAs($admin)
        ->post(route('dashboard.products.store'), [
            'sku'          => '',
            'name'         => 'Producto Test',
            'category_ids' => [$category->id],
        ])
        ->assertSessionHasErrors('sku');
});

it('falla si el sku ya existe al crear', function () {
    $admin    = createAdmin();
    $category = Category::factory()->create();
    Product::factory()->create(['sku' => 'SKU-EXISTENTE']);

    $this->actingAs($admin)
        ->post(route('dashboard.products.store'), [
            'sku'          => 'SKU-EXISTENTE',
            'name'         => 'Otro Producto',
            'category_ids' => [$category->id],
        ])
        ->assertSessionHasErrors('sku');
});

it('al actualizar, el sku único ignora el propio producto', function () {
    $admin    = createAdmin();
    $category = Category::factory()->create();
    $product  = Product::factory()->create(['sku' => 'MI-SKU-UNICO']);
    $product->categories()->attach($category->id);

    $this->actingAs($admin)
        ->put(route('dashboard.products.update', $product), [
            'sku'          => 'MI-SKU-UNICO', // mismo sku → no debe fallar
            'name'         => $product->name,
            'category_ids' => [$category->id],
        ])
        ->assertSessionHasNoErrors();
});

// ─── Nombre y categoría ────────────────────────────────────────────────────────

it('falla si el nombre está vacío al crear', function () {
    $admin    = createAdmin();
    $category = Category::factory()->create();

    $this->actingAs($admin)
        ->post(route('dashboard.products.store'), [
            'sku'          => 'SKU-TEST',
            'name'         => '',
            'category_ids' => [$category->id],
        ])
        ->assertSessionHasErrors('name');
});

it('falla si no se selecciona ninguna categoría', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->post(route('dashboard.products.store'), [
            'sku'          => 'SKU-TEST',
            'name'         => 'Producto sin categoría',
            'category_ids' => [],
        ])
        ->assertSessionHasErrors('category_ids');
});

// ─── Variantes ─────────────────────────────────────────────────────────────────

it('falla si se mezclan variantes apparel y standard', function () {
    $admin    = createAdmin();
    $category = Category::factory()->create();

    $this->actingAs($admin)
        ->post(route('dashboard.products.store'), [
            'sku'          => 'SKU-MIX',
            'name'         => 'Producto Mixto',
            'category_ids' => [$category->id],
            'variants'     => [
                ['sku' => 'VAR-APP', 'variant_type' => 'apparel',  'stock' => 1],
                ['sku' => 'VAR-STD', 'variant_type' => 'standard', 'stock' => 1],
            ],
        ])
        ->assertSessionHasErrors('variants');
});

it('falla si el sku de una variante ya existe en la base de datos', function () {
    $admin    = createAdmin();
    $category = Category::factory()->create();
    $existing = Product::factory()->create();
    ProductVariant::factory()->create(['product_id' => $existing->id, 'sku' => 'VAR-EXISTENTE']);

    $this->actingAs($admin)
        ->post(route('dashboard.products.store'), [
            'sku'          => 'NUEVO-PROD',
            'name'         => 'Nuevo Producto',
            'category_ids' => [$category->id],
            'variants'     => [
                ['sku' => 'VAR-EXISTENTE', 'variant_type' => 'standard', 'stock' => 1],
            ],
        ])
        ->assertSessionHasErrors('variants.0.sku');
});

it('falla si hay skus de variante duplicados en el mismo request', function () {
    $admin    = createAdmin();
    $category = Category::factory()->create();

    $this->actingAs($admin)
        ->post(route('dashboard.products.store'), [
            'sku'          => 'PROD-DISTINCT',
            'name'         => 'Producto Distinct',
            'category_ids' => [$category->id],
            'variants'     => [
                ['sku' => 'MISMO-SKU', 'variant_type' => 'apparel', 'stock' => 1],
                ['sku' => 'MISMO-SKU', 'variant_type' => 'apparel', 'stock' => 2],
            ],
        ])
        ->assertSessionHasErrors('variants.0.sku');
});
