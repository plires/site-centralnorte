<?php

use App\Models\Client;
use App\Models\Product;
use App\Models\Category;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed([RoleSeeder::class, PermissionSeeder::class]);
});

// ─── Título ─────────────────────────────────────────────────────────────────

it('falla si el título está vacío al crear', function () {
    $vendor   = createVendor();
    $client   = Client::factory()->create();
    $category = Category::factory()->create();
    $product  = Product::factory()->create();
    $product->categories()->attach($category->id);

    $this->actingAs($vendor)
        ->post(route('dashboard.budgets.store'), [
            'title'       => '',
            'client_id'   => $client->id,
            'issue_date'  => now()->timezone('America/Argentina/Buenos_Aires')->format('Y-m-d'),
            'expiry_date' => now()->addDays(15)->format('Y-m-d'),
            'items'       => [
                ['product_id' => $product->id, 'quantity' => 1, 'unit_price' => 100],
            ],
        ])
        ->assertSessionHasErrors('title');
});

// ─── Cliente ─────────────────────────────────────────────────────────────────

it('falla si no se selecciona cliente al crear', function () {
    $vendor   = createVendor();
    $category = Category::factory()->create();
    $product  = Product::factory()->create();
    $product->categories()->attach($category->id);

    $this->actingAs($vendor)
        ->post(route('dashboard.budgets.store'), [
            'title'       => 'Test',
            'client_id'   => null,
            'issue_date'  => now()->timezone('America/Argentina/Buenos_Aires')->format('Y-m-d'),
            'expiry_date' => now()->addDays(15)->format('Y-m-d'),
            'items'       => [
                ['product_id' => $product->id, 'quantity' => 1, 'unit_price' => 100],
            ],
        ])
        ->assertSessionHasErrors('client_id');
});

it('falla si el cliente no existe en la base de datos', function () {
    $vendor   = createVendor();
    $category = Category::factory()->create();
    $product  = Product::factory()->create();
    $product->categories()->attach($category->id);

    $this->actingAs($vendor)
        ->post(route('dashboard.budgets.store'), [
            'title'       => 'Test',
            'client_id'   => 99999,
            'issue_date'  => now()->timezone('America/Argentina/Buenos_Aires')->format('Y-m-d'),
            'expiry_date' => now()->addDays(15)->format('Y-m-d'),
            'items'       => [
                ['product_id' => $product->id, 'quantity' => 1, 'unit_price' => 100],
            ],
        ])
        ->assertSessionHasErrors('client_id');
});

// ─── Items ─────────────────────────────────────────────────────────────────

it('falla si no se incluye ningún item', function () {
    $vendor = createVendor();
    $client = Client::factory()->create();

    $this->actingAs($vendor)
        ->post(route('dashboard.budgets.store'), [
            'title'       => 'Test',
            'client_id'   => $client->id,
            'issue_date'  => now()->timezone('America/Argentina/Buenos_Aires')->format('Y-m-d'),
            'expiry_date' => now()->addDays(15)->format('Y-m-d'),
            'items'       => [],
        ])
        ->assertSessionHasErrors('items');
});

it('falla si el producto de un item no existe', function () {
    $vendor = createVendor();
    $client = Client::factory()->create();

    $this->actingAs($vendor)
        ->post(route('dashboard.budgets.store'), [
            'title'       => 'Test',
            'client_id'   => $client->id,
            'issue_date'  => now()->timezone('America/Argentina/Buenos_Aires')->format('Y-m-d'),
            'expiry_date' => now()->addDays(15)->format('Y-m-d'),
            'items'       => [
                ['product_id' => 99999, 'quantity' => 1, 'unit_price' => 100],
            ],
        ])
        ->assertSessionHasErrors('items.0.product_id');
});
