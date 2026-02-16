<?php

use App\Enums\BudgetStatus;
use App\Models\Budget;
use App\Models\Client;
use App\Models\Product;
use App\Models\Category;
use App\Mail\BudgetCreatedMail;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Support\Facades\Mail;

beforeEach(function () {
    $this->seed([RoleSeeder::class, PermissionSeeder::class]);
});

// ─── Helpers locales ────────────────────────────────────────────────────────

/**
 * Crea un payload mínimo válido para crear un presupuesto.
 */
function budgetPayload(int $clientId, int $productId, ?int $userId = null): array
{
    $payload = [
        'title'      => 'Presupuesto de prueba',
        'client_id'  => $clientId,
        'issue_date'  => now()->timezone('America/Argentina/Buenos_Aires')->format('Y-m-d'),
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
        'items' => [
            [
                'product_id'  => $productId,
                'quantity'    => 2,
                'unit_price'  => 1000,
            ],
        ],
    ];

    if ($userId !== null) {
        $payload['user_id'] = $userId;
    }

    return $payload;
}

// ─── Index ─────────────────────────────────────────────────────────────────────

it('admin ve todos los presupuestos', function () {
    $admin  = createAdmin();
    $vendor = createVendor();
    Budget::factory()->count(2)->create(['user_id' => $vendor->id]);
    Budget::factory()->count(1)->create(['user_id' => $admin->id]);

    $this->actingAs($admin)
        ->get(route('dashboard.budgets.index'))
        ->assertOk();
});

it('vendedor solo ve sus propios presupuestos en el index', function () {
    $admin  = createAdmin();
    $vendor = createVendor();

    // 2 presupuestos del vendor, 1 del admin
    Budget::factory()->count(2)->create(['user_id' => $vendor->id]);
    Budget::factory()->count(1)->create(['user_id' => $admin->id]);

    $response = $this->actingAs($vendor)
        ->get(route('dashboard.budgets.index'))
        ->assertOk();
});

// ─── Store ─────────────────────────────────────────────────────────────────────

it('vendedor puede crear un presupuesto → estado unsent', function () {
    $vendor   = createVendor();
    $client   = Client::factory()->create();
    $category = Category::factory()->create();
    $product  = Product::factory()->create();
    $product->categories()->attach($category->id);

    $this->actingAs($vendor)
        ->post(route('dashboard.budgets.store'), budgetPayload($client->id, $product->id))
        ->assertRedirect();

    $this->assertDatabaseHas('budgets', [
        'title'   => 'Presupuesto de prueba',
        'user_id' => $vendor->id,
        'status'  => BudgetStatus::UNSENT->value,
    ]);
});

it('crear con send_email_to_client → estado sent y email en cola', function () {
    Mail::fake();

    $vendor   = createVendor();
    $client   = Client::factory()->create(['email' => 'cliente@test.com']);
    $category = Category::factory()->create();
    $product  = Product::factory()->create();
    $product->categories()->attach($category->id);

    $payload                         = budgetPayload($client->id, $product->id);
    $payload['send_email_to_client'] = true;

    $this->actingAs($vendor)
        ->post(route('dashboard.budgets.store'), $payload)
        ->assertRedirect();

    $this->assertDatabaseHas('budgets', [
        'title'  => 'Presupuesto de prueba',
        'status' => BudgetStatus::SENT->value,
    ]);

    Mail::assertSent(BudgetCreatedMail::class);
});

// ─── Update ────────────────────────────────────────────────────────────────────

it('puede editar un presupuesto en estado unsent', function () {
    $vendor  = createVendor();
    $client  = Client::factory()->create();
    $budget  = Budget::factory()->unsent()->create(['user_id' => $vendor->id, 'client_id' => $client->id]);
    $category = Category::factory()->create();
    $product  = Product::factory()->create();
    $product->categories()->attach($category->id);

    $payload          = budgetPayload($client->id, $product->id);
    $payload['title'] = 'Título Actualizado';

    $this->actingAs($vendor)
        ->put(route('dashboard.budgets.update', $budget), $payload)
        ->assertRedirect();

    $this->assertDatabaseHas('budgets', [
        'id'    => $budget->id,
        'title' => 'Título Actualizado',
    ]);
});

it('NO puede editar un presupuesto en estado sent', function () {
    $vendor  = createVendor();
    $client  = Client::factory()->create();
    $budget  = Budget::factory()->sent()->create(['user_id' => $vendor->id, 'client_id' => $client->id]);
    $category = Category::factory()->create();
    $product  = Product::factory()->create();
    $product->categories()->attach($category->id);

    $payload          = budgetPayload($client->id, $product->id);
    $payload['title'] = 'Intento editar';

    $this->actingAs($vendor)
        ->put(route('dashboard.budgets.update', $budget), $payload)
        ->assertRedirect()
        ->assertSessionHas('error');

    $this->assertDatabaseMissing('budgets', [
        'id'    => $budget->id,
        'title' => 'Intento editar',
    ]);
});

// ─── Duplicate ─────────────────────────────────────────────────────────────────

it('puede clonar un presupuesto → nuevo presupuesto en estado draft', function () {
    $admin  = createAdmin();
    $budget = Budget::factory()->unsent()->create(['user_id' => $admin->id]);

    $this->actingAs($admin)
        ->get(route('dashboard.budgets.duplicate', $budget))
        ->assertRedirect();

    $this->assertDatabaseHas('budgets', [
        'status' => BudgetStatus::DRAFT->value,
    ]);
});

// ─── Destroy ───────────────────────────────────────────────────────────────────

it('admin puede soft-deletear un presupuesto', function () {
    $admin  = createAdmin();
    $budget = Budget::factory()->unsent()->create(['user_id' => $admin->id]);

    $this->actingAs($admin)
        ->delete(route('dashboard.budgets.destroy', $budget))
        ->assertRedirect();

    $this->assertSoftDeleted('budgets', ['id' => $budget->id]);
});
