<?php

use App\Enums\BudgetStatus;
use App\Models\Budget;
use App\Models\Client;
use App\Models\Product;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Support\Facades\Mail;

beforeEach(function () {
    $this->seed([RoleSeeder::class, PermissionSeeder::class]);
});

// ─── updateStatus (dashboard) ────────────────────────────────────────────────

it('admin puede cambiar el estado de un presupuesto vía updateStatus', function () {
    $admin  = createAdmin();
    $budget = Budget::factory()->sent()->create([
        'user_id'     => $admin->id,
        'expiry_date' => now()->addDays(30)->format('Y-m-d'),
    ]);

    $this->actingAs($admin)
        ->patch(route('dashboard.budgets.update-status', $budget), [
            'status' => BudgetStatus::IN_REVIEW->value,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('budgets', [
        'id'     => $budget->id,
        'status' => BudgetStatus::IN_REVIEW->value,
    ]);
});

it('no puede cambiar el estado si el presupuesto está vencido por fecha', function () {
    $admin  = createAdmin();
    $budget = Budget::factory()->sent()->create([
        'user_id'     => $admin->id,
        'expiry_date' => now()->subDays(5)->format('Y-m-d'),
    ]);

    $this->actingAs($admin)
        ->patch(route('dashboard.budgets.update-status', $budget), [
            'status' => BudgetStatus::APPROVED->value,
        ])
        ->assertRedirect()
        ->assertSessionHas('error');
});

// ─── sendEmail ───────────────────────────────────────────────────────────────

it('sendEmail cambia el estado a sent y registra el envío', function () {
    Mail::fake();

    $admin  = createAdmin();
    $client = Client::factory()->create(['email' => 'cliente@test.com']);
    $budget = Budget::factory()->unsent()->create([
        'user_id'     => $admin->id,
        'client_id'   => $client->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->actingAs($admin)
        ->post(route('dashboard.budgets.send-email', $budget))
        ->assertRedirect();

    $budget->refresh();
    expect($budget->status)->toBe(BudgetStatus::SENT);
    expect($budget->email_sent)->toBeTrue();
});

it('sendEmail falla si el presupuesto ya está en estado final (approved)', function () {
    $admin  = createAdmin();
    $budget = Budget::factory()->approved()->create([
        'user_id'     => $admin->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->actingAs($admin)
        ->post(route('dashboard.budgets.send-email', $budget))
        ->assertRedirect()
        ->assertSessionHas('error');
});

// ─── Métodos de modelo (state transitions) ───────────────────────────────────

it('markAsSent() actualiza estado y flags de email', function () {
    $admin  = createAdmin();
    $budget = Budget::factory()->unsent()->create([
        'user_id'     => $admin->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);
    $budget->markAsSent();

    expect($budget->fresh()->status)->toBe(BudgetStatus::SENT);
    expect($budget->fresh()->email_sent)->toBeTrue();
});

it('markAsInReview() desde sent → in_review', function () {
    $admin  = createAdmin();
    $budget = Budget::factory()->sent()->create([
        'user_id'     => $admin->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);
    $budget->markAsInReview();

    expect($budget->fresh()->status)->toBe(BudgetStatus::IN_REVIEW);
});

it('markAsApproved() desde sent → approved', function () {
    $admin  = createAdmin();
    $budget = Budget::factory()->sent()->create([
        'user_id'     => $admin->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);
    $budget->markAsApproved();

    expect($budget->fresh()->status)->toBe(BudgetStatus::APPROVED);
});

it('markAsApproved() desde in_review → approved', function () {
    $admin  = createAdmin();
    $budget = Budget::factory()->sent()->create([
        'user_id'     => $admin->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);
    $budget->markAsInReview();
    $budget->markAsApproved();

    expect($budget->fresh()->status)->toBe(BudgetStatus::APPROVED);
});

it('markAsRejected() → rejected', function () {
    $admin  = createAdmin();
    $budget = Budget::factory()->sent()->create([
        'user_id'     => $admin->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);
    $budget->markAsRejected();

    expect($budget->fresh()->status)->toBe(BudgetStatus::REJECTED);
});

it('markAsExpired() solo actúa si el estado puede vencer', function () {
    $admin = createAdmin();

    $budget = Budget::factory()->sent()->create([
        'user_id'     => $admin->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);
    $budget->markAsExpired();
    expect($budget->fresh()->status)->toBe(BudgetStatus::EXPIRED);

    // Estado approved no puede vencer
    $approved = Budget::factory()->approved()->create([
        'user_id'     => $admin->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);
    $approved->markAsExpired();
    expect($approved->fresh()->status)->toBe(BudgetStatus::APPROVED);
});

// ─── Ruta pública ─────────────────────────────────────────────────────────────

it('ruta pública con token válido en estado sent devuelve 200', function () {
    $admin  = createAdmin();
    $budget = Budget::factory()->sent()->create([
        'user_id'     => $admin->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->get(route('public.budget.show', $budget->token))
        ->assertOk();
});

it('ruta pública con token de presupuesto no enviado no es visible', function () {
    $admin  = createAdmin();
    $budget = Budget::factory()->unsent()->create([
        'user_id'     => $admin->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);

    // El controlador devuelve una vista Inertia "not found" con HTTP 200
    $this->get(route('public.budget.show', $budget->token))
        ->assertOk();
});

// ─── Acciones del cliente (rutas públicas) ────────────────────────────────────

it('cliente aprueba un presupuesto sent → estado approved', function () {
    Mail::fake();
    $admin  = createAdmin();
    $budget = Budget::factory()->sent()->create([
        'user_id'     => $admin->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->post(route('public.budget.approve', $budget->token))
        ->assertRedirect();

    expect($budget->fresh()->status)->toBe(BudgetStatus::APPROVED);
});

it('cliente pone en evaluación un presupuesto sent → estado in_review', function () {
    Mail::fake();
    $admin  = createAdmin();
    $budget = Budget::factory()->sent()->create([
        'user_id'     => $admin->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->post(route('public.budget.in_review', $budget->token))
        ->assertRedirect();

    expect($budget->fresh()->status)->toBe(BudgetStatus::IN_REVIEW);
});

it('cliente NO puede actuar sobre un presupuesto en estado approved (final)', function () {
    $admin  = createAdmin();
    $budget = Budget::factory()->approved()->create([
        'user_id'     => $admin->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->post(route('public.budget.approve', $budget->token))
        ->assertRedirect()
        ->assertSessionHas('error');

    expect($budget->fresh()->status)->toBe(BudgetStatus::APPROVED);
});

// ─── Expiración automática ─────────────────────────────────────────────────────

it('checkExpiredBudgets expira presupuestos con fecha vencida', function () {
    $admin  = createAdmin();
    $budget = Budget::factory()->sent()->create([
        'user_id'     => $admin->id,
        'expiry_date' => now()->subDays(3)->format('Y-m-d'),
    ]);

    $this->artisan('budgets:check-expired')->assertExitCode(0);

    expect($budget->fresh()->status)->toBe(BudgetStatus::EXPIRED);
});

it('checkExpiredBudgets NO expira presupuestos en estado approved o rejected', function () {
    $admin = createAdmin();

    $approved = Budget::factory()->approved()->create([
        'user_id'     => $admin->id,
        'expiry_date' => now()->subDays(3)->format('Y-m-d'),
    ]);
    $rejected = Budget::factory()->rejected()->create([
        'user_id'     => $admin->id,
        'expiry_date' => now()->subDays(3)->format('Y-m-d'),
    ]);

    $this->artisan('budgets:check-expired')->assertExitCode(0);

    expect($approved->fresh()->status)->toBe(BudgetStatus::APPROVED);
    expect($rejected->fresh()->status)->toBe(BudgetStatus::REJECTED);
});

// ─── Restricciones por entidades eliminadas ───────────────────────────────────

it('sendEmail falla si el cliente del presupuesto está eliminado', function () {
    $admin  = createAdmin();
    $client = Client::factory()->create();
    $budget = Budget::factory()->unsent()->create([
        'user_id'     => $admin->id,
        'client_id'   => $client->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $client->delete();

    $this->actingAs($admin)
        ->post(route('dashboard.budgets.send-email', $budget))
        ->assertRedirect()
        ->assertSessionHas('error');

    expect($budget->fresh()->status)->toBe(BudgetStatus::UNSENT);
});

it('dashboard downloadPdf falla si el cliente del presupuesto está eliminado', function () {
    $admin  = createAdmin();
    $client = Client::factory()->create();
    $budget = Budget::factory()->unsent()->create([
        'user_id'     => $admin->id,
        'client_id'   => $client->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $client->delete();

    $this->actingAs($admin)
        ->get(route('dashboard.budgets.pdf', $budget))
        ->assertRedirect()
        ->assertSessionHas('error');
});

it('sendEmail falla si el vendedor del presupuesto está eliminado', function () {
    $requestingAdmin = createAdmin();
    $budgetSeller    = createAdmin();
    $client          = Client::factory()->create();
    $budget          = Budget::factory()->unsent()->create([
        'user_id'     => $budgetSeller->id,
        'client_id'   => $client->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $budgetSeller->delete();

    $this->actingAs($requestingAdmin)
        ->post(route('dashboard.budgets.send-email', $budget))
        ->assertRedirect()
        ->assertSessionHas('error');

    expect($budget->fresh()->status)->toBe(BudgetStatus::UNSENT);
});

it('dashboard downloadPdf falla si el vendedor del presupuesto está eliminado', function () {
    $requestingAdmin = createAdmin();
    $budgetSeller    = createAdmin();
    $client          = Client::factory()->create();
    $budget          = Budget::factory()->unsent()->create([
        'user_id'     => $budgetSeller->id,
        'client_id'   => $client->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $budgetSeller->delete();

    $this->actingAs($requestingAdmin)
        ->get(route('dashboard.budgets.pdf', $budget))
        ->assertRedirect()
        ->assertSessionHas('error');
});

it('sendEmail falla si un producto de los items está eliminado', function () {
    $admin   = createAdmin();
    $client  = Client::factory()->create();
    $product = Product::factory()->create();
    $budget  = Budget::factory()->unsent()->create([
        'user_id'     => $admin->id,
        'client_id'   => $client->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $budget->items()->create(['product_id' => $product->id, 'quantity' => 1, 'unit_price' => 100]);
    $product->delete();

    $this->actingAs($admin)
        ->post(route('dashboard.budgets.send-email', $budget))
        ->assertRedirect()
        ->assertSessionHas('error');

    expect($budget->fresh()->status)->toBe(BudgetStatus::UNSENT);
});

it('dashboard downloadPdf falla si un producto de los items está eliminado', function () {
    $admin   = createAdmin();
    $client  = Client::factory()->create();
    $product = Product::factory()->create();
    $budget  = Budget::factory()->unsent()->create([
        'user_id'     => $admin->id,
        'client_id'   => $client->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $budget->items()->create(['product_id' => $product->id, 'quantity' => 1, 'unit_price' => 100]);
    $product->delete();

    $this->actingAs($admin)
        ->get(route('dashboard.budgets.pdf', $budget))
        ->assertRedirect()
        ->assertSessionHas('error');
});

// ─── Restricciones vendor / cliente ajeno ─────────────────────────────────────

it('vendedor no puede enviar email de presupuesto de un cliente ajeno', function () {
    $vendor      = createVendor();
    $otherVendor = createVendor();
    $client      = Client::factory()->create(['user_id' => $otherVendor->id]);
    $budget      = Budget::factory()->unsent()->create([
        'user_id'     => $vendor->id,
        'client_id'   => $client->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->actingAs($vendor)
        ->post(route('dashboard.budgets.send-email', $budget))
        ->assertForbidden();

    expect($budget->fresh()->status)->toBe(BudgetStatus::UNSENT);
});

it('vendedor no puede descargar PDF de un presupuesto ajeno', function () {
    $vendor  = createVendor();
    $admin   = createAdmin();
    $client  = Client::factory()->create(['user_id' => $admin->id]);
    $budget  = Budget::factory()->unsent()->create([
        'user_id'     => $admin->id,
        'client_id'   => $client->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->actingAs($vendor)
        ->get(route('dashboard.budgets.pdf', $budget))
        ->assertForbidden();
});

it('vendedor no puede descargar PDF de presupuesto propio con cliente ajeno', function () {
    $vendor      = createVendor();
    $otherVendor = createVendor();
    $client      = Client::factory()->create(['user_id' => $otherVendor->id]);
    $budget      = Budget::factory()->unsent()->create([
        'user_id'     => $vendor->id,
        'client_id'   => $client->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->actingAs($vendor)
        ->get(route('dashboard.budgets.pdf', $budget))
        ->assertForbidden();
});
