<?php

use App\Models\Category;
use App\Models\Product;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed([RoleSeeder::class, PermissionSeeder::class]);
});

// ─── Index ─────────────────────────────────────────────────────────────────────

it('admin puede listar productos', function () {
    $admin    = createAdmin();
    $category = Category::factory()->create();
    $products = Product::factory()->count(3)->create();
    $products->each(fn ($p) => $p->categories()->attach($category->id));

    $this->actingAs($admin)
        ->get(route('dashboard.products.index'))
        ->assertOk();
});

it('vendedor puede listar productos', function () {
    $vendor = createVendor();

    $this->actingAs($vendor)
        ->get(route('dashboard.products.index'))
        ->assertOk();
});

// ─── Store ─────────────────────────────────────────────────────────────────────

it('admin puede crear un producto con categorías', function () {
    $admin    = createAdmin();
    $category = Category::factory()->create();

    $this->actingAs($admin)
        ->post(route('dashboard.products.store'), [
            'sku'          => 'PROD-001',
            'name'         => 'Remera Premium',
            'description'  => 'Descripción del producto',
            'category_ids' => [$category->id],
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('products', [
        'sku'  => 'PROD-001',
        'name' => 'Remera Premium',
    ]);
});

it('admin puede crear un producto con variantes apparel', function () {
    $admin    = createAdmin();
    $category = Category::factory()->create();

    $this->actingAs($admin)
        ->post(route('dashboard.products.store'), [
            'sku'          => 'PROD-APP-001',
            'name'         => 'Remera Apparel',
            'category_ids' => [$category->id],
            'variants'     => [
                [
                    'sku'          => 'PROD-APP-001-S-ROJO',
                    'variant_type' => 'apparel',
                    'size'         => 'S',
                    'color'        => 'Rojo',
                    'stock'        => 10,
                ],
            ],
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('product_variants', [
        'sku'          => 'PROD-APP-001-S-ROJO',
        'variant_type' => 'apparel',
    ]);
});

it('admin puede crear un producto con variantes standard', function () {
    $admin    = createAdmin();
    $category = Category::factory()->create();

    $this->actingAs($admin)
        ->post(route('dashboard.products.store'), [
            'sku'          => 'PROD-STD-001',
            'name'         => 'Taza Standard',
            'category_ids' => [$category->id],
            'variants'     => [
                [
                    'sku'                => 'PROD-STD-001-ROJO',
                    'variant_type'       => 'standard',
                    'primary_color_text' => 'Rojo',
                    'stock'              => 5,
                ],
            ],
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('product_variants', [
        'sku'          => 'PROD-STD-001-ROJO',
        'variant_type' => 'standard',
    ]);
});

// ─── Update ────────────────────────────────────────────────────────────────────

it('admin puede actualizar un producto local', function () {
    $admin    = createAdmin();
    $category = Category::factory()->create();
    $product  = Product::factory()->create(['name' => 'Nombre Viejo']);
    $product->categories()->attach($category->id);

    $this->actingAs($admin)
        ->put(route('dashboard.products.update', $product), [
            'sku'          => $product->sku,
            'name'         => 'Nombre Nuevo',
            'description'  => null,
            'proveedor'    => null,
            'category_ids' => [$category->id],
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $this->assertDatabaseHas('products', [
        'id'   => $product->id,
        'name' => 'Nombre Nuevo',
    ]);
});

it('no puede editar un producto externo', function () {
    $admin    = createAdmin();
    $category = Category::factory()->create();
    $product  = Product::factory()->create([
        'name'   => 'Nombre Original',
        'origin' => \App\Models\Product::ORIGIN_ZECAT,
    ]);

    $this->actingAs($admin)
        ->put(route('dashboard.products.update', $product), [
            'sku'          => $product->sku,
            'name'         => 'Intento editar',
            'category_ids' => [$category->id],
        ])
        ->assertRedirect()
        ->assertSessionHas('error');

    $this->assertDatabaseHas('products', [
        'id'   => $product->id,
        'name' => 'Nombre Original',
    ]);
});

// ─── Destroy ───────────────────────────────────────────────────────────────────

it('admin puede eliminar un producto (soft delete)', function () {
    $admin    = createAdmin();
    $category = Category::factory()->create();
    $product  = Product::factory()->create();
    $product->categories()->attach($category->id);

    $this->actingAs($admin)
        ->delete(route('dashboard.products.destroy', $product))
        ->assertRedirect();

    $this->assertSoftDeleted('products', ['id' => $product->id]);
});
