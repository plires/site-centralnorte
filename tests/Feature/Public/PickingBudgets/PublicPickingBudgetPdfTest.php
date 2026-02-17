<?php

use App\Enums\BudgetStatus;
use App\Models\PickingBudget;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed([RoleSeeder::class, PermissionSeeder::class]);
});

// ─── Descarga de PDF ──────────────────────────────────────────────────────────

it('PDF de picking budget sent puede descargarse', function () {
    $vendor = createAdmin();
    $budget = PickingBudget::factory()->sent()->create([
        'vendor_id'   => $vendor->id,
        'valid_until' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->get(route('public.picking.budget.pdf', $budget->token))
        ->assertOk()
        ->assertHeader('Content-Type', 'application/pdf');
});

it('PDF de picking budget in_review puede descargarse', function () {
    $vendor = createAdmin();
    $budget = PickingBudget::factory()->create([
        'vendor_id'   => $vendor->id,
        'status'      => BudgetStatus::IN_REVIEW,
        'valid_until' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->get(route('public.picking.budget.pdf', $budget->token))
        ->assertOk()
        ->assertHeader('Content-Type', 'application/pdf');
});

it('PDF de picking budget approved puede descargarse', function () {
    $vendor = createAdmin();
    $budget = PickingBudget::factory()->approved()->create([
        'vendor_id'   => $vendor->id,
        'valid_until' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->get(route('public.picking.budget.pdf', $budget->token))
        ->assertOk()
        ->assertHeader('Content-Type', 'application/pdf');
});

it('PDF de picking budget unsent devuelve 404', function () {
    $vendor = createAdmin();
    $budget = PickingBudget::factory()->unsent()->create([
        'vendor_id'   => $vendor->id,
        'valid_until' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->get(route('public.picking.budget.pdf', $budget->token))
        ->assertNotFound();
});

it('PDF de picking budget vencido por fecha devuelve 404', function () {
    $vendor = createAdmin();
    $budget = PickingBudget::factory()->sent()->create([
        'vendor_id'   => $vendor->id,
        'valid_until' => now()->subDays(1)->format('Y-m-d'),
    ]);

    $this->get(route('public.picking.budget.pdf', $budget->token))
        ->assertNotFound();
});

it('PDF de picking budget con token inexistente devuelve 404', function () {
    $this->get(route('public.picking.budget.pdf', 'token-picking-pdf-inexistente'))
        ->assertNotFound();
});

it('PDF de picking incluye Content-Disposition con el número de presupuesto', function () {
    $vendor = createAdmin();
    $budget = PickingBudget::factory()->sent()->create([
        'vendor_id'   => $vendor->id,
        'valid_until' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $response = $this->get(route('public.picking.budget.pdf', $budget->token))
        ->assertOk();

    $contentDisposition = $response->headers->get('Content-Disposition');
    expect($contentDisposition)->toContain($budget->budget_number);
});
