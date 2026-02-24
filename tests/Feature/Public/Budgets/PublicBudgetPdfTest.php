<?php

use App\Enums\BudgetStatus;
use App\Models\Budget;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed([RoleSeeder::class, PermissionSeeder::class]);
});

// ─── Descarga de PDF ──────────────────────────────────────────────────────────

it('PDF de presupuesto sent puede descargarse', function () {
    $vendor = createAdmin();
    $budget = Budget::factory()->sent()->create([
        'user_id'     => $vendor->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->get(route('public.budget.pdf', $budget->token))
        ->assertOk()
        ->assertHeader('Content-Type', 'application/pdf');
});

it('PDF de presupuesto in_review puede descargarse', function () {
    $vendor = createAdmin();
    $budget = Budget::factory()->create([
        'user_id'     => $vendor->id,
        'status'      => BudgetStatus::IN_REVIEW,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->get(route('public.budget.pdf', $budget->token))
        ->assertOk()
        ->assertHeader('Content-Type', 'application/pdf');
});

it('PDF de presupuesto approved puede descargarse', function () {
    $vendor = createAdmin();
    $budget = Budget::factory()->approved()->create([
        'user_id'     => $vendor->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->get(route('public.budget.pdf', $budget->token))
        ->assertOk()
        ->assertHeader('Content-Type', 'application/pdf');
});

it('PDF de presupuesto unsent devuelve 404', function () {
    $vendor = createAdmin();
    $budget = Budget::factory()->unsent()->create([
        'user_id'     => $vendor->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->get(route('public.budget.pdf', $budget->token))
        ->assertNotFound();
});

it('PDF de presupuesto vencido por fecha devuelve 404', function () {
    $vendor = createAdmin();
    $budget = Budget::factory()->sent()->create([
        'user_id'     => $vendor->id,
        'expiry_date' => now()->subDays(1)->format('Y-m-d'),
    ]);

    $this->get(route('public.budget.pdf', $budget->token))
        ->assertNotFound();
});

it('PDF con token inexistente devuelve 404', function () {
    $this->get(route('public.budget.pdf', 'token-inexistente-99999'))
        ->assertNotFound();
});

it('PDF incluye Content-Disposition con el nombre correcto del archivo', function () {
    $vendor = createAdmin();
    $budget = Budget::factory()->sent()->create([
        'user_id'     => $vendor->id,
        'title'       => 'Mi Presupuesto Test',
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $response = $this->get(route('public.budget.pdf', $budget->token))
        ->assertOk();

    // Verifica que el header Content-Disposition contiene el número de presupuesto y el título
    $contentDisposition = $response->headers->get('Content-Disposition');
    expect($contentDisposition)->toContain($budget->budget_merch_number);
    expect($contentDisposition)->toContain('mi-presupuesto-test');
});
