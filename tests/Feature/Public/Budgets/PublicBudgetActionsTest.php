<?php

use App\Enums\BudgetStatus;
use App\Models\Budget;
use App\Mail\BudgetApprovedVendorMail;
use App\Mail\BudgetInReviewVendorMail;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Support\Facades\Mail;

beforeEach(function () {
    $this->seed([RoleSeeder::class, PermissionSeeder::class]);
});

// ─── Approve ──────────────────────────────────────────────────────────────────

it('cliente aprueba presupuesto sent → estado approved', function () {
    Mail::fake();
    $vendor = createAdmin();
    $budget = Budget::factory()->sent()->create([
        'user_id'     => $vendor->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->post(route('public.budget.approve', $budget->token))
        ->assertRedirect()
        ->assertSessionHas('success');

    expect($budget->fresh()->status)->toBe(BudgetStatus::APPROVED);
});

it('cliente aprueba presupuesto in_review → estado approved', function () {
    Mail::fake();
    $vendor = createAdmin();
    $budget = Budget::factory()->create([
        'user_id'     => $vendor->id,
        'status'      => BudgetStatus::IN_REVIEW,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->post(route('public.budget.approve', $budget->token))
        ->assertRedirect()
        ->assertSessionHas('success');

    expect($budget->fresh()->status)->toBe(BudgetStatus::APPROVED);
});

it('aprobar envía email al vendedor', function () {
    Mail::fake();

    $vendor = createAdmin();
    $budget = Budget::factory()->sent()->create([
        'user_id'     => $vendor->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->post(route('public.budget.approve', $budget->token));

    Mail::assertSent(BudgetApprovedVendorMail::class, function ($mail) use ($vendor) {
        return $mail->hasTo($vendor->email);
    });
});

it('cliente NO puede aprobar un presupuesto en estado approved (final)', function () {
    $vendor = createAdmin();
    $budget = Budget::factory()->approved()->create([
        'user_id'     => $vendor->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->post(route('public.budget.approve', $budget->token))
        ->assertRedirect()
        ->assertSessionHas('error');

    expect($budget->fresh()->status)->toBe(BudgetStatus::APPROVED);
});

it('cliente NO puede aprobar un presupuesto en estado rejected', function () {
    $vendor = createAdmin();
    $budget = Budget::factory()->rejected()->create([
        'user_id'     => $vendor->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->post(route('public.budget.approve', $budget->token))
        ->assertRedirect()
        ->assertSessionHas('error');

    expect($budget->fresh()->status)->toBe(BudgetStatus::REJECTED);
});

it('cliente NO puede aprobar un presupuesto vencido por fecha', function () {
    Mail::fake();
    $vendor = createAdmin();
    $budget = Budget::factory()->sent()->create([
        'user_id'     => $vendor->id,
        'expiry_date' => now()->subDays(1)->format('Y-m-d'),
    ]);

    $this->post(route('public.budget.approve', $budget->token))
        ->assertRedirect()
        ->assertSessionHas('error');

    expect($budget->fresh()->status)->toBe(BudgetStatus::SENT);
});

// ─── In Review ────────────────────────────────────────────────────────────────

it('cliente pone en evaluación presupuesto sent → estado in_review', function () {
    Mail::fake();
    $vendor = createAdmin();
    $budget = Budget::factory()->sent()->create([
        'user_id'     => $vendor->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->post(route('public.budget.in_review', $budget->token))
        ->assertRedirect()
        ->assertSessionHas('success');

    expect($budget->fresh()->status)->toBe(BudgetStatus::IN_REVIEW);
});

it('en evaluación envía email al vendedor', function () {
    Mail::fake();

    $vendor = createAdmin();
    $budget = Budget::factory()->sent()->create([
        'user_id'     => $vendor->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->post(route('public.budget.in_review', $budget->token));

    Mail::assertSent(BudgetInReviewVendorMail::class, function ($mail) use ($vendor) {
        return $mail->hasTo($vendor->email);
    });
});

it('cliente NO puede poner en evaluación un presupuesto ya en in_review (solo desde sent)', function () {
    $vendor = createAdmin();
    $budget = Budget::factory()->create([
        'user_id'     => $vendor->id,
        'status'      => BudgetStatus::IN_REVIEW,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->post(route('public.budget.in_review', $budget->token))
        ->assertRedirect()
        ->assertSessionHas('error');

    expect($budget->fresh()->status)->toBe(BudgetStatus::IN_REVIEW);
});

it('cliente NO puede poner en evaluación un presupuesto approved (estado final)', function () {
    $vendor = createAdmin();
    $budget = Budget::factory()->approved()->create([
        'user_id'     => $vendor->id,
        'expiry_date' => now()->addDays(15)->format('Y-m-d'),
    ]);

    $this->post(route('public.budget.in_review', $budget->token))
        ->assertRedirect()
        ->assertSessionHas('error');

    expect($budget->fresh()->status)->toBe(BudgetStatus::APPROVED);
});

it('cliente NO puede poner en evaluación un presupuesto vencido por fecha', function () {
    Mail::fake();
    $vendor = createAdmin();
    $budget = Budget::factory()->sent()->create([
        'user_id'     => $vendor->id,
        'expiry_date' => now()->subDays(1)->format('Y-m-d'),
    ]);

    $this->post(route('public.budget.in_review', $budget->token))
        ->assertRedirect()
        ->assertSessionHas('error');

    expect($budget->fresh()->status)->toBe(BudgetStatus::SENT);
});
