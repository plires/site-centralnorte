<?php

use App\Enums\BudgetStatus;
use App\Models\PickingBudget;
use App\Mail\PickingBudgetApprovedVendorMail;
use App\Mail\PickingBudgetInReviewVendorMail;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Support\Facades\Mail;

beforeEach(function () {
    $this->seed([RoleSeeder::class, PermissionSeeder::class]);
});

// ─── Approve ──────────────────────────────────────────────────────────────────

it('cliente aprueba picking budget sent → estado approved', function () {
    Mail::fake();
    $vendor = createAdmin();
    $budget = PickingBudget::factory()->sent()->create([
        'vendor_id'   => $vendor->id,
        'valid_until' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->post(route('public.picking.budget.approve', $budget->token))
        ->assertRedirect()
        ->assertSessionHas('success');

    expect($budget->fresh()->status)->toBe(BudgetStatus::APPROVED);
});

it('cliente aprueba picking budget in_review → estado approved', function () {
    Mail::fake();
    $vendor = createAdmin();
    $budget = PickingBudget::factory()->create([
        'vendor_id'   => $vendor->id,
        'status'      => BudgetStatus::IN_REVIEW,
        'valid_until' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->post(route('public.picking.budget.approve', $budget->token))
        ->assertRedirect()
        ->assertSessionHas('success');

    expect($budget->fresh()->status)->toBe(BudgetStatus::APPROVED);
});

it('aprobar picking budget envía email al vendedor', function () {
    Mail::fake();

    $vendor = createAdmin();
    $budget = PickingBudget::factory()->sent()->create([
        'vendor_id'   => $vendor->id,
        'valid_until' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->post(route('public.picking.budget.approve', $budget->token));

    Mail::assertSent(PickingBudgetApprovedVendorMail::class, function ($mail) use ($vendor) {
        return $mail->hasTo($vendor->email);
    });
});

it('cliente NO puede aprobar picking budget en estado approved (final)', function () {
    $vendor = createAdmin();
    $budget = PickingBudget::factory()->approved()->create([
        'vendor_id'   => $vendor->id,
        'valid_until' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->post(route('public.picking.budget.approve', $budget->token))
        ->assertRedirect()
        ->assertSessionHas('error');

    expect($budget->fresh()->status)->toBe(BudgetStatus::APPROVED);
});

it('cliente NO puede aprobar picking budget en estado rejected', function () {
    $vendor = createAdmin();
    $budget = PickingBudget::factory()->rejected()->create([
        'vendor_id'   => $vendor->id,
        'valid_until' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->post(route('public.picking.budget.approve', $budget->token))
        ->assertRedirect()
        ->assertSessionHas('error');

    expect($budget->fresh()->status)->toBe(BudgetStatus::REJECTED);
});

it('cliente NO puede aprobar picking budget vencido por fecha', function () {
    Mail::fake();
    $vendor = createAdmin();
    $budget = PickingBudget::factory()->sent()->create([
        'vendor_id'   => $vendor->id,
        'valid_until' => now()->subDays(1)->format('Y-m-d'),
    ]);

    $this->post(route('public.picking.budget.approve', $budget->token))
        ->assertRedirect()
        ->assertSessionHas('error');

    expect($budget->fresh()->status)->toBe(BudgetStatus::SENT);
});

// ─── In Review ────────────────────────────────────────────────────────────────

it('cliente pone en evaluación picking budget sent → estado in_review', function () {
    Mail::fake();
    $vendor = createAdmin();
    $budget = PickingBudget::factory()->sent()->create([
        'vendor_id'   => $vendor->id,
        'valid_until' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->post(route('public.picking.budget.in_review', $budget->token))
        ->assertRedirect()
        ->assertSessionHas('success');

    expect($budget->fresh()->status)->toBe(BudgetStatus::IN_REVIEW);
});

it('en evaluación picking budget envía email al vendedor', function () {
    Mail::fake();

    $vendor = createAdmin();
    $budget = PickingBudget::factory()->sent()->create([
        'vendor_id'   => $vendor->id,
        'valid_until' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->post(route('public.picking.budget.in_review', $budget->token));

    Mail::assertSent(PickingBudgetInReviewVendorMail::class, function ($mail) use ($vendor) {
        return $mail->hasTo($vendor->email);
    });
});

it('cliente NO puede poner en evaluación picking budget ya en in_review (solo desde sent)', function () {
    $vendor = createAdmin();
    $budget = PickingBudget::factory()->create([
        'vendor_id'   => $vendor->id,
        'status'      => BudgetStatus::IN_REVIEW,
        'valid_until' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->post(route('public.picking.budget.in_review', $budget->token))
        ->assertRedirect()
        ->assertSessionHas('error');

    expect($budget->fresh()->status)->toBe(BudgetStatus::IN_REVIEW);
});

it('cliente NO puede poner en evaluación picking budget approved (estado final)', function () {
    $vendor = createAdmin();
    $budget = PickingBudget::factory()->approved()->create([
        'vendor_id'   => $vendor->id,
        'valid_until' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->post(route('public.picking.budget.in_review', $budget->token))
        ->assertRedirect()
        ->assertSessionHas('error');

    expect($budget->fresh()->status)->toBe(BudgetStatus::APPROVED);
});

it('cliente NO puede poner en evaluación picking budget vencido por fecha', function () {
    Mail::fake();
    $vendor = createAdmin();
    $budget = PickingBudget::factory()->sent()->create([
        'vendor_id'   => $vendor->id,
        'valid_until' => now()->subDays(1)->format('Y-m-d'),
    ]);

    $this->post(route('public.picking.budget.in_review', $budget->token))
        ->assertRedirect()
        ->assertSessionHas('error');

    expect($budget->fresh()->status)->toBe(BudgetStatus::SENT);
});
