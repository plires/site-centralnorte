<?php

use App\Models\Product;
use App\Models\Category;
use App\Models\ProductImage;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->seed([RoleSeeder::class, PermissionSeeder::class]);
    Storage::fake('public');
});

// ─── Upload de imagen ─────────────────────────────────────────────────────────

it('admin puede subir una imagen a un producto', function () {
    $admin    = createAdmin();
    $category = Category::factory()->create();
    $product  = Product::factory()->create();
    $product->categories()->attach($category->id);

    $this->actingAs($admin)
        ->post(route('dashboard.products.images.store', $product), [
            'image' => UploadedFile::fake()->image('foto.jpg', 400, 400),
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('product_images', ['product_id' => $product->id]);
});

it('la primera imagen subida se marca como featured automáticamente', function () {
    $admin    = createAdmin();
    $category = Category::factory()->create();
    $product  = Product::factory()->create();
    $product->categories()->attach($category->id);

    $this->actingAs($admin)
        ->post(route('dashboard.products.images.store', $product), [
            'image' => UploadedFile::fake()->image('primera.jpg', 400, 400),
        ])
        ->assertRedirect();

    $image = ProductImage::where('product_id', $product->id)->first();
    expect($image)->not->toBeNull();
    // is_featured no tiene cast boolean en el modelo, MySQL devuelve 1/0
    expect($image->is_featured)->toBeTruthy();
});

it('la segunda imagen subida NO se marca como featured', function () {
    $admin    = createAdmin();
    $category = Category::factory()->create();
    $product  = Product::factory()->create();
    $product->categories()->attach($category->id);

    // Primera imagen
    $this->actingAs($admin)
        ->post(route('dashboard.products.images.store', $product), [
            'image' => UploadedFile::fake()->image('primera.jpg', 400, 400),
        ]);

    // Segunda imagen
    $this->actingAs($admin)
        ->post(route('dashboard.products.images.store', $product), [
            'image' => UploadedFile::fake()->image('segunda.jpg', 400, 400),
        ]);

    $images = ProductImage::where('product_id', $product->id)->get();
    expect($images)->toHaveCount(2);

    $featuredCount = $images->filter(fn ($img) => (bool) $img->is_featured)->count();
    expect($featuredCount)->toBe(1); // Solo una puede ser featured
});

// ─── setFeatured ─────────────────────────────────────────────────────────────

it('setFeatured marca la imagen seleccionada como featured y quita las demás', function () {
    $admin   = createAdmin();
    $product = Product::factory()->create();

    $imageA = ProductImage::factory()->create(['product_id' => $product->id, 'is_featured' => true]);
    $imageB = ProductImage::factory()->create(['product_id' => $product->id, 'is_featured' => false]);

    $this->actingAs($admin)
        ->patch(route('dashboard.products.images.set-featured', [$product, $imageB]))
        ->assertRedirect();

    expect($imageA->fresh()->is_featured)->toBeFalsy();
    expect($imageB->fresh()->is_featured)->toBeTruthy();
});

// ─── Destroy con lógica de featured ──────────────────────────────────────────

it('al borrar una imagen no-featured, la featured no cambia', function () {
    $admin   = createAdmin();
    $product = Product::factory()->create();

    $featured  = ProductImage::factory()->create(['product_id' => $product->id, 'is_featured' => true]);
    $secondary = ProductImage::factory()->create(['product_id' => $product->id, 'is_featured' => false]);

    $this->actingAs($admin)
        ->delete(route('dashboard.products.images.destroy', [$product, $secondary]))
        ->assertRedirect();

    expect($featured->fresh()->is_featured)->toBeTruthy();
    $this->assertSoftDeleted('product_images', ['id' => $secondary->id]);
});

it('al borrar la imagen featured, se promueve automáticamente la siguiente', function () {
    $admin   = createAdmin();
    $product = Product::factory()->create();

    $featured  = ProductImage::factory()->create(['product_id' => $product->id, 'is_featured' => true]);
    $secondary = ProductImage::factory()->create(['product_id' => $product->id, 'is_featured' => false]);

    $this->actingAs($admin)
        ->delete(route('dashboard.products.images.destroy', [$product, $featured]))
        ->assertRedirect();

    expect($secondary->fresh()->is_featured)->toBeTruthy();
    $this->assertSoftDeleted('product_images', ['id' => $featured->id]);
});

// ─── Ownership validation ─────────────────────────────────────────────────────

it('no puede borrar una imagen que pertenece a otro producto', function () {
    $admin    = createAdmin();
    $product1 = Product::factory()->create();
    $product2 = Product::factory()->create();

    $imageOfProduct2 = ProductImage::factory()->create(['product_id' => $product2->id]);

    // Intentar borrar imagen del product2 usando la ruta del product1
    $this->actingAs($admin)
        ->delete(route('dashboard.products.images.destroy', [$product1, $imageOfProduct2]))
        ->assertRedirect()
        ->assertSessionHas('error');

    // La imagen no debe haber sido borrada
    $this->assertNotSoftDeleted('product_images', ['id' => $imageOfProduct2->id]);
});

it('no puede setFeatured en una imagen que pertenece a otro producto', function () {
    $admin    = createAdmin();
    $product1 = Product::factory()->create();
    $product2 = Product::factory()->create();

    $imageOfProduct2 = ProductImage::factory()->create(['product_id' => $product2->id]);

    $this->actingAs($admin)
        ->patch(route('dashboard.products.images.set-featured', [$product1, $imageOfProduct2]))
        ->assertRedirect()
        ->assertSessionHas('error');
});
