<?php

use App\Models\Slide;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->seed([RoleSeeder::class, PermissionSeeder::class]);
    Storage::fake('public');
});

// ─── Index ─────────────────────────────────────────────────────────────────────

it('admin puede listar slides', function () {
    $admin = createAdmin();
    Slide::factory()->count(3)->create(['title' => 'Slide Test']);

    $this->actingAs($admin)
        ->get(route('dashboard.slides.index'))
        ->assertOk();
});

// ─── Store ─────────────────────────────────────────────────────────────────────

it('admin puede crear un slide con imágenes', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->post(route('dashboard.slides.store'), [
            'title'         => 'Slide de prueba',
            'image_desktop' => UploadedFile::fake()->image('desktop.jpg', 1920, 850),
            'image_mobile'  => UploadedFile::fake()->image('mobile.jpg', 580, 630),
            'link'          => 'https://ejemplo.com',
            'is_active'     => false,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('slides', ['title' => 'Slide de prueba']);
});

it('nuevo slide se crea con is_active = false por defecto', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->post(route('dashboard.slides.store'), [
            'title'         => 'Slide inactivo',
            'image_desktop' => UploadedFile::fake()->image('desktop.jpg', 1920, 850),
            'image_mobile'  => UploadedFile::fake()->image('mobile.jpg', 580, 630),
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('slides', [
        'title'     => 'Slide inactivo',
        'is_active' => false,
    ]);
});

it('el sort_order se asigna automáticamente al crear', function () {
    $admin = createAdmin();

    // Crear slide con sort_order 5
    Slide::factory()->create(['sort_order' => 5, 'title' => 'Slide Base']);

    $this->actingAs($admin)
        ->post(route('dashboard.slides.store'), [
            'title'         => 'Segundo slide',
            'image_desktop' => UploadedFile::fake()->image('desktop.jpg', 1920, 850),
            'image_mobile'  => UploadedFile::fake()->image('mobile.jpg', 580, 630),
        ])
        ->assertRedirect();

    $slide = Slide::where('title', 'Segundo slide')->firstOrFail();
    expect($slide->sort_order)->toBe(6); // max(5) + 1
});

it('falla la creación si falta el título', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->post(route('dashboard.slides.store'), [
            'title'         => '',
            'image_desktop' => UploadedFile::fake()->image('desktop.jpg', 1920, 850),
            'image_mobile'  => UploadedFile::fake()->image('mobile.jpg', 580, 630),
        ])
        ->assertSessionHasErrors('title');
});

it('falla la creación si falta la imagen desktop', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->post(route('dashboard.slides.store'), [
            'title'        => 'Sin desktop',
            'image_mobile' => UploadedFile::fake()->image('mobile.jpg', 580, 630),
        ])
        ->assertSessionHasErrors('image_desktop');
});

// ─── Destroy ───────────────────────────────────────────────────────────────────

it('admin puede eliminar un slide (delete real, no soft)', function () {
    $admin = createAdmin();
    // El factory usa URLs externas (placeholders), no se intenta borrar archivos locales
    $slide = Slide::factory()->create(['title' => 'Slide a eliminar']);

    $this->actingAs($admin)
        ->delete(route('dashboard.slides.destroy', $slide))
        ->assertRedirect();

    $this->assertDatabaseMissing('slides', ['id' => $slide->id]);
});

// ─── updateOrder ───────────────────────────────────────────────────────────────

it('admin puede reordenar slides con updateOrder', function () {
    $admin  = createAdmin();
    $slide1 = Slide::factory()->create(['sort_order' => 1, 'title' => 'Slide 1']);
    $slide2 = Slide::factory()->create(['sort_order' => 2, 'title' => 'Slide 2']);

    $this->actingAs($admin)
        ->post(route('dashboard.slides.update-order'), [
            'slides' => [
                ['id' => $slide1->id, 'sort_order' => 10],
                ['id' => $slide2->id, 'sort_order' => 20],
            ],
        ])
        ->assertRedirect(); // updateOrder devuelve redirect()->back()

    $this->assertDatabaseHas('slides', ['id' => $slide1->id, 'sort_order' => 10]);
    $this->assertDatabaseHas('slides', ['id' => $slide2->id, 'sort_order' => 20]);
});
